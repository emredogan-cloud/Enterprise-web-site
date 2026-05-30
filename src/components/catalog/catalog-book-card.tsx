import { Heart, Lock, Star } from "lucide-react";
import Link from "next/link";

import type { DemoBook } from "./demo-books";

/**
 * Catalog book card — premium glass + CSS-rendered cover.
 *
 * Per the reference: large cover dominates the card; title/author/rating/
 * price beneath; absolute top-left "Bestseller / Popular / New" badge for
 * highlighted titles; top-right wishlist button; bottom-right lock icon
 * (ownership cue — once SUB-PR for entitlement-aware UI lands, this can
 * flip to a "✓ Owned" treatment).
 *
 * No client interactivity inside the card itself — hover lift + glow are
 * pure CSS via `.home-card-hover` (reused from the homepage system).
 */
export function CatalogBookCard({ book }: { book: DemoBook }) {
  const priceLabel = `$${(book.priceCents / 100).toFixed(0)}`;

  return (
    <article className="home-card-hover home-glass group relative flex flex-col overflow-hidden rounded-[22px] p-3">
      {/* Issue 4 — the whole card navigates to the product detail page.
          An overlay link keeps the markup valid (the wishlist button stays a
          real, separately-clickable button at a higher z-index) while making
          the entire card a single large click target. */}
      <Link
        href={`/books/${book.slug}`}
        aria-label={`View ${book.title}`}
        className="absolute inset-0 z-[1] rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-bright/50"
      />

      {/* Cover */}
      <div className="relative overflow-hidden rounded-[14px]">
        <div
          className="relative flex aspect-[2/3] flex-col justify-between p-4"
          style={{ background: book.cover.gradient }}
        >
          {/* Corner glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-50"
            style={{
              background: `radial-gradient(circle, ${book.cover.accent}50 0%, transparent 70%)`,
            }}
          />

          {/* Subtle library lines pattern — only on dark covers */}
          {!book.cover.darkText && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent 0, transparent 12px, rgba(255,255,255,0.4) 12px, rgba(255,255,255,0.4) 13px)",
                maskImage:
                  "linear-gradient(180deg, transparent 0%, black 35%, black 70%, transparent 95%)",
              }}
            />
          )}

          {/* Top eyebrow on cover */}
          <span
            className="relative z-10 text-[8px] font-semibold uppercase tracking-[0.2em]"
            style={{
              color: book.cover.darkText
                ? "rgba(0,0,0,0.45)"
                : "rgba(255,255,255,0.45)",
            }}
          >
            {book.category}
          </span>

          {/* Title on cover */}
          <h3
            className="relative z-10 font-serif text-[20px] font-medium leading-[1.05] tracking-tight"
            style={{
              color: book.cover.darkText ? "#1a1612" : "#ffffff",
            }}
          >
            {book.title}
          </h3>

          {/* Right edge highlight — page thickness illusion */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-[2px] bottom-[2px] w-[2px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.14) 100%)",
            }}
          />
        </div>

        {/* Floating badge */}
        {book.badge && <BadgePill {...book.badge} />}

        {/* Wishlist button — top-right */}
        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute right-2 top-2 z-[2] flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.12] bg-black/40 text-white/70 backdrop-blur-md transition-all hover:border-emerald-bright/50 hover:text-emerald-bright hover:shadow-[0_0_14px_rgba(51,240,170,0.45)]"
        >
          <Heart className="h-3.5 w-3.5" aria-hidden />
        </button>

        {/* Lock icon — bottom-right — ownership cue */}
        <span
          aria-hidden
          title="Locked — buy to unlock"
          className="absolute bottom-2 right-2 z-[2] flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-black/40 text-white/40 backdrop-blur-md"
        >
          <Lock className="h-3 w-3" />
        </span>
      </div>

      {/* Meta */}
      <div className="mt-4 flex flex-1 flex-col gap-1 px-1 pb-1">
        <h4 className="line-clamp-2 font-serif text-[15px] font-medium leading-snug text-fg-hi transition-colors group-hover:text-emerald-bright">
          {book.title}
        </h4>
        <p className="text-xs text-fg-soft">{book.author}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center gap-1 text-xs text-fg-mid">
            <Star
              aria-hidden
              className="h-3 w-3 fill-[#f4c44b] text-[#f4c44b]"
            />
            <span className="tabular-nums">{book.rating.toFixed(1)}</span>
          </div>
          <span className="font-semibold tabular-nums text-fg-hi">
            {priceLabel}
          </span>
        </div>
      </div>
    </article>
  );
}

function BadgePill({
  label,
  tone,
}: {
  label: string;
  tone: "bestseller" | "popular" | "new";
}) {
  const tones = {
    bestseller: {
      bg: "rgba(22, 199, 132, 0.95)",
      color: "#03281b",
      shadow: "0 4px 12px rgba(22,199,132,0.4)",
    },
    popular: {
      bg: "rgba(94, 156, 245, 0.95)",
      color: "#06182f",
      shadow: "0 4px 12px rgba(94,156,245,0.4)",
    },
    new: {
      bg: "rgba(245, 200, 70, 0.95)",
      color: "#2a1f06",
      shadow: "0 4px 12px rgba(245,200,70,0.35)",
    },
  } as const;
  const t = tones[tone];
  return (
    <span
      className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
      style={{ background: t.bg, color: t.color, boxShadow: t.shadow }}
    >
      {label}
    </span>
  );
}
