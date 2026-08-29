import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { AuthorPortrait } from "./author-portrait";
import type { AuthorCardData } from "./author-card-data";

/**
 * Author discovery card — cinematic, collectible, NOT a generic profile.
 *
 * Visual hierarchy from top to bottom:
 *   1. Portrait (large, atmospheric — `<AuthorPortrait>`)
 *   2. Top-left follower count pill (glass with users icon)
 *   3. Top-right optional FEATURED badge (emerald solid)
 *   4. Card body — name (bright serif), role (muted), works (small muted)
 *   5. Bottom row: book count LEFT, circular arrow CTA RIGHT
 *
 * Featured card distinction (per brief — explicit): the card border is a
 * **1px solid emerald** instead of the muted dark border every other
 * card uses. The card also gets a subtle additional bloom.
 *
 * Hover: portrait scales (handled inside <AuthorPortrait>); whole card
 * lifts and gets a glow via `.home-card-hover`.
 */
export function AuthorCard({ author }: { author: AuthorCardData }) {
  return (
    <Link
      href={`/authors/${author.slug}`}
      className="group block rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-bright/60"
    >
      <article className="home-card-hover home-glass relative overflow-hidden rounded-[22px] border-white/[0.08]">
        {/* Portrait */}
        <div className="relative aspect-[3/4] w-full">
          <AuthorPortrait theme={author.portrait} imageSrc={author.portraitSrc} />

        </div>

        {/* Card body */}
        <div className="p-4 sm:p-5">
          {/* Name */}
          <h3 className="font-serif text-[16px] font-medium leading-tight text-fg-hi transition-colors group-hover:text-emerald-bright sm:text-[17px]">
            {author.name}
          </h3>

          {/* Bio — real text from the authors table, or nothing at all.
              An author without a bio yet simply shows their name and
              book count; there is no invented one-liner to fill the gap. */}
          {author.bio && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-fg-mid">
              {author.bio}
            </p>
          )}

          {/* Bottom row — book count LEFT, arrow CTA RIGHT */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-fg-fade">
              {author.bookCount} {author.bookCount === 1 ? "Book" : "Books"}
            </span>
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] text-fg-mid transition-all group-hover:border-emerald-bright/50 group-hover:bg-emerald-bright/10 group-hover:text-emerald-bright group-hover:shadow-[0_0_14px_rgba(51,240,170,0.4)]"
            >
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
