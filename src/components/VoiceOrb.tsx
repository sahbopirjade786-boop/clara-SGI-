import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Loader2, Radio } from 'lucide-react';
import { VoiceState } from '../services/voiceService';

interface VoiceOrbProps {
  voiceState: VoiceState;
  onToggleListening: () => void;
  onSimulateWakeWord: (prompt?: string) => void;
  transcript?: string;
  isWakeWordEnabled: boolean;
  permissionStatus: string;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  voiceState,
  onToggleListening,
  onSimulateWakeWord,
  transcript,
  isWakeWordEnabled,
  permissionStatus,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Base radius and dynamic amplitude based on state
      let baseRadius = 55;
      let amplitude = 6;
      let speed = 0.03;
      let color1 = 'rgba(99, 102, 241, 0.8)'; // Indigo
      let color2 = 'rgba(168, 85, 247, 0.8)'; // Purple
      let glowColor = 'rgba(129, 140, 248, 0.3)';

      if (voiceState === 'listening') {
        baseRadius = 65;
        amplitude = 18;
        speed = 0.08;
        color1 = 'rgba(16, 185, 129, 0.9)'; // Emerald
        color2 = 'rgba(52, 211, 153, 0.8)';
        glowColor = 'rgba(16, 185, 129, 0.4)';
      } else if (voiceState === 'thinking') {
        baseRadius = 60;
        amplitude = 10;
        speed = 0.12;
        color1 = 'rgba(236, 72, 153, 0.9)'; // Pink
        color2 = 'rgba(139, 92, 246, 0.9)'; // Violet
        glowColor = 'rgba(236, 72, 153, 0.4)';
      } else if (voiceState === 'speaking') {
        baseRadius = 70;
        amplitude = 22;
        speed = 0.07;
        color1 = 'rgba(56, 189, 248, 0.9)'; // Sky
        color2 = 'rgba(99, 102, 241, 0.9)'; // Indigo
        glowColor = 'rgba(56, 189, 248, 0.4)';
      }

      // Outer ethereal glow ring
      const gradientGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.5,
        centerX,
        centerY,
        baseRadius * 1.8
      );
      gradientGlow.addColorStop(0, glowColor);
      gradientGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradientGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Render 3 undulating harmonic waves
      for (let waveIndex = 0; waveIndex < 3; waveIndex++) {
        ctx.beginPath();
        const waveOffset = (waveIndex * Math.PI) / 3;
        const currentAmp = amplitude * (1 - waveIndex * 0.2);

        for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
          const distortion =
            Math.sin(angle * 5 + phase * 2 + waveOffset) * currentAmp +
            Math.cos(angle * 3 - phase) * (currentAmp * 0.5);
          const r = baseRadius + distortion;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        const grad = ctx.createLinearGradient(
          centerX - baseRadius,
          centerY - baseRadius,
          centerX + baseRadius,
          centerY + baseRadius
        );
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        if (waveIndex === 0) {
          ctx.fillStyle = glowColor;
          ctx.fill();
        }
      }

      phase += speed;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [voiceState]);

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 relative">
      {/* Voice Orb Canvas with interactive button */}
      <div className="relative flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="pointer-events-none"
        />

        {/* Central clickable control node */}
        <button
          onClick={onToggleListening}
          className="absolute z-10 w-20 h-20 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center text-white hover:scale-105 active:scale-95 transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title={voiceState === 'listening' ? 'Click to stop listening' : 'Click to speak to Clara'}
        >
          {voiceState === 'listening' ? (
            <div className="flex flex-col items-center">
              <Mic className="w-7 h-7 text-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-300 font-semibold tracking-wide mt-0.5">Listening</span>
            </div>
          ) : voiceState === 'thinking' ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-7 h-7 text-pink-400 animate-spin" />
              <span className="text-[10px] text-pink-300 font-semibold tracking-wide mt-0.5">Thinking</span>
            </div>
          ) : voiceState === 'speaking' ? (
            <div className="flex flex-col items-center">
              <Volume2 className="w-7 h-7 text-sky-400 animate-bounce" />
              <span className="text-[10px] text-sky-300 font-semibold tracking-wide mt-0.5">Speaking</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Mic className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              <span className="text-[10px] text-slate-300 font-medium mt-0.5">Tap to Talk</span>
            </div>
          )}
        </button>
      </div>

      {/* Transcript or Status Callout */}
      <div className="mt-2 text-center max-w-md w-full">
        {transcript ? (
          <p className="text-sm text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 rounded-lg px-3 py-1.5 inline-block animate-fade-in">
            "{transcript}"
          </p>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            {isWakeWordEnabled ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Listening for "Hey Clara"
              </span>
            ) : (
              <span>Tap the Orb or use the console below to speak</span>
            )}
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onSimulateWakeWord()}
              className="text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Test Wake Trigger
            </button>
          </div>
        )}

        {/* Permission status warning if restricted */}
        {permissionStatus === 'denied' && (
          <p className="mt-2 text-xs text-amber-400 bg-amber-950/50 border border-amber-800/60 rounded-md px-3 py-1.5">
            Microphone permission was blocked. You can still type prompts or use the "Test Wake Trigger" button.
          </p>
        )}
      </div>
    </div>
  );
};
