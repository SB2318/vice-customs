import React, { useRef, useState, useEffect, useMemo, useCallback, Suspense, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LiveryState, HeistMission, GetawayVehicleType } from '../../types';
import { Vehicle3D } from '../Three3D/Vehicle3D';
import { audioEngine } from '../../utils/audioEngine';
import { ViceRadio } from './ViceRadio';
import { X, Star, Zap, Shield, Play, ChevronRight, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';

interface EBState { hasError: boolean; }
class ThreeCanvasErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error) { console.warn('[3D Pursuit Canvas] Canvas error:', err.message); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mb-2 animate-bounce" />
          <h3 className="text-sm font-mono font-bold text-white uppercase">3D GETAWAY PURSUIT ACTIVE</h3>
          <p className="text-xs font-mono text-slate-400 max-w-sm mt-1">Evade police cruisers and use action controls below to execute your escape!</p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ViceHeistModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveryState: LiveryState;
  canvasElement: HTMLCanvasElement | null;
  mission?: HeistMission | null;
}

type GamePhase = 'intro' | 'briefing' | 'playing' | 'busted' | 'escaped';

//  Multi-Vehicle Bespoke Story Slides 
const MISSION_STORY_SLIDES: Record<GetawayVehicleType, Array<{ eyebrow: string; headline: string; body: string; accent: string; glyph: string; }>> = {
  car: [
    {
      eyebrow: 'VICE CITY — 2 AM',
      headline: 'SECURITY CAM\nFLAGGED.',
      body: 'Security Cam #047 recorded our red Infernus. You forged the evidence in Unlayer. Now respray, side-slam cop cruisers, and floor it through city roadblocks.',
      accent: '#ff007f',
      glyph: '🚗',
    },
    {
      eyebrow: 'POLICE PURSUIT',
      headline: 'RAM COPS &\nLOSE HEAT.',
      body: 'Cruisers are scrambling. Use SIDE RAM [💥] to wreck pursuing squad cars and NITRO [⚡] to blast through spike strips.',
      accent: '#ff4400',
      glyph: '🚔',
    }
  ],
  bike: [
    {
      eyebrow: 'HIGHWAY 102 — 184 MPH',
      headline: 'GHOST\nRIDER.',
      body: 'Speed traps flagged the red helmet. You altered the helmet art in Unlayer. Now weave through 200+ MPH highway traffic and execute Wheelies [🏍️]!',
      accent: '#ffe600',
      glyph: '🏍️',
    },
    {
      eyebrow: 'HIGHWAY SLALOM',
      headline: 'WHEELIE OVER\nROADBLOCKS.',
      body: 'Perform high-speed lane filtering between transport trucks and trigger Wheelies to hop over barrier debris.',
      accent: '#ff5500',
      glyph: '⚡',
    }
  ],
  train: [
    {
      eyebrow: 'METRO TERMINAL',
      headline: 'HIJACK\nEXPRESS.',
      body: 'The express train approaches Central Terminal. You modified the destination board to HARBOR in Unlayer. Now switch rail junctions to reroute!',
      accent: '#00f0ff',
      glyph: '🚆',
    },
    {
      eyebrow: 'RAIL DISPATCH',
      headline: 'SWITCH TRACKS\n1, 2, & 3.',
      body: 'Use TRACK SWITCHERS [🔀] to jump between rail lines, dodge derailed cargo cars, and outrun SWAT rail interceptors.',
      accent: '#39ff14',
      glyph: '🚦',
    }
  ],
  boat: [
    {
      eyebrow: 'HARBOR CHANNEL',
      headline: 'MIDNIGHT\nRUN.',
      body: 'Coastguard drones swept the harbor for OCEAN BREEZE. You overwrote the hull name in Unlayer. Now hop ocean swell waves and dodge naval mines!',
      accent: '#38bdf8',
      glyph: '🚤',
    },
    {
      eyebrow: 'NAUTICAL SLALOM',
      headline: 'WAVE JUMP OVER\nMINES.',
      body: 'Cut through water spray, hit WAVE JUMP [🌊] to leap over coastal mine chains, and outrun coastguard patrol cutters.',
      accent: '#0284c7',
      glyph: '🌊',
    }
  ],
  helicopter: [
    {
      eyebrow: 'METROPOLIS AIRSPACE',
      headline: 'SKY\nESCAPE.',
      body: 'Military jets locked onto callsign N-882VC. You changed the tail callsign in Unlayer. Now control altitude flight and deploy flares!',
      accent: '#c084fc',
      glyph: '🚁',
    },
    {
      eyebrow: 'AIRSPACE FLIGHT',
      headline: 'ASCEND, DESCEND &\nDEPLOY FLARES.',
      body: 'Use ASCEND [⬆️] / DESCEND [⬇️] to navigate skyscraper rooftops, and DEPLOY FLARES [🎆] to break jet missile locks.',
      accent: '#a855f7',
      glyph: '🌌',
    }
  ],
  final: [
    {
      eyebrow: 'NEON CITY — FINAL CHAPTER',
      headline: 'FINAL\nESCAPE.',
      body: 'The city central AI has connected all evidence files across Car, Bike, Train, Boat, and Chopper. You have 90 seconds to rewrite the connected evidence set!',
      accent: '#f59e0b',
      glyph: '🏆',
    },
    {
      eyebrow: 'CITY LOCKDOWN',
      headline: 'GENERATE THE\nESCAPE REPORT.',
      body: 'Rewrite the connected evidence set in Unlayer to clear your status and generate the final ESCAPE REPORT.',
      accent: '#ef4444',
      glyph: '⚡',
    }
  ]
};

// Bespoke Game Over Config per Vehicle Path 
const GAME_OVER_CONFIG: Record<GetawayVehicleType, {
  headline: string;
  badge: string;
  glyph: string;
  description: string;
  detectiveReport: string;
  statusLabel: string;
}> = {
  car: {
    headline: 'CORNERED & BUSTED',
    badge: 'POLICE BOX-IN',
    glyph: '🚔',
    description: 'Squad cars pinned your Infernus against the highway divider. The detective team retrieved original red chassis surveillance footage.',
    detectiveReport: 'INCIDENT REPORT: Red Infernus chassis match confirmed. Bumper scrapings matched Malibu Club collision evidence.',
    statusLabel: 'BUSTED & SENTENCED'
  },
  bike: {
    headline: 'HIGH-SPEED CRASH & UNMASKED',
    badge: 'TOLL GATE COLLISION',
    glyph: '🏍️',
    description: 'The Phantom motorcycle wiped out at 210 MPH against Toll Gate 4. Your helmet cracked open upon impact.',
    detectiveReport: 'INCIDENT REPORT: Rider unmasked at Toll Gate 4. Visual biometric match logged into city central database.',
    statusLabel: 'UNMASKED & CAPTURED'
  },
  train: {
    headline: 'DERAILED & INTERCEPTED',
    badge: 'RAIL BARRICADE COLLISION',
    glyph: '🚆',
    description: 'Express Train #809 collided with stationary freight cargo on Track 2. Destination mismatch between Platform and Train front triggered rail brakes.',
    detectiveReport: 'INCIDENT REPORT: Inconsistent route signals detected. Transit SWAT intercepted train engine at Central Station.',
    statusLabel: 'DERAILED & INTERCEPTED'
  },
  boat: {
    headline: 'MINED & SUNK IN HARBOR',
    badge: 'NAVAL MINE IMPACT',
    glyph: '🚤',
    description: 'The speedboat struck a coastal mine chain off Dock 4. Coastguard cutters impounded contraband and confirmed registration VC-207.',
    detectiveReport: 'INCIDENT REPORT: Vessel BLACK FIN sunk at harbor mouth. Registration VC-207 verified by coastal patrol.',
    statusLabel: 'VESSEL SUNK & ARRESTED'
  },
  helicopter: {
    headline: 'SHOT DOWN & DETAINED',
    badge: 'JET MISSILE STRIKE',
    glyph: '🚁',
    description: 'A heat-seeking missile from military jet escorts struck tail rotor N-882VC. Emergency crash landing on high-rise roof.',
    detectiveReport: 'INCIDENT REPORT: Unauthorized airspace entry logged by military air defense. Callsign N-882VC confirmed.',
    statusLabel: 'SHOT DOWN & DETAINED'
  },
  final: {
    headline: 'TOTAL CITY LOCKDOWN',
    badge: '90s TIMER EXPIRED',
    glyph: '🏆',
    description: 'The 90-second evidence window expired. City central AI linked Car, Bike, Train, Boat, and Chopper files into 100% match.',
    detectiveReport: 'INCIDENT REPORT: Cross-vehicle evidence match 100%. Total city grid lockdown initiated.',
    statusLabel: 'TOTAL LOCKDOWN — NO ESCAPE'
  }
};

//  Power-up types
type PowerUpType = 'nitro' | 'repair' | 'emp';
interface PowerUp {
  id: number;
  type: PowerUpType;
  x: number;
  z: number;
  active: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// 3D BESPOKE GETAWAY SCENE
// ══════════════════════════════════════════════════════════════════════════════

const PoliceChaseScene: React.FC<{
  speed: number;
  wantedLevel: number;
  playerX: number;
  playerY: number;
  powerUps: PowerUp[];
  isNitro: boolean;
  liveryState: LiveryState;
  canvasElement: HTMLCanvasElement | null;
  vehicleType: GetawayVehicleType;
  isRamming?: boolean;
}> = ({ speed, wantedLevel, playerX, playerY, powerUps, isNitro, liveryState, canvasElement, vehicleType, isRamming }) => {
  const roadOffsetRef = useRef(0);
  const sceneryRef = useRef<THREE.Group>(null);
  const cop1Ref = useRef<THREE.Mesh>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const rotorRef = useRef<THREE.Group>(null);

  const surfaceTexture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 1024;
    const ctx = c.getContext('2d')!;

    if (vehicleType === 'boat') {
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, 0, 512, 1024);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 8;
      for (let y = 0; y < 1024; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(256, y + 40, 512, y);
        ctx.stroke();
      }
    } else if (vehicleType === 'train') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 1024);
      [100, 256, 412].forEach(rx => {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(rx - 12, 0, 8, 1024);
        ctx.fillRect(rx + 4, 0, 8, 1024);
        ctx.fillStyle = '#475569';
        for (let y = 0; y < 1024; y += 36) {
          ctx.fillRect(rx - 24, y, 48, 10);
        }
      });
    } else {
      ctx.fillStyle = '#111120';
      ctx.fillRect(0, 0, 512, 1024);
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 4;
      ctx.setLineDash([60, 40]);
      ctx.beginPath(); ctx.moveTo(170, 0); ctx.lineTo(170, 1024); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(340, 0); ctx.lineTo(340, 1024); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(8, 1024); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(504, 0); ctx.lineTo(504, 1024); ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    return tex;
  }, [vehicleType]);

  useFrame((_, delta) => {
    const spd = speed * delta * 0.6;
    roadOffsetRef.current += spd;
    surfaceTexture.offset.y = roadOffsetRef.current;

    if (sceneryRef.current) {
      sceneryRef.current.children.forEach((obj) => {
        obj.position.z += spd * 14;
        if (obj.position.z > 15) obj.position.z -= 70;
      });
    }

    if (rotorRef.current && vehicleType === 'helicopter') {
      rotorRef.current.rotation.y += delta * 30;
    }

    if (cop1Ref.current) {
      const targetX = playerX * 2.5 + (isRamming ? 1.5 : 0.6);
      cop1Ref.current.position.x += (targetX - cop1Ref.current.position.x) * 0.05;
      cop1Ref.current.position.z += (6 - cop1Ref.current.position.z) * 0.02;
    }

    if (spotlightRef.current && wantedLevel >= 3) {
      spotlightRef.current.target.position.x = playerX * 2.5 + Math.sin(Date.now() * 0.003) * 2;
      spotlightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <color attach="background" args={['#02020f']} />
      <fog attach="fog" args={['#02020f', 18, 60]} />

      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={1.8} color="#1a0035" />
      <pointLight position={[-4, 3, 2]} intensity={2.5} color="#ff007f" />
      <pointLight position={[4, 3, 2]} intensity={2.5} color="#00f0ff" />

      {wantedLevel >= 3 && (
        <spotLight
          ref={spotlightRef}
          position={[0, 14, 4]}
          angle={0.2}
          penumbra={0.6}
          intensity={16}
          color="#ffffaa"
        />
      )}

      {/* Surface Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[8, 120]} />
        <meshStandardMaterial map={surfaceTexture} roughness={0.3} metalness={0.15} />
      </mesh>

      {/* Power-ups */}
      {powerUps.filter(p => p.active).map((p) => (
        <mesh key={p.id} position={[p.x * 2.5, 0.4, p.z]} rotation={[0, Date.now() * 0.002, 0]}>
          <dodecahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial
            color={p.type === 'nitro' ? '#00f0ff' : p.type === 'repair' ? '#00ff44' : '#ff00ff'}
            emissive={p.type === 'nitro' ? '#00f0ff' : p.type === 'repair' ? '#00ff44' : '#ff00ff'}
            emissiveIntensity={2}
          />
        </mesh>
      ))}

      {/*  PLAYER VEHICLE MESH  */}
      <group position={[playerX * 2.5, playerY, 2]} rotation={[0, isRamming ? 0.2 : 0, 0]}>
        {vehicleType === 'car' && (
          <Suspense fallback={null}>
            <Vehicle3D liveryState={liveryState} canvasElement={canvasElement} />
          </Suspense>
        )}

        {vehicleType === 'bike' && (
          <group name="player-bike">
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[0.4, 0.5, 1.6]} />
              <meshStandardMaterial color="#dc2626" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.25, -0.6]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.3, 0.3, 0.15, 16]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0, 0.25, 0.6]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.3, 0.3, 0.15, 16]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0, 0.9, -0.1]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial color="#ef4444" emissive="#ff0000" emissiveIntensity={0.6} />
            </mesh>
          </group>
        )}

        {vehicleType === 'train' && (
          <group name="player-train">
            <mesh position={[0, 0.9, 0]}>
              <boxGeometry args={[1.6, 1.4, 4.2]} />
              <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.8, -2.15]}>
              <boxGeometry args={[1.2, 0.4, 0.1]} />
              <meshStandardMaterial color="#fff" emissive="#38bdf8" emissiveIntensity={3} />
            </mesh>
          </group>
        )}

        {vehicleType === 'boat' && (
          <group name="player-boat">
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[1.1, 0.5, 2.4]} />
              <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.6, -0.2]}>
              <boxGeometry args={[0.9, 0.3, 0.6]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} />
            </mesh>
          </group>
        )}

        {vehicleType === 'helicopter' && (
          <group name="player-chopper" position={[0, 1.2, 0]}>
            <mesh>
              <sphereGeometry args={[0.8, 16, 16]} />
              <meshStandardMaterial color="#7e22ce" metalness={0.7} roughness={0.2} />
            </mesh>
            <group ref={rotorRef} position={[0, 0.85, 0]}>
              <mesh>
                <boxGeometry args={[4.2, 0.04, 0.2]} />
                <meshStandardMaterial color="#e9d5ff" emissive="#a855f7" emissiveIntensity={1.5} />
              </mesh>
            </group>
          </group>
        )}

        {isNitro && (
          <pointLight position={[0, 0.5, 1.2]} intensity={8} color="#00f0ff" distance={5} />
        )}
      </group>

      {/* Police Pursuer */}
      <mesh ref={cop1Ref} position={[0.6, 0.3, 6.5]}>
        <boxGeometry args={[1.2, 0.5, 2.2]} />
        <meshStandardMaterial color="#1a1a8c" />
        <pointLight position={[0, 0.5, 0]} intensity={4} color="#ff0000" distance={6} />
      </mesh>
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN MODAL COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export const ViceOutrunGameModal: React.FC<ViceHeistModalProps> = ({
  isOpen,
  onClose,
  liveryState,
  canvasElement,
  mission
}) => {
  const vehicleType: GetawayVehicleType = mission?.vehicleType || 'car';
  const slides = MISSION_STORY_SLIDES[vehicleType] || MISSION_STORY_SLIDES.car;
  const gameOverConfig = GAME_OVER_CONFIG[vehicleType] || GAME_OVER_CONFIG.car;

  const [phase, setPhase] = useState<GamePhase>('intro');
  const [introSlide, setIntroSlide] = useState(0);
  const [slideVisible, setSlideVisible] = useState(true);

  // Bespoke game states
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wantedLevel, setWantedLevel] = useState(mission?.heatLevel || 1);
  const [hp, setHp] = useState(100);
  const [nitroActive, setNitroActive] = useState(false);
  const [nitroCharge, setNitroCharge] = useState(0);
  const [playerX, setPlayerX] = useState(0);
  const [playerY, setPlayerY] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<number>(2);
  const [isRamming, setIsRamming] = useState(false);
  const [flaresActive, setFlaresActive] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [escapeDistance, setEscapeDistance] = useState(0);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [nextPuId, setNextPuId] = useState(0);
  const [screenFlash, setScreenFlash] = useState<'red' | 'blue' | 'green' | null>(null);

  // Refs
  const gameLoopRef = useRef<number | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const steerLeftRef = useRef(false);
  const steerRightRef = useRef(false);
  const lastTimeRef = useRef(0);
  const puSpawnTimer = useRef(0);

  const resetGame = useCallback(() => {
    setScore(0);
    setTimeElapsed(0);
    setWantedLevel(mission?.heatLevel || 1);
    setHp(100);
    setNitroActive(false);
    setNitroCharge(0);
    setPlayerX(0);
    setPlayerY(0);
    setCurrentTrack(2);
    setIsRamming(false);
    setFlaresActive(false);
    setSpeed(1.0);
    setEscapeDistance(0);
    setPowerUps([]);
    setNextPuId(0);
    setScreenFlash(null);
    steerLeftRef.current = false;
    steerRightRef.current = false;
    lastTimeRef.current = 0;
    puSpawnTimer.current = 0;
  }, [mission]);

  useEffect(() => {
    if (isOpen) {
      setPhase('intro');
      setIntroSlide(0);
      setSlideVisible(true);
      resetGame();
    }
  }, [isOpen, resetGame]);

  const goSlide = (next: number) => {
    setSlideVisible(false);
    setTimeout(() => { setIntroSlide(next); setSlideVisible(true); }, 180);
  };

  const startBriefing = () => {
    setPhase('briefing');
  };

  const startGame = () => {
    resetGame();
    setPhase('playing');
  };

  // Bespoke Actions
  const triggerCarSideRam = () => {
    audioEngine.playCrashSFX();
    setIsRamming(true);
    setScore(sc => sc + 500);
    setTimeout(() => setIsRamming(false), 600);
  };

  const triggerMotorbikeWheelie = () => {
    audioEngine.playNitroSFX();
    setPlayerY(0.8);
    setScore(sc => sc + 350);
    setTimeout(() => setPlayerY(0), 800);
  };

  const triggerTrainTrackSwitch = (track: number) => {
    audioEngine.playClickSFX();
    setCurrentTrack(track);
    const targetX = track === 1 ? -1 : track === 3 ? 1 : 0;
    setPlayerX(targetX);
    setScore(sc => sc + 200);
  };

  const triggerSpeedboatWaveJump = () => {
    audioEngine.playNitroSFX();
    setPlayerY(1.2);
    setScore(sc => sc + 400);
    setTimeout(() => setPlayerY(0), 900);
  };

  const triggerHelicopterFlares = () => {
    audioEngine.playEmpSFX();
    setFlaresActive(true);
    setScore(sc => sc + 600);
    setTimeout(() => setFlaresActive(false), 1500);
  };

  // Keyboard Event Listeners
  useEffect(() => {
    if (phase !== 'playing') return;
    const onDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      if (e.code === 'Space') { e.preventDefault(); }
    };
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, [phase]);

  // Main Game Loop
  useEffect(() => {
    if (phase !== 'playing') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    // Escape distance threshold (varies by heat level)
    const ESCAPE_TARGET = 600 + (wantedLevel * 100);
    // HP damage per second from police (scales with heat)
    const HP_DAMAGE_PER_SEC = 3 + wantedLevel * 1.5;

    const tick = (ts: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      const dt = Math.min((ts - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = ts;

      setTimeElapsed(t => t + dt);
      setEscapeDistance(d => {
        const next = d + dt * 45 * (nitroActive ? 2 : 1);
        // WIN CONDITION — reached escape distance
        if (next >= ESCAPE_TARGET) {
          setPhase('escaped');
          audioEngine.playNitroSFX?.();
        }
        return next;
      });
      setSpeed(s => Math.min(s + dt * 0.02, 3.5));
      setScore(sc => sc + Math.floor(dt * 15 * wantedLevel * (nitroActive ? 2 : 1)));

      setNitroCharge(n => {
        if (nitroActive) return Math.max(0, n - dt * 35);
        return Math.min(100, n + dt * 10);
      });
      if (nitroActive && nitroCharge <= 0) setNitroActive(false);

      // HP damage from police pursuit (reduced while flares/ramming active)
      setHp(h => {
        const dmgMult = flaresActive ? 0.1 : isRamming ? 0.2 : 1;
        const next = h - HP_DAMAGE_PER_SEC * dt * dmgMult;
        if (next <= 0) {
          setPhase('busted');
          audioEngine.playCrashSFX?.();
          audioEngine.playGameOverSFX?.();
          return 0;
        }
        return next;
      });

      if (vehicleType !== 'train') {
        setPlayerX(px => {
          let nx = px;
          const isLeft = keysRef.current.has('ArrowLeft') || keysRef.current.has('KeyA') || steerLeftRef.current;
          const isRight = keysRef.current.has('ArrowRight') || keysRef.current.has('KeyD') || steerRightRef.current;

          if (isLeft) nx -= dt * 3.8;
          if (isRight) nx += dt * 3.8;

          if (keysRef.current.has('Space') && nitroCharge > 10 && !nitroActive) {
            setNitroActive(true);
            audioEngine.playNitroSFX?.();
          }
          return Math.max(-1, Math.min(1, nx));
        });
      }

      if (vehicleType === 'helicopter') {
        if (keysRef.current.has('ArrowUp') || keysRef.current.has('KeyW')) {
          setPlayerY(py => Math.min(2.5, py + dt * 2));
        } else if (keysRef.current.has('ArrowDown') || keysRef.current.has('KeyS')) {
          setPlayerY(py => Math.max(0, py - dt * 2));
        }
      }

      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [phase, nitroActive, nitroCharge, speed, playerX, wantedLevel, vehicleType, hp, flaresActive, isRamming]);

  if (!isOpen) return null;

  const currentSlide = slides[introSlide] || slides[0];
  const isLastSlide = introSlide === slides.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between items-center h-[100dvh] w-full overflow-hidden select-none">
      
      {/* Top Header Controls Bar */}
      <div className="w-full h-12 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-black text-pink-400 uppercase tracking-widest">
            {mission ? `${mission.title.toUpperCase()} (${vehicleType.toUpperCase()})` : 'VICE CITY ESCAPE'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ViceRadio compact showRev />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/*  PHASE 1: STORY ARC SLIDES  */}
      {phase === 'intro' && (
        <div className="flex-1 w-full flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold uppercase text-pink-400 tracking-widest">
                {currentSlide.eyebrow}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase leading-tight font-sans">
                {currentSlide.headline}
              </h2>
              <div className="text-4xl p-4 rounded-2xl bg-pink-500/10 border border-pink-500/30">
                {currentSlide.glyph}
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {currentSlide.body}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                {slides.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === introSlide ? 'w-6 bg-pink-500' : 'w-2 bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => isLastSlide ? startBriefing() : goSlide(introSlide + 1)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                {isLastSlide ? 'START ESCAPE' : 'NEXT'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  PHASE 2: PRE-GAME BRIEFING  */}
      {phase === 'briefing' && (
        <div className="flex-1 w-full flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col gap-5 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              {mission ? mission.title : 'THE GETAWAY'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {mission?.briefingText || 'Evade police interceptors and escape the city perimeter.'}
            </p>

            <div className="p-3 rounded-xl bg-pink-950/20 border border-pink-500/20 text-xs font-mono text-pink-300">
              <span className="font-bold text-pink-400 uppercase block mb-1">BESPOKE VEHICLE MECHANICS ({vehicleType.toUpperCase()}):</span>
              {vehicleType === 'car' && 'Perform tactical SIDE RAMS [💥] to wreck pursuing cop cars and NITRO BOOST [⚡] past roadblocks.'}
              {vehicleType === 'bike' && 'Execute WHEELIES [🏍️] at 200 MPH to hop over low barrier debris and slalom through trucks.'}
              {vehicleType === 'train' && 'Switch RAIL TRACKS 1, 2, & 3 [🔀] to bypass blocked junctions and derailed cargo cars.'}
              {vehicleType === 'boat' && 'Hit WAVE JUMP [🌊] to leap over ocean mine chains and pilot through harbor channels.'}
              {vehicleType === 'helicopter' && 'Use ASCEND [⬆️] / DESCEND [⬇️] altitude flight and deploy COUNTERMEASURE FLARES [🎆].'}
            </div>

            <button
              onClick={startGame}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 text-white font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25"
            >
              <Play className="w-4 h-4 fill-white" />
              LAUNCH {vehicleType.toUpperCase()} ESCAPE
            </button>
          </div>
        </div>
      )}

      {/*  PHASE 3: PLAYING 3D GETAWAY  */}
      {phase === 'playing' && (
        <div className="relative flex-1 w-full h-full flex flex-col overflow-hidden">
          {/* Top HUD Stats Bar & Vehicle-Specific Audio Theme Bar */}
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none gap-2">
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md pointer-events-auto shrink-0">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-mono font-bold text-white">HEAT L{wantedLevel}</span>
            </div>

            {/* Vehicle Specific REVI & MUSIC Player Controller */}
            <div className="pointer-events-auto hidden md:flex items-center gap-2">
              <ViceRadio compact showRev onRevClick={() => audioEngine.revEngineForVehicle(vehicleType)} />
            </div>

            <div className="bg-slate-950/80 border border-slate-800 px-4 py-1.5 rounded-xl backdrop-blur-md text-center pointer-events-auto shrink-0">
              <span className="text-[10px] font-mono text-slate-400 block">SCORE</span>
              <span className="text-lg font-black font-mono text-pink-400">{score.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md pointer-events-auto shrink-0">
              <Zap className={`w-4 h-4 ${nitroActive ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-xs font-mono text-slate-300">{Math.floor(escapeDistance)}m</span>
            </div>
          </div>

          {/* 3D Canvas Scene */}
          <Canvas
            shadows
            camera={{ position: [0, 3.5, 11], fov: 65 }}
            style={{ width: '100%', height: '100%', background: '#02020f' }}
            gl={{ preserveDrawingBuffer: true, antialias: true }}
          >
            <Suspense fallback={null}>
              <PoliceChaseScene
                speed={speed}
                wantedLevel={wantedLevel}
                playerX={playerX}
                playerY={playerY}
                powerUps={powerUps}
                isNitro={nitroActive}
                liveryState={liveryState}
                canvasElement={canvasElement}
                vehicleType={vehicleType}
                isRamming={isRamming}
              />
            </Suspense>
          </Canvas>

          {/* Bespoke On-Screen Controls */}
          <div className="absolute bottom-3 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-6 pointer-events-auto">
            {vehicleType === 'car' && (
              <>
                <button
                  onMouseDown={() => { steerLeftRef.current = true; }}
                  onMouseUp={() => { steerLeftRef.current = false; }}
                  onMouseLeave={() => { steerLeftRef.current = false; }}
                  onTouchStart={(e) => { e.preventDefault(); steerLeftRef.current = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); steerLeftRef.current = false; }}
                  className="px-4 py-3 sm:px-6 sm:py-4 rounded-2xl bg-slate-900/90 border border-pink-500/50 hover:bg-pink-600/40 text-pink-400 hover:text-white font-mono font-black text-xs sm:text-sm uppercase shadow-lg shadow-pink-500/20 active:scale-95 transition-all select-none touch-none"
                >
                  ◄ SWERVE LEFT
                </button>

                <button
                  onClick={triggerCarSideRam}
                  className="px-4 py-3 sm:px-6 sm:py-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-mono font-black text-xs sm:text-sm uppercase shadow-lg shadow-red-500/30 active:scale-95 transition-all"
                >
                  💥 SIDE RAM COP
                </button>

                <button
                  onMouseDown={() => { steerRightRef.current = true; }}
                  onMouseUp={() => { steerRightRef.current = false; }}
                  onMouseLeave={() => { steerRightRef.current = false; }}
                  onTouchStart={(e) => { e.preventDefault(); steerRightRef.current = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); steerRightRef.current = false; }}
                  className="px-4 py-3 sm:px-6 sm:py-4 rounded-2xl bg-slate-900/90 border border-pink-500/50 hover:bg-pink-600/40 text-pink-400 hover:text-white font-mono font-black text-xs sm:text-sm uppercase shadow-lg shadow-pink-500/20 active:scale-95 transition-all select-none touch-none"
                >
                  SWERVE RIGHT ►
                </button>
              </>
            )}

            {vehicleType === 'bike' && (
              <>
                <button
                  onMouseDown={() => { steerLeftRef.current = true; }}
                  onMouseUp={() => { steerLeftRef.current = false; }}
                  onMouseLeave={() => { steerLeftRef.current = false; }}
                  onTouchStart={(e) => { e.preventDefault(); steerLeftRef.current = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); steerLeftRef.current = false; }}
                  className="px-4 py-3 sm:px-6 sm:py-4 rounded-2xl bg-slate-900/90 border border-yellow-500/50 hover:bg-yellow-600/40 text-yellow-400 hover:text-white font-mono font-black text-xs sm:text-sm uppercase shadow-lg shadow-yellow-500/20 active:scale-95 transition-all select-none touch-none"
                >
                  ◄ SLALOM LEFT
                </button>

                <button
                  onClick={triggerMotorbikeWheelie}
                  className="px-4 py-3 sm:px-6 sm:py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-mono font-black text-xs sm:text-sm uppercase shadow-lg shadow-yellow-500/30 active:scale-95 transition-all"
                >
                  🏍️ WHEELIE JUMP
                </button>

                <button
                  onMouseDown={() => { steerRightRef.current = true; }}
                  onMouseUp={() => { steerRightRef.current = false; }}
                  onMouseLeave={() => { steerRightRef.current = false; }}
                  onTouchStart={(e) => { e.preventDefault(); steerRightRef.current = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); steerRightRef.current = false; }}
                  className="px-4 py-3 sm:px-6 sm:py-4 rounded-2xl bg-slate-900/90 border border-yellow-500/50 hover:bg-yellow-600/40 text-yellow-400 hover:text-white font-mono font-black text-xs sm:text-sm uppercase shadow-lg shadow-yellow-500/20 active:scale-95 transition-all select-none touch-none"
                >
                  SLALOM RIGHT ►
                </button>
              </>
            )}

            {vehicleType === 'train' && (
              <div className="w-full flex items-center justify-center gap-3">
                <button
                  onClick={() => triggerTrainTrackSwitch(1)}
                  className={`px-4 py-3 sm:px-6 sm:py-4 rounded-2xl border font-mono font-black text-xs sm:text-sm uppercase transition-all ${
                    currentTrack === 1 ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/40' : 'bg-slate-900/90 border-slate-700 text-slate-300'
                  }`}
                >
                  🔀 TRACK 1 (LEFT)
                </button>

                <button
                  onClick={() => triggerTrainTrackSwitch(2)}
                  className={`px-4 py-3 sm:px-6 sm:py-4 rounded-2xl border font-mono font-black text-xs sm:text-sm uppercase transition-all ${
                    currentTrack === 2 ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/40' : 'bg-slate-900/90 border-slate-700 text-slate-300'
                  }`}
                >
                  🔀 TRACK 2 (CENTER)
                </button>

                <button
                  onClick={() => triggerTrainTrackSwitch(3)}
                  className={`px-4 py-3 sm:px-6 sm:py-4 rounded-2xl border font-mono font-black text-xs sm:text-sm uppercase transition-all ${
                    currentTrack === 3 ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/40' : 'bg-slate-900/90 border-slate-700 text-slate-300'
                  }`}
                >
                  🔀 TRACK 3 (RIGHT)
                </button>
              </div>
            )}

            {vehicleType === 'boat' && (
              <>
                <button
                  onMouseDown={() => { steerLeftRef.current = true; }}
                  onMouseUp={() => { steerLeftRef.current = false; }}
                  onMouseLeave={() => { steerLeftRef.current = false; }}
                  onTouchStart={(e) => { e.preventDefault(); steerLeftRef.current = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); steerLeftRef.current = false; }}
                  className="px-4 py-3 sm:px-6 sm:py-4 rounded-2xl bg-slate-900/90 border border-cyan-500/50 hover:bg-cyan-600/40 text-cyan-400 hover:text-white font-mono font-black text-xs sm:text-sm uppercase shadow-lg shadow-cyan-500/20 active:scale-95 transition-all select-none touch-none"
                >
                  ◄ PORT DRIFT
                </button>

                <button
                  onClick={triggerSpeedboatWaveJump}
                  className="px-4 py-3 sm:px-6 sm:py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono font-black text-xs sm:text-sm uppercase shadow-lg shadow-cyan-500/30 active:scale-95 transition-all"
                >
                  🌊 WAVE JUMP
                </button>

                <button
                  onMouseDown={() => { steerRightRef.current = true; }}
                  onMouseUp={() => { steerRightRef.current = false; }}
                  onMouseLeave={() => { steerRightRef.current = false; }}
                  onTouchStart={(e) => { e.preventDefault(); steerRightRef.current = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); steerRightRef.current = false; }}
                  className="px-4 py-3 sm:px-6 sm:py-4 rounded-2xl bg-slate-900/90 border border-cyan-500/50 hover:bg-cyan-600/40 text-cyan-400 hover:text-white font-mono font-black text-xs sm:text-sm uppercase shadow-lg shadow-cyan-500/20 active:scale-95 transition-all select-none touch-none"
                >
                  STARBOARD ►
                </button>
              </>
            )}

            {vehicleType === 'helicopter' && (
              <div className="w-full flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPlayerY(py => Math.min(2.5, py + 0.6))}
                    className="px-3 py-3 rounded-2xl bg-purple-950/80 border border-purple-500/60 text-purple-300 font-mono font-black text-xs uppercase"
                  >
                    ⬆️ ASCEND
                  </button>
                  <button
                    onClick={() => setPlayerY(py => Math.max(0, py - 0.6))}
                    className="px-3 py-3 rounded-2xl bg-purple-950/80 border border-purple-500/60 text-purple-300 font-mono font-black text-xs uppercase"
                  >
                    ⬇️ DESCEND
                  </button>
                </div>

                <button
                  onClick={triggerHelicopterFlares}
                  className={`px-4 py-3 rounded-2xl border font-mono font-black text-xs uppercase transition-all ${
                    flaresActive ? 'bg-purple-500 text-white border-purple-300 animate-pulse' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  }`}
                >
                  🎆 DEPLOY FLARES
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onMouseDown={() => { steerLeftRef.current = true; }}
                    onMouseUp={() => { steerLeftRef.current = false; }}
                    onMouseLeave={() => { steerLeftRef.current = false; }}
                    className="px-3 py-3 rounded-2xl bg-slate-900/90 border border-purple-500/50 text-purple-300 font-mono font-black text-xs uppercase"
                  >
                    ◄ BANK L
                  </button>
                  <button
                    onMouseDown={() => { steerRightRef.current = true; }}
                    onMouseUp={() => { steerRightRef.current = false; }}
                    onMouseLeave={() => { steerRightRef.current = false; }}
                    className="px-3 py-3 rounded-2xl bg-slate-900/90 border border-purple-500/50 text-purple-300 font-mono font-black text-xs uppercase"
                  >
                    BANK R ►
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/*  PHASE 4: BESPOKE GAME OVER SCREEN FOR EACH VEHICLE PATH  */}
      {phase === 'busted' && (
        <div className="flex-1 w-full flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-red-500/50 p-6 sm:p-8 flex flex-col gap-5 shadow-2xl overflow-hidden">
            <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-red-500 to-transparent absolute top-0 left-0 right-0" />
            
            <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                GAME OVER — {gameOverConfig.badge}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                {gameOverConfig.statusLabel}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl sm:text-4xl font-black text-red-500 uppercase leading-tight font-sans">
                {gameOverConfig.headline}
              </h2>
              <div className="text-5xl p-3 rounded-2xl bg-red-500/10 border border-red-500/30">
                {gameOverConfig.glyph}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {gameOverConfig.description}
            </p>

            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300">
              <span className="font-bold text-red-400 uppercase block mb-0.5">POLICE INCIDENT REPORT:</span>
              <p className="text-red-200">{gameOverConfig.detectiveReport}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={startGame}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                RETRY {vehicleType.toUpperCase()} ESCAPE
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  PHASE 5: ESCAPED SUCCESS SCREEN  */}
      {phase === 'escaped' && (
        <div className="flex-1 w-full flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-green-500/50 p-6 sm:p-8 flex flex-col gap-5 shadow-2xl overflow-hidden">
            <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-green-500 to-transparent absolute top-0 left-0 right-0" />
            
            <div className="flex items-center justify-between border-b border-green-500/30 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-green-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-green-400 animate-pulse" />
                MISSION COMPLETE — EVADED PURSUIT
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold border border-green-500/30">
                APB CLEARED
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl sm:text-4xl font-black text-green-400 uppercase leading-tight font-sans">
                ESCAPE SUCCESSFUL
              </h2>
              <div className="text-5xl p-3 rounded-2xl bg-green-500/10 border border-green-500/30">
                🏆
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              You successfully outran the Vice City police pursuit! The altered evidence file effectively misled city surveillance trackers.
            </p>

            <div className="p-3 rounded-xl bg-green-950/40 border border-green-500/30 text-xs font-mono text-green-300 space-y-1">
              <div className="flex justify-between"><span>FINAL SCORE:</span><span className="font-bold text-white">{score.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>CASH REWARD:</span><span className="font-bold text-green-400">+${(mission?.cashReward || 5000).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>HEAT STATUS:</span><span className="font-bold text-green-400">0 STARS (CLEARED)</span></div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 active:scale-95 transition-all"
              >
                RETURN TO HEIST HUB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
