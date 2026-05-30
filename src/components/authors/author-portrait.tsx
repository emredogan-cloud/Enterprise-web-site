import type { PortraitTheme } from "./demo-authors";

/**
 * CSS-rendered author "portrait" — a stylized atmospheric silhouette
 * that stands in for a real photograph until an image pipeline lands.
 *
 * Composition (layered, all CSS/SVG):
 *   1. Background gradient (mood)
 *   2. Soft accent bloom in the top corner
 *   3. SVG silhouette (head + shoulders) — same shape across all authors
 *      so the cards feel like a series; the *atmosphere* (rim light,
 *      gradient, accent) is what differentiates each portrait
 *   4. Rim-light highlight on the silhouette edge
 *   5. Foreground vignette anchoring the figure to the frame
 *
 * Hover behavior (driven by the parent `.group` from `<AuthorCard>`):
 *   - The silhouette layer scales 1.06 on a 700ms cubic-bezier ease-out
 */
export function AuthorPortrait({ theme }: { theme: PortraitTheme }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background gradient */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: theme.background }}
      />

      {/* Top-corner accent bloom */}
      <div
        aria-hidden
        className="absolute -right-8 -top-8 h-[140px] w-[140px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${theme.accent} 0%, transparent 70%)`,
        }}
      />

      {/* Silhouette + rim light — scales on group hover */}
      <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
        {/* Silhouette */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMax meet"
          className="absolute inset-x-0 bottom-0 h-[95%] w-full"
          aria-hidden
        >
          {/* Shoulders + chest — wide trapezoid */}
          <path
            d="M 12,100 C 12,72 28,62 30,60 L 30,58 L 70,58 L 70,60 C 72,62 88,72 88,100 Z"
            fill={theme.silhouette}
          />
          {/* Head — circle merged with shoulders */}
          <circle cx="50" cy="38" r="18" fill={theme.silhouette} />
        </svg>

        {/* Rim light — narrow gradient stripe on the silhouette's right edge */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[95%]"
          style={{
            background: `linear-gradient(95deg, transparent 55%, ${theme.rimLight} 75%, transparent 92%)`,
            mixBlendMode: "screen",
            maskImage:
              "radial-gradient(ellipse 40% 50% at 50% 65%, black 0%, black 60%, transparent 90%)",
            opacity: 0.55,
          }}
        />
      </div>

      {/* Foreground vignette — anchors the figure to the bottom of the frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 110%, rgba(0,0,0,0.55) 0%, transparent 65%)",
        }}
      />

      {/* Top fade — keeps the figure-ground separation crisp where the
          follower / featured chips sit */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[42%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
