"use client";

import { useRef, useEffect } from "react";
import { MessageSquare, ArrowUp, AlertTriangle, PhoneCall } from "lucide-react";
import { useChat } from "@/components/providers/chat-provider";

export function ChatClient({ firstName, userProfile }) {
  const {
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isStreaming,
    setIsStreaming,
    showSafetyModal,
    setShowSafetyModal,
  } = useChat();

  useEffect(() => {
    if (messages.length === 0 && firstName) {
      setMessages([
        {
          role: "assistant",
          content: `Greetings, ${firstName}. I am observing the transits. How are you feeling today?`,
        },
      ]);
    }
  }, [firstName, messages.length, setMessages]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isStreaming) return;

    const userMsg = inputMessage;
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_profile: userProfile, message: userMsg }),
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
              // Fatalistic
              setShowSafetyModal(true);
            }
          } else if (eventName === "done") {
            setIsStreaming(false);
          } else if (eventName === "error") {
            console.error("Chat Stream Error:", payload.error);
            setIsStreaming(false);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].content = "Sorry, I encountered an error. Please try again.";
        return newMsgs;
      });
      setIsStreaming(false);
    }
  };

  const handleDismissModal = () => {
    setShowSafetyModal(false);
    setMessages((prev) => {
      const newMsgs = [...prev];
      newMsgs[newMsgs.length - 1].content = "I cannot predict future outcomes. However, if you are feeling anxious about the future, let me help you focus on today's action plan.";
      return newMsgs;
    });
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
            <MessageSquare className="w-5 h-5 opacity-80" />
          </div>
          <h1 className="font-celestial text-3xl font-light italic text-foreground mb-2">
            AI Companion
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time SSE streaming chat interface. Ask questions about your dashas or CBT routines here.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, idx) => {
            if (msg.isCrisisCard) {
              return (
                <div key={idx} className="p-6 bg-destructive/10 border border-destructive/20 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="font-semibold text-lg">Emergency Mental Health Resources</h3>
                  </div>
                  <p className="text-sm text-foreground/80">
                    Zorya focuses strictly on personal growth. For medical or psychiatric emergencies, please contact immediate help:
                  </p>
                  <div className="flex flex-col gap-3 mt-4">
                    <a href="tel:1926" className="flex items-center justify-between p-4 bg-background border border-border/60 rounded-xl hover:bg-muted/50 transition-colors group">
                      <div>
                        <div className="font-medium">1926 — National Mental Health Helpline</div>
                        <div className="text-xs text-muted-foreground">NIMH Sri Lanka — 24/7 Call / SMS</div>
                      </div>
                      <PhoneCall className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    </a>
                    <a href="tel:0112682535" className="flex items-center justify-between p-4 bg-background border border-border/60 rounded-xl hover:bg-muted/50 transition-colors group">
                      <div>
                        <div className="font-medium">011 268 2535 / 0707 308 308</div>
                        <div className="text-xs text-muted-foreground">Sri Lanka Sumithrayo Confidential Support</div>
                      </div>
                      <PhoneCall className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    </a>
                  </div>
                </div>
              );
            }
            
            return (
              <div
                key={idx}
                className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-primary/20 border border-primary/30 text-primary"
                  }`}
                >
                  {msg.role === "user" ? firstName.charAt(0) : "☽"}
                </div>
                <div
                  className={`p-4 shadow-sm text-sm ${
                    msg.role === "user"
                      ? "bg-primary/10 text-foreground rounded-2xl rounded-tr-none border border-primary/20"
                      : "bg-card border border-border/60 rounded-2xl rounded-tl-none text-foreground/90"
                  }`}
                >
                  {msg.content}
                  {isStreaming && idx === messages.length - 1 && msg.role === "assistant" && !showSafetyModal && (
                    <span className="inline-block w-1 h-4 ml-1 bg-primary/60 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 md:p-6 bg-background/50 backdrop-blur-xl border-t border-border/60 shrink-0">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isStreaming || showSafetyModal}
              placeholder="Ask Zorya..."
              className="w-full h-12 bg-card border border-border/60 rounded-full pl-6 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all shadow-inner disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isStreaming || showSafetyModal || !inputMessage.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full transition-opacity disabled:opacity-50 hover:bg-primary/90"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {showSafetyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border/60 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, oklch(from var(--card) l c h) 0%, oklch(from var(--primary) l c h / 0.05) 100%)"
            }}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-celestial font-semibold mb-4">Zorya Safety & Behavioral Guidance</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Zorya is designed to build actionable, present-focused habits using Cognitive Behavioral Therapy (CBT). Our AI cannot provide future predictions, medical diagnostics, or health outcomes.
            </p>
            <button
              onClick={handleDismissModal}
              className="w-full h-12 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
            >
              I Understand — Focus on Today's Habits
            </button>
          </div>
        </div>
      )}
    </>
  );
}
