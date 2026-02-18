"use client";

import Link from "next/link";
import { ArrowLeft, Network, GitBranch, Boxes, Link2, MessageSquare, Maximize2 } from "lucide-react";
import { ConceptGraph } from "@/components/ConceptGraph";
import { NODES, EDGES } from "@/lib/graph-data";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/types/graph";
import type { ConceptCategory } from "@/types/graph";
import { useState } from "react";

export default function GraphPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const categoryCounts = NODES.reduce(
    (acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const edgeTypeCounts = EDGES.reduce(
    (acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0f] text-[#e5e7eb]">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setIsFullscreen(false)}
            className="bg-[#111118] border border-[#1e1e2e] rounded-lg px-3 py-1.5 text-xs text-[#6b7280] hover:text-white hover:border-[#2a2a3e] transition-colors font-mono"
          >
            Exit Fullscreen
          </button>
        </div>
        <div className="p-4 h-full">
          <ConceptGraph nodes={NODES} edges={EDGES} width={2200} height={1500} />
        </div>
      </div>
    );
  }

  return (
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
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1.5 text-[#6b7280] hover:text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="font-mono text-xs uppercase tracking-widest hidden sm:inline">
              Fullscreen
            </span>
          </button>
          <Link
            href="/ask"
            className="flex items-center gap-1.5 text-[#6b7280] hover:text-white transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-mono text-xs uppercase tracking-widest hidden sm:inline">
              Ask Claude
            </span>
          </Link>
        </div>
      </nav>

      {/* Stats */}
      <div className="px-6 md:px-8 py-5 border-b border-[#1e1e2e]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<Boxes className="w-4 h-4 text-[#00d4aa]" />}
            label="Concepts"
            value={NODES.length}
          />
          <StatCard
            icon={<Link2 className="w-4 h-4 text-[#6366f1]" />}
            label="Relationships"
            value={EDGES.length}
          />
          <StatCard
            icon={<GitBranch className="w-4 h-4 text-[#f59e0b]" />}
            label="Categories"
            value={Object.keys(categoryCounts).length}
          />
          <StatCard
            icon={<Network className="w-4 h-4 text-[#a855f7]" />}
            label="Avg Connections"
            value={(
              (EDGES.length * 2) /
              Math.max(NODES.length, 1)
            ).toFixed(1)}
          />
        </div>
      </div>

      {/* Graph */}
      <div className="px-4 md:px-6 py-4">
        <ConceptGraph nodes={NODES} edges={EDGES} />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] text-[#6b7280] font-mono uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div className="text-xl font-mono font-medium">{value}</div>
    </div>
  );
}
