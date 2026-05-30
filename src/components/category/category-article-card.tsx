import Link from "next/link";

import { ArticleImage, sceneForSlug } from "@/components/blog/article-image";
import type { BlogPostMeta } from "@/lib/blog";

/**
 * Horizontal cinematic article card for the category feed.
 *
 * LEFT (~40%): preview scene (reuses `<ArticleImage>` from the blog
 * index — one source of truth for the warm-library / emerald-portal /
 * dark-shelf primitives).
 *
 * RIGHT (~60%): date+reading-time → emerald category pill → serif
 * headline → muted excerpt → author row → emerald "Read more →".
 *
 * The whole card is wrapped in a single `<Link>` to the post.
 *
 * Pure Server Component. Hover effects (image zoom, arrow translate,
 * card lift) are pure CSS.
 */
export interface CategoryArticleCardProps {
  post: BlogPostMeta;
  readingMinutes: number;
  /** Defaults to the house byline used in blog detail pages. */
  authorName?: string;
}

const DEFAULT_AUTHOR = "Eleanor Page";

export function CategoryArticleCard({
  post,
  readingMinutes,
  authorName = DEFAULT_AUTHOR,
}: CategoryArticleCardProps) {
  return (
    <article>
      <Link
        href={`/blog/${post.slug}`}
        className="home-card-hover home-glass group relative grid items-stretch gap-0 overflow-hidden rounded-[28px] sm:grid-cols-[minmax(0,_40%)_minmax(0,_1fr)]"
      >
        {/* Top emerald edge line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/30 to-transparent"
        />

        {/* LEFT — preview image, fade into card on the right edge */}
        <div className="relative aspect-[5/4] w-full overflow-hidden sm:aspect-auto sm:h-full">
          <ArticleImage scene={sceneForSlug(post.slug)} />
          {/* Right-edge mask fade — softens the boundary into the content side */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-l from-[#0c1813]/85 to-transparent sm:block"
          />
        </div>

        {/* RIGHT — content */}
        <div className="flex flex-col p-6 sm:p-8">
          {/* Date + reading time */}
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#88918a]">
            <time dateTime={post.date}>{formatMetaDate(post.date)}</time>
            <span aria-hidden className="text-[#33f0aa]">•</span>
            <span>{readingMinutes} min read</span>
          </p>

          {/* Emerald category pill */}
          <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#33f0aa]/30 bg-[#33f0aa]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#33f0aa]">
            <span
              aria-hidden
              className="h-1 w-1 rounded-full bg-[#33f0aa] shadow-[0_0_6px_#33f0aa]"
            />
            {post.category}
          </span>

          {/* Headline */}
          <h2 className="mt-4 font-serif text-[24px] font-medium leading-[1.15] tracking-[-0.015em] text-[#e6e6e0] transition-colors group-hover:text-[#33f0aa] sm:text-[28px]">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="mt-3 line-clamp-3 text-[15px] leading-[1.6] text-[#a7a7a0]">
            {post.excerpt}
          </p>

          {/* Bottom row — author LEFT, "Read more" RIGHT */}
          <div className="mt-6 flex items-center justify-between">
            {/* Author */}
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="inline-block h-7 w-7 rounded-full border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                style={{
                  background:
                    "linear-gradient(135deg, #1ddf8f 0%, #0e7f54 100%)",
                }}
              />
              <span className="text-xs text-[#a7a7a0]">{authorName}</span>
            </div>

            {/* Read more → */}
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#33f0aa]">
              Read more
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

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
