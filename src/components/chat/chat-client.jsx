"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, ArrowUp } from "lucide-react";

export function ChatClient({ firstName, userProfile }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Greetings, ${firstName}. I am observing the transits. How are you feeling today?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
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
          {messages.map((msg, idx) => (
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
                {isStreaming && idx === messages.length - 1 && msg.role === "assistant" && (
                  <span className="inline-block w-1 h-4 ml-1 bg-primary/60 animate-pulse align-middle" />
                )}
              </div>
            </div>
          ))}
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
              disabled={isStreaming}
              placeholder="Ask Zorya..."
              className="w-full h-12 bg-card border border-border/60 rounded-full pl-6 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all shadow-inner disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isStreaming || !inputMessage.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full transition-opacity disabled:opacity-50 hover:bg-primary/90"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
