import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LiveryState } from '../../types';

interface Vehicle3DProps {
  liveryState: LiveryState;
  canvasElement: HTMLCanvasElement | null;
}

export const Vehicle3D: React.FC<Vehicle3DProps> = ({ liveryState, canvasElement }) => {
  const vehicleGroupRef = useRef<THREE.Group>(null);
  const leftDoorRef = useRef<THREE.Group>(null);
  const hoodRef = useRef<THREE.Group>(null);

  // Create & Update Three.js CanvasTexture live from 2D Canvas
  const bodyTexture = useMemo(() => {
    if (!canvasElement) return null;
    const tex = new THREE.CanvasTexture(canvasElement);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [canvasElement]);

  // Update texture every frame if canvas changes
  useFrame(() => {
    if (bodyTexture && canvasElement) {
      bodyTexture.needsUpdate = true;
    }

    // Smooth door & hood open/close animations
    if (leftDoorRef.current) {
      const targetAngle = liveryState.doorsOpen ? -Math.PI / 3 : 0;
      leftDoorRef.current.rotation.y = THREE.MathUtils.lerp(leftDoorRef.current.rotation.y, targetAngle, 0.1);
    }
    if (hoodRef.current) {
      const targetAngle = liveryState.hoodOpen ? -Math.PI / 4 : 0;
      hoodRef.current.rotation.x = THREE.MathUtils.lerp(hoodRef.current.rotation.x, targetAngle, 0.1);
    }
  });

  // Calculate advanced MeshPhysicalMaterial parameters based on Paint Finish
  const finishParams = useMemo(() => {
    switch (liveryState.finish) {
      case 'matte':
        return {
          roughness: 0.82,
          metalness: 0.05,
          clearcoat: 0,
          clearcoatRoughness: 0.5,
          reflectivity: 0.2,
          iridescence: 0,
          envMapIntensity: 0.5
        };
      case 'metallic':
        return {
          roughness: 0.22,
          metalness: 0.85,
          clearcoat: 0.8,
          clearcoatRoughness: 0.1,
          reflectivity: 0.9,
          iridescence: 0.1,
          envMapIntensity: 1.4
        };
      case 'pearlescent':
        return {
          roughness: 0.14,
          metalness: 0.45,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          reflectivity: 0.95,
          iridescence: 0.7,
          iridescenceIOR: 1.6,
          envMapIntensity: 1.5
        };
      case 'chameleon':
        return {
          roughness: 0.12,
          metalness: 0.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.04,
          reflectivity: 1.0,
          iridescence: 1.0,
          iridescenceIOR: 1.8,
          envMapIntensity: 1.6
        };
      case 'carbon':
        return {
          roughness: 0.45,
          metalness: 0.25,
          clearcoat: 0.5,
          clearcoatRoughness: 0.2,
          reflectivity: 0.5,
          iridescence: 0,
          envMapIntensity: 0.9
        };
      case 'rust':
        return {
          roughness: 0.96,
          metalness: 0.05,
          clearcoat: 0,
          clearcoatRoughness: 0.8,
          reflectivity: 0.1,
          iridescence: 0,
          envMapIntensity: 0.3
        };
      case 'gloss':
      default:
        return {
          roughness: 0.18,
          metalness: 0.15,
          clearcoat: 0.95,
          clearcoatRoughness: 0.06,
          reflectivity: 0.85,
          iridescence: 0,
          envMapIntensity: 1.2
        };
    }
  }, [liveryState.finish]);

  const underglowColor = liveryState.underglowEnabled ? liveryState.underglowColor : '#000000';
  const rimColor = liveryState.rimColor || '#e5e5e5';

  return (
    <group ref={vehicleGroupRef} position={[0, 0, 0]}>
      {/* UNDERGLOW NEON LIGHTING STRIPS & GROUND LIGHT */}
      {liveryState.underglowEnabled && (
        <group position={[0, 0.05, 0]}>
          <pointLight color={underglowColor} intensity={liveryState.underglowBeatPulse ? 14 : 8} distance={6} decay={2} />
          {/* Neon Light Tube Bar Mesh */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.8, 0.04, 3.8]} />
            <meshBasicMaterial color={underglowColor} />
          </mesh>
        </group>
      )}

      {/* 3D REAR EXHAUST BACKFIRE FLAMES FX */}
      {liveryState.isExhaustFlamesActive && (
        <group position={[0, 0.4, -2.3]}>
          {/* Left Exhaust Flame Cone */}
          <mesh position={[-0.5, 0, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.22, 0.9, 16]} />
            <meshBasicMaterial color="#ff5500" transparent opacity={0.9} />
          </mesh>
          <pointLight position={[-0.5, 0, -0.4]} color="#ff5500" intensity={15} distance={5} />

          {/* Right Exhaust Flame Cone */}
          <mesh position={[0.5, 0, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.22, 0.9, 16]} />
            <meshBasicMaterial color="#ffea00" transparent opacity={0.9} />
          </mesh>
          <pointLight position={[0.5, 0, -0.4]} color="#ffea00" intensity={15} distance={5} />
        </group>
      )}

      {/* --- INFERNUS SUPERCAR --- */}
      {liveryState.vehicle === 'infernus' && (
        <group position={[0, 0.6, 0]}>
          {/* Main Wedge Body */}
          <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
            <boxGeometry args={[2.0, 0.5, 4.4]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          {/* Cabin Glass */}
          <mesh position={[0, 0.75, -0.2]}>
            <boxGeometry args={[1.6, 0.45, 2.0]} />
            <meshPhysicalMaterial
              color={
                liveryState.windowTint === 'cyan_neon'
                  ? '#00f0ff'
                  : liveryState.windowTint === 'pink_neon'
                  ? '#ff007f'
                  : liveryState.windowTint === 'dark_limo'
                  ? '#05070c'
                  : '#0d111a'
              }
              transmission={liveryState.windowTint === 'dark_limo' ? 0.35 : 0.8}
              opacity={1}
              transparent
              roughness={0.05}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
              ior={1.52}
            />
          </mesh>

          {/* Animated Hood Bonnet */}
          <group ref={hoodRef} position={[0, 0.55, 1.2]}>
            <mesh castShadow position={[0, 0, 0.6]}>
              <boxGeometry args={[1.7, 0.12, 1.2]} />
              <meshPhysicalMaterial
                map={bodyTexture || undefined}
                color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
                {...finishParams}
              />
            </mesh>
          </group>

          {/* Animated Scissor Left Door */}
          <group ref={leftDoorRef} position={[-0.95, 0.55, 0.2]}>
            <mesh castShadow position={[0, 0, -0.5]}>
              <boxGeometry args={[0.1, 0.4, 1.2]} />
              <meshPhysicalMaterial
                map={bodyTexture || undefined}
                color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
                {...finishParams}
              />
            </mesh>
          </group>

          {/* Rear Wing Spoiler */}
          <group position={[0, 0.8, -2.0]}>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[2.2, 0.06, 0.4]} />
              <meshPhysicalMaterial color="#111111" roughness={0.3} metalness={0.8} clearcoat={0.6} />
            </mesh>
            <mesh position={[-0.8, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
              <meshPhysicalMaterial color="#111111" metalness={0.9} />
            </mesh>
            <mesh position={[0.8, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
              <meshPhysicalMaterial color="#111111" metalness={0.9} />
            </mesh>
          </group>

          {/* Headlights */}
          <group position={[0, 0.4, 2.15]}>
            <mesh position={[-0.7, 0, 0]}>
              <boxGeometry args={[0.4, 0.12, 0.1]} />
              <meshBasicMaterial color={liveryState.headlightsOn ? liveryState.headlightsColor : '#222222'} />
            </mesh>
            <mesh position={[0.7, 0, 0]}>
              <boxGeometry args={[0.4, 0.12, 0.1]} />
              <meshBasicMaterial color={liveryState.headlightsOn ? liveryState.headlightsColor : '#222222'} />
            </mesh>
            {liveryState.headlightsOn && (
              <>
                <spotLight position={[-0.7, 0, 0.2]} target-position={[-0.7, -0.5, 8]} color={liveryState.headlightsColor} intensity={12} distance={15} angle={0.5} />
                <spotLight position={[0.7, 0, 0.2]} target-position={[0.7, -0.5, 8]} color={liveryState.headlightsColor} intensity={12} distance={15} angle={0.5} />
              </>
            )}
          </group>

          {/* Taillights */}
          <mesh position={[0, 0.45, -2.21]}>
            <boxGeometry args={[1.8, 0.15, 0.05]} />
            <meshBasicMaterial color="#ff0022" />
          </mesh>
        </group>
      )}

      {/* --- BANSHEE GTS SPORTS CAR --- */}
      {liveryState.vehicle === 'banshee' && (
        <group position={[0, 0.6, 0]}>
          <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
            <boxGeometry args={[1.9, 0.55, 4.2]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          <group ref={hoodRef} position={[0, 0.55, 0.8]}>
            <mesh castShadow position={[0, 0, 0.7]}>
              <boxGeometry args={[1.65, 0.15, 1.4]} />
              <meshPhysicalMaterial
                map={bodyTexture || undefined}
                color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
                {...finishParams}
              />
            </mesh>
          </group>

          <mesh position={[0, 0.8, -0.4]}>
            <sphereGeometry args={[0.9, 16, 16]} />
            <meshPhysicalMaterial
              color={
                liveryState.windowTint === 'cyan_neon'
                  ? '#00f0ff'
                  : liveryState.windowTint === 'pink_neon'
                  ? '#ff007f'
                  : liveryState.windowTint === 'dark_limo'
                  ? '#05070c'
                  : '#0b0f19'
              }
              roughness={0.05}
              transmission={liveryState.windowTint === 'dark_limo' ? 0.35 : 0.8}
              transparent
              clearcoat={1.0}
            />
          </mesh>

          <group position={[0, 0.42, 2.05]}>
            <mesh position={[-0.65, 0, 0]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial color={liveryState.headlightsOn ? liveryState.headlightsColor : '#222222'} />
            </mesh>
            <mesh position={[0.65, 0, 0]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial color={liveryState.headlightsOn ? liveryState.headlightsColor : '#222222'} />
            </mesh>
          </group>

          <mesh position={[-0.5, 0.15, -2.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
            <meshPhysicalMaterial color="#cccccc" metalness={0.95} roughness={0.1} clearcoat={1.0} />
          </mesh>
          <mesh position={[0.5, 0.15, -2.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
            <meshPhysicalMaterial color="#cccccc" metalness={0.95} roughness={0.1} clearcoat={1.0} />
          </mesh>
        </group>
      )}

      {/* --- DOMINATOR MUSCLE CAR --- */}
      {liveryState.vehicle === 'dominator' && (
        <group position={[0, 0.65, 0]}>
          <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[2.1, 0.65, 4.5]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          <mesh castShadow position={[0, 0.85, 1.2]}>
            <boxGeometry args={[0.6, 0.25, 0.8]} />
            <meshPhysicalMaterial color="#111111" metalness={0.9} roughness={0.15} clearcoat={0.7} />
          </mesh>

          <mesh position={[0, 0.9, -0.3]}>
            <boxGeometry args={[1.7, 0.45, 1.8]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          <mesh position={[0, 0.4, 2.26]}>
            <boxGeometry args={[1.8, 0.35, 0.05]} />
            <meshPhysicalMaterial color="#050505" roughness={0.9} metalness={0.1} />
          </mesh>

          <group position={[0, 0.4, 2.28]}>
            <mesh position={[-0.7, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
              <meshBasicMaterial color={liveryState.headlightsOn ? liveryState.headlightsColor : '#333333'} />
            </mesh>
            <mesh position={[0.7, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
              <meshBasicMaterial color={liveryState.headlightsOn ? liveryState.headlightsColor : '#333333'} />
            </mesh>
          </group>
        </group>
      )}

      {/* --- STREET DEMON DIRTBIKE --- */}
      {liveryState.vehicle === 'dirtbike' && (
        <group position={[0, 0.7, 0]}>
          <mesh castShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[0.6, 0.5, 1.8]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.5, 0.4, 0.8]} />
            <meshPhysicalMaterial color="#222222" metalness={0.9} roughness={0.2} clearcoat={0.5} />
          </mesh>

          <mesh position={[0, 0.65, 0.95]}>
            <boxGeometry args={[0.5, 0.4, 0.05]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          <mesh position={[0, 0.85, 0.7]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 1.1, 16]} />
            <meshPhysicalMaterial color="#111111" metalness={0.8} />
          </mesh>
        </group>
      )}

      {/* --- WHEELS ASSEMBLY WITH CUSTOM RIMS --- */}
      <Wheel position={[-0.95, 0.35, 1.4]} rimColor={rimColor} />
      <Wheel position={[0.95, 0.35, 1.4]} rimColor={rimColor} />
      <Wheel position={[-0.95, 0.35, -1.4]} rimColor={rimColor} />
      <Wheel position={[0.95, 0.35, -1.4]} rimColor={rimColor} />
    </group>
  );
};

// Wheel Component with rubber tire tread & custom colored metallic rim
const Wheel: React.FC<{ position: [number, number, number]; rimColor: string }> = ({ position, rimColor }) => {
  return (
    <group position={position}>
      {/* Rubber Tire */}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.28, 24]} />
        <meshStandardMaterial color="#141414" roughness={0.9} />
      </mesh>
      {/* Custom Metallic Rim */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.3, 16]} />
        <meshPhysicalMaterial color={rimColor} metalness={0.95} roughness={0.08} clearcoat={1.0} clearcoatRoughness={0.05} />
      </mesh>
      {/* Brake Caliper */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.1, 0.2, 0.15]} />
        <meshStandardMaterial color="#ff0033" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
};
