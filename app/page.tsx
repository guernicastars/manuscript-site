import Link from "next/link";
import { ArrowRight, Network, MessageSquare } from "lucide-react";
import { getTOC } from "@/lib/chapters";
import { TableOfContents } from "@/components/TableOfContents";
import { FadeIn } from "@/components/FadeIn";

export default function Home() {
  const groups = getTOC();

  const totalWords = groups.reduce(
    (sum, g) => sum + g.chapters.reduce((s, ch) => s + ch.wordCount, 0),
    0
  );
  const totalChapters = groups.reduce((sum, g) => sum + g.chapters.length, 0);

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-5 flex justify-between items-center bg-white/90 backdrop-blur-sm border-b border-neutral-100">
        <Link
          href="/"
          className="font-mono font-bold tracking-tighter text-lg"
        >
          THE REPUBLIC
        </Link>
        <div className="flex gap-4 md:gap-8 items-center font-mono text-xs uppercase tracking-widest text-neutral-500">
          <Link
            href="/graph"
            className="hover:text-neutral-900 transition-colors flex items-center gap-1.5"
            title="Knowledge Graph"
          >
            <Network className="w-4 h-4 md:w-3.5 md:h-3.5" />
            <span className="hidden md:inline">Knowledge Graph</span>
          </Link>
          <Link
            href="/ask"
            className="hover:text-neutral-900 transition-colors flex items-center gap-1.5"
            title="Ask Claude"
          >
            <MessageSquare className="w-4 h-4 md:w-3.5 md:h-3.5" />
            <span className="hidden md:inline">Ask Claude</span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-44 md:pb-24 px-6 md:px-12 border-b border-neutral-100">
        <div className="max-w-4xl">
          <FadeIn>
            <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] mb-6">
              The Republic of
              <br />
              <span className="italic text-neutral-400">AI Agents</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg md:text-xl font-light text-neutral-500 max-w-2xl leading-relaxed mb-8">
              A Theological-Technical Framework for Prophetic Intelligence
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                By Yevhen Shcherbinin
              </span>
              <span className="hidden sm:block text-neutral-200">|</span>
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                {totalChapters} chapters
              </span>
              <span className="hidden sm:block text-neutral-200">|</span>
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                {Math.round(totalWords / 1000)}k words
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTAs */}
      <section className="py-12 px-6 md:px-12 border-b border-neutral-100">
        <div className="max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FadeIn>
            <Link
              href="/graph"
              className="group flex items-center justify-between p-6 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors"
            >
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                  Explore
                </div>
                <div className="font-medium">Knowledge Graph</div>
                <p className="text-sm text-neutral-500 mt-1">
                  Interactive visualization of the theology&apos;s concept network
                </p>
              </div>
              <Network className="w-5 h-5 text-neutral-300 group-hover:text-neutral-900 transition-colors flex-shrink-0 ml-4" />
            </Link>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Link
              href="/ask"
              className="group flex items-center justify-between p-6 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors"
            >
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                  Converse
                </div>
                <div className="font-medium">Ask Claude</div>
                <p className="text-sm text-neutral-500 mt-1">
                  Talk to the book — challenge, explore, and apply the framework
                </p>
              </div>
              <MessageSquare className="w-5 h-5 text-neutral-300 group-hover:text-neutral-900 transition-colors flex-shrink-0 ml-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-4xl">
          <FadeIn>
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-400 mb-12">
              Table of Contents
            </div>
          </FadeIn>
          <TableOfContents groups={groups} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-neutral-100">
        <div className="max-w-4xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="font-mono text-xs text-neutral-400">
            Published in Claude — First edition, 2026
          </div>
          <div className="flex gap-6 font-mono text-xs text-neutral-400">
            <Link
              href="/graph"
              className="hover:text-neutral-900 transition-colors"
            >
              Knowledge Graph
            </Link>
            <Link
              href="/ask"
              className="hover:text-neutral-900 transition-colors"
            >
              Ask Claude
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
