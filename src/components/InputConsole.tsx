import React, { useState, useRef } from 'react';
import { 
  Send, 
  Mic, 
  Sparkles, 
  Image as ImageIcon, 
  Camera,
  X, 
  Zap, 
  Heart, 
  TrendingUp, 
  Radio, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { VoiceState } from '../services/voiceService';
import { processAndOptimizeImage } from '../utils/imageOptimizer';
import { MediaPermissionGuideModal } from './MediaPermissionGuideModal';

export interface ImageAttachmentData {
  base64: string;
  mimeType: string;
  fileName?: string;
  previewUrl?: string;
}

interface InputConsoleProps {
  onSendMessage: (text: string, image?: ImageAttachmentData) => void;
  voiceState: VoiceState;
  onToggleVoice: () => void;
  onSimulateWakeWord: (prompt?: string) => void;
  isGenerating: boolean;
  predictMode: boolean;
  setPredictMode: (val: boolean) => void;
  empathyMode: boolean;
  setEmpathyMode: (val: boolean) => void;
  optimizeMode: boolean;
  setOptimizeMode: (val: boolean) => void;
  liveMode: boolean;
  setLiveMode: (val: boolean) => void;
}

export const InputConsole: React.FC<InputConsoleProps> = ({
  onSendMessage,
  voiceState,
  onToggleVoice,
  onSimulateWakeWord,
  isGenerating,
  predictMode,
  setPredictMode,
  empathyMode,
  setEmpathyMode,
  optimizeMode,
  setOptimizeMode,
  liveMode,
  setLiveMode,
}) => {
  const [text, setText] = useState('');
  const [stagedImage, setStagedImage] = useState<ImageAttachmentData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isPermissionGuideOpen, setIsPermissionGuideOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageFile = async (file: File) => {
    setIsProcessingImage(true);
    setUploadError(null);
    try {
      const optimized = await processAndOptimizeImage(file);
      setStagedImage({
        base64: optimized.base64,
        mimeType: optimized.mimeType,
        fileName: optimized.fileName,
        previewUrl: optimized.previewUrl,
      });
    } catch (err: any) {
      console.error('Image upload / permission error:', err);
      const msg = err.message || 'Gallery ya camera access me permission error aaya.';
      setUploadError(msg);
      setIsPermissionGuideOpen(true);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        handleImageFile(file);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Storage permission denied');
      setIsPermissionGuideOpen(true);
    }
    // reset input value so re-selecting the same file works
    e.target.value = '';
  };

  const handleCameraInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        handleImageFile(file);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Camera permission denied');
      setIsPermissionGuideOpen(true);
    }
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleImageFile(file);
          break;
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.name.match(/\.(png|jpe?g|webp|svg)$/i))) {
      handleImageFile(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if ((!trimmed && !stagedImage) || isGenerating) return;
    
    onSendMessage(trimmed, stagedImage || undefined);
    setText('');
    setStagedImage(null);
    setUploadError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div 
      className={`border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md p-3 md:p-4 transition-colors ${
        isDragging ? 'bg-indigo-950/40 border-indigo-500' : ''
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="max-w-4xl mx-auto space-y-2.5">
        
        {/* Mandate Superpowers Bar & Mode Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Superpowers:
          </span>

          {/* ClaraPredict Toggle */}
          <button
            type="button"
            onClick={() => setPredictMode(!predictMode)}
            title="ClaraPredict: Proactively forecast future trends and user needs"
            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              predictMode 
                ? 'bg-amber-950/80 border-amber-600 text-amber-300 font-semibold shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-amber-400" />
            <span>ClaraPredict {predictMode ? 'ON' : ''}</span>
          </button>

          {/* ClaraEmpathy Toggle */}
          <button
            type="button"
            onClick={() => setEmpathyMode(!empathyMode)}
            title="ClaraEmpathy: Emotional intelligence, tone sensitivity & uplifting motivation"
            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              empathyMode 
                ? 'bg-rose-950/80 border-rose-600 text-rose-300 font-semibold shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Heart className="w-3 h-3 text-rose-400" />
            <span>ClaraEmpathy {empathyMode ? 'ON' : ''}</span>
          </button>

          {/* ClaraOptimize Toggle */}
          <button
            type="button"
            onClick={() => setOptimizeMode(!optimizeMode)}
            title="ClaraOptimize: Fast, point-to-point, zero-filler efficiency engine"
            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              optimizeMode 
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 font-semibold shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>ClaraOptimize {optimizeMode ? 'ON' : ''}</span>
          </button>

          {/* Live Mode Toggle */}
          <button
            type="button"
            onClick={() => setLiveMode(!liveMode)}
            title="Live Mode: Real-time dynamic continuity & persistent multi-turn history memory"
            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              liveMode 
                ? 'bg-indigo-950/80 border-indigo-600 text-indigo-300 font-semibold shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Radio className={`w-3 h-3 ${liveMode ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Live Mode {liveMode ? '🟢 Active' : 'Off'}</span>
          </button>

          <span className="text-slate-700 shrink-0">|</span>

          {/* Quick Prompts */}
          <button
            type="button"
            onClick={() => handleQuickPrompt('ClaraPredict: Proactively forecast my upcoming goals and workflow bottlenecks for this week')}
            className="shrink-0 px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 hover:text-slate-200 border border-slate-800 text-[11px] transition-colors"
          >
            🔮 Forecast Week
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt('ClaraEmpathy: I am feeling overwhelmed with deadlines and need both strong motivation and a structured plan')}
            className="shrink-0 px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 hover:text-slate-200 border border-slate-800 text-[11px] transition-colors"
          >
            💜 Motivation & Plan
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt('ClaraOptimize: Give me a direct point-to-point breakdown of our 10 Master modules with zero fluff')}
            className="shrink-0 px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 hover:text-slate-200 border border-slate-800 text-[11px] transition-colors"
          >
            ⚡ Point-to-Point
          </button>
          {/* Permission / Upload Help Button */}
          <button
            type="button"
            onClick={() => setIsPermissionGuideOpen(true)}
            title="Photo / Camera Permission Guide (Android, iOS & Desktop)"
            className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Permissions Help</span>
          </button>
        </div>

        {/* Upload Error Alert with Direct Step-by-Step Guide Trigger */}
        {uploadError && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs animate-shake">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{uploadError}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsPermissionGuideOpen(true)}
                className="px-2 py-1 rounded bg-rose-900 hover:bg-rose-800 text-rose-100 font-semibold text-[11px] transition-colors"
              >
                Allow Permission Guide →
              </button>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="p-1 text-rose-300 hover:text-white"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Staged Image Thumbnail Card */}
        {stagedImage && (
          <div className="flex items-center justify-between gap-3 bg-slate-900 border border-indigo-700/60 rounded-xl p-2.5 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={stagedImage.previewUrl} 
                alt="Upload preview" 
                className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0" 
              />
              <div className="min-w-0 text-xs">
                <div className="font-semibold text-slate-200 truncate max-w-[240px] sm:max-w-md">
                  📷 {stagedImage.fileName || 'Attached Photo / Screenshot'}
                </div>
                <div className="text-[11px] text-indigo-400">
                  Multimodal Vision ready · OCR text extraction & object analysis enabled
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setStagedImage(null); setUploadError(null); }}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Textarea and Control Bar */}
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-2 focus-within:border-indigo-500/80 transition-all shadow-inner">
          
          {/* Hidden File Input for Gallery / Device Storage */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            className="hidden"
          />

          {/* Hidden File Input for Direct Camera Capture */}
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleCameraInputChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Gallery / Photos Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload from Gallery / Files (Or drag & drop or paste with Cmd+V)"
            disabled={isProcessingImage}
            className={`p-2.5 rounded-xl transition-all focus:outline-none shrink-0 ${
              stagedImage 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Direct Camera Capture Button */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            title="Take Photo with Camera"
            disabled={isProcessingImage}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all focus:outline-none shrink-0"
          >
            <Camera className="w-5 h-5 text-indigo-400" />
          </button>

          {/* Voice Input Toggle Button */}
          <button
            type="button"
            onClick={onToggleVoice}
            title={voiceState === 'listening' ? 'Stop listening' : 'Start microphone input'}
            className={`p-2.5 rounded-xl transition-all focus:outline-none shrink-0 ${
              voiceState === 'listening'
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Prompt Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              isProcessingImage
                ? 'Optimizing and securing photo for Multimodal Vision...'
                : stagedImage
                ? 'Ask anything about this image (e.g., "Read the text", "Find UI bugs", "Explain diagram")...'
                : voiceState === 'listening' 
                ? 'Listening to speech... (or type here)' 
                : 'Ask Clara anything (multimodal vision, predictive analytics, coding, reasoning)...'
            }
            disabled={isGenerating || isProcessingImage}
            className="w-full bg-transparent resize-none outline-none py-2 px-1 text-sm text-slate-100 placeholder:text-slate-500 max-h-[140px] leading-relaxed"
          />

          {/* Send Action Button */}
          <button
            type="submit"
            disabled={(!text.trim() && !stagedImage) || isGenerating || isProcessingImage}
            className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all shrink-0 focus:outline-none shadow-md shadow-indigo-600/20"
            title="Send prompt to Clara Cloud Neural Engine"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span>Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">Enter</kbd> to submit</span>
            <span aria-hidden="true">·</span>
            <span>Gallery & Camera supported</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onSimulateWakeWord()}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              "Hey Clara"
            </button>
          </div>
          <div className="flex items-center gap-2">
            {liveMode && <span className="text-emerald-400 font-medium">● History Memory Synchronized</span>}
            <span>10 Masters Active</span>
          </div>
        </div>

        {/* Media Permission Guide Modal */}
        <MediaPermissionGuideModal
          isOpen={isPermissionGuideOpen}
          onClose={() => setIsPermissionGuideOpen(false)}
          errorMessage={uploadError}
          onSelectSampleImage={(sampleBase64, fileName, mimeType) => {
            setStagedImage({
              base64: sampleBase64,
              mimeType,
              fileName,
              previewUrl: sampleBase64,
            });
            setUploadError(null);
          }}
        />

      </div>
    </div>
  );
};
