"use client";

import { useTheme } from "next-themes";
import { Monitor, Sun, Moon, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="glass-card p-6 rounded-3xl mb-6 flex flex-col gap-4 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded"></div>
        <div className="h-20 bg-muted rounded-xl"></div>
      </div>
    );
  }

  const themes = [
    { id: "light", label: "Light Mode", icon: Sun, desc: "Celestial Sanctuary" },
    { id: "dark", label: "Dark Mode", icon: Moon, desc: "Cosmic Universe" },
  ];

  return (
    <div className="glass-card p-6 rounded-3xl mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Monitor className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-celestial font-semibold">Appearance & Theme</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Customize the visual energy of your Zorya dashboard.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {themes.map((t) => {
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                isActive 
                  ? "bg-primary/10 border-primary shadow-[0_0_15px_oklch(from_var(--primary)_l_c_h_/_0.2)]" 
                  : "bg-card/40 border-border/40 hover:border-primary/40 hover:bg-card/60"
              }`}
            >
              <t.icon className={`w-6 h-6 mb-2 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                {t.label}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {t.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
