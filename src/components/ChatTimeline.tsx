import React, { useState } from 'react';
import { 
  Volume2, 
  Copy, 
  Check, 
  Brain, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Sparkles,
  Bot,
  User
} from 'lucide-react';
import { ChatMessage } from '../types/clara';

interface ChatTimelineProps {
  messages: ChatMessage[];
  onSpeak: (text: string) => void;
  isGenerating: boolean;
  onClearHistory?: () => void;
  liveMode?: boolean;
}

export const ChatTimeline: React.FC<ChatTimelineProps> = ({
  messages,
  onSpeak,
  isGenerating,
  onClearHistory,
  liveMode = true,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedTraceIds, setExpandedTraceIds] = useState<Record<string, boolean>>({});

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleTrace = (id: string) => {
    setExpandedTraceIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-6 px-4 md:px-6 py-4">
      {/* Live Mode & Session Memory Bar */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-900 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Mode Active
            </span>
            <span>·</span>
            <span>{messages.length} context turns preserved in cloud memory</span>
          </div>
          {onClearHistory && (
            <button
              onClick={onClearHistory}
              className="text-slate-400 hover:text-rose-400 transition-colors text-[10px]"
            >
              Reset Session
            </button>
          )}
        </div>
      )}
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Clara Cloud Neural System Ready</h2>
          <p className="text-sm text-slate-400 max-w-md mt-2">
            Ask any question, dispatch workspace tasks, generate multimodal art, or consult astrophysics knowledge. Every prompt routes through live cloud neural reasoning.
          </p>
        </div>
      )}

      {messages.map((msg) => {
        const isClara = msg.sender === 'clara';
        const hasTrace = isClara && (msg.thinkingTrace || msg.reasoning);
        const isTraceOpen = expandedTraceIds[msg.id] ?? false;

        return (
          <div
            key={msg.id}
            className={`flex gap-3 md:gap-4 ${isClara ? 'justify-start' : 'justify-end'}`}
          >
            {isClara && (
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400 shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] md:max-w-[80%] rounded-2xl p-4 md:p-5 transition-all ${
                isClara
                  ? 'bg-slate-900/90 border border-slate-800 text-slate-100 shadow-md'
                  : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
              }`}
            >
              {/* Header with Timestamp & Controls */}
              <div className="flex items-center justify-between gap-4 mb-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">
                    {isClara ? 'Clara AI' : 'You'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <time>{msg.timestamp}</time>
                  {msg.moduleOrigin && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-indigo-400">{msg.moduleOrigin}</span>
                    </>
                  )}
                </div>

                {isClara && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSpeak(msg.text)}
                      title="Speak response aloud"
                      className="p-1 hover:text-indigo-400 rounded transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      title="Copy response"
                      className="p-1 hover:text-indigo-400 rounded transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* 3-Step Cognitive Reasoning Trace Accordion */}
              {hasTrace && (
                <div className="mb-3 rounded-xl border border-indigo-900/40 bg-slate-950/70 p-3 text-xs">
                  <button
                    onClick={() => toggleTrace(msg.id)}
                    className="flex items-center justify-between w-full text-left font-medium text-indigo-300 hover:text-indigo-200"
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Cloud Neural Reasoning (3-Step Cognitive Trace)</span>
                    </div>
                    {isTraceOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {isTraceOpen && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-2 text-slate-300">
                      {msg.thinkingTrace && (
                        <div>
                          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Step 1: Intent & Cognitive Strategy
                          </div>
                          <p className="mt-0.5 text-slate-300 pl-2 border-l border-indigo-700/60 font-mono text-[11px]">
                            {msg.thinkingTrace}
                          </p>
                        </div>
                      )}
                      {msg.reasoning && (
                        <div>
                          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Step 2: Dynamic Reasoning & Verification
                          </div>
                          <p className="mt-0.5 text-slate-300 pl-2 border-l border-purple-700/60 font-mono text-[11px]">
                            {msg.reasoning}
                          </p>
                        </div>
                      )}
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          Step 3: Pristine Output Synthesis
                        </div>
                        <p className="mt-0.5 text-emerald-400 text-[11px]">
                          ✓ Output validated and delivered without canned templates.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Feature Badges */}
              {(msg.predictBadge || msg.empathyBadge || msg.optimizeBadge || msg.visionBadge) && (
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {msg.predictBadge && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-700/60 text-amber-300 text-[10px] font-semibold">
                      🔮 ClaraPredict
                    </span>
                  )}
                  {msg.empathyBadge && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-700/60 text-rose-300 text-[10px] font-semibold">
                      💜 ClaraEmpathy
                    </span>
                  )}
                  {msg.optimizeBadge && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-semibold">
                      ⚡ ClaraOptimize
                    </span>
                  )}
                  {msg.visionBadge && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-[10px] font-semibold">
                      📷 Multimodal Vision
                    </span>
                  )}
                </div>
              )}

              {/* User Attached Image / Screenshot */}
              {msg.imageAttachment && (
                <div className="mb-3">
                  <div className="relative inline-block rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-w-sm shadow-md">
                    <img
                      src={msg.imageAttachment.previewUrl || msg.imageAttachment.base64}
                      alt={msg.imageAttachment.fileName || 'Uploaded image'}
                      className="max-h-64 w-full object-cover"
                    />
                    <div className="bg-slate-950/90 border-t border-slate-800 px-3 py-1.5 text-[11px] text-slate-300 flex items-center justify-between">
                      <span className="truncate max-w-[200px]">📷 {msg.imageAttachment.fileName || 'Photo / Screenshot'}</span>
                      <span className="text-indigo-400 font-mono text-[10px]">Multimodal Vision</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div className="prose prose-invert prose-sm max-w-none break-words whitespace-pre-wrap leading-relaxed">
                {msg.text}
              </div>

              {/* Quota / Continuity Notice */}
              {msg.quotaNotice && (
                <div className="mt-2 text-[11px] text-amber-300/80 bg-amber-950/30 border border-amber-800/40 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{msg.quotaNotice}</span>
                </div>
              )}

              {/* Media Attachment if present (e.g. Vector SVG or Image) */}
              {msg.mediaAttachment && (
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  {msg.mediaAttachment.type === 'vector_image' && msg.mediaAttachment.content && (
                    <div 
                      className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-3 flex justify-center items-center max-w-lg"
                      dangerouslySetInnerHTML={{ __html: msg.mediaAttachment.content }}
                    />
                  )}
                  {msg.mediaAttachment.type === 'image' && msg.mediaAttachment.url && (
                    <img
                      src={msg.mediaAttachment.url}
                      alt="Generated by Clara Studio"
                      className="rounded-xl max-w-md w-full object-cover border border-slate-800 shadow-md"
                    />
                  )}
                </div>
              )}

              {/* Grounding Sources (from live Google Search) */}
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold block mb-1.5">
                    Live Grounding Sources:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingSources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[180px]">{source.title || source.uri}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!isClara && (
              <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        );
      })}

      {isGenerating && (
        <div className="flex gap-3 items-center text-slate-400 text-xs py-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-indigo-400 shrink-0">
            <Brain className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>Clara Cloud Neural Engine is thinking & verifying...</span>
          </div>
        </div>
      )}
    </div>
  );
};
