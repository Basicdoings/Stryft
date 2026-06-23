import { ContactShadows } from '@react-three/drei/native';
import { useFrame } from '@react-three/fiber/native';
import { useRef } from 'react';
import * as THREE from 'three';

interface StudioBackdropProps {
  /** Rim light color — tint based on avatar state (green = thriving, blue = tired, etc.) */
  rimLightColor?: string;
  /** Floor Y position */
  floorY?: number;
  /** Show contact shadows */
  showShadows?: boolean;
}

/**
 * Premium dark studio environment with:
 * - Semi-transparent reflective floor plane
 * - Contact shadows beneath the model
 * - Configurable rim light for avatar state tinting
 * - Subtle grid fade effect
 */
export function StudioBackdrop({
  rimLightColor = '#00bfff',
  floorY = 0,
  showShadows = true,
}: StudioBackdropProps) {
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const floorRef = useRef<THREE.Mesh>(null);

  // Smoothly transition rim light color changes
  useFrame(() => {
    if (rimLightRef.current) {
      const target = new THREE.Color(rimLightColor);
      rimLightRef.current.color.lerp(target, 0.05);
    }
  });

  return (
    <>
      {/* ── Key Light (warm white from upper-right) ── */}
      <directionalLight
        position={[1.5, 3, 2]}
        intensity={1.1}
        color={0xffffff}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
      />

      {/* ── Ambient fill (low intensity to preserve contrast) ── */}
      <ambientLight intensity={0.3} color={0xffffff} />

      {/* ── Rim / accent light (electric cyan by default, configurable) ── */}
      <directionalLight
        ref={rimLightRef}
        position={[-2, 1.5, -2]}
        intensity={1.4}
        color={rimLightColor}
      />

      {/* ── Subtle warm up-light for sculpting ── */}
      <pointLight
        position={[0, 0.1, 1]}
        intensity={0.3}
        color={0xffa040}
        distance={5}
        decay={2}
      />

      {/* ── Reflective floor plane ── */}
      <mesh
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, floorY - 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#0a0a0f"
          metalness={0.8}
          roughness={0.4}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* ── Contact shadows for grounding ── */}
      {showShadows && (
        <ContactShadows
          position={[0, floorY, 0]}
          opacity={0.6}
          scale={10}
          blur={2.5}
          far={4}
          color="#000000"
        />
      )}
    </>
  );
}
