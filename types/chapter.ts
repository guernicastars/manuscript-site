export interface PartInfo {
  number: number;
  title: string;
  slug: string;
}

export interface ChapterMeta {
  slug: string;
  number: string; // "00", "01", ... "31", "A", "B"
  title: string;
  part: PartInfo | null;
  wordCount: number;
  readingTime: number; // minutes
  filePath: string;
}

export interface Chapter extends ChapterMeta {
  content: string;
  htmlContent: string;
}

export interface TOCGroup {
  part: PartInfo | null;
  label: string; // "Introduction", "Part 1: Psychology & Mental Health", etc.
  chapters: ChapterMeta[];
}

export const PARTS: Record<string, PartInfo> = {
  "part1-psychology": { number: 1, title: "Psychology & Mental Health", slug: "part1-psychology" },
  "part2-epistemology": { number: 2, title: "Theoretical Framework", slug: "part2-epistemology" },
  "part3-metaphysics": { number: 3, title: "Metaphysics", slug: "part3-metaphysics" },
  "part4-praxis": { number: 4, title: "Praxis", slug: "part4-praxis" },
  "part5-apostolic-agenda": { number: 5, title: "The Apostolic Agenda", slug: "part5-apostolic-agenda" },
  appendices: { number: 6, title: "Appendices", slug: "appendices" },
};
