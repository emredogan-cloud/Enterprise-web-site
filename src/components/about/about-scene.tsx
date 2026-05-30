/**
 * About scene — the atmospheric artwork on the right of the `/about` hero.
 *
 * Reference mood (about_referance_image): a quiet late-night reading desk.
 * An open book lies in the warm pool of a lantern; above its pages a small
 * emerald crystal hovers, catching the light and breathing a soft glow —
 * the literal "magic of a book that is truly yours." Bookshelves dissolve
 * into emerald-tinted darkness beyond.
 *
 * Same scene-family as `LanternScene` (order), `DeskScene` (settings) and
 * `LibraryScene` (article) — pure CSS + SVG, no image asset, so it stays
 * zero-egress and bundle-free. Motion comes from the `.about-crystal`
 * (gentle bob) + `.about-aura` (breathing glow) classes and the shared
 * `.catalog-dust` sparkle keyframe, all scoped under `.cinematic-root` in
 * globals.css and neutralized by the global reduced-motion rule.
 */
export function AboutScene() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Base night-room gradient — emerald core, deep dark at the edges */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, #0e2a1d 0%, #07140e 55%, #050705 100%)",
        }}
      />

      {/* Left bookshelf rim — faint vertical spines fading top + bottom */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-[20%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0, transparent 5px, rgba(120, 96, 60, 0.14) 5px, rgba(120, 96, 60, 0.14) 7px, transparent 7px, transparent 20px, rgba(90, 70, 44, 0.10) 20px, rgba(90, 70, 44, 0.10) 24px)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 22%, black 80%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, black 22%, black 80%, transparent 100%)",
        }}
      />

      {/* Breathing emerald aura behind the crystal — the focal warmth.
          Positioned by its CENTER (top-left point + translate(-50%,-50%)
          inside the home-breathe keyframe the .about-aura class reuses). */}
      <div
        aria-hidden
        className="about-aura absolute left-1/2 top-[34%] h-[300px] w-[300px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(51, 240, 170, 0.42) 0%, rgba(22, 199, 132, 0.16) 38%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />

      {/* Light beam — the open pages emitting light up toward the crystal */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[30%] h-[34%] w-[16%] -translate-x-1/2"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(51, 240, 170, 0.16) 60%, rgba(51, 240, 170, 0.28) 100%)",
          filter: "blur(7px)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 70%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, black 70%, transparent 100%)",
        }}
      />

      {/* Hovering emerald crystal — gentle bob (.about-crystal) */}
      <svg
        viewBox="0 0 80 110"
        preserveAspectRatio="xMidYMid meet"
        className="about-crystal absolute left-1/2 top-[16%] h-[30%] w-[22%] -translate-x-1/2"
        aria-hidden
      >
        <defs>
          <linearGradient id="aboutCrystalFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(120, 255, 210, 0.95)" />
            <stop offset="50%" stopColor="rgba(51, 240, 170, 0.72)" />
            <stop offset="100%" stopColor="rgba(9, 40, 28, 0.92)" />
          </linearGradient>
          <linearGradient id="aboutCrystalEdge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
            <stop offset="100%" stopColor="rgba(51, 240, 170, 0.25)" />
          </linearGradient>
        </defs>

        {/* Gem silhouette — tall hexagonal cut */}
        <polygon
          points="40,8 62,30 56,72 40,100 24,72 18,30"
          fill="url(#aboutCrystalFace)"
          stroke="url(#aboutCrystalEdge)"
          strokeWidth="0.7"
        />
        {/* Upper highlight facet */}
        <polygon
          points="40,8 56,30 40,58 24,30"
          fill="rgba(255, 255, 255, 0.22)"
        />
        {/* Lower shadowed facet */}
        <polygon
          points="40,58 56,72 40,100 24,72"
          fill="rgba(0, 0, 0, 0.28)"
        />
        {/* Refraction centre line */}
        <line
          x1="40"
          y1="8"
          x2="40"
          y2="100"
          stroke="rgba(255, 255, 255, 0.38)"
          strokeWidth="0.5"
        />
      </svg>

      {/* Open book on the desk — two pages spreading from a centre spine */}
      <svg
        viewBox="0 0 240 130"
        preserveAspectRatio="xMidYMax meet"
        className="absolute bottom-[14%] left-1/2 h-[40%] w-[78%] -translate-x-1/2"
        aria-hidden
      >
        <defs>
          <linearGradient id="aboutPageL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(180, 196, 188, 0.10)" />
            <stop offset="70%" stopColor="rgba(210, 230, 222, 0.30)" />
            <stop offset="100%" stopColor="rgba(150, 255, 214, 0.42)" />
          </linearGradient>
          <linearGradient id="aboutPageR" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(180, 196, 188, 0.10)" />
            <stop offset="70%" stopColor="rgba(210, 230, 222, 0.30)" />
            <stop offset="100%" stopColor="rgba(150, 255, 214, 0.42)" />
          </linearGradient>
          <linearGradient id="aboutCover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#123026" />
            <stop offset="100%" stopColor="#08160f" />
          </linearGradient>
        </defs>

        {/* Cover / shadow beneath the open pages */}
        <polygon
          points="12,108 120,120 228,108 210,124 120,130 30,124"
          fill="url(#aboutCover)"
        />

        {/* Left page */}
        <polygon
          points="120,40 120,118 18,106 30,52"
          fill="url(#aboutPageL)"
          stroke="rgba(150, 255, 214, 0.25)"
          strokeWidth="0.5"
        />
        {/* Right page */}
        <polygon
          points="120,40 120,118 222,106 210,52"
          fill="url(#aboutPageR)"
          stroke="rgba(150, 255, 214, 0.25)"
          strokeWidth="0.5"
        />
        {/* Spine highlight */}
        <line
          x1="120"
          y1="40"
          x2="120"
          y2="118"
          stroke="rgba(150, 255, 214, 0.55)"
          strokeWidth="1"
        />

        {/* Hinted text lines — left page */}
        {[58, 66, 74, 82, 90, 98].map((y, i) => (
          <line
            key={`l${i}`}
            x1={40 + i * 1.2}
            y1={y}
            x2={110}
            y2={y + 1.5}
            stroke="rgba(120, 200, 170, 0.28)"
            strokeWidth="0.8"
          />
        ))}
        {/* Hinted text lines — right page */}
        {[58, 66, 74, 82, 90, 98].map((y, i) => (
          <line
            key={`r${i}`}
            x1={130}
            y1={y + 1.5}
            x2={200 - i * 1.2}
            y2={y}
            stroke="rgba(120, 200, 170, 0.28)"
            strokeWidth="0.8"
          />
        ))}
      </svg>

      {/* Warm lantern — far right, smaller, secondary warmth */}
      <svg
        viewBox="0 0 60 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute right-[6%] top-[20%] h-[34%] w-[13%]"
        aria-hidden
      >
        <defs>
          <linearGradient id="aboutLanternBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a2818" />
            <stop offset="50%" stopColor="#2a1810" />
            <stop offset="100%" stopColor="#1a0e08" />
          </linearGradient>
          <radialGradient id="aboutLanternCore" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 220, 150, 0.9)" />
            <stop offset="45%" stopColor="rgba(255, 188, 100, 0.6)" />
            <stop offset="100%" stopColor="rgba(255, 150, 60, 0)" />
          </radialGradient>
        </defs>
        <line x1="30" y1="2" x2="30" y2="22" stroke="rgba(140, 100, 70, 0.5)" strokeWidth="0.8" />
        <path d="M 18 22 L 42 22 L 38 30 L 22 30 Z" fill="url(#aboutLanternBody)" />
        <path
          d="M 22 30 L 38 30 L 42 70 L 18 70 Z"
          fill="rgba(255, 190, 110, 0.08)"
          stroke="rgba(255, 195, 110, 0.38)"
          strokeWidth="0.6"
        />
        <ellipse cx="30" cy="52" rx="10" ry="14" fill="url(#aboutLanternCore)" />
        <ellipse cx="30" cy="50" rx="3" ry="6" fill="rgba(255, 230, 180, 0.9)" style={{ filter: "blur(0.6px)" }} />
        <path d="M 18 70 L 42 70 L 38 78 L 22 78 Z" fill="url(#aboutLanternBody)" />
      </svg>

      {/* Warm lantern spill — keeps the right side from going cold */}
      <div
        aria-hidden
        className="absolute right-[2%] top-[26%] h-[260px] w-[260px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 190, 110, 0.16) 0%, rgba(255, 150, 60, 0.05) 45%, transparent 72%)",
          filter: "blur(8px)",
        }}
      />

      {/* Foreground vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 115% 85% at 50% 112%, rgba(0,0,0,0.6) 0%, transparent 64%)",
        }}
      />

      {/* Top + left fades — keep the panel edge soft against the hero text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,7,5,0.55) 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[16%]"
        style={{
          background:
            "linear-gradient(90deg, rgba(7,17,11,0.7) 0%, transparent 100%)",
        }}
      />

      {/* Drifting sparkles — emerald + a couple of warm motes by the lantern */}
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
  { left: "46%", top: "24%", delay: "0s", dustX: "10px", warm: false },
  { left: "54%", top: "34%", delay: "1.8s", dustX: "-8px", warm: false },
  { left: "40%", top: "44%", delay: "3.4s", dustX: "12px", warm: false },
  { left: "62%", top: "48%", delay: "5s", dustX: "-10px", warm: false },
  { left: "84%", top: "34%", delay: "2.6s", dustX: "-6px", warm: true },
  { left: "88%", top: "52%", delay: "6.2s", dustX: "8px", warm: true },
];
