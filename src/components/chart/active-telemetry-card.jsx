"use client";

import { Orbit, Compass, Activity, AlertTriangle } from "lucide-react";

const DASHA_TRIGUNAS = {
  "Sun": "Sattva", "Moon": "Sattva", "Jupiter": "Sattva",
  "Mercury": "Rajas", "Venus": "Rajas",
  "Mars": "Tamas", "Saturn": "Tamas", "Rahu": "Tamas", "Ketu": "Tamas"
};

const TRIGUNA_CBT_MODE = {
  "Sattva": "Reflection & Clarity (+2 Focus/Reflection)",
  "Rajas": "Action & Expression (+2 Communication/Focus)",
  "Tamas": "Rest & Grounding (+2 Grounding/Rest)"
};

const TRIGUNA_COLORS = {
  "Sattva": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "Rajas": "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "Tamas": "text-blue-400 bg-blue-400/10 border-blue-400/20"
};

export function ActiveTelemetryCard({ activeDasha, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl border border-border bg-muted animate-pulse h-48" />
    );
  }

  const dashaStr = activeDasha || "Jupiter Mahadasha";
  const mahadashaLord = dashaStr.split(" ")[0];
  const triguna = DASHA_TRIGUNAS[mahadashaLord] || "Sattva";
  
  // Calculate friction proxy
  // High if Tamas, Moderate if Rajas, Low if Sattva
  const frictionLevel = triguna === "Tamas" ? "High" : (triguna === "Rajas" ? "Moderate" : "Low");
  const frictionColor = triguna === "Tamas" ? "text-red-400" : (triguna === "Rajas" ? "text-orange-400" : "text-emerald-400");

  return (
    <div className="flex flex-col p-6 sm:p-8 rounded-3xl border border-border bg-card backdrop-blur-md shadow-lg relative overflow-hidden">
      <div className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 opacity-50" />
      
      <div className="flex items-center gap-2 mb-6 font-serif text-section-heading text-primary-custom z-10">
        <Compass className="w-5 h-5 text-primary" />
        Active Telemetry States
      </div>

      <div className="flex flex-col gap-6 z-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-sans text-input-text uppercase tracking-wide text-secondary-custom flex items-center gap-1 font-medium">
              <Orbit className="w-3 h-3" /> Mahadasha Cycle
            </span>
            <span className="font-sans text-body-custom font-medium text-primary-custom flex flex-wrap gap-2 items-center">
              {dashaStr}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-sans text-input-text uppercase tracking-wide text-secondary-custom font-medium">
              Triguna State
            </span>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border w-fit ${TRIGUNA_COLORS[triguna]}`}>
              <Activity className="w-3 h-3" />
              <span className="text-sm font-medium">{triguna}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-card border border-border">
          <div className="flex justify-between items-center text-sm">
            <span className="font-sans text-input-text text-secondary-custom">Cognitive Mode</span>
            <span className="font-sans text-body-custom text-primary-custom font-medium text-right">{TRIGUNA_CBT_MODE[triguna]}</span>
          </div>
          <div className="h-px w-full bg-border" />
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              Cognitive Friction 
            </span>
            <span className={`font-semibold flex items-center gap-1.5 ${frictionColor}`}>
              <AlertTriangle className="w-3 h-3" /> {frictionLevel}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground/80 mt-1 leading-relaxed">
            {frictionLevel === "High" ? "Tasks may feel overwhelming. Micro-habits are aggressively decomposed." : 
             frictionLevel === "Moderate" ? "Moderate activation energy required. Keep tasks structured." : 
             "Clear cognitive runway. Ideal for deep work and reflection."}
          </p>
        </div>
      </div>
    </div>
  );
}
