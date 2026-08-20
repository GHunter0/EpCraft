"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Bot, User } from "lucide-react";

const initialMessages = [
  {
    sender: "bot",
    text: "Hello! I am your EpCraft AI Artisan Assistant. How can I help you today? Ask me about wood species, custom engraving, order tracking, or styling advice!",
  },
];

const quickPrompts = [
  "Which wood finish is best for dining tables?",
  "How long does custom engraving take?",
  "What is your lifetime guarantee?",
];

export default function ChatBot({ externalOpen, setExternalOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

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

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Smart bot responses based on keywords
    setTimeout(() => {
      let botResponse = "Our master craftsmen specialize in American Walnut, European White Oak, and Cherry wood. Would you like to explore our Customization Studio or talk to a wood specialist?";
      const lower = text.toLowerCase();

      if (lower.includes("dining") || lower.includes("finish") || lower.includes("best")) {
        botResponse = "For dining tables, Dark Walnut and White Oak are our top choices due to their dense grain strength and natural water resistance when sealed with organic oils.";
      } else if (lower.includes("engrav") || lower.includes("custom")) {
        botResponse = "Custom engraved pieces take 2–3 weeks to precision-craft and hand-finish. You can preview fonts and text live in our Customization Studio!";
      } else if (lower.includes("guarantee") || lower.includes("warranty")) {
        botResponse = "Every EpCraft piece comes with our Lifetime Craftsmanship Guarantee covering structural integrity, joinery, and natural wood movement.";
      } else if (lower.includes("shipping") || lower.includes("delivery")) {
        botResponse = "We offer free insured white-glove delivery on all standard orders within 4–6 weeks.";
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
      setIsTyping(false);
    }, 1000);
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
                  <span className="h-2 w-2 rounded-full bg-green-400" /> Online Assistant
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
                  className={`max-w-[80%] rounded-2xl px-4 py-3 font-sans text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-espresso text-white rounded-br-none"
                      : "bg-white text-ink shadow-xs border border-border/40 rounded-bl-none"
                  }`}
                >
                  {msg.text}
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
                <Sparkles size={14} className="animate-spin text-gold" /> EpCraft Artisan is typing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="border-t border-border/40 bg-white p-2.5 flex gap-2 overflow-x-auto">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="shrink-0 rounded-pill bg-cream px-3 py-1.5 font-sans text-xs text-bark hover:bg-gold hover:text-white transition-colors"
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
              placeholder="Ask about timber, sizing, custom orders..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-pill border border-border/60 bg-cream/40 px-4 py-2.5 font-sans text-sm text-ink placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <button
              type="submit"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-espresso text-white hover:bg-gold transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
