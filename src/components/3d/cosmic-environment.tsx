"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { createCircularStarTexture, createCircularNebulaTexture } from "./star-textures";

/**
 * Animated Shooting Stars component
 */
function ShootingStars() {
  const active = useRef(false);
  const progress = useRef(0);
  const startPos = useRef(new THREE.Vector3());
  const endPos = useRef(new THREE.Vector3());

  const { lineObject, lineGeo } = useMemo(() => {
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: "#a5f3fc",
      transparent: true,
      opacity: 0.9,
      linewidth: 2,
      blending: THREE.AdditiveBlending,
    });
    const lineObj = new THREE.Line(geo, mat);
    return { lineObject: lineObj, lineGeo: geo };
  }, []);

  useFrame((_state, delta) => {
    if (!active.current) {
      if (Math.random() < 0.008) {
        active.current = true;
        progress.current = 0;

        startPos.current.set(
          (Math.random() - 0.5) * 35,
          14 + Math.random() * 8,
          (Math.random() - 0.5) * 20 - 5
        );
        endPos.current.copy(startPos.current).add(
          new THREE.Vector3(-9 - Math.random() * 6, -11 - Math.random() * 6, (Math.random() - 0.5) * 6)
        );
      }
    } else {
      progress.current += delta * 1.8;
      if (progress.current >= 1) {
        active.current = false;
        const positions = lineGeo.attributes.position.array as Float32Array;
        positions[0] = 0; positions[1] = 0; positions[2] = 0;
        positions[3] = 0; positions[4] = 0; positions[5] = 0;
        lineGeo.attributes.position.needsUpdate = true;
      } else {
        const currentHead = new THREE.Vector3().lerpVectors(startPos.current, endPos.current, progress.current);
        const currentTail = new THREE.Vector3().lerpVectors(startPos.current, endPos.current, Math.max(0, progress.current - 0.15));

        const positions = lineGeo.attributes.position.array as Float32Array;
        positions[0] = currentHead.x;
        positions[1] = currentHead.y;
        positions[2] = currentHead.z;
        positions[3] = currentTail.x;
        positions[4] = currentTail.y;
        positions[5] = currentTail.z;
        lineGeo.attributes.position.needsUpdate = true;
      }
    }
  });

  return <primitive object={lineObject} />;
}

/**
 * Hyper-realistic Circular Nebula Clouds
 */
function NebulaClouds() {
  const meshRef1 = useRef<THREE.Points>(null);
  const nebulaTexture = useMemo(() => createCircularNebulaTexture(), []);

  const nebulaData = useMemo(() => {
    const count = 900;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colors = [
      new THREE.Color("#4c1d95"), // Deep violet
      new THREE.Color("#1e1b4b"), // Deep indigo
      new THREE.Color("#1e3a8a"), // Deep blue
      new THREE.Color("#701a75"), // Deep magenta
      new THREE.Color("#78350f"), // Pale cosmic amber
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;

      const c = colors[Math.floor(Math.random() * colors.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { pos, col };
  }, []);

  useFrame((_state, delta) => {
    if (meshRef1.current) {
      meshRef1.current.rotation.z += delta * 0.008;
    }
  });

  return (
    <group>
      <points ref={meshRef1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nebulaData.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[nebulaData.col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={1.2}
          map={nebulaTexture}
          vertexColors
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export function CosmicEnvironment({ isDark }: { isDark: boolean }) {
  return (
    <>
      {/* Dynamic Lighting */}
      <ambientLight intensity={isDark ? 0.9 : 1.3} />
      <directionalLight
        position={[15, 20, 15]}
        intensity={isDark ? 2.0 : 2.8}
        color={isDark ? "#818cf8" : "#f59e0b"}
      />
      <pointLight
        position={[-15, -15, -10]}
        intensity={isDark ? 2.5 : 1.5}
        color={isDark ? "#38bdf8" : "#ec4899"}
      />

      {/* Volumetric Fog for Deep Space distance fade */}
      <fog attach="fog" args={[isDark ? "#050816" : "#f1f5f9", 25, 130]} />

      {/* Deep Space Starfield with realistic star sizes and colors */}
      <Stars
        radius={100}
        depth={60}
        count={isDark ? 6000 : 3500}
        factor={5}
        saturation={0.5}
        fade
        speed={1.2}
      />

      {/* Nebula Clouds */}
      <NebulaClouds />

      {/* Shooting Stars */}
      <ShootingStars />
    </>
  );
}
