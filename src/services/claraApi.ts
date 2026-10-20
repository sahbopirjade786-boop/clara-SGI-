import { ChatMessage, LanguageCode, PersonaType, TrainingRule, TrainingStats } from '../types/clara';

export interface MiddlewareContext<T = any> {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timeoutMs?: number;
  maxRetries?: number;
  initialDelayMs?: number;
  metadata?: Record<string, any>;
  responseTransform?: (data: any) => T;
}

export class NeuralExecutionError extends Error {
  public status?: number;
  public details?: any;
  public isNetworkDrop?: boolean;
  public timestamp: string;

  constructor(message: string, status?: number, details?: any, isNetworkDrop = false) {
    super(message);
    this.name = 'NeuralExecutionError';
    this.status = status;
    this.details = details;
    this.isNetworkDrop = isNetworkDrop;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Strict Async Middleware Pipeline
 * Decouples UI events and handles transitions directly to the server-side Gemini API.
 * Guarantees zero fallback to mock strings or static placeholder phrases under any latency or stream resets.
 */
class StrictAsyncMiddlewarePipeline {
  private static async executeWithMiddlewares<T>(ctx: MiddlewareContext<T>): Promise<T> {
    const timeoutMs = ctx.timeoutMs || 45000; // 45 seconds for deep neural reasoning
    const maxRetries = ctx.maxRetries ?? 3;
    const initialDelay = ctx.initialDelayMs ?? 1000;

    let attempt = 0;
    let delay = initialDelay;

    while (attempt <= maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timer = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Clara-Client-Timestamp': new Date().toISOString(),
          'X-Clara-Strict-Mode': 'true',
          ...(ctx.headers || {}),
        };

        const res = await fetch(ctx.endpoint, {
          method: ctx.method,
          headers,
          body: ctx.body ? JSON.stringify(ctx.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.error || `HTTP Error ${res.status}: ${res.statusText}`;

          // Retry only on transient gateway/server connection dropouts (502, 503, 504)
          if ([502, 503, 504].includes(res.status) && attempt <= maxRetries) {
            console.warn(`[ClaraMiddleware] Transient gateway response (${res.status}), retrying ${attempt}/${maxRetries} in ${delay}ms...`);
            await new Promise((r) => setTimeout(r, delay));
            delay *= 1.5;
            continue;
          }

          // Invariant: propagate technical error directly
          throw new NeuralExecutionError(errorMessage, res.status, errorData);
        }

        const data = await res.json();
        return ctx.responseTransform ? ctx.responseTransform(data) : data;
      } catch (err: any) {
        clearTimeout(timer);

        const isAbort = err.name === 'AbortError';
        const isNetworkError = err instanceof TypeError || isAbort;

        if (isNetworkError && attempt <= maxRetries) {
          console.warn(`[ClaraMiddleware] Network drop / latency timeout on ${ctx.endpoint}, retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
          delay *= 1.5;
          continue;
        }

        // Strict invariant check: throw typed error with full diagnostics
        if (err instanceof NeuralExecutionError) {
          throw err;
        }

        throw new NeuralExecutionError(
          isAbort
            ? `Cloud neural request timed out after ${timeoutMs}ms. The server may be processing heavy reasoning tokens.`
            : err.message || 'Stream connection interrupted during cloud inference.',
          0,
          { originalError: err.toString(), endpoint: ctx.endpoint },
          isNetworkError
        );
      }
    }

    throw new NeuralExecutionError('Exceeded maximum retry attempts without receiving valid neural payload.');
  }

  static async dispatch<T>(ctx: MiddlewareContext<T>): Promise<T> {
    return this.executeWithMiddlewares<T>(ctx);
  }
}

export const claraApi = {
  // Master 1: ClaraBrain (Deep Cognitive Reasoning with Step 1 Think, Step 2 Reason, Step 3 Output + Multimodal Vision)
  async reason(params: {
    prompt?: string;
    persona: PersonaType;
    language: LanguageCode;
    history?: Array<{ role: string; content: string }>;
    contextData?: any;
    clientTime?: string;
    clientTimezone?: string;
    trainingRulesOverride?: any[];
    image?: { base64: string; mimeType: string; fileName?: string };
    predictMode?: boolean;
    empathyMode?: boolean;
    optimizeMode?: boolean;
    liveMode?: boolean;
  }) {
    if ((!params.prompt || !params.prompt.trim()) && !params.image) {
      throw new NeuralExecutionError('Cannot execute neural reasoning without prompt or image input.');
    }

    const clientTime = params.clientTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const clientTimezone = params.clientTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      rawText: string;
      thinking: string;
      reasoning: string;
      output: string;
      model: string;
      timestamp: string;
      quotaNotice?: string;
    }>({
      endpoint: '/api/clara/reason',
      method: 'POST',
      body: {
        ...params,
        prompt: params.prompt || (params.image ? 'Analyze this image in complete detail.' : ''),
        clientTime,
        clientTimezone,
      },
      timeoutMs: 50000, // 50s for complex reasoning
      maxRetries: 2,
    });
  },

  // Master 2: ClaraVoice (Gemini TTS Speech Synthesis)
  async generateSpeech(text: string, voiceName: string = 'Kore', style?: string) {
    if (!text || !text.trim()) {
      throw new NeuralExecutionError('Speech synthesis requires text input.');
    }

    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      audioData: string;
      voiceName: string;
    }>({
      endpoint: '/api/clara/tts',
      method: 'POST',
      body: { text, voiceName, style },
      timeoutMs: 30000,
      maxRetries: 2,
    });
  },

  // Master 3: ClaraConnect (Workspace APIs: Gmail, WhatsApp, Calendar)
  async runConnect(
    service: 'draft_email' | 'whatsapp_message' | 'calendar_event',
    payload: any
  ) {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      status: string;
      email?: string;
      subject?: string;
      recipient?: string;
      gmailUrl?: string;
      mailtoUrl?: string;
      message?: string;
      recipientPhone?: string;
      whatsappUrl?: string;
      event?: any;
      googleCalendarUrl?: string;
      icsData?: string;
    }>({
      endpoint: '/api/clara/connect',
      method: 'POST',
      body: { service, payload },
      timeoutMs: 35000,
      maxRetries: 2,
    });
  },

  // Master 4: ClaraDaily (Briefing, Traffic, Attendance, Alarms)
  async runDaily(action: 'briefing' | 'traffic', data?: any) {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      briefing?: string;
      trafficReport?: string;
      message?: string;
    }>({
      endpoint: '/api/clara/daily',
      method: 'POST',
      body: { action, data },
      timeoutMs: 40000,
      maxRetries: 2,
    });
  },

  // Master 5: ClaraFiles (Document Parser, Reports, Vault)
  async runFiles(
    action: 'summarize' | 'generate_report',
    params: { textContent?: string; docTitle?: string; query?: string }
  ) {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      summary?: string;
      report?: string;
    }>({
      endpoint: '/api/clara/files',
      method: 'POST',
      body: { action, ...params },
      timeoutMs: 50000,
      maxRetries: 2,
    });
  },

  // Master 6: ClaraStudio (Multimodal Creation: Image, Video Storyboard, Music, Logos)
  async generateMedia(
    type: 'image' | 'video_storyboard' | 'music_beat' | 'lyric_rap' | 'logo',
    prompt: string,
    options?: any
  ) {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      type: string;
      imageUrl?: string;
      caption?: string;
      svgCode?: string;
      content?: string;
      prompt?: string;
      error?: string;
    }>({
      endpoint: '/api/clara/media',
      method: 'POST',
      body: { type, prompt, options },
      timeoutMs: 55000, // Media generation takes longer
      maxRetries: 2,
    });
  },

  // Master 7: ClaraCoder (Code Generation, AST Debugger, SQL, Regex)
  async runCoder(
    action: 'generate' | 'debug' | 'sql' | 'regex',
    instruction: string,
    language?: string,
    code?: string
  ) {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      result: string;
    }>({
      endpoint: '/api/clara/coder',
      method: 'POST',
      body: { action, instruction, language, code },
      timeoutMs: 45000,
      maxRetries: 2,
    });
  },

  // Master 8: ClaraSearch (Google Search Grounding & Deep Science)
  async search(query: string) {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      text: string;
      grounding: {
        chunks: any[];
        supports: any[];
        queries: string[];
      };
    }>({
      endpoint: '/api/clara/search',
      method: 'POST',
      body: { query },
      timeoutMs: 40000,
      maxRetries: 2,
    });
  },

  // Master 9b / Core: Infinite Cloud Training Studio
  async getTrainingRules() {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      rules: TrainingRule[];
      stats: TrainingStats;
    }>({
      endpoint: '/api/clara/training',
      method: 'GET',
      timeoutMs: 15000,
      maxRetries: 2,
    });
  },

  async addTrainingRule(rule: {
    userPrompt: string;
    expectedBehavior: string;
    category?: 'direct_accuracy' | 'persona' | 'workflow' | 'scientific' | 'custom';
    strictnessWeight?: number;
    tags?: string[];
  }) {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      rule: TrainingRule;
      rulesCount: number;
      message: string;
    }>({
      endpoint: '/api/clara/training',
      method: 'POST',
      body: rule,
      timeoutMs: 20000,
      maxRetries: 2,
    });
  },

  async updateTrainingRule(id: string, updates: Partial<TrainingRule>) {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      rule: TrainingRule;
      message: string;
    }>({
      endpoint: `/api/clara/training/${id}`,
      method: 'PUT',
      body: updates,
      timeoutMs: 20000,
      maxRetries: 2,
    });
  },

  async deleteTrainingRule(id: string) {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      message: string;
      remainingCount: number;
    }>({
      endpoint: `/api/clara/training/${id}`,
      method: 'DELETE',
      timeoutMs: 15000,
      maxRetries: 2,
    });
  },

  async resetTrainingRules() {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      rules: TrainingRule[];
      message: string;
    }>({
      endpoint: '/api/clara/training/reset',
      method: 'POST',
      timeoutMs: 15000,
      maxRetries: 2,
    });
  },

  async testTrainingRule(params: {
    prompt: string;
    persona?: PersonaType;
    language?: LanguageCode;
    clientTime?: string;
    clientTimezone?: string;
  }) {
    const clientTime = params.clientTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const clientTimezone = params.clientTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      matchedRule: TrainingRule | null;
      adherenceScore: number;
      thinking: string;
      reasoning: string;
      output: string;
      model: string;
      timestamp: string;
    }>({
      endpoint: '/api/clara/training/test',
      method: 'POST',
      body: {
        ...params,
        clientTime,
        clientTimezone,
      },
      timeoutMs: 30000,
      maxRetries: 2,
    });
  },

  // Master 10: ClaraGuard Health
  async checkHealth() {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      status: string;
      timestamp: string;
      aiInitialized: boolean;
      activeModel: string;
      modules: string[];
    }>({
      endpoint: '/api/clara/health',
      method: 'GET',
      timeoutMs: 10000,
      maxRetries: 1,
    });
  },

  // Multimodal Vision & Photo Analysis
  async analyzeImage(
    image: { base64: string; mimeType: string; fileName?: string },
    prompt?: string,
    mode?: string
  ) {
    if (!image || !image.base64) {
      throw new NeuralExecutionError('Image data is required for Multimodal Vision.');
    }

    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      analysis: string;
      model: string;
      timestamp: string;
    }>({
      endpoint: '/api/clara/vision',
      method: 'POST',
      body: { image, prompt, mode },
      timeoutMs: 60000,
      maxRetries: 2,
    });
  },

  // ClaraPredict: Predictive Analytics & Trend Forecasting
  async runPredict(params?: { contextData?: any; focusArea?: string }) {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      prediction: string;
      model: string;
    }>({
      endpoint: '/api/clara/predict',
      method: 'POST',
      body: params || {},
      timeoutMs: 40000,
      maxRetries: 2,
    });
  },

  // ClaraEmpathy: Emotional Intelligence & Motivation
  async runEmpathy(params: { userText: string; userMood?: string }) {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      empathyReport: string;
      model: string;
    }>({
      endpoint: '/api/clara/empathy',
      method: 'POST',
      body: params,
      timeoutMs: 40000,
      maxRetries: 2,
    });
  },

  // ClaraOptimize: Efficiency Engine
  async runOptimize(params: { text: string; target?: string }) {
    return StrictAsyncMiddlewarePipeline.dispatch<{
      success: boolean;
      optimizedText: string;
      model: string;
      densityScore: number;
    }>({
      endpoint: '/api/clara/optimize',
      method: 'POST',
      body: params,
      timeoutMs: 30000,
      maxRetries: 2,
    });
  },
};
