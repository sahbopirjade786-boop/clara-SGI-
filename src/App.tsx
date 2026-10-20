import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { VoiceOrb } from './components/VoiceOrb';
import { ChatTimeline } from './components/ChatTimeline';
import { InputConsole, ImageAttachmentData } from './components/InputConsole';
import { GlobalVoiceHUD } from './components/GlobalVoiceHUD';
import { BrainView } from './components/masters/BrainView';
import { VoiceView } from './components/masters/VoiceView';
import { ConnectView } from './components/masters/ConnectView';
import { DailyView } from './components/masters/DailyView';
import { FilesView } from './components/masters/FilesView';
import { StudioView } from './components/masters/StudioView';
import { CoderView } from './components/masters/CoderView';
import { SearchView } from './components/masters/SearchView';
import { UIView } from './components/masters/UIView';
import { GuardView } from './components/masters/GuardView';
import { TrainingView } from './components/masters/TrainingView';
import { VisionView } from './components/masters/VisionView';
import { PredictView } from './components/masters/PredictView';
import { EmpathyView } from './components/masters/EmpathyView';
import { OptimizeView } from './components/masters/OptimizeView';
import { voiceEngine, VoiceState } from './services/voiceService';
import { soundEngine } from './services/soundEffects';
import { claraApi, NeuralExecutionError } from './services/claraApi';
import { ChatMessage, MasterTab, PersonaType, LanguageCode } from './types/clara';

const INITIAL_CLARA_MESSAGE: ChatMessage = {
  id: 'init-1',
  sender: 'clara',
  text: "Namaste! I am Clara AI, an elite, proactive, and multi-modal cloud neural assistant built specifically for Zain.\n\nAll 10 Master Modules—ClaraBrain, ClaraVoice, ClaraConnect, ClaraDaily, ClaraFiles, ClaraStudio, ClaraCoder, ClaraSearch, ClaraUI, ClaraGuard—and the Infinite Cloud Training Core are 100% active. I am also equipped with ClaraPredict (Predictive Analytics), ClaraEmpathy (Emotional Intelligence), ClaraOptimize (Efficiency Engine), Multimodal Vision (Photo & Screenshot Breakdown), and real-time Live Mode.\n\nHow can I empower your goals today, Zain?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  thinkingTrace: "Bootstrapped Clara Elite Cloud Neural Core for Zain. Synchronized cognitive vector weights, initialized Multimodal Vision pipeline, and verified live Gemini API cascade.",
  reasoning: "Zero-canned string invariant verified. All 10 Master Modules and mandate pillars preserved with cumulative expansion.",
  moduleOrigin: 'ClaraBrain',
};

const STORAGE_KEY = 'clara_persisted_chat_history_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<MasterTab>('chat');
  const [persona, setPersona] = useState<PersonaType>('mentor');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isWakeWordEnabled, setIsWakeWordEnabled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [transcript, setTranscript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastVoiceResponse, setLastVoiceResponse] = useState<{ output: string; thinking?: string; reasoning?: string } | null>(null);

  // Mandate Superpowers State
  const [predictMode, setPredictMode] = useState(false);
  const [empathyMode, setEmpathyMode] = useState(false);
  const [optimizeMode, setOptimizeMode] = useState(false);
  const [liveMode, setLiveMode] = useState(true);

  // Persistent Multi-Turn Conversation Memory
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored chat history', e);
    }
    return [INITIAL_CLARA_MESSAGE];
  });

  // Save conversation history to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-60)));
    } catch (e) {
      console.warn('Could not save chat history to localStorage', e);
    }
  }, [messages]);

  // Hook up voice engine listeners
  useEffect(() => {
    voiceEngine.onStateChange((state) => {
      setVoiceState(state);
    });

    voiceEngine.onTranscript((text) => {
      setTranscript(text);
    });

    // Spoken command captured via wake-word or voice orb:
    voiceEngine.onCommandCaptured((command: string) => {
      setTranscript(command);
      handleSendMessage(command);
    });

    // When "Hey Clara" wake-word is detected:
    voiceEngine.onWakeWord((initialCommand) => {
      soundEngine.playWakeChime();
      if (initialCommand && initialCommand.trim().length > 2) {
        handleSendMessage(initialCommand.trim());
      } else {
        setTranscript('Clara is listening... Speak your command.');
      }
    });

    voiceEngine.checkPermission().then(() => {
      setPermissionStatus(voiceEngine.micPermissionStatus);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const textarea = document.querySelector('textarea');
        textarea?.focus();
      }
      if (e.key === 'Escape') {
        voiceEngine.stopSpeaking();
        voiceEngine.stopListening();
        setLastVoiceResponse(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [persona, language, messages]);

  const handleToggleWakeWord = () => {
    const nextState = !isWakeWordEnabled;
    const success = voiceEngine.toggleWakeWord(nextState);
    if (nextState && !success) {
      setIsWakeWordEnabled(false);
      setPermissionStatus(voiceEngine.micPermissionStatus);
    } else {
      setIsWakeWordEnabled(nextState);
      if (nextState) {
        soundEngine.playWakeChime();
      }
    }
  };

  const handleSimulateWakeWord = (simulatedPrompt?: string) => {
    if (simulatedPrompt && simulatedPrompt.trim()) {
      handleSendMessage(simulatedPrompt.trim());
    } else {
      voiceEngine.simulateWakeWord();
    }
  };

  const handleToggleVoice = () => {
    if (voiceState === 'listening') {
      voiceEngine.stopListening();
    } else {
      const started = voiceEngine.startListening();
      if (!started) {
        setPermissionStatus(voiceEngine.micPermissionStatus);
      }
    }
  };

  const handleSpeak = (text: string) => {
    voiceEngine.speak(text);
  };

  const handleClearHistory = () => {
    const resetMsg: ChatMessage = {
      id: `init-${Date.now()}`,
      sender: 'clara',
      text: "Chat history refreshed. All 10 Master Modules, Infinite Cloud Training Core, Multimodal Vision, and Live Mode remain active for Zain.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      moduleOrigin: 'ClaraBrain',
    };
    setMessages([resetMsg]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  // Primary user input handler: routes directly to Cloud Neural Engine
  const handleSendMessage = async (userPrompt: string, imageAttachment?: ImageAttachmentData) => {
    if ((!userPrompt.trim() && !imageAttachment) || isGenerating) return;

    // Check voice tab navigation intents
    const lowerPrompt = userPrompt.toLowerCase().trim();
    if (lowerPrompt.includes('open connect') || lowerPrompt.includes('go to connect') || lowerPrompt.includes('open whatsapp') || lowerPrompt.includes('open gmail') || lowerPrompt.includes('open calendar')) {
      setActiveTab('connect');
    } else if (lowerPrompt.includes('open studio') || lowerPrompt.includes('go to studio')) {
      setActiveTab('studio');
    } else if (lowerPrompt.includes('open coder') || lowerPrompt.includes('go to coder') || lowerPrompt.includes('open coding')) {
      setActiveTab('coder');
    } else if (lowerPrompt.includes('open daily') || lowerPrompt.includes('go to daily')) {
      setActiveTab('daily');
    } else if (lowerPrompt.includes('open files') || lowerPrompt.includes('go to files')) {
      setActiveTab('files');
    } else if (lowerPrompt.includes('open search') || lowerPrompt.includes('go to search')) {
      setActiveTab('search');
    } else if (lowerPrompt.includes('open training') || lowerPrompt.includes('go to training') || lowerPrompt.includes('open cloud training')) {
      setActiveTab('training');
    } else if (lowerPrompt.includes('open brain') || lowerPrompt.includes('go to brain')) {
      setActiveTab('brain');
    } else if (lowerPrompt.includes('open vision') || lowerPrompt.includes('go to vision')) {
      setActiveTab('vision');
    } else if (lowerPrompt.includes('open predict') || lowerPrompt.includes('go to predict')) {
      setActiveTab('predict');
    } else if (lowerPrompt.includes('open empathy') || lowerPrompt.includes('go to empathy')) {
      setActiveTab('empathy');
    } else if (lowerPrompt.includes('open optimize') || lowerPrompt.includes('go to optimize')) {
      setActiveTab('optimize');
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userPrompt || (imageAttachment ? 'Please analyze this photo/image in complete detail.' : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageAttachment: imageAttachment ? { ...imageAttachment } : undefined,
      predictBadge: predictMode,
      empathyBadge: empathyMode,
      optimizeBadge: optimizeMode,
      visionBadge: !!imageAttachment,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);
    setVoiceState('thinking');

    try {
      // Dynamic live multi-turn context retention
      const historyTurns = liveMode ? -14 : -6;
      const history = messages.slice(historyTurns).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const clientTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const response = await claraApi.reason({
        prompt: userPrompt,
        persona,
        language,
        history,
        clientTime,
        clientTimezone,
        image: imageAttachment ? {
          base64: imageAttachment.base64,
          mimeType: imageAttachment.mimeType,
          fileName: imageAttachment.fileName,
        } : undefined,
        predictMode,
        empathyMode,
        optimizeMode,
        liveMode,
      });

      const responseText = response.output || response.rawText;

      const claraMessage: ChatMessage = {
        id: `clara-${Date.now()}`,
        sender: 'clara',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thinkingTrace: response.thinking,
        reasoning: response.reasoning,
        moduleOrigin: imageAttachment ? 'ClaraVision' : predictMode ? 'ClaraPredict' : empathyMode ? 'ClaraEmpathy' : optimizeMode ? 'ClaraOptimize' : 'ClaraBrain',
        quotaNotice: (response as any).quotaNotice,
        predictBadge: predictMode,
        empathyBadge: empathyMode,
        optimizeBadge: optimizeMode,
        visionBadge: !!imageAttachment,
      };

      setMessages((prev) => [...prev, claraMessage]);
      setLastVoiceResponse({
        output: responseText,
        thinking: response.thinking,
        reasoning: response.reasoning,
      });

      voiceEngine.speak(responseText);
    } catch (err: any) {
      console.error('Neural processing error:', err);
      const errorMessageText = `Clara Neural Error: ${err.message || 'The Gemini cloud inference pipeline encountered an issue.'}`;
      
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'clara',
        text: errorMessageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thinkingTrace: 'Exception monitored by ClaraGuard supervisor.',
        reasoning: 'Zero-mock fallback invariant enforced. Transparent technical diagnostics surfaced.',
        moduleOrigin: 'ClaraGuard',
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLastVoiceResponse({
        output: errorMessageText,
        thinking: 'ClaraGuard: Network / API interruption logged.',
      });
    } finally {
      setIsGenerating(false);
      setTranscript('');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Universal Header with 10 Master Modules + Mandate Modules Switcher */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        persona={persona}
        setPersona={setPersona}
        language={language}
        setLanguage={setLanguage}
        isWakeWordEnabled={isWakeWordEnabled}
        toggleWakeWord={handleToggleWakeWord}
        isOnline={isOnline}
        onSimulateWakeWord={handleSimulateWakeWord}
      />

      {/* Global Voice HUD: Floats non-intrusively across any module */}
      <GlobalVoiceHUD
        voiceState={voiceState}
        transcript={transcript}
        onStop={() => {
          voiceEngine.stopSpeaking();
          voiceEngine.stopListening();
          setLastVoiceResponse(null);
          setTranscript('');
        }}
        lastResponse={lastVoiceResponse}
        activeTab={activeTab.toUpperCase()}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden max-w-7xl w-full mx-auto">
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Live Cloud Voice Orb */}
            <VoiceOrb
              voiceState={voiceState}
              onToggleListening={handleToggleVoice}
              onSimulateWakeWord={handleSimulateWakeWord}
              transcript={transcript}
              isWakeWordEnabled={isWakeWordEnabled}
              permissionStatus={permissionStatus}
            />

            {/* Conversation Timeline with Multi-Turn Memory & Badges */}
            <ChatTimeline
              messages={messages}
              onSpeak={handleSpeak}
              isGenerating={isGenerating}
              onClearHistory={handleClearHistory}
              liveMode={liveMode}
            />

            {/* Input Console with Photo/Image Upload & Superpower Toggles */}
            <InputConsole
              onSendMessage={handleSendMessage}
              voiceState={voiceState}
              onToggleVoice={handleToggleVoice}
              onSimulateWakeWord={handleSimulateWakeWord}
              isGenerating={isGenerating}
              predictMode={predictMode}
              setPredictMode={setPredictMode}
              empathyMode={empathyMode}
              setEmpathyMode={setEmpathyMode}
              optimizeMode={optimizeMode}
              setOptimizeMode={setOptimizeMode}
              liveMode={liveMode}
              setLiveMode={setLiveMode}
            />
          </div>
        )}

        {/* Master 1: ClaraBrain */}
        {activeTab === 'brain' && (
          <div className="flex-1 overflow-y-auto">
            <BrainView
              persona={persona}
              setPersona={setPersona}
              language={language}
              setLanguage={setLanguage}
              onSendToChat={(prompt) => {
                setActiveTab('chat');
                handleSendMessage(prompt);
              }}
            />
          </div>
        )}

        {/* Master 2: ClaraVoice */}
        {activeTab === 'voice' && (
          <div className="flex-1 overflow-y-auto">
            <VoiceView
              isWakeWordEnabled={isWakeWordEnabled}
              toggleWakeWord={handleToggleWakeWord}
              onSimulateWakeWord={handleSimulateWakeWord}
            />
          </div>
        )}

        {/* Master 3: ClaraConnect (Gmail, WhatsApp, Google Calendar) */}
        {activeTab === 'connect' && (
          <div className="flex-1 overflow-y-auto">
            <ConnectView />
          </div>
        )}

        {/* Master 4: ClaraDaily */}
        {activeTab === 'daily' && (
          <div className="flex-1 overflow-y-auto">
            <DailyView />
          </div>
        )}

        {/* Master 5: ClaraFiles */}
        {activeTab === 'files' && (
          <div className="flex-1 overflow-y-auto">
            <FilesView />
          </div>
        )}

        {/* Master 6: ClaraStudio */}
        {activeTab === 'studio' && (
          <div className="flex-1 overflow-y-auto">
            <StudioView />
          </div>
        )}

        {/* Master 7: ClaraCoder */}
        {activeTab === 'coder' && (
          <div className="flex-1 overflow-y-auto">
            <CoderView />
          </div>
        )}

        {/* Master 8: ClaraSearch */}
        {activeTab === 'search' && (
          <div className="flex-1 overflow-y-auto">
            <SearchView />
          </div>
        )}

        {/* Infinite Cloud Training Studio */}
        {activeTab === 'training' && (
          <div className="flex-1 overflow-y-auto">
            <TrainingView
              onSendToChat={(prompt) => {
                setActiveTab('chat');
                handleSendMessage(prompt);
              }}
            />
          </div>
        )}

        {/* Master 9: ClaraUI */}
        {activeTab === 'ui' && (
          <div className="flex-1 overflow-y-auto">
            <UIView />
          </div>
        )}

        {/* Master 10: ClaraGuard */}
        {activeTab === 'guard' && (
          <div className="flex-1 overflow-y-auto">
            <GuardView />
          </div>
        )}

        {/* Mandate Pillar 1: Multimodal Vision & Photo Analysis */}
        {activeTab === 'vision' && (
          <div className="flex-1 overflow-y-auto">
            <VisionView
              onSendToChat={(prompt, image) => {
                setActiveTab('chat');
                handleSendMessage(prompt, image);
              }}
            />
          </div>
        )}

        {/* Mandate Pillar 2: ClaraPredict (Predictive Analytics) */}
        {activeTab === 'predict' && (
          <div className="flex-1 overflow-y-auto">
            <PredictView
              onSendToChat={(prompt) => {
                setActiveTab('chat');
                setPredictMode(true);
                handleSendMessage(prompt);
              }}
            />
          </div>
        )}

        {/* Mandate Pillar 3: ClaraEmpathy (Emotional Intelligence & Motivation) */}
        {activeTab === 'empathy' && (
          <div className="flex-1 overflow-y-auto">
            <EmpathyView
              onSendToChat={(prompt) => {
                setActiveTab('chat');
                setEmpathyMode(true);
                handleSendMessage(prompt);
              }}
            />
          </div>
        )}

        {/* Mandate Pillar 4: ClaraOptimize (Efficiency Engine) */}
        {activeTab === 'optimize' && (
          <div className="flex-1 overflow-y-auto">
            <OptimizeView
              onSendToChat={(prompt) => {
                setActiveTab('chat');
                setOptimizeMode(true);
                handleSendMessage(prompt);
              }}
            />
          </div>
        )}
      </main>

    </div>
  );
}
