import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Smile, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Sun,
  Flame
} from 'lucide-react';
import { claraApi } from '../../services/claraApi';

interface EmpathyViewProps {
  onSendToChat: (prompt: string) => void;
}

export const EmpathyView: React.FC<EmpathyViewProps> = ({ onSendToChat }) => {
  const [userFeeling, setUserFeeling] = useState('I am balancing intense coding deadlines and feeling slightly drained, but determined to ship on time.');
  const [selectedMood, setSelectedMood] = useState<'tired' | 'stressed' | 'ambitious' | 'uncertain'>('stressed');
  const [isLoading, setIsLoading] = useState(false);
  const [empathyResult, setEmpathyResult] = useState<string | null>(null);

  const moodPresets = [
    { id: 'stressed', label: 'Overwhelmed & Stressed', emoji: '⚡', prompt: 'I feel pressured by tight deadlines and need clear guidance and emotional calm.' },
    { id: 'tired', label: 'Fatigued / Low Energy', emoji: '☕', prompt: 'I have been coding nonstop and need a mental reset, motivation, and healthy boundaries.' },
    { id: 'ambitious', label: 'High Ambition & Drive', emoji: '🚀', prompt: 'I am aiming to build something extraordinary and want high-octane inspiration and focus.' },
    { id: 'uncertain', label: 'Imposter Syndrome / Doubt', emoji: '🌱', prompt: 'I am second-guessing my execution and need reassurance based on my real accomplishments.' },
  ];

  const handleRunEmpathy = async (customText?: string, mood?: string) => {
    const text = customText || userFeeling;
    const moodTarget = mood || selectedMood;
    setIsLoading(true);
    setEmpathyResult(null);

    try {
      const res = await claraApi.runEmpathy({
        userText: text,
        userMood: moodTarget,
      });
      setEmpathyResult(res.empathyReport);
    } catch (err: any) {
      setEmpathyResult(`Empathy Processing Error: ${err.message || 'Processing failed'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-700/60 flex items-center justify-center text-rose-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">ClaraEmpathy (Emotional Intelligence)</h2>
              <span className="text-xs text-rose-300 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded font-mono">
                Tone & Motivation
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Deeply perceives your tone and emotional state, offering heartfelt support, motivation, and logical advice.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Pillar:</span>
          <span className="font-mono text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2.5 py-1 rounded">
            Empathetic Resonance Core
          </span>
        </div>
      </div>

      {/* Mood Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {moodPresets.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setSelectedMood(m.id as any);
              setUserFeeling(m.prompt);
              handleRunEmpathy(m.prompt, m.id);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedMood === m.id
                ? 'bg-rose-950/60 border-rose-600 shadow-md text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-xl mb-1">{m.emoji}</div>
            <div className="font-semibold text-xs text-slate-200">{m.label}</div>
          </button>
        ))}
      </div>

      {/* Input & Empathy Console */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <label className="text-xs font-semibold text-slate-300">Share how you're feeling or what you're dealing with:</label>
        
        <textarea
          rows={3}
          value={userFeeling}
          onChange={(e) => setUserFeeling(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed"
          placeholder="Describe your current mood, stress, or goals..."
        />

        <div className="flex justify-end">
          <button
            onClick={() => handleRunEmpathy()}
            disabled={isLoading || !userFeeling.trim()}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-rose-600/20"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Connecting with Empathy Core...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Connect & Motivate</span>
              </>
            )}
          </button>
        </div>

        {/* Empathy Response Display */}
        {empathyResult && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                ClaraEmpathy Resonance & Motivation
              </span>
              <button
                onClick={() => onSendToChat(userFeeling)}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
              >
                <span>Continue in Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/40 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
              {empathyResult}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
