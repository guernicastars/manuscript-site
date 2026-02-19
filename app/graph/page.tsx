"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Maximize2,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { ConceptGraph, EDGE_COLORS } from "@/components/ConceptGraph";
import { NODES, EDGES, getCoreNodes, getCoreEdges } from "@/lib/graph-data";
import { CATEGORY_COLORS, CATEGORY_LABELS, EDGE_TYPE_LABELS } from "@/types/graph";
import type { ConceptCategory, EdgeType, ConceptNode, GraphMode } from "@/types/graph";

// ── Graph metrics ────────────────────────────────────────

function computeComponents(nodes: typeof NODES, edges: typeof EDGES): number {
  const parent = new Map<string, string>();
  for (const n of nodes) parent.set(n.id, n.id);
  function find(x: string): string {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)!)!);
      x = parent.get(x)!;
    }
    return x;
  }
  function union(a: string, b: string) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }
  for (const e of edges) {
    if (parent.has(e.source) && parent.has(e.target)) {
      union(e.source, e.target);
    }
  }
  const roots = new Set<string>();
  for (const n of nodes) roots.add(find(n.id));
  return roots.size;
}

// ── Main page ────────────────────────────────────────────

export default function GraphPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [graphMode, setGraphMode] = useState<GraphMode>("core");
  const [enabledCategories, setEnabledCategories] = useState<Set<ConceptCategory>>(
    new Set(["thinker", "framework", "concept", "diagnosis", "theological", "crisis"]),
  );
  const [enabledEdgeTypes, setEnabledEdgeTypes] = useState<Set<EdgeType>>(
    new Set(["builds_on", "applies_to", "formalizes", "critiques", "synthesizes"]),
  );
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });

  const activeNodes = useMemo(
    () => (graphMode === "core" ? getCoreNodes() : NODES),
    [graphMode],
  );
  const activeEdges = useMemo(
    () => (graphMode === "core" ? getCoreEdges() : EDGES),
    [graphMode],
  );

  const toggleCategory = useCallback((cat: ConceptCategory) => {
    setEnabledCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const toggleEdgeType = useCallback((type: EdgeType) => {
    setEnabledEdgeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const components = useMemo(() => computeComponents(activeNodes, activeEdges), [activeNodes, activeEdges]);
  const avgDegree = ((activeEdges.length * 2) / Math.max(activeNodes.length, 1)).toFixed(1);
  const density = (
    (2 * activeEdges.length) /
    Math.max(activeNodes.length * (activeNodes.length - 1), 1)
  ).toFixed(3);

  const selectedNodeData = useMemo(() => {
    if (!selectedNode) return null;
    return activeNodes.find((n) => n.id === selectedNode) ?? null;
  }, [selectedNode, activeNodes]);

  const selectedOutgoing = useMemo(() => {
    if (!selectedNode) return [];
    return activeEdges.filter((e) => e.source === selectedNode);
  }, [selectedNode, activeEdges]);

  const selectedIncoming = useMemo(() => {
    if (!selectedNode) return [];
    return activeEdges.filter((e) => e.target === selectedNode);
  }, [selectedNode, activeEdges]);

  const nodeById = useMemo(() => {
    const map = new Map<string, ConceptNode>();
    for (const n of activeNodes) map.set(n.id, n);
    return map;
  }, [activeNodes]);

  // Search match count for sidebar display
  const searchMatchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const q = searchQuery.toLowerCase();
    return activeNodes.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        (n.description || "").toLowerCase().includes(q),
    ).length;
  }, [searchQuery, activeNodes]);

  const zoomIn = () =>
    setViewTransform((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.3, 3),
    }));
  const zoomOut = () =>
    setViewTransform((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.3, 0.3),
    }));
  const resetView = () => setViewTransform({ x: 0, y: 0, scale: 1 });

  const graphContent = (
    <div className="flex flex-1 overflow-hidden relative">
      {/* ── Left Sidebar ─────────────────────────────── */}
      <div
        className="flex-shrink-0 overflow-y-auto transition-all duration-200 border-r border-[#2a3a5a]"
        style={{
          width: sidebarOpen ? 280 : 0,
          opacity: sidebarOpen ? 1 : 0,
          background: "#0f1535",
        }}
      >
        <div className="p-5 space-y-6" style={{ width: 280 }}>
          {/* Metrics */}
          <div>
            <div className="text-[11px] uppercase tracking-[1.5px] text-[#888] font-semibold mb-3">
              Graph Metrics
            </div>
            <div className="space-y-2">
              <StatRow label="Concepts" value={activeNodes.length} />
              <StatRow label="Relationships" value={activeEdges.length} />
              <StatRow label="Avg Degree" value={avgDegree} />
              <StatRow label="Density" value={density} />
              <StatRow label="Components" value={components} />
            </div>
          </div>

          {/* Graph Mode Toggle */}
          <div>
            <div className="text-[11px] uppercase tracking-[1.5px] text-[#888] font-semibold mb-3">
              Graph Density
            </div>
            <div className="flex rounded-md overflow-hidden border border-[#2a3a5a]">
              {(["core", "expanded"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setGraphMode(mode);
                    setSelectedNode(null);
                  }}
                  className={`flex-1 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                    graphMode === mode
                      ? "bg-[#4da6ff] text-[#0a0e27] font-semibold"
                      : "bg-[#1a2a4a] text-[#6b7280] hover:text-[#a0a0a0]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <div className="text-[11px] uppercase tracking-[1.5px] text-[#888] font-semibold mb-3">
              Search
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4b5563]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search concepts..."
                className="w-full bg-[#1a2a4a] border border-[#2a3a5a] rounded px-3 py-1.5 pl-8 text-xs text-[#e0e0e0] placeholder-[#4b5563] focus:border-[#4da6ff] focus:outline-none transition-colors font-mono"
              />
              {searchQuery && (
                <>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white text-xs"
                  >
                    ×
                  </button>
                  {searchMatchCount > 0 && (
                    <span className="absolute right-7 top-1/2 -translate-y-1/2 text-[10px] text-[#00d4aa] font-mono">
                      {searchMatchCount}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Node Categories */}
          <div>
            <div className="text-[11px] uppercase tracking-[1.5px] text-[#888] font-semibold mb-3">
              Node Categories
            </div>
            <div className="space-y-1">
              {(Object.keys(CATEGORY_COLORS) as ConceptCategory[]).map((cat) => {
                const enabled = enabledCategories.has(cat);
                const count = activeNodes.filter((n) => n.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-2.5 w-full px-2 py-1.5 rounded text-left transition-all text-xs ${
                      enabled
                        ? "bg-[#1a2a4a] text-[#e0e0e0]"
                        : "text-[#4b5563] opacity-50 hover:opacity-70"
                    }`}
                  >
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: CATEGORY_COLORS[cat],
                        opacity: enabled ? 1 : 0.3,
                      }}
                    />
                    <span className="flex-1">{CATEGORY_LABELS[cat]}</span>
                    <span className="font-mono text-[10px] text-[#4da6ff]">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Edge Types */}
          <div>
            <div className="text-[11px] uppercase tracking-[1.5px] text-[#888] font-semibold mb-3">
              Edge Types
            </div>
            <div className="space-y-1">
              {(Object.keys(EDGE_COLORS) as EdgeType[]).map((type) => {
                const enabled = enabledEdgeTypes.has(type);
                const count = activeEdges.filter((e) => e.type === type).length;
                return (
                  <button
                    key={type}
                    onClick={() => toggleEdgeType(type)}
                    className={`flex items-center gap-2.5 w-full px-2 py-1.5 rounded text-left transition-all text-xs ${
                      enabled
                        ? "bg-[#1a2a4a] text-[#e0e0e0]"
                        : "text-[#4b5563] opacity-50 hover:opacity-70"
                    }`}
                  >
                    <span
                      className="inline-block w-4 h-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: EDGE_COLORS[type],
                        opacity: enabled ? 1 : 0.3,
                      }}
                    />
                    <span className="flex-1">{EDGE_TYPE_LABELS[type]}</span>
                    <span className="font-mono text-[10px] text-[#4da6ff]">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Controls */}
          <div>
            <div className="text-[11px] uppercase tracking-[1.5px] text-[#888] font-semibold mb-3">
              View Controls
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={zoomIn}
                className="bg-[#1a2a4a] border border-[#2a3a5a] rounded p-1.5 text-[#a0a0a0] hover:text-white hover:border-[#4da6ff] transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={zoomOut}
                className="bg-[#1a2a4a] border border-[#2a3a5a] rounded p-1.5 text-[#a0a0a0] hover:text-white hover:border-[#4da6ff] transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetView}
                className="bg-[#1a2a4a] border border-[#2a3a5a] rounded p-1.5 text-[#a0a0a0] hover:text-white hover:border-[#4da6ff] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-[#4da6ff] font-mono ml-auto">
                {Math.round(viewTransform.scale * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sidebar toggle ───────────────────────────── */}
      <button
        onClick={() => setSidebarOpen((p) => !p)}
        className="absolute top-3 z-10 bg-[#1a2a4a] border border-[#2a3a5a] rounded p-1.5 text-[#a0a0a0] hover:text-[#4da6ff] transition-all"
        style={{ left: sidebarOpen ? 290 : 10 }}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="w-4 h-4" />
        ) : (
          <PanelLeftOpen className="w-4 h-4" />
        )}
      </button>

      {/* ── Graph SVG ────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <ConceptGraph
          nodes={activeNodes}
          edges={activeEdges}
          enabledCategories={enabledCategories}
          enabledEdgeTypes={enabledEdgeTypes}
          searchQuery={searchQuery}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          viewTransform={viewTransform}
          onViewTransformChange={setViewTransform}
        />
      </div>

      {/* ── Right Detail Panel ───────────────────────── */}
      {selectedNodeData && (
        <div
          className="absolute top-0 right-0 h-full overflow-y-auto border-l border-[#2a3a5a] z-10"
          style={{ width: 320, background: "#0f1535" }}
        >
          <div className="p-5 space-y-5">
            {/* Close */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: CATEGORY_COLORS[selectedNodeData.category],
                    boxShadow: `0 0 8px ${CATEGORY_COLORS[selectedNodeData.category]}60`,
                  }}
                />
                <h3 className="text-base font-semibold text-[#4da6ff]">
                  {selectedNodeData.label}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[#6b7280] hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category badge */}
            <span
              className="inline-block text-[10px] px-2.5 py-1 rounded-full capitalize font-mono tracking-wider"
              style={{
                backgroundColor: `${CATEGORY_COLORS[selectedNodeData.category]}15`,
                color: CATEGORY_COLORS[selectedNodeData.category],
                border: `1px solid ${CATEGORY_COLORS[selectedNodeData.category]}30`,
              }}
            >
              {selectedNodeData.category}
            </span>

            {/* Description */}
            {selectedNodeData.description && (
              <p className="text-xs text-[#a0a0a0] leading-relaxed">
                {selectedNodeData.description}
              </p>
            )}

            {/* Chapters */}
            {selectedNodeData.chapters.length > 0 && (
              <div>
                <div className="text-[11px] uppercase tracking-[1.5px] text-[#888] font-semibold mb-2">
                  Appears in
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNodeData.chapters.map((slug) => (
                    <Link
                      key={slug}
                      href={`/chapters/${slug}`}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#1a2a4a] border border-[#2a3a5a] text-[#a0a0a0] hover:text-[#4da6ff] hover:border-[#4da6ff40] transition-colors"
                    >
                      {slug.replace(/^\d+-/, "").replace(/-/g, " ")}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Outgoing connections */}
            {selectedOutgoing.length > 0 && (
              <div>
                <div className="text-[11px] uppercase tracking-[1.5px] text-[#888] font-semibold mb-2">
                  Connects to ({selectedOutgoing.length})
                </div>
                <ul className="space-y-1.5">
                  {selectedOutgoing.map((e) => {
                    const target = nodeById.get(e.target);
                    return (
                      <li
                        key={`${e.target}-${e.type}`}
                        className="flex items-center gap-2 text-xs cursor-pointer hover:bg-[#1a2a4a] rounded px-1.5 py-1 -mx-1.5 transition-colors"
                        onClick={() => setSelectedNode(e.target)}
                      >
                        <span
                          className="w-3 h-0.5 rounded-full inline-block flex-shrink-0"
                          style={{ backgroundColor: EDGE_COLORS[e.type] }}
                        />
                        <span className="text-[#e0e0e0]">{target?.label ?? e.target}</span>
                        <span className="text-[#4b5563] ml-auto font-mono text-[10px]">
                          {(e.strength * 100).toFixed(0)}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Incoming connections */}
            {selectedIncoming.length > 0 && (
              <div>
                <div className="text-[11px] uppercase tracking-[1.5px] text-[#888] font-semibold mb-2">
                  Connected from ({selectedIncoming.length})
                </div>
                <ul className="space-y-1.5">
                  {selectedIncoming.map((e) => {
                    const source = nodeById.get(e.source);
                    return (
                      <li
                        key={`${e.source}-${e.type}`}
                        className="flex items-center gap-2 text-xs cursor-pointer hover:bg-[#1a2a4a] rounded px-1.5 py-1 -mx-1.5 transition-colors"
                        onClick={() => setSelectedNode(e.source)}
                      >
                        <span
                          className="w-3 h-0.5 rounded-full inline-block flex-shrink-0"
                          style={{ backgroundColor: EDGE_COLORS[e.type] }}
                        />
                        <span className="text-[#e0e0e0]">{source?.label ?? e.source}</span>
                        <span className="text-[#4b5563] ml-auto font-mono text-[10px]">
                          {(e.strength * 100).toFixed(0)}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#0a0e27" }}>
        <nav className="px-6 py-3 flex items-center justify-between border-b border-[#2a3a5a] flex-shrink-0">
          <span className="font-mono text-xs uppercase tracking-widest text-[#a0a0a0]">
            Knowledge Graph
          </span>
          <button
            onClick={() => setIsFullscreen(false)}
            className="bg-[#1a2a4a] border border-[#2a3a5a] rounded-lg px-3 py-1.5 text-xs text-[#a0a0a0] hover:text-white hover:border-[#4da6ff] transition-colors font-mono"
          >
            Exit Fullscreen
          </button>
        </nav>
        {graphContent}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: "#0a0e27", color: "#e0e0e0" }}>
      {/* Nav */}
      <nav className="px-6 py-3 flex items-center justify-between border-b border-[#2a3a5a] flex-shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#a0a0a0] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-xs uppercase tracking-widest">
            Back to Contents
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1.5 text-[#a0a0a0] hover:text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="font-mono text-xs uppercase tracking-widest hidden sm:inline">
              Fullscreen
            </span>
          </button>
          <Link
            href="/ask"
            className="flex items-center gap-1.5 text-[#a0a0a0] hover:text-white transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-mono text-xs uppercase tracking-widest hidden sm:inline">
              Ask Claude
            </span>
          </Link>
        </div>
      </nav>

      {graphContent}
    </div>
  );
}

// ── Stat Row ─────────────────────────────────────────────

function StatRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-[#a0a0a0]">{label}</span>
      <span className="text-[#4da6ff] font-semibold font-mono">{value}</span>
    </div>
  );
}
