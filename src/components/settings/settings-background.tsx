/**
 * Page-level atmospheric backdrop for `/account/settings`.
 *
 * The reference image is "alive but calm" — a deep dark surface with
 * a soft emerald bloom behind the cards, a faint nebula tint
 * top-right, and drifting dust. This component renders that as a
 * pure-CSS `fixed` overlay so it sits behind every card in the page
 * without contributing layout cost or scroll jank.
 *
 * Pure Server Component. Animation comes from the existing
 * `.catalog-dust` keyframe scoped under `.cinematic-root`.
 */
export function SettingsBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Wide top-left emerald bloom — the warmest part of the page */}
      <div
        className="absolute -left-[200px] -top-[200px] h-[600px] w-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(22, 199, 132, 0.10) 0%, rgba(22, 199, 132, 0.04) 35%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />

      {/* Top-right nebula tint — slightly bluer, hints at sky */}
      <div
        className="absolute -right-[180px] top-[80px] h-[500px] w-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(51, 240, 170, 0.07) 0%, rgba(94, 156, 245, 0.04) 35%, transparent 70%)",
          filter: "blur(14px)",
        }}
      />

      {/* Bottom emerald spill — keeps the trust strip and footer warm */}
      <div
        className="absolute -bottom-[200px] left-1/2 h-[500px] w-[1000px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(22, 199, 132, 0.08) 0%, transparent 60%)",
          filter: "blur(20px)",
        }}
      />

      {/* Drifting dust — sparse, calm. Same keyframe + var trick used by every
          cinematic hero, so motion stays consistent across the site. */}
      <div className="absolute inset-0">
        {DUST.map((d, i) => (
          <span
            key={i}
            className="catalog-dust absolute h-[3px] w-[3px] rounded-full bg-emerald-bright"
            style={
              {
                left: d.left,
                top: d.top,
                animationDelay: `${d.delay}s`,
                boxShadow: "0 0 6px rgba(51, 240, 170, 0.7)",
                ["--dust-x" as string]: d.dustX,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

// Hand-tuned positions across the viewport — sparse enough to read as
// "atmosphere" rather than "snow."
const DUST: ReadonlyArray<{
  left: string;
  top: string;
  delay: string;
  dustX: string;
}> = [
  { left: "8%", top: "15%", delay: "0s", dustX: "30px" },
  { left: "22%", top: "40%", delay: "3s", dustX: "-20px" },
  { left: "38%", top: "70%", delay: "6s", dustX: "25px" },
  { left: "58%", top: "20%", delay: "1.5s", dustX: "-30px" },
  { left: "72%", top: "55%", delay: "4.5s", dustX: "18px" },
  { left: "88%", top: "75%", delay: "7s", dustX: "-22px" },
  { left: "50%", top: "85%", delay: "2.5s", dustX: "28px" },
  { left: "15%", top: "80%", delay: "9s", dustX: "-18px" },
];
