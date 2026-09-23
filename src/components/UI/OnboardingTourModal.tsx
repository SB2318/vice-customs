import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Keyboard } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShortcuts?: () => void;
  onOpenExportModal?: () => void;
}

interface TourStep {
  eyebrow: string;      // small label above the headline
  headline: string;     // big statement — 2-4 words max
  body: string;         // one punchy sentence
  tip: string;          // brief pro tip
  accent: string;       // tailwind color class for the accent
  glyph: string;        // single large emoji / icon
}

const STEPS: TourStep[] = [
  {
    eyebrow:  'STEP 01 — GARAGE',
    headline: 'YOUR CITY.\nYOUR RIDE.',
    body:     'Pick any chassis — Infernus, Cheetah, Banshee, Comet, Dominator, or Dirtbike — and take it from stock to showstopper.',
    tip:      'Switch vehicles from the top header bar.',
    accent:   '#ff007f',
    glyph:    '🏎',
  },
  {
    eyebrow:  'STEP 02 — 2D CANVAS',
    headline: 'PAINT\nBY PIXEL.',
    body:     'Drag decals onto a live 1024 × 1024 UV blueprint. Two-finger pinch to scale and rotate. Every stroke wraps to the 3D model in real time.',
    tip:      'Hit G to toggle UV wireframe panel guides.',
    accent:   '#00f0ff',
    glyph:    '🎨',
  },
  {
    eyebrow:  'STEP 03 — 3D STUDIO',
    headline: '60 FPS\nNEON HDRI.',
    body:     'Eight cinematic camera presets — orbit, spin, close-up on the rims. Press keys 1–8 to jump between them instantly.',
    tip:      'Drag the center splitter to resize the 2D/3D panels.',
    accent:   '#ffe600',
    glyph:    '💡',
  },
  {
    eyebrow:  'STEP 04 — ATMOSPHERE',
    headline: 'WET STREETS,\nDRIP PAINT.',
    body:     'Toggle Rain Mode for ultra-gloss clearcoat reflections and particle splashes. Hit REV for engine roar and exhaust backfire flames.',
    tip:      'Press U to toggle neon underglow from anywhere.',
    accent:   '#00f0ff',
    glyph:    '🌧',
  },
  {
    eyebrow:  'STEP 05 — EXPORT',
    headline: 'BUILT.\nNOW FLEX.',
    body:     'Export high-res 2D textures, 3D screenshots, or back up your full livery as a JSON file. Local garage slots keep 5 builds saved.',
    tip:      'Press ? anytime to see all keyboard shortcuts.',
    accent:   '#ff007f',
    glyph:    '💾',
  },
];

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  onOpenShortcuts,
  onOpenExportModal,
}) => {
  const [idx, setIdx] = useState(0);
  const [animDir, setAnimDir] = useState<'in' | 'out'>('in');
  const [stepVisible, setStepVisible] = useState(true);

  useEffect(() => { if (isOpen) { setIdx(0); setStepVisible(true); } }, [isOpen]);

  if (!isOpen) return null;

  const step = STEPS[idx];
  const isLast = idx === STEPS.length - 1;

  const go = (next: number) => {
    audioEngine.playClickSFX?.();
    setStepVisible(false);
    setTimeout(() => {
      setIdx(Math.max(0, Math.min(STEPS.length - 1, next)));
      setStepVisible(true);
    }, 160);
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}>
      {/*
        ┌─────────────────────────────────────────┐
        │   CLOSE            eyebrow              │
        │                                         │
        │      BIG HEADLINE   •   GLYPH           │
        │                                         │
        │   body copy                             │
        │   ── tip ──                             │
        │                                         │
        │   dots ··· ·    BACK      NEXT ▶        │
        └─────────────────────────────────────────┘
      */}
      <div
        className="relative w-full max-w-[480px] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(160deg, #0f0f1c 0%, #080812 100%)',
          border: `1px solid ${step.accent}33`,
          boxShadow: `0 0 0 1px ${step.accent}18, 0 32px 80px rgba(0,0,0,0.8), 0 0 60px ${step.accent}18`,
          transition: 'border-color 0.4s, box-shadow 0.4s',
        }}
      >
        {/* Top accent bar */}
        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${step.accent}, transparent)` }} />

        {/* Padding wrapper */}
        <div className="px-7 pt-6 pb-7 flex flex-col gap-5">

          {/* Row 1: eyebrow + close */}
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] tracking-[0.3em] font-mono uppercase"
              style={{ color: step.accent, opacity: 0.7, transition: 'color 0.3s' }}
            >
              {step.eyebrow}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:text-white hover:bg-white/8 transition-all"
            >
              <X size={14} />
            </button>
          </div>

          {/* Row 2: headline + glyph side-by-side */}
          <div
            className="flex items-center justify-between gap-4"
            style={{ opacity: stepVisible ? 1 : 0, transform: stepVisible ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.2s, transform 0.2s' }}
          >
            <h2
              className="font-black leading-[0.92] whitespace-pre-line"
              style={{
                fontFamily: 'Impact, "Arial Narrow", sans-serif',
                fontSize: 'clamp(2rem, 6vw, 2.75rem)',
                letterSpacing: '-0.01em',
                color: '#fff',
                textShadow: `0 0 40px ${step.accent}55`,
              }}
            >
              {step.headline}
            </h2>

            <div
              className="shrink-0 flex items-center justify-center rounded-2xl"
              style={{
                width: 72, height: 72,
                background: `${step.accent}12`,
                border: `1px solid ${step.accent}30`,
                fontSize: 32,
                filter: `drop-shadow(0 0 12px ${step.accent}66)`,
                transition: 'background 0.3s, border-color 0.3s',
              }}
            >
              {step.glyph}
            </div>
          </div>

          {/* Row 3: body copy */}
          <p
            className="text-[13.5px] text-gray-300 leading-relaxed"
            style={{ opacity: stepVisible ? 1 : 0, transition: 'opacity 0.25s 0.05s' }}
          >
            {step.body}
          </p>

          {/* Row 4: tip chip */}
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[11.5px] font-mono"
            style={{
              background: `${step.accent}0d`,
              border: `1px solid ${step.accent}22`,
              color: step.accent,
              opacity: stepVisible ? 1 : 0,
              transition: 'opacity 0.3s 0.1s, background 0.3s',
            }}
          >
            <span className="opacity-60 text-[10px] tracking-widest uppercase shrink-0">TIP</span>
            <span className="text-gray-400">{step.tip}</span>
          </div>

          {/* Row 5: nav */}
          <div className="flex items-center justify-between pt-1">
            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width:  i === idx ? 20 : 6,
                    height: 6,
                    background: i === idx ? step.accent : '#333',
                    boxShadow: i === idx ? `0 0 8px ${step.accent}` : 'none',
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {onOpenShortcuts && (
                <button
                  onClick={() => { onClose(); onOpenShortcuts(); }}
                  className="hidden sm:flex items-center gap-1 text-[10.5px] font-mono text-gray-600 hover:text-gray-400 transition-colors mr-1"
                >
                  <Keyboard size={11} />
                  shortcuts
                </button>
              )}

              {idx > 0 && (
                <button
                  onClick={() => go(idx - 1)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-[12px] font-mono text-gray-500 hover:text-white border border-white/8 hover:border-white/20 transition-all"
                >
                  <ChevronLeft size={13} />
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  if (isLast && onOpenExportModal) {
                    onOpenExportModal();
                  } else if (!isLast) {
                    go(idx + 1);
                  }
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[12px] font-mono font-bold text-black transition-all hover:scale-[1.03] active:scale-[0.97]"
                style={{
                  background: step.accent,
                  boxShadow: `0 0 20px ${step.accent}55`,
                  transition: 'background 0.3s, box-shadow 0.3s',
                }}
              >
                {isLast ? 'OPEN EXPORT & PRINT 💾' : 'NEXT'}
                {!isLast && <ChevronRight size={13} />}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom step fraction */}
        <div
          className="px-7 pb-4 text-[9.5px] font-mono tracking-[0.25em] opacity-25"
          style={{ color: step.accent }}
        >
          {String(idx + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
};
