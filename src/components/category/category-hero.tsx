import type { CategoryPagePosts } from "@/lib/blog";

import { CategoryStats } from "./category-stats";
import { ReadingRoomScene } from "./reading-room-scene";

/**
 * Two-column category hero — atmospheric reading-room scene LEFT (~45%),
 * editorial content RIGHT (~55%) including 4 stats cards beneath the
 * headline.
 *
 * Per the brief: rounded glass hero panel, integrated into the page,
 * NOT a floating image-then-text band. The scene is wrapped in a
 * rounded card with emerald edge glow.
 *
 * Stats use real where possible (article count, avg reading time),
 * decorative for the rest (rating + readers — no analytics pipeline yet).
 */
export function CategoryHero({
  category,
  avgReadingMinutes,
}: {
  category: CategoryPagePosts;
  /** Avg `readingMinutes` across posts in this category. 0 when empty. */
  avgReadingMinutes: number;
}) {
  // Headline last word emerald: split off the last token of the category name.
  const { head, tail } = splitNameForAccent(category.name);

  return (
    <section className="mx-auto mt-6 max-w-[1320px] px-4 sm:mt-10 sm:px-6">
      <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,_45%)_minmax(0,_1fr)] lg:gap-12">
        {/* LEFT — atmospheric reading-room panel */}
        <div
          className="relative aspect-[5/4] w-full overflow-hidden rounded-[32px] border border-white/[0.08] lg:aspect-auto"
          style={{
            boxShadow:
              "0 28px 60px -22px rgba(0,0,0,0.8), 0 0 0 1px rgba(51, 240, 170, 0.05) inset, 0 0 36px -12px rgba(22,199,132,0.35)",
          }}
        >
          {/* Top emerald edge line */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
          />
          <ReadingRoomScene />
        </div>

        {/* RIGHT — editorial content */}
        <div className="flex flex-col">
          {/* Eyebrow */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#33f0aa]">
            Blog Category
          </p>

          {/* Diamond ornament */}
          <div className="relative mt-4 flex h-6 w-6 items-center justify-center">
            <div
              aria-hidden
              className="absolute h-6 w-6 rounded-full opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(51, 240, 170, 0.7) 0%, transparent 70%)",
              }}
            />
            <span
              aria-hidden
              className="catalog-diamond block h-2 w-2 rounded-[1px] bg-[#33f0aa]"
              style={{ transform: "rotate(45deg)" }}
            />
          </div>

          {/* Headline — last word emerald */}
          <h1 className="mt-6 font-serif text-[44px] font-medium leading-[1.05] tracking-[-0.025em] text-[#e6e6e0] sm:text-[56px] lg:text-[62px] xl:text-[68px]">
            {head && <>{head} </>}
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

          {/* Subtitle — pulled from a per-category map; falls back to a
              generic line when an unknown category gets routed here */}
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#a7a7a0] sm:text-[17px]">
            {SUBTITLES[category.slug] ?? DEFAULT_SUBTITLE}
          </p>

          {/* Stats — beneath the subtitle, NOT in a separate section */}
          <div className="mt-8">
            <CategoryStats
              articleCount={category.posts.length}
              avgReadingMinutes={avgReadingMinutes}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* Per-category editorial subtitles — keeps the hero copy on-voice per topic. */
const SUBTITLES: Record<string, string> = {
  "reading-guides":
    "In-depth guides, thoughtful frameworks, and practical advice to help you read better and grow through books.",
  "behind-the-scenes":
    "Decisions behind the storefront, why we made them, and the trade-offs we accepted along the way.",
};
const DEFAULT_SUBTITLE =
  "Curated essays and field notes from the Digital Bookstore editorial desk.";

/** Single-word headline → all emerald. Multi-word → last word emerald. */
function splitNameForAccent(name: string): { head: string; tail: string } {
  const words = name.trim().split(/\s+/);
  if (words.length <= 1) return { head: "", tail: name };
  return {
    head: words.slice(0, -1).join(" "),
    tail: words[words.length - 1],
  };
}
