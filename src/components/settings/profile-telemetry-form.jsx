"use client";

import { useState } from "react";
import { User, MapPin, Calendar, Clock, Loader2 } from "lucide-react";

export function ProfileTelemetryForm({ user }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unknownTime, setUnknownTime] = useState(user?.is_approximate_time || false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");
    
    // Simulate API call to PATCH /api/settings/profile
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSuccessMsg("Profile and telemetry settings updated successfully.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="glass-card p-6 rounded-3xl mb-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-celestial font-semibold">Profile & Telemetry</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-background/50 border border-border/60 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary outline-none text-sm" 
              placeholder="Your Name"
              defaultValue={user?.name || ""}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Birth City / Coordinates</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                className="w-full bg-background/50 border border-border/60 rounded-xl pl-9 pr-4 py-2 focus:ring-1 focus:ring-primary outline-none text-sm" 
                placeholder="City, Country or Lat, Long"
                defaultValue={user?.birth_city || ""}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input 
                type="date" 
                className="w-full bg-background/50 border border-border/60 rounded-xl pl-9 pr-4 py-2 focus:ring-1 focus:ring-primary outline-none text-sm" 
                defaultValue={user?.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : ""}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Time of Birth</label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input 
                type="time" 
                disabled={unknownTime}
                className={`w-full bg-background/50 border border-border/60 rounded-xl pl-9 pr-4 py-2 focus:ring-1 focus:ring-primary outline-none text-sm transition-opacity ${unknownTime ? 'opacity-50 cursor-not-allowed' : ''}`} 
                defaultValue={user?.birth_time || ""}
              />
            </div>
            <div className="flex items-center gap-2 mt-2 ml-1">
              <input 
                type="checkbox" 
                id="unknown-time" 
                checked={unknownTime}
                onChange={(e) => setUnknownTime(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary/20 accent-primary"
              />
              <label htmlFor="unknown-time" className="text-xs text-muted-foreground cursor-pointer">
                I don't know my exact birth time (uses 12:00 PM fallback)
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-border/40 mt-6">
          <span className="text-sm text-green-500 font-medium">
            {successMsg}
          </span>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="h-10 px-6 rounded-full bg-primary text-primary-foreground font-medium text-sm transition-all hover:bg-primary/90 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
