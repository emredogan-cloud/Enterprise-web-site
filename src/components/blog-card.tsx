import Link from "next/link";

import type { BlogPostMeta } from "@/lib/blog";

/**
 * List-item card for the blog index and category-hub pages.
 *
 * Visual hierarchy mirrors a calm magazine TOC, not a product card:
 *   - small overline with date + category chip (the chip is a separate
 *     internal link to the category hub — internal-linking surface)
 *   - serif title (matches BookCard for typographic continuity)
 *   - one-line excerpt
 *
 * The whole card surface is wrapped in a single `<Link>` to the post,
 * with the category chip as a nested `<Link>` that uses
 * `event.stopPropagation()`-equivalent semantics by being a *sibling*
 * anchor — except we can't nest anchors, so the chip is rendered above
 * the card link as a separate, non-overlapping element. The card link
 * itself wraps title + excerpt + "Read more".
 */
export function BlogCard({ post }: { post: BlogPostMeta }) {
  const displayDate = formatDate(post.date);

  return (
    <article className="group">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-muted-foreground">
        <time dateTime={post.date}>{displayDate}</time>
        <span aria-hidden>·</span>
        <Link
          href={`/blog/category/${post.categorySlug}`}
          className="rounded-full border border-border px-2.5 py-0.5 font-medium text-foreground/70 transition-colors hover:border-primary hover:text-primary"
        >
          {post.category}
        </Link>
      </div>

      <Link
        href={`/blog/${post.slug}`}
        className="mt-3 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-md"
      >
        <h2 className="font-serif text-2xl font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h2>
        <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <p className="mt-4 text-sm font-medium text-primary">
          Read more <span aria-hidden>→</span>
        </p>
      </Link>
    </article>
  );
}

/**
 * Render an ISO date string as "May 26, 2026". Server-rendered at SSG
 * time, so the locale is fixed to en-US (matches the rest of the catalog).
 */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
