import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audioEngine';
import {
  X, ChevronRight, ChevronLeft,
  Car, Bike, Train, Ship, Navigation, Trophy,
  FileSearch, Edit3, Zap, ShieldAlert, AlertTriangle,
  Play, Target, Layers, CheckCircle, Clock, Crosshair,
  Radio, MapPin, Lock, Unlock, Eye, EyeOff
} from 'lucide-react';

interface HeistGameTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartHeist?: () => void;
}

interface TourPhase {
  id: string;
  phase: string;           // Phase number label e.g. "PHASE 01"
  title: string;           // Bold headline
  subtitle: string;        // Sub context
  story: string;           // Narrative from the "GTA mission briefer"
  mechanic: string;        // What the player does in this phase
  icon: React.ReactNode;
  color: string;           // Accent hex
  steps: string[];         // Numbered bullet steps player must follow
  warning?: string;        // Danger condition / game over trigger
  reward?: string;         // What player earns/unlocks on success
  visual: React.ReactNode; // Inline visual diagram
}

//  GTA MISSION BRIEFER VISUAL DIAGRAMS

const GaragePickVisual = () => (
  <div className="relative w-full h-full flex flex-col items-center justify-center gap-3 p-4">
    <div className="grid grid-cols-3 gap-2 w-full">
      {[
        { label: 'MUSCLE SEDAN', color: '#ff007f', icon: <Car size={20}/>, tag: 'HEAT 2' },
        { label: 'SUPERBIKE', color: '#facc15', icon: <Bike size={20}/>, tag: 'HEAT 3' },
        { label: 'BULLET TRAIN', color: '#00f0ff', icon: <Train size={20}/>, tag: 'HEAT 4' },
        { label: 'POWERBOAT', color: '#10b981', icon: <Ship size={20}/>, tag: 'HEAT 4' },
        { label: 'STEALTH HELO', color: '#a855f7', icon: <Navigation size={20}/>, tag: 'HEAT 5' },
        { label: 'GRAND FINALE', color: '#f59e0b', icon: <Trophy size={20}/>, tag: 'INSANE' },
      ].map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-lg border text-center"
          style={{ borderColor: v.color + '55', background: v.color + '0d' }}>
          <span style={{ color: v.color }}>{v.icon}</span>
          <span className="text-[9px] font-mono font-bold text-white leading-tight">{v.label}</span>
          <span className="text-[8px] font-mono px-1 rounded" style={{ background: v.color + '33', color: v.color }}>{v.tag}</span>
        </div>
      ))}
    </div>
    <div className="w-full p-2 rounded-lg border border-pink-500/40 bg-pink-950/20 text-[10px] font-mono text-pink-300 text-center">
      Each vehicle = Different editing challenge
    </div>
  </div>
);

const EvidenceEditVisual = () => (
  <div className="relative w-full h-full flex flex-col items-center justify-center gap-3 p-4">
    <div className="w-full rounded-lg border-2 border-dashed border-cyan-500/60 bg-slate-950 p-3 relative">
      <div className="text-[9px] font-mono text-cyan-400 mb-2 flex items-center gap-1">
        <Eye size={10}/> SURVEILLANCE PHOTO — EVIDENCE FILE
      </div>
      <div className="w-full h-24 bg-slate-900 rounded border border-slate-700 flex items-center justify-center relative">
        <div className="text-[32px] font-black text-red-500 font-mono opacity-80">VC-4821</div>
        <div className="absolute top-1 left-1 text-[8px] text-pink-400 font-mono">CAM 047 - DOWNTOWN</div>
        {/* Red target overlay boxes */}
        <div className="absolute border-2 border-red-500 rounded w-20 h-8 bottom-2 left-1/2 -translate-x-1/2 animate-pulse"/>
        <div className="absolute top-2 right-2 text-[8px] text-red-400 font-mono bg-red-950/80 px-1 rounded">TARGET REGION</div>
      </div>
      <div className="flex gap-2 mt-2">
        <div className="flex-1 h-6 rounded bg-pink-600/30 border border-pink-500/50 flex items-center justify-center text-[8px] font-mono text-pink-300">
          PAINT OVER
        </div>
        <div className="flex-1 h-6 rounded bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-[8px] font-mono text-cyan-300">
          TEXT EDIT
        </div>
        <div className="flex-1 h-6 rounded bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-[8px] font-mono text-purple-300">
          LAYER ADD
        </div>
      </div>
    </div>
    <div className="w-full flex items-center justify-between text-[9px] font-mono">
      <span className="text-red-400">PLATE: VC-4821 — FLAGGED</span>
      <span className="text-green-400">EDIT → CLEAR DATABASE</span>
    </div>
  </div>
);

const TelemetryVisual = () => {
  const bars = [
    { label: 'COLOR MATCH', pct: 82, color: '#ef4444' },
    { label: 'PLATE MATCH', pct: 71, color: '#f97316' },
    { label: 'DAMAGE MATCH', pct: 55, color: '#facc15' },
    { label: 'OVERALL HEAT', pct: 69, color: '#ff007f' },
  ];
  return (
    <div className="w-full h-full flex flex-col gap-3 p-4">
      <div className="text-[9px] font-mono text-green-400 mb-1 flex items-center gap-1">
        <Crosshair size={10}/> POLICE SURVEILLANCE AI — MATCH TELEMETRY
      </div>
      {bars.map((b) => (
        <div key={b.label} className="flex flex-col gap-1">
          <div className="flex justify-between text-[9px] font-mono">
            <span style={{ color: b.color }}>{b.label}</span>
            <span className="text-white font-bold">{b.pct}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 relative overflow-hidden">
            <div className="absolute left-0 top-0 h-full rounded-full transition-all"
              style={{ width: `${b.pct}%`, background: b.color, boxShadow: `0 0 8px ${b.color}66` }}/>
            <div className="absolute right-0 top-0 h-full w-px bg-green-400"/>
          </div>
        </div>
      ))}
      <div className="text-[9px] font-mono text-yellow-400 text-center mt-1">
        Edit until all bars drop below 30%
      </div>
    </div>
  );
};

const PursuitVisual = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
    <div className="relative w-full h-32 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Road */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-slate-800">
        <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-yellow-400/40"/>
      </div>
      {/* Player car */}
      <div className="absolute bottom-4 left-1/3 -translate-x-1/2 text-2xl">🚗</div>
      {/* Police cars */}
      <div className="absolute bottom-4 right-1/4 text-2xl opacity-80 animate-pulse">🚔</div>
      <div className="absolute bottom-4 right-1/3 text-xl opacity-60 animate-pulse">🚔</div>
      {/* Heat meter */}
      <div className="absolute top-2 left-2 right-2">
        <div className="flex items-center gap-1 text-[8px] font-mono text-red-400 mb-1">
          <AlertTriangle size={8}/> HEAT METER
        </div>
        <div className="w-full h-2 rounded-full bg-slate-700">
          <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 animate-pulse"/>
        </div>
      </div>
      {/* Control hints */}
      <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-2">
        <span className="text-[8px] font-mono text-pink-400 bg-pink-950/80 px-1 rounded">TAP: SIDE-RAM</span>
        <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/80 px-1 rounded">HOLD: BOOST</span>
      </div>
    </div>
    <div className="text-[9px] font-mono text-slate-400 text-center">
      Vehicle controls change per vehicle type
    </div>
  </div>
);

const GameOverVisual = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
    <div className="w-full grid grid-cols-2 gap-2">
      <div className="p-3 rounded-xl bg-green-950/30 border border-green-500/40 flex flex-col gap-1">
        <div className="flex items-center gap-1 text-green-400 text-[9px] font-mono font-bold">
          <CheckCircle size={10}/> SUCCESS PATH
        </div>
        <div className="text-[9px] font-mono text-green-300">• APB Record Cleared</div>
        <div className="text-[9px] font-mono text-green-300">• Cash Reward Banked</div>
        <div className="text-[9px] font-mono text-green-300">• Next Chapter Unlocked</div>
      </div>
      <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 flex flex-col gap-1">
        <div className="flex items-center gap-1 text-red-400 text-[9px] font-mono font-bold">
          <AlertTriangle size={10}/> ARREST PATH
        </div>
        <div className="text-[9px] font-mono text-red-300">• Police Incident Report</div>
        <div className="text-[9px] font-mono text-red-300">• Heat +1 Applied</div>
        <div className="text-[9px] font-mono text-red-300">• Retry Evidence Forgery</div>
      </div>
    </div>
    <div className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-[9px] font-mono text-slate-300 text-center">
      Each vehicle has a unique arrest report &amp; crash condition
    </div>
  </div>
);

//  TOUR PHASES DATA 

const PHASES: TourPhase[] = [
  {
    id: 'garage',
    phase: 'PHASE 01',
    title: 'PICK YOUR GETAWAY VEHICLE',
    subtitle: 'The Neon City Garage — Mission Select',
    story: '"You just pulled off the biggest score in Vice City. The problem? Every surveillance camera in the city saw your vehicle. Choose your escape route carefully — each vehicle demands a completely different strategy to beat the police database."',
    mechanic: 'Select any of the 6 escape vehicles from the garage grid. Each vehicle unlocks a different chapter with its own story, objectives, and editing challenge.',
    icon: <Car size={24} />,
    color: '#ff007f',
    steps: [
      'Switch to VEHICLE HEIST mode using the header toggle button',
      'Browse the 6 vehicle cards in the Garage Grid on screen',
      'Click any vehicle to preview its mission dossier on the right panel',
      'Read the Bespoke Editing Mechanic description carefully — it tells you exactly what to do',
      'Press START FORGERY to begin the evidence editing phase'
    ],
    warning: 'Higher heat vehicles (4-5 stars) have shorter forgery windows and more aggressive police pursuit patterns.',
    reward: 'Completing each vehicle chapter in order unlocks the Grand Finale mission.',
    visual: <GaragePickVisual />,
  },
  {
    id: 'evidence',
    phase: 'PHASE 02',
    title: 'FORGE THE EVIDENCE',
    subtitle: 'The Unlayer Evidence Forgery Lab',
    story: '"The city\'s surveillance AI is building a case against you using the evidence photos it captured. Your only defense is to alter those photos before the police database finalizes the match. You are the forger. Make those photos lie."',
    mechanic: 'Use the Unlayer image editor to modify surveillance photos. Every vehicle path has different photo targets — license plates, vehicle colors, identity markings, destinations, vessel names, or callsigns.',
    icon: <Edit3 size={24} />,
    color: '#00f0ff',
    steps: [
      'The evidence photo loads in the Unlayer editor panel',
      'Identify the red TARGET REGION boxes — those are the areas police are analyzing',
      'Use Unlayer tools: draw over text, add color blocks, paste image layers, or type replacements',
      'For the CAR mission: paint over the red chassis and license plate VC-4821',
      'For the BIKE mission: disguise the red helmet and PHANTOM-99 jacket logo',
      'For the TRAIN mission: edit all 4 camera images to tell the SAME story consistently',
      'For the BOAT mission: rename BLACK FIN to BLUE MOON and update registration',
      'For the HELICOPTER mission: change callsign N-882VC while keeping shadow lighting realistic',
      'Press SUBMIT FORGERY when finished editing'
    ],
    warning: 'If you leave target regions unedited, the police match score stays high. The story will branch to an arrest cutscene instead of escape.',
    reward: 'High-quality forgery edits unlock better story narrative outcomes and higher cash rewards.',
    visual: <EvidenceEditVisual />,
  },
  {
    id: 'telemetry',
    phase: 'PHASE 03',
    title: 'RISK ASSESSMENT SCAN',
    subtitle: 'Police Surveillance AI — Match Analysis',
    story: '"Before the city lets you loose, the surveillance AI runs a final scan on all modified evidence photos. Every vehicle has a different set of match metrics. Your job in the forgery phase is to drive every metric below the safe threshold."',
    mechanic: 'After submitting forgery, the system calculates match percentages for each surveillance metric. The story outcome — escape, close call, or arrest — is determined by the combined forgery score.',
    icon: <Target size={24} />,
    color: '#ffe600',
    steps: [
      'After submitting your edits, the Consequence Modal appears automatically',
      'Read the TELEMETRY BREAKDOWN — it shows match % for each targeted region',
      'Green metrics (below 30%) = successfully fooled that camera',
      'Red metrics (above 70%) = police still recognize that attribute — story branches to arrest',
      'The overall FORGERY SCORE determines whether you enter the 3D Pursuit or the Incident Report',
      'If arrested: read your bespoke police incident report, then press RETRY FORGERY to try again'
    ],
    warning: 'Match scores above 70% trigger automatic arrest. Different vehicle mechanics penalize different types of missed edits.',
    reward: 'Forgery score above 85% unlocks EXPERT getaway bonuses in the 3D pursuit phase.',
    visual: <TelemetryVisual />,
  },
  {
    id: 'pursuit',
    phase: 'PHASE 04',
    title: 'ACTIVE 3D GETAWAY PURSUIT',
    subtitle: 'Vice City Streets — Live Escape',
    story: '"The forgery bought you a head start — but the police aren\'t done. Each vehicle enters a different escape scenario with live 3D pursuit gameplay. Your hands-on skills matter here. Every vehicle handles differently. Every crash condition is unique."',
    mechanic: 'Interactive 3D pursuit scene with bespoke vehicle controls for each escape vehicle. Avoid police traps, manage your heat meter, and use your vehicle\'s special action before game-over conditions trigger.',
    icon: <Zap size={24} />,
    color: '#ff3300',
    steps: [
      'The 3D getaway scene launches automatically after a successful forgery',
      'Each vehicle has a unique CONTROL PANEL with its special action button',
      'CAR: Tap SIDE-RAM to push police interceptors off the road',
      'BIKE: Tap PULSE WHEELIE to speed-burst through road blocks',
      'TRAIN: Tap OVERRIDE SWITCH to reroute to a different track',
      'BOAT: Tap HYDRO WAKE JUMP to leap over coast guard torpedo boats',
      'HELICOPTER: Tap CHAFF COUNTERMEASURE and manage altitude to avoid SAM lock-on',
      'Watch the vehicle-specific danger meter — when it hits 100%, game over'
    ],
    warning: 'Each vehicle has a unique game-over condition: Car = PIT maneuver; Bike = EMP blast; Train = dead-end siding; Boat = torpedo hit; Helicopter = SAM lock-on.',
    reward: 'Successfully escaping all 5 vehicles unlocks the Grand Finale 90-second speed-run chapter.',
    visual: <PursuitVisual />,
  },
  {
    id: 'outcome',
    phase: 'PHASE 05',
    title: 'ESCAPE BANKED OR ARRESTED',
    subtitle: 'Vice City Police Department — Case File',
    story: '"This city keeps records of every criminal. Every chase. Every arrest. If you\'re good enough, you walk free and your record is wiped. If you slip up, the Vice City Police Department files an incident report with your vehicle, your plate, and your method of capture. It\'s in the database forever."',
    mechanic: 'The final outcome screen shows either your escape confirmation with cash banked, or a bespoke police incident report tailored to your vehicle and the specific way you were caught.',
    icon: <ShieldAlert size={24} />,
    color: '#00ff99',
    steps: [
      'The outcome screen appears automatically at the end of the 3D pursuit',
      'On SUCCESS: your escape score, cash reward, and APB clearance status are displayed',
      'On ARREST: the bespoke Police Incident Report appears — read your specific arrest method',
      'Every vehicle has a unique incident report: PIT Arrest, EMP Arrest, Siding Arrest, Marina Arrest, Airspace Intercept Arrest',
      'Press RETRY to go back to the evidence forgery and try a different edit approach',
      'Complete all 5 vehicle escapes to unlock the Grand Finale chapter',
      'The Grand Finale is a 90-second speed-run where you re-edit all 5 vehicle evidence sets simultaneously'
    ],
    warning: 'The police incident report records your exact vehicle, capture method, and forgery accuracy. Share it as proof of your run.',
    reward: 'Completing the Grand Finale generates an ESCAPE REPORT CERTIFICATE — your final score card across all 5 vehicles.',
    visual: <GameOverVisual />,
  },
];

//  COMPONENT

export const HeistGameTourModal: React.FC<HeistGameTourModalProps> = ({
  isOpen,
  onClose,
  onStartHeist,
}) => {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (isOpen) { setIdx(0); setVisible(true); }
  }, [isOpen]);

  if (!isOpen) return null;

  const phase = PHASES[idx];
  const isLast = idx === PHASES.length - 1;
  const isFirst = idx === 0;

  const go = (next: number) => {
    audioEngine.playClickSFX?.();
    setVisible(false);
    setTimeout(() => {
      setIdx(Math.max(0, Math.min(PHASES.length - 1, next)));
      setVisible(true);
    }, 140);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[95dvh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(170deg, #080814 0%, #0b0b18 100%)',
          border: `1px solid ${phase.color}40`,
          boxShadow: `0 0 0 1px ${phase.color}18, 0 40px 100px rgba(0,0,0,0.9), 0 0 80px ${phase.color}12`,
        }}
      >
        {/*  TOP ACCENT STRIPE  */}
        <div className="h-[3px] w-full shrink-0" style={{ background: `linear-gradient(90deg, transparent 0%, ${phase.color} 40%, ${phase.color} 60%, transparent 100%)` }} />

        {/*  PHASE BADGE + CLOSE  */}
        <div className="flex items-center justify-between px-5 sm:px-7 pt-4 pb-3 shrink-0 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            {/* Phase label pill */}
            <div
              className="px-3 py-1 rounded-full text-[10px] font-mono font-black tracking-[0.3em] uppercase"
              style={{ background: `${phase.color}18`, border: `1px solid ${phase.color}44`, color: phase.color }}
            >
              {phase.phase}
            </div>
            {/* Phase dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              {PHASES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === idx ? 18 : 5,
                    height: 5,
                    background: i === idx ? phase.color : '#2a2a40',
                    boxShadow: i === idx ? `0 0 6px ${phase.color}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500">
              {String(idx + 1).padStart(2, '0')} / {String(PHASES.length).padStart(2, '0')}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/8 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/*  MAIN BODY (2-column on lg)  */}
        <div
          className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-5 min-h-0"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.18s' }}
        >
          {/*  LEFT COLUMN: Briefing  */}
          <div className="lg:col-span-3 px-5 sm:px-7 py-5 flex flex-col gap-4 border-r border-white/[0.04]">

            {/* Title block */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${phase.color}18`, border: `1px solid ${phase.color}40`, color: phase.color }}
                >
                  {phase.icon}
                </div>
                <div>
                  <h2
                    className="font-black leading-tight uppercase tracking-tight"
                    style={{
                      fontSize: 'clamp(1.15rem, 3.5vw, 1.75rem)',
                      fontFamily: 'Impact, "Arial Narrow", sans-serif',
                      color: '#fff',
                      textShadow: `0 0 32px ${phase.color}55`,
                    }}
                  >
                    {phase.title}
                  </h2>
                  <p className="text-[10px] font-mono tracking-wider" style={{ color: phase.color, opacity: 0.7 }}>
                    {phase.subtitle}
                  </p>
                </div>
              </div>

              {/* Story narration — styled like GTA mission briefer text */}
              <div
                className="rounded-xl px-4 py-3 text-[12.5px] leading-relaxed text-slate-300 italic border-l-2 mt-3"
                style={{ borderColor: phase.color, background: `${phase.color}0a` }}
              >
                {phase.story}
              </div>
            </div>

            {/* Mechanic description */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl border text-[11.5px] font-mono text-purple-200"
              style={{ borderColor: '#a855f733', background: '#a855f70d' }}>
              <Radio size={14} className="text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-purple-400 uppercase text-[10px] tracking-widest block mb-0.5">HOW THIS PHASE WORKS</span>
                <p>{phase.mechanic}</p>
              </div>
            </div>

            {/* Step-by-step instructions */}
            <div>
              <h3
                className="text-[10px] font-mono font-bold tracking-[0.25em] uppercase mb-2"
                style={{ color: phase.color }}
              >
                STEP-BY-STEP INSTRUCTIONS
              </h3>
              <div className="space-y-1.5">
                {phase.steps.map((step, si) => (
                  <div key={si} className="flex items-start gap-2.5 text-[11px] font-mono">
                    <span
                      className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black mt-0.5"
                      style={{ background: `${phase.color}25`, color: phase.color, border: `1px solid ${phase.color}40` }}
                    >
                      {si + 1}
                    </span>
                    <span className="text-slate-300 leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning + Reward row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-auto">
              {phase.warning && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg border border-red-500/30 bg-red-950/20 text-[10px] font-mono text-red-300">
                  <AlertTriangle size={12} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-red-400 uppercase block text-[9px] tracking-wider mb-0.5">DANGER</span>
                    {phase.warning}
                  </div>
                </div>
              )}
              {phase.reward && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg border border-green-500/30 bg-green-950/20 text-[10px] font-mono text-green-300">
                  <CheckCircle size={12} className="text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-green-400 uppercase block text-[9px] tracking-wider mb-0.5">REWARD</span>
                    {phase.reward}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/*  RIGHT COLUMN: Visual Diagram  */}
          <div
            className="lg:col-span-2 flex flex-col"
            style={{ background: 'linear-gradient(170deg, #0a0a18 0%, #080812 100%)' }}
          >
            {/* Diagram header */}
            <div className="px-4 py-3 border-b border-white/[0.04] text-[9px] font-mono tracking-[0.25em] uppercase shrink-0"
              style={{ color: phase.color, opacity: 0.7 }}>
              PHASE VISUAL CONTEXT
            </div>

            {/* Diagram body */}
            <div className="flex-1 min-h-[180px]">
              {phase.visual}
            </div>

            {/* Vehicle phase progress map */}
            <div className="px-4 pb-4 border-t border-white/[0.04] pt-3 shrink-0">
              <div className="text-[9px] font-mono text-slate-500 tracking-wider uppercase mb-2">MISSION FLOW</div>
              <div className="flex items-center gap-1">
                {PHASES.map((p, i) => (
                  <React.Fragment key={p.id}>
                    <button
                      onClick={() => go(i)}
                      className="flex flex-col items-center gap-0.5 group transition-all"
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: i === idx ? `${p.color}30` : i < idx ? `${p.color}15` : '#1a1a2e',
                          border: `1px solid ${i <= idx ? p.color + '55' : '#2a2a40'}`,
                          color: i === idx ? p.color : i < idx ? p.color + '80' : '#444',
                        }}
                      >
                        {React.cloneElement(p.icon as React.ReactElement, { size: 10 })}
                      </div>
                      <span className="text-[7px] font-mono" style={{ color: i === idx ? p.color : '#444' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </button>
                    {i < PHASES.length - 1 && (
                      <div className="flex-1 h-px" style={{ background: i < idx ? phase.color + '44' : '#1e1e30' }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/*  BOTTOM NAV  */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-t border-white/[0.04] shrink-0">
          {/* Back button */}
          <button
            onClick={() => go(idx - 1)}
            disabled={isFirst}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-mono font-bold transition-all border ${
              isFirst
                ? 'border-white/5 text-slate-700 cursor-not-allowed'
                : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <ChevronLeft size={14} />
            BACK
          </button>

          {/* Center label */}
          <span className="hidden sm:block text-[10px] font-mono text-slate-600 tracking-widest uppercase">
            VEHICLE HEIST — GAME GUIDE
          </span>

          {/* Next / Start Heist button */}
          {isLast ? (
            <button
              onClick={() => { onClose(); onStartHeist?.(); }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-mono font-black text-black uppercase tracking-wider transition-all hover:scale-[1.04] active:scale-[0.97]"
              style={{
                background: `linear-gradient(135deg, ${phase.color}, #ff007f)`,
                boxShadow: `0 0 24px ${phase.color}55`,
              }}
            >
              <Play size={14} className="fill-black" />
              START THE HEIST
            </button>
          ) : (
            <button
              onClick={() => go(idx + 1)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[12px] font-mono font-bold text-black transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: phase.color,
                boxShadow: `0 0 20px ${phase.color}55`,
              }}
            >
              NEXT PHASE
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
