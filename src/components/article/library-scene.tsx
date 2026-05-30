/**
 * Library scene — CSS-rendered cinematic backdrop for the article hero.
 *
 * No photo asset yet; the scene composes from layered gradients +
 * geometric primitives to evoke the reference image:
 *   - Deep dark background
 *   - Warm desk-lamp bloom (top-right)
 *   - Faint vertical bookshelf rim lines (both flanks)
 *   - A small open-book silhouette on the "desk" plane
 *   - Soft foreground vignette pulling focus to the headline overlay
 *
 * Pure Server Component. No motion of its own — the hero panel that
 * wraps it controls hover scale + glow.
 */
export function LibraryScene() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Base dark gradient */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 75% 30%, #0e1a16 0%, #07110b 55%, #04090a 100%)",
        }}
      />

      {/* Warm desk-lamp bloom — top-right */}
      <div
        aria-hidden
        className="absolute right-[10%] top-[15%] h-[260px] w-[260px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 195, 110, 0.55) 0%, rgba(220, 140, 50, 0.20) 35%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />

      {/* Secondary warm wash spilling down */}
      <div
        aria-hidden
        className="absolute right-[5%] top-[25%] h-[420px] w-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 178, 90, 0.18) 0%, transparent 65%)",
          filter: "blur(8px)",
        }}
      />

      {/* Left bookshelf rim — vertical book spines */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-[26%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0, transparent 8px, rgba(140, 110, 70, 0.18) 8px, rgba(140, 110, 70, 0.18) 10px, transparent 10px, transparent 26px, rgba(110, 80, 50, 0.14) 26px, rgba(110, 80, 50, 0.14) 30px)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, black 15%, black 85%, transparent 100%)",
        }}
      />

      {/* Right bookshelf rim — fainter, just past the lamp glow */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-[35%] w-[8%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0, transparent 7px, rgba(140, 110, 70, 0.12) 7px, rgba(140, 110, 70, 0.12) 9px)",
          maskImage:
            "linear-gradient(180deg, transparent 5%, black 30%, black 75%, transparent 95%)",
          opacity: 0.5,
        }}
      />

      {/* Open book silhouette — on the lamp-lit "desk" */}
      <svg
        aria-hidden
        viewBox="0 0 200 80"
        preserveAspectRatio="xMidYMax meet"
        className="absolute bottom-[16%] right-[20%] h-[100px] w-[260px] opacity-90"
      >
        {/* Page L (warm lamp-lit) */}
        <path
          d="M 4 70 L 95 56 L 95 70 L 4 78 Z"
          fill="url(#bookGradL)"
          opacity="0.9"
        />
        {/* Spine shadow */}
        <line x1="98" y1="55" x2="98" y2="72" stroke="rgba(0,0,0,0.6)" strokeWidth="1.2" />
        {/* Page R */}
        <path
          d="M 196 70 L 105 56 L 105 70 L 196 78 Z"
          fill="url(#bookGradR)"
          opacity="0.9"
        />
        {/* Soft text lines on the lit page */}
        <line x1="20" y1="65" x2="80" y2="61" stroke="rgba(220, 180, 130, 0.45)" strokeWidth="0.4" />
        <line x1="20" y1="68" x2="75" y2="64" stroke="rgba(220, 180, 130, 0.35)" strokeWidth="0.4" />
        <line x1="118" y1="61" x2="180" y2="64" stroke="rgba(220, 180, 130, 0.4)" strokeWidth="0.4" />
        <line x1="118" y1="64" x2="170" y2="67" stroke="rgba(220, 180, 130, 0.3)" strokeWidth="0.4" />
        <defs>
          <linearGradient id="bookGradL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6c590" />
            <stop offset="100%" stopColor="#8a6238" />
          </linearGradient>
          <linearGradient id="bookGradR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6c590" />
            <stop offset="100%" stopColor="#8a6238" />
          </linearGradient>
        </defs>
      </svg>

      {/* Foreground LEFT-bottom vignette — anchors the headline overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.20) 55%, transparent 75%)",
        }}
      />

      {/* Bottom fade for the meta row */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </div>
  );
}
