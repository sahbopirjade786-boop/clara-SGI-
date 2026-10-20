import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Bug, 
  Database, 
  Binary, 
  Sparkles, 
  Copy, 
  Check, 
  Play 
} from 'lucide-react';
import { claraApi } from '../../services/claraApi';

export const CoderView: React.FC = () => {
  const [action, setAction] = useState<'generate' | 'debug' | 'sql' | 'regex'>('generate');
  const [language, setLanguage] = useState('TypeScript');
  const [instruction, setInstruction] = useState('Implement a thread-safe rate limiter using Token Bucket algorithm with exponential burst capacity');
  const [inputCode, setInputCode] = useState(`function processData(items) {
  let result = [];
  for (var i = 0; i < items.length; i++) {
    setTimeout(function() {
      result.push(items[i] * 2);
    }, 100);
  }
  return result; // Notice var closure bug & async race condition!
}`);
  const [regexTestStr, setRegexTestStr] = useState('user.name@enterprise-cloud.io');

  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRunCoder = async () => {
    setIsLoading(true);
    setOutput('');
    try {
      const res = await claraApi.runCoder(
        action,
        instruction,
        language,
        action === 'debug' ? inputCode : undefined
      );
      setOutput(res.result || '');
    } catch (e: any) {
      setOutput(`Error: ${e.message || 'Coder task failed'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Overview Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Master 7: ClaraCoder</h2>
              <span className="text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                Functions 66–85
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-language code generator, AST debugger, regex synthesizer, SQL builder & vulnerability scanner.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Compiler:</span>
          <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded">
            AST Diagnostic: Active
          </span>
        </div>
      </div>

      {/* Action Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'generate', label: 'Code Generation', icon: Terminal },
          { id: 'debug', label: 'AST Debugger & Linter', icon: Bug },
          { id: 'sql', label: 'SQL Query Builder', icon: Database },
          { id: 'regex', label: 'Regex Synthesizer', icon: Binary },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setAction(tab.id as any);
                setOutput('');
                if (tab.id === 'generate') setInstruction('Implement a thread-safe rate limiter using Token Bucket algorithm with exponential burst capacity');
                if (tab.id === 'debug') setInstruction('Identify the closure scope bug, asynchronous array return issue, and optimize algorithmic complexity');
                if (tab.id === 'sql') setInstruction('Construct an optimized PostgreSQL query with CTE and window functions to compute 7-day rolling revenue per customer tier');
                if (tab.id === 'regex') setInstruction('Match valid international phone numbers with optional country code (+91, +1), hyphens, and whitespace');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                action === tab.id
                  ? 'bg-slate-800 text-emerald-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Language & Parameter Selectors */}
      {action === 'generate' && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Target Language:</span>
          {['TypeScript', 'Python', 'Go', 'Rust', 'SQL', 'C++'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                language === lang
                  ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      )}

      {/* Code Editor / Inputs */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="text-xs space-y-2">
          <label className="text-slate-400 block font-semibold">
            {action === 'debug' ? 'Instructions for Debugger:' : 'Task Specification:'}
          </label>
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
          />
        </div>

        {action === 'debug' && (
          <div className="text-xs space-y-2">
            <label className="text-slate-400 block font-semibold">Source Code to Inspect & Fix:</label>
            <textarea
              rows={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>
        )}

        {action === 'regex' && (
          <div className="text-xs space-y-2">
            <label className="text-slate-400 block font-semibold">Test Sample String:</label>
            <input
              type="text"
              value={regexTestStr}
              onChange={(e) => setRegexTestStr(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleRunCoder}
            disabled={isLoading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{isLoading ? 'Compiling Code Engine...' : 'Execute ClaraCoder'}</span>
          </button>
        </div>

        {/* Results Console */}
        {output && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Analysis & Code Output:</span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg flex items-center gap-1 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
              {output}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
};
