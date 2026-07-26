"use client";

import { useState, useEffect, useCallback } from "react";
import { GreetingBanner } from "@/components/dashboard/greeting-banner";
import { ZoryaNote } from "@/components/dashboard/zorya-note";
import { PlanetaryInfluences } from "@/components/dashboard/planetary-influences";
import { DailyPlan } from "@/components/dashboard/daily-plan";

/**
 * DashboardClient
 *
 * React Client Component that manages the SSE streaming lifecycle.
 * It uses fetch() + response.body.getReader() to consume the POST SSE stream
 * (native EventSource only supports GET, so we use the fetch reader pattern).
 *
 * Stream events from the LangGraph graph (stream_mode="updates"):
 *   - "start"             → show loading state
 *   - "parsing_node"      → populate celestialContext (planetary influences)
 *   - "clinical_cbt_node" → populate clinicalPlan (daily plan)
 *   - "guardrail_node"    → (silently consumed, sets safety flag)
 *   - "done"              → hide loading state
 *   - "error"             → show error state
 */
export function DashboardClient({ userName, userProfile }) {
  const [celestialContext, setCelestialContext] = useState(null);
  const [clinicalPlan, setClinicalPlan] = useState(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamError, setStreamError] = useState(null);
  const [guardrailFlagged, setGuardrailFlagged] = useState(false);

  const runStream = useCallback(async () => {
    setIsStreaming(true);
    setStreamError(null);
    setCelestialContext(null);
    setClinicalPlan(null);

    try {
      const response = await fetch("/api/agent/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_profile: userProfile }),
      });

      if (!response.ok || !response.body) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by double newlines (CRLF or LF)
        const parts = buffer.split(/\r?\n\r?\n/);
        buffer = parts.pop() ?? ""; // last incomplete chunk stays in buffer

        for (const part of parts) {
          // Parse SSE fields: "event: name\ndata: {...}\n"
          const eventMatch = part.match(/^event:\s*(.+)$/m);
          const dataMatch = part.match(/^data:\s*(.+)$/ms);

          if (!eventMatch || !dataMatch) continue;

          const eventName = eventMatch[1].trim();
          let payload;
          try {
            payload = JSON.parse(dataMatch[1].trim());
          } catch {
            continue;
          }

          switch (eventName) {
            case "start":
              // Already loading — nothing to do
              break;
            case "parsing_node":
              if (payload.celestial_context) {
                setCelestialContext(payload.celestial_context);
              }
              break;
            case "clinical_cbt_node":
              if (payload.clinical_plan) {
                setClinicalPlan(payload.clinical_plan);
              }
              break;
            case "guardrail_node":
              setGuardrailFlagged(payload.guardrail_flagged ?? false);
              break;
            case "done":
              setIsStreaming(false);
              break;
            case "error":
              throw new Error(payload.error || "Agent pipeline error");
            default:
              break;
          }
        }
      }
    } catch (err) {
      console.error("[DashboardClient] Stream error:", err);
      setStreamError(err.message);
      setIsStreaming(false);
    }
  }, [userProfile]);

  useEffect(() => {
    runStream();
  }, [runStream]);

  return (
    <div
      className="min-h-full px-8 py-10 relative overflow-hidden"
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
