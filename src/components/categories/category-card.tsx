import { ArrowUpRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

import type { CategoryArtwork } from "./demo-categories";
import { CategoryScene } from "./category-scene";

/**
 * The shape one discovery card needs — assembled by the page from either a
 * real DB category (→ `/categories/[slug]`) or a demo world (→ `/search?q=`).
 * `href` is always a real, internal route — no dead cards.
 */
export interface CategoryCardData {
  key: string;
  name: string;
  tagline: string;
  href: string;
  icon: LucideIcon;
  artwork: CategoryArtwork;
}

/**
 * Genre discovery card — vertical, full-bleed cinematic world (per the
 * reference): the atmospheric `<CategoryScene>` fills the card, a bottom
 * scrim keeps the overlaid title legible, and the info row (icon + name +
 * tagline + arrow) sits along the bottom. Reuses the shared `.home-glass`
 * frame + `.home-card-hover` lift; the scene zooms and the chrome blooms on
 * hover via the `.group`.
 */
export function CategoryCard({ item }: { item: CategoryCardData }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className="group block rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-bright/60"
    >
      <article className="home-card-hover home-glass relative aspect-[5/4] overflow-hidden rounded-[24px]">
        {/* Top emerald edge line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
        />

        {/* Atmospheric scene — slow zoom on hover (light parallax feel) */}
        <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
          <CategoryScene artwork={item.artwork} />
        </div>

        {/* Bottom scrim — legibility for the overlaid title */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
          style={{
            background:
              "linear-gradient(0deg, rgba(5,7,5,0.92) 0%, rgba(5,7,5,0.5) 42%, transparent 100%)",
          }}
        />

        {/* Info row */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end gap-3 p-4 sm:p-5">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-deep/30 bg-emerald-deep/10 text-emerald-bright shadow-[0_0_12px_-2px_rgba(51,240,170,0.45)] backdrop-blur-sm transition-all duration-300 group-hover:border-emerald-bright/50 group-hover:bg-emerald-deep/20 group-hover:shadow-[0_0_18px_-2px_rgba(51,240,170,0.6)]">
            <Icon aria-hidden className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-[18px] font-medium leading-tight text-white transition-colors group-hover:text-emerald-bright sm:text-[20px]">
              {item.name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-white/60">
              {item.tagline}
            </p>
          </div>

          <span
            aria-hidden
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-white/70 backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:border-emerald-bright/50 group-hover:bg-emerald-bright/10 group-hover:text-emerald-bright"
          >
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </span>
        </div>
      </article>
    </Link>
  );
}
