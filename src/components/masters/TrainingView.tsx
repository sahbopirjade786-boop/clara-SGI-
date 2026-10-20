import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  Cloud, 
  Plus, 
  Trash2, 
  Edit3, 
  Play, 
  RotateCcw, 
  Download, 
  Upload, 
  Clock, 
  Calendar, 
  Zap, 
  Layers, 
  Search,
  BookOpen,
  Send,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { claraApi } from '../../services/claraApi';
import { TrainingRule, TrainingStats } from '../../types/clara';

interface TrainingViewProps {
  onSendToChat?: (prompt: string) => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({ onSendToChat }) => {
  const [rules, setRules] = useState<TrainingRule[]>([]);
  const [stats, setStats] = useState<TrainingStats>({
    totalRules: 5,
    activeRules: 5,
    cloudSyncStatus: 'synced',
    storageCapacity: 'infinite',
    lastUpdated: new Date().toISOString(),
    adherenceRate: 100,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // New Rule Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [newBehavior, setNewBehavior] = useState('');
  const [newCategory, setNewCategory] = useState<'direct_accuracy' | 'persona' | 'workflow' | 'scientific' | 'custom'>('direct_accuracy');
  const [newWeight, setNewWeight] = useState(100);
  const [newTags, setNewTags] = useState('accuracy, direct');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live Rule Tester State
  const [testPrompt, setTestPrompt] = useState('What is the time?');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    matchedRule: TrainingRule | null;
    adherenceScore: number;
    thinking: string;
    reasoning: string;
    output: string;
    model: string;
  } | null>(null);

  // Load Rules from Cloud
  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await claraApi.getTrainingRules();
      if (res.success) {
        setRules(res.rules);
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load training rules from cloud:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  // Handle Add Rule
  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim() || !newBehavior.trim()) return;

    setIsSubmitting(true);
    try {
      const tagList = newTags.split(',').map((t) => t.trim()).filter(Boolean);
      const res = await claraApi.addTrainingRule({
        userPrompt: newPrompt.trim(),
        expectedBehavior: newBehavior.trim(),
        category: newCategory,
        strictnessWeight: newWeight,
        tags: tagList,
      });

      if (res.success) {
        setSuccessMessage('Training rule permanently synchronized to Infinite Cloud!');
        setTimeout(() => setSuccessMessage(null), 4000);
        setNewPrompt('');
        setNewBehavior('');
        setShowAddForm(false);
        loadRules();
      }
    } catch (err: any) {
      alert(`Error saving rule: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Rule Status
  const handleToggleRule = async (rule: TrainingRule) => {
    try {
      await claraApi.updateTrainingRule(rule.id, { enabled: !rule.enabled });
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
      );
    } catch (err: any) {
      alert(`Failed to update rule: ${err.message}`);
    }
  };

  // Delete Rule
  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to remove this training rule from Infinite Cloud?')) return;
    try {
      const res = await claraApi.deleteTrainingRule(id);
      if (res.success) {
        setRules((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Cannot delete baseline constitutional rules.');
    }
  };

  // Reset to Baseline
  const handleResetBaseline = async () => {
    if (!confirm('Reset training rules to constitutional baseline? Custom rules will be reset.')) return;
    try {
      const res = await claraApi.resetTrainingRules();
      if (res.success) {
        setRules(res.rules);
        setSuccessMessage('Successfully reset to baseline training rules.');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reset rules.');
    }
  };

  // Run Test Benchmark
  const handleRunBenchmark = async (promptToRun?: string) => {
    const query = promptToRun || testPrompt;
    if (!query.trim()) return;

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await claraApi.testTrainingRule({
        prompt: query,
        clientTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
        clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      if (res.success) {
        setTestResult({
          matchedRule: res.matchedRule,
          adherenceScore: res.adherenceScore,
          thinking: res.thinking,
          reasoning: res.reasoning,
          output: res.output,
          model: res.model,
        });
      }
    } catch (err: any) {
      alert(`Benchmark error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  // Export JSON Dataset
  const handleExportDataset = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `clara-infinite-cloud-training-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter Rules
  const filteredRules = rules.filter((r) => {
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch =
      r.userPrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.expectedBehavior.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.tags && r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Top Banner: Infinite Cloud Training Core */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/50 border border-indigo-900/40 rounded-2xl p-5 md:p-6 shadow-xl shadow-indigo-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cloud className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Infinite Cloud Training Studio</h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Synced
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300">
                  Infinite Storage
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Cumulative cloud training engine enforcing zero-hallucination factual accuracy and intelligent behavioral expansion.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs">
            <div className="text-center px-2">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Active Rules</div>
              <div className="text-indigo-300 font-bold text-base">{stats.activeRules} / {rules.length}</div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Adherence</div>
              <div className="text-emerald-400 font-bold text-base">100%</div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Cloud Sync</div>
              <div className="text-purple-300 font-bold text-base">Real-Time</div>
            </div>
          </div>
        </div>

        {/* Global Operational Rules Accordion/Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200">1. Preserve Functions</div>
              <div className="text-[11px] text-slate-400">All 10 core modules remain active & intact.</div>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg flex items-start gap-2">
            <Layers className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200">2. Cumulative Only</div>
              <div className="text-[11px] text-slate-400">New rules stack strictly on top of existing capabilities.</div>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200">3. Rule Adherence</div>
              <div className="text-[11px] text-slate-400">Custom user Q&A strictly respected as guideline.</div>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200">4. Intelligent Expansion</div>
              <div className="text-[11px] text-slate-400">Explain logic deeply without contradicting intent.</div>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg flex items-start gap-2">
            <Zap className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200">5. Zero Hallucination</div>
              <div className="text-[11px] text-slate-400">Direct, accurate answers (e.g. current live time).</div>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-300">
            Dismiss
          </button>
        </div>
      )}

      {/* Interactive Sandbox: Live Benchmark & Rule Tester */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-slate-200 text-sm md:text-base">Live Training Rule Benchmark Sandbox</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => {
                setTestPrompt('What is the time?');
                handleRunBenchmark('What is the time?');
              }}
              className="px-2.5 py-1 bg-indigo-950/70 border border-indigo-800 text-indigo-300 rounded-md hover:bg-indigo-900"
            >
              Test "What is the time?"
            </button>
            <button
              onClick={() => {
                setTestPrompt("What is today's date?");
                handleRunBenchmark("What is today's date?");
              }}
              className="px-2.5 py-1 bg-purple-950/70 border border-purple-800 text-purple-300 rounded-md hover:bg-purple-900"
            >
              Test "Today's Date"
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunBenchmark();
              }}
              placeholder="Enter any prompt to benchmark against active training rules (e.g. 'What is the time?')..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 pr-10"
            />
          </div>
          <button
            onClick={() => handleRunBenchmark()}
            disabled={isTesting || !testPrompt.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all shrink-0"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Benchmark</span>
              </>
            )}
          </button>
        </div>

        {/* Benchmark Results */}
        {testResult && (
          <div className="mt-4 bg-slate-950 border border-indigo-900/40 rounded-xl p-4.5 space-y-3.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">Rule Match:</span>
                {testResult.matchedRule ? (
                  <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded font-mono">
                    {testResult.matchedRule.id} ({testResult.matchedRule.category})
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Universal Cognitive Synthesis</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Adherence Score:</span>
                  <span className="font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                    {testResult.adherenceScore}% Strict
                  </span>
                </div>
                {onSendToChat && (
                  <button
                    onClick={() => onSendToChat(testPrompt)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                    title="Send to main Neural Chat timeline"
                  >
                    <Send className="w-3 h-3 text-indigo-400" />
                    <span>Send to Chat</span>
                  </button>
                )}
              </div>
            </div>

            {/* Cognitive Step 1 & 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Step 1: Intent Analysis</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{testResult.thinking}</p>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Step 2: Training Adherence & Verification</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{testResult.reasoning}</p>
              </div>
            </div>

            {/* Step 3 Output */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
              <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Step 3: Direct Accurate Output (Intelligent Expansion)</span>
              </div>
              <div className="text-slate-100 whitespace-pre-wrap leading-relaxed text-xs">
                {testResult.output}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rules Management Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category tabs */}
          {['all', 'direct_accuracy', 'persona', 'workflow', 'scientific', 'custom'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search training pairs..."
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 w-44 sm:w-56"
            />
          </div>

          {/* Add Rule Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rule</span>
          </button>

          {/* Export Dataset */}
          <button
            onClick={handleExportDataset}
            title="Export training dataset as JSON"
            className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Reset to baseline */}
          <button
            onClick={handleResetBaseline}
            title="Reset to constitutional baseline"
            className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add New Training Rule Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddRule}
          className="bg-slate-900/95 border border-indigo-800/80 rounded-2xl p-5 space-y-4 shadow-xl shadow-indigo-950/30 animate-fadeIn text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-slate-100">Add Cumulative Training Pair (Infinite Cloud)</h3>
            </div>
            <span className="text-[11px] text-slate-400">Rule 2: Cumulative Addition Only</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                User Query / Prompt Trigger:
              </label>
              <input
                type="text"
                required
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="e.g. What is the time? OR How should you sign emails?"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Category:
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="direct_accuracy">Direct Accuracy (Zero Hallucination)</option>
                <option value="persona">Persona & Tone Modulation</option>
                <option value="workflow">Workspace & Operational Workflow</option>
                <option value="scientific">Scientific & Deterministic Math</option>
                <option value="custom">Custom Behavioral Guideline</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Expected Behavior / Ground-Truth Answer Baseline:
            </label>
            <textarea
              required
              rows={3}
              value={newBehavior}
              onChange={(e) => setNewBehavior(e.target.value)}
              placeholder="State the exact baseline logic or preferred response style. Clara will use this baseline and expand upon it intelligently without contradiction..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Strictness Weight:</label>
                <span className="text-indigo-400 font-bold">{newWeight}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={newWeight}
                onChange={(e) => setNewWeight(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Tags (comma separated):
              </label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="time, accurate, direct"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing to Cloud...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save to Infinite Cloud</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Rules Catalog List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 text-xs gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Loading Infinite Cloud rules...</span>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
            <AlertCircle className="w-6 h-6 text-slate-500 mx-auto mb-2" />
            <p>No training rules matched your filter query.</p>
          </div>
        ) : (
          filteredRules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-slate-900/80 border rounded-xl p-4.5 transition-all text-xs ${
                rule.enabled
                  ? 'border-slate-800 hover:border-slate-700 bg-slate-900/80'
                  : 'border-slate-800/50 opacity-60 bg-slate-950/60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-slate-500">{rule.id}</span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        rule.category === 'direct_accuracy'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : rule.category === 'persona'
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                          : rule.category === 'scientific'
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                          : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800'
                      }`}
                    >
                      {rule.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Weight: <strong className="text-slate-200">{rule.strictnessWeight}%</strong>
                    </span>
                    {rule.protected && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-950/60 border border-amber-800/60 text-amber-300 rounded font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Constitutional Base
                      </span>
                    )}
                  </div>

                  {/* Trigger Query */}
                  <div>
                    <span className="text-slate-400 font-semibold text-[11px] block">Trigger Query:</span>
                    <p className="text-white font-medium text-sm mt-0.5">{rule.userPrompt}</p>
                  </div>

                  {/* Expected Behavior Baseline */}
                  <div>
                    <span className="text-slate-400 font-semibold text-[11px] block">Expected Behavior Baseline:</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-lg font-mono text-[11px]">
                      {rule.expectedBehavior}
                    </p>
                  </div>

                  {/* Tags */}
                  {rule.tags && rule.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {rule.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Right */}
                <div className="flex items-center md:flex-col gap-2 shrink-0 md:items-end justify-between md:justify-start pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* Enable Toggle */}
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                    title={rule.enabled ? 'Rule Active' : 'Rule Paused'}
                  >
                    {rule.enabled ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-400" />
                        <span className="text-[11px] text-emerald-300 font-medium">Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-slate-500" />
                        <span className="text-[11px] text-slate-400">Paused</span>
                      </>
                    )}
                  </button>

                  {/* Run in Sandbox */}
                  <button
                    onClick={() => {
                      setTestPrompt(rule.userPrompt);
                      handleRunBenchmark(rule.userPrompt);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-950/70 border border-indigo-800/70 text-indigo-300 hover:bg-indigo-900 rounded"
                    title="Run live benchmark on this rule"
                  >
                    <Play className="w-3 h-3 text-indigo-400" />
                    <span>Test Rule</span>
                  </button>

                  {/* Delete (if not protected) */}
                  {!rule.protected ? (
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-600 italic">Protected</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
