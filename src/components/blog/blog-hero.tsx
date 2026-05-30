/**
 * Blog editorial hero — quiet, prestige, minimal-but-premium.
 *
 * Same primitives as the catalog hero (eyebrow + diamond ornament + dust)
 * tuned for editorial publication tone: serif headline with the last word
 * in emerald gradient ("bookstore"), two-line muted subtitle, wider
 * radial bloom behind.
 *
 * Pure Server Component — diamond pulse + dust drift run on CSS keyframes
 * defined in globals.css (`catalog-diamond-pulse`, `catalog-dust-drift`).
 */
export function BlogHero() {
  // Hand-tuned dust positions so the motion looks organic, not deterministic
  const dust = [
    { left: "10%", delay: 0, xDrift: "30px" },
    { left: "22%", delay: 3.2, xDrift: "-25px" },
    { left: "32%", delay: 6.8, xDrift: "18px" },
    { left: "44%", delay: 1.6, xDrift: "-12px" },
    { left: "55%", delay: 4.4, xDrift: "22px" },
    { left: "66%", delay: 7.6, xDrift: "-30px" },
    { left: "78%", delay: 2.4, xDrift: "15px" },
    { left: "90%", delay: 5.2, xDrift: "-18px" },
  ];

  return (
    <section className="relative overflow-hidden px-6 pb-12 pt-20 text-center sm:pb-16 sm:pt-28">
      {/* Wide radial bloom behind everything */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(22, 199, 132, 0.18) 0%, rgba(22, 199, 132, 0.06) 40%, transparent 70%)",
        }}
      />

      {/* Drifting dust particles */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {dust.map((d, i) => (
          <span
            key={i}
            className="catalog-dust absolute bottom-0 block h-[3px] w-[3px] rounded-full bg-[#33f0aa]"
            style={
              {
                left: d.left,
                animationDelay: `${d.delay}s`,
                ["--dust-x" as string]: d.xDrift,
                boxShadow: "0 0 6px rgba(51, 240, 170, 0.7)",
                opacity: 0,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Eyebrow */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#33f0aa]">
          Blog
        </p>

        {/* Diamond ornament — same pulsing primitive as the catalog hero */}
        <div className="relative mx-auto mt-5 flex h-6 w-6 items-center justify-center">
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

        {/* Headline with emerald-gradient "bookstore" */}
        <h1 className="mt-7 font-serif text-[52px] font-medium leading-[1.05] tracking-[-0.025em] text-[#e6e6e0] sm:text-[64px] lg:text-[72px]">
          Notes from the{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, #33f0aa 0%, #1ddf8f 60%, #16c784 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            bookstore
          </span>
        </h1>

        {/* Two-line muted subtitle */}
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#a7a7a0] sm:text-[17px]">
          Decisions behind the storefront, reading guides, and the occasional
          essay. Updated when there is something worth saying.
        </p>
      </div>
    </section>
  );
}
