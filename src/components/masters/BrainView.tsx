import React, { useState } from 'react';
import { 
  Brain, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  Calculator, 
  Layers, 
  Languages, 
  Sliders 
} from 'lucide-react';
import { claraApi } from '../../services/claraApi';
import { PersonaType, LanguageCode } from '../../types/clara';

interface BrainViewProps {
  persona: PersonaType;
  setPersona: (p: PersonaType) => void;
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
  onSendToChat: (prompt: string) => void;
}

export const BrainView: React.FC<BrainViewProps> = ({
  persona,
  setPersona,
  language,
  setLanguage,
  onSendToChat,
}) => {
  const [testPrompt, setTestPrompt] = useState('Solve this step-by-step: If a spacecraft accelerates at 2g for 48 hours, what is its relativistic velocity and distance traveled?');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  const runNeuralEvaluation = async () => {
    if (!testPrompt.trim()) return;
    setIsEvaluating(true);
    setEvaluationResult(null);

    try {
      const res = await claraApi.reason({
        prompt: testPrompt,
        persona,
        language,
      });
      setEvaluationResult(res);
    } catch (err: any) {
      setEvaluationResult({
        error: err.message || 'Cognitive evaluation failed',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Master Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Master 1: ClaraBrain</h2>
              <span className="text-xs text-indigo-400 bg-indigo-950/80 border border-indigo-800 px-2 py-0.5 rounded font-mono">
                Functions 1–15
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cloud neural reasoning, 3-step cognitive planning, zero-hallucination verification & persona modulation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Active Engine:</span>
          <span className="font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-1 rounded">
            gemini-3.8-flash
          </span>
        </div>
      </div>

      {/* Grid: Persona Modulation & Multi-Lingual Code-Switching */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Dynamic Persona Modulation */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Dynamic Cloud Persona Modulation</span>
          </div>
          <p className="text-xs text-slate-400">
            Server-side tone adaptation shifts dynamically between high-level executive and deep scientific logic.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            {[
              { id: 'mentor', title: 'Professional Mentor', desc: 'Pragmatic, strategic & inspiring' },
              { id: 'companion', title: 'Warm Companion', desc: 'Empathetic, witty & supportive' },
              { id: 'scientist', title: 'Scientific Polymath', desc: 'Astrophysics & empirical rigor' },
              { id: 'executive', title: 'Executive Strategist', desc: 'Action-oriented decision trees' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setPersona(item.id as PersonaType)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  persona === item.id
                    ? 'bg-indigo-950/80 border-indigo-600 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-slate-200">{item.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Lingual Cloud Code-Switching */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Languages className="w-4 h-4 text-purple-400" />
            <span>Multi-Lingual Cloud Code-Switching</span>
          </div>
          <p className="text-xs text-slate-400">
            Native server-side reasoning across English, Hindi, and Marathi with zero translation latency.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            {[
              { id: 'en', title: 'English', desc: 'International enterprise standard' },
              { id: 'hi', title: 'हिंदी (Hindi)', desc: 'Natural Hindi Devanagari syntax' },
              { id: 'mr', title: 'मराठी (Marathi)', desc: 'Fluent Marathi conversation' },
              { id: 'hinglish', title: 'Hinglish', desc: 'Modern urban blended dialect' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setLanguage(item.id as LanguageCode)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  language === item.id
                    ? 'bg-purple-950/80 border-purple-600 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-slate-200">{item.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Live Cognitive Reasoning Test Console */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Live 3-Step Cognitive Evaluator (No Mock Strings)</span>
          </div>
          <span className="text-xs text-slate-400">Step 1 Think · Step 2 Reason · Step 3 Output</span>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400">Test Prompt for ClaraBrain:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="Enter complex reasoning problem or task..."
            />
            <button
              onClick={runNeuralEvaluation}
              disabled={isEvaluating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isEvaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Reasoning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Reasoner</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Evaluation Output */}
        {evaluationResult && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            {evaluationResult.error ? (
              <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs">
                {evaluationResult.error}
              </div>
            ) : (
              <div className="space-y-3">
                {evaluationResult.quotaNotice && (
                  <div className="p-2 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{evaluationResult.quotaNotice}</span>
                  </div>
                )}
                {/* Step 1: Thinking Trace */}
                <div className="bg-slate-950/80 border border-indigo-900/50 rounded-xl p-3 text-xs">
                  <div className="font-semibold text-indigo-400 uppercase tracking-wide text-[10px] mb-1">
                    Step 1: Intent & Cognitive Strategy
                  </div>
                  <p className="text-slate-300 font-mono text-[11px]">
                    {evaluationResult.thinking}
                  </p>
                </div>

                {/* Step 2: Reasoning Trace */}
                <div className="bg-slate-950/80 border border-purple-900/50 rounded-xl p-3 text-xs">
                  <div className="font-semibold text-purple-400 uppercase tracking-wide text-[10px] mb-1">
                    Step 2: Analytical Reasoning & Verification
                  </div>
                  <p className="text-slate-300 font-mono text-[11px]">
                    {evaluationResult.reasoning}
                  </p>
                </div>

                {/* Step 3: Pristine Output */}
                <div className="bg-slate-950/80 border border-emerald-900/50 rounded-xl p-4 text-xs">
                  <div className="font-semibold text-emerald-400 uppercase tracking-wide text-[10px] mb-2 flex items-center justify-between">
                    <span>Step 3: Pristine Verified Output</span>
                    <button
                      onClick={() => onSendToChat(testPrompt)}
                      className="text-indigo-400 hover:text-indigo-300 underline font-normal lowercase"
                    >
                      View in full chat timeline →
                    </button>
                  </div>
                  <div className="text-slate-200 whitespace-pre-wrap leading-relaxed text-sm">
                    {evaluationResult.output}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
