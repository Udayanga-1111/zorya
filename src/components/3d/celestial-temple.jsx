"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

interface CelestialTempleProps {
  dayProgress: number; // 0 = night, 1 = day
}

/**
 * Floating Lotus Petals drifting on the water surface
 */
function LotusPetals({ dayProgress }: { dayProgress: number }) {
  const petalsRef = useRef<THREE.InstancedMesh>(null);
  const count = 50;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const initialData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: (Math.sin(i * 2.39996) * 0.9) * 18,
      z: (Math.cos(i * 2.39996) * 0.9) * 18,
      rot: i * 1.618,
      scale: 0.22 + (i % 3) * 0.12,
      speed: 0.15 + (i % 5) * 0.07,
    }));
  }, []);

  useFrame((state) => {
    if (!petalsRef.current) return;
    const time = state.clock.getElapsedTime();

    initialData.forEach((petal, i) => {
      const x = petal.x + Math.sin(time * petal.speed + i) * 1.2;
      const z = petal.z + Math.cos(time * petal.speed * 0.7 + i) * 1.2;
      const y = 0.05 + Math.sin(time * 1.2 + i) * 0.04;

      dummy.position.set(x, y, z);
      dummy.rotation.set(-Math.PI / 2 + Math.sin(time * 0.4 + i) * 0.15, 0, petal.rot + time * 0.04);
      dummy.scale.setScalar(petal.scale * dayProgress);
      dummy.updateMatrix();

      petalsRef.current!.setMatrixAt(i, dummy.matrix);
    });
    petalsRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={petalsRef} args={[undefined, undefined, count]} visible={dayProgress > 0.05}>
      <planeGeometry args={[0.7, 0.4]} />
      <meshStandardMaterial
        color="#f9a8d4"
        emissive="#f472b6"
        emissiveIntensity={0.6 * dayProgress}
        roughness={0.5}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

export function CelestialTemple({ dayProgress }: CelestialTempleProps) {
  const templeGroupRef = useRef<THREE.Group>(null);
  const zodiacRingsRef = useRef<THREE.Group>(null);
  const crystalsRef = useRef<THREE.Group>(null);

  const marbleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f8f6f0",
        roughness: 0.25,
        metalness: 0.08,
        envMapIntensity: 1.2,
      }),
    []
  );

  const goldMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#c9952a",
        emissive: "#d4af37",
        emissiveIntensity: 1.0,
        metalness: 0.95,
        roughness: 0.1,
      }),
    []
  );

  const crystalMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#e0f2fe",
        emissive: "#7dd3fc",
        emissiveIntensity: 0.5,
        transmission: 0.85,
        opacity: 0.95,
        transparent: true,
        roughness: 0.05,
        metalness: 0.1,
        ior: 1.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
      }),
    []
  );

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (templeGroupRef.current) {
      // Rise from just below camera into full view (y: -4 → 0)
      templeGroupRef.current.position.y = THREE.MathUtils.lerp(-4, 0, dayProgress);
    }

    if (zodiacRingsRef.current) {
      zodiacRingsRef.current.rotation.y += delta * 0.1;
      zodiacRingsRef.current.rotation.x = Math.sin(time * 0.15) * 0.12;
    }

    if (crystalsRef.current) {
      crystalsRef.current.children.forEach((child, i) => {
        child.rotation.y += delta * (0.25 + i * 0.06);
        child.rotation.x += delta * (0.12 + i * 0.04);
      });
    }

    // Update gold emissive with dayProgress so it "lights up" as day arrives
    goldMaterial.emissiveIntensity = dayProgress * 1.2;
  });

  return (
    <group ref={templeGroupRef} visible={dayProgress > 0.01}>

      {/* ── 1. Main Circular Marble Podium at camera level ── */}
      <group position={[0, -1.0, -4]}>
        <mesh material={marbleMaterial}>
          <cylinderGeometry args={[9, 10, 0.5, 64]} />
        </mesh>

        {/* Marble columns arranged in a circle */}
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = (i / 10) * Math.PI * 2;
          const cx = Math.sin(angle) * 8.5;
          const cz = Math.cos(angle) * 8.5;
          return (
            <group key={i} position={[cx, 4.5, cz]}>
              {/* Shaft */}
              <mesh material={marbleMaterial}>
                <cylinderGeometry args={[0.28, 0.35, 9, 20]} />
              </mesh>
              {/* Base */}
              <mesh position={[0, -4.7, 0]} material={marbleMaterial}>
                <cylinderGeometry args={[0.55, 0.55, 0.4, 20]} />
              </mesh>
              {/* Golden Capital */}
              <mesh position={[0, 4.7, 0]} material={goldMaterial}>
                <boxGeometry args={[0.9, 0.35, 0.9]} />
              </mesh>
            </group>
          );
        })}

        {/* Concentric decorative golden ring on the floor */}
        <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={goldMaterial}>
          <torusGeometry args={[5.5, 0.06, 8, 64]} />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={goldMaterial}>
          <torusGeometry args={[3.0, 0.04, 8, 64]} />
        </mesh>
      </group>

      {/* ── 2. Massive Golden Zodiac Astrolabe Rings – close enough to see clearly ── */}
      <group ref={zodiacRingsRef} position={[0, 2, -6]}>
        {/* Outer ring */}
        <mesh material={goldMaterial}>
          <torusGeometry args={[10, 0.18, 16, 120]} />
        </mesh>
        {/* Mid ring tilted */}
        <mesh material={goldMaterial} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[8.5, 0.13, 16, 120]} />
        </mesh>
        {/* Inner ring tilted opposite */}
        <mesh material={goldMaterial} rotation={[-Math.PI / 3, 0.4, 0]}>
          <torusGeometry args={[7, 0.09, 16, 120]} />
        </mesh>
        {/* Innermost equatorial ring */}
        <mesh material={goldMaterial} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[5.5, 0.07, 16, 120]} />
        </mesh>
      </group>

      {/* ── 3. Floating Refractive Crystal Shards catching sunlight ── */}
      <group ref={crystalsRef}>
        {[
          { pos: [-5, 1.5, -2], scale: 1.0 },
          { pos: [5, 2.5, -3], scale: 1.3 },
          { pos: [-2.5, 3.5, -5], scale: 0.85 },
          { pos: [4, 0.8, -1.5], scale: 1.1 },
          { pos: [-6, 3, -4], scale: 0.7 },
          { pos: [1.5, 4.5, -6], scale: 0.9 },
        ].map((item, i) => (
          <Float key={i} speed={1.8 + i * 0.2} rotationIntensity={0.7} floatIntensity={1.2}>
            <mesh position={item.pos as any} material={crystalMaterial} scale={item.scale}>
              <octahedronGeometry args={[1, 0]} />
            </mesh>
          </Float>
        ))}
      </group>

      {/* ── 4. Volumetric Sunlight Rays (god-rays simulated with glowing planes) ── */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 1.25) * 6,
            5,
            Math.cos(i * 1.25) * 4 - 5,
          ]}
          rotation={[0.1, i * 0.8, 0.05]}
        >
          <planeGeometry args={[0.6, 14]} />
          <meshBasicMaterial
            color="#fef9c3"
            transparent
            opacity={0.09 * dayProgress}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* ── 5. Floating Lotus Petals on crystal water ── */}
      <LotusPetals dayProgress={dayProgress} />

      {/* ── 6. Golden Sunlit Dust Particles ── */}
      <Sparkles
        count={300}
        scale={28}
        size={5}
        speed={0.5}
        opacity={dayProgress * 0.85}
        color="#fde68a"
      />
    </group>
  );
}
