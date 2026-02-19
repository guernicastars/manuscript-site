"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import type { ConceptNode, ConceptEdge, ConceptCategory, EdgeType } from "@/types/graph";
import { CATEGORY_COLORS, EDGE_TYPE_LABELS } from "@/types/graph";

// ── Polymarket-inspired sizing ──────────────────────────────
const MIN_NODE_RADIUS = 8;
const MAX_NODE_RADIUS = 30;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;

export const EDGE_COLORS: Record<EdgeType, string> = {
  builds_on: "#6366f1",
  applies_to: "#00d4aa",
  formalizes: "#f59e0b",
  critiques: "#ff4466",
  synthesizes: "#a855f7",
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export interface SimNode extends SimulationNodeDatum {
  id: string;
  label: string;
  category: ConceptCategory;
  chapters: string[];
  description?: string;
  fx?: number | null;
  fy?: number | null;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  weight: number;
}

export interface ConceptGraphProps {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  width?: number;
  height?: number;
  enabledCategories: Set<ConceptCategory>;
  enabledEdgeTypes: Set<EdgeType>;
  searchQuery: string;
  selectedNode: string | null;
  onSelectNode: (id: string | null) => void;
  viewTransform: { x: number; y: number; scale: number };
  onViewTransformChange: (t: { x: number; y: number; scale: number }) => void;
}

export function ConceptGraph({
  nodes,
  edges,
  width = 2400,
  height = 1800,
  enabledCategories,
  enabledEdgeTypes,
  searchQuery,
  selectedNode,
  onSelectNode,
  viewTransform,
  onViewTransformChange,
}: ConceptGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const transformStart = useRef({ x: 0, y: 0 });
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const simNodesRef = useRef<SimNode[]>([]);

  // Degree map for node sizing (sqrt scaling like Polymarket)
  const degreeMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of edges) {
      map.set(e.source, (map.get(e.source) || 0) + 1);
      map.set(e.target, (map.get(e.target) || 0) + 1);
    }
    return map;
  }, [edges]);

  const maxDegree = useMemo(
    () => Math.max(...Array.from(degreeMap.values()), 1),
    [degreeMap],
  );

  function getNodeRadius(nodeId: string) {
    const deg = degreeMap.get(nodeId) || 1;
    return MIN_NODE_RADIUS + (MAX_NODE_RADIUS - MIN_NODE_RADIUS) * Math.sqrt(deg / maxDegree);
  }

  // ── Force simulation ──────────────────────────────────────
  useEffect(() => {
    if (nodes.length === 0) return;
    if (simRef.current) simRef.current.stop();

    const filtered = nodes.filter((n) => enabledCategories.has(n.category));
    const filteredIds = new Set(filtered.map((n) => n.id));
    const filteredEdges = edges.filter(
      (e) => filteredIds.has(e.source) && filteredIds.has(e.target),
    );

    const localDegreeMap = new Map<string, number>();
    for (const node of filtered) localDegreeMap.set(node.id, 0);
    for (const edge of filteredEdges) {
      localDegreeMap.set(edge.source, (localDegreeMap.get(edge.source) ?? 0) + 1);
      localDegreeMap.set(edge.target, (localDegreeMap.get(edge.target) ?? 0) + 1);
    }
    const localMaxDeg = Math.max(...localDegreeMap.values(), 1);

    const newSimNodes: SimNode[] = filtered.map((n) => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * 200,
      y: height / 2 + (Math.random() - 0.5) * 200,
    }));

    const simLinks: SimLink[] = filteredEdges.map((e) => ({
      source: e.source,
      target: e.target,
      weight: e.strength,
    }));

    simNodesRef.current = newSimNodes;

    const simulation = forceSimulation<SimNode>(newSimNodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(150)
          .strength(0.4),
      )
      .force(
        "charge",
        forceManyBody<SimNode>()
          .strength(-350)
          .distanceMax(500),
      )
      .force(
        "center",
        forceCenter<SimNode>(width / 2, height / 2).strength(0.05),
      )
      .force(
        "collision",
        forceCollide<SimNode>()
          .radius((d) => {
            const deg = localDegreeMap.get(d.id) ?? 1;
            const r = MIN_NODE_RADIUS + (MAX_NODE_RADIUS - MIN_NODE_RADIUS) * Math.sqrt(deg / localMaxDeg);
            return r + 10;
          })
          .strength(0.7),
      )
      .alphaDecay(0.02)
      .velocityDecay(0.3)
      .on("tick", () => {
        setSimNodes(
          simNodesRef.current.map((sn) => ({
            id: sn.id,
            label: sn.label,
            category: sn.category,
            chapters: sn.chapters,
            description: sn.description,
            x: sn.x,
            y: sn.y,
            fx: sn.fx,
            fy: sn.fy,
          })),
        );
      });

    simRef.current = simulation;
    return () => { simulation.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, width, height, enabledCategories]);

  const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

  const filteredIds = new Set(simNodes.map((n) => n.id));
  const filteredEdges = edges.filter(
    (e) =>
      filteredIds.has(e.source) &&
      filteredIds.has(e.target) &&
      enabledEdgeTypes.has(e.type),
  );

  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const q = searchQuery.toLowerCase();
    return new Set(
      simNodes
        .filter(
          (n) =>
            n.label.toLowerCase().includes(q) ||
            (n.description || "").toLowerCase().includes(q),
        )
        .map((n) => n.id),
    );
  }, [searchQuery, simNodes]);

  const handleNodeClick = useCallback(
    (node: ConceptNode) => {
      onSelectNode(selectedNode === node.id ? null : node.id);
    },
    [onSelectNode, selectedNode],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (dragNodeId) return;
      if (
        e.target === svgRef.current ||
        (e.target as Element).tagName === "rect"
      ) {
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY };
        transformStart.current = { x: viewTransform.x, y: viewTransform.y };
      }
    },
    [dragNodeId, viewTransform],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (dragNodeId) {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const svgX = ((e.clientX - rect.left) / rect.width) * width;
        const svgY = ((e.clientY - rect.top) / rect.height) * height;
        const graphX = (svgX - viewTransform.x) / viewTransform.scale;
        const graphY = (svgY - viewTransform.y) / viewTransform.scale;
        const newX = graphX - dragOffset.current.x;
        const newY = graphY - dragOffset.current.y;

        const simNode = simNodesRef.current.find((n) => n.id === dragNodeId);
        if (simNode) {
          simNode.fx = newX;
          simNode.fy = newY;
        }
        return;
      }
      if (isPanning) {
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;
        onViewTransformChange({
          ...viewTransform,
          x: transformStart.current.x + dx * scaleX,
          y: transformStart.current.y + dy * scaleY,
        });
      }
    },
    [isPanning, dragNodeId, width, height, viewTransform, onViewTransformChange],
  );

  const handleMouseUp = useCallback(() => {
    if (dragNodeId) {
      const simNode = simNodesRef.current.find((n) => n.id === dragNodeId);
      if (simNode) {
        simNode.fx = null;
        simNode.fy = null;
      }
      if (simRef.current) {
        simRef.current.alphaTarget(0);
      }
    }
    setIsPanning(false);
    setDragNodeId(null);
  }, [dragNodeId]);

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * width;
      const mouseY = ((e.clientY - rect.top) / rect.height) * height;
      const scaleFactor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      const newScale = clamp(viewTransform.scale * scaleFactor, MIN_ZOOM, MAX_ZOOM);
      const ratio = newScale / viewTransform.scale;
      onViewTransformChange({
        scale: newScale,
        x: mouseX - (mouseX - viewTransform.x) * ratio,
        y: mouseY - (mouseY - viewTransform.y) * ratio,
      });
    },
    [viewTransform, width, height, onViewTransformChange],
  );

  const handleNodeDragStart = useCallback(
    (e: React.MouseEvent, node: ConceptNode) => {
      e.stopPropagation();
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * width;
      const svgY = ((e.clientY - rect.top) / rect.height) * height;
      const graphX = (svgX - viewTransform.x) / viewTransform.scale;
      const graphY = (svgY - viewTransform.y) / viewTransform.scale;
      dragOffset.current = { x: graphX - node.x!, y: graphY - node.y! };
      setDragNodeId(node.id);

      if (simRef.current) {
        simRef.current.alphaTarget(0.3).restart();
      }
    },
    [viewTransform, width, height],
  );

  // ── Highlight logic ─────────────────────────────────────
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
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full select-none"
      style={{
        background: "#0a0e27",
        cursor: isPanning ? "grabbing" : dragNodeId ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <defs>
        <filter id="node-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="node-glow-strong" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x={0} y={0} width={width} height={height} fill="transparent" />

      <g
        transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.scale})`}
      >
        {/* ── Edges ─────────────────────────────────────── */}
        {filteredEdges.map((edge) => {
          const sourceNode = nodeMap.get(edge.source);
          const targetNode = nodeMap.get(edge.target);
          if (!sourceNode || !targetNode) return null;

          const edgeKey = `${edge.source}-${edge.target}`;
          const isHighlighted = connectedEdgeKeys.size > 0 && connectedEdgeKeys.has(edgeKey);
          const isDimmed = connectedEdgeKeys.size > 0 && !isHighlighted;

          const edgeColor = EDGE_COLORS[edge.type];
          const strokeW = 0.5 + edge.strength * 2;

          return (
            <g key={edgeKey}>
              <line
                x1={sourceNode.x!}
                y1={sourceNode.y!}
                x2={targetNode.x!}
                y2={targetNode.y!}
                stroke={isHighlighted ? "#fff" : edgeColor}
                strokeWidth={isHighlighted ? strokeW + 1 : strokeW}
                opacity={isDimmed ? 0.04 : isHighlighted ? 0.7 : 0.25}
                strokeDasharray={isHighlighted ? "5,5" : undefined}
              />
              {/* Hit area */}
              <line
                x1={sourceNode.x!}
                y1={sourceNode.y!}
                x2={targetNode.x!}
                y2={targetNode.y!}
                stroke="transparent"
                strokeWidth={14}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredEdge(edgeKey)}
                onMouseLeave={() => setHoveredEdge(null)}
              />
              {/* Tooltip */}
              {hoveredEdge === edgeKey && (
                <g>
                  <rect
                    x={(sourceNode.x! + targetNode.x!) / 2 - 70}
                    y={(sourceNode.y! + targetNode.y!) / 2 - 14}
                    width={140}
                    height={28}
                    rx={6}
                    fill="#0f1535"
                    stroke="#2a3a5a"
                    strokeWidth={1}
                  />
                  <text
                    x={(sourceNode.x! + targetNode.x!) / 2}
                    y={(sourceNode.y! + targetNode.y!) / 2 + 4}
                    textAnchor="middle"
                    fill="#e0e0e0"
                    fontSize={10}
                    fontFamily="monospace"
                  >
                    {edge.label || EDGE_TYPE_LABELS[edge.type]}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ── Nodes ─────────────────────────────────────── */}
        {simNodes.map((node) => {
          const isHighlighted = connectedNodeIds.size > 0 && connectedNodeIds.has(node.id);
          const isDimmed = connectedNodeIds.size > 0 && !isHighlighted;
          const isSelected = selectedNode === node.id;
          const isHovered = hoveredNode === node.id;
          const isSearchMatch = searchMatches.size > 0 && searchMatches.has(node.id);
          const isSearchDimmed = searchMatches.size > 0 && !isSearchMatch;
          const dim = isDimmed || isSearchDimmed;
          const lit = isHighlighted || isSearchMatch;
          const fillColor = CATEGORY_COLORS[node.category];
          const r = getNodeRadius(node.id);

          // Polymarket style: solid fill, thin stroke
          let stroke = "#2a3a5a";
          let strokeW = 2;
          let filter: string | undefined;

          if (isSelected) {
            stroke = "#ffd93d";
            strokeW = 3;
            filter = "url(#node-glow-strong)";
          } else if (isHovered || lit) {
            stroke = "#4da6ff";
            strokeW = 3;
            filter = "url(#node-glow)";
          }

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              className="cursor-pointer"
              onClick={() => handleNodeClick(node)}
              onMouseDown={(e) => handleNodeDragStart(e, node)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Search pulse */}
              {isSearchMatch && (
                <circle
                  r={r + 6}
                  fill="none"
                  stroke={fillColor}
                  strokeWidth={2}
                  opacity={0.5}
                  filter="url(#node-glow-strong)"
                >
                  <animate
                    attributeName="r"
                    values={`${r + 4};${r + 10};${r + 4}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0.15;0.5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Main filled circle */}
              <circle
                r={r}
                fill={fillColor}
                stroke={stroke}
                strokeWidth={strokeW}
                opacity={dim ? 0.15 : 1}
                filter={filter}
              />

              {/* Label — outside the node, below */}
              <text
                textAnchor="middle"
                dy={r + 14}
                fill={dim ? "#1a2a4a" : "#c8d0e0"}
                fontSize={11}
                fontWeight={lit || isSelected ? 600 : 400}
                fontFamily="system-ui, sans-serif"
                style={{ pointerEvents: "none" }}
              >
                {node.label.length > 18
                  ? node.label.slice(0, 17) + "\u2026"
                  : node.label}
              </text>
            </g>
          );
        })}
      </g>

      {/* Hint text */}
      <text
        x={width - 10}
        y={height - 8}
        textAnchor="end"
        fill="#1a2a4a"
        fontSize={9}
        fontFamily="monospace"
      >
        scroll to zoom · drag to pan · drag nodes to reposition
      </text>
    </svg>
  );
}
