"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/60 backdrop-blur-sm text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 shadow-sm group overflow-hidden"
    >
      {/* Warm glow on hover */}
      <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: "radial-gradient(circle, oklch(from var(--primary) l c h / 0.1) 0%, transparent 70%)" }}
      />

      {/* Sun icon — shown in dark mode to switch to light */}
      <Sun
        className={`absolute h-4 w-4 transition-all duration-300
          ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}
      />

      {/* Moon icon — shown in light mode to switch to dark */}
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300
          ${isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`}
      />
    </button>
  );
}
