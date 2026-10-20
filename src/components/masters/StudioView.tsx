import React, { useState } from 'react';
import { 
  Palette, 
  Image as ImageIcon, 
  Film, 
  Music, 
  Mic2, 
  Sparkles, 
  Play, 
  Download,
  Code
} from 'lucide-react';
import { claraApi } from '../../services/claraApi';
import { soundEngine } from '../../services/soundEffects';

export const StudioView: React.FC = () => {
  const [activeType, setActiveType] = useState<'image' | 'video_storyboard' | 'music_beat' | 'lyric_rap' | 'logo'>('image');
  const [prompt, setPrompt] = useState('A sleek futuristic holographic AI orb glowing with violet neural pathways');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult(null);

    try {
      const res = await claraApi.generateMedia(activeType, prompt);
      setResult(res);
    } catch (err: any) {
      setResult({ error: err.message || 'Media creation failed' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlaySynthesizedBeat = () => {
    soundEngine.playSynthesizedBeat(120);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Overview Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-pink-950 border border-pink-700/60 flex items-center justify-center text-pink-400">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Master 6: ClaraStudio</h2>
              <span className="text-xs text-pink-400 bg-pink-950/80 border border-pink-800 px-2 py-0.5 rounded font-mono">
                Functions 51–65
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multimodal creation studio: Gemini Image API, video storyboards, WebAudio beat synthesizer, lyrics & logos.
            </p>
          </div>
        </div>

        <button
          onClick={handlePlaySynthesizedBeat}
          className="px-3 py-1.5 bg-pink-950/60 border border-pink-800 text-pink-300 hover:bg-pink-900/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Play className="w-3.5 h-3.5 text-pink-400" />
          <span>Test WebAudio Beat Synth</span>
        </button>
      </div>

      {/* Creation Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'image', label: 'Image / Vector Artwork', icon: ImageIcon },
          { id: 'video_storyboard', label: 'Video Storyboard', icon: Film },
          { id: 'music_beat', label: 'Music & Beat Synthesizer', icon: Music },
          { id: 'lyric_rap', label: 'Lyric & Rap Verse', icon: Mic2 },
          { id: 'logo', label: 'Vector Brand Logo', icon: Code },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveType(tab.id as any);
                setResult(null);
                if (tab.id === 'image') setPrompt('A sleek futuristic holographic AI orb glowing with violet neural pathways');
                if (tab.id === 'video_storyboard') setPrompt('Cyberpunk city documentary: An autonomous drone navigating neon skyscraper canyons');
                if (tab.id === 'music_beat') setPrompt('128 BPM energetic synthwave track with punchy 808s and cosmic synth arpeggios');
                if (tab.id === 'lyric_rap') setPrompt('A fast-paced lyrical verse about artificial intelligence and space exploration');
                if (tab.id === 'logo') setPrompt('Minimalist geometric fox head for a cyber intelligence studio');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeType === tab.id
                  ? 'bg-slate-800 text-pink-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Prompt Input Console */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="text-xs space-y-2">
          <label className="text-slate-400 block font-semibold">Creative Prompt Description:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-pink-500 text-sm"
              placeholder="Describe what you want Clara Studio to create..."
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate Studio Media'}</span>
            </button>
          </div>
        </div>

        {/* Results Area */}
        {result && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            {result.error ? (
              <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs">
                {result.error}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image Output */}
                {result.type === 'image' && result.imageUrl && (
                  <div className="flex flex-col items-center">
                    <img
                      src={result.imageUrl}
                      alt={prompt}
                      className="rounded-2xl max-w-lg w-full object-cover border border-slate-800 shadow-xl"
                    />
                    {result.caption && (
                      <p className="mt-2 text-xs text-slate-400">{result.caption}</p>
                    )}
                  </div>
                )}

                {/* Vector Graphic / Logo Output */}
                {(result.type === 'vector_image' || result.type === 'logo') && (
                  <div className="flex flex-col items-center space-y-3">
                    <div 
                      className="rounded-2xl p-4 bg-slate-950 border border-slate-800 max-w-lg w-full flex justify-center items-center shadow-inner"
                      dangerouslySetInnerHTML={{ __html: result.svgCode }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const blob = new Blob([result.svgCode], { type: 'image/svg+xml' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'Clara_Studio_Vector.svg';
                          a.click();
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-pink-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download SVG</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Text / Storyboard / Lyric Output */}
                {(result.type === 'video_storyboard' || result.type === 'music_beat' || result.type === 'lyric_rap') && (
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-mono">
                    {result.content}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
