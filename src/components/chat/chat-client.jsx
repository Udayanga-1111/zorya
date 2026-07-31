"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  ArrowUp,
  AlertTriangle,
  PhoneCall,
  Sparkles,
  Wifi,
  WifiOff,
  Bot,
} from "lucide-react";

// ─── Typing animation dots ─────────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="inline-flex items-end gap-0.5 h-4 ml-1">
      <span className="w-1 h-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1 h-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1 h-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
    </span>
  );
}

// ─── SSE streaming cursor ─────────────────────────────────────────────────
function StreamingCursor() {
  return (
    <span className="inline-block w-0.5 h-4 ml-0.5 bg-primary/70 animate-pulse align-middle rounded-full" />
  );
}

// ─── SSE Connection Status Banner ────────────────────────────────────────────
function ConnectionBanner({ isStreaming, hasError }) {
  if (!isStreaming && !hasError) return null;

  return (
    <div
      className={`flex items-center justify-center gap-2 py-1.5 text-[11px] font-medium transition-all duration-300
        ${isStreaming
          ? "bg-primary/5 text-primary/80 border-b border-primary/10"
          : "bg-destructive/5 text-destructive border-b border-destructive/10"
        }`}
    >
      {isStreaming ? (
        <>
          <Wifi className="w-3 h-3 animate-pulse" />
          <span>AI is composing a response…</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Connection interrupted — please try again</span>
        </>
      )}
    </div>
  );
}

// ─── Suggested Prompts (empty state) ─────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  "What's my dominant energy today?",
  "How can I use my current dasha to build focus?",
  "Suggest a CBT grounding exercise for stress",
  "Help me reframe negative thinking patterns",
];

function SuggestedPrompts({ onSelect }) {
  return (
    <div className="max-w-xl mx-auto w-full px-4">
      <div className="mb-3 text-center text-[11px] text-muted-foreground/70 uppercase tracking-widest">
        Start with a question
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTED_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => onSelect(p)}
            className="text-left text-xs sm:text-sm p-3 sm:p-4 rounded-xl border border-border/60 bg-card/50 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-primary/30 transition-all duration-200 group"
          >
            <span className="text-primary/50 mr-1.5 group-hover:text-primary/80 transition-colors">✦</span>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Crisis Card ──────────────────────────────────────────────────────────────
function CrisisCard() {
  return (
    <div className="p-4 sm:p-6 bg-destructive/10 border border-destructive/20 rounded-2xl shadow-sm space-y-4 max-w-lg">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <h3 className="font-semibold text-base sm:text-lg">Emergency Mental Health Resources</h3>
      </div>
      <p className="text-sm text-foreground/80">
        Zorya focuses strictly on personal growth. For medical or psychiatric emergencies, please contact immediate help:
      </p>
      <div className="flex flex-col gap-2 mt-2">
        <a
          href="tel:1926"
          className="flex items-center justify-between p-3 sm:p-4 bg-background border border-border/60 rounded-xl hover:bg-muted/50 transition-colors group"
        >
          <div>
            <div className="font-medium text-sm">1926 — National Mental Health Helpline</div>
            <div className="text-xs text-muted-foreground">NIMH Sri Lanka — 24/7 Call / SMS</div>
          </div>
          <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:scale-110 transition-transform shrink-0" />
        </a>
        <a
          href="tel:0112682535"
          className="flex items-center justify-between p-3 sm:p-4 bg-background border border-border/60 rounded-xl hover:bg-muted/50 transition-colors group"
        >
          <div>
            <div className="font-medium text-sm">011 268 2535 / 0707 308 308</div>
            <div className="text-xs text-muted-foreground">Sri Lanka Sumithrayo — Confidential Support</div>
          </div>
          <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:scale-110 transition-transform shrink-0" />
        </a>
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, idx, messagesLength, isStreaming, firstName }) {
  if (msg.isCrisisCard) return <CrisisCard key={idx} />;

  const isUser = msg.role === "user";
  const isLastMsg = idx === messagesLength - 1;
  const isCurrentlyStreaming = isStreaming && isLastMsg && !isUser;
  const isEmpty = msg.content === "" && isCurrentlyStreaming;

  return (
    <div className={`flex items-end gap-2 sm:gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold mb-1
          ${isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border/60 text-primary"
          }`}
      >
        {isUser ? firstName.charAt(0).toUpperCase() : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[78%] px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed shadow-sm
          ${isUser
            ? "bg-primary/10 text-foreground rounded-2xl rounded-tr-sm border border-primary/15"
            : "bg-card border border-border/50 rounded-2xl rounded-tl-sm text-foreground/90"
          }`}
      >
        {isEmpty ? (
          <TypingDots />
        ) : (
          <>
            {msg.content}
            {isCurrentlyStreaming && !isEmpty && <StreamingCursor />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Safety Modal ─────────────────────────────────────────────────────────────
function SafetyModal({ onDismiss }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div
        className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, oklch(from var(--card) l c h) 0%, oklch(from var(--primary) l c h / 0.04) 100%)",
        }}
      >
        {/* Top glow */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
          style={{ background: "linear-gradient(90deg, transparent, oklch(from var(--primary) l c h / 0.3), transparent)" }}
        />

        <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h2 className="text-xl sm:text-2xl font-celestial font-semibold mb-3">
          Zorya Safety & Behavioral Guidance
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Zorya is designed to build actionable, present-focused habits using Cognitive Behavioral Therapy (CBT). Our AI cannot provide future predictions, medical diagnostics, or health outcomes.
        </p>
        <button
          onClick={onDismiss}
          className="w-full h-11 sm:h-12 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 text-sm sm:text-base"
        >
          I Understand — Focus on Today&apos;s Habits
        </button>
      </div>
    </div>
  );
}

// ─── Main ChatClient ───────────────────────────────────────────────────────────
export function ChatClient({ firstName, userProfile }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Greetings, ${firstName}. I'm observing the transits and reading today's celestial climate. How are you feeling?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textOverride) => {
    const text = typeof textOverride === "string" ? textOverride : inputMessage;
    if (!text.trim() || isStreaming) return;

    setInputMessage("");
    setHasError(false);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_profile: userProfile, message: text }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to chat agent");
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

          if (eventName === "token") {
            setMessages((prev) => {
              const newMsgs = [...prev];
              const lastIdx = newMsgs.length - 1;
              newMsgs[lastIdx] = {
                ...newMsgs[lastIdx],
                content: newMsgs[lastIdx].content + payload.token,
              };
              return newMsgs;
            });
          } else if (eventName === "guardrail_block") {
            setIsStreaming(false);
            if (payload.reason === "crisis") {
              setMessages((prev) => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = {
                  role: "assistant",
                  content: "",
                  isCrisisCard: true,
                };
                return newMsgs;
              });
            } else {
              setShowSafetyModal(true);
            }
          } else if (eventName === "done") {
            setIsStreaming(false);
          } else if (eventName === "error") {
            console.error("Chat Stream Error:", payload.error);
            setIsStreaming(false);
            setHasError(true);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].content = "I'm having trouble reaching the server. Please try again in a moment.";
        return newMsgs;
      });
      setIsStreaming(false);
      setHasError(true);
    }
  };

  const handleDismissModal = () => {
    setShowSafetyModal(false);
    setMessages((prev) => {
      const newMsgs = [...prev];
      newMsgs[newMsgs.length - 1].content =
        "I cannot predict future outcomes. However, if you are feeling anxious about the future, let me help you focus on today's action plan.";
      return newMsgs;
    });
  };

  const isOnlyWelcome = messages.length === 1;

  return (
    <>
      {/* SSE connection status banner */}
      <ConnectionBanner isStreaming={isStreaming} hasError={hasError} />

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 space-y-4 sm:space-y-5">

        {/* Hero header — collapses once conversation has started */}
        <div className={`max-w-2xl mx-auto text-center transition-all duration-500 ${isOnlyWelcome ? "mb-6 sm:mb-10" : "mb-4"}`}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shadow-inner">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
          </div>
          <h1 className="font-celestial text-2xl sm:text-3xl font-light italic text-foreground mb-1.5">
            AI Companion
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
            Real-time SSE streaming · CBT micro-coaching · aligned with your active dashas
          </p>

          {/* Medical disclaimer */}
          <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-muted-foreground/60 bg-muted/30 border border-border/40 rounded-full px-3 py-1">
            <span>⚕</span>
            <span>Not a substitute for professional therapy or medical care</span>
          </div>
        </div>

        {/* Messages */}
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
          {messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              msg={msg}
              idx={idx}
              messagesLength={messages.length}
              isStreaming={isStreaming}
              firstName={firstName}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts — only on welcome state */}
        {isOnlyWelcome && !isStreaming && (
          <div className="mt-6 sm:mt-8">
            <SuggestedPrompts onSelect={handleSendMessage} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 bg-background/60 backdrop-blur-xl border-t border-border/50 shrink-0">
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                id="chat-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isStreaming || showSafetyModal}
                placeholder={isStreaming ? "Zorya is responding…" : "Ask about your dashas or CBT routines…"}
                className="w-full h-11 sm:h-12 bg-card border border-border/60 rounded-full pl-5 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all shadow-inner disabled:opacity-50 placeholder:text-muted-foreground/60"
              />
            </div>
            <button
              type="submit"
              id="chat-send-btn"
              disabled={isStreaming || showSafetyModal || !inputMessage.trim()}
              className="h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center bg-primary text-primary-foreground rounded-full transition-all hover:bg-primary/90 disabled:opacity-40 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 shrink-0"
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>

          {/* Placeholder SSE stream slot indicator */}
          {isStreaming && (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-primary/60">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
              <span>Streaming response via SSE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>
      </div>

      {/* Safety modal */}
      {showSafetyModal && <SafetyModal onDismiss={handleDismissModal} />}
    </>
  );
}
