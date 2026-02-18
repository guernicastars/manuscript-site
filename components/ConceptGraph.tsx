"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import type { ConceptNode, ConceptEdge, ConceptCategory, EdgeType } from "@/types/graph";
import { CATEGORY_COLORS, CATEGORY_LABELS, EDGE_TYPE_LABELS } from "@/types/graph";

const BASE_NODE_RADIUS = 16;
const MAX_NODE_RADIUS = 32;
const ARROW_SIZE = 6;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;

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
  iterations: number = 300,
): ConceptNode[] {
  // Spread initial positions more — golden-angle spiral for even distribution
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const simNodes = nodes.map((n, i) => {
    const r = Math.sqrt(i / nodes.length) * Math.min(width, height) * 0.42;
    const theta = i * goldenAngle;
    return {
      ...n,
      x: n.x ?? width / 2 + r * Math.cos(theta),
      y: n.y ?? height / 2 + r * Math.sin(theta),
      vx: 0,
      vy: 0,
    };
  });

  const nodeMap = new Map(simNodes.map((n) => [n.id, n]));
  const n = simNodes.length;

  // Optimal spacing — tuned for sparse layout with ~60 nodes
  const area = width * height;
  const k = Math.sqrt(area / Math.max(n, 1)) * 1.4;

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = Math.pow(1 - iter / iterations, 1.5); // faster cooling curve
    const temp = alpha * 8; // temperature for clamping displacement

    // Repulsion — Coulomb-like: every pair pushes apart
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = simNodes[i];
        const b = simNodes[j];
        const dx = a.x! - b.x!;
        const dy = a.y! - b.y!;
        const distSq = dx * dx + dy * dy;
        const dist = Math.max(Math.sqrt(distSq), 0.1);

        // Strong repulsion: k^2 / dist, with minimum distance enforcement
        const repulsion = (k * k) / dist;
        const fx = (dx / dist) * repulsion;
        const fy = (dy / dist) * repulsion;

        a.vx! += fx * 0.35;
        a.vy! += fy * 0.35;
        b.vx! -= fx * 0.35;
        b.vy! -= fy * 0.35;
      }
    }

    // Attraction — Hooke-like: edges pull together, but weakly
    for (const edge of edges) {
      const a = nodeMap.get(edge.source);
      const b = nodeMap.get(edge.target);
      if (!a || !b) continue;
      const dx = b.x! - a.x!;
      const dy = b.y! - a.y!;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);

      // Weaker attraction: dist / k (linear, not quadratic)
      const attraction = dist / k;
      const strength = 0.02 + edge.strength * 0.04; // much weaker than before
      const fx = (dx / dist) * attraction * strength;
      const fy = (dy / dist) * attraction * strength;

      a.vx! += fx;
      a.vy! += fy;
      b.vx! -= fx;
      b.vy! -= fy;
    }

    // Very gentle center gravity — just prevent drift, don't compress
    for (const node of simNodes) {
      const dx = width / 2 - node.x!;
      const dy = height / 2 - node.y!;
      node.vx! += dx * alpha * 0.002;
      node.vy! += dy * alpha * 0.002;
    }

    // Apply velocities with temperature limit + damping
    for (const node of simNodes) {
      node.vx! *= 0.6; // damping
      node.vy! *= 0.6;

      // Clamp displacement to temperature
      const vLen = Math.sqrt(node.vx! * node.vx! + node.vy! * node.vy!);
      if (vLen > temp) {
        node.vx! = (node.vx! / vLen) * temp;
        node.vy! = (node.vy! / vLen) * temp;
      }

      node.x! += node.vx!;
      node.y! += node.vy!;

      // Soft boundary — bounce gently instead of hard clamp
      const pad = 40;
      if (node.x! < pad) { node.x = pad; node.vx! *= -0.3; }
      if (node.x! > width - pad) { node.x = width - pad; node.vx! *= -0.3; }
      if (node.y! < pad) { node.y = pad; node.vy! *= -0.3; }
      if (node.y! > height - pad) { node.y = height - pad; node.vy! *= -0.3; }
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
  width = 1800,
  height = 1200,
}: ConceptGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [simulatedNodes, setSimulatedNodes] = useState<ConceptNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [enabledCategories, setEnabledCategories] = useState<Set<ConceptCategory>>(
    new Set(["thinker", "framework", "concept", "diagnosis", "theological", "crisis"]),
  );
  const [enabledEdgeTypes, setEnabledEdgeTypes] = useState<Set<EdgeType>>(
    new Set(["builds_on", "applies_to", "formalizes", "critiques", "synthesizes"]),
  );

  // Pan + zoom state
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const transformStart = useRef({ x: 0, y: 0 });

  // Drag state
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Animation state
  const [animOffset, setAnimOffset] = useState(0);
  const animRef = useRef<number | null>(null);
  const lastFrameTime = useRef(0);

  // Animate dashed edge flow
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

  // Run simulation on mount or filter change
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
    return BASE_NODE_RADIUS + ((deg / maxDegree) * (MAX_NODE_RADIUS - BASE_NODE_RADIUS));
  }

  const nodeMap = new Map(simulatedNodes.map((n) => [n.id, n]));

  const filteredIds = new Set(simulatedNodes.map((n) => n.id));
  const filteredEdges = edges.filter(
    (e) =>
      filteredIds.has(e.source) &&
      filteredIds.has(e.target) &&
      enabledEdgeTypes.has(e.type),
  );

  // Search highlighting
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const q = searchQuery.toLowerCase();
    return new Set(
      simulatedNodes
        .filter(
          (n) =>
            n.label.toLowerCase().includes(q) ||
            (n.description || "").toLowerCase().includes(q),
        )
        .map((n) => n.id),
    );
  }, [searchQuery, simulatedNodes]);

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

  const handleNodeClick = useCallback((node: ConceptNode) => {
    setSelectedNode((prev) => (prev === node.id ? null : node.id));
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (dragNodeId) return;
      if (e.target === svgRef.current || (e.target as Element).tagName === "rect") {
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
        // Dragging a node
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const svgX =
          ((e.clientX - rect.left) / rect.width) * width;
        const svgY =
          ((e.clientY - rect.top) / rect.height) * height;
        // Convert from screen to graph space
        const graphX = (svgX - viewTransform.x) / viewTransform.scale;
        const graphY = (svgY - viewTransform.y) / viewTransform.scale;
        setSimulatedNodes((prev) =>
          prev.map((n) =>
            n.id === dragNodeId
              ? { ...n, x: graphX - dragOffset.current.x, y: graphY - dragOffset.current.y }
              : n,
          ),
        );
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
        setViewTransform((prev) => ({
          ...prev,
          x: transformStart.current.x + dx * scaleX,
          y: transformStart.current.y + dy * scaleY,
        }));
      }
    },
    [isPanning, dragNodeId, width, height, viewTransform],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragNodeId(null);
  }, []);

  // Zoom handler
  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      // Mouse position in SVG viewBox coordinates
      const mouseX = ((e.clientX - rect.left) / rect.width) * width;
      const mouseY = ((e.clientY - rect.top) / rect.height) * height;

      const scaleFactor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      const newScale = clamp(viewTransform.scale * scaleFactor, MIN_ZOOM, MAX_ZOOM);
      const ratio = newScale / viewTransform.scale;

      setViewTransform((prev) => ({
        scale: newScale,
        x: mouseX - (mouseX - prev.x) * ratio,
        y: mouseY - (mouseY - prev.y) * ratio,
      }));
    },
    [viewTransform, width, height],
  );

  // Node drag start
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

  // Reset view
  const resetView = useCallback(() => {
    setViewTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  return (
    <div className="space-y-3">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts..."
            className="w-full bg-[#111118] border border-[#1e1e2e] rounded-lg px-3 py-1.5 text-xs text-[#e5e7eb] placeholder-[#4b5563] focus:border-[#00d4aa] focus:outline-none transition-colors font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white text-xs"
            >
              ×
            </button>
          )}
          {searchQuery && searchMatches.size > 0 && (
            <span className="absolute right-7 top-1/2 -translate-y-1/2 text-[10px] text-[#00d4aa] font-mono">
              {searchMatches.size}
            </span>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setViewTransform((prev) => ({
                ...prev,
                scale: clamp(prev.scale * 1.3, MIN_ZOOM, MAX_ZOOM),
              }))
            }
            className="bg-[#111118] border border-[#1e1e2e] rounded px-2 py-1 text-xs text-[#6b7280] hover:text-white hover:border-[#2a2a3e] transition-colors"
          >
            +
          </button>
          <button
            onClick={() =>
              setViewTransform((prev) => ({
                ...prev,
                scale: clamp(prev.scale / 1.3, MIN_ZOOM, MAX_ZOOM),
              }))
            }
            className="bg-[#111118] border border-[#1e1e2e] rounded px-2 py-1 text-xs text-[#6b7280] hover:text-white hover:border-[#2a2a3e] transition-colors"
          >
            -
          </button>
          <button
            onClick={resetView}
            className="bg-[#111118] border border-[#1e1e2e] rounded px-2 py-1 text-xs text-[#6b7280] hover:text-white hover:border-[#2a2a3e] transition-colors font-mono"
          >
            Reset
          </button>
          <span className="text-[10px] text-[#4b5563] font-mono ml-1">
            {Math.round(viewTransform.scale * 100)}%
          </span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#6b7280] font-mono text-[10px] uppercase tracking-widest">Nodes</span>
        {(Object.keys(CATEGORY_COLORS) as ConceptCategory[]).map((cat) => {
          const enabled = enabledCategories.has(cat);
          const count = nodes.filter((n) => n.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all ${
                enabled
                  ? "bg-[#1e1e2e] border border-[#2a2a3e]"
                  : "bg-transparent border border-transparent opacity-35 hover:opacity-60"
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              />
              <span className={enabled ? "text-[#e5e7eb]" : "text-[#6b7280]"}>
                {CATEGORY_LABELS[cat]}
              </span>
              <span className="text-[#4b5563]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Edge type filter */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#6b7280] font-mono text-[10px] uppercase tracking-widest">Edges</span>
        {(Object.keys(EDGE_COLORS) as EdgeType[]).map((type) => {
          const enabled = enabledEdgeTypes.has(type);
          const count = edges.filter((e) => e.type === type).length;
          return (
            <button
              key={type}
              onClick={() => toggleEdgeType(type)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all ${
                enabled
                  ? "bg-[#1e1e2e] border border-[#2a2a3e]"
                  : "bg-transparent border border-transparent opacity-35 hover:opacity-60"
              }`}
            >
              <span
                className="inline-block w-4 h-0.5 rounded-full"
                style={{ backgroundColor: EDGE_COLORS[type] }}
              />
              <span className={enabled ? "text-[#e5e7eb]" : "text-[#6b7280]"}>
                {EDGE_TYPE_LABELS[type]}
              </span>
              <span className="text-[#4b5563]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* SVG Graph */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] select-none"
        style={{ maxHeight: "75vh", cursor: isPanning ? "grabbing" : dragNodeId ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          {/* Glow filter */}
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

          {/* Arrow markers */}
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

        {/* Background for pan detection */}
        <rect x={0} y={0} width={width} height={height} fill="transparent" />

        {/* Transform group for pan/zoom */}
        <g transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.scale})`}>
          {/* Edges */}
          {filteredEdges.map((edge) => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);
            if (!sourceNode || !targetNode) return null;

            const edgeKey = `${edge.source}-${edge.target}`;
            const isHighlighted = connectedEdgeKeys.size > 0 && connectedEdgeKeys.has(edgeKey);
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

            const strokeWidth = 1 + edge.strength * 3;
            const dashLength = 6 + edge.strength * 4;

            return (
              <g key={edgeKey}>
                {/* Background line */}
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isHighlighted ? "white" : "#374151"}
                  strokeWidth={isHighlighted ? strokeWidth + 0.5 : strokeWidth}
                  opacity={isDimmed ? 0.04 : isHighlighted ? 0.4 : 0.15}
                  markerEnd={`url(#arrow-${isHighlighted ? "highlight" : edge.type})`}
                />
                {/* Animated flow line */}
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isHighlighted ? "white" : EDGE_COLORS[edge.type]}
                  strokeWidth={Math.max(strokeWidth * 0.7, 1)}
                  strokeDasharray={`${dashLength} ${dashLength * 2}`}
                  strokeDashoffset={-animOffset * 2}
                  opacity={isDimmed ? 0.03 : isHighlighted ? 0.9 : 0.45}
                  className="pointer-events-none"
                />
                {/* Invisible hit area for hover */}
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="transparent"
                  strokeWidth={12}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredEdge(edgeKey)}
                  onMouseLeave={() => setHoveredEdge(null)}
                />
                {/* Edge tooltip */}
                {hoveredEdge === edgeKey && (
                  <g>
                    <rect
                      x={(x1 + x2) / 2 - 60}
                      y={(y1 + y2) / 2 - 14}
                      width={120}
                      height={28}
                      rx={6}
                      fill="#111118"
                      stroke="#2a2a3e"
                      strokeWidth={1}
                    />
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize={9}
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
            const isSearchMatch = searchMatches.size > 0 && searchMatches.has(node.id);
            const isSearchDimmed = searchMatches.size > 0 && !isSearchMatch;
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
                {/* Search match pulse ring */}
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

                {/* Selected ring */}
                {isSelected && (
                  <circle
                    r={r + 6}
                    fill="none"
                    stroke="white"
                    strokeWidth={2}
                    opacity={0.5}
                    filter="url(#glow)"
                  />
                )}

                {/* Outer glow ring */}
                <circle
                  r={r + 3}
                  fill="none"
                  stroke={fillColor}
                  strokeWidth={1.5}
                  opacity={
                    isDimmed || isSearchDimmed
                      ? 0.05
                      : isHighlighted || isSearchMatch
                        ? 0.8
                        : 0.2
                  }
                />

                {/* Main circle */}
                <circle
                  r={r}
                  fill="#0d0d14"
                  stroke={fillColor}
                  strokeWidth={isHighlighted || isSearchMatch ? 2.5 : 1.5}
                  opacity={isDimmed || isSearchDimmed ? 0.15 : 1}
                  filter={isHighlighted || isSearchMatch ? "url(#glow)" : undefined}
                />

                {/* Inner fill */}
                <circle
                  r={r - 2}
                  fill={fillColor}
                  opacity={isDimmed || isSearchDimmed ? 0.03 : isHighlighted ? 0.25 : 0.1}
                />

                {/* Label */}
                <text
                  textAnchor="middle"
                  dy={r < 20 ? 1 : 0}
                  fill={isDimmed || isSearchDimmed ? "#2a2a3e" : "white"}
                  fontSize={r < 20 ? 7 : r < 25 ? 8 : 9}
                  fontWeight={isHighlighted || isSearchMatch ? 600 : 400}
                  fontFamily="system-ui, sans-serif"
                >
                  {node.label.length > 14
                    ? node.label.slice(0, 13) + "\u2026"
                    : node.label}
                </text>

                {/* Category indicator */}
                {r >= 22 && (
                  <text
                    textAnchor="middle"
                    dy={12}
                    fill={fillColor}
                    fontSize={6}
                    fontFamily="monospace"
                    opacity={isDimmed || isSearchDimmed ? 0.1 : 0.5}
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
          fill="#2a2a3e"
          fontSize={9}
          fontFamily="monospace"
        >
          scroll to zoom · drag to pan · drag nodes to reposition
        </text>
      </svg>

      {/* Selected node detail panel */}
      {selectedNode && nodeMap.get(selectedNode) && (
        <SelectedNodePanel
          node={nodeMap.get(selectedNode)!}
          edges={filteredEdges}
          nodeMap={nodeMap}
          getNodeRadius={getNodeRadius}
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
  getNodeRadius: (id: string) => number;
}) {
  const outgoing = edges.filter((e) => e.source === node.id);
  const incoming = edges.filter((e) => e.target === node.id);
  const fillColor = CATEGORY_COLORS[node.category];

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: fillColor, boxShadow: `0 0 8px ${fillColor}60` }}
          />
          <div>
            <h4 className="font-medium text-sm text-[#e5e7eb]">{node.label}</h4>
            {node.description && (
              <p className="text-xs text-[#6b7280] mt-0.5 max-w-xl leading-relaxed">
                {node.description}
              </p>
            )}
          </div>
        </div>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full capitalize flex-shrink-0 font-mono tracking-wider"
          style={{
            backgroundColor: `${fillColor}15`,
            color: fillColor,
            border: `1px solid ${fillColor}30`,
          }}
        >
          {node.category}
        </span>
      </div>

      {/* Chapters */}
      {node.chapters.length > 0 && (
        <div>
          <span className="text-[10px] text-[#6b7280] font-mono uppercase tracking-widest">
            Appears in
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {node.chapters.map((slug) => (
              <Link
                key={slug}
                href={`/chapters/${slug}`}
                className="text-[11px] px-2 py-0.5 rounded bg-[#1a1a24] border border-[#1e1e2e] text-[#6b7280] hover:text-[#00d4aa] hover:border-[#00d4aa40] transition-colors"
              >
                {slug.replace(/^\d+-/, "").replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {outgoing.length > 0 && (
          <div>
            <span className="text-[10px] text-[#6b7280] font-mono uppercase tracking-widest">
              Connects to ({outgoing.length})
            </span>
            <ul className="mt-1.5 space-y-1">
              {outgoing.map((e) => {
                const target = nodeMap.get(e.target);
                return (
                  <li key={`${e.target}-${e.type}`} className="flex items-center gap-2">
                    <span
                      className="w-3 h-0.5 rounded-full inline-block flex-shrink-0"
                      style={{ backgroundColor: EDGE_COLORS[e.type] }}
                    />
                    <span className="text-[#e5e7eb]">{target?.label ?? e.target}</span>
                    <span className="text-[#4b5563]">
                      {e.label || EDGE_TYPE_LABELS[e.type]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {incoming.length > 0 && (
          <div>
            <span className="text-[10px] text-[#6b7280] font-mono uppercase tracking-widest">
              Connected from ({incoming.length})
            </span>
            <ul className="mt-1.5 space-y-1">
              {incoming.map((e) => {
                const source = nodeMap.get(e.source);
                return (
                  <li key={`${e.source}-${e.type}`} className="flex items-center gap-2">
                    <span
                      className="w-3 h-0.5 rounded-full inline-block flex-shrink-0"
                      style={{ backgroundColor: EDGE_COLORS[e.type] }}
                    />
                    <span className="text-[#e5e7eb]">{source?.label ?? e.source}</span>
                    <span className="text-[#4b5563]">
                      {e.label || EDGE_TYPE_LABELS[e.type]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
