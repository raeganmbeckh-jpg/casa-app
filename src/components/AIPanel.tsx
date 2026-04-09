"use client";

import { useState } from "react";
import { Bot, Send, X, Maximize2, Minimize2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIPanel() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || data.error },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to connect to AI agent." },
      ]);
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-16 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg shadow-blue-600/20 transition-all z-50"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl flex flex-col transition-all ${
        expanded
          ? "inset-4 bottom-16"
          : "bottom-16 right-6 w-96 h-[500px]"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm">CASA AI Agent</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 hover:bg-white/10 rounded"
          >
            {expanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-12">
            <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Ask me about your portfolio, properties, tenants, or market data.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-600/20 text-blue-100 ml-8"
                : "bg-white/5 text-gray-300 mr-8"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="bg-white/5 text-gray-400 text-sm p-3 rounded-lg mr-8 animate-pulse">
            Thinking...
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[var(--border)]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about your portfolio..."
            className="flex-1 bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={send}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
