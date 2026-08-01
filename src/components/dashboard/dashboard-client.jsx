"use client";

import Link from "next/link";
import { useStream } from "@/components/providers/stream-provider";
import { GreetingBanner } from "@/components/dashboard/greeting-banner";
import { ZoryaNote } from "@/components/dashboard/zorya-note";
import { PlanetaryInfluences } from "@/components/dashboard/planetary-influences";
import { DailyPlan } from "@/components/dashboard/daily-plan";

/**
 * DashboardClient
 *
 * Consumes the shared ZoryaStreamContext (via useStream()).
 * The SSE fetch lifecycle is managed in StreamProvider (layout.jsx),
 * so this component is pure presentation logic.
 */
export function DashboardClient({ userName }) {
  const {
    celestialContext,
    clinicalPlan,
    isStreaming,
    streamError,
    guardrailFlagged,
    runStream,
    isOnboarded,
  } = useStream();

  if (!isOnboarded) {
    return (
      <div
        className="min-h-full px-4 sm:px-8 py-10 relative flex items-center justify-center"
        style={{
          background:
            "radial-gradient(ellipse at 80% 0%, oklch(from var(--primary) l c h / 0.06) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, oklch(0.7 0.15 300 / 0.05) 0%, transparent 50%)",
        }}
      >
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-primary/20 shadow-2xl bg-card/60 backdrop-blur-xl text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
            <span className="text-2xl opacity-80 animate-pulse">✧</span>
          </div>

          <h2 className="font-celestial text-2xl sm:text-3xl font-light italic text-foreground mb-4">
            Unlock Your Personalized Transit Schedule
          </h2>

          <p className="text-muted-foreground text-sm mb-8 px-2 sm:px-4 leading-relaxed">
            Your celestial blueprint requires precise coordinates. Complete your natal setup to align your habits with your active planetary dashas.
          </p>

          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center h-12 px-6 sm:px-8 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 text-sm sm:text-base"
          >
            Complete Your Natal Setup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-full px-4 sm:px-8 py-6 sm:py-10 relative"
      style={{
        background:
          "radial-gradient(ellipse at 80% 0%, oklch(from var(--primary) l c h / 0.06) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, oklch(0.7 0.15 300 / 0.05) 0%, transparent 50%)",
      }}
    >
      {/* Ambient decorative stars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute top-8 right-24 text-primary/20 text-xs animate-twinkle">✦</span>
        <span className="absolute top-20 right-56 text-primary/15 text-[10px] animate-twinkle-delay">✧</span>
        <span className="absolute top-48 right-12 text-primary/10 text-xs animate-twinkle">✦</span>
        <span className="absolute top-6 left-1/2 text-primary/10 text-[8px] animate-twinkle-delay">✧</span>
        <span className="absolute top-36 left-1/3 text-primary/15 text-xs animate-twinkle">✦</span>
      </div>

      <div className="relative mx-auto max-w-4xl">
        <GreetingBanner userName={userName} />
        <ZoryaNote />

        {/* Error banner */}
        {streamError && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            ⚠ Could not connect to Zorya AI — showing cached or default data.{" "}
            <button onClick={runStream} className="underline font-medium ml-1">
              Retry
            </button>
          </div>
        )}

        <PlanetaryInfluences
          transitChart={celestialContext?.transit_chart ?? null}
          activeDasha={celestialContext?.active_dasha ?? null}
          isLoading={isStreaming && !celestialContext}
        />

        <DailyPlan
          clinicalPlan={clinicalPlan}
          isLoading={isStreaming && !clinicalPlan}
        />

        {/* Bottom celestial flourish */}
        <div className="mt-8 text-center text-muted-foreground/30 tracking-[0.3em] text-xs select-none">
          ✦ &nbsp;&nbsp; ✧ &nbsp;&nbsp; ✦
        </div>
      </div>
    </div>
  );
}
