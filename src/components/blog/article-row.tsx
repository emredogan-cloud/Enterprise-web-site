import Link from "next/link";

import type { BlogPostMeta } from "@/lib/blog";

import { ArticleImage, sceneForSlug } from "./article-image";

/**
 * Editorial article row — luxury magazine layout, NOT a generic blog card.
 *
 * Layout: image LEFT (~46%), content RIGHT (~54%), generous 48px+ gap.
 * Stacks vertically on mobile with image above content.
 *
 * Meta line follows the brief format precisely:
 *   MAY 26, 2026 • READING GUIDES
 * Date is tiny uppercase tracked muted; bullet `•` and category are
 * emerald. The whole row is one wrapping `<Link>` so the entire surface
 * is clickable; the nested category link uses `relative z-10` + an
 * `onClick` stopPropagation idiom isn't needed because we use the same
 * `href` for the outer wrap (clicking either goes to the post).
 *
 * Hover behaviors are pure CSS:
 *   - image: slow zoom via `group-hover:scale-[1.06]` on inner div
 *   - "Read more →" arrow: translate-x via `group-hover:translate-x-1`
 *   - subtle title color shift to emerald
 *
 * Pure Server Component — IntersectionObserver fade-up stagger comes
 * from a `<RevealOnScroll>` wrapper one level up.
 */
export function ArticleRow({ post }: { post: BlogPostMeta }) {
  return (
    <article className="relative">
      <Link
        href={`/blog/${post.slug}`}
        className="group relative grid items-center gap-8 rounded-[28px] p-3 transition-colors sm:grid-cols-[minmax(0,_46%)_minmax(0,_1fr)] sm:gap-12 sm:p-4 lg:gap-14"
      >
        {/* LEFT — cinematic preview image */}
        <div className="relative aspect-[4/3] w-full sm:aspect-[5/4]">
          <ArticleImage scene={sceneForSlug(post.slug)} />
        </div>

        {/* RIGHT — editorial content */}
        <div className="flex flex-col">
          {/* Meta line */}
          <p className="flex flex-wrap items-center gap-x-2 text-[11px] font-semibold uppercase tracking-[0.2em]">
            <time
              dateTime={post.date}
              className="text-fg-soft"
            >
              {formatMetaDate(post.date)}
            </time>
            <span aria-hidden className="text-emerald-bright">
              •
            </span>
            <span className="text-emerald-bright">{post.category}</span>
          </p>

          {/* Title */}
          <h2 className="mt-4 font-serif text-[28px] font-medium leading-[1.15] tracking-[-0.015em] text-fg-hi transition-colors group-hover:text-emerald-bright sm:text-[32px] lg:text-[36px]">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="mt-4 text-pretty text-[15px] leading-[1.65] text-fg-mid sm:text-[16px]">
            {post.excerpt}
          </p>

          {/* Read more */}
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-bright">
            <span>Read more</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}

/** Compact uppercase date for the editorial meta line. */
function formatMetaDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();
}
