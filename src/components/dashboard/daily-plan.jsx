/**
 * DailyPlan
 *
 * Renders the CBT habit plan streamed from the Clinical CBT Agent via the
 * LangGraph clinical_cbt_node. Shows a skeleton loader while the agent is running.
 *
 * Props:
 *   clinicalPlan — ClinicalAgentOutput shape: { blocks: CBTBlock[] } (or null)
 *   isLoading    — Boolean: true while the SSE stream hasn't emitted clinical_cbt_node
 *
 * Each CBTBlock has: { category, title, description, duration_minutes, disclaimer }
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";

const CATEGORY_STYLE = {
  Focus:         { tag: "Cognitive",    dot: "bg-primary",       ring: "ring-primary/25" },
  Rest:          { tag: "Recovery",     dot: "bg-blue-500",      ring: "ring-blue-400/30" },
  Communication: { tag: "Interpersonal",dot: "bg-emerald-500",   ring: "ring-emerald-400/30" },
  Grounding:     { tag: "Somatic",      dot: "bg-teal-500",      ring: "ring-teal-400/30" },
  Reflection:    { tag: "Reflective",   dot: "bg-orange-500",    ring: "ring-orange-400/30" },
};

// Rough time labels for up to 5 blocks starting from 8 AM
const TIME_SLOTS = ["8:00 AM", "10:00 AM", "12:30 PM", "3:00 PM", "6:00 PM"];

function SkeletonItem({ index, total }) {
  return (
    <div className={`relative flex gap-6 ${index < total - 1 ? "pb-9" : ""}`}>
      {index < total - 1 && (
        <div
          className="absolute left-[88px] top-5 bottom-0 w-px"
          style={{ background: "linear-gradient(to bottom, oklch(from var(--primary) l c h / 0.3), oklch(from var(--primary) l c h / 0.05))" }}
        />
      )}
      <div className="w-16 shrink-0 mt-1 flex flex-col items-end gap-1.5">
        <div className="h-4 w-14 rounded bg-muted animate-pulse" />
        <div className="h-3 w-10 rounded bg-muted animate-pulse" />
      </div>
      <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background border border-border mt-0.5">
        <div className="h-2.5 w-2.5 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="flex-1 pb-1 space-y-2 mt-1">
        <div className="h-4 w-48 rounded bg-muted animate-pulse" />
        <div className="h-3 w-full rounded bg-muted animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

export function DailyPlan({ clinicalPlan, isLoading }) {
  const blocks = clinicalPlan?.blocks ?? [];
  const skeletonCount = 3;
  const [overrideBlocks, setOverrideBlocks] = useState({});
  const [replanLoading, setReplanLoading] = useState({});

  const totalMinutes = blocks.reduce((acc, b, i) => {
    const active = overrideBlocks[i] || b;
    return acc + (active.duration_minutes ?? 0);
  }, 0);

  const handleReplan = async (index, block) => {
    setReplanLoading(prev => ({ ...prev, [index]: true }));
    try {
      const res = await fetch("/api/agent/replan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ block }),
      });
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        let eventType = "";
        
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.substring(7).trim();
          } else if (line.startsWith("data: ")) {
            const dataStr = line.substring(6).trim();
            if (eventType === "replan_complete") {
              const reframedBlock = JSON.parse(dataStr);
              setOverrideBlocks(prev => ({ ...prev, [index]: reframedBlock }));
            }
          }
        }
      }
    } catch (e) {
      console.error("Replan failed:", e);
    } finally {
      setReplanLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  return (
    <>
      <div className="mb-3 flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Your Day, Thoughtfully Planned
        </span>
        <div className="flex-1 h-px bg-border" />
        <span className="text-primary/50 text-xs">⊹</span>
      </div>

      <div className="relative rounded-2xl border border-border/80 bg-card/70 backdrop-blur-sm p-8 overflow-hidden">
        {/* Top-left ambient glow */}
        <div
          className="absolute -top-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(from var(--primary) l c h / 0.08) 0%, transparent 70%)" }}
        />

        <div className="relative">
          {isLoading || blocks.length === 0 ? (
            <>
              <div className="h-7 w-48 rounded bg-muted animate-pulse mb-1" />
              <div className="h-4 w-64 rounded bg-muted animate-pulse mb-8" />
              <div className="space-y-0">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                  <SkeletonItem key={i} index={i} total={skeletonCount} />
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="font-celestial text-2xl font-light italic text-foreground mb-0.5">
                {blocks.length} gentle practice{blocks.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground tracking-wide mb-8">
                {totalMinutes} minutes total · aligned with your chart
              </p>

              <div className="space-y-0">
                {blocks.map((originalBlock, i, arr) => {
                  const block = overrideBlocks[i] || originalBlock;
                  const isReplanLoading = replanLoading[i];
                  const style = CATEGORY_STYLE[block.category] ?? {
                    tag: block.category,
                    dot: "bg-primary",
                    ring: "ring-primary/25",
                  };
                  const time = TIME_SLOTS[i] ?? "--:--";

                  return (
                    <div
                      key={`${block.category}-${i}`}
                      className={`relative flex gap-6 ${i < arr.length - 1 ? "pb-9" : ""}`}
                    >
                      {/* Vertical constellation line */}
                      {i < arr.length - 1 && (
                        <div
                          className="absolute left-[88px] top-5 bottom-0 w-px"
                          style={{ background: "linear-gradient(to bottom, oklch(from var(--primary) l c h / 0.3), oklch(from var(--primary) l c h / 0.05))" }}
                        />
                      )}

                      {/* Time column */}
                      <div className="w-16 shrink-0 text-right mt-1">
                        <div className="font-celestial text-[15px] font-medium text-foreground">{time}</div>
                        <div className="text-[11px] text-muted-foreground">{block.duration_minutes} min</div>
                      </div>

                      {/* Constellation dot */}
                      <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background border border-border mt-0.5">
                        <div className={`h-2.5 w-2.5 rounded-full ${style.dot} ring-[4px] ${style.ring} shadow-sm`} />
                      </div>

                      {/* Content */}
                      <div className={`flex-1 pb-1 transition-opacity duration-300 ${isReplanLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4 className="font-celestial text-[17px] font-semibold text-foreground leading-tight">
                            {block.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {block.is_reframed ? (
                              <span className="rounded-full bg-primary/20 border border-primary/50 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-primary shadow-[0_0_10px_rgba(212,175,55,0.4)] animate-pulse">
                                ✨ Re-framed
                              </span>
                            ) : (
                              <button
                                onClick={() => handleReplan(i, block)}
                                disabled={isReplanLoading}
                                className="text-[10px] px-2 py-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                              >
                                {isReplanLoading ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
                                I'm Stuck
                              </button>
                            )}
                            <span className="rounded-full bg-muted/80 border border-border/60 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground">
                              {style.tag}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                          {block.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ethical disclaimer */}
              {blocks[0]?.disclaimer && (
                <p className="mt-8 text-[10px] text-muted-foreground/50 leading-relaxed border-t border-border/40 pt-4">
                  ⚕ {blocks[0].disclaimer}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
