import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  Layers,
  Clock
} from 'lucide-react';
import { claraApi } from '../../services/claraApi';

interface PredictViewProps {
  onSendToChat: (prompt: string) => void;
}

export const PredictView: React.FC<PredictViewProps> = ({ onSendToChat }) => {
  const [focusArea, setFocusArea] = useState('Full Enterprise Workflow & Milestone Velocity');
  const [horizon, setHorizon] = useState<'24h' | '7d' | '30d'>('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);

  const predefinedScopes = [
    { title: 'Operational Roadmap & Bottlenecks', desc: 'Predict delivery friction and compute resource bottlenecks' },
    { title: 'User Schedule & Meeting Collisions', desc: 'Forecast calendar conflicts and upcoming commitments' },
    { title: 'Tech Stack & Model Cascades', desc: 'Predict free-tier quota exhaustion and latency trends' },
    { title: 'Personal Habit & Peak Productivity Hours', desc: 'Forecast optimal execution windows for Zain' },
  ];

  const handleRunPredict = async (area?: string) => {
    const targetArea = area || focusArea;
    setIsLoading(true);
    setPrediction(null);

    try {
      const res = await claraApi.runPredict({
        focusArea: `${targetArea} (Horizon: ${horizon})`,
        contextData: {
          clientTimestamp: new Date().toISOString(),
          activeModules: 10,
          user: 'Zain',
          timeHorizon: horizon,
        },
      });
      setPrediction(res.prediction);
    } catch (err: any) {
      setPrediction(`Prediction Error: ${err.message || 'Forecast computation failed'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-700/60 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">ClaraPredict (Predictive Analytics)</h2>
              <span className="text-xs text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded font-mono">
                Proactive Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Anticipates user needs, forecasts future trends, and delivers proactive solutions before you have to ask.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Mode:</span>
          <span className="font-mono text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded">
            Proactive & Forward-Looking
          </span>
        </div>
      </div>

      {/* Scope Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predefinedScopes.map((scope, idx) => (
          <div
            key={idx}
            onClick={() => { setFocusArea(scope.title); handleRunPredict(scope.title); }}
            className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
              focusArea === scope.title
                ? 'bg-amber-950/40 border-amber-600 shadow-md'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="font-semibold text-sm text-slate-200 flex items-center justify-between">
              <span>🔮 {scope.title}</span>
              <ArrowRight className="w-4 h-4 text-amber-400 opacity-60" />
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{scope.desc}</p>
          </div>
        ))}
      </div>

      {/* Custom Scope & Action Console */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-semibold text-slate-300">Custom Predictive Horizon & Goal:</label>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Horizon:</span>
            {(['24h', '7d', '30d'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  horizon === h 
                    ? 'bg-amber-600 text-white font-medium shadow-sm' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            placeholder="Describe what trajectory or workflow to forecast..."
          />
          <button
            onClick={() => handleRunPredict()}
            disabled={isLoading}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0 shadow-md shadow-amber-600/20"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Predicting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Forecast</span>
              </>
            )}
          </button>
        </div>

        {/* Prediction Results Display */}
        {prediction && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                ClaraPredict Proactive Intelligence
              </span>
              <button
                onClick={() => onSendToChat(`ClaraPredict: ${focusArea}`)}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
              >
                <span>Discuss in Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-900/40 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
              {prediction}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
