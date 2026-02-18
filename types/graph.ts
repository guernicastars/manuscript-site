export type ConceptCategory =
  | "thinker"
  | "framework"
  | "concept"
  | "diagnosis"
  | "theological"
  | "crisis";

export type EdgeType =
  | "builds_on"
  | "applies_to"
  | "formalizes"
  | "critiques"
  | "synthesizes";

export interface ConceptNode {
  id: string;
  label: string;
  description?: string;
  category: ConceptCategory;
  chapters: string[]; // slugs of chapters where this concept appears
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface ConceptEdge {
  source: string;
  target: string;
  type: EdgeType;
  strength: number; // 0-1
  label?: string;
}

export const CATEGORY_COLORS: Record<ConceptCategory, string> = {
  thinker: "#6366f1",     // indigo
  framework: "#00d4aa",   // teal
  concept: "#f59e0b",     // amber
  diagnosis: "#ff4466",   // red
  theological: "#a855f7", // purple
  crisis: "#3b82f6",      // blue
};

export const CATEGORY_LABELS: Record<ConceptCategory, string> = {
  thinker: "Thinkers",
  framework: "Frameworks",
  concept: "Concepts",
  diagnosis: "Diagnostic",
  theological: "Theological",
  crisis: "Societal Crises",
};

export const EDGE_TYPE_LABELS: Record<EdgeType, string> = {
  builds_on: "Builds on",
  applies_to: "Applies to",
  formalizes: "Formalizes",
  critiques: "Critiques",
  synthesizes: "Synthesizes",
};
