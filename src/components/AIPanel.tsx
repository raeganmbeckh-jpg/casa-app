"use client";

import { useState } from "react";
import { Bot, Send, X, Maximize2, Minimize2 } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string }

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
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [...messages, userMsg] }) });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response || data.error }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Failed to connect to AI agent." }]);
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-16 right-6 p-4 rounded-full transition-all z-50"
        style={{ backgroundColor: "#F9D96A", color: "#1A1A1A", boxShadow: "0 4px 20px rgba(249,217,106,0.3)" }}
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 rounded-2xl flex flex-col transition-all ${expanded ? "inset-4 bottom-16" : "bottom-16 right-6 w-96 h-[500px]"}`}
      style={{ backgroundColor: "#fff", border: "1px solid #F0F0F0", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #F0F0F0" }}>
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" style={{ color: "#E8C84A" }} />
          <span className="font-semibold text-sm" style={{ fontFamily: "var(--font-heading)", color: "#1A1A1A" }}>CASA AI</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded hover:bg-gray-50">{expanded ? <Minimize2 className="w-4 h-4 text-gray-400" /> : <Maximize2 className="w-4 h-4 text-gray-400" />}</button>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded hover:bg-gray-50"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <Bot className="w-10 h-10 mx-auto mb-3" style={{ color: "#ddd" }} />
            <p className="text-sm" style={{ color: "#6B6B6B" }}>Ask about your portfolio, properties, tenants, or market data.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="text-sm p-3 rounded-xl" style={{
            backgroundColor: msg.role === "user" ? "#F9D96A15" : "#F7F7F7",
            color: "#1A1A1A",
            marginLeft: msg.role === "user" ? 32 : 0,
            marginRight: msg.role === "assistant" ? 32 : 0,
          }}>{msg.content}</div>
        ))}
        {loading && <div className="text-sm p-3 rounded-xl animate-pulse mr-8" style={{ backgroundColor: "#F7F7F7", color: "#6B6B6B" }}>Thinking...</div>}
      </div>

      <div className="p-3" style={{ borderTop: "1px solid #F0F0F0" }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about your portfolio..."
            className="flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            style={{ borderColor: "#F0F0F0", color: "#1A1A1A", fontFamily: "var(--font-inter)" }}
          />
          <button onClick={send} disabled={loading} className="p-2.5 rounded-xl transition-colors disabled:opacity-50" style={{ backgroundColor: "#F9D96A", color: "#1A1A1A" }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
