"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { ConceptNode, ConceptEdge, ConceptCategory, EdgeType } from "@/types/graph";
import { CATEGORY_COLORS, CATEGORY_LABELS, EDGE_TYPE_LABELS } from "@/types/graph";

const NODE_RADIUS = 20;
const ARROW_SIZE = 7;

const EDGE_COLORS: Record<EdgeType, string> = {
  builds_on: "#6366f1",
  applies_to: "#00d4aa",
  formalizes: "#f59e0b",
  critiques: "#ff4466",
  synthesizes: "#a855f7",
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function runSimulation(
  nodes: ConceptNode[],
  edges: ConceptEdge[],
  width: number,
  height: number,
  iterations: number = 150,
): ConceptNode[] {
  const simNodes = nodes.map((n, i) => ({
    ...n,
    x: n.x ?? width / 2 + (width / 3) * Math.cos((2 * Math.PI * i) / nodes.length),
    y: n.y ?? height / 2 + (height / 3) * Math.sin((2 * Math.PI * i) / nodes.length),
    vx: 0,
    vy: 0,
  }));

  const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations;
    const k = Math.sqrt((width * height) / Math.max(simNodes.length, 1));

    for (let i = 0; i < simNodes.length; i++) {
      for (let j = i + 1; j < simNodes.length; j++) {
        const a = simNodes[i];
        const b = simNodes[j];
        let dx = a.x! - b.x!;
        let dy = a.y! - b.y!;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (k * k) / dist;
        dx = (dx / dist) * force * alpha * 0.15;
        dy = (dy / dist) * force * alpha * 0.15;
        a.vx! += dx;
        a.vy! += dy;
        b.vx! -= dx;
        b.vy! -= dy;
      }
    }

    for (const edge of edges) {
      const a = nodeMap.get(edge.source);
      const b = nodeMap.get(edge.target);
      if (!a || !b) continue;
      let dx = b.x! - a.x!;
      let dy = b.y! - a.y!;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = (dist * dist) / k;
      const strength = 0.05 + edge.strength * 0.1;
      dx = (dx / dist) * force * alpha * strength;
      dy = (dy / dist) * force * alpha * strength;
      a.vx! += dx;
      a.vy! += dy;
      b.vx! -= dx;
      b.vy! -= dy;
    }

    for (const node of simNodes) {
      node.vx! += (width / 2 - node.x!) * alpha * 0.01;
      node.vy! += (height / 2 - node.y!) * alpha * 0.01;
    }

    for (const node of simNodes) {
      node.vx! *= 0.8;
      node.vy! *= 0.8;
      node.x! += node.vx!;
      node.y! += node.vy!;
      node.x = clamp(node.x!, NODE_RADIUS + 10, width - NODE_RADIUS - 10);
      node.y = clamp(node.y!, NODE_RADIUS + 10, height - NODE_RADIUS - 10);
    }
  }

  return simNodes;
}

interface ConceptGraphProps {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  width?: number;
  height?: number;
}

export function ConceptGraph({
  nodes,
  edges,
  width = 1000,
  height = 600,
}: ConceptGraphProps) {
  const [simulatedNodes, setSimulatedNodes] = useState<ConceptNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [enabledCategories, setEnabledCategories] = useState<Set<ConceptCategory>>(
    new Set(["thinker", "framework", "concept", "diagnosis", "theological", "crisis"]),
  );

  useEffect(() => {
    if (nodes.length === 0) return;
    const filtered = nodes.filter((n) => enabledCategories.has(n.category));
    const filteredIds = new Set(filtered.map((n) => n.id));
    const filteredEdges = edges.filter(
      (e) => filteredIds.has(e.source) && filteredIds.has(e.target),
    );
    const result = runSimulation(filtered, filteredEdges, width, height);
    setSimulatedNodes(result);
  }, [nodes, edges, width, height, enabledCategories]);

  const nodeMap = new Map(simulatedNodes.map((n) => [n.id, n]));

  const filteredIds = new Set(simulatedNodes.map((n) => n.id));
  const filteredEdges = edges.filter(
    (e) => filteredIds.has(e.source) && filteredIds.has(e.target),
  );

  const toggleCategory = useCallback((cat: ConceptCategory) => {
    setEnabledCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const handleNodeClick = useCallback((node: ConceptNode) => {
    setSelectedNode((prev) => (prev === node.id ? null : node.id));
  }, []);

  const highlightNodeId = hoveredNode ?? selectedNode;
  const connectedEdgeKeys = new Set<string>();
  const connectedNodeIds = new Set<string>();
  if (highlightNodeId) {
    connectedNodeIds.add(highlightNodeId);
    for (const e of filteredEdges) {
      if (e.source === highlightNodeId || e.target === highlightNodeId) {
        connectedEdgeKeys.add(`${e.source}-${e.target}`);
        connectedNodeIds.add(e.source);
        connectedNodeIds.add(e.target);
      }
    }
  }

  return (
    <div className="space-y-3">
      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-muted-foreground font-medium">Filter:</span>
        {(Object.keys(CATEGORY_COLORS) as ConceptCategory[]).map((cat) => {
          const enabled = enabledCategories.has(cat);
          const count = nodes.filter((n) => n.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                enabled ? "bg-[#1e1e2e]" : "bg-transparent opacity-40"
              }`}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              />
              <span className={enabled ? "text-foreground" : "text-muted-foreground"}>
                {CATEGORY_LABELS[cat]} ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* SVG Graph */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full rounded-lg bg-[#0d0d14] border border-[#1e1e2e]"
        style={{ maxHeight: "70vh" }}
      >
        <defs>
          {(Object.keys(EDGE_COLORS) as EdgeType[]).map((type) => (
            <marker
              key={type}
              id={`arrow-${type}`}
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth={ARROW_SIZE}
              markerHeight={ARROW_SIZE}
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={EDGE_COLORS[type]} opacity={0.8} />
            </marker>
          ))}
          <marker
            id="arrow-highlight"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth={ARROW_SIZE + 2}
            markerHeight={ARROW_SIZE + 2}
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="white" opacity={0.9} />
          </marker>
        </defs>

        {/* Edges */}
        {filteredEdges.map((edge) => {
          const sourceNode = nodeMap.get(edge.source);
          const targetNode = nodeMap.get(edge.target);
          if (!sourceNode || !targetNode) return null;

          const edgeKey = `${edge.source}-${edge.target}`;
          const isHighlighted = connectedEdgeKeys.size > 0 && connectedEdgeKeys.has(edgeKey);
          const isDimmed = connectedEdgeKeys.size > 0 && !isHighlighted;

          const dx = targetNode.x! - sourceNode.x!;
          const dy = targetNode.y! - sourceNode.y!;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const ux = dx / dist;
          const uy = dy / dist;

          const x1 = sourceNode.x! + ux * (NODE_RADIUS + 2);
          const y1 = sourceNode.y! + uy * (NODE_RADIUS + 2);
          const x2 = targetNode.x! - ux * (NODE_RADIUS + ARROW_SIZE + 2);
          const y2 = targetNode.y! - uy * (NODE_RADIUS + ARROW_SIZE + 2);

          const strokeWidth = 1 + edge.strength * 3;

          return (
            <g key={edgeKey}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isHighlighted ? "white" : EDGE_COLORS[edge.type]}
                strokeWidth={isHighlighted ? strokeWidth + 1 : strokeWidth}
                opacity={isDimmed ? 0.08 : isHighlighted ? 1 : 0.5}
                markerEnd={`url(#arrow-${isHighlighted ? "highlight" : edge.type})`}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredEdge(edgeKey)}
                onMouseLeave={() => setHoveredEdge(null)}
              />
              {hoveredEdge === edgeKey && (
                <g>
                  <rect
                    x={(x1 + x2) / 2 - 55}
                    y={(y1 + y2) / 2 - 12}
                    width={110}
                    height={24}
                    rx={4}
                    fill="#1e1e2e"
                    stroke="#2a2a3e"
                    strokeWidth={1}
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize={10}
                    fontFamily="monospace"
                  >
                    {edge.label ?? EDGE_TYPE_LABELS[edge.type]}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {simulatedNodes.map((node) => {
          const isHighlighted = connectedNodeIds.size > 0 && connectedNodeIds.has(node.id);
          const isDimmed = connectedNodeIds.size > 0 && !isHighlighted;
          const isSelected = selectedNode === node.id;
          const fillColor = CATEGORY_COLORS[node.category];

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              className="cursor-pointer"
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {isSelected && (
                <circle r={NODE_RADIUS + 5} fill="none" stroke="white" strokeWidth={2} opacity={0.6} />
              )}
              <circle
                r={NODE_RADIUS + 2}
                fill="none"
                stroke={fillColor}
                strokeWidth={1.5}
                opacity={isDimmed ? 0.1 : isHighlighted ? 0.8 : 0.3}
              />
              <circle
                r={NODE_RADIUS}
                fill="#111118"
                stroke={fillColor}
                strokeWidth={2}
                opacity={isDimmed ? 0.2 : 1}
              />
              <circle
                r={NODE_RADIUS - 3}
                fill={fillColor}
                opacity={isDimmed ? 0.05 : 0.15}
              />
              <text
                textAnchor="middle"
                dy={1}
                fill={isDimmed ? "#333" : "white"}
                fontSize={8}
                fontWeight={500}
              >
                {node.label.length > 12 ? node.label.slice(0, 11) + "\u2026" : node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected node detail panel */}
      {selectedNode && nodeMap.get(selectedNode) && (
        <SelectedNodePanel
          node={nodeMap.get(selectedNode)!}
          edges={filteredEdges}
          nodeMap={nodeMap}
        />
      )}
    </div>
  );
}

function SelectedNodePanel({
  node,
  edges,
  nodeMap,
}: {
  node: ConceptNode;
  edges: ConceptEdge[];
  nodeMap: Map<string, ConceptNode>;
}) {
  const outgoing = edges.filter((e) => e.source === node.id);
  const incoming = edges.filter((e) => e.target === node.id);

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-medium text-sm">{node.label}</h4>
          {node.description && (
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              {node.description}
            </p>
          )}
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0"
          style={{
            backgroundColor: `${CATEGORY_COLORS[node.category]}20`,
            color: CATEGORY_COLORS[node.category],
          }}
        >
          {node.category}
        </span>
      </div>

      {/* Chapters */}
      {node.chapters.length > 0 && (
        <div>
          <span className="text-xs text-muted-foreground font-medium">Appears in:</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {node.chapters.map((slug) => (
              <Link
                key={slug}
                href={`/chapters/${slug}`}
                className="text-xs px-2 py-0.5 rounded bg-[#1e1e2e] text-muted-foreground hover:text-foreground transition-colors"
              >
                {slug.replace(/^\d+-/, "").replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-muted-foreground font-medium">
            Connects to ({outgoing.length})
          </span>
          {outgoing.length > 0 && (
            <ul className="mt-1 space-y-1">
              {outgoing.map((e) => {
                const target = nodeMap.get(e.target);
                return (
                  <li key={`${e.target}-${e.type}`} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-0.5 rounded-full inline-block"
                      style={{ backgroundColor: EDGE_COLORS[e.type] }}
                    />
                    <span>{target?.label ?? e.target}</span>
                    <span className="text-muted-foreground">
                      ({EDGE_TYPE_LABELS[e.type]})
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div>
          <span className="text-muted-foreground font-medium">
            Connected from ({incoming.length})
          </span>
          {incoming.length > 0 && (
            <ul className="mt-1 space-y-1">
              {incoming.map((e) => {
                const source = nodeMap.get(e.source);
                return (
                  <li key={`${e.source}-${e.type}`} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-0.5 rounded-full inline-block"
                      style={{ backgroundColor: EDGE_COLORS[e.type] }}
                    />
                    <span>{source?.label ?? e.source}</span>
                    <span className="text-muted-foreground">
                      ({EDGE_TYPE_LABELS[e.type]})
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
