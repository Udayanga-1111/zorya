"use client";

import { motion } from "framer-motion";
import { ActivitySquare, Info } from "lucide-react";

const CBTCategory = {
  GROUNDING: "Grounding",
  FOCUS: "Focus",
  REST: "Rest",
  COMMUNICATION: "Communication",
  REFLECTION: "Reflection"
};

const SIGN_ELEMENTS = {
  "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
  "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
  "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
  "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water"
};

const ELEMENT_BASE = {
  "Fire":  { [CBTCategory.GROUNDING]: 3, [CBTCategory.FOCUS]: 3, [CBTCategory.REST]: 1, [CBTCategory.COMMUNICATION]: 1, [CBTCategory.REFLECTION]: 1 },
  "Earth": { [CBTCategory.FOCUS]: 3, [CBTCategory.REST]: 3, [CBTCategory.GROUNDING]: 2, [CBTCategory.COMMUNICATION]: 1, [CBTCategory.REFLECTION]: 1 },
  "Air":   { [CBTCategory.COMMUNICATION]: 3, [CBTCategory.REFLECTION]: 3, [CBTCategory.FOCUS]: 2, [CBTCategory.GROUNDING]: 1, [CBTCategory.REST]: 1 },
  "Water": { [CBTCategory.REFLECTION]: 3, [CBTCategory.REST]: 3, [CBTCategory.GROUNDING]: 2, [CBTCategory.COMMUNICATION]: 1, [CBTCategory.FOCUS]: 1 },
};

const DASHA_TRIGUNAS = {
  "Sun": "Sattva", "Moon": "Sattva", "Jupiter": "Sattva",
  "Mercury": "Rajas", "Venus": "Rajas",
  "Mars": "Tamas", "Saturn": "Tamas", "Rahu": "Tamas", "Ketu": "Tamas"
};

const GUNA_MODIFIERS = {
  "Sattva": [CBTCategory.REFLECTION, CBTCategory.FOCUS],
  "Rajas":  [CBTCategory.COMMUNICATION, CBTCategory.FOCUS],
  "Tamas":  [CBTCategory.GROUNDING, CBTCategory.REST]
};

const CATEGORY_COLORS = {
  [CBTCategory.FOCUS]: "bg-primary",
  [CBTCategory.REST]: "bg-blue-500",
  [CBTCategory.COMMUNICATION]: "bg-emerald-500",
  [CBTCategory.GROUNDING]: "bg-teal-500",
  [CBTCategory.REFLECTION]: "bg-orange-500",
};

export function CBTScoreBreakdown({ celestialContext, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-md shadow-lg animate-pulse h-64" />
    );
  }

  const transitChart = celestialContext?.transit_chart || {};
  const natalChart = celestialContext?.natal_chart || {};
  const planetsArray = Array.isArray(transitChart) ? transitChart : Object.values(transitChart);
  const natalArray = Array.isArray(natalChart) ? natalChart : Object.values(natalChart);
  
  const moonData = planetsArray.find((p) => p.name?.toLowerCase() === "moon") || { sign: "Taurus" };
  const sunData = natalArray.find((p) => p.name?.toLowerCase() === "sun") || { sign: "Leo" };
  const activeDasha = celestialContext?.active_dasha || "Jupiter Mahadasha";

  // Calculate Scores Client-Side
  const scores = {
    [CBTCategory.FOCUS]: 0,
    [CBTCategory.REST]: 0,
    [CBTCategory.COMMUNICATION]: 0,
    [CBTCategory.GROUNDING]: 0,
    [CBTCategory.REFLECTION]: 0,
  };

  const moonElem = SIGN_ELEMENTS[moonData.sign] || "Earth";
  const sunElem = SIGN_ELEMENTS[sunData.sign] || "Earth";
  const dashaLord = activeDasha.split(" ")[0];
  const guna = DASHA_TRIGUNAS[dashaLord] || "Sattva";

  // Moon (2x)
  Object.entries(ELEMENT_BASE[moonElem]).forEach(([cat, base]) => {
    scores[cat] += base * 2.0;
  });

  // Sun (1x)
  Object.entries(ELEMENT_BASE[sunElem]).forEach(([cat, base]) => {
    scores[cat] += base * 1.0;
  });

  // Dasha (+2)
  GUNA_MODIFIERS[guna].forEach((cat) => {
    scores[cat] += 2.0;
  });

  const maxScore = Math.max(...Object.values(scores), 1); // Avoid div by 0

  return (
    <div className="flex flex-col p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-md shadow-lg relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 z-10">
        <h3 className="text-xl font-celestial font-semibold flex items-center gap-2 text-white">
          <ActivitySquare className="w-5 h-5 text-primary" />
          CBT Category Scoring Map
        </h3>
        <div className="group relative flex items-center cursor-help">
          <Info className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          <div className="absolute right-0 top-6 w-56 p-3 rounded-xl bg-slate-900 border border-white/10 text-[10px] text-muted-foreground shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <strong>Scoring Formula:</strong><br/>
            Transit Moon Element (2x Weight) +<br/>
            Natal Sun Element (1x Weight) +<br/>
            Dasha Triguna Bonus (+2 Points)
          </div>
        </div>
      </div>

      <div className="space-y-4 z-10">
        {Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([category, score], idx) => {
          const percentage = (score / maxScore) * 100;
          const colorClass = CATEGORY_COLORS[category] || "bg-primary";
          
          return (
            <div key={category} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-white/90">{category}</span>
                <span className="text-xs text-muted-foreground font-mono">{score} pts</span>
              </div>
              <div className="h-3 w-full bg-slate-900/50 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                  className={`h-full ${colorClass} shadow-[0_0_10px_currentColor] opacity-80`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
