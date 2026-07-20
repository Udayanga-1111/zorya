import Link from "next/link";
import { Activity, Calendar, Bot, CreditCard, Sparkles } from "lucide-react";

const navItems = [
  { href: "#", icon: Sparkles, label: "Onboarding", symbol: "✦" },
  { href: "#", icon: Activity, label: "Dashboard", symbol: "◉", active: true },
  { href: "#", icon: Calendar, label: "Habits", symbol: "◈" },
  { href: "#", icon: Bot, label: "AI Companion", symbol: "✧" },
  { href: "#", icon: CreditCard, label: "Pricing", symbol: "⊹" },
];

export function DashboardSidebar() {
  return (
    <aside className="flex flex-col w-64 shrink-0 overflow-y-auto border-r border-border/60 relative"
      style={{
        background: "linear-gradient(180deg, oklch(from var(--primary) l c h / 0.04) 0%, oklch(from var(--background) l c h) 40%)",
      }}
    >
      {/* Top ambient glow */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% -20%, oklch(from var(--primary) l c h / 0.12) 0%, transparent 70%)",
        }}
      />

      {/* Sidebar Header / Brand */}
      <div className="relative p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 border border-primary/30 text-primary shadow-sm">
            <span className="text-base">☽</span>
          </div>
          <div className="flex flex-col">
            <span className="font-celestial text-xl font-semibold italic text-foreground leading-none">Zorya</span>
            <span className="text-[9px] font-medium tracking-[0.2em] text-primary/60 mt-0.5 uppercase">Wellness · Astrology</span>
          </div>
        </div>

        {/* Thin decorative line */}
        <div className="mt-5 flex items-center gap-2">
          <div className="flex-1 h-px bg-border/60" />
          <span className="text-primary/30 text-[8px]">✦</span>
          <div className="flex-1 h-px bg-border/60" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 relative overflow-hidden
              ${item.active
                ? "text-primary bg-primary/10 font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60 font-normal"
              }`}
          >
            {/* Active indicator bar */}
            {item.active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
            )}
            {/* Hover shimmer */}
            {!item.active && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"
                style={{ background: "linear-gradient(90deg, oklch(from var(--primary) l c h / 0.03) 0%, transparent 60%)" }}
              />
            )}

            {/* Symbol glyph */}
            <span className={`text-[11px] w-4 text-center shrink-0 font-mono
              ${item.active ? "text-primary" : "text-muted-foreground/50 group-hover:text-primary/60 transition-colors"}`}>
              {item.symbol}
            </span>

            {/* Icon */}
            <item.icon className={`h-4 w-4 shrink-0 transition-colors
              ${item.active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />

            <span className="font-celestial text-[15px] leading-none mt-px">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-1 flex items-center gap-2">
        <div className="flex-1 h-px bg-border/40" />
        <span className="text-primary/20 text-[8px]">✧</span>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      {/* User Profile Card */}
      <div className="relative p-4">
        <div
          className="rounded-2xl border border-border/60 p-4 flex flex-col gap-1.5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, oklch(from var(--primary) l c h / 0.06) 0%, oklch(from var(--card) l c h) 60%)",
          }}
        >
          {/* Card accent glow */}
          <div
            className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, oklch(from var(--primary) l c h / 0.15) 0%, transparent 70%)" }}
          />

          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shadow-sm">
              MC
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground block leading-tight">Maya Chen</span>
              <span className="text-[10px] text-muted-foreground">March 18, 1994</span>
            </div>
          </div>

          <span className="text-[11px] text-muted-foreground">☽ San Francisco, CA</span>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/15 border border-primary/25 px-2.5 py-0.5 text-[10px] font-medium text-primary">
              <span>♓</span> Pisces Rising
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] text-muted-foreground">
              ☉ Pisces
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
