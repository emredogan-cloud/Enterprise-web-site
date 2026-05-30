import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { DemoGenre } from "./demo-genres";
import { GenreArtwork } from "./genre-artwork";

/**
 * Genre discovery card — horizontal layout per the brief:
 *   - Circular cinematic artwork on the LEFT
 *   - Vertical text stack on the RIGHT (title + book count + description)
 *   - Circular arrow CTA anchored to the absolute BOTTOM-RIGHT
 *
 * Uses the shared `.home-glass` + `.home-card-hover` system so the card
 * inherits the same lift + glow as everything else in the cinematic
 * surface. Wrapping the whole card in a `<Link>` makes the entire glass
 * panel clickable; the arrow is purely visual.
 */
export function GenreCard({ genre }: { genre: DemoGenre }) {
  return (
    <Link
      href={`/categories/${genre.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-bright/60 rounded-[24px]"
    >
      <article className="home-card-hover home-glass relative h-full overflow-hidden rounded-[24px] p-5 sm:p-6">
        <div className="flex gap-5">
          {/* LEFT — artwork */}
          <GenreArtwork artwork={genre.artwork} />

          {/* RIGHT — text stack */}
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-[18px] font-medium leading-tight text-fg-hi transition-colors group-hover:text-emerald-bright sm:text-[20px]">
              {genre.name}
            </h3>
            <p className="mt-1 text-xs font-medium tabular-nums text-fg-soft">
              {genre.bookCountLabel}
            </p>
            <p className="mt-3 line-clamp-2 text-sm leading-snug text-fg-mid">
              {genre.description}
            </p>
          </div>
        </div>

        {/* Bottom-right circular arrow CTA — absolute per the brief */}
        <span
          aria-hidden
          className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] text-fg-mid transition-all group-hover:border-emerald-bright/50 group-hover:bg-emerald-bright/10 group-hover:text-emerald-bright group-hover:shadow-[0_0_16px_rgba(51,240,170,0.4)] sm:bottom-5 sm:right-5"
        >
          <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
        </span>
      </article>
    </Link>
  );
}
