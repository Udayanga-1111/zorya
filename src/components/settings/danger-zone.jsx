"use client";

import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export function DangerZone() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/settings/privacy/account", {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || "Failed to delete account");
      }

      setIsDeleting(false);
      setShowModal(false);
      alert("Account and data completely erased. Redirecting...");
      window.location.href = "/";
    } catch (error) {
      console.error("Account deletion failed:", error);
      alert(error.message || "An error occurred while deleting your account.");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="glass-card p-6 rounded-3xl border-destructive/30">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h3 className="text-xl font-celestial font-semibold text-destructive">Danger Zone</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your Zorya account and all associated data in compliance with PDPA Erasure guidelines. This action cannot be undone.
        </p>
        
        <button 
          onClick={() => setShowModal(true)}
          className="h-10 px-5 rounded-full bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 font-sans text-button-text transition-all flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Erase Account & Data
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card border border-destructive/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h4 className="text-lg font-bold mb-2">Are you absolutely sure?</h4>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently delete your account, wipe all celestial telemetry from our database, and remove your CBT habit histories.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 font-sans text-button-text rounded-full hover:bg-muted transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-destructive text-destructive-foreground font-sans text-button-text rounded-full hover:bg-destructive/90 transition-colors flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, erase everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
