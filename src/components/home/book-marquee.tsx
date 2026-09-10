import Link from "next/link";

import { bookCoverSrc } from "@/lib/asset-map";

/**
 * A shelf that keeps moving.
 *
 * WHY IT IS CSS AND NOT JAVASCRIPT.
 * One `@keyframes` translating one element. No timer per card, no scroll
 * listener, no React state, no re-render — the compositor moves a single
 * transformed layer and the main thread never hears about it. This is a
 * Server Component: the whole section ships as static HTML and hydrates
 * nothing.
 *
 * HOW THE LOOP HIDES ITS SEAM.
 * The track holds the catalogue twice, end to end, and animates from
 * `translateX(-50%)` to `translateX(0)`. At the moment it snaps back, the
 * pixels under the viewport are identical to the pixels that were there a
 * frame earlier, because the second copy is the first copy. There is no jump
 * and no gap to see.
 *
 * WHY IT RUNS LEFT → RIGHT.
 * Asked for, and it is the right choice: a shelf drifting rightwards reads as
 * browsing along a bookcase. Rightward motion means starting at -50% and
 * ending at 0, which is why the animation runs in that direction rather than
 * the more usual 0 → -50%.
 *
 * SPEED. Roughly 34 px/s on desktop — slow enough to read a spine without
 * chasing it, which is the difference between a library and a stock ticker.
 * The duration is derived from the number of books so adding a title does not
 * silently speed the shelf up.
 */
export interface MarqueeBook {
  slug: string;
  title: string;
  authors: string[];
}

/** Card width + gap, in px, at desktop. Used to derive the duration. */
const CARD_ADVANCE = 132 + 18;
const PIXELS_PER_SECOND = 34;

export function BookMarquee({ books }: { books: MarqueeBook[] }) {
  /**
   * A book with no cover in the asset manifest is left off the shelf rather
   * than rendered as a hole. `bookCoverSrc` also returns null for art whose
   * aspect ratio is wrong for a cover, which is the manifest catching a bad
   * file — exactly the case where showing it would look worse than not.
   */
  const shelf = books
    .map((b) => ({
      ...b,
      // The manifest still decides whether a cover exists at all; the shelf
      // just points at the small build of it.
      cover: bookCoverSrc(b.slug)?.replace("/images/books/", "/images/books/thumb/") ?? null,
    }))
    .filter((b): b is MarqueeBook & { cover: string } => Boolean(b.cover));

  // Below three there is nothing to loop; the shelf would just sit there.
  if (shelf.length < 3) return null;

  const seconds = Math.round((shelf.length * CARD_ADVANCE) / PIXELS_PER_SECOND);
  // The duplicate is aria-hidden so a screen reader hears the catalogue once,
  // not twice. Sighted users see one continuous shelf either way.
  const lane = [
    { copy: shelf, hidden: false },
    { copy: shelf, hidden: true },
  ];

  return (
    <section className="relative overflow-hidden py-12 sm:py-16" aria-labelledby="shelf-heading">
      <div className="mx-auto max-w-7xl px-6">
        <h2
          id="shelf-heading"
          className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-bright/70 sm:text-[11px]"
        >
          The shelf
        </h2>
        <p className="mt-2 max-w-[520px] text-[13px] leading-relaxed text-fg-soft sm:text-sm">
          Every book Valice Press publishes, moving past. Pick one up.
        </p>
      </div>

      {/*
        `group` so hover can slow the track. Slow, not stop: a shelf that
        freezes under the cursor feels broken, and pausing outright makes the
        seam findable by parking on it.
      */}
      <div className="marquee group relative mt-8">
        <div
          /* No gap BETWEEN the lanes — each lane carries its own trailing
             gap instead. `translateX(-50%)` is half the track, so a gap
             between the lanes makes the travel half a gap short of one lane
             and the loop drifts by that much every cycle. Measured: 9px. */
          className="marquee-track flex w-max"
          style={{ ["--marquee-duration" as string]: `${seconds}s` }}
        >
          {lane.map((l, li) => (
            <ul
              key={li}
              aria-hidden={l.hidden || undefined}
              className="flex shrink-0 list-none gap-[18px] pe-[18px]"
            >
              {l.copy.map((b) => (
                <li key={`${li}-${b.slug}`} className="shrink-0">
                  <Link
                    href={`/books/${b.slug}`}
                    tabIndex={l.hidden ? -1 : undefined}
                    className="group/card block w-[104px] focus-visible:outline-none sm:w-[132px]"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/[0.07] bg-[#07110b] shadow-[0_12px_28px_-18px_rgba(0,0,0,0.9)] transition-[transform,border-color] duration-300 group-hover/card:-translate-y-1 group-hover/card:border-emerald-bright/30 group-focus-visible/card:ring-2 group-focus-visible/card:ring-[#33f0aa] motion-reduce:transition-none motion-reduce:group-hover/card:translate-y-0">
                      {/*
                        A plain <img> against a pre-built 264px thumbnail,
                        deliberately — not next/image.

                        `next/image` emits a fifteen-entry srcset up to 3840w
                        for every cover and falls back to `src=…&w=3840`. Fifty
                        four of those on one page is fifty four optimiser
                        round-trips for pictures rendered 132px wide, and it
                        locked the renderer up hard enough that screenshots
                        timed out. These are fixed-size thumbnails of local
                        files: one static 2x asset each, 15 KB, is the whole
                        job.
                      */}
                      {/* eslint-disable-next-line @next/next/no-img-element -- see above: fixed-size local thumbnail, next/image is the regression here */}
                      <img
                        src={b.cover}
                        alt={l.hidden ? "" : `${b.title} — cover`}
                        width={264}
                        height={396}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="mt-2.5 line-clamp-2 text-[12px] leading-snug text-fg-mid transition-colors group-hover/card:text-fg-hi sm:text-[13px]">
                      {b.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>

        {/* The shelf runs out of the frame rather than stopping at an edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28"
          style={{ background: "linear-gradient(90deg, #050705 0%, rgba(5,7,5,0) 100%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28"
          style={{ background: "linear-gradient(270deg, #050705 0%, rgba(5,7,5,0) 100%)" }}
        />
      </div>
    </section>
  );
}
