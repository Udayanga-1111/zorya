import * as THREE from "three";

/**
 * Creates a smooth circular radial texture for star points and flares.
 * Eliminates WebGL square point/quad artifacts.
 */
export function createCircularStarTexture(): THREE.CanvasTexture {
  if (typeof window === "undefined") return new THREE.CanvasTexture(null as any);

  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, 128, 128);

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.85)");
    gradient.addColorStop(0.45, "rgba(180, 220, 255, 0.4)");
    gradient.addColorStop(0.75, "rgba(140, 180, 255, 0.12)");
    gradient.addColorStop(1.0, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(64, 64, 64, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates a soft circular nebula glow texture.
 */
export function createCircularNebulaTexture(): THREE.CanvasTexture {
  if (typeof window === "undefined") return new THREE.CanvasTexture(null as any);

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
    gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.25)");
    gradient.addColorStop(0.6, "rgba(200, 200, 255, 0.08)");
    gradient.addColorStop(1.0, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(128, 128, 128, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
