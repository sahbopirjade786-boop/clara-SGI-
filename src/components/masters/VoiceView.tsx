import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Radio, 
  Bluetooth, 
  Headphones, 
  ShieldAlert, 
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { voiceEngine, AudioDeviceInfo } from '../../services/voiceService';
import { soundEngine } from '../../services/soundEffects';
import { claraApi } from '../../services/claraApi';

interface VoiceViewProps {
  isWakeWordEnabled: boolean;
  toggleWakeWord: () => void;
  onSimulateWakeWord: (prompt?: string) => void;
}

export const VoiceView: React.FC<VoiceViewProps> = ({
  isWakeWordEnabled,
  toggleWakeWord,
  onSimulateWakeWord,
}) => {
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [testText, setTestText] = useState('Hello! I am Clara, your cloud neural assistant. Voice engine and wake-word listeners are operational.');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRoute, setAudioRoute] = useState<'default' | 'bluetooth' | 'headset'>('default');
  const [devices, setDevices] = useState<AudioDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState('default');
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [neuralResponse, setNeuralResponse] = useState<any | null>(null);
  const [isProcessingNeural, setIsProcessingNeural] = useState(false);

  useEffect(() => {
    voiceEngine.refreshAudioDevices().then((devs) => {
      setDevices(devs);
    });
  }, []);

  const handleTestTTS = async () => {
    setIsPlaying(true);
    await voiceEngine.speak(testText, selectedVoice);
    setIsPlaying(false);
  };

  const handleStartLiveVoiceTest = () => {
    setIsLiveListening(true);
    setLiveTranscript('');
    setNeuralResponse(null);

    voiceEngine.startListening();
    voiceEngine.onTranscript((text, isFinal) => {
      setLiveTranscript(text);
      if (isFinal && text.trim().length > 2) {
        handleProcessLiveCommand(text.trim());
      }
    });
  };

  const handleProcessLiveCommand = async (cmd: string) => {
    setIsProcessingNeural(true);
    setIsLiveListening(false);
    voiceEngine.stopListening();

    try {
      const res = await claraApi.reason({
        prompt: cmd,
        persona: 'mentor',
        language: 'en',
      });
      setNeuralResponse(res);
      voiceEngine.speak(res.output || res.rawText, selectedVoice);
    } catch (e: any) {
      setNeuralResponse({ error: e.message || 'Voice neural processing failed' });
    } finally {
      setIsProcessingNeural(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Overview Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-700/60 flex items-center justify-center text-purple-400">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Master 2: ClaraVoice</h2>
              <span className="text-xs text-purple-400 bg-purple-950/80 border border-purple-800 px-2 py-0.5 rounded font-mono">
                Functions 16–30
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous "Hey Clara" wake-word detection, studio-grade cloud TTS & duplex speech pipeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleWakeWord}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              isWakeWordEnabled
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isWakeWordEnabled ? (
              <>
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Wake-Word Active ("Hey Clara")</span>
              </>
            ) : (
              <>
                <MicOff className="w-4 h-4 text-slate-400" />
                <span>Enable "Hey Clara" Wake-Word</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Wake-Word & Permission Shield */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Wake-Word & Audio Listener */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Wake-Word & Real-Time Listener</span>
            </div>
            <button
              onClick={() => onSimulateWakeWord('What is the current time and cloud operational status?')}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Test "Hey Clara" Command
            </button>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Listens continuously for <strong>"Hey Clara"</strong> or <strong>"Clara"</strong>, captures spoken commands, and routes directly to ClaraBrain without interrupting your current tab.
          </p>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Microphone Permission:</span>
              <span className="font-mono text-emerald-400 font-medium">Ready / Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Web Speech STT:</span>
              <span className="font-mono text-indigo-400">en-IN (Indian English / Code-Switching)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Wake Word Trigger Phrase:</span>
              <span className="font-mono text-purple-300 font-semibold">"Hey Clara"</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => soundEngine.playWakeChime()}
              className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Chime Tone</span>
            </button>
            <button
              onClick={handleStartLiveVoiceTest}
              disabled={isLiveListening}
              className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isLiveListening ? 'Listening...' : 'Live Voice Test'}</span>
            </button>
          </div>

          {liveTranscript && (
            <div className="p-2.5 bg-slate-950 border border-indigo-900/60 rounded-xl text-xs text-indigo-300">
              <span className="text-slate-400 block text-[10px]">Heard:</span>
              "{liveTranscript}"
            </div>
          )}

          {isProcessingNeural && (
            <div className="text-xs text-purple-300 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span>ClaraBrain is processing voice command...</span>
            </div>
          )}

          {neuralResponse && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <span className="text-emerald-400 font-semibold block">Clara Spoken Output:</span>
              <div className="text-slate-200 whitespace-pre-wrap">{neuralResponse.output || neuralResponse.rawText}</div>
            </div>
          )}
        </div>

        {/* Studio-Grade TTS Voice Persona & Bluetooth */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Volume2 className="w-4 h-4 text-purple-400" />
            <span>Studio-Grade Cloud TTS Voices</span>
          </div>
          <p className="text-xs text-slate-400">
            Synthesized via <code className="text-purple-300">gemini-3.8-flash-lite-tts</code> with clear, natural intonation.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            {[
              { id: 'Kore', name: 'Kore (Default)', tone: 'Warm, articulate, balanced' },
              { id: 'Puck', name: 'Puck', tone: 'Energetic, modern, engaging' },
              { id: 'Zephyr', name: 'Zephyr', tone: 'Calm, gentle, soothing' },
              { id: 'Fenrir', name: 'Fenrir', tone: 'Deep, commanding, authoritative' },
            ].map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  selectedVoice === voice.id
                    ? 'bg-purple-950/80 border-purple-600 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-slate-200">{voice.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{voice.tone}</div>
              </button>
            ))}
          </div>

          {/* Audio Route Selector (Bluetooth & Headsets) */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span>Wireless Audio Route:</span>
              <div className="flex gap-1.5">
                {[
                  { id: 'default', label: 'Default', icon: Volume2 },
                  { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
                  { id: 'headset', label: 'Headset', icon: Headphones },
                ].map((route) => {
                  const Icon = route.icon;
                  return (
                    <button
                      key={route.id}
                      onClick={() => setAudioRoute(route.id as any)}
                      className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] ${
                        audioRoute === route.id
                          ? 'bg-slate-800 text-indigo-300 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{route.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {devices.length > 0 && (
              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <span>Hardware Mic:</span>
                <select
                  value={selectedMic}
                  onChange={(e) => setSelectedMic(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[11px] focus:outline-none"
                >
                  <option value="default">System Default</option>
                  {devices.map((d, i) => (
                    <option key={i} value={d.deviceId}>{d.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Live Voice Audition Console */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-200">
            Live Voice Audition Console
          </div>
          <span className="text-xs text-slate-400">Active Voice: {selectedVoice}</span>
        </div>

        <div className="space-y-2">
          <textarea
            rows={2}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            placeholder="Enter text to speak aloud with Clara's voice..."
          />
          <div className="flex justify-end">
            <button
              onClick={handleTestTTS}
              disabled={isPlaying || !testText.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              {isPlaying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Voice...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Speak via ClaraVoice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
