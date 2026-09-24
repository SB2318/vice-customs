import React, { useEffect, useState } from 'react';
import { VehicleModel } from '../../types';

interface VehicleTransitionLoaderProps {
  isLoading: boolean;
  vehicle: VehicleModel;
}

const VEHICLE_META: Record<VehicleModel, { brand: string; model: string; spec: string; color: string }> = {
  infernus:   { brand: 'PEGASSI',   model: 'INFERNUS',        spec: 'V12 · 6.5L · MID-ENGINE',        color: '#ff007f' },
  cheetah:    { brand: 'GROTTI',    model: 'CHEETAH CLASSIC', spec: 'V8 · 5.0L · SIDE-STRAKE COUPE',  color: '#00f0ff' },
  banshee:    { brand: 'BRAVADO',   model: 'BANSHEE GTS',     spec: 'V10 · 6.2L · OPEN ROADSTER',     color: '#ff007f' },
  comet:      { brand: 'PFISTER',   model: 'COMET GT TURBO',  spec: 'FLAT-6 · 3.6L · WIDEBODY RWD',   color: '#ffe600' },
  dominator:  { brand: 'VAPID',     model: 'DOMINATOR GTX',   spec: 'V8 · SUPERCHARGED · MUSCLE',     color: '#ff007f' },
  dirtbike:   { brand: 'ÜBERMACHT', model: 'STREET DEMON',   spec: '450CC · SINGLE · SUPERMOTO',     color: '#00f0ff' },
  train:      { brand: 'TRANSIT',   model: 'BULLET TRAIN',   spec: 'ELECTRIC · 250 MPH · EXPRESS LOCOMOTIVE', color: '#00f0ff' },
  boat:       { brand: 'PEGASSI',   model: 'POWERBOAT',      spec: 'TWIN V8 · OFFSHORE · MARINE VESSEL',       color: '#10b981' },
  helicopter: { brand: 'BUZZARD',   model: 'STEALTH HELO',   spec: 'TURBINE · TACTICAL · NIGHTHAWK',          color: '#a855f7' },
};

export const VehicleTransitionLoader: React.FC<VehicleTransitionLoaderProps> = ({ isLoading, vehicle }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      const hide = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(hide);
    }
    setVisible(true);
    setProgress(0);
    const t1 = setTimeout(() => setProgress(40),  80);
    const t2 = setTimeout(() => setProgress(72),  220);
    const t3 = setTimeout(() => setProgress(100), 480);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isLoading]);

  if (!visible && !isLoading) return null;

  const meta = VEHICLE_META[vehicle] ?? { brand: 'VICE', model: vehicle.toUpperCase(), spec: 'CUSTOM BUILD', color: '#ff007f' };

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 60%, rgba(6,6,20,0.97) 0%, rgba(0,0,0,0.99) 100%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.18s ease',
      }}
    >
      {/* Subtle scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,240,255,0.025) 3px, rgba(0,240,255,0.025) 4px)',
        }}
      />

      {/* Corner brackets — top-left */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 opacity-30" style={{ borderColor: meta.color }} />
      {/* Corner brackets — bottom-right */}
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 opacity-30" style={{ borderColor: meta.color }} />

      {/* Brand label */}
      <p
        className="text-[11px] tracking-[0.35em] font-mono uppercase mb-3 opacity-50"
        style={{ color: meta.color }}
      >
        {meta.brand} &nbsp;/&nbsp; VICE CUSTOMS GARAGE
      </p>

      {/* HERO — giant italic model name */}
      <h1
        className="font-black italic leading-none text-center select-none"
        style={{
          fontFamily: 'Impact, "Arial Narrow", sans-serif',
          fontSize: 'clamp(3rem, 10vw, 7.5rem)',
          letterSpacing: '-0.02em',
          color: '#fff',
          textShadow: `0 0 60px ${meta.color}88, 0 0 120px ${meta.color}33`,
        }}
      >
        {meta.model}
      </h1>

      {/* Spec line */}
      <p className="mt-4 text-[12px] tracking-[0.22em] font-mono text-gray-500 uppercase">
        {meta.spec}
      </p>

      {/* Progress stripe — full width, bottom anchored */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
        <div
          className="h-full transition-all ease-out"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${meta.color}00, ${meta.color})`,
            transitionDuration: progress === 40 ? '140ms' : progress === 72 ? '280ms' : '220ms',
            boxShadow: `0 0 12px ${meta.color}`,
          }}
        />
      </div>

      {/* Loading label */}
      <p
        className="absolute bottom-5 right-7 text-[10px] tracking-[0.2em] font-mono uppercase"
        style={{ color: meta.color, opacity: 0.5 }}
      >
        LOADING&nbsp;&nbsp;{progress}%
      </p>
    </div>
  );
};
