import Link from "next/link";
import { BookOpen } from "lucide-react";

/**
 * Empty library focal panel — two-column glass card.
 *
 * LEFT (per brief): atmospheric scene — stacked books + small plant +
 * desk light, **flush-left, bleeding into the panel via a mask-gradient
 * fade**. NOT a harsh rectangular image block.
 *
 * RIGHT: editorial copy ("Your library is empty.") + body + emerald
 * "Browse books" CTA.
 *
 * Pure Server Component; the scene is composed entirely in CSS+SVG
 * (no image asset needed).
 */
export function LibraryEmptyPanel() {
  return (
    <section className="mx-auto mt-8 max-w-[1320px] px-4 sm:px-6">
      <div className="home-glass relative overflow-hidden rounded-[36px]">
        {/* Top emerald edge line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
        />

        <div className="relative grid min-h-[280px] gap-0 lg:grid-cols-[1.1fr_1fr]">
          {/* LEFT — scene flush-left with mask-fade */}
          <div className="relative h-[240px] sm:h-[300px] lg:h-auto">
            <StackedBooksAndPlantScene />
          </div>

          {/* RIGHT — editorial CTA */}
          <div className="relative z-10 flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            <h2 className="font-serif text-[26px] font-medium leading-tight tracking-tight text-[#e6e6e0] sm:text-[32px]">
              Your library is empty.
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#a7a7a0]">
              Once you buy a book, it appears here — yours to re-download
              anytime, no extra charge.
            </p>
            <Link
              href="/books"
              className="home-cta-primary mt-7 inline-flex h-11 w-fit items-center gap-2 rounded-full px-6 text-sm font-semibold tracking-tight"
            >
              <BookOpen aria-hidden className="h-4 w-4" />
              <span>Browse books</span>
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene — stacked books + small plant + warm desk light, mask-faded right    */
/* -------------------------------------------------------------------------- */

function StackedBooksAndPlantScene() {
  const spines = [
    { width: 22, color: "#7a3a2b", height: 70 },
    { width: 16, color: "#3a4c3f", height: 84 },
    { width: 26, color: "#5e3826", height: 64 },
    { width: 18, color: "#1f2d24", height: 76 },
    { width: 22, color: "#3b2438", height: 80 },
    { width: 18, color: "#1b2528", height: 72 },
    { width: 20, color: "#6e4f30", height: 88 },
  ];

  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        maskImage:
          "linear-gradient(90deg, black 0%, black 60%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, black 0%, black 60%, transparent 100%)",
      }}
    >
      {/* Background — dark gradient with warm-corner lamp glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 70%, #14241a 0%, #07110b 60%, #050a08 100%)",
        }}
      />

      {/* Warm desk-lamp bloom — top-right of scene */}
      <div
        className="absolute right-[20%] top-[10%] h-[220px] w-[220px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 195, 110, 0.30) 0%, rgba(220, 140, 50, 0.10) 35%, transparent 70%)",
        }}
      />

      {/* Emerald bloom behind the plant */}
      <div
        className="absolute left-[55%] top-[42%] h-[200px] w-[200px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(51, 240, 170, 0.35) 0%, transparent 65%)",
        }}
      />

      {/* The stacked book spines on a shelf */}
      <div className="absolute inset-x-6 bottom-[20%] flex items-end justify-center gap-[3px]">
        {spines.map((s, i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{
              width: `${s.width}px`,
              height: `${s.height}%`,
              background: `linear-gradient(180deg, ${s.color} 0%, ${darken(s.color, 0.35)} 100%)`,
              boxShadow:
                "inset 1px 0 0 rgba(255,255,255,0.08), inset -1px 0 0 rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.5)",
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
        className="absolute inset-x-0 bottom-[16%] h-[5%]"
        style={{
          background:
            "linear-gradient(180deg, #2a1810 0%, #0a0405 100%)",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.5)",
        }}
      />

      {/* Glowing sprout on top of the stack */}
      <svg
        viewBox="0 0 40 50"
        className="absolute left-[52%] top-[34%] h-[110px] w-[90px] -translate-x-1/2"
      >
        <path
          d="M 20 50 L 20 28"
          fill="none"
          stroke="#33f0aa"
          strokeWidth="1.2"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px #33f0aa) drop-shadow(0 0 12px #33f0aa80)" }}
        />
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

      {/* Foreground vignette on left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 50%, transparent 75%)",
        }}
      />
    </div>
  );
}

function darken(hex: string, amount: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
