import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  htmlContent: string;
  className?: string;
}

export function MarkdownRenderer({ htmlContent, className }: MarkdownRendererProps) {
  return (
    <article
      className={cn(
        "prose prose-neutral prose-chapter max-w-none",
        // Body text
        "prose-p:text-lg prose-p:leading-relaxed prose-p:font-light prose-p:text-neutral-700",
        // Headings
        "prose-headings:tracking-tight prose-headings:text-neutral-900",
        "prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-medium",
        "prose-h3:text-xl prose-h3:font-medium",
        // Links
        "prose-a:text-neutral-900 prose-a:underline prose-a:underline-offset-4 prose-a:decoration-neutral-300 hover:prose-a:decoration-neutral-900",
        // Emphasis
        "prose-strong:text-neutral-900 prose-strong:font-semibold",
        "prose-em:text-neutral-600",
        // Blockquotes
        "prose-blockquote:border-l-neutral-300 prose-blockquote:text-neutral-600 prose-blockquote:font-light",
        // Lists
        "prose-li:text-lg prose-li:font-light prose-li:text-neutral-700",
        // Code
        "prose-code:text-sm prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none",
        // Tables
        "prose-table:text-sm",
        // Horizontal rules
        "prose-hr:border-neutral-200",
        className
      )}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
