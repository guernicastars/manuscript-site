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
import { CATEGORY_COLORS, CATEGORY_LABELS, EDGE_TYPE_LABELS } from "@/types/graph";

const BASE_NODE_RADIUS = 28;
const MAX_NODE_RADIUS = 52;
const ARROW_SIZE = 10;
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
  const [animOffset, setAnimOffset] = useState(0);
  const animRef = useRef<number | null>(null);
  const lastFrameTime = useRef(0);

  // Keep a ref to the live simulation so drag can reheat it
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  // Keep a ref to simNodes array so the tick callback can read the latest positions
  const simNodesRef = useRef<SimNode[]>([]);

  // Edge flow animation
  useEffect(() => {
    const animate = (time: number) => {
      if (time - lastFrameTime.current > 40) {
        lastFrameTime.current = time;
        setAnimOffset((prev) => (prev + 1) % 60);
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Degree map for node sizing
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
    return BASE_NODE_RADIUS + (deg / maxDegree) * (MAX_NODE_RADIUS - BASE_NODE_RADIUS);
  }

  // ── Live d3-force simulation (same pattern as polymarket market-graph.html) ──
  useEffect(() => {
    if (nodes.length === 0) return;

    // Stop any previous simulation
    if (simRef.current) simRef.current.stop();

    const filtered = nodes.filter((n) => enabledCategories.has(n.category));
    const filteredIds = new Set(filtered.map((n) => n.id));
    const filteredEdges = edges.filter(
      (e) => filteredIds.has(e.source) && filteredIds.has(e.target),
    );

    // Build degree map for collision
    const localDegreeMap = new Map<string, number>();
    for (const node of filtered) localDegreeMap.set(node.id, 0);
    for (const edge of filteredEdges) {
      localDegreeMap.set(edge.source, (localDegreeMap.get(edge.source) ?? 0) + 1);
      localDegreeMap.set(edge.target, (localDegreeMap.get(edge.target) ?? 0) + 1);
    }
    const localMaxDeg = Math.max(...localDegreeMap.values(), 1);

    // All nodes start at center — they'll spring outward
    const newSimNodes: SimNode[] = filtered.map((n) => ({
      ...n,
      x: width / 2,
      y: height / 2,
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
          // Shorter distances = tighter clusters; strong edges pull very close
          .distance((d) => Math.max(60, 180 * (1 - d.weight)))
          // Stronger link force so connected nodes actually cluster
          .strength((d) => 0.3 + d.weight * 0.6),
      )
      .force(
        "charge",
        forceManyBody<SimNode>()
          // Weaker repulsion lets clusters form; unconnected nodes still separate
          .strength(-250)
          // Shorter range — only push away nearby strangers, not the whole graph
          .distanceMax(350),
      )
      .force(
        "center",
        forceCenter<SimNode>(width / 2, height / 2).strength(0.03),
      )
      .force(
        "collision",
        forceCollide<SimNode>()
          .radius((d) => {
            const deg = localDegreeMap.get(d.id) ?? 1;
            const r =
              BASE_NODE_RADIUS +
              (deg / localMaxDeg) * (MAX_NODE_RADIUS - BASE_NODE_RADIUS);
            return r + 8;
          })
          .strength(0.8),
      )
      .alphaDecay(0.018)
      .velocityDecay(0.35)
      .on("tick", () => {
        // Spread a fresh snapshot to React on every tick
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

    return () => {
      simulation.stop();
    };
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

        // Pin the dragged node in the live simulation (like polymarket)
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
    // Release the pinned node so it springs back (like polymarket dragended)
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
      const newScale = clamp(
        viewTransform.scale * scaleFactor,
        MIN_ZOOM,
        MAX_ZOOM,
      );
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

      // Reheat the simulation when dragging (like polymarket dragstarted)
      if (simRef.current) {
        simRef.current.alphaTarget(0.3).restart();
      }
    },
    [viewTransform, width, height],
  );

  // Highlight logic
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
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

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
            <path
              d="M 0 0 L 10 5 L 0 10 z"
              fill={EDGE_COLORS[type]}
              opacity={0.8}
            />
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

      <rect x={0} y={0} width={width} height={height} fill="transparent" />

      <g
        transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.scale})`}
      >
        {/* Edges */}
        {filteredEdges.map((edge) => {
          const sourceNode = nodeMap.get(edge.source);
          const targetNode = nodeMap.get(edge.target);
          if (!sourceNode || !targetNode) return null;

          const edgeKey = `${edge.source}-${edge.target}`;
          const isHighlighted =
            connectedEdgeKeys.size > 0 && connectedEdgeKeys.has(edgeKey);
          const isDimmed = connectedEdgeKeys.size > 0 && !isHighlighted;

          const sourceR = getNodeRadius(edge.source);
          const targetR = getNodeRadius(edge.target);
          const dx = targetNode.x! - sourceNode.x!;
          const dy = targetNode.y! - sourceNode.y!;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const ux = dx / dist;
          const uy = dy / dist;
          const x1 = sourceNode.x! + ux * (sourceR + 2);
          const y1 = sourceNode.y! + uy * (sourceR + 2);
          const x2 = targetNode.x! - ux * (targetR + ARROW_SIZE + 2);
          const y2 = targetNode.y! - uy * (targetR + ARROW_SIZE + 2);
          const strokeWidth = 1 + edge.strength * 4;
          const dashLength = 6 + edge.strength * 4;

          return (
            <g key={edgeKey}>
              {/* Base line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isHighlighted ? "white" : "#374151"}
                strokeWidth={isHighlighted ? strokeWidth + 1 : strokeWidth}
                opacity={isDimmed ? 0.06 : isHighlighted ? 0.5 : 0.2}
                markerEnd={`url(#arrow-${isHighlighted ? "highlight" : edge.type})`}
              />
              {/* Animated flow line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isHighlighted ? "white" : EDGE_COLORS[edge.type]}
                strokeWidth={Math.max(strokeWidth * 0.7, 1)}
                strokeDasharray={`${dashLength} ${dashLength * 2}`}
                strokeDashoffset={-animOffset * 2}
                opacity={isDimmed ? 0.04 : isHighlighted ? 1 : 0.6}
                className="pointer-events-none"
              />
              {/* Hit area */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth={12}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredEdge(edgeKey)}
                onMouseLeave={() => setHoveredEdge(null)}
              />
              {/* Tooltip */}
              {hoveredEdge === edgeKey && (
                <g>
                  <rect
                    x={(x1 + x2) / 2 - 70}
                    y={(y1 + y2) / 2 - 14}
                    width={140}
                    height={28}
                    rx={6}
                    fill="#1e1e2e"
                    stroke="#2a3a5a"
                    strokeWidth={1}
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize={11}
                    fontFamily="monospace"
                  >
                    {edge.label || EDGE_TYPE_LABELS[edge.type]} (
                    {(edge.strength * 100).toFixed(0)}%)
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {simNodes.map((node) => {
          const isHighlighted =
            connectedNodeIds.size > 0 && connectedNodeIds.has(node.id);
          const isDimmed = connectedNodeIds.size > 0 && !isHighlighted;
          const isSelected = selectedNode === node.id;
          const isSearchMatch =
            searchMatches.size > 0 && searchMatches.has(node.id);
          const isSearchDimmed = searchMatches.size > 0 && !isSearchMatch;
          const dim = isDimmed || isSearchDimmed;
          const lit = isHighlighted || isSearchMatch;
          const fillColor = CATEGORY_COLORS[node.category];
          const r = getNodeRadius(node.id);

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
              {/* Selection ring */}
              {isSelected && (
                <circle
                  r={r + 6}
                  fill="none"
                  stroke="white"
                  strokeWidth={2}
                  opacity={0.6}
                />
              )}

              {/* Search pulse ring */}
              {isSearchMatch && (
                <circle
                  r={r + 8}
                  fill="none"
                  stroke={fillColor}
                  strokeWidth={2}
                  opacity={0.6}
                  filter="url(#glow-strong)"
                >
                  <animate
                    attributeName="r"
                    values={`${r + 6};${r + 12};${r + 6}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0.2;0.6"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Outer glow ring */}
              <circle
                r={r + 3}
                fill="none"
                stroke={fillColor}
                strokeWidth={1.5}
                opacity={dim ? 0.05 : lit ? 0.8 : 0.25}
              />

              {/* Main circle */}
              <circle
                r={r}
                fill="#111118"
                stroke={fillColor}
                strokeWidth={lit ? 2.5 : 2}
                opacity={dim ? 0.2 : 1}
                filter={lit ? "url(#glow)" : undefined}
              />

              {/* Inner color fill */}
              <circle
                r={r - 2}
                fill={fillColor}
                opacity={dim ? 0.03 : lit ? 0.2 : 0.12}
              />

              {/* Label */}
              <text
                textAnchor="middle"
                dy={r >= 36 ? -3 : 1}
                fill={dim ? "#2a2a3e" : "white"}
                fontSize={r < 32 ? 10 : r < 40 ? 12 : 13}
                fontWeight={lit ? 600 : 500}
                fontFamily="system-ui, sans-serif"
              >
                {node.label.length > 16
                  ? node.label.slice(0, 15) + "\u2026"
                  : node.label}
              </text>

              {/* Category sublabel */}
              {r >= 32 && (
                <text
                  textAnchor="middle"
                  dy={12}
                  fill={dim ? "#1a1a24" : fillColor}
                  fontSize={9}
                  fontFamily="monospace"
                  opacity={dim ? 0.1 : 0.6}
                >
                  {CATEGORY_LABELS[node.category].toUpperCase()}
                </text>
              )}
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
