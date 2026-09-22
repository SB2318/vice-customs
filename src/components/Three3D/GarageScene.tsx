import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { LiveryState, CameraPreset } from '../../types';
import { Vehicle3D } from './Vehicle3D';

interface GarageSceneProps {
  liveryState: LiveryState;
  canvasElement: HTMLCanvasElement | null;
  cameraPreset: CameraPreset;
}

export const GarageScene: React.FC<GarageSceneProps> = ({
  liveryState,
  canvasElement,
  cameraPreset
}) => {
  return (
    <div className="w-full h-full relative bg-[#06060c] rounded-xl overflow-hidden border border-vice-border shadow-2xl group">
      <Canvas
        id="three-webgl-canvas"
        shadows
        camera={{ position: [3.8, 2.0, 4.2], fov: 45 }}
        className="w-full h-full"
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={[liveryState.isRainyWeather ? '#04040a' : '#06060e']} />
        <fog attach="fog" args={[liveryState.isRainyWeather ? '#04040a' : '#06060e', 6, 20]} />

        {/* LIGHTING SETUP - VICE CITY SYNTHWAVE GARAGE */}
        <ambientLight intensity={0.4} color="#101030" />

        {/* Overhead Main Studio Spotlight */}
        <spotLight
          position={[0, 8, 0]}
          intensity={8}
          color="#ffffff"
          angle={0.6}
          penumbra={0.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
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
        <GarageEnvironment isRainy={liveryState.isRainyWeather} />

        {/* 3D RAIN PARTICLES FX */}
        {liveryState.isRainyWeather && <RainParticles />}

        {/* CAMERA CONTROLLER */}
        <CameraController cameraPreset={cameraPreset} />
      </Canvas>

      {/* HUD OVERLAY BADGE */}
      <div className="pointer-events-none absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded text-xs font-vice text-vice-pink border border-vice-pink/30 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-vice-pink animate-pulse" />
        VICE CUSTOMS 3D STUDIO (R3F)
        {liveryState.isRainyWeather && <span className="text-vice-cyan font-bold">🌧️ RAINY NIGHT</span>}
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 text-[11px] font-vice text-gray-400 bg-black/60 px-3 py-1 rounded border border-gray-800">
        MODEL: <span className="text-vice-cyan uppercase">{liveryState.vehicle}</span> | FINISH: <span className="text-vice-yellow uppercase">{liveryState.finish}</span>
      </div>
    </div>
  );
};

// 3D RAIN PARTICLES COMPONENT
const RainParticles: React.FC = () => {
  const rainRef = useRef<THREE.Points>(null);
  const count = 1200;

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

// CAMERA CONTROLLER COMPONENT
const CameraController: React.FC<{ cameraPreset: CameraPreset }> = ({ cameraPreset }) => {
  const orbitRef = useRef<any>(null);

  useEffect(() => {
    if (!orbitRef.current) return;
    const controls = orbitRef.current;

    switch (cameraPreset) {
      case 'side':
        controls.object.position.set(5.2, 1.2, 0.0);
        break;
      case 'rear':
        controls.object.position.set(0.0, 1.8, -5.2);
        break;
      case 'top':
        controls.object.position.set(0.0, 6.5, 0.1);
        break;
      case 'door_closeup':
        controls.object.position.set(-2.6, 1.2, 0.8);
        break;
      case 'turntable':
      case 'cinematic':
        controls.object.position.set(4.2, 1.8, 3.8);
        break;
      case 'front_34':
      default:
        controls.object.position.set(3.8, 2.0, 4.2);
        break;
    }
    controls.target.set(0, 0.5, 0);
    controls.update();
  }, [cameraPreset]);

  useFrame((state, delta) => {
    if ((cameraPreset === 'turntable' || cameraPreset === 'cinematic') && orbitRef.current) {
      orbitRef.current.azimuthAngle += delta * 0.4;
      orbitRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={orbitRef}
      enablePan={true}
      enableZoom={true}
      minDistance={2.0}
      maxDistance={12.0}
      maxPolarAngle={Math.PI / 2 - 0.02}
    />
  );
};

// GARAGE ENVIRONMENT (Reflective Floor, Neon Light Bars, Lift Pillars)
const GarageEnvironment: React.FC<{ isRainy: boolean }> = ({ isRainy }) => {
  return (
    <group position={[0, 0, 0]}>
      {/* Wet Reflective Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
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
      </mesh>

      {/* Grid Lines on Floor */}
      <gridHelper args={[30, 30, '#ff007f', '#00f0ff']} position={[0, 0.01, 0]} />

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
        <meshStandardMaterial color="#222233" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[2.2, 2.5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 5, 16]} />
        <meshStandardMaterial color="#222233" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};
