"use client";

import { ProfileTelemetryForm } from "@/components/settings/profile-telemetry-form";
import { ThemeSwitcher } from "@/components/settings/theme-switcher";
import { ConsentViewer } from "@/components/settings/consent-viewer";
import { DataExport } from "@/components/settings/data-export";
import { DangerZone } from "@/components/settings/danger-zone";
import { useStream } from "@/components/providers/stream-provider";

export default function SettingsPage() {
  const { user } = useStream();
  return (
    <div className="min-h-full px-4 sm:px-8 py-8 relative">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-celestial font-semibold flex items-center gap-2">
            Settings & Preferences
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your celestial telemetry, themes, and PDPA privacy controls.
          </p>
        </div>

        {/* Content */}
        <ProfileTelemetryForm user={user} />
        <ThemeSwitcher />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ConsentViewer />
          <DataExport />
        </div>

        <DangerZone />

        {/* Bottom celestial flourish */}
        <div className="mt-8 text-center text-muted-foreground/30 tracking-[0.3em] text-xs select-none">
          ✦ &nbsp;&nbsp; ✧ &nbsp;&nbsp; ✦
        </div>
      </div>
    </div>
  );
}
