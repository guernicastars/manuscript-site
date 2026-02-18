"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageSquare, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  chapterContext?: string;
  suggestedPrompts?: string[];
  fullPage?: boolean;
}

export function ChatPanel({
  chapterContext,
  suggestedPrompts = [],
  fullPage = false,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(fullPage);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages,
          chapterContext,
        }),
      });

      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!fullPage && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mt-12 flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-900 transition-colors font-mono"
      >
        <MessageSquare className="w-4 h-4" />
        Ask Claude about this chapter
      </button>
    );
  }

  const containerClass = fullPage
    ? "flex flex-col h-[calc(100vh-120px)]"
    : "mt-8 border border-neutral-200 rounded-lg overflow-hidden";

  return (
    <div className={containerClass}>
      {/* Header (collapsible mode only) */}
      {!fullPage && (
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <MessageSquare className="w-4 h-4" />
            Ask Claude
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 ${
          fullPage ? "max-h-none" : "max-h-[400px]"
        }`}
      >
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className={`text-sm ${fullPage ? "text-neutral-400" : "text-neutral-500"}`}>
              Ask a question about the manuscript. Claude will answer from within
              the framework.
            </p>
            {suggestedPrompts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors text-left ${
                      fullPage
                        ? "border-[#1e1e2e] text-[#6b7280] hover:text-white hover:border-[#6b7280]"
                        : "border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400"
                    }`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm leading-relaxed ${
              msg.role === "user"
                ? fullPage
                  ? "text-white font-medium"
                  : "text-neutral-900 font-medium"
                : fullPage
                  ? "text-[#e5e7eb] font-light"
                  : "text-neutral-700 font-light"
            }`}
          >
            <span
              className={`font-mono text-[10px] uppercase tracking-widest ${
                fullPage ? "text-[#6b7280]" : "text-neutral-400"
              } block mb-1`}
            >
              {msg.role === "user" ? "You" : "Claude"}
            </span>
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="font-mono text-xs">Thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className={`px-4 py-3 border-t ${
          fullPage ? "border-[#1e1e2e]" : "border-neutral-100"
        }`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the manuscript..."
            disabled={loading}
            className={`flex-1 text-sm px-3 py-2 rounded-lg border outline-none transition-colors ${
              fullPage
                ? "bg-[#111118] border-[#1e1e2e] text-white placeholder-[#6b7280] focus:border-[#6b7280]"
                : "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400"
            }`}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
              fullPage
                ? "text-[#00d4aa] hover:bg-[#1e1e2e]"
                : "text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
