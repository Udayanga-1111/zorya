"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

/**
 * ZoryaStreamContext
 *
 * Shared SSE stream state for all dashboard pages.
 * Lifted out of dashboard-client.jsx so the Calendar and Dashboard pages
 * read the same live data without making separate backend calls.
 */
const ZoryaStreamContext = createContext(null);

export function StreamProvider({ userProfile, isOnboarded, children }) {
  const [celestialContext, setCelestialContext] = useState(null);
  const [clinicalPlan, setClinicalPlan] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [guardrailFlagged, setGuardrailFlagged] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const runStream = useCallback(async () => {
    setIsStreaming(true);
    setStreamError(null);
    setCelestialContext(null);
    setClinicalPlan(null);
    setHasLoaded(false);

    try {
      const response = await fetch("/api/agent/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_profile: userProfile }),
      });

      if (!response.ok || !response.body) {
        const text = await response.text();
        let errorMsg = `HTTP ${response.status}: `;
        try {
          const json = JSON.parse(text);
          errorMsg += json.error || JSON.stringify(json);
        } catch {
          errorMsg += text.substring(0, 100);
        }
        throw new Error(errorMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split(/\r?\n\r?\n/);
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const eventMatch = part.match(/^event:\s*(.+)$/m);
          const dataMatch = part.match(/^data:\s*(.+)$/ms);

          if (!eventMatch || !dataMatch) continue;

          const eventName = eventMatch[1].trim();
          let payload;
          try {
            payload = JSON.parse(dataMatch[1].trim());
          } catch {
            continue;
          }

          switch (eventName) {
            case "start":
              break;
            case "parsing_node":
              if (payload.celestial_context) {
                setCelestialContext(payload.celestial_context);
              }
              break;
            case "clinical_cbt_node":
              if (payload.clinical_plan) {
                setClinicalPlan(payload.clinical_plan);
              }
              break;
            case "guardrail_node":
              setGuardrailFlagged(payload.guardrail_flagged ?? false);
              break;
            case "done":
              setIsStreaming(false);
              setHasLoaded(true);
              break;
            case "error":
              throw new Error(payload.error || "Agent pipeline error");
            default:
              break;
          }
        }
      }
    } catch (err) {
      console.error("[StreamProvider] Stream error:", err);
      setStreamError(err.message);
      setIsStreaming(false);
      setHasLoaded(true);
    }
  }, [userProfile]);

  useEffect(() => {
    if (isOnboarded && userProfile) {
      runStream();
    } else {
      setHasLoaded(true);
    }
  }, [runStream, isOnboarded, userProfile]);

  return (
    <ZoryaStreamContext.Provider
      value={{
        celestialContext,
        clinicalPlan,
        isStreaming,
        streamError,
        guardrailFlagged,
        hasLoaded,
        runStream,
        isOnboarded,
      }}
    >
      {children}
    </ZoryaStreamContext.Provider>
  );
}

export function useStream() {
  const ctx = useContext(ZoryaStreamContext);
  if (!ctx) {
    throw new Error("useStream must be used within a <StreamProvider>");
  }
  return ctx;
}
