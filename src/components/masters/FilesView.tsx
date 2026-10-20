import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Lock, 
  FileCheck, 
  Download, 
  Sparkles, 
  Trash2, 
  Search,
  BookOpen 
} from 'lucide-react';
import { claraApi } from '../../services/claraApi';
import { StoredDocument } from '../../types/clara';

export const FilesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'summarize' | 'report' | 'vault'>('summarize');

  // Summarize state
  const [docTitle, setDocTitle] = useState('Cloud Architecture Strategy 2026');
  const [textContent, setTextContent] = useState(
    'Cloud computing and autonomous cognitive agents are fundamentally restructuring enterprise workflows. By decoupling server orchestration from browser limitations and enforcing zero-hallucination verification loops, neural systems like Clara AI achieve deterministic reliability across distributed services. The 10 Master Module blueprint unifies memory, voice synthesis, workspace APIs, and automated code review into a single cohesive runtime.'
  );
  const [summaryResult, setSummaryResult] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Report Generator state
  const [reportTopic, setReportTopic] = useState('Comparative Analysis of Decentralized Neural Inference vs Centralized Cloud LLMs');
  const [reportResult, setReportResult] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Vault state
  const [vaultDocs, setVaultDocs] = useState<StoredDocument[]>([
    {
      id: 'doc-1',
      title: 'Clara Master Blueprint Specs.pdf',
      content: 'Complete 100-function architecture specifications across 10 Master modules.',
      size: '2.4 MB',
      dateAdded: '2026-10-14',
      tags: ['blueprint', 'master', 'encrypted'],
    },
    {
      id: 'doc-2',
      title: 'Enterprise Security Compliance.pdf',
      content: 'WCAG AA, AES-256 vault encryption, and Zero-Hallucination verification guidelines.',
      size: '1.8 MB',
      dateAdded: '2026-10-14',
      tags: ['security', 'compliance'],
    },
  ]);
  const [vaultSearch, setVaultSearch] = useState('');

  // Handle Summarize
  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const res = await claraApi.runFiles('summarize', {
        docTitle,
        textContent,
      });
      setSummaryResult(res.summary || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Handle Report
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await claraApi.runFiles('generate_report', {
        query: reportTopic,
      });
      setReportResult(res.report || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setTextContent(text || '');
      setDocTitle(file.name);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Overview Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-950 border border-teal-700/60 flex items-center justify-center text-teal-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Master 5: ClaraFiles</h2>
              <span className="text-xs text-teal-400 bg-teal-950/80 border border-teal-800 px-2 py-0.5 rounded font-mono">
                Functions 46–50
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Document indexing, PDF & report generator, article summarizer, and encrypted cloud file vault.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <Upload className="w-4 h-4 text-teal-400" />
            <span>Upload Document</span>
            <input type="file" onChange={handleFileUpload} accept=".txt,.md,.json,.csv,.pdf" className="hidden" />
          </label>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('summarize')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'summarize'
              ? 'bg-slate-800 text-teal-300 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Document Summarizer</span>
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'report'
              ? 'bg-slate-800 text-teal-300 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Report Generator</span>
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'vault'
              ? 'bg-slate-800 text-teal-300 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Encrypted File Vault</span>
        </button>
      </div>

      {/* Summarizer Section */}
      {activeTab === 'summarize' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Document Parsing & Executive Summarizer</h3>
            <span className="text-xs text-teal-400 font-mono">Max: 15,000 tokens</span>
          </div>

          <div className="text-xs space-y-2">
            <label className="text-slate-400 block">Document Title / File Name:</label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="text-xs space-y-2">
            <label className="text-slate-400 block">Document Raw Text / Content:</label>
            <textarea
              rows={5}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste document content, report notes, or upload a file..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-teal-500 font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSummarize}
              disabled={isSummarizing || !textContent.trim()}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSummarizing ? 'Analyzing Document...' : 'Generate Executive Summary'}</span>
            </button>
          </div>

          {summaryResult && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300">Executive Synthesis:</span>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {summaryResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Generator Section */}
      {activeTab === 'report' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Cloud PDF & Enterprise Report Generator</h3>
            <span className="text-xs text-teal-400 font-mono">Format: Structured Markdown</span>
          </div>

          <div className="text-xs space-y-2">
            <label className="text-slate-400 block">Report Research Topic & Parameters:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={reportTopic}
                onChange={(e) => setReportTopic(e.target.value)}
                placeholder="Topic e.g. Quantum Computing algorithms, Sustainable Energy grids..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingReport ? 'Compiling Report...' : 'Compile Report'}</span>
              </button>
            </div>
          </div>

          {reportResult && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Generated Enterprise Report:</span>
                <button
                  onClick={() => {
                    const blob = new Blob([reportResult], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'Clara_Enterprise_Report.md';
                    a.click();
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg flex items-center gap-1 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {reportResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Encrypted Vault Section */}
      {activeTab === 'vault' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Encrypted Cloud File Vault</h3>
              <p className="text-xs text-slate-400">Zero-knowledge client encrypted document store.</p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search vault..."
                value={vaultSearch}
                onChange={(e) => setVaultSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            {vaultDocs
              .filter((d) => d.title.toLowerCase().includes(vaultSearch.toLowerCase()))
              .map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-950/60 rounded-lg text-teal-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">{doc.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {doc.size} · Added {doc.dateAdded} · Tags: {doc.tags.join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Previewing encrypted contents of ${doc.title}:\n\n${doc.content}`)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md"
                    >
                      Decrypt & View
                    </button>
                    <button
                      onClick={() => setVaultDocs((prev) => prev.filter((d) => d.id !== doc.id))}
                      className="p-1 hover:text-rose-400 text-slate-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
};
