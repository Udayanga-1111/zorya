export function DailyPlan() {
  const planItems = [
    {
      time: "8:00 AM", dur: "15 min", title: "Morning Reflection",
      tag: "Cognitive", dot: "bg-primary", ring: "ring-primary/25",
      desc: "Identify automatic thoughts upon waking. Saturn trine supports honest self-assessment.",
    },
    {
      time: "10:00 AM", dur: "10 min", title: "5-4-3-2-1 Grounding",
      tag: "Somatic", dot: "bg-orange-500", ring: "ring-orange-400/30",
      desc: "Mars square may heighten sensitivity — anchor with sensory awareness.",
    },
    {
      time: "12:30 PM", dur: "20 min", title: "Midday Walk + Observation",
      tag: "Behavioral", dot: "bg-teal-500", ring: "ring-teal-400/30",
      desc: "Mercury sextile Venus: ideal window for connecting with environment.",
    },
    {
      time: "3:00 PM", dur: "15 min", title: "Key Conversations",
      tag: "Interpersonal", dot: "bg-emerald-500", ring: "ring-emerald-400/30",
      desc: "Optimal window for difficult conversations. Mercury favors clarity.",
    },
  ];

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
          <p className="font-celestial text-2xl font-light italic text-foreground mb-0.5">
            5 gentle practices
          </p>
          <p className="text-xs text-muted-foreground tracking-wide mb-8">80 minutes total · aligned with your chart</p>

          <div className="space-y-0">
            {planItems.map((item, i, arr) => (
              <div key={item.title} className={`relative flex gap-6 ${i < arr.length - 1 ? "pb-9" : ""}`}>
                {/* Vertical constellation line */}
                {i < arr.length - 1 && (
                  <div
                    className="absolute left-[88px] top-5 bottom-0 w-px"
                    style={{ background: "linear-gradient(to bottom, oklch(from var(--primary) l c h / 0.3), oklch(from var(--primary) l c h / 0.05))" }}
                  />
                )}

                {/* Time column */}
                <div className="w-16 shrink-0 text-right mt-1">
                  <div className="font-celestial text-[15px] font-medium text-foreground">{item.time}</div>
                  <div className="text-[11px] text-muted-foreground">{item.dur}</div>
                </div>

                {/* Constellation dot */}
                <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background border border-border mt-0.5">
                  <div className={`h-2.5 w-2.5 rounded-full ${item.dot} ring-[4px] ${item.ring} shadow-sm`} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-celestial text-[17px] font-semibold text-foreground leading-tight">
                      {item.title}
                    </h4>
                    <span className="rounded-full bg-muted/80 border border-border/60 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground">
                      {item.tag}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
