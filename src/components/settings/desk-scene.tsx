/**
 * Cinematic desk scene — the atmospheric panel on the right of the
 * `/account/settings` hero.
 *
 * Reference mood: a private night-time reading desk. A warm desk lamp
 * casting an emerald-tinted bloom over an unseen book; a small crystal
 * ornament catching the light; cool dark beyond. Same scene-family
 * as the article hero's `LibraryScene` and the blog category's
 * `ReadingRoomScene`, tuned for "trust + privacy" rather than "writing"
 * or "reading lounge."
 *
 * Pure CSS + SVG. No image asset.
 */
export function DeskScene() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Base dark gradient — deeper than the page floor, so the panel
          reads as its own atmosphere. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 60%, #0e2419 0%, #07110b 60%, #050a08 100%)",
        }}
      />

      {/* Warm emerald-lamp bloom — center-right, the focal warmth */}
      <div
        aria-hidden
        className="absolute right-[20%] top-[15%] h-[280px] w-[280px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(51, 240, 170, 0.45) 0%, rgba(22, 199, 132, 0.18) 35%, transparent 70%)",
          filter: "blur(4px)",
        }}
      />

      {/* Secondary spill — warmer, lower, pretends to be light on the desk */}
      <div
        aria-hidden
        className="absolute right-[10%] top-[40%] h-[420px] w-[460px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255, 195, 110, 0.10) 0%, rgba(22, 199, 132, 0.06) 50%, transparent 75%)",
          filter: "blur(12px)",
        }}
      />

      {/* Crystal ornament — the focal small object in the reference.
          Stylized diamond-cut SVG with refractive emerald glow. */}
      <svg
        viewBox="0 0 80 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute right-[28%] top-[25%] h-[35%] w-[24%]"
        aria-hidden
      >
        <defs>
          <linearGradient id="crystalFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(51, 240, 170, 0.85)" />
            <stop offset="55%" stopColor="rgba(22, 199, 132, 0.6)" />
            <stop offset="100%" stopColor="rgba(7, 17, 11, 0.9)" />
          </linearGradient>
          <linearGradient id="crystalEdge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" />
            <stop offset="100%" stopColor="rgba(51, 240, 170, 0.2)" />
          </linearGradient>
        </defs>

        {/* Crystal silhouette — gem-like hexagonal cut */}
        <polygon
          points="40,15 60,32 55,68 40,90 25,68 20,32"
          fill="url(#crystalFace)"
          stroke="url(#crystalEdge)"
          strokeWidth="0.6"
        />
        {/* Inner highlight facet */}
        <polygon
          points="40,15 55,32 40,55 25,32"
          fill="rgba(255, 255, 255, 0.18)"
        />
        {/* Lower dark facet */}
        <polygon
          points="40,55 55,68 40,90 25,68"
          fill="rgba(0, 0, 0, 0.25)"
        />
        {/* Edge highlight stroke — refraction line */}
        <line
          x1="40"
          y1="15"
          x2="40"
          y2="90"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="0.5"
        />
      </svg>

      {/* Light beam from above — the lamp source we don't show directly */}
      <div
        aria-hidden
        className="absolute right-[28%] top-0 h-[35%] w-[10%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(51, 240, 170, 0.18) 0%, transparent 100%)",
          filter: "blur(8px)",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }}
      />

      {/* Foreground dark vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 90% at 50% 110%, rgba(0,0,0,0.55) 0%, transparent 65%)",
        }}
      />

      {/* Top fade — keeps the hero's text column edge crisp on overlap */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[35%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 100%)",
        }}
      />

      {/* Left fade — softens the edge where the panel meets the hero text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[20%]"
        style={{
          background:
            "linear-gradient(90deg, rgba(7, 17, 11, 0.8) 0%, transparent 100%)",
        }}
      />

      {/* Sparkle particles — tiny refraction points around the crystal */}
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
    </div>
  );
}

const SPARKLES: ReadonlyArray<{
  left: string;
  top: string;
  delay: string;
  dustX: string;
}> = [
  { left: "40%", top: "30%", delay: "0s", dustX: "12px" },
  { left: "55%", top: "45%", delay: "2s", dustX: "-10px" },
  { left: "68%", top: "60%", delay: "4s", dustX: "15px" },
  { left: "75%", top: "32%", delay: "6s", dustX: "-8px" },
  { left: "48%", top: "70%", delay: "8s", dustX: "10px" },
];
