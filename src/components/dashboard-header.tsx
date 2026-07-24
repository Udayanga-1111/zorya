import Link from "next/link";
import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardHeader() {
  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between px-6 z-10 relative border-b border-border/60"
      style={{
        background:
          "linear-gradient(90deg, oklch(from var(--background) l c h) 0%, oklch(from var(--primary) l c h / 0.03) 50%, oklch(from var(--background) l c h) 100%)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <span className="text-lg text-primary opacity-70 group-hover:opacity-100 transition-opacity">☽</span>
        <span className="font-celestial text-2xl font-semibold italic text-primary tracking-wide leading-none">
          Zorya
        </span>
      </Link>

      {/* Centre decorative phrase */}
      <p className="hidden lg:block font-celestial text-sm italic text-muted-foreground/60 tracking-wide select-none">
        Align with your natural cycles
      </p>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/60 backdrop-blur-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 shadow-sm"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          aria-label="Account"
        >
          M
        </button>
      </div>
    </header>
  );
}
