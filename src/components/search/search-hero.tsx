/**
 * Search hero — centered cinematic, same primitives as the other heroes.
 *
 * Per the brief: eyebrow `SEARCH` + tiny pulsing diamond + serif
 * headline "Search the catalog" with "catalog" in emerald gradient. No
 * subtitle on this hero (the input below carries the next intent).
 *
 * Pure Server Component; reuses the `catalog-diamond-pulse` and
 * `catalog-dust-drift` keyframes from globals.css.
 */
export function SearchHero() {
  const dust = [
    { left: "10%", delay: 0, xDrift: "30px" },
    { left: "22%", delay: 3.0, xDrift: "-25px" },
    { left: "36%", delay: 6.4, xDrift: "16px" },
    { left: "50%", delay: 1.6, xDrift: "-14px" },
    { left: "62%", delay: 4.4, xDrift: "22px" },
    { left: "76%", delay: 7.6, xDrift: "-26px" },
    { left: "88%", delay: 2.4, xDrift: "14px" },
  ];

  return (
    <section className="relative overflow-hidden px-6 pb-8 pt-20 text-center sm:pb-10 sm:pt-28">
      {/* Wide radial bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(22, 199, 132, 0.16) 0%, rgba(22, 199, 132, 0.05) 45%, transparent 70%)",
        }}
      />

      {/* Drifting dust */}
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
          Search
        </p>

        {/* Diamond ornament */}
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

        {/* Headline — last word emerald per brief */}
        <h1 className="mt-7 font-serif text-[52px] font-medium leading-[1.05] tracking-[-0.025em] text-[#e6e6e0] sm:text-[64px] lg:text-[72px]">
          Search the{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, #33f0aa 0%, #1ddf8f 60%, #16c784 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            catalog
          </span>
        </h1>
      </div>
    </section>
  );
}
