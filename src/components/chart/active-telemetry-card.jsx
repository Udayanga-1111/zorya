"use client";

import { Orbit, Compass } from "lucide-react";

export function ActiveTelemetryCard({ activeDasha, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl glass-card animate-pulse h-48" />
    );
  }

  const dasha = activeDasha || {
    mahadasha: "Jupiter",
    antardasha: "Saturn",
    triguna: "Sattva",
    element: "Fire"
  };

  return (
    <div className="flex flex-col p-6 rounded-3xl glass-card relative overflow-hidden">
      <div className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 opacity-50" />
      
      <div className="flex items-center gap-2 mb-6 text-foreground font-celestial text-xl z-10">
        <Compass className="w-5 h-5 text-primary" />
        Active Telemetry States
      </div>

      <div className="grid grid-cols-2 gap-4 z-10">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Orbit className="w-3 h-3" /> Mahadasha Cycle
          </span>
          <span className="text-lg font-medium text-foreground">
            {dasha.mahadasha} <span className="text-muted-foreground font-normal">/ {dasha.antardasha}</span>
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Triguna State
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-primary">
              {dasha.triguna}
            </span>
            <span className={`w-2 h-2 rounded-full ${
              dasha.triguna === 'Sattva' ? 'bg-primary' : 
              dasha.triguna === 'Rajas' ? 'bg-destructive' : 'bg-muted-foreground'
            } shadow-[0_0_5px_currentColor]`} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 col-span-2 mt-2">
          <div className="h-px w-full bg-border/50 mb-2" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your current planetary period is heavily influenced by the <strong className="text-primary font-medium">{dasha.element}</strong> element. 
            The active {dasha.triguna} state recommends balancing active engagement with mindful restraint.
          </p>
        </div>
      </div>
    </div>
  );
}
