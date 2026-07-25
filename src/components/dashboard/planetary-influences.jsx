export function PlanetaryInfluences() {
  const influences = [
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
  ];

  return (
    <>
      <div className="mb-3 flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Planetary Influences
        </span>
        <div className="flex-1 h-px bg-border" />
        <span className="text-primary/50 text-xs">⊹</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        {influences.map((planet) => (
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
    </>
  );
}
