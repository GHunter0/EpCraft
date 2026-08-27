"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Bot, User } from "lucide-react";
import Link from "next/link";
import { useShop } from "@/lib/ShopContext";

const initialMessages = [
  {
    sender: "bot",
    text: "Hello! Welcome to EpCraft. How can I help you today?",
  },
];

const quickPrompts = [
  "🚚 Delivery times in Sri Lanka",
  "🛡️ 1-Year Warranty policy",
  "🪵 Custom Wood Orders",
  "🏷️ Popular Products",
];

// Helper to render text with markdown bold (**bold**) and markdown links ([text](url))
function renderFormattedMessage(text) {
  if (!text) return null;

  const lines = text.split("\n");

  return lines.map((line, lIdx) => {
    // Process markdown link pattern [title](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      const linkTitle = match[1];
      const linkUrl = match[2];
      parts.push(
        <Link
          key={`link-${lIdx}-${match.index}`}
          href={linkUrl}
          className="font-medium text-gold hover:underline bg-gold/10 px-1.5 py-0.5 rounded text-xs transition-colors inline-flex items-center gap-0.5"
        >
          {linkTitle} →
        </Link>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    // Process bold tags in parts
    const processedLine = parts.map((part, pIdx) => {
      if (typeof part !== "string") return part;

      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith("**") && bPart.endsWith("**")) {
          return (
            <strong key={`b-${pIdx}-${bIdx}`} className="font-semibold text-espresso">
              {bPart.slice(2, -2)}
            </strong>
          );
        }
        return bPart;
      });
    });

    return (
      <span key={lIdx} className="block min-h-[1.25em]">
        {processedLine}
      </span>
    );
  });
}

export default function ChatBot({ externalOpen, setExternalOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Extract user info from ShopContext if logged in
  const { user } = useShop() || {};
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split("@")[0] : null);

  // Sync external open trigger from Navbar if passed
  useEffect(() => {
    if (typeof externalOpen === "boolean") {
      Promise.resolve().then(() => {
        setIsOpen(externalOpen);
      });
    }
  }, [externalOpen]);

  const toggleChat = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (setExternalOpen) setExternalOpen(nextState);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || isTyping) return;

    const userMsg = { sender: "user", text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          userName: userName || null,
        }),
      });

      const data = await response.json();
      const botReply = data.reply || "How else can I assist you with EpCraft woodwork?";

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      console.error("Chatbot fetch error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I'm having trouble connecting right now. Please check your internet connection and try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={toggleChat}
        aria-label="Open EpCraft AI Assistant"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-espresso text-gold shadow-card transition-transform duration-200 hover:scale-110 hover:bg-gold hover:text-white"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-4 right-4 z-50 flex h-[480px] w-auto sm:left-auto sm:right-6 sm:bottom-24 sm:w-[400px] sm:h-[520px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-card animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-espresso px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-gold">
                <Bot size={20} />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-cream">EpCraft AI Artisan</h4>
                <span className="flex items-center gap-1.5 font-sans text-xs text-sand/80">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  {userName ? `Hi, ${userName}` : "Online Assistant"}
                </span>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-sand/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-cream/30">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/20 text-espresso mt-1">
                    <Sparkles size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 font-sans text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-espresso text-white rounded-br-none"
                      : "bg-white text-ink shadow-xs border border-border/40 rounded-bl-none"
                  }`}
                >
                  {msg.sender === "bot"
                    ? renderFormattedMessage(msg.text)
                    : msg.text}
                </div>
                {msg.sender === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-espresso text-white mt-1">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-bark text-xs font-sans italic pl-9">
                <Sparkles size={14} className="animate-spin text-gold" /> EpCraft Artisan is thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="border-t border-border/40 bg-white p-2.5 flex gap-2 overflow-x-auto">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                disabled={isTyping}
                onClick={() => handleSend(prompt)}
                className="shrink-0 rounded-pill bg-cream px-3 py-1.5 font-sans text-xs text-bark hover:bg-gold hover:text-white transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-border/40 bg-white p-3"
          >
            <input
              type="text"
              placeholder="Ask about delivery, warranty, custom wood..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-pill border border-border/60 bg-cream/40 px-4 py-2.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-espresso text-white hover:bg-gold transition-colors disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
