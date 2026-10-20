import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Search, 
  Layers, 
  Lightbulb, 
  ArrowRight,
  X,
  Eye,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { claraApi } from '../../services/claraApi';
import { processAndOptimizeImage } from '../../utils/imageOptimizer';
import { MediaPermissionGuideModal } from '../MediaPermissionGuideModal';

interface VisionViewProps {
  onSendToChat: (prompt: string, image?: any) => void;
}

export const VisionView: React.FC<VisionViewProps> = ({ onSendToChat }) => {
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; fileName: string } | null>(null);
  const [visionMode, setVisionMode] = useState<'full' | 'ocr' | 'ui' | 'objects'>('full');
  const [customPrompt, setCustomPrompt] = useState('Perform a full detailed breakdown: OCR all text, identify objects and UI elements, analyze layout, and give proactive insights.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPermissionGuideOpen, setIsPermissionGuideOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const sampleImages = [
    {
      title: 'Dashboard Architecture Mockup',
      svg: `<svg viewBox="0 0 600 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="#0f172a"/>
        <rect x="20" y="20" width="140" height="360" rx="10" fill="#1e293b"/>
        <rect x="180" y="20" width="400" height="70" rx="10" fill="#1e293b"/>
        <text x="200" y="60" fill="#38bdf8" font-family="sans-serif" font-size="20" font-weight="bold">CLARA ENTERPRISE METRICS</text>
        <rect x="180" y="110" width="190" height="120" rx="10" fill="#334155"/>
        <text x="200" y="150" fill="#f8fafc" font-family="sans-serif" font-size="16">Active Users: 124,500</text>
        <text x="200" y="180" fill="#10b981" font-family="sans-serif" font-size="14">+18.4% YoY</text>
        <rect x="390" y="110" width="190" height="120" rx="10" fill="#334155"/>
        <text x="410" y="150" fill="#f8fafc" font-family="sans-serif" font-size="16">API Latency: 28ms</text>
        <text x="410" y="180" fill="#38bdf8" font-family="sans-serif" font-size="14">Cloud Run: Nominal</text>
        <rect x="180" y="250" width="400" height="130" rx="10" fill="#1e293b"/>
        <path d="M 200 350 Q 280 280 360 310 T 540 270" fill="none" stroke="#6366f1" stroke-width="4"/>
      </svg>`,
      fileName: 'clara-dashboard-sample.svg'
    }
  ];

  const handleProcessFile = async (file: File) => {
    setIsOptimizing(true);
    setUploadError(null);
    try {
      const optimized = await processAndOptimizeImage(file);
      setSelectedImage({
        base64: optimized.base64,
        mimeType: optimized.mimeType,
        fileName: optimized.fileName,
      });
      setAnalysisResult(null);
    } catch (err: any) {
      console.error('Vision upload error:', err);
      setUploadError(err.message || 'Gallery ya camera access me error aaya.');
      setIsPermissionGuideOpen(true);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    e.target.value = '';
  };

  const handleLoadSample = (sample: typeof sampleImages[0]) => {
    const base64 = `data:image/svg+xml;base64,${btoa(sample.svg)}`;
    setSelectedImage({
      base64,
      mimeType: 'image/svg+xml',
      fileName: sample.fileName,
    });
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let promptText = customPrompt;
      if (visionMode === 'ocr') {
        promptText = 'Read and transcribe all visible text, numbers, code, and handwriting in this image with exact precision.';
      } else if (visionMode === 'ui') {
        promptText = 'Inspect this UI screenshot: detect visual components, typography balance, contrast issues, and UI/UX design flaws.';
      } else if (visionMode === 'objects') {
        promptText = 'Identify all physical objects, people, diagrams, and components in this scene with coordinate context.';
      }

      const res = await claraApi.analyzeImage(selectedImage, promptText, visionMode);
      setAnalysisResult(res.analysis);
    } catch (err: any) {
      setAnalysisResult(`Vision Analysis Error: ${err.message || 'Image processing failed'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Multimodal Vision & Photo Analysis</h2>
              <span className="text-xs text-indigo-300 bg-indigo-950/80 border border-indigo-800 px-2 py-0.5 rounded font-mono">
                Multimodal AI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Deep photo inspection, OCR text reading, object recognition, diagram parsing, and proactive insights.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Vision Model:</span>
          <span className="font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded">
            gemini-3.8-flash (Multimodal)
          </span>
        </div>
      </div>

      {/* Main Grid: Upload Area & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Image Selector */}
        <div className="lg:col-span-5 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Upload Error Alert */}
          {uploadError && (
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs animate-shake">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">{uploadError}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPermissionGuideOpen(true)}
                className="px-2 py-1 rounded bg-rose-900 hover:bg-rose-800 text-rose-100 font-semibold text-[11px] shrink-0 transition-colors"
              >
                Help →
              </button>
            </div>
          )}

          {/* Upload Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/70 group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mx-auto mb-2.5 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div className="font-semibold text-sm text-slate-200">
              {isOptimizing ? 'Optimizing image...' : 'Click to select photo from gallery'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Supports PNG, JPG, WEBP, SVG & screenshots
            </p>
          </div>

          {/* Quick Action Buttons: Camera & Permission Guide */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-700 text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              <Camera className="w-4 h-4 text-indigo-400" />
              <span>Take Photo</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPermissionGuideOpen(true)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-700 text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Permission Guide</span>
            </button>
          </div>

          {/* Staged Image Card */}
          {selectedImage && (
            <div className="bg-slate-900/90 border border-indigo-700/60 rounded-2xl p-3 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold truncate max-w-[200px]">📷 {selectedImage.fileName}</span>
                <button
                  onClick={() => { setSelectedImage(null); setAnalysisResult(null); setUploadError(null); }}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-56 flex items-center justify-center">
                <img 
                  src={selectedImage.base64} 
                  alt="Selected" 
                  className="max-h-56 w-auto object-contain"
                />
              </div>
            </div>
          )}

          {/* Sample Presets */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
            <span className="text-slate-400 font-semibold block">Quick Test Samples:</span>
            {sampleImages.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadSample(s)}
                className="w-full text-left p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-600 text-slate-300 flex items-center justify-between transition-colors"
              >
                <span>📊 {s.title}</span>
                <span className="text-indigo-400">Load sample →</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Mode Controls & Output */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Analysis Mode Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>Select Vision Analysis Mode:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'full', label: 'Detailed Breakdown', icon: Layers },
                { id: 'ocr', label: 'OCR Text Reading', icon: FileText },
                { id: 'ui', label: 'UI / UX Audit', icon: Search },
                { id: 'objects', label: 'Object Detection', icon: Lightbulb },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setVisionMode(m.id as any)}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                      visionMode === m.id
                        ? 'bg-indigo-950 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span className="font-medium text-[11px]">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Prompt input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] text-slate-400">Custom Visual Prompt:</label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Run Analysis Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={!selectedImage || isAnalyzing}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Inspecting photo with Multimodal Vision Engine...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Photo with Clara Vision</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Result Card */}
          {analysisResult && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified Multimodal Vision Breakdown
                </span>
                <button
                  onClick={() => onSendToChat(customPrompt, selectedImage)}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                >
                  <span>Open in Chat Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="prose prose-invert prose-sm max-w-none break-words whitespace-pre-wrap leading-relaxed text-xs text-slate-200">
                {analysisResult}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Media Permission Guide Modal */}
      <MediaPermissionGuideModal
        isOpen={isPermissionGuideOpen}
        onClose={() => setIsPermissionGuideOpen(false)}
        errorMessage={uploadError}
        onSelectSampleImage={(sampleBase64, fileName, mimeType) => {
          setSelectedImage({
            base64: sampleBase64,
            mimeType,
            fileName,
          });
          setAnalysisResult(null);
          setUploadError(null);
        }}
      />

    </div>
  );
};
