import { soundEngine } from './soundEffects';
import { claraApi } from './claraApi';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface AudioDeviceInfo {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

class ClaraVoiceEngine {
  private recognition: any = null;
  private isListening = false;
  private wakeWordActive = false;
  private onWakeWordCallback: ((initialCommand?: string) => void) | null = null;
  private onTranscriptCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onCommandCapturedCallback: ((command: string) => void) | null = null;
  private onStateChangeCallback: ((state: VoiceState) => void) | null = null;
  private currentState: VoiceState = 'idle';
  private activeAudio: HTMLAudioElement | null = null;
  private awaitingCommandAfterWake = false;
  private wakeTimeoutTimer: any = null;

  public micPermissionStatus: 'unknown' | 'granted' | 'prompt' | 'denied' | 'unsupported' = 'unknown';
  public availableDevices: AudioDeviceInfo[] = [];
  public selectedInputDeviceId: string = 'default';
  public selectedOutputDeviceId: string = 'default';

  constructor() {
    this.checkPermission();
    this.refreshAudioDevices();
  }

  async checkPermission() {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        this.micPermissionStatus = status.state as any;
        status.onchange = () => {
          this.micPermissionStatus = status.state as any;
        };
      } catch (e) {
        this.micPermissionStatus = 'prompt';
      }
    } else {
      this.micPermissionStatus = 'prompt';
    }
  }

  async refreshAudioDevices(): Promise<AudioDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableDevices = devices
        .filter((d) => d.kind === 'audioinput' || d.kind === 'audiooutput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `${d.kind === 'audioinput' ? 'Microphone' : 'Speaker'} ${index + 1}`,
          kind: d.kind as 'audioinput' | 'audiooutput',
        }));
      return this.availableDevices;
    } catch (e) {
      console.warn('Could not enumerate audio devices:', e);
      return [];
    }
  }

  setState(state: VoiceState) {
    this.currentState = state;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(state);
    }
  }

  getState(): VoiceState {
    return this.currentState;
  }

  onStateChange(cb: (state: VoiceState) => void) {
    this.onStateChangeCallback = cb;
  }

  onWakeWord(cb: (initialCommand?: string) => void) {
    this.onWakeWordCallback = cb;
  }

  onTranscript(cb: (transcript: string, isFinal: boolean) => void) {
    this.onTranscriptCallback = cb;
  }

  onCommandCaptured(cb: (command: string) => void) {
    this.onCommandCapturedCallback = cb;
  }

  // Setup Web Speech recognition with robust wake-word extraction
  private initRecognition(): boolean {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.micPermissionStatus = 'unsupported';
      return false;
    }

    if (this.recognition) return true;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN'; // Indian English / Code-Switching

      this.recognition.onstart = () => {
        this.isListening = true;
        this.setState(this.awaitingCommandAfterWake ? 'listening' : (this.wakeWordActive ? 'idle' : 'listening'));
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i][0];
          if (event.results[i].isFinal) {
            finalTranscript += item.transcript;
          } else {
            interimTranscript += item.transcript;
          }
        }

        const raw = (finalTranscript || interimTranscript).trim();
        const lower = raw.toLowerCase();

        // 1. Check if user just triggered or spoke "Hey Clara"
        const wakeTriggers = ['hey clara', 'ok clara', 'clara', 'हे क्लारा', 'क्लारा'];
        const matchedTrigger = wakeTriggers.find((t) => lower.includes(t));

        if (matchedTrigger) {
          // Extract the command after the trigger word if present
          const triggerIndex = lower.indexOf(matchedTrigger);
          const afterTrigger = raw.slice(triggerIndex + matchedTrigger.length).replace(/^[,\s.:?!]+/, '').trim();

          if (!this.awaitingCommandAfterWake) {
            soundEngine.playWakeChime();
            this.awaitingCommandAfterWake = true;
            this.setState('listening');

            if (this.onWakeWordCallback) {
              this.onWakeWordCallback(afterTrigger);
            }

            // Set a 12-second window to capture the follow-up command
            clearTimeout(this.wakeTimeoutTimer);
            this.wakeTimeoutTimer = setTimeout(() => {
              this.awaitingCommandAfterWake = false;
              if (this.wakeWordActive) {
                this.setState('idle');
              }
            }, 12000);
          }

          // If the user spoke the command in the same breath, dispatch directly to ClaraBrain!
          if (finalTranscript && afterTrigger.length > 2) {
            clearTimeout(this.wakeTimeoutTimer);
            this.awaitingCommandAfterWake = false;
            if (this.onCommandCapturedCallback) {
              this.onCommandCapturedCallback(afterTrigger);
            }
            return;
          }
        } else if (this.awaitingCommandAfterWake && finalTranscript && raw.length > 2) {
          // User spoke the follow-up command after wake-word was primed
          clearTimeout(this.wakeTimeoutTimer);
          this.awaitingCommandAfterWake = false;
          if (this.onCommandCapturedCallback) {
            this.onCommandCapturedCallback(raw);
          }
          return;
        }

        // Send transcript updates for live display
        if (this.onTranscriptCallback && raw) {
          this.onTranscriptCallback(raw, !!finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[ClaraVoiceEngine] Speech recognition event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.micPermissionStatus = 'denied';
        }
        if (!this.wakeWordActive) {
          this.setState('idle');
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // Keep wake-word background daemon alive if enabled
        if (this.wakeWordActive) {
          setTimeout(() => {
            try {
              if (this.wakeWordActive && !this.isListening) {
                this.recognition?.start();
              }
            } catch (e) {
              // Ignore restart collision
            }
          }, 350);
        } else {
          this.setState('idle');
        }
      };

      return true;
    } catch (e) {
      console.warn('[ClaraVoiceEngine] Recognition init exception:', e);
      return false;
    }
  }

  // Toggle continuous wake-word listening ("Hey Clara")
  toggleWakeWord(enable?: boolean): boolean {
    const target = enable !== undefined ? enable : !this.wakeWordActive;
    this.wakeWordActive = target;

    if (target) {
      const initialized = this.initRecognition();
      if (!initialized) return false;
      try {
        if (!this.isListening) {
          this.recognition.start();
        }
        return true;
      } catch (e) {
        console.warn('Wake word start exception:', e);
        return false;
      }
    } else {
      this.awaitingCommandAfterWake = false;
      clearTimeout(this.wakeTimeoutTimer);
      if (this.isListening) {
        try {
          this.recognition.stop();
        } catch (e) {
          // ignore
        }
      }
      return false;
    }
  }

  isWakeWordEnabled(): boolean {
    return this.wakeWordActive;
  }

  // Single-turn voice input
  startListening(): boolean {
    const initialized = this.initRecognition();
    if (!initialized) return false;

    soundEngine.playWakeChime();
    this.awaitingCommandAfterWake = true;
    this.setState('listening');

    try {
      if (!this.isListening) {
        this.recognition.start();
      }
      return true;
    } catch (e) {
      console.warn('Start listening error:', e);
      return false;
    }
  }

  stopListening() {
    this.awaitingCommandAfterWake = false;
    clearTimeout(this.wakeTimeoutTimer);
    this.setState('idle');
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }

  // Simulate Wake-Word trigger without tab navigation
  simulateWakeWord(simulatedPrompt?: string) {
    soundEngine.playWakeChime();
    this.awaitingCommandAfterWake = true;
    this.setState('listening');

    if (simulatedPrompt && simulatedPrompt.trim()) {
      // Direct pass-through to ClaraBrain
      if (this.onCommandCapturedCallback) {
        this.onCommandCapturedCallback(simulatedPrompt.trim());
      }
    } else {
      if (this.onWakeWordCallback) {
        this.onWakeWordCallback();
      }
    }
  }

  // Studio-grade speech playback via Gemini TTS with Web Speech fallback
  async speak(text: string, voiceName = 'Kore'): Promise<void> {
    this.stopSpeaking();
    this.setState('speaking');

    // Clean markdown and trace markers before speaking
    const cleanText = text
      .replace(/\[THINKING_TRACE\][\s\S]*?\[REASONING\]/g, '')
      .replace(/\[REASONING\][\s\S]*?\[OUTPUT\]/g, '')
      .replace(/\[OUTPUT\]/g, '')
      .replace(/\[ACTION:[\s\S]*?\]/g, '')
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*_`~>]/g, '')
      .trim();

    if (!cleanText) {
      this.setState('idle');
      return;
    }

    try {
      // 1. Server-side Gemini TTS
      const result = await claraApi.generateSpeech(cleanText.slice(0, 500), voiceName);
      if (result.success && result.audioData) {
        const audio = new Audio(result.audioData);
        this.activeAudio = audio;
        audio.onended = () => {
          this.setState('idle');
          this.activeAudio = null;
        };
        audio.onerror = () => {
          this.fallbackBrowserSpeech(cleanText);
        };
        await audio.play();
        return;
      }
    } catch (e) {
      // Smooth fallback to high-quality native browser speech
    }

    // 2. Fallback to browser SpeechSynthesis
    this.fallbackBrowserSpeech(cleanText);
  }

  private fallbackBrowserSpeech(cleanText: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 450));
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india') || v.name.includes('Natural')
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onend = () => {
        this.setState('idle');
      };
      utterance.onerror = () => {
        this.setState('idle');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      this.setState('idle');
    }
  }

  stopSpeaking() {
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio = null;
      } catch (e) {
        // ignore
      }
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.setState('idle');
  }
}

export const voiceEngine = new ClaraVoiceEngine();
