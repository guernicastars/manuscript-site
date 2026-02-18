import Link from "next/link";
import { ArrowLeft, Network } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { DEFAULT_PROMPTS } from "@/lib/prompts";

export const metadata = {
  title: "Ask Claude",
  description:
    "Talk to the manuscript — challenge, explore, and apply the theological-technical framework",
  openGraph: {
    type: "website",
    title: "Ask Claude | The Republic of AI Agents",
    description:
      "Talk to the manuscript — challenge arguments, explore ideas, and apply the theological-technical framework",
  },
  twitter: {
    card: "summary",
    title: "Ask Claude | The Republic of AI Agents",
    description:
      "Talk to the manuscript — challenge arguments, explore ideas, and apply the framework",
  },
};

export default function AskPage() {
  return (
    <div className="dark">
      <div className="min-h-screen bg-[#0a0a0f] text-[#e5e7eb]">
        {/* Nav */}
        <nav className="px-6 md:px-8 py-4 flex items-center justify-between border-b border-[#1e1e2e]">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#6b7280] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono text-xs uppercase tracking-widest">
              Back to Contents
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/graph"
              className="flex items-center gap-1.5 text-[#6b7280] hover:text-white transition-colors"
            >
              <Network className="w-3.5 h-3.5" />
              <span className="font-mono text-xs uppercase tracking-widest hidden sm:inline">
                Knowledge Graph
              </span>
            </Link>
          </div>
        </nav>

        {/* Header */}
        <div className="px-6 md:px-8 py-8 border-b border-[#1e1e2e]">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl md:text-3xl tracking-tight mb-2">
              Talk to the Book
            </h1>
            <p className="text-sm text-[#6b7280] leading-relaxed">
              Ask questions, challenge arguments, or apply the framework to new
              situations. Claude answers from within the manuscript&apos;s
              theological-technical framework.
            </p>
          </div>
        </div>

        {/* Chat */}
        <div className="px-6 md:px-8 py-6">
          <div className="max-w-2xl mx-auto">
            <ChatPanel fullPage suggestedPrompts={DEFAULT_PROMPTS} />
          </div>
        </div>
      </div>
    </div>
  );
}
