/**
 * Page-level atmospheric backdrop for `/about`.
 *
 * The reference page reads "alive but calm" — a deep, late-night surface
 * with a soft emerald bloom cradling the hero, a fainter tint mid-page so
 * the manifesto strip never floats over flat black, and drifting dust for
 * depth. Rendered as a pure-CSS `fixed` overlay so it sits behind every
 * section without contributing layout cost or scroll jank.
 *
 * Same family as `SettingsBackground` — re-using the shared `.catalog-dust`
 * keyframe keeps page motion consistent across the cinematic ecosystem.
 * Pure Server Component.
 */
export function AboutBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Top-center bloom — cradles the hero headline + scene */}
      <div
        className="absolute -top-[260px] left-1/2 h-[680px] w-[1100px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(22, 199, 132, 0.12) 0%, rgba(22, 199, 132, 0.04) 38%, transparent 70%)",
          filter: "blur(12px)",
        }}
      />

      {/* Right nebula tint — slightly bluer, hints at a night window */}
      <div
        className="absolute -right-[200px] top-[120px] h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(51, 240, 170, 0.07) 0%, rgba(94, 156, 245, 0.035) 38%, transparent 70%)",
          filter: "blur(16px)",
        }}
      />

      {/* Mid-page left spill — keeps "Who built it" warm */}
      <div
        className="absolute left-[-220px] top-[46%] h-[560px] w-[560px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(22, 199, 132, 0.07) 0%, transparent 62%)",
          filter: "blur(18px)",
        }}
      />

      {/* Bottom emerald spill — warms the manifesto strip + footer seam */}
      <div
        className="absolute -bottom-[240px] left-1/2 h-[520px] w-[1100px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(22, 199, 132, 0.08) 0%, transparent 60%)",
          filter: "blur(20px)",
        }}
      />

      {/* Drifting dust — sparse + calm; same keyframe every cinematic hero uses */}
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

// Hand-tuned positions — sparse enough to read as "atmosphere," not "snow."
const DUST: ReadonlyArray<{
  left: string;
  top: string;
  delay: string;
  dustX: string;
}> = [
  { left: "10%", top: "18%", delay: "0s", dustX: "28px" },
  { left: "26%", top: "44%", delay: "3s", dustX: "-22px" },
  { left: "42%", top: "72%", delay: "6s", dustX: "24px" },
  { left: "60%", top: "24%", delay: "1.5s", dustX: "-28px" },
  { left: "74%", top: "58%", delay: "4.5s", dustX: "18px" },
  { left: "90%", top: "78%", delay: "7s", dustX: "-20px" },
  { left: "52%", top: "88%", delay: "2.5s", dustX: "26px" },
  { left: "18%", top: "82%", delay: "9s", dustX: "-16px" },
];
