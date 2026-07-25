"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { ConstellationData, generateConstellationCluster } from "./constellations-data";
import { createCircularStarTexture, createCircularNebulaTexture } from "./star-textures";

interface ConstellationMeshProps {
  data: ConstellationData;
  position: [number, number, number];
  index: number;
}

export function ConstellationMesh({ data, position, index }: ConstellationMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const clusterRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const starsGroupRef = useRef<THREE.Group>(null);

  const [hovered, setHovered] = useState(false);

  const targetScale = hovered ? 1.25 : 1.0;
  const currentScale = useRef(1.0);
  const glowIntensity = useRef(1.0);

  // Generate 250 dense background cluster stars surrounding this constellation
  const clusterData = useMemo(() => generateConstellationCluster(250, 2.2), []);

  // Generate procedural circular textures
  const starTexture = useMemo(() => createCircularStarTexture(), []);
  const nebulaTexture = useMemo(() => createCircularNebulaTexture(), []);

  // Build the line segment positions for constellation lines
  const linePositions = useMemo(() => {
    const coords: number[] = [];
    data.lines.forEach(([fromIdx, toIdx]) => {
      const fromStar = data.stars[fromIdx];
      const toStar = data.stars[toIdx];
      if (fromStar && toStar) {
        coords.push(fromStar.x, fromStar.y, fromStar.z);
        coords.push(toStar.x, toStar.y, toStar.z);
      }
    });
    return new Float32Array(coords);
  }, [data]);

  const phaseOffset = index * 0.523;

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.08);
    glowIntensity.current = THREE.MathUtils.lerp(glowIntensity.current, hovered ? 2.5 : 1.0, 0.08);

    if (groupRef.current) {
      groupRef.current.scale.setScalar(currentScale.current);

      // Slow 3D rotation
      groupRef.current.rotation.y = Math.sin(time * 0.1 + phaseOffset) * 0.25;
      groupRef.current.rotation.x = Math.cos(time * 0.08 + phaseOffset) * 0.15;
    }

    // Twinkle effect for major stars and cluster
    if (starsGroupRef.current) {
      starsGroupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Group) {
          const starMesh = child.children[0]; // core sphere
          const haloMesh = child.children[1]; // circular halo

          const starData = data.stars[i];
          if (starData && starMesh instanceof THREE.Mesh) {
            const twinkle = Math.sin(time * (2.0 + (i % 3)) + phaseOffset + i) * 0.3 + 0.85;
            const targetBrightness = starData.brightness * twinkle * glowIntensity.current;
            (starMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = targetBrightness * 2.0;

            if (haloMesh instanceof THREE.Mesh) {
              (haloMesh.material as THREE.MeshBasicMaterial).opacity =
                (hovered ? 0.85 : 0.4) * twinkle;
            }
          }
        }
      });
    }

    // Illuminate constellation lines on hover
    if (linesRef.current) {
      const lineMat = linesRef.current.material as THREE.LineBasicMaterial;
      const targetOpacity = hovered ? 0.95 : 0.35 + Math.sin(time * 1.5 + phaseOffset) * 0.15;
      lineMat.opacity = THREE.MathUtils.lerp(lineMat.opacity, targetOpacity, 0.1);
    }
  });

  return (
    <group position={position}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <group
          ref={groupRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {/* Smooth Circular Cosmic Nebula Glow behind constellation */}
          <mesh position={[0, 0, -0.3]}>
            <ringGeometry args={[0, 2.5, 64]} />
            <meshBasicMaterial
              color={hovered ? "#818cf8" : "#4c1d95"}
              map={nebulaTexture}
              transparent
              opacity={hovered ? 0.4 : 0.18}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Stardust particles bursting outward on hover */}
          {hovered && (
            <Sparkles
              count={90}
              scale={3.5}
              size={5}
              speed={1.2}
              opacity={0.9}
              color="#bae6fd"
            />
          )}

          {/* Dense surrounding cluster of hundreds of smooth circular stars */}
          <points ref={clusterRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[clusterData.positions, 3]}
              />
              <bufferAttribute
                attach="attributes-size"
                args={[clusterData.sizes, 1]}
              />
              <bufferAttribute
                attach="attributes-color"
                args={[clusterData.colors, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.12}
              map={starTexture}
              vertexColors
              transparent
              opacity={hovered ? 0.95 : 0.65}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </points>

          {/* Constellation Connecting Lines */}
          {linePositions.length > 0 && (
            <lineSegments ref={linesRef}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[linePositions, 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={hovered ? "#93c5fd" : "#818cf8"}
                transparent
                opacity={0.4}
                linewidth={1.5}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </lineSegments>
          )}

          {/* Photorealistic Major Constellation Stars */}
          <group ref={starsGroupRef}>
            {data.stars.map((star, i) => (
              <group key={i} position={[star.x, star.y, star.z]}>
                {/* Core Spherical Star */}
                <mesh>
                  <sphereGeometry args={[star.size * 0.45, 32, 32]} />
                  <meshStandardMaterial
                    color={star.color}
                    emissive={star.color}
                    emissiveIntensity={star.brightness * 2.0}
                    toneMapped={false}
                  />
                </mesh>

                {/* Soft Smooth Circular Star Halo Disk */}
                <mesh>
                  <ringGeometry args={[0, star.size * 1.8, 32]} />
                  <meshBasicMaterial
                    color={star.color}
                    map={starTexture}
                    transparent
                    opacity={hovered ? 0.85 : 0.45}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            ))}
          </group>

          {/* Elegant Constellation Label & Symbol */}
          <group position={[0, -1.8, 0]}>
            <Text
              fontSize={0.55}
              color={hovered ? "#ffffff" : "#bae6fd"}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#090d26"
            >
              {`${data.symbol}  ${data.name}`}
            </Text>

            {/* Fading description line on hover */}
            {hovered && (
              <Text
                position={[0, -0.45, 0]}
                fontSize={0.25}
                color="#fef08a"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.015}
                outlineColor="#090d26"
              >
                {data.description}
              </Text>
            )}
          </group>
        </group>
      </Float>
    </group>
  );
}
