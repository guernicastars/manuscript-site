"use client";

import Link from "next/link";
import { ArrowLeft, Network, GitBranch, Boxes, Link2, MessageSquare } from "lucide-react";
import { ConceptGraph } from "@/components/ConceptGraph";
import { NODES, EDGES } from "@/lib/graph-data";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/types/graph";
import type { ConceptCategory } from "@/types/graph";

export default function GraphPage() {
  const categoryCounts = NODES.reduce(
    (acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

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
      <div className="px-6 md:px-8 py-6 border-b border-[#1e1e2e]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
      <div className="px-6 md:px-8 py-6">
        <ConceptGraph nodes={NODES} edges={EDGES} />
      </div>

      {/* Legend */}
      <div className="px-6 md:px-8 py-6 border-t border-[#1e1e2e]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
          {(Object.keys(CATEGORY_COLORS) as ConceptCategory[]).map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              />
              <div>
                <div className="text-[#e5e7eb]">{CATEGORY_LABELS[cat]}</div>
                <div className="text-[#6b7280]">{categoryCounts[cat] ?? 0} nodes</div>
              </div>
            </div>
          ))}
        </div>
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
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-[#6b7280] font-mono uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-2xl font-mono font-medium">{value}</div>
    </div>
  );
}
