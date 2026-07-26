/**
 * PlanetaryInfluences
 *
 * Displays real-time planetary transit data streamed from the Celestial MCP server
 * via the LangGraph parsing_node. Falls back to a skeleton loader while streaming.
 *
 * Props:
 *   transitChart  — ChartPositions object from TransitResponse (or null while loading)
 *   activeDasha   — Active Dasha string (or null while loading)
 *   isLoading     — Boolean: true while the SSE stream hasn't emitted parsing_node yet
 */

const PLANET_STYLE_MAP = {
  mercury: { symbol: "☿", glow: "oklch(0.7 0.15 160 / 0.12)" },
  venus:   { symbol: "♀", glow: "oklch(0.75 0.15 320 / 0.12)" },
  mars:    { symbol: "♂", glow: "oklch(0.7 0.18 40 / 0.12)" },
  jupiter: { symbol: "♃", glow: "oklch(0.7 0.15 60 / 0.12)" },
  saturn:  { symbol: "♄", glow: "oklch(0.65 0.12 200 / 0.12)" },
  sun:     { symbol: "☉", glow: "oklch(0.85 0.2 80 / 0.12)" },
  moon:    { symbol: "☽", glow: "oklch(0.8 0.05 240 / 0.12)" },
};

// Planets we display as influence cards (the 4 most behaviourally relevant)
const DISPLAY_PLANETS = ["mercury", "saturn", "mars", "venus"];

function getPlanetBadge(planetName, sign) {
  const challenging = ["Aries", "Scorpio", "Capricorn"];
  const isMindful = planetName === "mars" || challenging.includes(sign);
  return isMindful
    ? { label: "Mindful", color: "text-orange-600 dark:text-orange-400 bg-orange-500/10" }
    : { label: "Supportive", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" };
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-sm p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="flex-1 space-y-2 mt-1">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-3 w-48 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function PlanetaryInfluences({ transitChart, activeDasha, isLoading }) {
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
        {isLoading || !transitChart
          ? DISPLAY_PLANETS.map((p) => <SkeletonCard key={p} />)
          : DISPLAY_PLANETS.map((planetKey) => {
              const planet = transitChart[planetKey];
              if (!planet) return null;
              const style = PLANET_STYLE_MAP[planetKey] ?? { symbol: "✦", glow: "oklch(0.7 0.1 200 / 0.12)" };
              const badge = getPlanetBadge(planetKey, planet.sign);

              return (
                <div
                  key={planetKey}
                  className="relative group rounded-2xl border border-border/80 bg-card/70 backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 overflow-hidden"
                  style={{ boxShadow: `0 4px 24px -6px ${style.glow}` }}
                >
                  {/* Subtle inner gradient on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(ellipse at 0% 0%, ${style.glow} 0%, transparent 60%)` }}
                  />
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-2xl leading-none shadow-sm">
                      {style.symbol}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-celestial text-[17px] font-semibold text-foreground leading-tight">
                          {planet.name.charAt(0).toUpperCase() + planet.name.slice(1)} in {planet.sign}
                        </h4>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {planet.sign_degree.toFixed(1)}° {planet.sign}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {activeDasha && (
        <div className="mb-6 -mt-6 text-xs text-muted-foreground/70 text-center tracking-wide">
          Active period: <span className="text-primary/80 font-medium">{activeDasha}</span>
        </div>
      )}
    </>
  );
}
