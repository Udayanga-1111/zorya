"use client";

import { useStream } from "@/components/providers/stream-provider";

import { CognitiveBaselineCard } from "@/components/chart/cognitive-baseline-card";
import { ActiveTelemetryCard } from "@/components/chart/active-telemetry-card";
import { CBTScoreBreakdown } from "@/components/chart/cbt-score-breakdown";
import { DisclaimerFooter } from "@/components/chart/disclaimer-footer";
import Link from "next/link";
import { Moon, Sun, Orbit } from "lucide-react";

export default function ChartPage() {
  const { celestialContext, isStreaming, isOnboarded } = useStream();

  if (!isOnboarded) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="max-w-md w-full p-8 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-md shadow-2xl flex flex-col items-center">
          <span className="text-4xl mb-4 text-white">✧</span>
          <h1 className="text-2xl font-celestial font-semibold mb-3 text-white">Chart Unavailable</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            Please complete your natal onboarding to unlock your personalized transit and dasha telemetry chart.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-primary-foreground font-medium text-sm transition-transform hover:-translate-y-0.5"
          >
            Complete Setup
          </Link>
        </div>
      </div>
    );
  }

  // Extract variables for Quick Badges
  const natalChart = celestialContext?.natal_chart || {};
  const natals = Array.isArray(natalChart) ? natalChart : Object.values(natalChart);
  const moonSign = natals.find((p) => p.name?.toLowerCase() === "moon")?.sign || "Taurus";
  const sunSign = natals.find((p) => p.name?.toLowerCase() === "sun")?.sign || "Leo";
  const activeDasha = celestialContext?.active_dasha || "Jupiter Mahadasha";
  const mahadashaLord = activeDasha.split(" ")[0];

  return (
    <div className="min-h-full px-4 sm:px-8 py-8 relative bg-[#020617]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Header & Quick Summary */}
        <div className="flex flex-col gap-4 mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-celestial font-semibold flex items-center gap-3 text-white drop-shadow-md">
              Cognitive Telemetry & Chart
            </h1>
            <p className="text-muted-foreground text-sm mt-2 max-w-2xl leading-relaxed">
              Visualizing the astronomical drivers behind your personalized CBT habit plans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            {!isStreaming || celestialContext ? (
              <>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-400/20 bg-blue-400/10 text-blue-300 text-xs font-medium shadow-[0_0_10px_rgba(96,165,250,0.1)] backdrop-blur-md">
                  <Moon className="w-3.5 h-3.5" /> Moon in {moonSign}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-400/20 bg-orange-400/10 text-orange-300 text-xs font-medium shadow-[0_0_10px_rgba(251,146,60,0.1)] backdrop-blur-md">
                  <Sun className="w-3.5 h-3.5" /> Sun in {sunSign}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-medium shadow-[0_0_10px_var(--primary)] backdrop-blur-md">
                  <Orbit className="w-3.5 h-3.5" /> {mahadashaLord} Period
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <div className="w-24 h-8 rounded-full bg-slate-800/50 animate-pulse border border-white/5" />
                <div className="w-24 h-8 rounded-full bg-slate-800/50 animate-pulse border border-white/5" />
                <div className="w-32 h-8 rounded-full bg-slate-800/50 animate-pulse border border-white/5" />
              </div>
            )}
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ActiveTelemetryCard 
            activeDasha={celestialContext?.active_dasha} 
            isLoading={isStreaming && !celestialContext} 
          />
          <CognitiveBaselineCard 
            celestialContext={celestialContext} 
            isLoading={isStreaming && !celestialContext} 
          />
        </div>

        {/* Bottom Wide Section */}
        <div className="grid grid-cols-1 mt-2">
          <CBTScoreBreakdown 
            celestialContext={celestialContext} 
            isLoading={isStreaming && !celestialContext} 
          />
        </div>

        <DisclaimerFooter />
      </div>
    </div>
  );
}
