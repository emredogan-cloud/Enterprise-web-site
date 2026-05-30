/**
 * Cart hero — same editorial primitives as the catalog / blog heroes
 * (eyebrow `YOUR CART` + pulsing diamond + serif headline + dust drift),
 * with a `variant` switch driving the headline text and last-word color.
 *
 *   - `variant="empty"`     → "Your cart is empty"        (last word emerald)
 *   - `variant="with-items"`→ "{n} {book/books} in your cart"
 *
 * Pure Server Component; motion comes from the shared keyframes already in
 * `globals.css` (`catalog-diamond-pulse`, `catalog-dust-drift`).
 */
export function CartHero({
  variant,
  itemCount,
}: {
  variant: "empty" | "with-items";
  /** Only consulted when variant === "with-items". */
  itemCount?: number;
}) {
  const dust = [
    { left: "8%", delay: 0, xDrift: "30px" },
    { left: "22%", delay: 3.2, xDrift: "-25px" },
    { left: "36%", delay: 6.8, xDrift: "18px" },
    { left: "52%", delay: 1.6, xDrift: "-12px" },
    { left: "66%", delay: 4.4, xDrift: "22px" },
    { left: "82%", delay: 7.6, xDrift: "-30px" },
    { left: "94%", delay: 2.4, xDrift: "15px" },
  ];

  return (
    <section className="relative overflow-hidden px-6 pb-12 pt-20 text-center sm:pb-16 sm:pt-28">
      {/* Wide radial bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(22, 199, 132, 0.18) 0%, rgba(22, 199, 132, 0.06) 40%, transparent 70%)",
        }}
      />

      {/* Hero dust */}
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
          Your cart
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

        {/* Headline — variant-driven */}
        <h1 className="mt-7 font-serif text-[52px] font-medium leading-[1.05] tracking-[-0.025em] text-[#e6e6e0] sm:text-[64px] lg:text-[72px]">
          {variant === "empty" ? (
            <>
              Your cart is{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #33f0aa 0%, #1ddf8f 60%, #16c784 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                empty
              </span>
            </>
          ) : (
            <>
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #33f0aa 0%, #1ddf8f 60%, #16c784 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {itemCount}
              </span>{" "}
              {(itemCount ?? 0) === 1 ? "book" : "books"} ready
            </>
          )}
        </h1>
      </div>
    </section>
  );
}
