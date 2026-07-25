"use client";

import { useRef, useState, useEffect, createContext, useContext } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { CONSTELLATIONS } from "./constellations-data";
import { ConstellationMesh } from "./constellation-mesh";
import { CosmicEnvironment } from "./cosmic-environment";
import { CrystalWater } from "./crystal-water";
import { CelestialTemple } from "./celestial-temple";
import { useTheme } from "next-themes";

// ─────────────────────────────────────────────────────────────────────────────
// Shared ref context so children can read dayProgress without React state
// ─────────────────────────────────────────────────────────────────────────────
const DayProgressContext = createContext<React.MutableRefObject<number>>({ current: 0 });

function useDayProgress() {
  return useContext(DayProgressContext);
}

// ─────────────────────────────────────────────────────────────────────────────
// Camera Rig
// ─────────────────────────────────────────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePos.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    camera.position.x += (mousePos.current.x * 2.0 - camera.position.x) * 0.03;
    camera.position.y += (-mousePos.current.y * 1.5 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Zodiac Constellation Ring (reads dayProgress from shared ref — no re-renders)
// ─────────────────────────────────────────────────────────────────────────────
function ZodiacConstellationsRing() {
  const groupRef = useRef<THREE.Group>(null);
  const dayRef = useDayProgress();
  const radius = 9.5;

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.04;
    groupRef.current.position.y = THREE.MathUtils.lerp(0, 8, dayRef.current);
    groupRef.current.visible = dayRef.current < 0.98;
  });

  return (
    <group ref={groupRef}>
      {CONSTELLATIONS.map((constellation, i) => {
        const angle = (i / CONSTELLATIONS.length) * Math.PI * 2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const y = Math.sin(angle * 2) * 1.8;
        return (
          <ConstellationMesh
            key={constellation.name}
            index={i}
            data={constellation}
            position={[x, y, z]}
          />
        );
      })}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Adaptive Lighting (reads dayProgress ref — no setState)
// ─────────────────────────────────────────────────────────────────────────────
function AdaptiveLighting() {
  const ambRef = useRef<THREE.AmbientLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);
  const dayRef = useDayProgress();

  useFrame(() => {
    const p = dayRef.current;
    if (ambRef.current)  ambRef.current.intensity = THREE.MathUtils.lerp(0.9, 3.2, p);
    if (dirRef.current)  dirRef.current.intensity  = THREE.MathUtils.lerp(2.0, 5.5, p);
    if (fillRef.current) fillRef.current.intensity = p * 4.0;
  });

  return (
    <>
      <ambientLight ref={ambRef} intensity={0.9} />
      <directionalLight ref={dirRef} position={[10, 25, 8]} intensity={2.0} color="#fffbeb" castShadow={false} />
      <pointLight ref={fillRef} position={[0, 8, 2]} intensity={0} color="#fde68a" distance={30} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Adaptive Bloom (reads dayProgress ref — no setState)
// ─────────────────────────────────────────────────────────────────────────────
function AdaptiveBloom() {
  const dayRef = useDayProgress();
  // Only update bloom every 6 frames to reduce GPU pressure
  const frame = useRef(0);
  const [params, setParams] = useState({ threshold: 0.2, intensity: 1.6 });

  useFrame(() => {
    frame.current++;
    if (frame.current % 6 !== 0) return;
    const p = dayRef.current;
    setParams({
      threshold: THREE.MathUtils.lerp(0.2, 0.5, p),
      intensity: THREE.MathUtils.lerp(1.6, 0.8, p),
    });
  });

  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={params.threshold}
        mipmapBlur
        intensity={params.intensity}
      />
    </EffectComposer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Night / Day scene transition engine — only uses a ref, ZERO React setState
// ─────────────────────────────────────────────────────────────────────────────
function SceneContents({ isDark }: { isDark: boolean }) {
  const dayProgressRef = useRef(isDark ? 0.0 : 1.0);

  // Smooth cinematic lerp toward target — no setState, no re-renders
  useFrame(() => {
    const target = isDark ? 0 : 1;
    dayProgressRef.current = THREE.MathUtils.lerp(dayProgressRef.current, target, 0.022);
  });

  return (
    <DayProgressContext.Provider value={dayProgressRef}>
      {/* 1. Adaptive Lighting */}
      <AdaptiveLighting />

      {/* 2. NIGHT REALM: Deep Space, Milky Way, 3D Orbiting Constellations */}
      <CosmicEnvironment isDark={isDark} />
      <ZodiacConstellationsRing />

      {/* 3. DAY REALM: Crystal Water & Celestial Temple */}
      <CrystalWater />
      <CelestialTemple />

      {/* 4. Camera Rig */}
      <CameraRig />

      {/* 5. Adaptive Bloom */}
      <AdaptiveBloom />
    </DayProgressContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root HeroScene — Canvas only mounts client-side (fixes hydration mismatch)
// ─────────────────────────────────────────────────────────────────────────────
export function HeroScene() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR always renders dark bg; client switches after mount — suppress the one-time diff
  const isDark = mounted ? resolvedTheme !== "light" : true;

  return (
    <div
      className="absolute inset-0 z-0 h-full w-full overflow-hidden"
      // suppressHydrationWarning prevents React from warning about the one-time
      // server/client bg difference before theme is known on the client
      suppressHydrationWarning
      style={{
        background: isDark
          ? "radial-gradient(ellipse at center, #0a0f2d 0%, #050816 100%)"
          : "radial-gradient(ellipse at center, #fffbeb 0%, #f1f5f9 100%)",
      }}
    >
      {mounted && (
        <Canvas
          camera={{ position: [0, 0, 16], fov: 45, near: 0.1, far: 250 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,   // disabled for perf — we don't use stencil
            depth: true,
          }}
          dpr={[1, 1.5]}      // cap pixel ratio to 1.5 — prevents lag on HiDPI screens
          frameloop="always"
          style={{ width: "100%", height: "100%" }}
        >
          <SceneContents isDark={isDark} />
        </Canvas>
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/80" />
    </div>
  );
}
