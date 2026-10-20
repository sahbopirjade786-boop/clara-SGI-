import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Apple, 
  Laptop, 
  AlertTriangle, 
  CheckCircle2, 
  Camera, 
  Image as ImageIcon, 
  X, 
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface MediaPermissionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage?: string | null;
  onSelectSampleImage?: (sampleBase64: string, fileName: string, mimeType: string) => void;
}

export const MediaPermissionGuideModal: React.FC<MediaPermissionGuideModalProps> = ({
  isOpen,
  onClose,
  errorMessage,
  onSelectSampleImage,
}) => {
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  // Live in-browser permission testing
  const handleTestCameraPermission = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setTestResult('Browser API: navigator.mediaDevices is not supported in this webview. Use standard file picker.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Clean up stream immediately
      stream.getTracks().forEach((track) => track.stop());
      setTestResult('✅ Camera Permission Status: GRANTED! You can take photos directly.');
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setTestResult('❌ Permission Denied by User or Browser. Please follow the instructions below to enable Camera.');
      } else {
        setTestResult(`⚠️ Access Notice: ${err.message || 'Permission blocked'}. Please check device settings below.`);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const samplePresets = [
    {
      name: 'System Architecture Diagram',
      desc: 'Technical block diagram for layout & text analysis',
      svg: `<svg viewBox="0 0 600 350" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="350" fill="#0f172a" rx="12"/>
        <rect x="30" y="30" width="160" height="80" rx="8" fill="#1e293b" stroke="#6366f1" stroke-width="2"/>
        <text x="50" y="75" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="bold">Client App (SPA)</text>
        <path d="M 190 70 L 260 70" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
        <rect x="260" y="30" width="160" height="80" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
        <text x="280" y="65" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="bold">Express Proxy</text>
        <text x="280" y="85" fill="#94a3b8" font-family="sans-serif" font-size="11">PORT 3000</text>
        <path d="M 420 70 L 480 70" stroke="#94a3b8" stroke-width="2"/>
        <rect x="480" y="30" width="90" height="80" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="2"/>
        <text x="495" y="75" fill="#e0e7ff" font-family="sans-serif" font-size="12" font-weight="bold">Gemini API</text>
        <rect x="30" y="160" width="540" height="150" rx="10" fill="#1e293b"/>
        <text x="50" y="195" fill="#f8fafc" font-family="sans-serif" font-size="14" font-weight="bold">OCR & Multimodal Inspection Test:</text>
        <text x="50" y="225" fill="#cbd5e1" font-family="monospace" font-size="12">STATUS: 200 OK | INLINE DATA: Active</text>
        <text x="50" y="250" fill="#cbd5e1" font-family="monospace" font-size="12">PROTOCOL: Error Handling & Media Permission Protocol</text>
        <text x="50" y="275" fill="#38bdf8" font-family="monospace" font-size="12">ROLE: Clara AI Cloud Assistant for Zain</text>
      </svg>`,
      fileName: 'architecture-diagram-sample.svg'
    },
    {
      name: 'Invoice / Receipt Sample',
      desc: 'Table of expenses for OCR extraction',
      svg: `<svg viewBox="0 0 500 350" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="500" height="350" fill="#ffffff" rx="10"/>
        <text x="40" y="50" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="bold">CLARA CLOUD RECEIPT</text>
        <text x="40" y="75" fill="#64748b" font-family="sans-serif" font-size="12">Invoice #INV-2026-9042</text>
        <line x1="40" y1="95" x2="460" y2="95" stroke="#e2e8f0" stroke-width="2"/>
        <text x="40" y="130" fill="#334155" font-family="sans-serif" font-size="13">1. Gemini Cloud Compute Pool</text>
        <text x="400" y="130" fill="#0f172a" font-family="sans-serif" font-size="13" font-weight="bold">$45.00</text>
        <text x="40" y="165" fill="#334155" font-family="sans-serif" font-size="13">2. Multimodal Vision Token Quota</text>
        <text x="400" y="165" fill="#0f172a" font-family="sans-serif" font-size="13" font-weight="bold">$22.50</text>
        <text x="40" y="200" fill="#334155" font-family="sans-serif" font-size="13">3. High Availability Guard</text>
        <text x="400" y="200" fill="#0f172a" font-family="sans-serif" font-size="13" font-weight="bold">$15.00</text>
        <line x1="40" y1="230" x2="460" y2="230" stroke="#0f172a" stroke-width="2"/>
        <text x="40" y="265" fill="#0f172a" font-family="sans-serif" font-size="15" font-weight="bold">TOTAL AMOUNT PAID</text>
        <text x="390" y="265" fill="#059669" font-family="sans-serif" font-size="17" font-weight="bold">$82.50 USD</text>
      </svg>`,
      fileName: 'receipt-invoice-sample.svg'
    }
  ];

  const handlePickSample = (sample: typeof samplePresets[0]) => {
    const base64 = `data:image/svg+xml;base64,${btoa(sample.svg)}`;
    if (onSelectSampleImage) {
      onSelectSampleImage(base64, sample.fileName, 'image/svg+xml');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="permission-modal-title"
      >
        
        {/* Header */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="permission-modal-title" className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                Photo & Media Permission Helper
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-900/60 border border-indigo-700 text-indigo-300">
                  Protocol 12
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Gallery, Camera aur Storage permissions ko "Allow" karne ki asaan step-by-step guide
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-5 text-sm">
          
          {/* Error Banner if triggered by an actual error */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-rose-300">Upload Issue Detected:</span>
                <span>{errorMessage}</span>
                <p className="mt-1 text-slate-300">
                  Yeh aam taur par browser ya mobile device permissions ke "Deny / Blocked" hone par hota hai. Niche diye gaye steps follow karein:
                </p>
              </div>
            </div>
          )}

          {/* Platform Switcher Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActivePlatform('android')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                activePlatform === 'android'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Android (Phone)</span>
            </button>
            <button
              onClick={() => setActivePlatform('ios')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                activePlatform === 'ios'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span>iPhone / iOS</span>
            </button>
            <button
              onClick={() => setActivePlatform('desktop')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                activePlatform === 'desktop'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>PC / Browser</span>
            </button>
          </div>

          {/* Step-by-Step Instructions based on selected platform */}
          {activePlatform === 'android' && (
            <div className="space-y-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5 text-sm">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Android Chrome / Samsung Internet Instructions (Hindi & English):</span>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <strong className="text-white block">URL Bar mein Lock (🔒) Icon tap karein</strong>
                    <span className="text-slate-300">Browser ke upar address bar mein website URL ke bagal me 🔒 lock ya settings icon par click karein.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <strong className="text-white block">"Permissions" ya "Site Settings" select karein</strong>
                    <span className="text-slate-300">Wahan <strong>Camera</strong> aur <strong>Files / Storage</strong> permission par tap karein.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <strong className="text-white block">Switch to "Allow" (Manzoor karein)</strong>
                    <span className="text-slate-300">Dono permissions ko toggle karke <strong>"Allow"</strong> set karein.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 flex items-center justify-center font-bold shrink-0">4</span>
                  <div>
                    <strong className="text-white block">Agar phir bhi error aaye (Phone Settings method):</strong>
                    <span className="text-slate-300">
                      Phone ki main <strong>Settings</strong> &gt; <strong>Apps</strong> &gt; <strong>Chrome</strong> (ya Browser) &gt; <strong>Permissions</strong> mein jaayein aur <strong>Camera</strong> aur <strong>Photos / Media</strong> ko "Allow" kardein.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePlatform === 'ios' && (
            <div className="space-y-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5 text-sm">
                <Apple className="w-4 h-4 text-indigo-400" />
                <span>iPhone / iPad (Safari & Chrome) Instructions:</span>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <strong className="text-white block">iPhone ki "Settings" App kholein</strong>
                    <span className="text-slate-300">Apne phone ki main Settings app me scroll karke <strong>Safari</strong> ya <strong>Chrome</strong> par tap karein.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <strong className="text-white block">Camera & Photo Permissions "Allow" karein</strong>
                    <span className="text-slate-300">
                      Safari ke liye: "Settings for Websites" ke andar <strong>Camera</strong> par tap karein aur <strong>"Allow"</strong> select karein.
                      <br />Chrome ke liye: <strong>Photos</strong> par tap karke <strong>"All Photos"</strong> ya "Full Access" select karein.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <strong className="text-white block">Browser me aakar page reload karein</strong>
                    <span className="text-slate-300">Ab gallery ya camera button dabate hi photo seedha select ho jayegi bina kisi permission error ke!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePlatform === 'desktop' && (
            <div className="space-y-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5 text-sm">
                <Laptop className="w-4 h-4 text-indigo-400" />
                <span>Desktop (Google Chrome, Edge, Safari, Firefox):</span>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <strong className="text-white block">Click Padlock 🔒 in Address Bar</strong>
                    <span className="text-slate-300">Click the tune / lock icon next to the URL at the top left.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <strong className="text-white block">Enable Camera & File Access</strong>
                    <span className="text-slate-300">Set "Camera" to <strong>Allow</strong>. If prompted for File Access, choose Allow.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <strong className="text-white block">Drag and Drop Support</strong>
                    <span className="text-slate-300">You can also simply drag and drop any image directly onto Clara or paste from clipboard with <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">Ctrl+V</kbd>!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Camera Permission Tester */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-400" />
                Live Camera Permission Check
              </span>
              <button
                onClick={handleTestCameraPermission}
                disabled={isTesting}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                <span>{isTesting ? 'Checking...' : 'Test Permission'}</span>
              </button>
            </div>
            {testResult && (
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-200 font-mono text-[11px]">
                {testResult}
              </div>
            )}
          </div>

          {/* Fallback Sample Images */}
          {onSelectSampleImage && (
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  Instant Test Without Gallery Access:
                </span>
                <span className="text-[11px] text-slate-400">Zero permissions needed</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePresets.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePickSample(s)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left transition-colors group flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        📷 {s.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {s.desc}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Clara AI Multimodal Perception · Always ready for Zain
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-md shadow-indigo-600/20"
          >
            Samajh Gaya (Done)
          </button>
        </div>

      </div>
    </div>
  );
};
