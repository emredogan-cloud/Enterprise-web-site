import Link from "next/link";
import { ArrowUpRight, TrendingUp } from "lucide-react";

import { DEMO_BOOKS } from "@/components/catalog/demo-books";

/**
 * Left panel — Popular searches.
 *
 * Per the brief: header with tiny trending icon + 5 list rows. Each row:
 *   - mini CSS-rendered book cover (LEFT)
 *   - title + author (CENTER)
 *   - emerald search count (RIGHT — strictly accent color `#16c784`)
 *   - circular arrow (FAR RIGHT)
 *
 * No harsh separators between rows — soft glow dividers instead.
 * Clicking a row navigates to `/search?q=<title>`.
 */
export function PopularSearchesPanel() {
  // Pick five hand-curated popular titles + their fake "search counts"
  const popular: { slug: string; title: string; author: string; count: string }[] = [
    { slug: "the-psychology-of-money", title: "The Psychology of Money", author: "Morgan Housel", count: "12.4K" },
    { slug: "1984", title: "1984", author: "George Orwell", count: "9.8K" },
    { slug: "the-silent-patient", title: "The Silent Patient", author: "Alex Michaelides", count: "8.2K" },
    { slug: "rich-dad-poor-dad", title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", count: "7.5K" },
    { slug: "the-midnight-library", title: "The Midnight Library", author: "Matt Haig", count: "6.9K" },
  ];

  // Map titles → demo book cover gradients so the mini covers feel coherent
  const coverFor = (slug: string): { gradient: string; accent: string } => {
    const book = DEMO_BOOKS.find((b) => b.slug === slug);
    return book
      ? { gradient: book.cover.gradient, accent: book.cover.accent }
      : { gradient: "linear-gradient(160deg, #1a3326 0%, #0a1f14 100%)", accent: "#33f0aa" };
  };

  return (
    <div className="home-glass relative overflow-hidden rounded-[28px] p-6 sm:p-7">
      {/* Top emerald edge line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
      />

      {/* Header */}
      <header className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#16c784]/30 bg-[#16c784]/10 text-[#33f0aa] shadow-[0_0_12px_-2px_rgba(51,240,170,0.4)]">
          <TrendingUp aria-hidden className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        <h2 className="font-serif text-[18px] font-medium text-[#e6e6e0]">
          Popular searches
        </h2>
      </header>

      {/* List */}
      <ul className="mt-5">
        {popular.map((p, i) => {
          const cover = coverFor(p.slug);
          return (
            <li key={p.slug}>
              <Link
                href={`/search?q=${encodeURIComponent(p.title)}`}
                className="group flex items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-white/[0.025]"
              >
                {/* Mini cover */}
                <div
                  className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded-md shadow-[0_4px_10px_-4px_rgba(0,0,0,0.6)]"
                  style={{ background: cover.gradient }}
                >
                  {/* Cover corner glow */}
                  <div
                    aria-hidden
                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-60"
                    style={{
                      background: `radial-gradient(circle, ${cover.accent}55 0%, transparent 70%)`,
                    }}
                  />
                  {/* Right-edge highlight */}
                  <div
                    aria-hidden
                    className="absolute right-0 top-[2px] bottom-[2px] w-[1.5px]"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.14) 100%)",
                    }}
                  />
                </div>

                {/* Title + author */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-[15px] font-medium leading-tight text-[#e6e6e0] transition-colors group-hover:text-[#33f0aa]">
                    {p.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-[#88918a]">
                    {p.author}
                  </p>
                </div>

                {/* Emerald search count — explicitly the accent color */}
                <span
                  className="hidden text-xs font-semibold tabular-nums sm:inline-block"
                  style={{ color: "#16c784" }}
                >
                  {p.count} searches
                </span>

                {/* Arrow */}
                <span
                  aria-hidden
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-[#88918a] transition-all group-hover:border-[#33f0aa]/40 group-hover:bg-[#33f0aa]/10 group-hover:text-[#33f0aa]"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
              </Link>

              {/* Soft glow divider — hidden on last row */}
              {i < popular.length - 1 && (
                <div
                  aria-hidden
                  className="pointer-events-none mx-auto h-px w-[92%] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
