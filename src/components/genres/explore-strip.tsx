import Link from "next/link";
import { BookOpen, Layers, Sparkles } from "lucide-react";

/**
 * Bottom "Not sure where to start?" + stats strip — large glass panel
 * with a two-part layout.
 *
 *   LEFT — atmospheric scene (stacked books + glowing sprout) flush-left
 *           bleeding into the glass via mask-fade, then editorial copy
 *           and the primary "Browse all books" CTA.
 *   RIGHT — 3 stats (50K+ Books / 120+ Genres / Updated Daily) in a
 *           segmented glass grid.
 *
 * The scene is pure CSS — no image asset needed; it composes from
 * rectangle "book spines" stacked on a shelf with a small SVG sprout
 * silhouette growing out of them, lit by an emerald bloom.
 */
export function ExploreStrip() {
  const stats = [
    { icon: BookOpen, value: "50K+", label: "Books" },
    { icon: Layers, value: "120+", label: "Genres" },
    { icon: Sparkles, value: "Daily", label: "Fresh stories" },
  ];

  return (
    <section className="mx-auto mt-20 max-w-7xl px-6 sm:mt-24">
      <div className="home-glass relative overflow-hidden rounded-[36px] p-0">
        {/* Top emerald edge line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
        />

        <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
          {/* LEFT — atmospheric scene + copy + CTA */}
          <div className="relative flex flex-col justify-center overflow-hidden p-7 sm:p-10">
            {/* Atmospheric scene — flush-left, bleeds via mask fade */}
            <ExploreScene />

            {/* Content sits ABOVE the scene, right side of the panel */}
            <div className="relative z-10 max-w-md ml-auto sm:ml-[42%]">
              <h2 className="font-serif text-[26px] font-medium leading-tight tracking-tight text-[#e6e6e0] sm:text-[30px]">
                Not sure where to start?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#a7a7a0] sm:text-[15px]">
                Browse all books or explore handpicked collections created just
                for you.
              </p>
              <Link
                href="/books"
                className="home-cta-primary mt-6 inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold tracking-tight"
              >
                <span>Browse all books</span>
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Vertical divider between halves on lg+ */}
          <div
            aria-hidden
            className="pointer-events-none hidden h-full w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent lg:absolute lg:left-[58%] lg:top-0 lg:block"
          />

          {/* RIGHT — stats panel */}
          <div className="border-t border-white/[0.05] p-7 sm:p-9 lg:border-l lg:border-t-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#88918a]">
              Explore More
            </p>
            <div className="mt-5 grid gap-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="group flex items-center gap-3.5 rounded-xl border border-white/[0.05] bg-white/[0.015] px-4 py-3 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[#16c784]/30 bg-[#16c784]/10 text-[#33f0aa] transition-shadow group-hover:shadow-[0_0_14px_rgba(51,240,170,0.3)]">
                      <Icon aria-hidden className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-[18px] font-medium leading-none text-[#e6e6e0]">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#88918a]">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* ExploreScene — stacked books + glowing sprout, flush-left, mask-faded      */
/* -------------------------------------------------------------------------- */

function ExploreScene() {
  // Hand-tuned book spines (a small but coherent stack)
  const spines = [
    { width: 18, color: "#7a3a2b", height: 80 },
    { width: 14, color: "#3a4c3f", height: 92 },
    { width: 20, color: "#5e3826", height: 72 },
    { width: 12, color: "#1f2d24", height: 88 },
    { width: 18, color: "#3b2438", height: 84 },
    { width: 14, color: "#1b2528", height: 76 },
    { width: 16, color: "#6e4f30", height: 90 },
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 w-[55%]"
      style={{
        maskImage:
          "linear-gradient(90deg, black 0%, black 55%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, black 0%, black 55%, transparent 100%)",
      }}
    >
      {/* Emerald bloom behind the sprout */}
      <div
        className="absolute left-[55%] top-[35%] h-[260px] w-[260px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(51, 240, 170, 0.32) 0%, transparent 65%)",
        }}
      />

      {/* The shelf — single row of stacked spines, bottom-aligned */}
      <div className="absolute inset-x-4 bottom-[18%] flex items-end justify-center gap-[3px]">
        {spines.map((s, i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{
              width: `${s.width}px`,
              height: `${s.height}%`,
              background: `linear-gradient(180deg, ${s.color} 0%, ${darken(s.color, 0.35)} 100%)`,
              boxShadow:
                "inset 1px 0 0 rgba(255,255,255,0.07), inset -1px 0 0 rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.5)",
            }}
          >
            {i % 3 === 0 && (
              <span
                aria-hidden
                className="mt-2 block h-[2px] w-[60%] rounded-full bg-[#d4a020]/35"
                style={{ marginLeft: "20%" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Shelf surface */}
      <div
        className="absolute inset-x-0 bottom-[14%] h-[6%]"
        style={{
          background:
            "linear-gradient(180deg, #2a1810 0%, #0a0405 100%)",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.5)",
        }}
      />

      {/* Glowing sprout — small SVG plant rising from the stack */}
      <svg
        viewBox="0 0 40 50"
        className="absolute left-[52%] top-[30%] h-[120px] w-[100px] -translate-x-1/2"
      >
        {/* Stem */}
        <path
          d="M 20 50 L 20 28"
          fill="none"
          stroke="#33f0aa"
          strokeWidth="1.2"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px #33f0aa) drop-shadow(0 0 12px #33f0aa80)" }}
        />
        {/* Two leaves */}
        <path
          d="M 20 36 C 14 34 10 28 12 24 C 17 26 21 30 20 36 Z"
          fill="none"
          stroke="#33f0aa"
          strokeWidth="1.2"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px #33f0aa) drop-shadow(0 0 12px #33f0aa80)" }}
        />
        <path
          d="M 20 30 C 26 28 30 22 28 18 C 23 20 19 25 20 30 Z"
          fill="none"
          stroke="#33f0aa"
          strokeWidth="1.2"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px #33f0aa) drop-shadow(0 0 12px #33f0aa80)" }}
        />
      </svg>

      {/* Soft dust drifting up around the scene */}
      <span
        aria-hidden
        className="catalog-dust absolute bottom-0 left-[35%] h-[3px] w-[3px] rounded-full bg-[#33f0aa]"
        style={
          {
            ["--dust-x" as string]: "20px",
            animationDelay: "1s",
            boxShadow: "0 0 6px rgba(51, 240, 170, 0.7)",
            opacity: 0,
          } as React.CSSProperties
        }
      />
      <span
        aria-hidden
        className="catalog-dust absolute bottom-0 left-[60%] h-[3px] w-[3px] rounded-full bg-[#33f0aa]"
        style={
          {
            ["--dust-x" as string]: "-18px",
            animationDelay: "4s",
            boxShadow: "0 0 6px rgba(51, 240, 170, 0.7)",
            opacity: 0,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

/** Darken-by-percent for spine bottom-gradient. */
function darken(hex: string, amount: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
