import Link from "next/link";

import { AssetImage } from "@/components/cinematic/asset-image";
import type { BlogPostMeta } from "@/lib/blog";

import { LibraryScene } from "./library-scene";

/**
 * Article hero — large cinematic panel with library scene backdrop +
 * left-aligned content overlay.
 *
 * Per the brief: rounded ~32px, dark emerald edge glow, content sits
 * ABOVE the image, LEFT-aligned. Meta row at the bottom carries author
 * portrait + name + date + reading time.
 *
 * Reading-time + author display name are derived from the post:
 *   - readingMinutes: computed in `getPostBySlug` (~200 wpm)
 *   - author: defaults to "Eleanor Page" if frontmatter doesn't carry
 *     an author field (the existing markdown corpus is single-voice).
 */
export interface ArticleHeroProps {
  post: BlogPostMeta;
  readingMinutes: number;
  /** Optional author override; defaults to the house byline. */
  authorName?: string;
}

const DEFAULT_AUTHOR = "Eleanor Page";

export function ArticleHero({
  post,
  readingMinutes,
  authorName = DEFAULT_AUTHOR,
}: ArticleHeroProps) {
  // Split headline into "head" + emerald "tail" for the reference's
  // last-phrase accent. Heuristic: emerald-color the last ~2 words so
  // the headline feels designed without manual frontmatter per post.
  const { head, tail } = splitHeadlineForAccent(post.title);

  return (
    <section className="mx-auto mt-6 max-w-[1320px] px-4 sm:mt-8 sm:px-6">
      <div
        className="relative overflow-hidden rounded-[32px] border border-white/[0.08]"
        style={{
          boxShadow:
            "0 32px 80px -24px rgba(0,0,0,0.8), 0 0 0 1px rgba(51, 240, 170, 0.06) inset, 0 0 36px -10px rgba(22, 199, 132, 0.32)",
        }}
      >
        {/* Top emerald edge line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
        />

        {/* Aspect ratio container holds the scene */}
        <div className="relative aspect-[16/9] min-h-[440px] w-full sm:aspect-[18/8] lg:aspect-[21/8]">
          {/* Backdrop — optional real article hero image
              (/images/blog/{slug}.webp), else the cinematic library scene. */}
          <div className="absolute inset-0 z-0">
            <AssetImage
              src={`/images/blog/${post.slug}.webp`}
              alt=""
              fallback={<LibraryScene />}
              sizes="100vw"
              priority
            />
          </div>

          {/* Content overlay — LEFT-aligned */}
          <div className="absolute inset-0 z-20 flex flex-col justify-between p-7 sm:p-12 lg:p-16">
            {/* Top: category eyebrow */}
            <Link
              href={`/blog/category/${post.categorySlug}`}
              className="inline-flex w-fit items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-bright transition-colors hover:text-white"
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-[#33f0aa] shadow-[0_0_8px_#33f0aa]"
              />
              {post.category.toUpperCase()}
            </Link>

            {/* Bottom group: headline + subtitle + author meta */}
            <div className="max-w-3xl">
              <h1 className="font-serif text-[40px] font-medium leading-[1.05] tracking-[-0.022em] text-fg-hi sm:text-[56px] lg:text-[64px] xl:text-[72px]">
                {head}{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #33f0aa 0%, #1ddf8f 60%, #16c784 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {tail}
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-fg-mid sm:text-[17px]">
                {post.excerpt}
              </p>

              {/* Author meta row */}
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-fg-soft sm:gap-x-7">
                {/* Avatar */}
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="inline-block h-9 w-9 rounded-full border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    style={{
                      background:
                        "linear-gradient(135deg, #1ddf8f 0%, #0e7f54 100%)",
                    }}
                  />
                  <span className="text-sm text-fg-hi">
                    By <span className="font-medium">{authorName}</span>
                  </span>
                </div>

                {/* Dot separator */}
                <span aria-hidden className="hidden text-emerald-bright sm:inline">
                  •
                </span>

                {/* Date */}
                <time dateTime={post.date} className="font-medium">
                  {formatLongDate(post.date)}
                </time>

                {/* Dot separator */}
                <span aria-hidden className="hidden text-emerald-bright sm:inline">
                  •
                </span>

                {/* Reading time */}
                <span className="font-medium">{readingMinutes} min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Split a headline into ({head, tail}) so the last ~2 words can be
 * emerald-accented. Words ≤ 2 → whole headline as `tail`; otherwise the
 * last two words become `tail` and the rest is `head`. Honors quoted
 * phrasing reasonably for short editorial titles.
 */
function splitHeadlineForAccent(title: string): { head: string; tail: string } {
  const words = title.trim().split(/\s+/);
  if (words.length <= 2) return { head: "", tail: title };
  const tailWords = words.slice(-2).join(" ");
  const headWords = words.slice(0, -2).join(" ");
  return { head: headWords, tail: tailWords };
}

function formatLongDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
