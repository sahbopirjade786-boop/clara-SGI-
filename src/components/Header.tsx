import React from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  Volume2, 
  Brain,
  Layers,
  Radio
} from 'lucide-react';
import { MasterTab, PersonaType, LanguageCode } from '../types/clara';

interface HeaderProps {
  activeTab: MasterTab;
  setActiveTab: (tab: MasterTab) => void;
  persona: PersonaType;
  setPersona: (p: PersonaType) => void;
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
  isWakeWordEnabled: boolean;
  toggleWakeWord: () => void;
  isOnline: boolean;
  onSimulateWakeWord: (prompt?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  persona,
  setPersona,
  language,
  setLanguage,
  isWakeWordEnabled,
  toggleWakeWord,
  isOnline,
  onSimulateWakeWord,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Branding & Core Intelligence */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <button 
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-white">Clara AI</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-1.5 py-0.5 rounded">
                  Cloud Neural
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">100% Cloud Neural Master OS</p>
            </div>
          </button>

          {/* Quick status dots for mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onSimulateWakeWord()}
              title="Test wake-word trigger"
              className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
            >
              "Hey Clara"
            </button>
          </div>
        </div>

        {/* Center: Persona & Language Selectors */}
        <div className="flex items-center gap-2 flex-wrap justify-center text-xs">
          {/* Persona selector */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1">
            <span className="text-slate-400 px-2 font-medium">Persona:</span>
            {(['mentor', 'companion', 'scientist', 'executive'] as PersonaType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPersona(p)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                  persona === p
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Language selector */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1">
            <span className="text-slate-400 px-2 font-medium">Lang:</span>
            {[
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'हिंदी' },
              { id: 'mr', label: 'मराठी' },
              { id: 'hinglish', label: 'Hinglish' },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id as LanguageCode)}
                className={`px-2 py-1 rounded-md font-medium transition-all ${
                  language === l.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Wake-Word & System Telemetry Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* "Hey Clara" Wake-Word background toggle */}
          <button
            onClick={toggleWakeWord}
            title={isWakeWordEnabled ? 'Wake-word listener active (Say "Hey Clara")' : 'Wake-word listener paused'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isWakeWordEnabled
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 shadow-sm shadow-emerald-900/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isWakeWordEnabled ? (
              <>
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Wake: "Hey Clara" (ON)</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Wake-Word (OFF)</span>
              </>
            )}
          </button>

          {/* Manual Wake-Word Test Trigger */}
          <button
            onClick={() => onSimulateWakeWord()}
            title="Trigger Clara wake word flow without speaking"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 rounded-lg hover:bg-indigo-900/80 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Chime</span>
          </button>

          {/* Connectivity Status */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-900/80 border border-slate-800 rounded-lg text-slate-400"
            title={isOnline ? 'Cloud Neural Engine Connected' : 'Offline resilience mode'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline text-slate-300">Cloud Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline text-amber-300">Offline</span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* 10 Master Modules Tab Bar */}
      <div className="max-w-7xl mx-auto mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: 'chat', label: 'Neural Chat' },
          { id: 'brain', label: '1. Brain' },
          { id: 'voice', label: '2. Voice' },
          { id: 'connect', label: '3. Connect' },
          { id: 'daily', label: '4. Daily' },
          { id: 'files', label: '5. Files' },
          { id: 'studio', label: '6. Studio' },
          { id: 'coder', label: '7. Coder' },
          { id: 'search', label: '8. Search' },
          { id: 'training', label: '☁️ Training' },
          { id: 'ui', label: '9. UI' },
          { id: 'guard', label: '10. Guard' },
          { id: 'vision', label: '📷 Vision' },
          { id: 'predict', label: '🔮 Predict' },
          { id: 'empathy', label: '💜 Empathy' },
          { id: 'optimize', label: '⚡ Optimize' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as MasterTab)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-slate-800 text-indigo-300 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
