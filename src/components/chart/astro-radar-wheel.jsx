"use client";

import { useEffect, useState } from "react";
import { Sparkles, Activity } from "lucide-react";

export function AstroRadarWheel({ celestialContext, isLoading }) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Subtle rotation animation to make it feel alive
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 rounded-3xl glass-card animate-pulse">
        <div className="w-48 h-48 rounded-full border-4 border-primary/20 border-t-primary/50 animate-spin" />
      </div>
    );
  }

  // Placeholder celestial data if context is missing
  const planets = celestialContext?.transit_chart || [
    { name: "Sun", sign: "Aries", degree: 15 },
    { name: "Moon", sign: "Taurus", degree: 25 },
    { name: "Mars", sign: "Gemini", degree: 5 },
    { name: "Venus", sign: "Pisces", degree: 20 },
    { name: "Jupiter", sign: "Leo", degree: 12 },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center p-8 rounded-3xl glass-card overflow-hidden">
      {/* Background radial glow */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, oklch(from var(--primary) l c h / 0.15) 0%, transparent 70%)"
        }}
      />
      
      <div className="flex items-center gap-2 mb-8 z-10 w-full justify-between">
        <h3 className="text-xl font-celestial font-semibold flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" /> 
          Live Transit Radar
        </h3>
        <span className="text-xs font-medium text-primary/70 uppercase tracking-widest flex items-center gap-1">
          <Activity className="w-3 h-3 animate-pulse" /> Live
        </span>
      </div>

      <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
        {/* Radar Rings */}
        <div className="absolute inset-0 rounded-full border border-primary/20" />
        <div className="absolute inset-4 rounded-full border border-primary/10 border-dashed" />
        <div className="absolute inset-12 rounded-full border border-primary/15" />
        <div className="absolute inset-20 rounded-full border border-primary/5 border-dashed" />
        
        {/* Radar Scanner Line */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="absolute top-0 bottom-1/2 left-1/2 w-px bg-gradient-to-t from-transparent to-primary/50 origin-bottom" />
          <div 
            className="absolute top-0 bottom-1/2 left-1/2 w-32 origin-bottom opacity-20 pointer-events-none"
            style={{ 
              background: "linear-gradient(90deg, oklch(from var(--primary) l c h) 0%, transparent 100%)",
              clipPath: "polygon(0 100%, 0 0, 100% 0)"
            }}
          />
        </div>

        {/* Center Point */}
        <div className="absolute w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center z-10">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
        </div>

        {/* Planets Plotting */}
        {planets.map((planet, idx) => {
          // Fake angle calculation for visual display if degrees aren't absolute 360
          const angle = (planet.degree * 12 + idx * 45) % 360; 
          const radius = 90 + (idx % 3) * 15; // Varying distances from center
          
          return (
            <div 
              key={planet.name}
              className="absolute group z-20 cursor-pointer"
              style={{
                transform: `rotate(${angle}deg) translateY(-${radius}px)`,
                transformOrigin: "center center",
              }}
            >
              <div 
                className="w-3 h-3 rounded-full bg-primary/80 shadow-[0_0_8px_var(--primary)] relative transition-transform group-hover:scale-150"
                style={{ transform: `rotate(-${angle}deg)` }} // keep label upright
              >
                <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 text-foreground text-[10px] px-2 py-1 rounded-md border border-primary/30 pointer-events-none whitespace-nowrap">
                  <span className="font-bold">{planet.name}</span> in {planet.sign}<br/>
                  <span className="text-primary/70">{planet.degree.toFixed(2)}°</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
