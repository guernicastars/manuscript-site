import Link from "next/link";
import { FadeIn } from "./FadeIn";
import type { TOCGroup } from "@/types/chapter";

export function TableOfContents({ groups }: { groups: TOCGroup[] }) {
  return (
    <div className="space-y-16 md:space-y-24">
      {groups.map((group, gi) => (
        <FadeIn key={group.label} delay={gi * 0.05}>
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-16">
            {/* Part label */}
            <div className="md:col-span-4">
              <div className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-400 md:sticky md:top-24">
                {group.label}
              </div>
            </div>

            {/* Chapter list */}
            <div className="md:col-span-8">
              <div className="space-y-0">
                {group.chapters.map((ch) => (
                  <Link
                    key={ch.slug}
                    href={`/chapters/${ch.slug}`}
                    className="group flex items-baseline justify-between gap-4 py-3 border-b border-neutral-100 transition-colors hover:border-neutral-300"
                  >
                    <div className="flex items-baseline gap-4 min-w-0">
                      <span className="font-mono text-xs text-neutral-300 tabular-nums flex-shrink-0">
                        {ch.number.padStart(2, "0")}
                      </span>
                      <span className="text-neutral-700 group-hover:text-neutral-900 transition-colors truncate">
                        {ch.title}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-neutral-300 flex-shrink-0">
                      {ch.readingTime} min
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>
      ))}
    </div>
  );
}
