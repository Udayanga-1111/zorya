"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { CONSTELLATIONS } from "./constellations-data";

interface CrystalWaterProps {
  dayProgress: number;
}

export function CrystalWater({ dayProgress }: CrystalWaterProps) {
  const waterMeshRef = useRef<THREE.Mesh>(null);
  const underwaterGroupRef = useRef<THREE.Group>(null);
  const waveTime = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // used for future ripple effect – stored for frame access
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Underwater golden zodiac lines
  const underwaterLines = useMemo(() => {
    const coords: number[] = [];
    CONSTELLATIONS.forEach((constellation, idx) => {
      const offsetX = ((idx % 4) - 1.5) * 5.5;
      const offsetZ = (Math.floor(idx / 4) - 1.0) * 5.5;

      constellation.lines.forEach(([fromIdx, toIdx]) => {
        const s1 = constellation.stars[fromIdx];
        const s2 = constellation.stars[toIdx];
        if (s1 && s2) {
          coords.push(s1.x * 1.0 + offsetX, -1.6, s1.y * 1.0 + offsetZ);
          coords.push(s2.x * 1.0 + offsetX, -1.6, s2.y * 1.0 + offsetZ);
        }
      });
    });
    return new Float32Array(coords);
  }, []);

  const underwaterStars = useMemo(() => {
    const coords: number[] = [];
    CONSTELLATIONS.forEach((constellation, idx) => {
      const offsetX = ((idx % 4) - 1.5) * 5.5;
      const offsetZ = (Math.floor(idx / 4) - 1.0) * 5.5;
      constellation.stars.forEach((s) => {
        coords.push(s.x * 1.0 + offsetX, -1.55, s.y * 1.0 + offsetZ);
      });
    });
    return new Float32Array(coords);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    waveTime.current += delta;

    if (waterMeshRef.current) {
      const mat = waterMeshRef.current.material as THREE.MeshPhysicalMaterial;
      // Water is always visible with minimum opacity in light mode
      mat.opacity = THREE.MathUtils.lerp(0.0, 0.82, dayProgress);

      // Gentle wave tilt
      waterMeshRef.current.rotation.x = -Math.PI / 2 + Math.sin(time * 0.4) * 0.008;
      waterMeshRef.current.rotation.z = Math.cos(time * 0.3) * 0.004;
    }

    if (underwaterGroupRef.current) {
      underwaterGroupRef.current.position.y = THREE.MathUtils.lerp(-4, -0.55, dayProgress);
      underwaterGroupRef.current.rotation.y = time * 0.015;

      underwaterGroupRef.current.children.forEach((child) => {
        if (child instanceof THREE.LineSegments) {
          (child.material as THREE.LineBasicMaterial).opacity =
            THREE.MathUtils.lerp(0.0, 0.9, dayProgress);
        } else if (child instanceof THREE.Points) {
          (child.material as THREE.PointsMaterial).opacity =
            THREE.MathUtils.lerp(0.0, 1.0, dayProgress);
        }
      });
    }
  });

  return (
    <group>
      {/* ── Crystal Water Surface ── */}
      <mesh
        ref={waterMeshRef}
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[120, 120, 80, 80]} />
        <meshPhysicalMaterial
          color="#e0f7fa"
          transmission={0.88}
          opacity={0.82}
          transparent
          roughness={0.04}
          metalness={0.05}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          reflectivity={0.95}
          ior={1.333}
          depthWrite={false}
        />
      </mesh>

      {/* ── Underwater Golden Constellation Maps ── */}
      <group ref={underwaterGroupRef} position={[0, -0.55, 0]}>
        {/* Golden Constellation Lines */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[underwaterLines, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color="#f59e0b"
            transparent
            opacity={0.9}
            linewidth={2}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>

        {/* Golden Constellation Star Points */}
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[underwaterStars, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.3}
            color="#fbbf24"
            transparent
            opacity={1.0}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* Underwater suspended stardust */}
        <Sparkles
          count={200}
          scale={35}
          size={4}
          speed={0.35}
          opacity={dayProgress * 0.85}
          color="#fde68a"
        />
      </group>

      {/* ── Reflected golden light caustics on underside ── */}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshBasicMaterial
          color="#fef3c7"
          transparent
          opacity={0.12 * dayProgress}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
