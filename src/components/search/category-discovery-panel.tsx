import Link from "next/link";
import { FolderOpen } from "lucide-react";

import { DEMO_GENRES } from "@/components/genres/demo-genres";
import { GenreArtwork } from "@/components/genres/genre-artwork";

/**
 * Right panel — Browse by category.
 *
 * Per the brief: 2×4 grid; each card uses a **centered vertical stack**
 * (icon TOP, title + count CENTERED BELOW with generous gap).
 *
 * Uses the same `<GenreArtwork>` SVG renderer the /genres page uses, so
 * the cinematic iconography is consistent across surfaces. Each card
 * links to the existing `/categories/<slug>` per-category detail page.
 */
export function CategoryDiscoveryPanel() {
  return (
    <div className="home-glass relative overflow-hidden rounded-[28px] p-6 sm:p-7">
      {/* Top emerald edge line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
      />

      {/* Header */}
      <header className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-deep/30 bg-emerald-deep/10 text-emerald-bright shadow-[0_0_12px_-2px_rgba(51,240,170,0.4)]">
          <FolderOpen aria-hidden className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        <h2 className="font-serif text-[18px] font-medium text-fg-hi">
          Browse by category
        </h2>
      </header>

      {/* 2×4 grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DEMO_GENRES.map((g) => (
          <Link
            key={g.slug}
            href={`/categories/${g.slug}`}
            className="group flex flex-col items-center justify-start gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-4 text-center transition-all hover:-translate-y-1 hover:border-emerald-bright/30 hover:bg-white/[0.04] hover:shadow-[0_18px_32px_-16px_rgba(0,0,0,0.6),0_0_22px_-8px_rgba(51,240,170,0.4)]"
          >
            {/* Centered artwork (the brief is explicit on vertical stack) */}
            <div className="scale-75 sm:scale-90">
              <GenreArtwork artwork={g.artwork} />
            </div>

            {/* Title + count CENTERED below, generous gap above */}
            <div className="mt-1">
              <h3 className="font-serif text-[13px] font-medium leading-tight text-fg-hi transition-colors group-hover:text-emerald-bright sm:text-sm">
                {g.name}
              </h3>
              <p className="mt-1 text-[10px] tabular-nums text-fg-soft">
                {g.bookCountLabel}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
