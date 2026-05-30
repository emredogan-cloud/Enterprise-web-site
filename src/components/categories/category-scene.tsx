import type { CategoryArtwork, CategorySceneKind } from "./demo-categories";

/**
 * CategoryScene — the imagery system for the discovery gallery.
 *
 * Renders a distinct, full-bleed *atmosphere* per genre (the brief: "each
 * genre, its own world" — not empty rectangles, not plain backgrounds). All
 * pure CSS + SVG, no image asset, so the gallery stays zero-egress and
 * bundle-free and is future-ready to swap in a real asset pipeline.
 *
 * Composition per scene: a base gradient (the genre palette) → a soft glow
 * bloom → a characteristic silhouette motif → a vignette. The parent card
 * adds the bottom scrim that keeps the overlaid title legible and drives the
 * hover zoom via `.group`.
 *
 * Pure Server Component.
 */
export function CategoryScene({ artwork }: { artwork: CategoryArtwork }) {
  return (
    <div className="absolute inset-0">
      {/* Base gradient — the world's color key */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 28%, ${artwork.bg[0]} 0%, ${artwork.bg[1]} 70%, ${artwork.bg[1]} 100%)`,
        }}
      />

      {/* The scene motif */}
      <SceneMotif kind={artwork.scene} glow={artwork.glow} halo={artwork.halo} />

      {/* Vignette — pulls focus inward, deepens the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 30%, transparent 35%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene motifs — one evocative silhouette world per genre                    */
/* -------------------------------------------------------------------------- */

function SceneMotif({
  kind,
  glow,
  halo,
}: {
  kind: CategorySceneKind;
  glow: string;
  halo: string;
}) {
  switch (kind) {
    case "castle":
      return (
        <>
          <Bloom x="74%" y="26%" size={150} color={halo} />
          {/* Moon */}
          <Disc x="74%" y="26%" size={34} color={glow} blur={2} />
          <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
            {/* Distant ridge */}
            <polygon points="0,120 0,86 38,70 78,84 120,66 168,82 200,70 200,120" fill="rgba(0,0,0,0.45)" />
            {/* Castle silhouette */}
            <g fill="rgba(0,0,0,0.82)">
              <rect x="78" y="52" width="44" height="60" />
              <rect x="70" y="64" width="14" height="48" />
              <rect x="116" y="60" width="16" height="52" />
              {/* Crenellations */}
              <rect x="78" y="48" width="6" height="6" /><rect x="90" y="48" width="6" height="6" />
              <rect x="102" y="48" width="6" height="6" /><rect x="114" y="48" width="6" height="6" />
              {/* Spires */}
              <polygon points="77,64 70,50 63,64" /><polygon points="124,60 132,44 140,60" />
            </g>
            {/* Lit windows */}
            <rect x="88" y="70" width="5" height="8" fill={glow} opacity="0.85" />
            <rect x="106" y="74" width="5" height="8" fill={glow} opacity="0.7" />
          </svg>
        </>
      );

    case "neon-city":
      return (
        <>
          {/* Horizon glow band */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[55%]"
            style={{ background: `linear-gradient(0deg, ${halo} 0%, transparent 100%)` }}
          />
          <Disc x="26%" y="24%" size={10} color={glow} blur={1} />
          <Disc x="82%" y="18%" size={6} color={glow} blur={1} />
          <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
            <g fill="rgba(0,0,0,0.8)">
              <rect x="6" y="64" width="20" height="56" /><rect x="30" y="44" width="16" height="76" />
              <rect x="50" y="74" width="22" height="46" /><rect x="76" y="36" width="18" height="84" />
              <rect x="98" y="58" width="20" height="62" /><rect x="122" y="48" width="16" height="72" />
              <rect x="142" y="70" width="24" height="50" /><rect x="170" y="40" width="20" height="80" />
            </g>
            {/* Lit windows — scattered emerald/blue dots */}
            {[
              [35, 54], [38, 62], [82, 46], [85, 58], [104, 68], [127, 58], [176, 52], [179, 64], [14, 74],
            ].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="2.4" height="2.4" fill={glow} opacity={0.85 - (i % 3) * 0.2} />
            ))}
          </svg>
        </>
      );

    case "fog-street":
      return (
        <>
          {/* Fog bands */}
          {[36, 58, 78].map((top, i) => (
            <div
              key={i}
              aria-hidden
              className="absolute inset-x-0"
              style={{
                top: `${top}%`,
                height: "16%",
                background: `linear-gradient(180deg, transparent, ${halo}, transparent)`,
                filter: "blur(8px)",
                opacity: 0.7 - i * 0.15,
              }}
            />
          ))}
          {/* Lamp glow */}
          <Bloom x="64%" y="40%" size={90} color={halo} />
          <Disc x="64%" y="36%" size={12} color={glow} blur={2} />
          <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
            {/* Lamppost */}
            <g stroke="rgba(0,0,0,0.85)" strokeWidth="3" fill="none">
              <line x1="128" y1="44" x2="128" y2="120" />
              <path d="M 128 50 q 12 -8 18 2" />
            </g>
            {/* Ground */}
            <rect x="0" y="112" width="200" height="8" fill="rgba(0,0,0,0.5)" />
          </svg>
        </>
      );

    case "columns":
      return (
        <>
          <Bloom x="50%" y="30%" size={150} color={halo} />
          <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
            {/* Entablature */}
            <rect x="20" y="30" width="160" height="10" fill="rgba(0,0,0,0.7)" />
            <polygon points="20,30 100,12 180,30" fill="rgba(0,0,0,0.6)" />
            {/* Columns */}
            <g fill="rgba(0,0,0,0.78)">
              {[34, 64, 94, 124, 154].map((x) => (
                <g key={x}>
                  <rect x={x} y="40" width="14" height="68" />
                  <rect x={x - 2} y="40" width="18" height="5" />
                  <rect x={x - 2} y="104" width="18" height="6" />
                </g>
              ))}
            </g>
            {/* Fluting hints */}
            {[34, 64, 94, 124, 154].map((x) => (
              <line key={x} x1={x + 7} y1="46" x2={x + 7} y2="104" stroke={glow} strokeWidth="0.6" opacity="0.3" />
            ))}
          </svg>
        </>
      );

    case "warm-hills":
      return (
        <>
          {/* Setting sun */}
          <Bloom x="50%" y="44%" size={170} color={halo} />
          <Disc x="50%" y="44%" size={46} color={glow} blur={3} />
          <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
            <path d="M 0 92 Q 50 76 100 88 T 200 84 L 200 120 L 0 120 Z" fill="rgba(0,0,0,0.4)" />
            <path d="M 0 104 Q 60 92 120 102 T 200 100 L 200 120 L 0 120 Z" fill="rgba(0,0,0,0.62)" />
          </svg>
          {/* Soft bokeh */}
          <Disc x="28%" y="30%" size={5} color={glow} blur={2} />
          <Disc x="76%" y="26%" size={4} color={glow} blur={2} />
        </>
      );

    case "dark-forest":
      return (
        <>
          {/* Blood moon — dim */}
          <Bloom x="68%" y="24%" size={120} color={halo} />
          <Disc x="68%" y="24%" size={30} color={glow} blur={3} />
          {/* Mist */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[40%]"
            style={{ background: "linear-gradient(0deg, rgba(120,40,40,0.18), transparent)", filter: "blur(8px)" }}
          />
          <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
            {/* Bare trees */}
            <g stroke="rgba(0,0,0,0.9)" fill="none" strokeWidth="3" strokeLinecap="round">
              {[24, 58, 96, 138, 176].map((x, i) => (
                <g key={x}>
                  <line x1={x} y1="120" x2={x} y2={48 + (i % 2) * 10} />
                  <path d={`M ${x} ${66 + (i % 2) * 6} l -10 -10 M ${x} ${78} l 12 -10 M ${x} ${58} l -8 -8`} />
                </g>
              ))}
            </g>
          </svg>
          {/* Heavier vignette for dread */}
          <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(ellipse 100% 80% at 50% 40%, transparent 30%, rgba(0,0,0,0.6) 100%)" }} />
        </>
      );

    case "mountains":
      return (
        <>
          <Bloom x="50%" y="22%" size={150} color={halo} />
          <Disc x="68%" y="22%" size={20} color={glow} blur={2} />
          <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
            <polygon points="0,120 0,72 46,40 92,78 200,52 200,120" fill="rgba(0,0,0,0.5)" />
            <polygon points="0,120 40,88 86,52 120,84 168,58 200,86 200,120" fill="rgba(0,0,0,0.72)" />
            {/* Snow caps */}
            <polygon points="86,52 80,62 94,62" fill={glow} opacity="0.5" />
            <polygon points="46,40 40,52 54,52" fill={glow} opacity="0.4" />
          </svg>
        </>
      );

    case "open-book":
      return (
        <>
          <Bloom x="50%" y="34%" size={150} color={halo} />
          <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
            {/* Open book */}
            <polygon points="100,46 100,98 30,88 40,56" fill="rgba(230,236,228,0.14)" stroke={glow} strokeWidth="0.6" opacity="0.9" />
            <polygon points="100,46 100,98 170,88 160,56" fill="rgba(230,236,228,0.14)" stroke={glow} strokeWidth="0.6" opacity="0.9" />
            <line x1="100" y1="46" x2="100" y2="98" stroke={glow} strokeWidth="1" opacity="0.7" />
            {/* Text lines */}
            {[60, 67, 74, 81].map((y, i) => (
              <g key={i}>
                <line x1={52 - i} y1={y} x2="94" y2={y - 1} stroke={glow} strokeWidth="0.7" opacity="0.28" />
                <line x1="106" y1={y - 1} x2={148 + i} y2={y} stroke={glow} strokeWidth="0.7" opacity="0.28" />
              </g>
            ))}
          </svg>
        </>
      );

    case "ink-desk":
      return (
        <>
          <Bloom x="56%" y="34%" size={130} color={halo} />
          <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
            {/* Paper sheet */}
            <polygon points="40,96 60,52 130,52 116,96" fill="rgba(220,228,236,0.12)" stroke={glow} strokeWidth="0.5" opacity="0.8" />
            {[64, 72, 80].map((y, i) => (
              <line key={i} x1={64 - i} y1={y} x2={118 - i} y2={y} stroke={glow} strokeWidth="0.7" opacity="0.3" />
            ))}
            {/* Inkwell */}
            <rect x="132" y="80" width="20" height="16" rx="2" fill="rgba(0,0,0,0.8)" />
            <ellipse cx="142" cy="80" rx="10" ry="3" fill={glow} opacity="0.55" />
            {/* Quill */}
            <path d="M 150 78 L 178 40" stroke="rgba(0,0,0,0.85)" strokeWidth="3" strokeLinecap="round" />
            <path d="M 178 40 q -6 8 -14 12 q 4 -10 14 -12 Z" fill={glow} opacity="0.5" />
          </svg>
        </>
      );

    case "starfield":
      return (
        <>
          <Bloom x="50%" y="32%" size={180} color={halo} />
          {/* Aurora band */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-[20%] h-[26%]"
            style={{ background: `linear-gradient(180deg, transparent, ${halo}, transparent)`, filter: "blur(12px)" }}
          />
          <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
            {/* Stars */}
            {[
              [18, 22], [40, 14], [66, 30], [92, 16], [120, 26], [148, 12], [176, 28],
              [30, 44], [82, 48], [134, 44], [168, 50], [54, 60], [110, 58],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 1.6 : 1} fill={glow} opacity={0.85 - (i % 3) * 0.2} />
            ))}
            {/* Horizon + lone figure */}
            <rect x="0" y="108" width="200" height="12" fill="rgba(0,0,0,0.55)" />
            <line x1="100" y1="108" x2="100" y2="96" stroke="rgba(0,0,0,0.85)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="92" r="3" fill="rgba(0,0,0,0.85)" />
          </svg>
        </>
      );
  }
}

/* -------------------------------------------------------------------------- */
/* Small shared primitives                                                    */
/* -------------------------------------------------------------------------- */

/** Soft radial bloom centered on (x, y). */
function Bloom({ x, y, size, color }: { x: string; y: string; size: number; color: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        left: x,
        top: y,
        height: size,
        width: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
        filter: "blur(4px)",
      }}
    />
  );
}

/** A glowing disc (moon / sun / lamp) centered on (x, y). */
function Disc({
  x,
  y,
  size,
  color,
  blur = 0,
}: {
  x: string;
  y: string;
  size: number;
  color: string;
  blur?: number;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        left: x,
        top: y,
        height: size,
        width: size,
        background: `radial-gradient(circle, ${color} 0%, ${color} 42%, transparent 72%)`,
        filter: `blur(${blur}px)`,
        boxShadow: `0 0 24px ${color}`,
      }}
    />
  );
}
