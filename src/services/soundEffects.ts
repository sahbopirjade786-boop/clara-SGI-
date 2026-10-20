// Web Audio API Synthesizer for Clara Voice, Focus Mode, and ClaraStudio
class ClaraSoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private isFocusPlaying = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play pleasant chime on "Hey Clara" wake word or command activation
  playWakeChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22); // D6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch (e) {
      console.warn('Audio chime failed:', e);
    }
  }

  // Play alarm sound
  playAlarmChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(784, now + i * 0.25); // G5
        osc.frequency.setValueAtTime(1046.5, now + i * 0.25 + 0.1); // C6

        gain.gain.setValueAtTime(0.2, now + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.25);
        osc.stop(now + i * 0.25 + 0.22);
      }
    } catch (e) {
      console.warn('Alarm chime failed:', e);
    }
  }

  // Synthesize ambient sound for Master 4: Focus Mode
  startFocusSound(type: 'rain' | 'whitenoise' | 'space' | 'lofi') {
    this.stopFocusSound();
    try {
      const ctx = this.getContext();
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
      } else if (type === 'space') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(120, ctx.currentTime);
        filter.Q.setValueAtTime(3.0, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
      } else if (type === 'lofi') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
      } else {
        // whitenoise
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
      }

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      this.ambientSource = whiteNoise;
      this.isFocusPlaying = true;
    } catch (e) {
      console.warn('Focus ambient audio failed:', e);
    }
  }

  stopFocusSound() {
    if (this.ambientSource) {
      try {
        (this.ambientSource as AudioBufferSourceNode).stop();
        this.ambientSource.disconnect();
      } catch (e) {
        // ignore
      }
      this.ambientSource = null;
    }
    this.isFocusPlaying = false;
  }

  isFocusModeActive() {
    return this.isFocusPlaying;
  }

  // Play a generated musical sequence for ClaraStudio
  playSynthesizedBeat(bpm = 110) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const beatInterval = 60 / bpm;
      const notes = [220, 261.63, 293.66, 329.63, 392, 440, 523.25];

      for (let i = 0; i < 8; i++) {
        const time = now + i * (beatInterval / 2);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Alternate notes and drum pulses
        if (i % 2 === 0) {
          // Kick pulse
          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, time);
          osc.frequency.exponentialRampToValueAtTime(35, time + 0.15);
          gain.gain.setValueAtTime(0.35, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
        } else {
          // Synth arpeggio
          osc.type = 'triangle';
          const noteFreq = notes[i % notes.length];
          osc.frequency.setValueAtTime(noteFreq, time);
          gain.gain.setValueAtTime(0.15, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.28);
      }
    } catch (e) {
      console.warn('Beat synthesizer failed:', e);
    }
  }
}

export const soundEngine = new ClaraSoundEngine();
