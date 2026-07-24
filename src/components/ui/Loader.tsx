"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function Loader({ isLoading = true }: { isLoading?: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground"
        >
          <div className="relative flex items-center justify-center w-24 h-24 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary/50"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border-b-2 border-l-2 border-primary/30"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]"
            />
          </div>
          <p className="text-sm text-muted-foreground tracking-widest uppercase animate-pulse">
            Aligning your cycle...
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
