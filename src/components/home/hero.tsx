import Link from "next/link";

import { HeroEditorialNotes } from "./hero-editorial-notes";
import { TrustRow } from "./trust-row";

/**
 * The hero.
 *
 * ONE LAYER, NOT TWO COLUMNS. The photograph is the ground the whole section
 * stands on — full-bleed, running behind the header — and the type sits on top
 * of it. That is the difference between the old hero and this one: the old
 * layout put a framed picture in a right-hand column, which reads as a website
 * with an illustration on it. This reads as a publisher's table you are looking
 * at.
 *
 * THE BOOKS IN THE PHOTOGRAPH ARE REAL.
 * The Great Book of World Games, Codex Bestiarium, Codex Enigmatica, The Great
 * Book of World Myths and Pencil & Paper — five published titles, every one of
 * them in the catalogue and clickable two sections further down. Nothing here
 * advertises a book that does not exist.
 *
 * THE TYPE IS NEVER IN THE IMAGE. Every word on this section is live HTML:
 * selectable, translatable, searchable, and legible to a screen reader. The
 * photograph carries no lettering at all.
 *
 * THE GRADIENT IS FUNCTIONAL, NOT DECORATIVE. It is what guarantees the
 * headline's contrast against a photograph whose brightness we do not control
 * per-pixel. The image was composed with an empty, very dark left third for
 * exactly this reason, but a gradient that is only a mood would be the wrong
 * thing to rely on.
 *
 * Pure Server Component — no client JS in the hero at all.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* ---------------------------------------------------------------
          The photograph. `<picture>` rather than next/image because the
          desktop and mobile crops are two different pictures, not two sizes
          of one: the phone gets a portrait cut that keeps the books and
          drops the empty left third the headline sits in.
          --------------------------------------------------------------- */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <picture>
          <source
            media="(max-width: 639px)"
            type="image/avif"
            srcSet="/images/homepage/hero-library-still-life-portrait.avif"
          />
          <source
            media="(max-width: 639px)"
            type="image/webp"
            srcSet="/images/homepage/hero-library-still-life-portrait.webp"
          />
          <source
            type="image/avif"
            srcSet="/images/homepage/hero-library-still-life-640.avif 640w, /images/homepage/hero-library-still-life-960.avif 960w, /images/homepage/hero-library-still-life-1280.avif 1280w, /images/homepage/hero-library-still-life-1672.avif 1672w"
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet="/images/homepage/hero-library-still-life-640.webp 640w, /images/homepage/hero-library-still-life-960.webp 960w, /images/homepage/hero-library-still-life-1280.webp 1280w, /images/homepage/hero-library-still-life-1672.webp 1672w"
            sizes="100vw"
          />
          {/*
            Decorative, so `alt=""`: the headline beside it already says what
            this is, and a made-up description of a photograph is noise in a
            screen reader. `fetchPriority="high"` because this is the LCP
            candidate and nothing else on the page should outrank it.
          */}
          <img
            src="/images/homepage/hero-library-still-life-1672.webp"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-[62%_50%] sm:object-[65%_50%]"
          />
        </picture>

        {/*
          THE SCRIMS LIVE INSIDE THE IMAGE WRAPPER, not as `-z-10` siblings of
          the section. As siblings they shared a stacking level with the
          picture and blacked the whole plate out; in here the order is plain
          DOM order over one positioned parent, which is unambiguous and
          survives anyone adding another layer later.
        */}

        {/* Readability. Strong where the type lives, gone by the middle so the
            books keep their own light. This is what guarantees the headline's
            contrast — it is not a mood. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(3,7,5,0.94) 0%, rgba(3,7,5,0.86) 20%, rgba(3,7,5,0.52) 33%, rgba(3,7,5,0.16) 44%, rgba(3,7,5,0) 56%)",
          }}
        />

        {/* Two short strips rather than one full-height gradient: the header
            needs a ground to read against and the section has to hand over to
            the campaign band, but those are the top 150px and the bottom
            200px. A gradient spanning the whole section to solve them dims the
            photograph everywhere in between. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[150px]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(3,7,5,0.72) 0%, rgba(3,7,5,0.28) 55%, rgba(3,7,5,0) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[200px]"
          style={{
            background:
              "linear-gradient(to top, #050705 0%, rgba(5,7,5,0.72) 45%, rgba(5,7,5,0) 100%)",
          }}
        />

        {/* On a phone the type sits under the picture rather than over it, so
            the whole lower half goes dark instead of just the left edge. */}
        <div
          aria-hidden
          className="absolute inset-0 sm:hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgba(3,7,5,0.25) 0%, rgba(3,7,5,0.55) 38%, rgba(3,7,5,0.93) 62%, rgba(5,7,5,0.98) 100%)",
          }}
        />
      </div>

      {/* The editorial marginalia. Anchored to the section rather than to the
          centred text column, so they sit in the photograph's own dark margins
          — at 2000px wide that is the whole point of them. */}
      <HeroEditorialNotes />

      <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-end px-6 pb-12 pt-[52vw] sm:min-h-[92vh] sm:justify-center sm:pb-16 sm:pt-36 lg:min-h-[94vh] lg:pb-20 lg:pt-40">
        <div className="max-w-[620px]">
          {/* Eyebrow — a rule beneath it, not a bordered pill. */}
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#33f0aa] shadow-[0_0_8px_#33f0aa]"
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-fg-mid sm:text-[11px]">
              A Curated Digital Library
            </span>
          </div>
          <div
            aria-hidden
            className="mt-3 h-px w-[min(300px,80%)]"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0) 100%)",
            }}
          />

          {/*
            THE WORDING IS UNCHANGED. The reference says "Books worth keeping."
            and it would have been easy to copy — but the headline is the one
            thing on this page that is Valice Press's rather than the mockup's.
            What changes is the typography: three lines, tighter leading, and
            the accent narrowed to the last line alone instead of the last two,
            so the emphasis lands once.
          */}
          <h1 className="mt-6 font-serif text-[44px] font-medium leading-[0.97] tracking-[-0.03em] text-fg-hi sm:text-[62px] lg:text-[76px] xl:text-[84px]">
            <span className="block">Find it.</span>
            <span className="block">Own it.</span>
            <span
              className="block"
              style={{
                background:
                  "linear-gradient(135deg, #4ff7bb 0%, #33f0aa 45%, #16c784 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Read it anywhere.
            </span>
          </h1>

          <p className="mt-6 max-w-[470px] text-[15px] leading-[1.7] text-fg-mid sm:mt-7 sm:text-[17px]">
            Curated digital editions from an independent press. Buy once,
            download a watermark-free PDF, and read on any device. Yours to
            keep — forever.
          </p>

          {/*
            "Watch Demo" is gone. There is no demo video, and a button that
            promises one is the same class of untruth as a book with an
            invented ASIN. Both CTAs now go somewhere real.
          */}
          <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/books"
              className="valice-cta valice-cta-gold w-full px-7 text-[14px] sm:w-auto"
            >
              Browse the library
              <span aria-hidden className="text-[15px] leading-none">
                →
              </span>
            </Link>
            <Link
              href="/ebooks"
              className="valice-cta valice-cta-gold-ghost w-full px-7 text-[14px] sm:w-auto"
            >
              Explore ebooks
            </Link>
          </div>
        </div>

        {/* Full width, one row, spanning under the photograph rather than
            wrapping inside the text column. It crosses the marble tabletop,
            which is the lightest thing in the frame, so it gets a scrim of its
            own — contrast measured where the background is brightest, not on
            the average. */}
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[-100vw] bottom-[-2rem] top-[-1.25rem]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(3,7,5,0) 0%, rgba(3,7,5,0.72) 38%, rgba(3,7,5,0.86) 100%)",
            }}
          />
          <div className="relative">
            <TrustRow />
          </div>
        </div>
      </div>
    </section>
  );
}
