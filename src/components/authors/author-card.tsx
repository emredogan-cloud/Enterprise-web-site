import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";

import { AuthorPortrait } from "./author-portrait";
import type { DemoAuthor } from "./demo-authors";

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
export function AuthorCard({ author }: { author: DemoAuthor }) {
  const isFeatured = author.featured === true;

  return (
    <Link
      href={`/authors/${author.slug}`}
      className={`group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-bright/60 rounded-[22px] ${
        isFeatured ? "" : ""
      }`}
    >
      <article
        className={`home-card-hover home-glass relative overflow-hidden rounded-[22px] ${
          isFeatured
            ? "border-emerald-bright/70 shadow-[0_24px_56px_-20px_rgba(0,0,0,0.7),0_0_30px_-8px_rgba(51,240,170,0.4)]"
            : "border-white/[0.08]"
        }`}
      >
        {/* Portrait */}
        <div className="relative aspect-[3/4] w-full">
          <AuthorPortrait theme={author.portrait} imageSrc={author.portraitSrc} />

          {/* Top-left: follower count pill */}
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-white/[0.12] bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white/85 backdrop-blur-md">
            <Users aria-hidden className="h-2.5 w-2.5" strokeWidth={2.4} />
            {author.followerCount}
          </span>

          {/* Top-right: optional FEATURED badge */}
          {isFeatured && (
            <span
              className="absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
              style={{
                background: "rgba(51, 240, 170, 0.95)",
                color: "#03281b",
                boxShadow: "0 4px 12px rgba(51,240,170,0.4)",
              }}
            >
              Featured
            </span>
          )}

          {/* Optional emerald edge line for featured — adds a touch of
              precision under the border without going gaudy */}
          {isFeatured && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/60 to-transparent"
            />
          )}
        </div>

        {/* Card body */}
        <div className="p-4 sm:p-5">
          {/* Name */}
          <h3 className="font-serif text-[16px] font-medium leading-tight text-fg-hi transition-colors group-hover:text-emerald-bright sm:text-[17px]">
            {author.name}
          </h3>

          {/* Role */}
          <p className="mt-1 text-xs text-fg-soft">{author.role}</p>

          {/* Signature works */}
          <p className="mt-3 line-clamp-1 text-xs text-fg-mid">
            {author.works}
          </p>

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
