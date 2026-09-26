import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { LiveryState, CameraPreset, GraphicsQuality } from '../../types';
import { Vehicle3D } from './Vehicle3D';
import { Camera, Sliders } from 'lucide-react';

interface GarageSceneProps {
  liveryState: LiveryState;
  onUpdateState?: (updates: Partial<LiveryState>) => void;
  canvasElement: HTMLCanvasElement | null;
  cameraPreset: CameraPreset;
  onSelectCameraPreset?: (preset: CameraPreset) => void;
  quality?: GraphicsQuality;
  onSelectQuality?: (q: GraphicsQuality) => void;
}

const CAMERA_OPTIONS: { id: CameraPreset; label: string }[] = [
  { id: 'front_34', label: '3/4' },
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'rear', label: 'Rear' },
  { id: 'cinematic', label: 'Cine 🎬' },
];

export const GarageScene: React.FC<GarageSceneProps> = ({
  liveryState,
  onUpdateState,
  canvasElement,
  cameraPreset,
  onSelectCameraPreset,
  quality = 'high',
  onSelectQuality
}) => {
  const dpr = quality === 'high' ? [1, 2] : quality === 'medium' ? [1, 1.5] : [1, 1];
  const envMode = liveryState.sceneEnvironment || (liveryState.isRainyWeather ? 'rain' : 'studio');

  // Environment styling parameters
  const envConfig = useMemo(() => {
    switch (envMode) {
      case 'synthwave':
        return {
          bg: '#140024',
          fog: '#140024',
          fogNear: 8,
          fogFar: 28,
          ambient: '#280040',
          ambientInt: 0.55,
          spotColor: '#ff007f',
          rim1: '#ff007f',
          rim2: '#ffea00',
          underColor: '#ff007f',
          badgeText: 'SYNTHWAVE 🌅',
          badgeColor: 'border-vice-pink text-vice-pink bg-vice-pink/10 shadow-neon-pink'
        };
      case 'cyberpunk':
        return {
          bg: '#02120e',
          fog: '#02120e',
          fogNear: 6,
          fogFar: 24,
          ambient: '#042820',
          ambientInt: 0.45,
          spotColor: '#39ff14',
          rim1: '#39ff14',
          rim2: '#00f0ff',
          underColor: '#39ff14',
          badgeText: 'CYBERPUNK ⚡',
          badgeColor: 'border-[#39ff14] text-[#39ff14] bg-[#39ff14]/10 shadow-neon-green'
        };
      case 'rain':
        return {
          bg: '#04040a',
          fog: '#04040a',
          fogNear: 6,
          fogFar: 22,
          ambient: '#0b1329',
          ambientInt: 0.4,
          spotColor: '#ffffff',
          rim1: '#00f0ff',
          rim2: '#3a86ff',
          underColor: '#00f0ff',
          badgeText: 'RAIN MODE 🌧️',
          badgeColor: 'border-vice-cyan text-vice-cyan bg-vice-cyan/10 shadow-neon-cyan'
        };
      case 'studio':
      default:
        return {
          bg: '#06060e',
          fog: '#06060e',
          fogNear: 8,
          fogFar: 24,
          ambient: '#101030',
          ambientInt: 0.4,
          spotColor: '#ffffff',
          rim1: '#ff007f',
          rim2: '#00f0ff',
          underColor: '#9d00ff',
          badgeText: 'STUDIO 🏢',
          badgeColor: 'border-gray-500 text-gray-300 bg-black/40'
        };
    }
  }, [envMode]);

  return (
    <div className="w-full h-full relative bg-[#06060c] rounded-xl overflow-hidden border border-vice-border shadow-2xl group">
      {/* 3D CANVAS VIEWPORT */}
      <Canvas
        id="three-webgl-canvas"
        shadows={quality !== 'low'}
        dpr={dpr as any}
        camera={{ position: [3.8, 2.0, 4.2], fov: 45 }}
        className="w-full h-full"
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={[envConfig.bg]} />
          <fog attach="fog" args={[envConfig.fog, envConfig.fogNear, envConfig.fogFar]} />

          {/* HDRI ENVIRONMENT FOR REALISTIC METALLIC & CLEARCOAT REFLECTIONS */}
          <Environment preset={envMode === 'synthwave' ? 'sunset' : envMode === 'cyberpunk' ? 'night' : 'city'} environmentIntensity={envMode === 'synthwave' ? 0.8 : 0.65} />

          {/* LIGHTING SETUP - DYNAMIC PER ENVIRONMENT */}
          <ambientLight intensity={envConfig.ambientInt} color={envConfig.ambient} />

          {/* Overhead Main Spotlight */}
          <spotLight
            position={[0, 8, 0]}
            intensity={quality === 'low' ? 5 : 8}
            color={envConfig.spotColor}
            angle={0.6}
            penumbra={0.5}
            castShadow={quality !== 'low'}
            shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
            shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
          />

          {/* Rim Light 1 (Right side) */}
          <spotLight position={[6, 4, 3]} intensity={14} color={envConfig.rim1} angle={0.8} />

          {/* Rim Light 2 (Left side) */}
          <spotLight position={[-6, 4, -3]} intensity={14} color={envConfig.rim2} angle={0.8} />

          {/* Underbody Ambient Accent */}
          <pointLight position={[0, 0.2, 0]} intensity={4} color={envConfig.underColor} distance={8} />

          {/* 3D VEHICLE MODEL WITH DYNAMIC TEXTURE */}
          <Vehicle3D liveryState={liveryState} canvasElement={canvasElement} />

          {/* GARAGE ENVIRONMENT */}
          <GarageEnvironment envMode={envMode} quality={quality} />

          {/* SPECIAL FX ACCORDING TO ENVIRONMENT */}
          {envMode === 'rain' && (
            <>
              <RainParticles count={quality === 'low' ? 400 : quality === 'medium' ? 800 : 1400} />
              <ThunderFlashEffect />
            </>
          )}
          {envMode === 'synthwave' && <SynthwaveHorizonSun />}
          {envMode === 'cyberpunk' && <CyberDustParticles count={quality === 'low' ? 120 : quality === 'medium' ? 250 : 500} />}

          {/* SMOOTH CAMERA CONTROLLER */}
          <CameraController cameraPreset={cameraPreset} />
        </Suspense>
      </Canvas>

      {/*  RESPONSIVE 3D HUD OVERLAY  */}
      <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 z-30 flex flex-col gap-1.5 pointer-events-none">
        {/* TOP ROW: TITLE BADGE + CAMERA & QUALITY CONTROLS */}
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Title Badge */}
          <div className="bg-black/85 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-vice text-vice-pink border border-vice-pink/30 flex items-center gap-1.5 shadow-lg shrink-0 pointer-events-auto">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-vice-pink animate-pulse" />
            <span className="font-bold tracking-wider">3D STUDIO</span>
          </div>

          {/* Camera presets & quality bar */}
          <div className="flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 rounded-xl border border-vice-border shadow-2xl overflow-x-auto scrollbar-none pointer-events-auto max-w-[calc(100%-110px)] sm:max-w-none">
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-vice text-gray-400 px-1 shrink-0">
              <Camera size={13} className="text-vice-pink" />
            </div>

            {/* Camera presets pills */}
            <div className="flex items-center gap-1">
              {CAMERA_OPTIONS.map((cp) => (
                <button
                  key={cp.id}
                  onClick={() => onSelectCameraPreset?.(cp.id)}
                  className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-vice transition-all whitespace-nowrap cursor-pointer ${
                    cameraPreset === cp.id
                      ? cp.id === 'cinematic'
                        ? 'bg-vice-yellow text-black font-bold shadow-neon-yellow'
                        : 'bg-vice-pink text-white font-bold shadow-neon-pink'
                      : 'text-gray-400 hover:text-white bg-[#141424]/60'
                  }`}
                >
                  {cp.label}
                </button>
              ))}
            </div>

            {/* Graphics Quality Toggle */}
            {onSelectQuality && (
              <div className="hidden md:flex items-center border-l border-gray-700 pl-1.5 ml-1 gap-1 shrink-0">
                <Sliders size={11} className="text-gray-500 mr-0.5" />
                {(['low', 'medium', 'high'] as GraphicsQuality[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => onSelectQuality(q)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-vice uppercase transition-all cursor-pointer ${
                      quality === q ? 'bg-vice-cyan text-black font-bold' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: 1-CLICK INTERACTIVE THEME / WEATHER SELECTOR */}
        <div className="flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 rounded-xl border border-vice-border shadow-xl overflow-x-auto scrollbar-none pointer-events-auto w-fit max-w-full">
          {([
            { id: 'studio', label: '🏢 Studio', color: 'text-gray-200' },
            { id: 'rain', label: '🌧️ Thunder', color: 'text-vice-cyan' },
            { id: 'synthwave', label: '🌅 Synthwave', color: 'text-vice-pink' },
            { id: 'cyberpunk', label: '⚡ Cyberpunk', color: 'text-[#39ff14]' }
          ] as const).map((env) => {
            const isActive = envMode === env.id;
            return (
              <button
                key={env.id}
                onClick={() => {
                  onUpdateState?.({
                    sceneEnvironment: env.id,
                    isRainyWeather: env.id === 'rain'
                  });
                }}
                className={`px-2 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-vice font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? `${env.color} bg-white/15 border border-white/30 shadow-md`
                    : 'text-gray-400 hover:text-white bg-[#141424]/60 hover:bg-[#141424]'
                }`}
              >
                {env.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM RIGHT: MODEL & FINISH INFO */}
      <div className="pointer-events-none absolute bottom-3 right-3 text-[10px] sm:text-[11px] font-vice text-gray-400 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-gray-800 z-20">
        MODEL: <span className="text-vice-cyan uppercase font-bold">{liveryState.vehicle}</span> | FINISH: <span className="text-vice-yellow uppercase font-bold">{liveryState.finish}</span>
      </div>
    </div>
  );
};

// 3D THUNDER LIGHTNING FLASH EFFECT
const ThunderFlashEffect: React.FC = () => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    if (Math.random() < 0.015) {
      lightRef.current.intensity = 20 + Math.random() * 30;
    } else {
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, 0.25);
    }
  });
  return <directionalLight ref={lightRef} position={[2, 12, 4]} color="#d8eeff" />;
};

// 3D RAIN PARTICLES COMPONENT
const RainParticles: React.FC<{ count?: number }> = ({ count = 1200 }) => {
  const rainRef = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return [pos];
  }, [count]);

  useFrame((state, delta) => {
    if (!rainRef.current) return;
    const geo = rainRef.current.geometry;
    const posArr = geo.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] -= delta * 12;
      if (posArr[i * 3 + 1] < 0) {
        posArr[i * 3 + 1] = 10;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={rainRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00f0ff" transparent opacity={0.6} />
    </points>
  );
};

// SMOOTH CAMERA CONTROLLER COMPONENT WITH LERP INTERPOLATION
const CameraController: React.FC<{ cameraPreset: CameraPreset }> = ({ cameraPreset }) => {
  const orbitRef = useRef<any>(null);
  const targetPos = useRef(new THREE.Vector3(3.8, 2.0, 4.2));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.5, 0));
  const isTransitioning = useRef(true);

  useEffect(() => {
    isTransitioning.current = true;
    switch (cameraPreset) {
      case 'front':
        targetPos.current.set(0.0, 1.3, 4.8);
        targetLookAt.current.set(0, 0.5, 0);
        break;
      case 'side':
        targetPos.current.set(5.2, 1.2, 0.0);
        targetLookAt.current.set(0, 0.5, 0);
        break;
      case 'rear':
        targetPos.current.set(0.0, 1.8, -5.2);
        targetLookAt.current.set(0, 0.5, 0);
        break;
      case 'top':
        targetPos.current.set(0.0, 6.8, 0.1);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 'wheel':
        targetPos.current.set(2.4, 0.6, 1.8);
        targetLookAt.current.set(0.95, 0.35, 1.4);
        break;
      case 'door_closeup':
        targetPos.current.set(-2.6, 1.1, 0.6);
        targetLookAt.current.set(-0.95, 0.6, 0.2);
        break;
      case 'cinematic':
        targetPos.current.set(3.6, 1.4, 3.4);
        targetLookAt.current.set(0, 0.5, 0);
        break;
      case 'turntable':
        targetPos.current.set(4.2, 1.8, 3.8);
        targetLookAt.current.set(0, 0.5, 0);
        break;
      case 'front_34':
      default:
        targetPos.current.set(3.8, 2.0, 4.2);
        targetLookAt.current.set(0, 0.5, 0);
        break;
    }
  }, [cameraPreset]);

  useFrame((state, delta) => {
    if (!orbitRef.current) return;
    const controls = orbitRef.current;
    const camera = controls.object;

    // Smooth lerp camera position to target
    if (isTransitioning.current && cameraPreset !== 'turntable') {
      camera.position.lerp(targetPos.current, 0.08);
      controls.target.lerp(targetLookAt.current, 0.08);
      controls.update();

      if (camera.position.distanceTo(targetPos.current) < 0.05) {
        isTransitioning.current = false;
      }
    }

    // Auto rotate turntable or cinematic pan
    if (cameraPreset === 'turntable') {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 2.0;
      controls.update();
    } else if (cameraPreset === 'cinematic') {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8;
      controls.update();
    } else {
      controls.autoRotate = false;
    }
  });

  return (
    <OrbitControls
      ref={orbitRef}
      enablePan={true}
      enableZoom={true}
      minDistance={1.5}
      maxDistance={14.0}
      maxPolarAngle={Math.PI / 2 - 0.02}
      dampingFactor={0.05}
      enableDamping={true}
    />
  );
};

// 3D SYNTHWAVE HORIZON SUN
const SynthwaveHorizonSun: React.FC = () => {
  const sunGroupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (sunGroupRef.current) {
      sunGroupRef.current.position.y = 1.2 + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });
  return (
    <group ref={sunGroupRef} position={[0, 1.2, -14]}>
      <mesh><circleGeometry args={[5, 32]} /><meshBasicMaterial color="#ff007f" /></mesh>
      <mesh position={[0, 0, 0.05]}><circleGeometry args={[4.2, 32]} /><meshBasicMaterial color="#ffea00" /></mesh>
      {[-1.8, -1.2, -0.6, 0.0, 0.7, 1.5, 2.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0.1]}>
          <planeGeometry args={[9.5, 0.18 + i * 0.04]} />
          <meshBasicMaterial color="#140024" />
        </mesh>
      ))}
      <pointLight position={[0, 0, 1]} intensity={6} color="#ff007f" distance={20} />
    </group>
  );
};

// 3D CYBERPUNK DUST PARTICLES
const CyberDustParticles: React.FC<{ count?: number }> = ({ count = 300 }) => {
  const sparksRef = useRef<THREE.Points>(null);
  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return [pos];
  }, [count]);
  useFrame((_, delta) => {
    if (!sparksRef.current) return;
    const posArr = sparksRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] += delta * 0.8;
      posArr[i * 3] += Math.sin(posArr[i * 3 + 1] * 2) * delta * 0.3;
      if (posArr[i * 3 + 1] > 6) posArr[i * 3 + 1] = 0;
    }
    sparksRef.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={sparksRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#39ff14" transparent opacity={0.75} />
    </points>
  );
};

// GARAGE ENVIRONMENT (Reflective Floor, Neon Light Bars, Lift Pillars) — env-aware
const GarageEnvironment: React.FC<{ envMode: string; quality: GraphicsQuality }> = ({ envMode, quality }) => {
  const isRain = envMode === 'rain';
  const isSynth = envMode === 'synthwave';
  const isCyber = envMode === 'cyberpunk';

  const floorGridColors: [string, string] = isSynth
    ? ['#ff007f', '#9d00ff']
    : isCyber
    ? ['#39ff14', '#00f0ff']
    : isRain
    ? ['#00f0ff', '#14213d']
    : ['#ff007f', '#00f0ff'];

  return (
    <group position={[0, 0, 0]}>
      {/* Wet / Environment-aware Reflective Floor */}
      <mesh receiveShadow={quality !== 'low'} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[32, 32]} />
        {quality !== 'low' ? (
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={quality === 'high' ? 1024 : 512}
            mirror={isRain ? 0.85 : isSynth ? 0.75 : 0.6}
            mixBlur={0.8}
            mixStrength={isRain ? 2.5 : isSynth ? 2.0 : 1.5}
            roughness={isRain ? 0.08 : isSynth ? 0.12 : 0.2}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color={isSynth ? '#100518' : isCyber ? '#051410' : '#101018'}
            metalness={0.8}
          />
        ) : (
          <meshStandardMaterial color={isSynth ? '#12051c' : '#0e0e18'} roughness={0.3} metalness={0.7} />
        )}
      </mesh>

      {/* Grid Lines on Floor */}
      <gridHelper args={[32, 32, floorGridColors[0], floorGridColors[1]]} position={[0, 0.01, 0]} />

      {/* Overhead Neon Light Tube Bars */}
      <group position={[0, 5.2, 0]}>
        <mesh position={[-3, 0, 0]}>
          <boxGeometry args={[0.1, 0.1, 12]} />
          <meshBasicMaterial color={isCyber ? '#39ff14' : '#ff007f'} />
        </mesh>
        <mesh position={[3, 0, 0]}>
          <boxGeometry args={[0.1, 0.1, 12]} />
          <meshBasicMaterial color={isSynth ? '#ffea00' : '#00f0ff'} />
        </mesh>
      </group>

      {/* Workshop Hydraulic Lift Posts */}
      <mesh position={[-2.2, 2.5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 5, 16]} />
        <meshPhysicalMaterial color="#222233" metalness={0.9} roughness={0.2} clearcoat={0.5} />
      </mesh>
      <mesh position={[2.2, 2.5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 5, 16]} />
        <meshPhysicalMaterial color="#222233" metalness={0.9} roughness={0.2} clearcoat={0.5} />
      </mesh>
    </group>
  );
};
