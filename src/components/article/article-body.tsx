/**
 * Article body — wraps the rendered markdown HTML in `.cinematic-prose`.
 *
 * Pure Server Component; all typography styling lives in globals.css
 * under `.cinematic-prose` (drop cap on the first paragraph, emerald
 * accents, glass blockquote, etc.). HTML is produced by `marked` at
 * build time and post-processed to inject heading IDs (see
 * `annotateHeadingsAndExtractToc` in `src/lib/blog.ts`).
 *
 * The content is repo-authored (markdown files in `src/content/blog/`),
 * so `dangerouslySetInnerHTML` is safe here — same trust posture as the
 * existing SampleViewer + the original blog detail page.
 */
export function ArticleBody({ contentHtml }: { contentHtml: string }) {
  return (
    <article
      className="cinematic-prose"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}
