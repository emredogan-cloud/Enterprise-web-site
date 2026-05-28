import { cn } from "@/lib/utils";

/**
 * Typography classes — applied on the SampleViewer's <article>.
 *
 * Base: `prose prose-lg prose-stone dark:prose-invert` gives us a warm,
 * stone-toned reading column with sensible dark-mode inversion.
 *
 * Brand overrides (Roadmap §7 — typography-forward, calm-literary):
 *   - headings render in our serif face (Fraunces) at a calm `medium`
 *     weight with tightened tracking — not bold, not theatrical.
 *   - blockquotes use the same serif, lose the default italic (calm tone),
 *     and switch their left rule to the brand `primary` (evergreen accent).
 *   - inline links pick up the accent so they read as deliberate, not noisy.
 *   - the reading measure stays at our custom `max-w-prose` (68ch from
 *     `tailwind.config.ts`).
 */
const PROSE_CLASSES = [
  "prose prose-lg prose-stone dark:prose-invert",
  "max-w-prose mx-auto",
  "prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight",
  "prose-blockquote:font-serif prose-blockquote:border-l-primary prose-blockquote:not-italic prose-blockquote:text-foreground/90",
  "prose-a:text-primary",
];

export interface SampleViewerProps {
  /** HTML string. Rendered into the page DOM via `dangerouslySetInnerHTML`. */
  content: string;
  className?: string;
}

/**
 * Renders a book sample / excerpt as a styled `<article>`.
 *
 * SEO + SSG (Roadmap §13 — "the PDF itself isn't crawlable, so make book
 * pages content-rich in HTML"):
 *   - Server Component. The HTML is injected at SSG/render time so it ships
 *     in the static HTML payload of every book page, indexable by crawlers.
 *   - No client-side fetching, no hydration cost — the sample is in the DOM
 *     the first time the document is parsed.
 *
 * Input-trust policy:
 *   - For SUB-PR 1.3 the only source is our own controlled placeholder
 *     constant; once R2-served samples land, the content originates from a
 *     private bucket we control. If we ever accept user-submitted HTML
 *     (e.g., reviews with markup) we will sanitize before injecting; for
 *     curated catalog samples, the controlled-source assumption holds.
 */
export function SampleViewer({ content, className }: SampleViewerProps) {
  return (
    <article
      className={cn(PROSE_CLASSES, className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
