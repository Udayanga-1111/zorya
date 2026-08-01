"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Activity, Crosshair } from "lucide-react";

const PLANETARY_BEHAVIOR = {
  "Sun": "Executive energy channel — prioritized for deep Focus tasks.",
  "Moon": "Emotional processing center — prioritized for Reflection and Rest.",
  "Mars": "Kinetic energy channel — prioritized for physical Grounding exercises.",
  "Mercury": "Analytical routing — prioritized for structured Communication.",
  "Jupiter": "Expansion and alignment — prioritized for values-based Reflection.",
  "Venus": "Relational processing — prioritized for empathetic Communication.",
  "Saturn": "Structural friction — requires heavily decomposed micro-habits and Rest.",
  "Rahu": "Cognitive turbulence — demands strict sensory Grounding.",
  "Ketu": "Detachment mode — optimal for extended deep Rest."
};

const ZODIAC_ANGLES = {
  "Aries": 0, "Taurus": 30, "Gemini": 60, "Cancer": 90,
  "Leo": 120, "Virgo": 150, "Libra": 180, "Scorpio": 210,
  "Sagittarius": 240, "Capricorn": 270, "Aquarius": 300, "Pisces": 330
};

// Convert polar coords to SVG x/y. angle 0 = top (12 o'clock).
function polarToXY(angleDeg, radius, cx, cy) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

export function AstroRadarWheel({ celestialContext, isLoading }) {
  const [hoveredPlanet, setHoveredPlanet] = useState(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[520px] rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-md shadow-lg animate-pulse">
        <div className="w-48 h-48 rounded-full border-4 border-primary/20 border-t-primary/50 animate-spin" />
      </div>
    );
  }

  const transitChart = celestialContext?.transit_chart || {};
  const natalChart = celestialContext?.natal_chart || {};

  const transits = Array.isArray(transitChart) ? transitChart : Object.values(transitChart);
  const natals = Array.isArray(natalChart) ? natalChart : Object.values(natalChart);

  const natalNodes = natals.filter(p => ["sun", "moon"].includes(p.name?.toLowerCase()));
  const janmaRashi = natalNodes.find(p => p.name?.toLowerCase() === "moon")?.sign || "Taurus";

  // SVG viewport constants
  const SIZE = 130;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const OUTER_R = 55;  // Outer ring (transits)
  const INNER_R = 31;   // Inner ring (natals)
  const CENTER_R = 7;  // Center glow node

  return (
    <div className="flex flex-col rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-md shadow-2xl overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,_oklch(from_var(--primary)_l_c_h_/_0.2)_0%,_transparent_65%)]" />

      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4 z-20">
        <h3 className="text-xl font-celestial font-semibold flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-primary" />
          Live Transit Radar
        </h3>
        <span className="text-xs font-medium text-primary/70 uppercase tracking-widest flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <Activity className="w-3 h-3 animate-pulse" /> Scanning
        </span>
      </div>

      {/* SVG Radar */}
      <div className="flex items-center justify-center px-4 py-2">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full max-w-[130px] aspect-square"
          style={{ overflow: "visible" }}
        >
          {/* Outer ring */}
          <circle cx={CX} cy={CY} r={OUTER_R} fill="rgba(15,23,42,0.3)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          {/* Inner ring (dashed) */}
          <circle cx={CX} cy={CY} r={INNER_R} fill="rgba(15,23,42,0.5)" stroke="oklch(from var(--primary) l c h / 0.4)" strokeWidth="1" strokeDasharray="4 4" />
          {/* Micro ring */}
          <circle cx={CX} cy={CY} r={(OUTER_R + INNER_R) / 2} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

          {/* Crosshairs */}
          <line x1={CX} y1={CY - OUTER_R} x2={CX} y2={CY + OUTER_R} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1={CX - OUTER_R} y1={CY} x2={CX + OUTER_R} y2={CY} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Diagonal guides */}
          <line x1={CX - OUTER_R * 0.7} y1={CY - OUTER_R * 0.7} x2={CX + OUTER_R * 0.7} y2={CY + OUTER_R * 0.7} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <line x1={CX + OUTER_R * 0.7} y1={CY - OUTER_R * 0.7} x2={CX - OUTER_R * 0.7} y2={CY + OUTER_R * 0.7} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

          {/* Subtle rotating tick mark only — no sweep wedge */}
          <motion.line
            x1={CX} y1={CY - INNER_R + 6}
            x2={CX} y2={CY - OUTER_R}
            stroke="oklch(from var(--primary) l c h / 0.4)"
            strokeWidth="1"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ originX: `${CX}px`, originY: `${CY}px` }}
          />

          {/* Center glow node */}
          <motion.circle
            cx={CX} cy={CY} r={CENTER_R}
            fill="oklch(from var(--primary) l c h / 0.2)"
            stroke="oklch(from var(--primary) l c h / 0.6)"
            strokeWidth="1.5"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ filter: "drop-shadow(0 0 8px var(--primary))" }}
          />
          <motion.circle
            cx={CX} cy={CY} r={7}
            fill="oklch(from var(--primary) l c h)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ filter: "drop-shadow(0 0 6px var(--primary))" }}
          />
          <text x={CX} y={CY + CENTER_R + 14} textAnchor="middle" fontSize="7" fill="oklch(from var(--primary) l c h / 0.8)" fontWeight="bold" letterSpacing="2">
            {janmaRashi.toUpperCase()} CORE
          </text>

          {/* Natal Nodes — Inner Ring */}
          {natalNodes.map((planet) => {
            const signAngle = ZODIAC_ANGLES[planet.sign] || 0;
            const deg = planet.degree ?? 15;
            const angle = (signAngle + deg) % 360;
            const { x, y } = polarToXY(angle, INNER_R, CX, CY);
            const isHovered = hoveredPlanet?.name === planet.name;

            return (
              <g
                key={`natal-${planet.name}`}
                style={{ cursor: "crosshair" }}
                onMouseEnter={() => setHoveredPlanet({ type: "Natal", ...planet })}
                onMouseLeave={() => setHoveredPlanet(null)}
              >
                <circle cx={x} cy={y} r={isHovered ? 11 : 8}
                  fill="oklch(from var(--primary) l c h)"
                  stroke="#0f172a" strokeWidth="2"
                  style={{
                    filter: "drop-shadow(0 0 6px var(--primary))",
                    transition: "r 0.2s ease"
                  }}
                />
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize="6" fontWeight="bold" fill="#0f172a">
                  {planet.name?.charAt(0)}
                </text>
              </g>
            );
          })}

          {/* Transit Nodes — Outer Ring */}
          {transits.map((planet) => {
            const signAngle = ZODIAC_ANGLES[planet.sign] || 0;
            const deg = planet.degree ?? 15;
            const angle = (signAngle + deg) % 360;
            const { x, y } = polarToXY(angle, OUTER_R, CX, CY);
            const isHovered = hoveredPlanet?.name === planet.name;

            return (
              <g
                key={`transit-${planet.name}`}
                style={{ cursor: "crosshair" }}
                onMouseEnter={() => setHoveredPlanet({ type: "Transit", ...planet })}
                onMouseLeave={() => setHoveredPlanet(null)}
              >
                <circle cx={x} cy={y} r={isHovered ? 8 : 5}
                  fill="white"
                  stroke="#0f172a" strokeWidth="1.5"
                  style={{
                    filter: "drop-shadow(0 0 5px rgba(255,255,255,0.8))",
                    transition: "r 0.2s ease"
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip Panel */}
      <div className="mx-6 mb-6 h-20 bg-slate-900/50 rounded-2xl border border-white/5 px-4 flex items-center justify-center text-center">
        {hoveredPlanet ? (
          <motion.div
            key={hoveredPlanet.name}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-1 items-center"
          >
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm ${hoveredPlanet.type === "Natal" ? "bg-primary/20 text-primary" : "bg-white/10 text-white"}`}>
                {hoveredPlanet.type} Node
              </span>
              <span className="font-medium text-white text-sm">{hoveredPlanet.name} in {hoveredPlanet.sign}</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm">
              {PLANETARY_BEHAVIOR[hoveredPlanet.name] || "General behavioral influence factor."}
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center text-muted-foreground/50">
            <Crosshair className="w-4 h-4 mb-1" />
            <span className="text-xs">Hover over orbital nodes to view behavioral translations.</span>
          </div>
        )}
      </div>
    </div>
  );
}
