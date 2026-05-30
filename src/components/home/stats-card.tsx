/**
 * Floating glass stats card — top-right of the hero showcase.
 *
 * Mirrors the reference image: three stats (Books / Authors / Readers)
 * with an avatar stack. Pure Server Component; glass effect via the
 * `.home-glass` utility in globals.css.
 */
export function StatsCard() {
  const stats = [
    { value: "50K+", label: "Books" },
    { value: "10K+", label: "Authors" },
    { value: "25K+", label: "Readers" },
  ];

  return (
    <div className="home-glass home-card-hover absolute right-2 top-6 z-30 hidden w-[200px] rounded-xl p-4 sm:block lg:right-6 lg:top-12 lg:w-[220px]">
      {/* Avatar stack */}
      <div className="flex items-center -space-x-2">
        {[
          "linear-gradient(135deg, #1ddf8f, #0e7f54)",
          "linear-gradient(135deg, #33f0aa, #16c784)",
          "linear-gradient(135deg, #88918a, #5d675f)",
          "linear-gradient(135deg, #16c784, #033620)",
        ].map((bg, i) => (
          <span
            key={i}
            aria-hidden
            className="inline-block h-7 w-7 rounded-full border-2 border-[#07110b]"
            style={{ background: bg }}
          />
        ))}
        <span
          aria-hidden
          className="ml-3 text-[11px] font-medium text-[#a7a7a0]"
        >
          +25K
        </span>
      </div>

      {/* Stats list */}
      <ul className="mt-4 space-y-3">
        {stats.map((stat) => (
          <li
            key={stat.label}
            className="flex items-baseline justify-between border-b border-white/[0.05] pb-2 last:border-0 last:pb-0"
          >
            <span className="font-serif text-xl font-medium text-[#e6e6e0]">
              {stat.value}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#5d675f]">
              {stat.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
