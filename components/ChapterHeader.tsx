import type { ChapterMeta } from "@/types/chapter";

export function ChapterHeader({ chapter }: { chapter: ChapterMeta }) {
  return (
    <header className="mb-12 md:mb-16">
      {chapter.part && (
        <div className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
          {chapter.part.slug === "appendices"
            ? "Appendix"
            : `Part ${chapter.part.number}`}
        </div>
      )}
      <h1 className="text-3xl md:text-4xl lg:text-5xl tracking-tight leading-[1.15] text-neutral-900 mb-4">
        {chapter.title}
      </h1>
      <div className="flex items-center gap-4 text-sm text-neutral-400 font-mono">
        <span>{chapter.readingTime} min read</span>
        <span className="text-neutral-200">|</span>
        <span>{chapter.wordCount.toLocaleString()} words</span>
      </div>
    </header>
  );
}
