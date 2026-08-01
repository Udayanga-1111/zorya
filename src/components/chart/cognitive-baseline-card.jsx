"use client";

import { Brain, Moon, Sun } from "lucide-react";

export function CognitiveBaselineCard({ celestialContext, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl glass-card animate-pulse h-48" />
    );
  }

  // Extract from context or use fallbacks
  const sunData = celestialContext?.transit_chart?.find((p) => p.name === "Sun") || { sign: "Aries", degree: 15 };
  const moonData = celestialContext?.transit_chart?.find((p) => p.name === "Moon") || { sign: "Taurus", degree: 25 };

  return (
    <div className="flex flex-col p-6 rounded-3xl glass-card relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex items-center gap-2 mb-6 text-foreground font-celestial text-xl z-10">
        <Brain className="w-5 h-5 text-primary" />
        Cognitive Baseline
      </div>

      <div className="grid gap-4 sm:grid-cols-2 z-10">
        {/* Moon Translation */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Moon className="w-4 h-4 text-primary" /> Manas (Mind)
            </span>
            <span className="font-semibold text-primary">{moonData.sign}</span>
          </div>
          <p className="text-xs text-muted-foreground/80 leading-relaxed mt-1">
            Governs your immediate emotional responses and baseline CBT rest states. 
            Current placement suggests a need for grounded reflection.
          </p>
        </div>

        {/* Sun Translation */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Sun className="w-4 h-4 text-primary" /> Atman (Self)
            </span>
            <span className="font-semibold text-primary">{sunData.sign}</span>
          </div>
          <p className="text-xs text-muted-foreground/80 leading-relaxed mt-1">
            Governs your core focus and active CBT engagement states. 
            Current placement supports decisive action and high-energy tasks.
          </p>
        </div>
      </div>
    </div>
  );
}
