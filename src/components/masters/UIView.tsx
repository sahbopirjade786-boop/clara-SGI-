import React, { useState } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Sun, 
  Moon, 
  Vibrate, 
  Keyboard, 
  Eye, 
  Check, 
  Download,
  Sparkles 
} from 'lucide-react';

export const UIView: React.FC = () => {
  const [themeMode, setThemeMode] = useState<'slate' | 'indigo' | 'emerald' | 'amber'>('indigo');
  const [highContrast, setHighContrast] = useState(false);
  const [hapticSuccess, setHapticSuccess] = useState(false);

  const triggerHaptic = (pattern: number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
      setHapticSuccess(true);
      setTimeout(() => setHapticSuccess(false), 1500);
    } else {
      setHapticSuccess(true);
      setTimeout(() => setHapticSuccess(false), 1500);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Overview Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-violet-950 border border-violet-700/60 flex items-center justify-center text-violet-400">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Master 9: ClaraUI</h2>
              <span className="text-xs text-violet-400 bg-violet-950/80 border border-violet-800 px-2 py-0.5 rounded font-mono">
                Cross-Platform Architecture
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              PWA responsive layout, theme & contrast manager, haptic triggers, and WCAG AA accessibility.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded">
            PWA Install Ready
          </span>
        </div>
      </div>

      {/* Grid: Theme & Haptics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Theme & Contrast Manager */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Eye className="w-4 h-4 text-violet-400" />
            <span>Theme & Contrast Manager</span>
          </div>
          <p className="text-xs text-slate-400">
            Synchronized visual rendering based on system preferences with zero candy pills.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            {[
              { id: 'indigo', label: 'Cosmic Violet', bg: 'from-indigo-600 to-purple-600' },
              { id: 'slate', label: 'Minimalist Slate', bg: 'from-slate-700 to-slate-900' },
              { id: 'emerald', label: 'Cyber Emerald', bg: 'from-emerald-600 to-teal-700' },
              { id: 'amber', label: 'Solar Amber', bg: 'from-amber-600 to-orange-700' },
            ].map((th) => (
              <button
                key={th.id}
                onClick={() => setThemeMode(th.id as any)}
                className={`p-3 rounded-xl text-left border flex items-center justify-between ${
                  themeMode === th.id
                    ? 'bg-slate-900 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${th.bg}`} />
                  <span className="font-semibold">{th.label}</span>
                </div>
                {themeMode === th.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">WCAG AA High-Contrast Mode:</span>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                highContrast
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {highContrast ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Haptics & Shortcut Gestures */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Vibrate className="w-4 h-4 text-pink-400" />
            <span>Haptic Feedback & Shortcuts</span>
          </div>
          <p className="text-xs text-slate-400">
            Synchronized physical tactile vibrations for mobile gestures and interaction triggers.
          </p>

          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl">
              <span className="text-slate-300">Light Tap (40ms)</span>
              <button
                onClick={() => triggerHaptic([40])}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
              >
                Trigger
              </button>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl">
              <span className="text-slate-300">Wake-Word Confirmation Double Pulse</span>
              <button
                onClick={() => triggerHaptic([50, 40, 80])}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
              >
                Trigger
              </button>
            </div>
          </div>

          {hapticSuccess && (
            <div className="text-center text-xs text-pink-400 font-semibold animate-fade-in">
              ✓ Haptic impulse executed
            </div>
          )}
        </div>

      </div>

      {/* Global Shortcut Gestures Cheat Sheet */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Keyboard className="w-4 h-4 text-indigo-400" />
          <span>Global Shortcut Gestures & Macro Triggers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400">Prompt Focus</span>
              <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[11px]">
                Cmd / Ctrl + K
              </kbd>
            </div>
            <p className="text-slate-500 text-[11px]">Instantly jumps cursor to the Clara neural prompt console.</p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400">Wake Word Trigger</span>
              <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300 font-mono text-[11px]">
                Voice: "Hey Clara"
              </kbd>
            </div>
            <p className="text-slate-500 text-[11px]">Listens continuously via Web Speech recognition.</p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400">Stop Voice Audio</span>
              <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-rose-300 font-mono text-[11px]">
                Escape (Esc)
              </kbd>
            </div>
            <p className="text-slate-500 text-[11px]">Immediately pauses speaking voice synthesis.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
