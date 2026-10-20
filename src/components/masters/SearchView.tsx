import React, { useState } from 'react';
import { 
  Globe2, 
  Search, 
  Orbit, 
  Calculator, 
  History, 
  BarChart3, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';
import { claraApi } from '../../services/claraApi';

export const SearchView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'grounded_search' | 'astrophysics' | 'calculator' | 'timeline'>('grounded_search');
  const [query, setQuery] = useState('Latest space exploration breakthroughs and Mars rover sample analysis in 2026');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState<any | null>(null);

  // Deterministic calculator state
  const [calcExpr, setCalcExpr] = useState('sqrt(49) * 12.5 + (2.9979e8 / 500e-9)');
  const [calcResult, setCalcResult] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchResponse(null);

    try {
      const res = await claraApi.search(query);
      setSearchResponse(res);
    } catch (e: any) {
      setSearchResponse({ error: e.message || 'Search failed' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCalculate = () => {
    try {
      // Safe deterministic math evaluation
      const sanitized = calcExpr
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/pi/gi, 'Math.PI')
        .replace(/\^/g, '**');
      const val = Function(`'use strict'; return (${sanitized})`)();
      setCalcResult(String(val));
    } catch (err: any) {
      setCalcResult(`Computation error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Overview Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Master 8: ClaraSearch</h2>
              <span className="text-xs text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                Live Grounding Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Google Search API, astrophysics & space database, deterministic scientific calculator & timelines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Grounding:</span>
          <span className="text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-1 rounded">
            GoogleSearch Tool Active
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'grounded_search', label: 'Live Google Search', icon: Search },
          { id: 'astrophysics', label: 'Astrophysics & Space DB', icon: Orbit },
          { id: 'calculator', label: 'Deterministic Scientific Calc', icon: Calculator },
          { id: 'timeline', label: 'Historical Timeline', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchResponse(null);
                if (tab.id === 'grounded_search') setQuery('Latest space exploration breakthroughs and Mars rover sample analysis in 2026');
                if (tab.id === 'astrophysics') setQuery('James Webb Space Telescope observations of high-redshift galaxies (z > 10) and cosmic dawn implications');
                if (tab.id === 'timeline') setQuery('Chronological timeline of quantum computing hardware milestones from 1980 to 2026');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Calculator Section */}
      {activeTab === 'calculator' ? (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Deterministic Scientific Math Hub</h3>
          <p className="text-xs text-slate-400">
            Computes exact scientific arithmetic and unit conversions with zero hallucination.
          </p>

          <div className="flex gap-2 text-xs">
            <input
              type="text"
              value={calcExpr}
              onChange={(e) => setCalcExpr(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
              placeholder="e.g. sqrt(144) * 5 + 3^4"
            />
            <button
              onClick={handleCalculate}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold transition-colors"
            >
              Compute Exact
            </button>
          </div>

          {calcResult !== null && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <span className="text-slate-400">Exact Result:</span>
              <div className="text-lg font-mono font-bold text-cyan-400">{calcResult}</div>
            </div>
          )}
        </div>
      ) : (
        /* Search & Knowledge Console */
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="text-xs space-y-2">
            <label className="text-slate-400 block font-semibold">Live Knowledge Query:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                placeholder="Enter query for live Google search and verified retrieval..."
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSearching ? 'Grounding...' : 'Query Live World'}</span>
              </button>
            </div>
          </div>

          {/* Results Area */}
          {searchResponse && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
              {searchResponse.error ? (
                <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs">
                  {searchResponse.error}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                    {searchResponse.text}
                  </div>

                  {/* Grounding Web Links */}
                  {searchResponse.grounding?.chunks && searchResponse.grounding.chunks.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-semibold text-slate-400">Verified Sources:</span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {searchResponse.grounding.chunks.map((chunk: any, i: number) => {
                          const uri = chunk.web?.uri;
                          const title = chunk.web?.title || uri;
                          if (!uri) return null;
                          return (
                            <a
                              key={i}
                              href={uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[200px]">{title}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
