# Manuscript Website — Progress Log

## 2026-02-18: Initial Build Complete

### Phase 1: Scaffolding + Reading Experience (COMPLETE)

**What was built:**
- Next.js 16.1.6 project with App Router, React 19, TypeScript, Tailwind v4
- Geist Sans + Geist Mono fonts (matching Bloomsbury editorial design)
- Dual-mode CSS: light theme (reading pages) + dark theme (graph/ask pages)
- Content pipeline: 35 markdown files processed through unified/remark/rehype with KaTeX for LaTeX math
- All 35 chapters statically generated at build time via `generateStaticParams`

**Files created:**
- `app/layout.tsx` — Root layout with fonts + KaTeX CSS CDN
- `app/globals.css` — Tailwind v4 + Typography plugin, light/dark modes
- `app/page.tsx` — Landing page with hero, CTAs, master Table of Contents
- `app/chapters/[slug]/page.tsx` — Chapter page with reading progress, header, markdown renderer, prev/next nav
- `lib/chapters.ts` — Chapter loading, metadata extraction, ordering, TOC grouping
- `lib/markdown.ts` — unified pipeline: remark-parse → remark-gfm → remark-math → remark-rehype → rehype-katex → rehype-slug → rehype-autolink-headings → rehype-stringify
- `lib/utils.ts` — cn() utility
- `types/chapter.ts` — ChapterMeta, Chapter, TOCGroup, PartInfo, PARTS
- `components/FadeIn.tsx` — Framer Motion scroll-triggered fade animation
- `components/ReadingProgress.tsx` — Framer Motion scroll progress bar
- `components/ChapterHeader.tsx` — Part label, title, reading time
- `components/ChapterNav.tsx` — Previous/next chapter navigation
- `components/MarkdownRenderer.tsx` — Prose-styled article with dangerouslySetInnerHTML
- `components/TableOfContents.tsx` — Grouped ToC with part labels and chapter links

**Design decisions:**
- Copied manuscript to `content/` (not symlinked — Turbopack doesn't support symlinks out of project root)
- KaTeX over MathJax (static HTML at build time, zero client JS for math)
- Tailwind Typography plugin for prose styling
- Editorial design adapted from Bloomsbury website (mono labels, large tracking-tight headings, font-light body)

**Verification:**
- `next build` passes: 42 pages generated (landing + 35 chapters + graph + ask + not-found + api/chat)
- KaTeX renders correctly: 47 katex elements on Appendix A (heavy math chapter)
- All chapter navigation works (prev/next links, ToC links)

---

### Phase 2: Knowledge Graph Visualization (COMPLETE)

**What was built:**
- Interactive force-directed concept graph adapted from Polymarket's CausalGraph component
- 55+ concept nodes across 6 categories (thinkers, frameworks, concepts, diagnosis, theological, crises)
- 70+ edges across 5 relationship types (builds_on, applies_to, formalizes, critiques, synthesizes)
- Category filter toggles, hover highlighting, click-to-select with detail panel
- Selected node panel shows description, category badge, chapter links, connected concepts

**Files created:**
- `types/graph.ts` — ConceptNode, ConceptEdge, CATEGORY_COLORS, EDGE_TYPE_LABELS
- `lib/graph-data.ts` — Hand-curated graph data: 55 nodes, 70 edges
- `components/ConceptGraph.tsx` — Fruchterman-Reingold force simulation (pure SVG, no D3), adapted from Polymarket CausalGraph
- `app/graph/layout.tsx` — Dark mode wrapper
- `app/graph/page.tsx` — Stats cards + ConceptGraph + legend

**Design decisions:**
- Hand-curated graph data (not NLP-extracted) because theological relationships are semantic
- Adapted Polymarket's force simulation directly — it handles 55+ nodes well with 150 iterations
- Dark theme matches Polymarket dashboard palette (#0a0a0f, #00d4aa, #ff4466, #6366f1)
- Category colors: thinker=indigo, framework=teal, concept=amber, diagnosis=red, theological=purple, crisis=blue

---

### Phase 3: Claude Integration (COMPLETE)

**What was built:**
- `/api/chat` route using @anthropic-ai/sdk with Claude Sonnet
- System prompt establishing walled-garden RAG (answers from within manuscript framework)
- ChatPanel component (collapsible on chapter pages, full-page on /ask)
- Per-chapter suggested prompts for key chapters
- Full-page /ask experience with dark theme

**Files created:**
- `app/api/chat/route.ts` — POST handler with Anthropic SDK
- `lib/prompts.ts` — SYSTEM_PROMPT, CHAPTER_PROMPTS, DEFAULT_PROMPTS
- `components/ChatPanel.tsx` — Chat UI with messages, input, loading state, suggested prompts
- `app/ask/page.tsx` — Full-page "Talk to the Book" interface

**Design decisions:**
- Sends chapter context (first 8000 chars) when used from a chapter page
- System prompt includes condensed thesis summary for grounding
- No streaming yet (can be added) — simple request/response for reliability
- Dark theme for /ask page matches graph page aesthetic

---

## Architecture Summary

```
manuscript-site/
├── app/
│   ├── layout.tsx              # Root layout, Geist fonts, KaTeX CSS
│   ├── globals.css             # Dual light/dark theme
│   ├── page.tsx                # Landing: hero + ToC + CTAs
│   ├── chapters/[slug]/
│   │   └── page.tsx            # Chapter reading page (SSG)
│   ├── graph/
│   │   ├── layout.tsx          # Dark mode wrapper
│   │   └── page.tsx            # Knowledge graph visualization
│   ├── ask/
│   │   └── page.tsx            # Full-page Claude chat
│   └── api/chat/
│       └── route.ts            # Claude API proxy
├── components/
│   ├── FadeIn.tsx              # Scroll-triggered fade animation
│   ├── ReadingProgress.tsx     # Scroll progress bar
│   ├── ChapterHeader.tsx       # Chapter title + metadata
│   ├── ChapterNav.tsx          # Prev/next navigation
│   ├── MarkdownRenderer.tsx    # Prose-styled HTML rendering
│   ├── TableOfContents.tsx     # Master ToC grouped by part
│   ├── ConceptGraph.tsx        # Force-directed concept network (SVG)
│   └── ChatPanel.tsx           # Chat UI (collapsible + full-page modes)
├── lib/
│   ├── chapters.ts             # Content pipeline
│   ├── markdown.ts             # Unified markdown processing
│   ├── graph-data.ts           # Concept network data
│   ├── prompts.ts              # Claude system prompt + suggested prompts
│   └── utils.ts                # cn() utility
├── types/
│   ├── chapter.ts              # Chapter/Part types
│   └── graph.ts                # Graph node/edge types
└── content/                    # 35 markdown files (copied from manuscript/)
```

### Phase 4: Polish + SEO (COMPLETE)

**What was built:**
- Open Graph + Twitter Card meta tags on all pages (root layout, chapter pages, graph, ask)
- `app/sitemap.ts` — auto-generated sitemap.xml with all 35 chapter routes + landing/graph/ask
- Cross-navigation links between all three experiences (read ↔ graph ↔ ask)
- Mobile responsiveness: icon-only nav links on mobile (graph/ask icons visible on all pages), responsive padding throughout

**Files created/modified:**
- `app/sitemap.ts` — Next.js native sitemap generation
- `app/layout.tsx` — Added OG tags, Twitter cards, metadataBase, author metadata
- `app/chapters/[slug]/page.tsx` — OG article tags per chapter, cross-nav icons in top bar
- `app/graph/layout.tsx` — OG tags for graph page
- `app/graph/page.tsx` — Cross-link to Ask Claude in nav
- `app/ask/page.tsx` — OG tags, cross-link to Knowledge Graph in nav
- `app/page.tsx` — Mobile-visible nav icons (graph + ask)

**Verification:**
- `next build` passes: 43 pages generated (42 + sitemap.xml)
- All cross-navigation links work between read/graph/ask experiences
- Mobile nav shows icon-only links on small screens, full labels on desktop

---

## Architecture Summary

```
manuscript-site/
├── app/
│   ├── layout.tsx              # Root layout, Geist fonts, KaTeX CSS, OG tags
│   ├── globals.css             # Dual light/dark theme
│   ├── page.tsx                # Landing: hero + ToC + CTAs
│   ├── sitemap.ts              # Auto-generated sitemap.xml
│   ├── chapters/[slug]/
│   │   └── page.tsx            # Chapter reading page (SSG) + OG article tags
│   ├── graph/
│   │   ├── layout.tsx          # Dark mode wrapper + OG tags
│   │   └── page.tsx            # Knowledge graph visualization
│   ├── ask/
│   │   └── page.tsx            # Full-page Claude chat + OG tags
│   └── api/chat/
│       └── route.ts            # Claude API proxy
├── components/
│   ├── FadeIn.tsx              # Scroll-triggered fade animation
│   ├── ReadingProgress.tsx     # Scroll progress bar
│   ├── ChapterHeader.tsx       # Chapter title + metadata
│   ├── ChapterNav.tsx          # Prev/next navigation
│   ├── MarkdownRenderer.tsx    # Prose-styled HTML rendering
│   ├── TableOfContents.tsx     # Master ToC grouped by part
│   ├── ConceptGraph.tsx        # Force-directed concept network (SVG)
│   └── ChatPanel.tsx           # Chat UI (collapsible + full-page modes)
├── lib/
│   ├── chapters.ts             # Content pipeline
│   ├── markdown.ts             # Unified markdown processing
│   ├── graph-data.ts           # Concept network data
│   ├── prompts.ts              # Claude system prompt + suggested prompts
│   └── utils.ts                # cn() utility
├── types/
│   ├── chapter.ts              # Chapter/Part types
│   └── graph.ts                # Graph node/edge types
└── content/                    # 35 markdown files (copied from manuscript/)
```

## Remaining Work

- [ ] Vercel deployment (requires ANTHROPIC_API_KEY environment variable)
- [ ] Custom domain setup
- [ ] OG image generation (dynamic or static)
