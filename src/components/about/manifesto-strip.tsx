/**
 * Manifesto strip — the brand-soul moment.
 *
 * Reference treatment: a wide, rounded glass band glowing with soft
 * emerald light, a large quotation mark, and the three-line promise set
 * in big serif. This is the emotional center of the page; everything
 * above earns it and everything below echoes it.
 *
 * Pure Server Component — the glow is static CSS.
 */
export function ManifestoStrip() {
  return (
    <section aria-label="Our promise" className="relative">
      <div className="home-glass relative overflow-hidden rounded-[32px] px-6 py-14 text-center sm:px-12 sm:py-20">
        {/* Top emerald edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/50 to-transparent"
        />

        {/* Centered emerald bloom behind the quote */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(51, 240, 170, 0.12) 0%, rgba(22, 199, 132, 0.05) 40%, transparent 70%)",
          }}
        />

        {/* Quotation glyph — large serif, emerald, glowing */}
        <span
          aria-hidden
          className="relative block font-serif text-[64px] leading-none text-emerald-bright"
          style={{ textShadow: "0 0 22px rgba(51, 240, 170, 0.45)" }}
        >
          &ldquo;
        </span>

        {/* The promise */}
        <blockquote className="relative mx-auto mt-2 max-w-3xl">
          <p
            className="font-serif text-[30px] font-medium leading-[1.18] tracking-[-0.02em] text-fg-hi sm:text-[44px] lg:text-[52px]"
            style={{ textShadow: "0 0 30px rgba(51, 240, 170, 0.15)" }}
          >
            <span className="whitespace-nowrap">Buy once.</span>{" "}
            <span className="whitespace-nowrap">Yours to keep.</span>{" "}
            <span className="whitespace-nowrap home-headline-accent">
              Never locked.
            </span>
          </p>
        </blockquote>

        {/* Supporting line */}
        <p className="relative mx-auto mt-7 max-w-xl text-base leading-relaxed text-fg-mid">
          Those three lines are the brand. The cinematic design, the editorial
          blog, the personal replies — all of it exists to reinforce that one
          promise.
        </p>
      </div>
    </section>
  );
}
