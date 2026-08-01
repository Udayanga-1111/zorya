"use client";

import { Sparkles } from "lucide-react";

export function VedicAnalysisCard({ celestialContext, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl glass-card animate-pulse h-32" />
    );
  }

  const summary = celestialContext?.transit_summary || "Awaiting transit calculations based on your natal coordinates.";

  return (
    <div className="flex flex-col p-6 rounded-3xl glass-card relative overflow-hidden">
      <div className="absolute right-0 top-0 w-full h-1 bg-gradient-to-l from-primary/10 via-primary/50 to-primary/10 opacity-50" />
      
      <div className="flex items-center gap-2 mb-4 text-foreground font-celestial text-xl z-10">
        <Sparkles className="w-5 h-5 text-primary" />
        Vedic Horoscope Analysis
      </div>

      <div className="z-10">
        <p className="text-sm text-muted-foreground leading-relaxed bg-background/50 p-4 rounded-xl border border-border/50 shadow-inner">
          {summary}
        </p>
      </div>
    </div>
  );
}
