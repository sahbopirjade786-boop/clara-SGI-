import React from 'react';
import { Mic, MicOff, Volume2, Sparkles, Loader2, X, Cpu, Check, ExternalLink } from 'lucide-react';
import { VoiceState } from '../services/voiceService';

interface GlobalVoiceHUDProps {
  voiceState: VoiceState;
  transcript: string;
  onStop: () => void;
  lastResponse?: {
    output: string;
    thinking?: string;
    reasoning?: string;
  } | null;
  activeTab: string;
}

export const GlobalVoiceHUD: React.FC<GlobalVoiceHUDProps> = ({
  voiceState,
  transcript,
  onStop,
  lastResponse,
  activeTab,
}) => {
  // Only show the global floating HUD if voice is actively engaged or has a recent response, and not already on the full chat tab
  const isEngaged = voiceState !== 'idle' || !!transcript;
  if (!isEngaged && !lastResponse) return null;

  return (
    <aside 
      aria-label="Clara Voice Assistant"
      className="fixed bottom-4 right-4 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] bg-slate-900/95 border border-indigo-700/60 shadow-2xl shadow-indigo-950/60 rounded-2xl backdrop-blur-xl p-4 transition-all animate-fade-in"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-xs font-bold text-white tracking-wide">Clara Voice Neural Engine</span>
          <span className="text-[10px] text-indigo-400 font-mono bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800">
            Active on {activeTab}
          </span>
        </div>
        <button
          onClick={onStop}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Dismiss voice HUD"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 space-y-2.5">
        {/* State Indicator */}
        <div className="flex items-center gap-2 text-xs">
          {voiceState === 'listening' && (
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span>Listening to speech...</span>
            </div>
          )}
          {voiceState === 'thinking' && (
            <div className="flex items-center gap-1.5 text-pink-400 font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>ClaraBrain is analyzing neural intent...</span>
            </div>
          )}
          {voiceState === 'speaking' && (
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
              <Volume2 className="w-3.5 h-3.5 animate-bounce" />
              <span>Speaking verified response aloud...</span>
            </div>
          )}
        </div>

        {/* Live Spoken Transcript */}
        {transcript && (
          <div className="p-2.5 bg-slate-950/80 border border-indigo-900/40 rounded-xl text-xs text-indigo-200 font-mono">
            "{transcript}"
          </div>
        )}

        {/* Real-time Cognitive Trace Preview */}
        {lastResponse && (
          <div className="space-y-2 pt-1 text-xs">
            {lastResponse.thinking && (
              <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-[11px] text-slate-300">
                <span className="text-indigo-400 font-semibold block text-[10px] uppercase">Step 1 Strategy:</span>
                {lastResponse.thinking}
              </div>
            )}
            <div className="p-2.5 bg-slate-950 border border-emerald-900/60 rounded-xl text-xs text-slate-100 max-h-36 overflow-y-auto leading-relaxed whitespace-pre-wrap">
              {lastResponse.output}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
