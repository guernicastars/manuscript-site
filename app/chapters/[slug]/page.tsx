import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Network, MessageSquare } from "lucide-react";
import { getAllChapterMeta, getChapter, getAdjacentChapters } from "@/lib/chapters";
import { ChapterHeader } from "@/components/ChapterHeader";
import { ChapterNav } from "@/components/ChapterNav";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ChatPanel } from "@/components/ChatPanel";
import { CHAPTER_PROMPTS } from "@/lib/prompts";

export async function generateStaticParams() {
  const chapters = getAllChapterMeta();
  return chapters.map((ch) => ({ slug: ch.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = await getChapter(slug);
  if (!chapter) return {};

  const partPrefix = chapter.part
    ? chapter.part.slug === "appendices"
      ? "Appendix"
      : `Part ${chapter.part.number}`
    : "";

  const title = `${partPrefix ? partPrefix + ": " : ""}${chapter.title}`;
  const description = `Chapter ${chapter.number} of The Republic of AI Agents — ${chapter.readingTime} min read`;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      authors: ["Yevhen Shcherbinin"],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = await getChapter(slug);
  if (!chapter) notFound();

  const { prev, next } = getAdjacentChapters(slug);

  return (
    <>
      <ReadingProgress />

      {/* Fixed top nav */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-4 flex items-center gap-4 bg-white/90 backdrop-blur-sm border-b border-neutral-100">
        <Link
          href="/"
          className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-xs uppercase tracking-widest hidden sm:inline">
            Contents
          </span>
        </Link>
        <div className="h-4 w-px bg-neutral-200" />
        <span className="font-mono text-xs text-neutral-400 truncate flex-1">
          {chapter.title}
        </span>
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <Link
            href="/graph"
            className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-900 transition-colors"
            title="Knowledge Graph"
          >
            <Network className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="font-mono text-[10px] uppercase tracking-widest hidden sm:inline">
              Graph
            </span>
          </Link>
          <Link
            href="/ask"
            className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-900 transition-colors"
            title="Ask Claude"
          >
            <MessageSquare className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="font-mono text-[10px] uppercase tracking-widest hidden sm:inline">
              Ask
            </span>
          </Link>
        </div>
      </nav>

      <main className="min-h-screen bg-white pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          <ChapterHeader chapter={chapter} />
          <MarkdownRenderer htmlContent={chapter.htmlContent} />
          <ChatPanel
            chapterContext={chapter.content.slice(0, 8000)}
            suggestedPrompts={CHAPTER_PROMPTS[slug] ?? []}
          />
          <ChapterNav prev={prev} next={next} />
        </div>
      </main>
    </>
  );
}
