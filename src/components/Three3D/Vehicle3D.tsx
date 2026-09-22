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
  const wheelsRef = useRef<THREE.Group[]>([]);

  // Create & Update Three.js CanvasTexture live from 2D Canvas
  const bodyTexture = useMemo(() => {
    if (!canvasElement) return null;
    const tex = new THREE.CanvasTexture(canvasElement);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
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

  // Calculate body material physical parameters based on Paint Finish
  const finishParams = useMemo(() => {
    switch (liveryState.finish) {
      case 'matte':
        return { roughness: 0.8, metalness: 0.05, clearcoat: 0 };
      case 'metallic':
        return { roughness: 0.25, metalness: 0.8, clearcoat: 0.6 };
      case 'pearlescent':
      case 'chameleon':
        return { roughness: 0.15, metalness: 0.5, clearcoat: 1.0 };
      case 'carbon':
        return { roughness: 0.5, metalness: 0.2, clearcoat: 0.3 };
      case 'rust':
        return { roughness: 0.95, metalness: 0.05, clearcoat: 0 };
      case 'gloss':
      default:
        return { roughness: 0.2, metalness: 0.1, clearcoat: 0.8 };
    }
  }, [liveryState.finish]);

  const underglowColor = liveryState.underglowEnabled ? liveryState.underglowColor : '#000000';

  return (
    <group ref={vehicleGroupRef} position={[0, 0, 0]}>
      {/* UNDERGLOW NEON LIGHTING STRIPS & GROUND LIGHT */}
      {liveryState.underglowEnabled && (
        <group position={[0, 0.05, 0]}>
          <pointLight color={underglowColor} intensity={8} distance={6} decay={2} />
          {/* Neon Light Tube Bar Mesh */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.8, 0.04, 3.8]} />
            <meshBasicMaterial color={underglowColor} />
          </mesh>
        </group>
      )}

      {/* --- INFERNUS SUPERCAR --- */}
      {liveryState.vehicle === 'infernus' && (
        <group position={[0, 0.6, 0]}>
          {/* Main Wedge Body */}
          <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
            <boxGeometry args={[2.0, 0.5, 4.4]} />
            <meshStandardMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          {/* Cabin Greenhouse Glass */}
          <mesh position={[0, 0.75, -0.2]}>
            <boxGeometry args={[1.6, 0.45, 2.0]} />
            <meshPhysicalMaterial
              color="#0d111a"
              transmission={0.8}
              opacity={1}
              transparent
              roughness={0.1}
              ior={1.5}
            />
          </mesh>

          {/* Animated Hood Bonnet */}
          <group ref={hoodRef} position={[0, 0.55, 1.2]}>
            <mesh castShadow position={[0, 0, 0.6]}>
              <boxGeometry args={[1.7, 0.12, 1.2]} />
              <meshStandardMaterial
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
              <meshStandardMaterial
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
              <meshStandardMaterial color="#111111" roughness={0.3} />
            </mesh>
            <mesh position={[-0.8, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
            <mesh position={[0.8, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
              <meshStandardMaterial color="#111111" />
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
          {/* Main Curved Body */}
          <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
            <boxGeometry args={[1.9, 0.55, 4.2]} />
            <meshStandardMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          {/* Long Front Bonnet / Hood */}
          <group ref={hoodRef} position={[0, 0.55, 0.8]}>
            <mesh castShadow position={[0, 0, 0.7]}>
              <boxGeometry args={[1.65, 0.15, 1.4]} />
              <meshStandardMaterial
                map={bodyTexture || undefined}
                color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
                {...finishParams}
              />
            </mesh>
          </group>

          {/* Cabin Glass */}
          <mesh position={[0, 0.8, -0.4]}>
            <sphereGeometry args={[0.9, 16, 16]} />
            <meshPhysicalMaterial color="#0b0f19" roughness={0.1} transmission={0.75} transparent />
          </mesh>

          {/* Headlights */}
          <group position={[0, 0.42, 2.05]}>
            <mesh position={[-0.65, 0, 0]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial color={liveryState.headlightsOn ? liveryState.headlightsColor : '#222222'} />
            </mesh>
            <mesh position={[0.65, 0, 0]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial color={liveryState.headlightsOn ? liveryState.headlightsColor : '#222222'} />
            </mesh>
            {liveryState.headlightsOn && (
              <spotLight position={[0, 0, 0.2]} target-position={[0, -0.5, 10]} color={liveryState.headlightsColor} intensity={15} distance={18} angle={0.6} />
            )}
          </group>

          {/* Dual Rear Exhaust Pipes */}
          <mesh position={[-0.5, 0.15, -2.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
            <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.5, 0.15, -2.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
            <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      )}

      {/* --- DOMINATOR MUSCLE CAR --- */}
      {liveryState.vehicle === 'dominator' && (
        <group position={[0, 0.65, 0]}>
          {/* Heavy Muscle Chassis */}
          <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[2.1, 0.65, 4.5]} />
            <meshStandardMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          {/* High Blower Hood Scoop */}
          <mesh castShadow position={[0, 0.85, 1.2]}>
            <boxGeometry args={[0.6, 0.25, 0.8]} />
            <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Cabin Roof */}
          <mesh position={[0, 0.9, -0.3]}>
            <boxGeometry args={[1.7, 0.45, 1.8]} />
            <meshStandardMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          {/* Aggressive Front Grille */}
          <mesh position={[0, 0.4, 2.26]}>
            <boxGeometry args={[1.8, 0.35, 0.05]} />
            <meshStandardMaterial color="#050505" roughness={0.9} />
          </mesh>

          {/* Quad Round Headlights */}
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
          {/* Bike Frame & Fuel Tank */}
          <mesh castShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[0.6, 0.5, 1.8]} />
            <meshStandardMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          {/* Exposed Engine Block */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.5, 0.4, 0.8]} />
            <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Front Number Plate & Fairing */}
          <mesh position={[0, 0.65, 0.95]}>
            <boxGeometry args={[0.5, 0.4, 0.05]} />
            <meshStandardMaterial
              map={bodyTexture || undefined}
              color={!bodyTexture ? liveryState.primaryColor : '#ffffff'}
              {...finishParams}
            />
          </mesh>

          {/* Handlebars */}
          <mesh position={[0, 0.85, 0.7]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 1.1, 16]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>
      )}

      {/* --- WHEELS ASSEMBLY --- */}
      <Wheel position={[-0.95, 0.35, 1.4]} />
      <Wheel position={[0.95, 0.35, 1.4]} />
      <Wheel position={[-0.95, 0.35, -1.4]} />
      <Wheel position={[0.95, 0.35, -1.4]} />
    </group>
  );
};

// Wheel Component with rubber tire tread & metallic rim
const Wheel: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Rubber Tire */}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.28, 24]} />
        <meshStandardMaterial color="#141414" roughness={0.9} />
      </mesh>
      {/* Metallic Rim */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.3, 16]} />
        <meshStandardMaterial color="#e5e5e5" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Brake Caliper */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.1, 0.2, 0.15]} />
        <meshStandardMaterial color="#ff0033" metalness={0.5} />
      </mesh>
    </group>
  );
};
