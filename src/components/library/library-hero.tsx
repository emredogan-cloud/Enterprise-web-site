import { LibraryScene } from "@/components/article/library-scene";

/**
 * Library two-column hero — atmospheric library scene LEFT (~45%),
 * editorial content RIGHT (~55%).
 *
 * The LEFT panel reuses the same cinematic `LibraryScene` the article
 * hero uses — same shared visual primitive, framed as a rounded glass
 * panel here. RIGHT carries eyebrow `YOUR LIBRARY` + diamond + headline
 * "Your **books**" (last word emerald) + 2-line subtitle.
 *
 * Pure Server Component — no JS hydration cost; CSS-only motion via the
 * shared keyframes from `globals.css`.
 */
export function LibraryHero() {
  return (
    <section className="mx-auto mt-6 max-w-[1320px] px-4 sm:mt-10 sm:px-6">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,_45%)_minmax(0,_1fr)] lg:gap-12">
        {/* LEFT — atmospheric library panel */}
        <div
          className="relative aspect-[5/4] w-full overflow-hidden rounded-[32px] border border-white/[0.08]"
          style={{
            boxShadow:
              "0 28px 60px -22px rgba(0,0,0,0.8), 0 0 0 1px rgba(51, 240, 170, 0.05) inset, 0 0 36px -12px rgba(22,199,132,0.35)",
          }}
        >
          {/* Top emerald edge line */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
          />
          <LibraryScene />
        </div>

        {/* RIGHT — editorial content */}
        <div>
          {/* Eyebrow */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#33f0aa]">
            Your library
          </p>

          {/* Diamond ornament */}
          <div className="relative mt-4 flex h-6 w-6 items-center justify-center">
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
              className="catalog-diamond block h-2 w-2 rounded-[1px] bg-[#33f0aa]"
              style={{ transform: "rotate(45deg)" }}
            />
          </div>

          {/* Headline with emerald-gradient "books" */}
          <h1 className="mt-6 font-serif text-[48px] font-medium leading-[1.05] tracking-[-0.025em] text-[#e6e6e0] sm:text-[58px] lg:text-[64px] xl:text-[72px]">
            Your{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #33f0aa 0%, #1ddf8f 60%, #16c784 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              books
            </span>
          </h1>

          {/* Two-line subtitle */}
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#a7a7a0] sm:text-[17px]">
            All the books you own, in one place.
            <br className="hidden sm:block" />
            Read, download, and revisit your favorites anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
