import { BookOpen, Clock, Star, Users } from "lucide-react";

/**
 * Four mini stat cards beneath the category headline.
 *
 * Per the brief: each card uses **horizontal flex** layout —
 * emerald icon LEFT, then vertical text stack RIGHT (number + label).
 * Same family as the library page's `<LibraryStats>` but compact (these
 * cards live INSIDE the hero column rather than as a full row).
 *
 * Real data:
 *   - Articles: post count for this category
 *   - Avg Read: average reading time, expressed in hours w/ one decimal
 *     (e.g. 0.6h for a single 6-min essay; 2.4h for a richer archive)
 *
 * Decorative (no source yet):
 *   - Rating (4.9) — no per-post rating system on the blog
 *   - Readers (3.1k) — no analytics pipeline wired
 * Documented inline so future maintainers know what to swap.
 */
export function CategoryStats({
  articleCount,
  avgReadingMinutes,
}: {
  articleCount: number;
  avgReadingMinutes: number;
}) {
  const avgHours = (avgReadingMinutes / 60).toFixed(1);

  const stats = [
    {
      icon: BookOpen,
      number: String(articleCount),
      label: "Articles",
    },
    {
      icon: Clock,
      number: `${avgHours}h`,
      label: "Avg Read",
    },
    // Decorative — swap when a rating pipeline ships.
    { icon: Star, number: "4.9", label: "Rating" },
    // Decorative — swap when analytics lands.
    { icon: Users, number: "3.1k", label: "Readers" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="home-glass home-card-hover relative overflow-hidden rounded-[18px] p-3.5"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/25 to-transparent"
            />
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[#16c784]/30 bg-[#16c784]/10 text-[#33f0aa] shadow-[0_0_10px_-2px_rgba(51,240,170,0.4)]">
                <Icon aria-hidden className="h-4 w-4" strokeWidth={1.6} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[18px] font-medium leading-none tabular-nums text-[#e6e6e0]">
                  {stat.number}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#88918a]">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
