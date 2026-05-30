import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

import { AboutScene } from "./about-scene";

/**
 * About hero — the manifesto statement at the top of `/about`.
 *
 * Two-column, reference-faithful:
 *   LEFT  — "ABOUT" eyebrow, diamond ornament, a large serif headline
 *           ("A bookstore that doesn't lock you out") with the single word
 *           `lock` carrying the emerald gradient *mid-sentence* (which is
 *           why this hero is bespoke rather than `<CinematicHero>`, whose
 *           accent only lands on the trailing word), an editorial
 *           subheadline, and one calm CTA pair (both real routes).
 *   RIGHT — `<AboutScene>` atmospheric artwork (open book + hovering
 *           emerald crystal + lantern), bleeding toward the right edge in
 *           the shared `home-hero-frame`.
 *
 * Tone is manifesto, not sales copy. Pure Server Component.
 */
export function AboutHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_44%)] lg:gap-16">
        {/* LEFT — editorial content */}
        <div className="relative z-10 pt-2 text-center sm:pt-6 lg:text-left">
          {/* Eyebrow */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
            About
          </p>

          {/* Diamond ornament — the shared cinematic micro-detail */}
          <div className="relative mx-auto mt-4 flex h-6 w-6 items-center justify-center lg:mx-0">
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
              className="catalog-diamond block h-2 w-2 rounded-[1px] bg-emerald-bright"
              style={{ transform: "rotate(45deg)" }}
            />
          </div>

          {/* Headline — `lock` is the accented word, mid-sentence */}
          <h1 className="mt-6 font-serif text-[40px] font-medium leading-[1.04] tracking-[-0.025em] text-fg-hi sm:text-[54px] lg:text-[64px] xl:text-[76px]">
            A bookstore that doesn&apos;t{" "}
            <span className="home-headline-accent">lock</span> you out
          </h1>

          {/* Subheadline — manifesto, ~3 lines */}
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-fg-mid sm:text-[17px] lg:mx-0">
            A first-party bookshop for digital books. It exists because every
            other reading platform either rents you the file, locks it to one
            device, or watches what you do with it. We thought there should be
            a better way — so we built it.
          </p>

          {/* CTA pair — both real routes, calm hierarchy */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
            <Link
              href="/books"
              className="home-cta-primary group inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold tracking-tight"
            >
              <BookOpen aria-hidden className="h-4 w-4" strokeWidth={1.9} />
              Explore the books
              <ArrowRight
                aria-hidden
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/blog/category/behind-the-scenes"
              className="home-cta-secondary inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-medium tracking-tight"
            >
              Read our story
            </Link>
          </div>
        </div>

        {/* RIGHT — atmospheric scene. On mobile it's a 5:3 strip below the
            headline, bleeding to the right edge; on desktop it drops the
            fixed aspect and stretches to match the text column's height
            (items-stretch) so the two columns stay balanced — no gaps. */}
        <div className="relative -mr-4 aspect-[5/3] w-full overflow-hidden rounded-l-[32px] border border-white/[0.06] sm:-mr-6 lg:mr-0 lg:aspect-auto lg:min-h-[460px] lg:rounded-[28px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
          />
          <AboutScene />
        </div>
      </div>
    </section>
  );
}
