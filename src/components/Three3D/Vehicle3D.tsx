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

  // Calculate advanced MeshPhysicalMaterial parameters with RAIN & WET REFLECTION PHYSICS
  const isRain = liveryState.isRainyWeather;

  const finishParams = useMemo(() => {
    switch (liveryState.finish) {
      case 'matte':
        return {
          roughness: isRain ? 0.38 : 0.82,
          metalness: 0.05,
          clearcoat: isRain ? 0.8 : 0,
          clearcoatRoughness: isRain ? 0.03 : 0.5,
          reflectivity: isRain ? 0.85 : 0.2,
          iridescence: 0,
          envMapIntensity: isRain ? 1.4 : 0.5
        };
      case 'metallic':
        return {
          roughness: isRain ? 0.05 : 0.22,
          metalness: 0.88,
          clearcoat: 1.0,
          clearcoatRoughness: isRain ? 0.02 : 0.1,
          reflectivity: 1.0,
          iridescence: 0.15,
          envMapIntensity: isRain ? 2.2 : 1.4
        };
      case 'pearlescent':
        return {
          roughness: isRain ? 0.04 : 0.14,
          metalness: 0.45,
          clearcoat: 1.0,
          clearcoatRoughness: isRain ? 0.02 : 0.05,
          reflectivity: 1.0,
          iridescence: 0.8,
          iridescenceIOR: 1.6,
          envMapIntensity: isRain ? 2.4 : 1.5
        };
      case 'chameleon':
        return {
          roughness: isRain ? 0.03 : 0.12,
          metalness: 0.5,
          clearcoat: 1.0,
          clearcoatRoughness: isRain ? 0.02 : 0.04,
          reflectivity: 1.0,
          iridescence: 1.0,
          iridescenceIOR: 1.8,
          envMapIntensity: isRain ? 2.5 : 1.6
        };
      case 'carbon':
        return {
          roughness: isRain ? 0.15 : 0.45,
          metalness: 0.25,
          clearcoat: isRain ? 0.95 : 0.5,
          clearcoatRoughness: isRain ? 0.03 : 0.2,
          reflectivity: isRain ? 0.9 : 0.5,
          iridescence: 0,
          envMapIntensity: isRain ? 1.6 : 0.9
        };
      case 'rust':
        return {
          roughness: isRain ? 0.65 : 0.96,
          metalness: 0.05,
          clearcoat: isRain ? 0.4 : 0,
          clearcoatRoughness: 0.6,
          reflectivity: isRain ? 0.4 : 0.1,
          iridescence: 0,
          envMapIntensity: isRain ? 0.8 : 0.3
        };
      case 'gloss':
      default:
        return {
          roughness: isRain ? 0.04 : 0.18,
          metalness: 0.15,
          clearcoat: 1.0,
          clearcoatRoughness: isRain ? 0.02 : 0.06,
          reflectivity: 1.0,
          iridescence: 0,
          envMapIntensity: isRain ? 2.0 : 1.2
        };
    }
  }, [liveryState.finish, isRain]);

  const underglowColor = liveryState.underglowEnabled ? liveryState.underglowColor : '#000000';
  const rimColor = liveryState.rimColor || '#e5e5e5';

  return (
    <group ref={vehicleGroupRef} position={[0, 0, 0]}>
      {/* UNDERGLOW NEON LIGHTING STRIPS & GROUND LIGHT */}
      {liveryState.underglowEnabled && (
        <group position={[0, 0.05, 0]}>
          <pointLight color={underglowColor} intensity={liveryState.underglowBeatPulse ? 14 : 8} distance={6} decay={2} />
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.8, 0.04, 3.8]} />
            <meshBasicMaterial color={underglowColor} />
          </mesh>
        </group>
      )}

      {/* 3D REAR EXHAUST BACKFIRE FLAMES FX */}
      {liveryState.isExhaustFlamesActive && (
        <group position={[0, 0.4, -2.3]}>
          {/* Left Flame */}
          <mesh position={[-0.5, 0, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.22, 0.9, 16]} />
            <meshBasicMaterial color="#ff5500" transparent opacity={0.9} />
          </mesh>
          <pointLight position={[-0.5, 0, -0.4]} color="#ff5500" intensity={16} distance={6} />

          {/* Right Flame */}
          <mesh position={[0.5, 0, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.22, 0.9, 16]} />
            <meshBasicMaterial color="#ffea00" transparent opacity={0.9} />
          </mesh>
          <pointLight position={[0.5, 0, -0.4]} color="#ffea00" intensity={16} distance={6} />
        </group>
      )}

      {/* ════════════════ 1. INFERNUS SUPERCAR ════════════════ */}
      {liveryState.vehicle === 'infernus' && (
        <group position={[0, 0.6, 0]}>
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
              color={liveryState.windowTint === 'cyan_neon' ? '#00f0ff' : liveryState.windowTint === 'pink_neon' ? '#ff007f' : '#0d111a'}
              transmission={0.8}
              opacity={1}
              transparent
              roughness={0.05}
              clearcoat={1.0}
            />
          </mesh>

          {/* Animated Hood */}
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

          {/* Scissor Door */}
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

          {/* Rear GT Wing */}
          <group position={[0, 0.8, -2.0]}>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[2.2, 0.06, 0.4]} />
              <meshPhysicalMaterial color="#111111" roughness={0.2} metalness={0.8} clearcoat={0.8} />
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
          </group>
        </group>
      )}

      {/* ════════════════ 2. GROTTI CHEETAH CLASSIC ════════════════ */}
      {liveryState.vehicle === 'cheetah' && (
        <group position={[0, 0.58, 0]}>
          {/* Low Wedge Body */}
          <mesh castShadow receiveShadow position={[0, 0.28, 0]}>
            <boxGeometry args={[2.05, 0.48, 4.3]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          {/* Side Strakes / Testarossa Ribs */}
          <group position={[-1.04, 0.28, 0]}>
            {[-0.4, -0.1, 0.2, 0.5].map((zOffset, i) => (
              <mesh key={i} position={[0, (i - 1.5) * 0.08, zOffset]}>
                <boxGeometry args={[0.04, 0.03, 0.8]} />
                <meshPhysicalMaterial color="#111111" metalness={0.8} />
              </mesh>
            ))}
          </group>
          <group position={[1.04, 0.28, 0]}>
            {[-0.4, -0.1, 0.2, 0.5].map((zOffset, i) => (
              <mesh key={i} position={[0, (i - 1.5) * 0.08, zOffset]}>
                <boxGeometry args={[0.04, 0.03, 0.8]} />
                <meshPhysicalMaterial color="#111111" metalness={0.8} />
              </mesh>
            ))}
          </group>

          {/* Angular Cabin Greenhouse */}
          <mesh position={[0, 0.68, -0.15]}>
            <boxGeometry args={[1.5, 0.4, 1.9]} />
            <meshPhysicalMaterial
              color={liveryState.windowTint === 'cyan_neon' ? '#00f0ff' : '#0d111a'}
              transmission={0.85}
              roughness={0.05}
              clearcoat={1.0}
              transparent
            />
          </mesh>

          {/* Pop-up Headlamp Housings */}
          <group position={[0, 0.48, 1.6]}>
            <mesh position={[-0.6, 0.06, 0]} rotation={[-0.15, 0, 0]}>
              <boxGeometry args={[0.35, 0.12, 0.35]} />
              <meshPhysicalMaterial
                map={bodyTexture || undefined}
                color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
                {...finishParams}
              />
            </mesh>
            <mesh position={[0.6, 0.06, 0]} rotation={[-0.15, 0, 0]}>
              <boxGeometry args={[0.35, 0.12, 0.35]} />
              <meshPhysicalMaterial
                map={bodyTexture || undefined}
                color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
                {...finishParams}
              />
            </mesh>
          </group>

          {/* Rear Testarossa Slatted Grille */}
          <mesh position={[0, 0.32, -2.16]}>
            <boxGeometry args={[1.9, 0.22, 0.04]} />
            <meshBasicMaterial color="#111111" />
          </mesh>
          <mesh position={[0, 0.34, -2.18]}>
            <boxGeometry args={[1.7, 0.06, 0.02]} />
            <meshBasicMaterial color="#ff0033" />
          </mesh>
        </group>
      )}

      {/* ════════════════ 3. BRAVADO BANSHEE GTS ════════════════ */}
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
              color={liveryState.windowTint === 'cyan_neon' ? '#00f0ff' : '#0b0f19'}
              roughness={0.05}
              transmission={0.8}
              transparent
              clearcoat={1.0}
            />
          </mesh>

          {/* Round Headlights */}
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
        </group>
      )}

      {/* ════════════════ 4. PFISTER COMET GT TURBO ════════════════ */}
      {liveryState.vehicle === 'comet' && (
        <group position={[0, 0.6, 0]}>
          {/* Main Curved Coupe Body */}
          <mesh castShadow receiveShadow position={[0, 0.32, 0]}>
            <boxGeometry args={[1.85, 0.52, 4.1]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          {/* Wide Rear Turbo Flares */}
          <mesh position={[-0.96, 0.3, -1.1]}>
            <boxGeometry args={[0.22, 0.4, 1.4]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>
          <mesh position={[0.96, 0.3, -1.1]}>
            <boxGeometry args={[0.22, 0.4, 1.4]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          {/* Curved Teardrop Roof */}
          <mesh position={[0, 0.72, -0.3]}>
            <boxGeometry args={[1.45, 0.42, 1.8]} />
            <meshPhysicalMaterial
              color={liveryState.windowTint === 'cyan_neon' ? '#00f0ff' : '#0a0d14'}
              roughness={0.05}
              transmission={0.8}
              transparent
              clearcoat={1.0}
            />
          </mesh>

          {/* Iconic Whale-Tail Rear Spoiler */}
          <mesh position={[0, 0.62, -1.85]} rotation={[0.15, 0, 0]}>
            <boxGeometry args={[1.7, 0.08, 0.6]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#111111'}
              metalness={0.8}
              roughness={0.2}
              clearcoat={0.9}
            />
          </mesh>

          {/* Iconic 911 Bug-Eye Headlights */}
          <group position={[0, 0.52, 1.85]}>
            <mesh position={[-0.65, 0, 0]} rotation={[0.3, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.2, 16]} />
              <meshBasicMaterial color={liveryState.headlightsOn ? liveryState.headlightsColor : '#333333'} />
            </mesh>
            <mesh position={[0.65, 0, 0]} rotation={[0.3, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.2, 16]} />
              <meshBasicMaterial color={liveryState.headlightsOn ? liveryState.headlightsColor : '#333333'} />
            </mesh>
          </group>
        </group>
      )}

      {/* ════════════════ 5. VAPID DOMINATOR GTX ════════════════ */}
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

          {/* Aggressive Front Grille */}
          <mesh position={[0, 0.4, 2.26]}>
            <boxGeometry args={[1.8, 0.35, 0.05]} />
            <meshPhysicalMaterial color="#050505" roughness={0.9} metalness={0.1} />
          </mesh>
        </group>
      )}

      {/* ════════════════ 6. STREET DEMON DIRTBIKE ════════════════ */}
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
          {/* Handlebars */}
          <mesh position={[0, 0.8, 0.6]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.9, 12]} />
            <meshStandardMaterial color="#facc15" metalness={0.8} />
          </mesh>
        </group>
      )}

      {/* ════════════════ 7. BULLET TRAIN LOCOMOTIVE ════════════════ */}
      {liveryState.vehicle === 'train' && (
        <group position={[0, 0.9, 0]}>
          {/* Main Locomotive Body */}
          <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[2.1, 1.4, 5.8]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>
          {/* Aerodynamic Nose Cone */}
          <mesh position={[0, 0.2, 3.1]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[2.0, 1.0, 1.2]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>
          {/* Cab Windshield */}
          <mesh position={[0, 0.7, 2.5]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[1.9, 0.5, 0.8]} />
            <meshPhysicalMaterial color="#00f0ff" transmission={0.8} transparent opacity={0.8} roughness={0.1} />
          </mesh>
          {/* Roof Pantograph */}
          <group position={[0, 1.2, -1.0]}>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[1.2, 0.05, 0.8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
          </group>
        </group>
      )}

      {/* ════════════════ 8. MIDNIGHT POWERBOAT ════════════════ */}
      {liveryState.vehicle === 'boat' && (
        <group position={[0, 0.5, 0]}>
          {/* V-Hull Main Body */}
          <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
            <boxGeometry args={[1.9, 0.6, 4.6]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>
          {/* Sharp Bow Nose */}
          <mesh position={[0, 0.3, 2.6]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[1.6, 0.5, 1.2]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>
          {/* Windshield */}
          <mesh position={[0, 0.75, 0.5]} rotation={[-0.4, 0, 0]}>
            <boxGeometry args={[1.7, 0.45, 0.6]} />
            <meshPhysicalMaterial color="#38bdf8" transmission={0.85} transparent opacity={0.7} roughness={0.1} />
          </mesh>
          {/* Twin Outboard Motors */}
          <group position={[0, 0.2, -2.4]}>
            <mesh position={[-0.5, 0, 0]}>
              <boxGeometry args={[0.35, 0.6, 0.5]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
            <mesh position={[0.5, 0, 0]}>
              <boxGeometry args={[0.35, 0.6, 0.5]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
          </group>
        </group>
      )}

      {/* ════════════════ 9. STEALTH HELICOPTER ════════════════ */}
      {liveryState.vehicle === 'helicopter' && (
        <group position={[0, 1.0, 0]}>
          {/* Cockpit Canopy Fuselage */}
          <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
            <sphereGeometry args={[1.1, 24, 24]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>
          {/* Tail Boom */}
          <mesh position={[0, 0.3, -2.2]}>
            <boxGeometry args={[0.35, 0.35, 2.8]} />
            <meshPhysicalMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>
          {/* Main Rotor Mast & Rotor Assembly */}
          <group position={[0, 1.3, 0]}>
            <mesh rotation={[0, 0, 0]}>
              <boxGeometry args={[5.2, 0.05, 0.25]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
          </group>
          {/* Tail Rotor */}
          <group position={[0.25, 0.5, -3.5]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <boxGeometry args={[0.9, 0.04, 0.1]} />
              <meshStandardMaterial color="#a855f7" />
            </mesh>
          </group>
          {/* Landing Skids */}
          <group position={[0, -0.9, 0]}>
            <mesh position={[-0.8, 0, 0]}>
              <boxGeometry args={[0.1, 0.1, 3.2]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
            <mesh position={[0.8, 0, 0]}>
              <boxGeometry args={[0.1, 0.1, 3.2]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
          </group>
        </group>
      )}

      {/* --- WHEELS ASSEMBLY (Only for wheeled vehicles) --- */}
      {liveryState.vehicle !== 'boat' && liveryState.vehicle !== 'helicopter' && (
        <>
          {liveryState.vehicle === 'dirtbike' ? (
            <>
              {/* Inline Bike Wheels */}
              <Wheel position={[0, 0.35, 1.0]} rimColor={rimColor} />
              <Wheel position={[0, 0.35, -1.0]} rimColor={rimColor} />
            </>
          ) : (
            <>
              {/* 4 Corner Car / Train Wheels */}
              <Wheel position={[-0.95, 0.35, 1.4]} rimColor={rimColor} />
              <Wheel position={[0.95, 0.35, 1.4]} rimColor={rimColor} />
              <Wheel position={[-0.95, 0.35, -1.4]} rimColor={rimColor} />
              <Wheel position={[0.95, 0.35, -1.4]} rimColor={rimColor} />
            </>
          )}
        </>
      )}
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
