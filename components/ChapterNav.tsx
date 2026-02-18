import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ChapterMeta } from "@/types/chapter";

export function ChapterNav({
  prev,
  next,
}: {
  prev: ChapterMeta | null;
  next: ChapterMeta | null;
}) {
  return (
    <nav className="mt-16 pt-8 border-t border-neutral-100 grid grid-cols-2 gap-8">
      <div>
        {prev && (
          <Link
            href={`/chapters/${prev.slug}`}
            className="group flex items-start gap-3 text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mt-1 flex-shrink-0 transition-transform group-hover:-translate-x-1" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                Previous
              </div>
              <div className="text-sm font-medium leading-snug">
                {prev.title}
              </div>
            </div>
          </Link>
        )}
      </div>
      <div className="text-right">
        {next && (
          <Link
            href={`/chapters/${next.slug}`}
            className="group inline-flex items-start gap-3 text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                Next
              </div>
              <div className="text-sm font-medium leading-snug">
                {next.title}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </nav>
  );
}
