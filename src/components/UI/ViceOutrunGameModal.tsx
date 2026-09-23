import React, { useRef, useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LiveryState } from '../../types';
import { Vehicle3D } from '../Three3D/Vehicle3D';
import { audioEngine } from '../../utils/audioEngine';
import { X, Star, Zap, Shield, AlertTriangle, Trophy, Download, ChevronRight, Play } from 'lucide-react';

// ── Props ─────────────────────────────────────────────────────────────────────
interface ViceHeistModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveryState: LiveryState;
  canvasElement: HTMLCanvasElement | null;
}

// ── Game phases ───────────────────────────────────────────────────────────────
type GamePhase = 'intro' | 'briefing' | 'playing' | 'busted' | 'escaped';

// ── Intro story slides ────────────────────────────────────────────────────────
const INTRO_SLIDES = [
  {
    eyebrow: 'VICE CITY — 2 AM',
    headline: 'ONE CLEAN\nBOOST.',
    body: 'A cherry-red supercar sits outside the Malibu Club. Engine running. Owner inside. You make your move.',
    accent: '#ff007f',
    glyph: '🌃',
  },
  {
    eyebrow: 'THE SCORE',
    headline: 'CUSTOM\nOR CAUGHT.',
    body: 'But a witness saw your face. The owner\'s calling the cops. You\'ve got minutes to respray this ride before the heat arrives.',
    accent: '#ffe600',
    glyph: '🔑',
  },
  {
    eyebrow: 'YOUR MOVE',
    headline: 'REDESIGN.\nEVADE.\nESCAPE.',
    body: 'Repaint the stolen car using the studio — change the livery, the finish, make it unrecognizable. Then floor it through Vice City.',
    accent: '#00f0ff',
    glyph: '🎨',
  },
  {
    eyebrow: 'COPS ON YOUR TAIL',
    headline: 'LOSE THE\n★★★★★ HEAT.',
    body: 'Police cruisers are already scrambling. Collect nitro, dodge roadblocks, EMP the chopper. The farther you run, the bigger your score.',
    accent: '#ff4400',
    glyph: '🚔',
  },
];

// ── Wanted level config ───────────────────────────────────────────────────────
const WANTED_THRESHOLDS = [0, 30, 80, 160, 280]; // seconds to reach each level

// ── Power-up types ────────────────────────────────────────────────────────────
type PowerUpType = 'nitro' | 'repair' | 'emp';
interface PowerUp {
  id: number;
  type: PowerUpType;
  x: number;
  z: number;
  active: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// 3D SCENE — Vice City Police Chase
// ══════════════════════════════════════════════════════════════════════════════

// Road & scenery scrolling scene
const PoliceChaseScene: React.FC<{
  speed: number;
  wantedLevel: number;
  playerX: number;
  powerUps: PowerUp[];
  onPowerUpCollect: (id: number, type: PowerUpType) => void;
  isNitro: boolean;
  liveryState: LiveryState;
  canvasElement: HTMLCanvasElement | null;
}> = ({ speed, wantedLevel, playerX, powerUps, onPowerUpCollect, isNitro, liveryState, canvasElement }) => {
  const roadOffsetRef = useRef(0);
  const treesRef = useRef<THREE.Group>(null);
  const copsRef = useRef<THREE.Group>(null);
  const lampRef = useRef<THREE.Group>(null);
  const buildingsRef = useRef<THREE.Group>(null);
  const sirenFlipRef = useRef(0);
  const cop1Ref = useRef<THREE.Mesh>(null);
  const cop2Ref = useRef<THREE.Mesh>(null);
  const chopperRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const { scene } = useThree();

  // Build procedural road texture once
  const roadTexture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 1024;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#111120';
    ctx.fillRect(0, 0, 512, 1024);
    // lane dividers
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 4;
    ctx.setLineDash([60, 40]);
    ctx.beginPath(); ctx.moveTo(170, 0); ctx.lineTo(170, 1024); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(340, 0); ctx.lineTo(340, 1024); ctx.stroke();
    // edge lines
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(8, 1024); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(504, 0); ctx.lineTo(504, 1024); ctx.stroke();
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    return tex;
  }, []);

  // Build palm tree geometry
  const palmGeo = useMemo(() => new THREE.CylinderGeometry(0.08, 0.15, 3, 6), []);
  const palmMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a3010' }), []);
  const leafMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a6b25' }), []);

  // Build siren light materials
  const redMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ff2020', emissive: '#ff0000', emissiveIntensity: 2 }), []);
  const blueMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2020ff', emissive: '#0000ff', emissiveIntensity: 2 }), []);

  useFrame((_, delta) => {
    const spd = speed * delta * 0.6;
    roadOffsetRef.current += spd;
    roadTexture.offset.y = roadOffsetRef.current;

    // Scroll trees
    if (treesRef.current) {
      treesRef.current.children.forEach((t) => {
        t.position.z += spd * 14;
        if (t.position.z > 12) t.position.z -= 60;
      });
    }
    // Scroll buildings
    if (buildingsRef.current) {
      buildingsRef.current.children.forEach((b) => {
        b.position.z += spd * 12;
        if (b.position.z > 20) b.position.z -= 80;
      });
    }
    // Scroll lamps
    if (lampRef.current) {
      lampRef.current.children.forEach((l) => {
        l.position.z += spd * 14;
        if (l.position.z > 12) l.position.z -= 40;
      });
    }

    // Police car chase AI
    if (cop1Ref.current) {
      const targetX = playerX * 2.2 + 0.6;
      cop1Ref.current.position.x += (targetX - cop1Ref.current.position.x) * 0.04;
      cop1Ref.current.position.z += (6.5 + wantedLevel * 0.3 - cop1Ref.current.position.z) * 0.02;
    }
    if (cop2Ref.current && wantedLevel >= 2) {
      const targetX = playerX * 2.2 - 0.6;
      cop2Ref.current.position.x += (targetX - cop2Ref.current.position.x) * 0.03;
      cop2Ref.current.position.z += (8 + wantedLevel * 0.2 - cop2Ref.current.position.z) * 0.015;
    }

    // Siren flash
    sirenFlipRef.current += delta * 6;
    const redOn = Math.sin(sirenFlipRef.current) > 0;
    if (cop1Ref.current) {
      const lights = cop1Ref.current.children.filter(c => c.name === 'siren');
      lights.forEach((l, i) => {
        const m = (l as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (i === 0) m.emissiveIntensity = redOn ? 3 : 0.1;
        if (i === 1) m.emissiveIntensity = redOn ? 0.1 : 3;
      });
    }

    // Helicopter searchlight sweep (3+ stars)
    if (chopperRef.current && wantedLevel >= 3) {
      chopperRef.current.position.x = Math.sin(sirenFlipRef.current * 0.4) * 3 + playerX * 2;
      chopperRef.current.position.z = 4;
      chopperRef.current.rotation.y += delta * 0.5;
    }
    if (spotlightRef.current && wantedLevel >= 3) {
      spotlightRef.current.target.position.x = playerX * 2 + Math.sin(sirenFlipRef.current * 0.3) * 1.5;
      spotlightRef.current.target.updateMatrixWorld();
    }
  });

  // Generate trees at init
  const treePosArr = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 14; i++) {
      arr.push({ x: i % 2 === 0 ? -5 : 5, z: -50 + i * 7.5, side: i % 2 });
    }
    return arr;
  }, []);

  // Generate buildings
  const buildingArr = useMemo(() => {
    const arr = [];
    const colors = ['#ff007f', '#00f0ff', '#ffe600', '#ff6600', '#cc00ff'];
    for (let i = 0; i < 12; i++) {
      arr.push({
        x: i % 2 === 0 ? -8 - Math.random() * 2 : 8 + Math.random() * 2,
        z: -80 + i * 13,
        h: 4 + Math.random() * 10,
        w: 1.5 + Math.random() * 2,
        color: colors[i % colors.length],
      });
    }
    return arr;
  }, []);

  // Lamp posts
  const lampArr = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 10; i++) {
      arr.push({ x: i % 2 === 0 ? -3.5 : 3.5, z: -40 + i * 8 });
    }
    return arr;
  }, []);

  return (
    <>
      {/* Sky */}
      <color attach="background" args={['#02020f']} />
      <fog attach="fog" args={['#02020f', 18, 60]} />

      {/* Ambient + neon fill */}
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 10, 0]} intensity={1.2} color="#1a0035" />
      <pointLight position={[-4, 3, 2]} intensity={2} color="#ff007f" />
      <pointLight position={[4, 3, 2]} intensity={2} color="#00f0ff" />

      {/* Helicopter searchlight (3+ stars) */}
      <group ref={chopperRef} position={[0, 12, 4]} visible={false}>
        {/* chopper body */}
        <mesh>
          <boxGeometry args={[0.8, 0.3, 1.2]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <pointLight color="#ffff80" intensity={wantedLevel >= 3 ? 3 : 0} distance={20} />
      </group>
      {wantedLevel >= 3 && (
        <spotLight
          ref={spotlightRef}
          position={[0, 14, 4]}
          angle={0.18}
          penumbra={0.6}
          intensity={12}
          color="#ffffaa"
          castShadow
        />
      )}

      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[7, 120]} />
        <meshStandardMaterial map={roadTexture} roughness={0.3} metalness={0.15} />
      </mesh>

      {/* Sidewalk strips */}
      {[-4, 4].map((sx) => (
        <mesh key={sx} rotation={[-Math.PI / 2, 0, 0]} position={[sx, -0.005, 0]}>
          <planeGeometry args={[1.2, 120]} />
          <meshStandardMaterial color="#2a2a3a" />
        </mesh>
      ))}

      {/* Buildings */}
      <group ref={buildingsRef}>
        {buildingArr.map((b, i) => (
          <group key={i} position={[b.x, b.h / 2, b.z]}>
            <mesh>
              <boxGeometry args={[b.w, b.h, b.w]} />
              <meshStandardMaterial color="#111122" emissive={b.color} emissiveIntensity={0.08} />
            </mesh>
            {/* neon outline strip */}
            <mesh position={[0, b.h / 2 + 0.05, 0]}>
              <boxGeometry args={[b.w + 0.05, 0.08, b.w + 0.05]} />
              <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={1.5} />
            </mesh>
            {/* windows */}
            {[...Array(Math.floor(b.h / 2))].map((_, wi) => (
              <mesh key={wi} position={[0.01, -b.h / 2 + 1 + wi * 1.8, b.w / 2 + 0.01]}>
                <planeGeometry args={[0.6, 0.4]} />
                <meshStandardMaterial
                  color="#fff"
                  emissive={Math.random() > 0.4 ? '#ffee88' : '#002244'}
                  emissiveIntensity={Math.random() > 0.4 ? 1.2 : 0.5}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Palm Trees */}
      <group ref={treesRef}>
        {treePosArr.map((t, i) => (
          <group key={i} position={[t.x, 0, t.z]}>
            <mesh geometry={palmGeo} material={palmMat} position={[0, 1.5, 0]} />
            {[0, 60, 120, 180, 240, 300].map((angle, li) => (
              <mesh key={li} position={[
                Math.cos((angle * Math.PI) / 180) * 0.7,
                3.2,
                Math.sin((angle * Math.PI) / 180) * 0.5
              ]} rotation={[0.4, (angle * Math.PI) / 180, 0]}>
                <sphereGeometry args={[0.5, 5, 4]} />
                <primitive object={leafMat} attach="material" />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Street Lamps */}
      <group ref={lampRef}>
        {lampArr.map((l, i) => (
          <group key={i} position={[l.x, 0, l.z]}>
            <mesh position={[0, 2, 0]}>
              <cylinderGeometry args={[0.04, 0.06, 4, 5]} />
              <meshStandardMaterial color="#334" />
            </mesh>
            <pointLight position={[0, 4.2, 0]} intensity={2} color="#ffeebb" distance={8} />
            <mesh position={[0, 4.1, 0]}>
              <sphereGeometry args={[0.18, 8, 6]} />
              <meshStandardMaterial emissive="#ffeebb" emissiveIntensity={3} color="#fff" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Power-up collectibles */}
      {powerUps.filter(p => p.active).map((p) => (
        <mesh key={p.id} position={[p.x * 2.5, 0.35, p.z]} rotation={[0, Date.now() * 0.001, 0]}>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial
            color={p.type === 'nitro' ? '#00f0ff' : p.type === 'repair' ? '#00ff44' : '#ff00ff'}
            emissive={p.type === 'nitro' ? '#00f0ff' : p.type === 'repair' ? '#00ff44' : '#ff00ff'}
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}

      {/* PLAYER CAR */}
      <group position={[playerX * 2.5, 0, 2]}>
        <Suspense fallback={null}>
          <Vehicle3D
            liveryState={liveryState}
            canvasElement={canvasElement}
          />
        </Suspense>
        {isNitro && (
          <pointLight position={[0, 0.5, 1.2]} intensity={6} color="#00f0ff" distance={4} />
        )}
      </group>

      {/* POLICE CAR 1 — always chasing */}
      <mesh ref={cop1Ref} position={[0.6, 0.3, 6.5]}>
        <boxGeometry args={[1.2, 0.5, 2.2]} />
        <meshStandardMaterial color="#1a1a8c" />
        {/* Siren lights */}
        <mesh name="siren" position={[-0.3, 0.35, 0]}>
          <boxGeometry args={[0.25, 0.12, 0.35]} />
          <primitive object={redMat} attach="material" />
        </mesh>
        <mesh name="siren" position={[0.3, 0.35, 0]}>
          <boxGeometry args={[0.25, 0.12, 0.35]} />
          <primitive object={blueMat} attach="material" />
        </mesh>
        <pointLight position={[-0.3, 0.5, 0]} intensity={4} color="#ff0000" distance={5} />
        <pointLight position={[0.3, 0.5, 0]} intensity={4} color="#0000ff" distance={5} />
      </mesh>

      {/* POLICE CAR 2 — appears at 2+ stars */}
      {wantedLevel >= 2 && (
        <mesh ref={cop2Ref} position={[-0.6, 0.3, 8]}>
          <boxGeometry args={[1.2, 0.5, 2.2]} />
          <meshStandardMaterial color="#1a1a8c" />
          <mesh name="siren" position={[-0.3, 0.35, 0]}>
            <boxGeometry args={[0.25, 0.12, 0.35]} />
            <primitive object={blueMat} attach="material" />
          </mesh>
          <mesh name="siren" position={[0.3, 0.35, 0]}>
            <boxGeometry args={[0.25, 0.12, 0.35]} />
            <primitive object={redMat} attach="material" />
          </mesh>
          <pointLight position={[0, 0.5, 0]} intensity={3} color="#0044ff" distance={5} />
        </mesh>
      )}

      {/* ROADBLOCK — appears at 4+ stars */}
      {wantedLevel >= 4 && (
        <mesh position={[0, 0.4, -18]}>
          <boxGeometry args={[6, 0.8, 0.4]} />
          <meshStandardMaterial color="#222255" />
        </mesh>
      )}
    </>
  );
};

// ── Score board helper ────────────────────────────────────────────────────────
function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN MODAL COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export const ViceOutrunGameModal: React.FC<ViceHeistModalProps> = ({
  isOpen,
  onClose,
  liveryState,
  canvasElement,
}) => {
  // Phase
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [introSlide, setIntroSlide] = useState(0);
  const [slideVisible, setSlideVisible] = useState(true);

  // Game state
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wantedLevel, setWantedLevel] = useState(1);
  const [hp, setHp] = useState(100);
  const [nitroActive, setNitroActive] = useState(false);
  const [nitroCharge, setNitroCharge] = useState(0); // 0–100
  const [playerX, setPlayerX] = useState(0); // -1 left, 0 center, 1 right
  const [speed, setSpeed] = useState(1.0);
  const [nearMisses, setNearMisses] = useState(0);
  const [escapeDistance, setEscapeDistance] = useState(0);
  const [empActive, setEmpActive] = useState(false);
  const [empCooldown, setEmpCooldown] = useState(0);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [nextPuId, setNextPuId] = useState(0);
  const [screenFlash, setScreenFlash] = useState<'red' | 'blue' | 'green' | null>(null);

  // Refs
  const gameLoopRef = useRef<number | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const lastTimeRef = useRef(0);
  const puSpawnTimer = useRef(0);
  const nearMissTimer = useRef(0);

  // ── Reset game ─────────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    setScore(0);
    setTimeElapsed(0);
    setWantedLevel(1);
    setHp(100);
    setNitroActive(false);
    setNitroCharge(0);
    setPlayerX(0);
    setSpeed(1.0);
    setNearMisses(0);
    setEscapeDistance(0);
    setEmpActive(false);
    setEmpCooldown(0);
    setPowerUps([]);
    setNextPuId(0);
    setScreenFlash(null);
    lastTimeRef.current = 0;
    puSpawnTimer.current = 0;
  }, []);

  // ── Phase transitions ──────────────────────────────────────────────────────
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

  // ── Keyboard input ─────────────────────────────────────────────────────────
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

  // ── Game loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    const tick = (ts: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      const dt = Math.min((ts - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = ts;

      // Time & distance
      setTimeElapsed(t => {
        const next = t + dt;
        // Wanted level escalation
        let wl = 1;
        for (let i = WANTED_THRESHOLDS.length - 1; i >= 0; i--) {
          if (next >= WANTED_THRESHOLDS[i]) { wl = i + 1; break; }
        }
        setWantedLevel(prevWl => {
          const clamped = Math.min(wl, 5);
          if (clamped > prevWl) {
            audioEngine.playWantedLevelUpSFX();
          }
          return clamped;
        });
        return next;
      });
      setEscapeDistance(d => d + dt * 40 * (nitroActive ? 2 : 1));

      // Speed ramp
      setSpeed(s => Math.min(s + dt * 0.02, 3.5));

      // Score per tick
      setScore(sc => sc + Math.floor(dt * 10 * wantedLevel * (nitroActive ? 2 : 1)));

      // Nitro drain / recharge
      setNitroCharge(n => {
        if (nitroActive) return Math.max(0, n - dt * 35);
        return Math.min(100, n + dt * 8);
      });
      if (nitroActive && nitroCharge <= 0) setNitroActive(false);

      // EMP cooldown
      setEmpCooldown(c => Math.max(0, c - dt));

      // Player steering
      setPlayerX(px => {
        let nx = px;
        if (keysRef.current.has('ArrowLeft') || keysRef.current.has('KeyA')) nx -= dt * 2.8;
        if (keysRef.current.has('ArrowRight') || keysRef.current.has('KeyD')) nx += dt * 2.8;
        if (keysRef.current.has('Space') && nitroCharge > 10 && !nitroActive) {
          setNitroActive(true);
          audioEngine.playNitroSFX();
        }
        return Math.max(-1, Math.min(1, nx));
      });

      // Spawn power-ups
      puSpawnTimer.current += dt;
      if (puSpawnTimer.current > 4 + Math.random() * 3) {
        puSpawnTimer.current = 0;
        const types: PowerUpType[] = ['nitro', 'repair', 'emp'];
        const type = types[Math.floor(Math.random() * types.length)];
        const lane = [-0.8, 0, 0.8][Math.floor(Math.random() * 3)];
        setNextPuId(id => {
          setPowerUps(pus => [...pus, { id, type, x: lane, z: -20, active: true }]);
          return id + 1;
        });
      }

      // Scroll power-ups and check collection
      setPowerUps(pus =>
        pus.map(p => {
          if (!p.active) return p;
          const nz = p.z + dt * 14 * speed;
          // collect
          if (nz > 1.5 && nz < 3 && Math.abs(p.x - playerX) < 0.5) {
            // collected!
            setScreenFlash(p.type === 'nitro' ? 'blue' : p.type === 'repair' ? 'green' : 'red');
            setTimeout(() => setScreenFlash(null), 300);
            if (p.type === 'repair') {
              setHp(h => Math.min(100, h + 25));
              audioEngine.playCoinSFX();
            }
            if (p.type === 'nitro') {
              setNitroCharge(100);
              audioEngine.playNitroSFX();
            }
            if (p.type === 'emp') {
              setEmpActive(true);
              audioEngine.playEmpSFX();
              setTimeout(() => setEmpActive(false), 5000);
            }
            setScore(sc => sc + 200);
            return { ...p, active: false };
          }
          if (nz > 15) return { ...p, active: false };
          return { ...p, z: nz };
        }).filter(p => p.active || p.z < 15)
      );

      // Near-miss / collision with cops (simplified)
      nearMissTimer.current += dt;
      if (nearMissTimer.current > (8 - wantedLevel * 1.2) && !empActive) {
        nearMissTimer.current = 0;
        const miss = Math.random() < 0.35;
        if (miss) {
          setHp(h => {
            const dmg = 8 + wantedLevel * 4;
            const nh = h - dmg;
            if (nh <= 0) {
              setPhase('busted');
              audioEngine.playCrashSFX();
              audioEngine.playGameOverSFX();
              return 0;
            }
            setScreenFlash('red');
            audioEngine.playCrashSFX();
            setTimeout(() => setScreenFlash(null), 250);
            return nh;
          });
        } else {
          setNearMisses(n => n + 1);
          setScore(sc => sc + 50);
          audioEngine.playNearMissSFX();
        }
      }

      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, nitroActive, nitroCharge, empActive, speed, playerX, wantedLevel]);

  // Check escaped (survive 5 minutes)
  useEffect(() => {
    if (timeElapsed >= 300 && phase === 'playing') {
      setPhase('escaped');
    }
  }, [timeElapsed, phase]);

  // ── Download wanted poster ─────────────────────────────────────────────────
  const downloadPoster = useCallback(() => {
    const w = 900, h = 1200;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d')!;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0010');
    grad.addColorStop(1, '#1a0005');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Aged paper texture overlay
    ctx.fillStyle = 'rgba(180,140,80,0.08)';
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = 12;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    ctx.strokeStyle = '#990000';
    ctx.lineWidth = 4;
    ctx.strokeRect(28, 28, w - 56, h - 56);

    // WANTED header
    ctx.fillStyle = '#cc0000';
    ctx.font = 'bold 110px Impact, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.15em';
    ctx.fillText('WANTED', w / 2, 130);

    // Subtitle
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 34px Impact, sans-serif';
    ctx.fillText('VICE CITY POLICE DEPARTMENT', w / 2, 175);

    // Gold stars
    const starRating = phase === 'escaped' ? wantedLevel : Math.max(1, wantedLevel - 1);
    ctx.font = '50px serif';
    ctx.fillStyle = '#ffdd00';
    const starsX = w / 2 - (starRating * 32);
    for (let i = 0; i < starRating; i++) ctx.fillText('★', starsX + i * 60, 230);
    for (let i = starRating; i < 5; i++) { ctx.fillStyle = '#333'; ctx.fillText('★', starsX + i * 60, 230); ctx.fillStyle = '#ffdd00'; }

    // Car render box
    ctx.fillStyle = '#111';
    ctx.fillRect(60, 250, w - 120, 420);
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 250, w - 120, 420);

    if (canvasElement) {
      try {
        ctx.drawImage(canvasElement, 60, 250, w - 120, 420);
      } catch (_) {
        ctx.fillStyle = '#ff007f33';
        ctx.fillRect(60, 250, w - 120, 420);
      }
    }

    // "CAR RENDER" label
    ctx.fillStyle = '#ff007f';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('STOLEN VEHICLE — EXHIBIT A', 80, 690);

    // Stats block
    ctx.fillStyle = '#cc0000';
    ctx.font = 'bold 40px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`ESCAPE SCORE: ${score.toLocaleString()} PTS`, w / 2, 760);

    const stats = [
      { label: 'TIME EVADED', val: formatTime(timeElapsed) },
      { label: 'DISTANCE COVERED', val: `${Math.floor(escapeDistance)} m` },
      { label: 'NEAR-MISSES', val: nearMisses.toString() },
      { label: 'WANTED LEVEL', val: '★'.repeat(starRating) },
      { label: 'VEHICLE', val: liveryState.vehicle.toUpperCase() },
      { label: 'STATUS', val: phase === 'escaped' ? '✔ ESCAPED' : '✘ BUSTED' },
    ];

    ctx.font = '22px monospace';
    ctx.textAlign = 'left';
    stats.forEach((s, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const sx = col === 0 ? 80 : w / 2 + 20;
      const sy = 820 + row * 70;
      ctx.fillStyle = '#888';
      ctx.fillText(s.label, sx, sy);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 26px monospace';
      ctx.fillText(s.val, sx, sy + 32);
      ctx.font = '22px monospace';
    });

    // Footer
    ctx.fillStyle = '#ff007f';
    ctx.font = 'bold 18px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IF SEEN, DO NOT APPROACH — CONSIDERED ARMED & DANGEROUS', w / 2, 1140);
    ctx.fillStyle = '#333';
    ctx.font = '13px monospace';
    ctx.fillText('Vice City PD — Case #' + Math.floor(Math.random() * 900000 + 100000), w / 2, 1168);

    const link = document.createElement('a');
    link.download = `ViceCity_WantedPoster_${score}pts.png`;
    link.href = c.toDataURL('image/png');
    link.click();
  }, [canvasElement, score, timeElapsed, escapeDistance, nearMisses, wantedLevel, liveryState.vehicle, phase]);

  // ── Touch controls ─────────────────────────────────────────────────────────
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 10) {
      setPlayerX(px => Math.max(-1, Math.min(1, px + (dx > 0 ? 0.04 : -0.04))));
    }
  };

  if (!isOpen) return null;

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER PHASES
  // ══════════════════════════════════════════════════════════════════════════

  const slide = INTRO_SLIDES[introSlide];
  const isLastSlide = introSlide === INTRO_SLIDES.length - 1;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-stretch justify-center"
      style={{ background: 'rgba(0,0,0,0.97)' }}
      onTouchStart={phase === 'playing' ? handleTouchStart : undefined}
      onTouchMove={phase === 'playing' ? handleTouchMove : undefined}
    >
      {/* Close button always available */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[80] w-9 h-9 flex items-center justify-center rounded-full bg-black/70 border border-red-500/50 text-red-400 hover:text-white hover:bg-red-500/30 transition-all"
      >
        <X size={16} />
      </button>

      {/* ─── INTRO SLIDES ──────────────────────────────────────────────────── */}
      {phase === 'intro' && (
        <div className="flex items-center justify-center w-full p-4">
          <div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(150deg, #0a000f 0%, #100005 100%)',
              border: `1px solid ${slide.accent}44`,
              boxShadow: `0 0 0 1px ${slide.accent}18, 0 40px 100px rgba(0,0,0,0.9), 0 0 80px ${slide.accent}22`,
            }}
          >
            {/* Top bar */}
            <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${slide.accent}, transparent)` }} />

            <div className="px-8 py-8 flex flex-col gap-6">
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span
                  className="text-[10px] font-mono tracking-[0.35em] uppercase"
                  style={{ color: slide.accent }}
                >
                  {slide.eyebrow}
                </span>
                <div className="flex-1 h-[1px]" style={{ background: `${slide.accent}30` }} />
              </div>

              {/* Headline + glyph */}
              <div
                className="flex items-center justify-between gap-4"
                style={{ opacity: slideVisible ? 1 : 0, transform: slideVisible ? 'none' : 'translateY(10px)', transition: 'all 0.22s' }}
              >
                <h2
                  className="font-black leading-[0.9] whitespace-pre-line"
                  style={{
                    fontFamily: 'Impact, "Arial Narrow", sans-serif',
                    fontSize: 'clamp(2.2rem, 7vw, 3.2rem)',
                    color: '#fff',
                    textShadow: `0 0 50px ${slide.accent}66, 0 0 100px ${slide.accent}33`,
                  }}
                >
                  {slide.headline}
                </h2>
                <div
                  className="shrink-0 flex items-center justify-center rounded-2xl"
                  style={{
                    width: 84, height: 84,
                    background: `${slide.accent}15`,
                    border: `1px solid ${slide.accent}35`,
                    fontSize: 40,
                    filter: `drop-shadow(0 0 16px ${slide.accent}88)`,
                  }}
                >
                  {slide.glyph}
                </div>
              </div>

              {/* Body */}
              <p
                className="text-[14px] text-gray-300 leading-relaxed"
                style={{ opacity: slideVisible ? 1 : 0, transition: 'opacity 0.3s 0.07s' }}
              >
                {slide.body}
              </p>

              {/* Nav */}
              <div className="flex items-center justify-between pt-1">
                {/* Dots */}
                <div className="flex items-center gap-2">
                  {INTRO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goSlide(i)}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === introSlide ? 22 : 7,
                        height: 7,
                        background: i === introSlide ? slide.accent : '#333',
                        boxShadow: i === introSlide ? `0 0 8px ${slide.accent}` : 'none',
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {introSlide > 0 && (
                    <button
                      onClick={() => goSlide(introSlide - 1)}
                      className="px-3 py-2 rounded-xl text-xs font-mono text-gray-500 hover:text-white border border-white/10 hover:border-white/25 transition-all"
                    >
                      ←
                    </button>
                  )}
                  <button
                    onClick={() => isLastSlide ? startBriefing() : goSlide(introSlide + 1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-mono font-black text-black transition-all hover:scale-[1.04] active:scale-[0.96]"
                    style={{ background: slide.accent, boxShadow: `0 0 24px ${slide.accent}66` }}
                  >
                    {isLastSlide ? (
                      <><Play size={13} /> START THE HEIST</>
                    ) : (
                      <>NEXT <ChevronRight size={13} /></>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Step counter */}
            <div className="px-8 pb-4 text-[9px] font-mono tracking-[0.28em] opacity-20" style={{ color: slide.accent }}>
              {String(introSlide + 1).padStart(2, '0')} / {String(INTRO_SLIDES.length).padStart(2, '0')}
            </div>
          </div>
        </div>
      )}

      {/* ─── PRE-GAME BRIEFING ─────────────────────────────────────────────── */}
      {phase === 'briefing' && (
        <div className="flex items-center justify-center w-full p-4">
          <div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(150deg, #080810 0%, #0a0005 100%)',
              border: '1px solid #ff007f44',
              boxShadow: '0 0 80px #ff007f22, 0 40px 100px rgba(0,0,0,0.9)',
            }}
          >
            <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, transparent, #ff007f, transparent)' }} />

            <div className="px-8 py-7 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-red-500">MISSION BRIEFING</span>
                <div className="flex-1 h-[1px] bg-red-500/20" />
              </div>

              <h2 className="text-3xl font-black text-white leading-tight" style={{ fontFamily: 'Impact, sans-serif', textShadow: '0 0 40px #ff007f88' }}>
                CUSTOMIZE FIRST.<br />THEN FLOOR IT.
              </h2>

              <div className="space-y-3">
                {[
                  { icon: '🎨', text: 'The livery studio is open — repaint your stolen ride to lose the description.' },
                  { icon: '⬅️➡️', text: 'During the chase: Arrow keys / A & D to swerve between lanes.' },
                  { icon: '⚡', text: 'SPACE — activate Nitro (collect blue pickups to recharge).' },
                  { icon: '🟢', text: 'Green crates restore HP. Purple crates deploy EMP to disable cops.' },
                  { icon: '⭐', text: 'Survive 5 minutes to escape. The longer you last, the higher your WANTED level.' },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <span className="text-xl shrink-0">{tip.icon}</span>
                    <span className="text-sm text-gray-300 leading-relaxed">{tip.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={startGame}
                className="w-full py-4 rounded-xl font-black text-black text-lg flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(90deg, #ff007f, #ff4400)', boxShadow: '0 0 40px #ff007f88' }}
              >
                <Play size={20} /> LAUNCH POLICE CHASE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PLAYING ──────────────────────────────────────────────────────── */}
      {phase === 'playing' && (
        <div className="relative w-full h-full flex flex-col">
          {/* Screen flash overlay */}
          {screenFlash && (
            <div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                background: screenFlash === 'red' ? 'rgba(255,0,0,0.22)' : screenFlash === 'blue' ? 'rgba(0,100,255,0.22)' : 'rgba(0,255,60,0.22)',
                transition: 'opacity 0.1s',
              }}
            />
          )}

          {/* ── HUD TOP ─────────────────────────────────────────────────── */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between p-3 pointer-events-none">
            {/* Left: Wanted Stars + HP */}
            <div className="flex flex-col gap-1.5">
              {/* Wanted stars */}
              <div className="flex items-center gap-1 bg-black/70 px-3 py-1.5 rounded-xl border border-red-500/40 backdrop-blur-sm">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    className={s <= wantedLevel ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}
                    style={s <= wantedLevel ? { filter: 'drop-shadow(0 0 4px #ffdd00)' } : {}}
                  />
                ))}
                <span className="text-[10px] font-mono text-red-400 ml-1">WANTED</span>
              </div>

              {/* HP bar */}
              <div className="flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
                <Shield size={13} className="text-green-400" />
                <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${hp}%`,
                      background: hp > 50 ? '#22c55e' : hp > 25 ? '#f59e0b' : '#ef4444',
                      boxShadow: hp > 50 ? '0 0 6px #22c55e' : '0 0 6px #ef4444',
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-gray-400">{hp}%</span>
              </div>
            </div>

            {/* Center: Score & Time */}
            <div className="flex flex-col items-center gap-1">
              <div className="bg-black/70 px-4 py-1.5 rounded-xl border border-vice-cyan/30 backdrop-blur-sm text-center">
                <div className="text-[11px] font-mono text-gray-500 tracking-widest">SCORE</div>
                <div className="text-xl font-black font-mono text-white" style={{ textShadow: '0 0 10px #00f0ff' }}>
                  {score.toLocaleString()}
                </div>
              </div>
              <div className="bg-black/70 px-3 py-1 rounded-xl border border-white/10 backdrop-blur-sm text-center">
                <span className="text-[10px] font-mono text-gray-400">{formatTime(timeElapsed)}</span>
                <span className="text-[9px] font-mono text-gray-600 ml-1">/ 5:00</span>
              </div>
            </div>

            {/* Right: Nitro + EMP */}
            <div className="flex flex-col gap-1.5 items-end">
              {/* Nitro */}
              <div className="flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-xl border border-vice-cyan/30 backdrop-blur-sm">
                <Zap size={13} className={nitroActive ? 'text-vice-cyan animate-pulse' : 'text-gray-600'} />
                <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${nitroCharge}%`,
                      background: nitroActive ? '#00f0ff' : '#0066aa',
                      boxShadow: nitroActive ? '0 0 8px #00f0ff' : 'none',
                    }}
                  />
                </div>
                <span className="text-[9px] font-mono text-gray-500">NOS</span>
              </div>

              {/* EMP */}
              {empActive && (
                <div className="flex items-center gap-1.5 bg-purple-900/60 px-3 py-1.5 rounded-xl border border-purple-400/50 backdrop-blur-sm">
                  <AlertTriangle size={12} className="text-purple-300 animate-pulse" />
                  <span className="text-[10px] font-mono text-purple-300">EMP ACTIVE</span>
                </div>
              )}

              {/* Distance */}
              <div className="bg-black/70 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] font-mono text-gray-400">{Math.floor(escapeDistance)}m</span>
              </div>
            </div>
          </div>

          {/* ── 3D CANVAS ─────────────────────────────────────────────────── */}
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
                powerUps={powerUps}
                onPowerUpCollect={() => {}}
                isNitro={nitroActive}
                liveryState={liveryState}
                canvasElement={canvasElement}
              />
            </Suspense>
          </Canvas>

          {/* ── BOTTOM CONTROLS HINT ──────────────────────────────────────── */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-black/60 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm pointer-events-none">
            <span className="text-[10px] font-mono text-gray-500">◀ ▶ STEER</span>
            <div className="w-px h-3 bg-gray-700" />
            <span className="text-[10px] font-mono text-gray-500">SPACE NITRO</span>
            <div className="w-px h-3 bg-gray-700" />
            <span className="text-[10px] font-mono text-gray-500">ESC ABORT</span>
          </div>
        </div>
      )}

      {/* ─── BUSTED SCREEN ────────────────────────────────────────────────── */}
      {phase === 'busted' && (
        <div className="flex items-center justify-center w-full p-4">
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(150deg, #1a0000 0%, #0a0000 100%)',
              border: '1px solid #cc000055',
              boxShadow: '0 0 80px #cc000033',
            }}
          >
            <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, transparent, #cc0000, transparent)' }} />
            <div className="px-8 py-8 flex flex-col items-center gap-5 text-center">
              <div className="text-6xl animate-bounce">🚔</div>
              <h2
                className="text-5xl font-black text-red-500 leading-tight"
                style={{ fontFamily: 'Impact, sans-serif', textShadow: '0 0 40px #cc0000' }}
              >
                BUSTED!
              </h2>
              <p className="text-gray-400 text-sm">The cops caught up. You didn't make it out of Vice City.</p>

              {/* Stats */}
              <div className="w-full grid grid-cols-2 gap-3">
                {[
                  { l: 'FINAL SCORE', v: score.toLocaleString(), accent: '#ff007f' },
                  { l: 'TIME SURVIVED', v: formatTime(timeElapsed), accent: '#ffe600' },
                  { l: 'DISTANCE', v: `${Math.floor(escapeDistance)}m`, accent: '#00f0ff' },
                  { l: 'NEAR-MISSES', v: nearMisses.toString(), accent: '#ff4400' },
                  { l: 'WANTED LEVEL', v: '★'.repeat(Math.max(1, wantedLevel - 1)), accent: '#ffdd00' },
                  { l: 'VEHICLE', v: liveryState.vehicle.toUpperCase(), accent: '#888' },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <div className="text-[9px] font-mono tracking-widest text-gray-600 uppercase">{s.l}</div>
                    <div className="text-lg font-black font-mono mt-0.5" style={{ color: s.accent }}>{s.v}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={downloadPoster}
                  className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Download size={15} /> WANTED POSTER
                </button>
                <button
                  onClick={() => { resetGame(); setPhase('playing'); }}
                  className="flex-1 py-3 rounded-xl font-black text-sm text-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(90deg, #ff007f, #ff4400)', boxShadow: '0 0 20px #ff007f66' }}
                >
                  <Play size={15} /> TRY AGAIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ESCAPED SCREEN ───────────────────────────────────────────────── */}
      {phase === 'escaped' && (
        <div className="flex items-center justify-center w-full p-4">
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(150deg, #000a1a 0%, #00100a 100%)',
              border: '1px solid #00f0ff55',
              boxShadow: '0 0 80px #00f0ff22',
            }}
          >
            <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)' }} />
            <div className="px-8 py-8 flex flex-col items-center gap-5 text-center">
              <div className="text-6xl">🏆</div>
              <h2
                className="text-4xl font-black text-vice-cyan leading-tight"
                style={{ fontFamily: 'Impact, sans-serif', textShadow: '0 0 40px #00f0ff' }}
              >
                YOU ESCAPED!
              </h2>
              <p className="text-gray-300 text-sm">5 minutes. Vice City in the rearview. The heat never caught up.</p>

              {/* Stars */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={28}
                    className={s <= wantedLevel ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}
                    style={s <= wantedLevel ? { filter: 'drop-shadow(0 0 6px #ffdd00)' } : {}}
                  />
                ))}
              </div>

              {/* Stats */}
              <div className="w-full grid grid-cols-2 gap-3">
                {[
                  { l: 'FINAL SCORE', v: score.toLocaleString(), accent: '#00f0ff' },
                  { l: 'TIME SURVIVED', v: formatTime(timeElapsed), accent: '#ffe600' },
                  { l: 'DISTANCE', v: `${Math.floor(escapeDistance)}m`, accent: '#ff007f' },
                  { l: 'NEAR-MISSES', v: nearMisses.toString(), accent: '#ff4400' },
                  { l: 'PEAK WANTED', v: '★'.repeat(wantedLevel), accent: '#ffdd00' },
                  { l: 'VEHICLE', v: liveryState.vehicle.toUpperCase(), accent: '#00f0ff' },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <div className="text-[9px] font-mono tracking-widest text-gray-600 uppercase">{s.l}</div>
                    <div className="text-lg font-black font-mono mt-0.5" style={{ color: s.accent }}>{s.v}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={downloadPoster}
                  className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(90deg, #00f0ff22, #ff007f22)', border: '1px solid #00f0ff44', color: '#00f0ff' }}
                >
                  <Trophy size={15} /> DOWNLOAD POSTER
                </button>
                <button
                  onClick={() => { resetGame(); setPhase('playing'); }}
                  className="flex-1 py-3 rounded-xl font-black text-sm text-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(90deg, #00f0ff, #007fff)', boxShadow: '0 0 20px #00f0ff66' }}
                >
                  <Play size={15} /> PLAY AGAIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
