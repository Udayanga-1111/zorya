"use client";

import React from "react";

export function CosmicBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Dark mode: Starfield */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background opacity-0 dark:opacity-100 transition-opacity duration-700 ease-in-out">
        {/* Simple CSS-based stars using box-shadow or background-image */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at center, white 1px, transparent 1px), radial-gradient(circle at center, white 1px, transparent 1px)`,
          backgroundSize: `100px 100px, 150px 150px`,
          backgroundPosition: `0 0, 50px 50px`,
          opacity: 0.15
        }} />
      </div>

      {/* Light mode: Orbital lines */}
      <div className="absolute inset-0 opacity-100 dark:opacity-0 transition-opacity duration-700 ease-in-out flex items-center justify-center">
        {/* Subtle radial gradient for light mode */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-background to-background" />
        
        {/* Orbital circles */}
        <div className="absolute w-[600px] h-[600px] border border-indigo-500/10 rounded-full" />
        <div className="absolute w-[900px] h-[900px] border border-indigo-500/10 rounded-full" />
        <div className="absolute w-[1200px] h-[1200px] border border-indigo-500/10 rounded-full" />
      </div>
    </div>
  );
}
