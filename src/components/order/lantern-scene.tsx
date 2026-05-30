/**
 * Lantern scene — atmospheric panel on the right of the order hero.
 *
 * Reference mood: a quiet late-night reading nook. Warm lantern on a
 * shelf with books fading into shadow; a small crystal/light ornament
 * catching the lantern's warmth; deep emerald-tinted darkness beyond.
 *
 * Same scene-family as `DeskScene` (settings) and `LibraryScene`
 * (article) — pure CSS + SVG, no image asset.
 */
export function LanternScene() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Base dark gradient — slightly bluer than the desk scene to
          imply night-time rather than working light */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 60% 55%, #0d2419 0%, #061410 60%, #050a08 100%)",
        }}
      />

      {/* Bookshelf rim — vertical book spines on the right, fading in/out */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-[22%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0, transparent 6px, rgba(140, 110, 70, 0.16) 6px, rgba(140, 110, 70, 0.16) 8px, transparent 8px, transparent 22px, rgba(110, 80, 50, 0.12) 22px, rgba(110, 80, 50, 0.12) 26px)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 18%, black 82%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
      />

      {/* Warm lantern bloom — center, warmer than the desk scene */}
      <div
        aria-hidden
        className="absolute right-[36%] top-[20%] h-[260px] w-[260px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 190, 110, 0.42) 0%, rgba(220, 140, 60, 0.18) 35%, transparent 70%)",
          filter: "blur(4px)",
        }}
      />

      {/* Secondary spill — emerald tint warming the shelf */}
      <div
        aria-hidden
        className="absolute right-[25%] top-[40%] h-[400px] w-[440px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(51, 240, 170, 0.10) 0%, rgba(255, 195, 110, 0.06) 50%, transparent 75%)",
          filter: "blur(12px)",
        }}
      />

      {/* Lantern — small SVG hanging from the top, glass body with warm core */}
      <svg
        viewBox="0 0 60 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute right-[38%] top-[15%] h-[40%] w-[16%]"
        aria-hidden
      >
        <defs>
          <linearGradient id="lanternBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a2818" />
            <stop offset="50%" stopColor="#2a1810" />
            <stop offset="100%" stopColor="#1a0e08" />
          </linearGradient>
          <radialGradient id="lanternCore" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 220, 150, 0.95)" />
            <stop offset="40%" stopColor="rgba(255, 190, 100, 0.65)" />
            <stop offset="100%" stopColor="rgba(255, 150, 60, 0)" />
          </radialGradient>
        </defs>

        {/* Hanging chain */}
        <line
          x1="30"
          y1="2"
          x2="30"
          y2="22"
          stroke="rgba(140, 100, 70, 0.5)"
          strokeWidth="0.8"
        />

        {/* Top cap */}
        <path d="M 18 22 L 42 22 L 38 30 L 22 30 Z" fill="url(#lanternBody)" />

        {/* Glass body — trapezoid */}
        <path
          d="M 22 30 L 38 30 L 42 70 L 18 70 Z"
          fill="rgba(255, 190, 110, 0.08)"
          stroke="rgba(255, 195, 110, 0.4)"
          strokeWidth="0.6"
        />

        {/* Warm core flame inside */}
        <ellipse cx="30" cy="52" rx="10" ry="14" fill="url(#lanternCore)" />
        <ellipse
          cx="30"
          cy="50"
          rx="3"
          ry="6"
          fill="rgba(255, 230, 180, 0.9)"
          style={{ filter: "blur(0.6px)" }}
        />

        {/* Bottom cap */}
        <path d="M 18 70 L 42 70 L 38 78 L 22 78 Z" fill="url(#lanternBody)" />
      </svg>

      {/* Books silhouette on a shelf — bottom-right, partially in shadow */}
      <svg
        viewBox="0 0 200 60"
        preserveAspectRatio="xMidYMax meet"
        className="absolute bottom-[8%] left-[8%] h-[20%] w-[60%]"
        aria-hidden
      >
        {/* Shelf line */}
        <line
          x1="0"
          y1="55"
          x2="200"
          y2="55"
          stroke="rgba(140, 110, 70, 0.4)"
          strokeWidth="0.6"
        />

        {/* Book spines — varying heights, leaning */}
        <rect x="8" y="20" width="11" height="35" fill="#2a1810" />
        <rect x="22" y="15" width="9" height="40" fill="#3a2418" />
        <rect x="34" y="22" width="13" height="33" fill="#1a1008" />
        <rect x="50" y="10" width="10" height="45" fill="#2a1812" />
        <rect x="62" y="18" width="9" height="37" fill="#3a2418" />
        <rect x="74" y="25" width="14" height="30" fill="#0a0608" />
        <rect x="92" y="14" width="11" height="41" fill="#2a1812" />
        <rect x="106" y="22" width="9" height="33" fill="#1a1008" />
        <rect x="118" y="12" width="12" height="43" fill="#3a2418" />
        <rect x="134" y="20" width="10" height="35" fill="#2a1810" />

        {/* Warm rim catching the lantern light on the left edges */}
        <line x1="22" y1="15" x2="22" y2="55" stroke="rgba(255,180,90,0.18)" strokeWidth="0.6" />
        <line x1="50" y1="10" x2="50" y2="55" stroke="rgba(255,180,90,0.22)" strokeWidth="0.6" />
      </svg>

      {/* Crystal ornament — small, on the shelf next to the books */}
      <svg
        viewBox="0 0 40 60"
        preserveAspectRatio="xMidYMid meet"
        className="absolute bottom-[12%] right-[18%] h-[18%] w-[10%]"
        aria-hidden
      >
        <defs>
          <linearGradient id="crystalGem" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(51, 240, 170, 0.8)" />
            <stop offset="60%" stopColor="rgba(22, 199, 132, 0.55)" />
            <stop offset="100%" stopColor="rgba(7, 17, 11, 0.85)" />
          </linearGradient>
        </defs>
        <polygon
          points="20,8 32,20 28,42 20,52 12,42 8,20"
          fill="url(#crystalGem)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
        <polygon
          points="20,8 28,20 20,32 12,20"
          fill="rgba(255, 255, 255, 0.16)"
        />
      </svg>

      {/* Foreground vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 80% at 50% 110%, rgba(0,0,0,0.55) 0%, transparent 65%)",
        }}
      />

      {/* Top + left fades — keep the panel edge crisp against the hero text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[30%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[18%]"
        style={{
          background:
            "linear-gradient(90deg, rgba(7,17,11,0.75) 0%, transparent 100%)",
        }}
      />

      {/* Drifting sparkles — warm + emerald mix */}
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="catalog-dust absolute h-[2px] w-[2px] rounded-full"
          style={
            {
              left: s.left,
              top: s.top,
              animationDelay: `${s.delay}s`,
              background: s.warm ? "#ffce8c" : "#33f0aa",
              boxShadow: s.warm
                ? "0 0 5px rgba(255, 206, 140, 0.85)"
                : "0 0 5px rgba(51, 240, 170, 0.85)",
              ["--dust-x" as string]: s.dustX,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

const SPARKLES: ReadonlyArray<{
  left: string;
  top: string;
  delay: string;
  dustX: string;
  warm: boolean;
}> = [
  { left: "38%", top: "20%", delay: "0s", dustX: "12px", warm: true },
  { left: "55%", top: "32%", delay: "2s", dustX: "-10px", warm: false },
  { left: "70%", top: "55%", delay: "4s", dustX: "8px", warm: true },
  { left: "82%", top: "32%", delay: "6s", dustX: "-12px", warm: false },
  { left: "45%", top: "65%", delay: "8s", dustX: "10px", warm: true },
];
