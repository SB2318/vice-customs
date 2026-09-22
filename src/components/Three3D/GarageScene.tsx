import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { LiveryState, CameraPreset, GraphicsQuality } from '../../types';
import { Vehicle3D } from './Vehicle3D';
import { Camera, Sliders } from 'lucide-react';

interface GarageSceneProps {
  liveryState: LiveryState;
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
  { id: 'top', label: 'Top' },
  { id: 'wheel', label: 'Rims' },
  { id: 'turntable', label: 'Spin 🔄' },
  { id: 'cinematic', label: 'Cine 🎬' },
];

export const GarageScene: React.FC<GarageSceneProps> = ({
  liveryState,
  canvasElement,
  cameraPreset,
  onSelectCameraPreset,
  quality = 'high',
  onSelectQuality
}) => {
  const dpr = quality === 'high' ? [1, 2] : quality === 'medium' ? [1, 1.5] : [1, 1];

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
          <color attach="background" args={[liveryState.isRainyWeather ? '#04040a' : '#06060e']} />
          <fog attach="fog" args={[liveryState.isRainyWeather ? '#04040a' : '#06060e', 6, 22]} />

          {/* HDRI ENVIRONMENT FOR REALISTIC METALLIC & CLEARCOAT REFLECTIONS */}
          <Environment preset="city" environmentIntensity={0.65} />

          {/* LIGHTING SETUP - VICE CITY SYNTHWAVE GARAGE */}
          <ambientLight intensity={0.4} color="#101030" />

          {/* Overhead Main Studio Spotlight */}
          <spotLight
            position={[0, 8, 0]}
            intensity={quality === 'low' ? 5 : 8}
            color="#ffffff"
            angle={0.6}
            penumbra={0.5}
            castShadow={quality !== 'low'}
            shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
            shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
          />

          {/* Vice Pink Rim Light (Right side) */}
          <spotLight position={[6, 4, 3]} intensity={12} color="#ff007f" angle={0.8} />

          {/* Vice Cyan Rim Light (Left side) */}
          <spotLight position={[-6, 4, -3]} intensity={12} color="#00f0ff" angle={0.8} />

          {/* Underbody Ambient Accent */}
          <pointLight position={[0, 0.2, 0]} intensity={4} color="#9d00ff" distance={8} />

          {/* 3D VEHICLE MODEL WITH DYNAMIC TEXTURE */}
          <Vehicle3D liveryState={liveryState} canvasElement={canvasElement} />

          {/* GARAGE ENVIRONMENT */}
          <GarageEnvironment isRainy={liveryState.isRainyWeather} quality={quality} />

          {/* 3D RAIN PARTICLES FX */}
          {liveryState.isRainyWeather && <RainParticles count={quality === 'low' ? 400 : quality === 'medium' ? 800 : 1400} />}

          {/* SMOOTH CAMERA CONTROLLER */}
          <CameraController cameraPreset={cameraPreset} />
        </Suspense>
      </Canvas>

      {/* TOP LEFT: HUD TITLE BADGE */}
      <div className="pointer-events-none absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-vice text-vice-pink border border-vice-pink/30 flex items-center gap-2 z-20 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-vice-pink animate-pulse" />
        <span className="font-bold">3D STUDIO</span>
        {liveryState.isRainyWeather && <span className="text-vice-cyan font-bold">🌧️ RAIN</span>}
      </div>

      {/* TOP RIGHT: FLOATING CAMERA PRESET & QUALITY BAR */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-black/85 backdrop-blur-md p-1.5 rounded-xl border border-vice-border shadow-2xl max-w-[calc(100%-140px)] overflow-x-auto scrollbar-none">
        <div className="hidden sm:flex items-center gap-1 text-[10px] font-vice text-gray-400 px-1 shrink-0">
          <Camera size={13} className="text-vice-pink" />
        </div>

        {/* Camera presets pills */}
        <div className="flex items-center gap-1">
          {CAMERA_OPTIONS.map((cp) => (
            <button
              key={cp.id}
              onClick={() => onSelectCameraPreset?.(cp.id)}
              className={`px-2 py-1 rounded-lg text-[10px] font-vice transition-all whitespace-nowrap ${
                cameraPreset === cp.id
                  ? cp.id === 'turntable' || cp.id === 'cinematic'
                    ? 'bg-vice-yellow text-black font-bold shadow-neon-yellow'
                    : 'bg-vice-pink text-white font-bold shadow-neon-pink'
                  : 'text-gray-400 hover:text-white bg-[#141424]'
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
                className={`px-1.5 py-0.5 rounded text-[9px] font-vice uppercase transition-all ${
                  quality === q ? 'bg-vice-cyan text-black font-bold' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM RIGHT: MODEL & FINISH INFO */}
      <div className="pointer-events-none absolute bottom-3 right-3 text-[10px] sm:text-[11px] font-vice text-gray-400 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-gray-800 z-20">
        MODEL: <span className="text-vice-cyan uppercase font-bold">{liveryState.vehicle}</span> | FINISH: <span className="text-vice-yellow uppercase font-bold">{liveryState.finish}</span>
      </div>
    </div>
  );
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

// GARAGE ENVIRONMENT (Reflective Floor, Neon Light Bars, Lift Pillars)
const GarageEnvironment: React.FC<{ isRainy: boolean; quality: GraphicsQuality }> = ({ isRainy, quality }) => {
  return (
    <group position={[0, 0, 0]}>
      {/* Wet Reflective Floor */}
      <mesh receiveShadow={quality !== 'low'} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[32, 32]} />
        {quality !== 'low' ? (
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={quality === 'high' ? 1024 : 512}
            mirror={isRainy ? 0.85 : 0.6}
            mixBlur={0.8}
            mixStrength={isRainy ? 2.5 : 1.5}
            roughness={isRainy ? 0.08 : 0.2}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#101018"
            metalness={0.8}
          />
        ) : (
          <meshStandardMaterial color="#0e0e18" roughness={0.3} metalness={0.7} />
        )}
      </mesh>

      {/* Grid Lines on Floor */}
      <gridHelper args={[32, 32, '#ff007f', '#00f0ff']} position={[0, 0.01, 0]} />

      {/* Overhead Neon Light Tube Bars */}
      <group position={[0, 5.2, 0]}>
        {/* Pink Neon Tube */}
        <mesh position={[-3, 0, 0]}>
          <boxGeometry args={[0.1, 0.1, 12]} />
          <meshBasicMaterial color="#ff007f" />
        </mesh>
        {/* Cyan Neon Tube */}
        <mesh position={[3, 0, 0]}>
          <boxGeometry args={[0.1, 0.1, 12]} />
          <meshBasicMaterial color="#00f0ff" />
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
