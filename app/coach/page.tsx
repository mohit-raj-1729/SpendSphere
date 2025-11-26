// app/coach/page.tsx
"use client";

import React, { useState } from "react";

type Message = { from: "user" | "ai"; text: string };

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "ai",
      text:
        "Hey! I’m your money coach. Ask me anything like “Why did I overspend this month?” or “Can I afford a new EMI?”.",
    },
  ]);
  const [input, setInput] = useState("");

// app/coach/page.tsx
// ... existing imports, type Message, component start ...

const sendMessage = async () => {
  if (!input.trim()) return;
  const userMsg = input.trim();

  // Add user message
  setMessages((prev) => [
    ...prev,
    { from: "user" as const, text: userMsg },
  ]);
  setInput("");

  try {
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: userMsg }),
    });

    const data = (await res.json()) as { answer: string };

    setMessages((prev) => [
      ...prev,
      { from: "ai" as const, text: data.answer },
    ]);
  } catch (e) {
    setMessages((prev) => [
      ...prev,
      {
        from: "ai" as const,
        text: "Sorry, I couldn't reach the coach service. Please try again.",
      },
    ]);
  }
};

// ... existing JSX ...

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold">FlowFunds Coach</span>
        <a href="/app" className="text-xs text-slate-400 hover:text-slate-100">
          ← Back to dashboard
        </a>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 mb-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs ${
                m.from === "ai"
                  ? "bg-slate-800/80 text-slate-50 rounded-bl-sm"
                  : "bg-emerald-500/90 text-slate-950 ml-auto rounded-br-sm"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-slate-900/80 border border-slate-700 rounded-2xl px-3 py-2 text-xs outline-none focus:border-emerald-500/70"
            placeholder="Ask anything about your month..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 rounded-2xl bg-emerald-500/90 text-xs font-semibold text-slate-950"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}