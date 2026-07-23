"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import * as THREE from "three";

interface ZodiacSignProps {
  position: [number, number, number];
  name: string;
  symbol: string;
  index: number;
}

export function ZodiacSign({ position, name, symbol, index }: ZodiacSignProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth continuous rotation of each crystal
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x += delta * 0.15;
    }

    if (textRef.current) {
      // Keep symbol and label facing the camera at all times
      textRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  return (
    <group position={position}>
      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.6}>
        {/* Solid Crystal Octahedron Mesh */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1.0, 0]} />
          <meshPhysicalMaterial
            color="#d4af37"
            emissive="#4c1d95"
            emissiveIntensity={0.8}
            metalness={0.85}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transparent={false}
            opacity={1.0}
          />
        </mesh>

        {/* Camera-Facing Text & Symbol */}
        <group ref={textRef} position={[0, 1.5, 0]}>
          <Text
            fontSize={0.85}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.035}
            outlineColor="#0f172a"
          >
            {symbol}
          </Text>
          <Text
            position={[0, -0.7, 0]}
            fontSize={0.32}
            color="#fef08a"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#0f172a"
          >
            {name}
          </Text>
        </group>
      </Float>
    </group>
  );
}
