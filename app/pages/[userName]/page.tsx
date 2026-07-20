export default function DashboardPage() {
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

        {/* ── Greeting Banner ───────────────────────────────────────── */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/70 mb-1">
              ☾ &nbsp; Thursday, 17 July · New Moon Phase
            </p>
            <h1 className="font-celestial text-5xl font-light italic text-foreground leading-tight">
              Good morning, Maya
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md">
              4 planetary influences are shaping your day.&nbsp;
              <span className="text-foreground/80">Here&rsquo;s what we&rsquo;ve prepared.</span>
            </p>
          </div>

          {/* Moon phase ornament */}
          <div className="hidden md:flex flex-col items-center gap-1 opacity-60">
            <span className="text-5xl leading-none text-primary">🌙</span>
            <span className="text-[9px] tracking-widest uppercase text-muted-foreground">New Moon</span>
          </div>
        </div>

        {/* ── Note from Zorya ───────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden border border-primary/25 mb-8 celestial-glow">
          {/* Gradient wash behind card */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, oklch(from var(--primary) l c h / 0.07) 0%, transparent 60%)",
            }}
          />
          <div className="relative p-6 flex items-start gap-5">
            {/* Ornate heart orb */}
            <div className="shrink-0 w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-inner mt-0.5">
              <HeartIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary mb-2">
                ✦ &nbsp; A Note from Zorya
              </p>
              <p className="font-celestial text-[17px] italic text-foreground/80 leading-relaxed">
                &ldquo;Mercury&rsquo;s gentle sextile with your Venus today brings emotional clarity — a good
                day for the conversations you&rsquo;ve been postponing. Saturn&rsquo;s steady support gives
                you the groundedness to handle them with care.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* ── Planetary Influences ──────────────────────────────────── */}
        <div className="mb-3 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Planetary Influences
          </span>
          <div className="flex-1 h-px bg-border" />
          <span className="text-primary/50 text-xs">⊹</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          {[
            {
              symbol: "☿", name: "Mercury in Cancer", sub: "Emotional clarity in communication",
              badge: "Supportive", badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
              glow: "oklch(0.7 0.15 160 / 0.12)",
            },
            {
              symbol: "♄", name: "Saturn in Pisces", sub: "Structured self-discipline available",
              badge: "Supportive", badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
              glow: "oklch(0.65 0.12 200 / 0.12)",
            },
            {
              symbol: "♂", name: "Mars in Aries", sub: "Emotional reactivity — pace yourself",
              badge: "Mindful", badgeColor: "text-orange-600 dark:text-orange-400 bg-orange-500/10",
              glow: "oklch(0.7 0.18 40 / 0.12)",
            },
            {
              symbol: "♀", name: "Venus in Gemini", sub: "Enhanced creative expression",
              badge: "Supportive", badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
              glow: "oklch(0.75 0.15 320 / 0.12)",
            },
          ].map((planet) => (
            <div
              key={planet.name}
              className="relative group rounded-2xl border border-border/80 bg-card/70 backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 overflow-hidden"
              style={{ boxShadow: `0 4px 24px -6px ${planet.glow}` }}
            >
              {/* Subtle inner gradient on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(ellipse at 0% 0%, ${planet.glow} 0%, transparent 60%)` }}
              />
              <div className="relative flex items-start gap-4">
                {/* Planet symbol orb */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-2xl leading-none shadow-sm">
                  {planet.symbol}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-celestial text-[17px] font-semibold text-foreground leading-tight">
                      {planet.name}
                    </h4>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${planet.badgeColor}`}>
                      {planet.badge}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{planet.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Daily Plan ───────────────────────────────────────────── */}
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
              {[
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
              ].map((item, i, arr) => (
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

        {/* Bottom celestial flourish */}
        <div className="mt-8 text-center text-muted-foreground/30 tracking-[0.3em] text-xs select-none">
          ✦ &nbsp;&nbsp; ✧ &nbsp;&nbsp; ✦
        </div>

      </div>
    </div>
  );
}

// Heart icon
function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
