"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Settings,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { name: "Dashboard",           href: "/dashboard",  icon: LayoutDashboard },
  { name: "Habit Schedule",      href: "/calendar",   icon: Calendar },
  { name: "Natal & Transit Chart", href: "/chart",    icon: Sparkles },
  { name: "AI Companion",        href: "/chat",       icon: MessageSquare },
  { name: "Settings",            href: "/settings",   icon: Settings },
];

// ─── Single nav link item ─────────────────────────────────────────────────────
function NavLink({ item, isActive, onClick }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 relative overflow-hidden
        ${isActive
          ? "text-primary bg-primary/10 font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60 font-normal"
        }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
      )}
      {!isActive && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"
          style={{ background: "linear-gradient(90deg, oklch(from var(--primary) l c h / 0.03) 0%, transparent 60%)" }}
        />
      )}
      <item.icon
        className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
      />
      <span className="font-celestial text-[15px] leading-none mt-px">{item.name}</span>
    </Link>
  );
}

// ─── Sidebar inner content (shared by desktop + mobile drawer) ────────────────
function SidebarContent({ onNavClick, user }) {
  const pathname = usePathname();

  return (
    <>
      {/* Top ambient glow */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% -20%, oklch(from var(--primary) l c h / 0.12) 0%, transparent 70%)" }}
      />

      {/* Brand */}
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
        <div className="mt-5 flex items-center gap-2">
          <div className="flex-1 h-px bg-border/60" />
          <span className="text-primary/30 text-[8px]">✦</span>
          <div className="flex-1 h-px bg-border/60" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === "/" ? false : pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.name}
              item={item}
              isActive={isActive}
              onClick={onNavClick}
            />
          );
        })}
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
          style={{ background: "linear-gradient(135deg, oklch(from var(--primary) l c h / 0.06) 0%, oklch(from var(--card) l c h) 60%)" }}
        >
          <div
            className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, oklch(from var(--primary) l c h / 0.15) 0%, transparent 70%)" }}
          />
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <span>☽</span>
            <span>{user?.name ? user.name.split(' ')[0] : 'User'}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/15 border border-primary/25 px-2.5 py-0.5 text-[10px] font-medium text-primary">
              <span>✦</span> Active Dasha
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Mobile Bottom Navigation ─────────────────────────────────────────────────
function MobileBottomNav() {
  const pathname = usePathname();
  // Show only the 4 most important nav items on mobile bottom bar
  const mobileItems = navItems.slice(0, 4);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 backdrop-blur-xl flex"
      style={{ background: "oklch(from var(--background) l c h / 0.9)" }}
    >
      {mobileItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-200
              ${isActive ? "text-primary" : "text-muted-foreground"}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-medium leading-none">{item.name.split(" ")[0]}</span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function DashboardSidebar({ user }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  const pathname = usePathname();
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Desktop sidebar (md+) ── */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 overflow-y-auto border-r border-border/60 relative"
        data-lenis-prevent="true"
        style={{ background: "linear-gradient(180deg, oklch(from var(--primary) l c h / 0.04) 0%, oklch(from var(--background) l c h) 40%)" }}
      >
        <SidebarContent onNavClick={() => {}} user={user} />
      </aside>

      {/* ── Mobile hamburger trigger (visible in header via slot, but also floating) ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3.5 left-4 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-card border border-border/60 text-muted-foreground hover:text-foreground shadow-sm transition-all"
        aria-label="Open navigation"
        id="sidebar-open-btn"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col overflow-y-auto border-r border-border/60 relative transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "linear-gradient(180deg, oklch(from var(--primary) l c h / 0.04) 0%, oklch(from var(--background) l c h) 40%)" }}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close navigation"
        >
          <X className="w-4 h-4" />
        </button>

        <SidebarContent onNavClick={() => setMobileOpen(false)} user={user} />
      </aside>

      {/* ── Mobile bottom nav ── */}
      <MobileBottomNav />
    </>
  );
}
