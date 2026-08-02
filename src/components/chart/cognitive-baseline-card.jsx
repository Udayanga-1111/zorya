"use client";

import { Brain, Moon, Sun, Droplets, Flame, Wind, Mountain } from "lucide-react";

const SIGN_ELEMENTS = {
  "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
  "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
  "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
  "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water"
};

const ELEMENT_ICONS = {
  "Fire": <Flame className="w-4 h-4 text-orange-500" />,
  "Water": <Droplets className="w-4 h-4 text-blue-500" />,
  "Air": <Wind className="w-4 h-4 text-emerald-400" />,
  "Earth": <Mountain className="w-4 h-4 text-yellow-600" />
};

const MOON_CBT = {
  "Fire": "Emotional baseline thrives on high-activation action and physical Grounding.",
  "Water": "Emotional baseline thrives on deep Reflection and emotional processing.",
  "Air": "Emotional baseline thrives on social Communication and mental stimulation.",
  "Earth": "Emotional baseline thrives on routine Grounding and Rest."
};

const SUN_CBT = {
  "Fire": "Core drive relies on high-activation Focus tasks and physical Grounding.",
  "Water": "Core drive relies on deep Reflection and Rest tasks.",
  "Air": "Core drive relies on Communication and mental Focus.",
  "Earth": "Core drive relies on methodical Focus and routine Grounding."
};

export function CognitiveBaselineCard({ celestialContext, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl border border-border bg-muted animate-pulse h-48" />
    );
  }

  const natalChart = celestialContext?.natal_chart || {};
  let sunData = { sign: "Leo" };
  let moonData = { sign: "Taurus" };

  if (natalChart) {
    const planetsArray = Array.isArray(natalChart) ? natalChart : Object.values(natalChart);
    sunData = planetsArray.find((p) => p.name?.toLowerCase() === "sun") || sunData;
    moonData = planetsArray.find((p) => p.name?.toLowerCase() === "moon") || moonData;
  }

  const moonElem = SIGN_ELEMENTS[moonData.sign] || "Earth";
  const sunElem = SIGN_ELEMENTS[sunData.sign] || "Earth";

  return (
    <div className="flex flex-col p-6 rounded-3xl border border-border bg-card backdrop-blur-md shadow-lg relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-6 font-serif text-section-heading text-primary-custom z-10">
        <Brain className="w-5 h-5 text-primary" />
        Cognitive Baseline
      </div>

      <div className="grid gap-4 sm:grid-cols-2 z-10">
        {/* Moon Translation */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors shadow-inner relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-sans text-input-text text-secondary-custom font-medium">
              <Moon className="w-4 h-4 text-blue-400" /> Manas (Mind)
            </span>
            <span className="font-sans text-body-custom font-semibold text-primary-custom bg-muted px-2 py-0.5 rounded-md flex items-center gap-1.5">
              {ELEMENT_ICONS[moonElem]} {moonData.sign} ({moonElem})
            </span>
          </div>
          <p className="font-sans text-input-text text-secondary-custom leading-relaxed">
            <strong className="text-foreground/80 font-medium">Emotional Drive:</strong> {MOON_CBT[moonElem]}
          </p>
        </div>

        {/* Sun Translation */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors shadow-inner relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/50" />
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-sans text-input-text text-secondary-custom font-medium">
              <Sun className="w-4 h-4 text-orange-400" /> Atman (Self)
            </span>
            <span className="font-sans text-body-custom font-semibold text-primary-custom bg-muted px-2 py-0.5 rounded-md flex items-center gap-1.5">
              {ELEMENT_ICONS[sunElem]} {sunData.sign} ({sunElem})
            </span>
          </div>
          <p className="font-sans text-input-text text-secondary-custom leading-relaxed">
            <strong className="text-foreground/80 font-medium">Executive Function:</strong> {SUN_CBT[sunElem]}
          </p>
        </div>
      </div>
    </div>
  );
}
