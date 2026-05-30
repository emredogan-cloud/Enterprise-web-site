import type { DemoGenre } from "./demo-genres";

/**
 * Circular cinematic artwork for a genre card.
 *
 * Eight SVG-rendered symbols, each switched by `artwork.kind`:
 *   book / planet / plant / king / column / chip / bust / camera
 *
 * Each artwork is composed from three layers:
 *   1. Radial halo bloom (per-genre color)
 *   2. Symbol SVG (also per-genre color, ~50% of viewBox)
 *   3. Subtle inner highlight stroke
 *
 * Hover behavior (driven by the parent `.group` from `<GenreCard>`):
 *   - Whole artwork scales 1.06 with 700ms cubic-bezier
 *   - Halo intensifies slightly via opacity
 */
export function GenreArtwork({ artwork }: { artwork: DemoGenre["artwork"] }) {
  return (
    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full sm:h-[88px] sm:w-[88px]">
      {/* Background gradient */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 40% 35%, ${artwork.bg[0]} 0%, ${artwork.bg[1]} 75%, ${artwork.bg[1]} 100%)`,
        }}
      />

      {/* Inner ring stroke — precise/delicate */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      />

      {/* Halo bloom — intensifies on group hover */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full opacity-80 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 55%, ${artwork.halo} 0%, transparent 65%)`,
        }}
      />

      {/* Symbol — scales on group hover */}
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]">
        <SymbolFor kind={artwork.kind} color={artwork.glow} />
      </div>

      {/* Outer edge glow ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 24px -2px ${artwork.halo}, 0 0 0 1px rgba(255,255,255,0.04)`,
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Symbol switch — each genre's iconic glyph                                  */
/* -------------------------------------------------------------------------- */

function SymbolFor({ kind, color }: { kind: DemoGenre["artwork"]["kind"]; color: string }) {
  const svgProps = {
    viewBox: "0 0 48 48",
    width: 44,
    height: 44,
    fill: "none",
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: {
      filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color}80)`,
    },
  };

  switch (kind) {
    case "book":
      return (
        <svg {...svgProps}>
          {/* Open book — two pages + spine */}
          <path d="M 8 14 C 8 12 10 11 13 11 L 22 12 L 22 38 L 13 37 C 10 37 8 36 8 34 Z" />
          <path d="M 40 14 C 40 12 38 11 35 11 L 26 12 L 26 38 L 35 37 C 38 37 40 36 40 34 Z" />
          <line x1="22" y1="12" x2="22" y2="38" />
          <line x1="26" y1="12" x2="26" y2="38" />
          {/* Text lines */}
          <line x1="12" y1="17" x2="20" y2="17" opacity="0.5" />
          <line x1="12" y1="21" x2="20" y2="21" opacity="0.4" />
          <line x1="28" y1="17" x2="36" y2="17" opacity="0.5" />
          <line x1="28" y1="21" x2="36" y2="21" opacity="0.4" />
        </svg>
      );
    case "planet":
      return (
        <svg {...svgProps}>
          {/* Planet + ring (Saturn-style) */}
          <circle cx="24" cy="24" r="10" />
          <ellipse
            cx="24"
            cy="24"
            rx="20"
            ry="5"
            transform="rotate(-18 24 24)"
            strokeWidth="1.4"
          />
          {/* Small moon */}
          <circle cx="38" cy="14" r="1.6" fill={color} stroke="none" />
        </svg>
      );
    case "plant":
      return (
        <svg {...svgProps}>
          {/* Stem */}
          <path d="M 24 38 L 24 22" />
          {/* Two leaves */}
          <path d="M 24 26 C 18 24 14 18 16 14 C 21 16 25 21 24 26 Z" />
          <path d="M 24 22 C 30 20 34 14 32 10 C 27 12 23 17 24 22 Z" />
          {/* Pot / ground line */}
          <path d="M 18 40 L 30 40" strokeWidth="2" />
          <path d="M 19 38 L 29 38" opacity="0.6" />
        </svg>
      );
    case "king":
      return (
        <svg {...svgProps}>
          {/* Chess king — crown + body + base */}
          {/* Cross on top */}
          <line x1="24" y1="6" x2="24" y2="13" strokeWidth="1.8" />
          <line x1="21" y1="9" x2="27" y2="9" strokeWidth="1.8" />
          {/* Crown */}
          <path d="M 17 16 L 19 13 L 22 16 L 24 13 L 26 16 L 29 13 L 31 16 L 31 20 L 17 20 Z" />
          {/* Body */}
          <path d="M 19 20 L 19 30 L 16 33 L 16 38 L 32 38 L 32 33 L 29 30 L 29 20" />
          {/* Base */}
          <path d="M 14 40 L 34 40" strokeWidth="2" />
        </svg>
      );
    case "column":
      return (
        <svg {...svgProps}>
          {/* Greek column — capital + shaft + base */}
          {/* Capital (top) */}
          <rect x="13" y="11" width="22" height="3" />
          <rect x="15" y="14" width="18" height="2" opacity="0.8" />
          {/* Shaft with fluting (vertical lines) */}
          <line x1="17" y1="17" x2="17" y2="34" />
          <line x1="21" y1="17" x2="21" y2="34" />
          <line x1="24" y1="17" x2="24" y2="34" />
          <line x1="27" y1="17" x2="27" y2="34" />
          <line x1="31" y1="17" x2="31" y2="34" />
          {/* Base */}
          <rect x="15" y="35" width="18" height="2" opacity="0.8" />
          <rect x="13" y="37" width="22" height="3" />
        </svg>
      );
    case "chip":
      return (
        <svg {...svgProps}>
          {/* Microchip — square w/ central inner square + pins */}
          <rect x="14" y="14" width="20" height="20" rx="2" />
          <rect x="19" y="19" width="10" height="10" />
          {/* Inner traces */}
          <line x1="22" y1="22" x2="26" y2="22" opacity="0.6" />
          <line x1="22" y1="26" x2="26" y2="26" opacity="0.6" />
          {/* Pins — top + bottom + sides */}
          <line x1="19" y1="11" x2="19" y2="14" strokeWidth="1.4" />
          <line x1="24" y1="11" x2="24" y2="14" strokeWidth="1.4" />
          <line x1="29" y1="11" x2="29" y2="14" strokeWidth="1.4" />
          <line x1="19" y1="34" x2="19" y2="37" strokeWidth="1.4" />
          <line x1="24" y1="34" x2="24" y2="37" strokeWidth="1.4" />
          <line x1="29" y1="34" x2="29" y2="37" strokeWidth="1.4" />
          <line x1="11" y1="19" x2="14" y2="19" strokeWidth="1.4" />
          <line x1="11" y1="24" x2="14" y2="24" strokeWidth="1.4" />
          <line x1="11" y1="29" x2="14" y2="29" strokeWidth="1.4" />
          <line x1="34" y1="19" x2="37" y2="19" strokeWidth="1.4" />
          <line x1="34" y1="24" x2="37" y2="24" strokeWidth="1.4" />
          <line x1="34" y1="29" x2="37" y2="29" strokeWidth="1.4" />
        </svg>
      );
    case "bust":
      return (
        <svg {...svgProps}>
          {/* Classical bust silhouette */}
          {/* Head */}
          <ellipse cx="24" cy="18" rx="7" ry="9" />
          {/* Neck + shoulders */}
          <path d="M 20 26 L 20 30 L 14 36 L 14 40 L 34 40 L 34 36 L 28 30 L 28 26" />
          {/* Base / plinth */}
          <rect x="11" y="40" width="26" height="2" strokeWidth="2" />
          {/* Hair detail */}
          <path d="M 18 13 C 18 9 30 9 30 13" opacity="0.6" />
          {/* Eye line */}
          <line x1="20" y1="18" x2="22" y2="18" opacity="0.7" />
          <line x1="26" y1="18" x2="28" y2="18" opacity="0.7" />
        </svg>
      );
    case "camera":
      return (
        <svg {...svgProps}>
          {/* Camera body */}
          <rect x="8" y="16" width="32" height="22" rx="2.5" />
          {/* Top viewfinder bump */}
          <path d="M 17 16 L 19 12 L 29 12 L 31 16" />
          {/* Lens — concentric circles */}
          <circle cx="24" cy="27" r="8" />
          <circle cx="24" cy="27" r="5" strokeWidth="1.4" />
          <circle cx="24" cy="27" r="2" fill={color} stroke="none" />
          {/* Flash indicator */}
          <circle cx="34" cy="20" r="0.8" fill={color} stroke="none" />
        </svg>
      );
  }
}
