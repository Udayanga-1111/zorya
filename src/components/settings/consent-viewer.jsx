"use client";

import { ShieldCheck, ShieldAlert } from "lucide-react";
import { useStream } from "@/components/providers/stream-provider";

export function ConsentViewer() {
  const { user, hasLoaded } = useStream();

  const isGranted = user?.pdpa_consent ?? false;
  const grantDate = user?.consent_timestamp 
    ? new Date(user.consent_timestamp).toLocaleDateString()
    : "Unknown Date";
  return (
    <div className="glass-card p-6 rounded-3xl mb-6">
      <div className="flex items-center gap-2 mb-4">
        {isGranted ? (
          <ShieldCheck className="w-5 h-5 text-green-500" />
        ) : (
          <ShieldAlert className="w-5 h-5 text-amber-500" />
        )}
        <h3 className="text-xl font-celestial font-semibold">Active Consent & Privacy</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        Zorya operates on a strict opt-in model. Your celestial coordinates, chat threads, and CBT habit maps are processed locally and stored securely.
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-card/40 border border-border/40">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Astronomical Telemetry Processing</span>
            <span className="text-xs text-muted-foreground">Allow calculation of transits and dashas based on birth time.</span>
          </div>
          {isGranted ? (
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">GRANTED</span>
              <span className="text-[10px] text-muted-foreground">{grantDate}</span>
            </div>
          ) : (
             <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">PENDING</span>
          )}
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-xl bg-card/40 border border-border/40">
          <div className="flex flex-col">
            <span className="text-sm font-medium">CBT Habit Mapping</span>
            <span className="text-xs text-muted-foreground">Allow translation of planetary states into psychological schedules.</span>
          </div>
          {isGranted ? (
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">GRANTED</span>
              <span className="text-[10px] text-muted-foreground">{grantDate}</span>
            </div>
          ) : (
             <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">PENDING</span>
          )}
        </div>
      </div>
    </div>
  );
}
