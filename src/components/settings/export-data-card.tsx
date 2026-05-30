import { Check } from "lucide-react";

import { ExportDataButton } from "@/components/export-data-button";

/**
 * Export your data — 2-column glass card.
 *
 * LEFT: headline, body, checklist of what's included, the `<ExportDataButton>`.
 * RIGHT: atmospheric folder/files illustration (CSS-rendered).
 *
 * The `<ExportDataButton>` (Phase 3.A cinematic chrome) wraps the
 * `exportUserData` server action — wiring is preserved here verbatim;
 * only the surrounding card chrome is new.
 */

const ITEMS: ReadonlyArray<string> = [
  "Profile information",
  "Order history",
  "Library entitlements",
  "Reviews you've written",
  "Reading progress",
];

export function ExportDataCard() {
  return (
    <article className="home-glass relative overflow-hidden rounded-[28px]">
      {/* Top emerald edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
      />

      <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
        {/* LEFT — copy + checklist + CTA */}
        <div className="p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
            Data export
          </p>
          <h2 className="mt-2 font-serif text-[26px] font-medium leading-tight text-fg-hi sm:text-[28px]">
            Export your data
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-fg-mid">
            Download a JSON file with everything we hold about you. Internal
            storage keys are excluded; the file is portable and human-readable.
          </p>

          {/* Checklist */}
          <ul className="mt-6 space-y-2.5">
            {ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-fg-mid"
              >
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-emerald-bright/30 bg-emerald-bright/10 text-emerald-bright shadow-[0_0_6px_-1px_rgba(51,240,170,0.4)]">
                  <Check aria-hidden className="h-3 w-3" strokeWidth={2.4} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* CTA — wraps the existing cinematic ExportDataButton */}
          <div className="mt-7">
            <ExportDataButton />
          </div>
        </div>

        {/* Vertical divider on lg+ */}
        <div
          aria-hidden
          className="pointer-events-none hidden h-full w-px self-stretch bg-gradient-to-b from-transparent via-white/[0.08] to-transparent lg:block"
        />

        {/* RIGHT — folder illustration. Bleeds toward the right edge with a
            soft emerald bloom; on mobile (stacked under the LEFT column) it
            shows as a short atmospheric strip. */}
        <div className="relative h-[180px] overflow-hidden border-t border-white/[0.05] lg:h-auto lg:border-l lg:border-t-0">
          <ExportIllustration />
        </div>
      </div>
    </article>
  );
}

/**
 * Folder/files illustration — atmospheric, not flat icon. Three stacked
 * "documents" inside a glowing folder, with emerald rim light and dust
 * particles.
 */
function ExportIllustration() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Base gradient */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 60% 60%, #0e2419 0%, #07110b 70%, #050a08 100%)",
        }}
      />

      {/* Bloom — emerald spill behind the folder */}
      <div
        aria-hidden
        className="absolute right-[15%] top-[40%] h-[260px] w-[260px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(51, 240, 170, 0.35) 0%, rgba(22, 199, 132, 0.12) 35%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Folder + documents — SVG */}
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="folderFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e2419" />
            <stop offset="100%" stopColor="#050a08" />
          </linearGradient>
          <linearGradient id="folderRim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(51,240,170,0.6)" />
            <stop offset="100%" stopColor="rgba(22,199,132,0.3)" />
          </linearGradient>
          <linearGradient id="docFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2c1f" />
            <stop offset="100%" stopColor="#0a1610" />
          </linearGradient>
        </defs>

        {/* Folder back (tab) */}
        <path
          d="M 50 75 L 80 75 L 90 70 L 150 70 L 150 80 L 50 80 Z"
          fill="url(#folderFace)"
          stroke="url(#folderRim)"
          strokeWidth="0.8"
        />

        {/* Documents — 3 stacked, peeking out */}
        <rect
          x="62"
          y="92"
          width="80"
          height="56"
          rx="3"
          fill="url(#docFace)"
          stroke="rgba(51,240,170,0.25)"
          strokeWidth="0.6"
        />
        {/* Document lines */}
        <line x1="70" y1="103" x2="120" y2="103" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
        <line x1="70" y1="110" x2="115" y2="110" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        <line x1="70" y1="117" x2="125" y2="117" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        <line x1="70" y1="124" x2="105" y2="124" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" />

        <rect
          x="55"
          y="100"
          width="80"
          height="56"
          rx="3"
          fill="url(#docFace)"
          stroke="rgba(51,240,170,0.3)"
          strokeWidth="0.6"
          opacity="0.95"
        />
        <line x1="63" y1="111" x2="113" y2="111" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
        <line x1="63" y1="118" x2="120" y2="118" stroke="rgba(255,255,255,0.14)" strokeWidth="0.8" />
        <line x1="63" y1="125" x2="105" y2="125" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        <line x1="63" y1="132" x2="115" y2="132" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" />

        {/* Front folder face */}
        <path
          d="M 50 80 L 150 80 L 150 150 L 50 150 Z"
          fill="url(#folderFace)"
          stroke="url(#folderRim)"
          strokeWidth="1"
          opacity="0.92"
        />

        {/* Front rim highlight */}
        <line
          x1="50"
          y1="80"
          x2="150"
          y2="80"
          stroke="rgba(51,240,170,0.45)"
          strokeWidth="0.6"
        />

        {/* Inner glow streak on front face */}
        <path
          d="M 60 110 L 140 110"
          stroke="rgba(51,240,170,0.18)"
          strokeWidth="0.5"
        />
      </svg>

      {/* Sparkle particles around the folder */}
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="catalog-dust absolute h-[2px] w-[2px] rounded-full bg-emerald-bright"
          style={
            {
              left: s.left,
              top: s.top,
              animationDelay: `${s.delay}s`,
              boxShadow: "0 0 5px rgba(51, 240, 170, 0.9)",
              ["--dust-x" as string]: s.dustX,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Left edge fade — softens the panel boundary on lg+ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-12 lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(7, 17, 11, 0.7) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

const SPARKLES: ReadonlyArray<{
  left: string;
  top: string;
  delay: string;
  dustX: string;
}> = [
  { left: "30%", top: "30%", delay: "0s", dustX: "10px" },
  { left: "70%", top: "20%", delay: "2s", dustX: "-12px" },
  { left: "80%", top: "55%", delay: "4s", dustX: "8px" },
  { left: "25%", top: "60%", delay: "6s", dustX: "-10px" },
  { left: "60%", top: "75%", delay: "8s", dustX: "12px" },
];
