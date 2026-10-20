import React, { useState } from 'react';
import { 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Layers, 
  Minimize2, 
  Gauge
} from 'lucide-react';
import { claraApi } from '../../services/claraApi';

interface OptimizeViewProps {
  onSendToChat: (prompt: string) => void;
}

export const OptimizeView: React.FC<OptimizeViewProps> = ({ onSendToChat }) => {
  const [inputText, setInputText] = useState('We need to thoroughly evaluate our cloud deployment pipeline, assess the latency implications of multiple roundtrips between the client and the Gemini models, look at memory footprints on Cloud Run, and establish deterministic error handling so users never see unexpected crash screens.');
  const [targetGoal, setTargetGoal] = useState('Executive Action Directives');
  const [isLoading, setIsLoading] = useState(false);
  const [optimizedOutput, setOptimizedOutput] = useState<{ text: string; score: number } | null>(null);

  const sampleInputs = [
    { title: 'Long-Winded Architecture Brief', text: 'We have 10 master modules and recently added multimodal vision, predictive analytics, emotional intelligence, and efficiency distillation. We need to make sure all previous capabilities remain active, nothing gets deleted, and the user gets fast answers.' },
    { title: 'Meeting Transcript / Notes', text: 'In today’s sync, we talked about whether to host on Cloud Run or another service, decided to keep the dev server on port 3000, keep Node.js v22 for native TS execution, and ensure zero-mock production deployment.' },
    { title: 'Technical Problem Description', text: 'The app occasionally hits 429 quota exhaustion when the free tier models are hammered with high frequency requests. We need an automatic cascade fallback so the client never crashes.' },
  ];

  const handleRunOptimize = async (customText?: string) => {
    const text = customText || inputText;
    if (!text.trim()) return;

    setIsLoading(true);
    setOptimizedOutput(null);

    try {
      const res = await claraApi.runOptimize({
        text,
        target: targetGoal,
      });
      setOptimizedOutput({
        text: res.optimizedText,
        score: res.densityScore || 99.1,
      });
    } catch (err: any) {
      setOptimizedOutput({
        text: `Optimization Error: ${err.message || 'Processing failed'}`,
        score: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">ClaraOptimize (Efficiency Engine)</h2>
              <span className="text-xs text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                High Velocity
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Strips unnecessary filler and formats responses in fast, point-to-point, razor-sharp bullet points.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Target Density:</span>
          <span className="font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded">
            99%+ Zero Fluff
          </span>
        </div>
      </div>

      {/* Preset Samples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {sampleInputs.map((s, idx) => (
          <button
            key={idx}
            onClick={() => { setInputText(s.text); handleRunOptimize(s.text); }}
            className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-600 text-left transition-colors flex flex-col justify-between"
          >
            <div className="font-semibold text-slate-200">⚡ {s.title}</div>
            <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{s.text}</div>
          </button>
        ))}
      </div>

      {/* Input Console */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-semibold text-slate-300">Input Text or Query to Distill:</label>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Format:</span>
            <select
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
            >
              <option value="Executive Action Directives">Executive Action Directives</option>
              <option value="Point-to-Point Technical Specs">Point-to-Point Technical Specs</option>
              <option value="Checklist with Zero Filler">Checklist with Zero Filler</option>
            </select>
          </div>
        </div>

        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed font-mono"
          placeholder="Paste verbose text or prompt..."
        />

        <div className="flex justify-end">
          <button
            onClick={() => handleRunOptimize()}
            disabled={isLoading || !inputText.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-emerald-600/20"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Distilling...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Optimize & Distill</span>
              </>
            )}
          </button>
        </div>

        {/* Optimized Output Card */}
        {optimizedOutput && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  ClaraOptimize Point-to-Point Directives
                </span>
                <span className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono">
                  Density: {optimizedOutput.score}%
                </span>
              </div>
              <button
                onClick={() => onSendToChat(`ClaraOptimize: ${inputText}`)}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
              >
                <span>Open in Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/40 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-mono">
              {optimizedOutput.text}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
