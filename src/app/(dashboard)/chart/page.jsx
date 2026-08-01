"use client";

import { useStream } from "@/components/providers/stream-provider";
import { AstroRadarWheel } from "@/components/chart/astro-radar-wheel";
import { CognitiveBaselineCard } from "@/components/chart/cognitive-baseline-card";
import { ActiveTelemetryCard } from "@/components/chart/active-telemetry-card";
import { DisclaimerFooter } from "@/components/chart/disclaimer-footer";
import Link from "next/link";

export default function ChartPage() {
  const { celestialContext, isStreaming, isOnboarded } = useStream();

  if (!isOnboarded) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="max-w-md w-full p-8 rounded-3xl glass-card flex flex-col items-center">
          <span className="text-4xl mb-4">✧</span>
          <h1 className="text-2xl font-celestial font-semibold mb-3">Chart Unavailable</h1>
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

  return (
    <div className="min-h-full px-4 sm:px-8 py-8 relative">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-celestial font-semibold flex items-center gap-2">
            Natal & Transit Telemetry
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time planetary alignments mapped to your cognitive behavioral baseline.
          </p>
        </div>

        {/* Top Grid: Radar and Stats */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <AstroRadarWheel 
              celestialContext={celestialContext} 
              isLoading={isStreaming && !celestialContext} 
            />
          </div>
          
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ActiveTelemetryCard 
              activeDasha={celestialContext?.active_dasha} 
              isLoading={isStreaming && !celestialContext} 
            />
            <CognitiveBaselineCard 
              celestialContext={celestialContext} 
              isLoading={isStreaming && !celestialContext} 
            />
          </div>
        </div>

        <DisclaimerFooter />
      </div>
    </div>
  );
}
