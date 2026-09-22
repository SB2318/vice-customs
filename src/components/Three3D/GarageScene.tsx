import React, { useRef, useEffect } from 'react';
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
        <color attach="background" args={['#06060e']} />
        <fog attach="fog" args={['#06060e', 8, 25]} />

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
        <GarageEnvironment />

        {/* CAMERA CONTROLLER */}
        <CameraController cameraPreset={cameraPreset} />
      </Canvas>

      {/* HUD OVERLAY BADGE */}
      <div className="pointer-events-none absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded text-xs font-vice text-vice-pink border border-vice-pink/30 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-vice-pink animate-pulse" />
        VICE CUSTOMS 3D STUDIO (R3F)
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 text-[11px] font-vice text-gray-400 bg-black/60 px-3 py-1 rounded border border-gray-800">
        MODEL: <span className="text-vice-cyan uppercase">{liveryState.vehicle}</span> | FINISH: <span className="text-vice-yellow uppercase">{liveryState.finish}</span>
      </div>
    </div>
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
      case 'front_34':
      default:
        controls.object.position.set(3.8, 2.0, 4.2);
        break;
    }
    controls.target.set(0, 0.5, 0);
    controls.update();
  }, [cameraPreset]);

  useFrame((state, delta) => {
    if (cameraPreset === 'turntable' && orbitRef.current) {
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
      maxPolarAngle={Math.PI / 2 - 0.02} // Prevent camera clipping floor
    />
  );
};

// GARAGE ENVIRONMENT (Reflective Floor, Neon Light Bars, Lift Pillars)
const GarageEnvironment: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Wet Reflective Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mirror={0.6}
          mixBlur={0.8}
          mixStrength={1.5}
          roughness={0.2}
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
