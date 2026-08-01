"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

export function DataExport() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate GET /api/settings/privacy/export
    await new Promise((res) => setTimeout(res, 1200));
    setIsExporting(false);
    alert("Data exported successfully! (Simulated download)");
  };

  return (
    <div className="glass-card p-6 rounded-3xl mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Download className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-celestial font-semibold">Export Your Data</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Download a complete archive of your stored data, including birth coordinates, saved chat threads, and CBT history in JSON format.
      </p>
      
      <button 
        onClick={handleExport}
        disabled={isExporting}
        className="h-10 px-5 rounded-full bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-70"
      >
        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Request Data Archive
      </button>
    </div>
  );
}
