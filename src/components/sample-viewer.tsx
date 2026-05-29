import { PROSE_CLASSES } from "@/lib/prose";
import { cn } from "@/lib/utils";

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
