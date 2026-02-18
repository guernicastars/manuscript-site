import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ChapterMeta, Chapter, TOCGroup, PartInfo } from "@/types/chapter";
import { PARTS } from "@/types/chapter";
import { processMarkdown } from "./markdown";

const CONTENT_DIR = path.join(process.cwd(), "content");

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) return match[1].replace(/\*\*/g, "");
  return "Untitled";
}

function wordCount(content: string): number {
  return content.split(/\s+/).filter(Boolean).length;
}

function parseChapterNumber(filename: string): string {
  const match = filename.match(/^(\d+|[A-Z])-/);
  return match ? match[1] : "0";
}

function sortKey(meta: ChapterMeta): number {
  const n = meta.number;
  if (n === "A") return 100;
  if (n === "B") return 101;
  // Use part number to disambiguate collisions (e.g., two chapter 19s)
  const partOffset = meta.part ? meta.part.number * 100 : 0;
  return partOffset + parseInt(n, 10);
}

function scanDirectory(dirPath: string, partSlug: string | null): ChapterMeta[] {
  const entries = fs.readdirSync(dirPath);
  const results: ChapterMeta[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isFile() && entry.endsWith(".md")) {
      const raw = fs.readFileSync(fullPath, "utf-8");
      const { content } = matter(raw);
      const slug = entry.replace(/\.md$/, "");
      const wc = wordCount(content);

      results.push({
        slug,
        number: parseChapterNumber(entry),
        title: extractTitle(content),
        part: partSlug ? PARTS[partSlug] ?? null : null,
        wordCount: wc,
        readingTime: Math.ceil(wc / 200),
        filePath: partSlug ? `${partSlug}/${entry}` : entry,
      });
    }
  }

  return results;
}

export function getAllChapterMeta(): ChapterMeta[] {
  const chapters: ChapterMeta[] = [];

  // Top-level files (introduction)
  chapters.push(...scanDirectory(CONTENT_DIR, null));

  // Part directories
  const dirs = fs.readdirSync(CONTENT_DIR).filter((d) => {
    const full = path.join(CONTENT_DIR, d);
    return fs.statSync(full).isDirectory();
  });

  for (const dir of dirs) {
    chapters.push(...scanDirectory(path.join(CONTENT_DIR, dir), dir));
  }

  chapters.sort((a, b) => sortKey(a) - sortKey(b));
  return chapters;
}

export function getTOC(): TOCGroup[] {
  const chapters = getAllChapterMeta();
  const groups: TOCGroup[] = [];
  let currentGroup: TOCGroup | null = null;

  for (const ch of chapters) {
    const groupKey = ch.part?.slug ?? (ch.number === "A" || ch.number === "B" ? "appendices" : "intro");

    if (!currentGroup || getGroupKey(currentGroup) !== groupKey) {
      currentGroup = {
        part: ch.part,
        label: ch.part
          ? ch.part.slug === "appendices"
            ? "Appendices"
            : `Part ${ch.part.number}: ${ch.part.title}`
          : "Introduction",
        chapters: [],
      };
      groups.push(currentGroup);
    }

    currentGroup.chapters.push(ch);
  }

  return groups;
}

function getGroupKey(group: TOCGroup): string {
  return group.part?.slug ?? "intro";
}

export async function getChapter(slug: string): Promise<Chapter | null> {
  const allMeta = getAllChapterMeta();
  const meta = allMeta.find((ch) => ch.slug === slug);
  if (!meta) return null;

  const fullPath = path.join(CONTENT_DIR, meta.filePath);
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { content } = matter(raw);

  // Strip the first # heading since we render it separately
  const bodyContent = content.replace(/^#\s+.+\n+/, "");
  const htmlContent = await processMarkdown(bodyContent);

  return {
    ...meta,
    content: bodyContent,
    htmlContent,
  };
}

export function getAdjacentChapters(
  slug: string
): { prev: ChapterMeta | null; next: ChapterMeta | null } {
  const all = getAllChapterMeta();
  const idx = all.findIndex((ch) => ch.slug === slug);
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
