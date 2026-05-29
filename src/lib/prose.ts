/**
 * Shared `prose` class composition for long-form HTML content.
 *
 * Used by:
 *   - `SampleViewer` (SUB-PR 1.3 — book sample excerpts on book pages)
 *   - The blog post body (SUB-PR 3.2 — markdown posts under `/blog/*`)
 *
 * Centralizing the composition here means every long-form reading surface
 * on the site renders with the same calm, typography-forward voice:
 *   - serif headings (Fraunces) at a calm `medium` weight
 *   - blockquotes lose the default italic and pick up the brand evergreen
 *     left rule
 *   - inline links pick up the evergreen accent
 *   - the reading measure is clamped to `max-w-prose` (≈68ch)
 *
 * Joined into a single string so callers can do
 * `<article className={cn(PROSE_CLASSES, …overrides)} />`.
 */
export const PROSE_CLASSES = [
  "prose prose-lg prose-stone dark:prose-invert",
  "max-w-prose mx-auto",
  "prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight",
  "prose-blockquote:font-serif prose-blockquote:border-l-primary prose-blockquote:not-italic prose-blockquote:text-foreground/90",
  "prose-a:text-primary",
].join(" ");
