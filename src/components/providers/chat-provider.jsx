"use client";

import { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        inputMessage,
        setInputMessage,
        isStreaming,
        setIsStreaming,
        showSafetyModal,
        setShowSafetyModal,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
