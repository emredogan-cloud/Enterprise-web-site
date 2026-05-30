/**
 * Reading-room scene — CSS-rendered cinematic backdrop for the category
 * hero. A quiet study with a deep armchair, a warm desk lamp, and a
 * bookshelf rim. Same family as the article hero's `LibraryScene` but
 * the focal element is the chair (a place to settle in and read) rather
 * than the desk (a place to write at).
 *
 * Pure CSS + SVG. Zero image asset; the warm lamp glow + chair silhouette
 * + bookshelf rim do the storytelling.
 */
export function ReadingRoomScene() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Base dark gradient */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 60%, #14241a 0%, #07110b 60%, #050a08 100%)",
        }}
      />

      {/* Warm desk-lamp bloom — center-right */}
      <div
        aria-hidden
        className="absolute right-[28%] top-[20%] h-[200px] w-[200px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 195, 110, 0.50) 0%, rgba(220, 140, 50, 0.18) 35%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />

      {/* Secondary warm wash spilling down (creates the room's mood) */}
      <div
        aria-hidden
        className="absolute right-[20%] top-[30%] h-[420px] w-[460px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255, 178, 90, 0.14) 0%, transparent 65%)",
          filter: "blur(10px)",
        }}
      />

      {/* Bookshelf rim — vertical book spines on the far right */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-[18%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0, transparent 7px, rgba(140, 110, 70, 0.18) 7px, rgba(140, 110, 70, 0.18) 9px, transparent 9px, transparent 24px, rgba(110, 80, 50, 0.14) 24px, rgba(110, 80, 50, 0.14) 28px)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, black 15%, black 85%, transparent 100%)",
        }}
      />

      {/* The chair — soft silhouette, lit from the lamp side */}
      <svg
        viewBox="0 0 200 220"
        preserveAspectRatio="xMidYMax meet"
        className="absolute bottom-[8%] left-[8%] h-[72%] w-[42%]"
        aria-hidden
      >
        <defs>
          {/* Subtle warm rim light on the chair edge */}
          <linearGradient id="chairBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1c1410" />
            <stop offset="65%" stopColor="#0a0608" />
            <stop offset="85%" stopColor="#2c1a10" />
            <stop offset="100%" stopColor="#5a3a1c" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Chair back — tall winged */}
        <path
          d="M 38 50
             C 30 50 26 60 26 80
             L 26 170
             C 26 178 32 184 42 184
             L 158 184
             C 168 184 174 178 174 170
             L 174 80
             C 174 60 170 50 162 50
             L 38 50 Z"
          fill="url(#chairBody)"
        />

        {/* Seat — deep cushion */}
        <path
          d="M 38 158
             L 162 158
             L 168 196
             L 32 196 Z"
          fill="#1a0e08"
        />

        {/* Side wings */}
        <path
          d="M 26 90 L 18 100 L 18 180 L 26 175 Z"
          fill="#08050a"
          opacity="0.7"
        />
        <path
          d="M 174 90 L 182 100 L 182 180 L 174 175 Z"
          fill="#08050a"
          opacity="0.7"
        />

        {/* Throw blanket — warm rim hint */}
        <path
          d="M 60 174 C 60 174 90 178 140 174 L 144 196 L 56 196 Z"
          fill="#3a2418"
          opacity="0.5"
        />

        {/* Chair legs */}
        <rect x="40" y="196" width="6" height="14" fill="#0a0608" />
        <rect x="154" y="196" width="6" height="14" fill="#0a0608" />

        {/* Subtle lamp rim light on the right side of the chair */}
        <path
          d="M 174 60 L 174 180"
          stroke="rgba(255, 178, 90, 0.35)"
          strokeWidth="1.4"
          fill="none"
        />
      </svg>

      {/* Desk-lamp shade — small to the right of the chair */}
      <svg
        viewBox="0 0 60 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute right-[26%] top-[18%] h-[28%] w-[14%]"
        aria-hidden
      >
        {/* Lamp shade — trapezoid */}
        <path
          d="M 18 18 L 42 18 L 50 42 L 10 42 Z"
          fill="#3a2818"
          stroke="rgba(255, 195, 110, 0.4)"
          strokeWidth="0.8"
        />
        {/* Stem */}
        <line x1="30" y1="42" x2="30" y2="74" stroke="#2a1810" strokeWidth="2" />
        {/* Base */}
        <ellipse cx="30" cy="78" rx="14" ry="3" fill="#1a1008" />
        {/* Lamp light underneath the shade */}
        <ellipse
          cx="30"
          cy="46"
          rx="22"
          ry="4"
          fill="rgba(255, 200, 110, 0.65)"
          style={{ filter: "blur(2px)" }}
        />
      </svg>

      {/* Foreground vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 110%, rgba(0,0,0,0.55) 0%, transparent 65%)",
        }}
      />

      {/* Top fade — keeps the category eyebrow zone crisp */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[30%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
