/**
 * Page-level atmospheric backdrop for `/categories`.
 *
 * The discovery gallery should feel like a late-night walk past lit windows:
 * a soft emerald bloom cradling the hero, low drifting fog bands behind the
 * grid, and slow dust. Rendered as a pure-CSS `fixed` overlay (z-index -10)
 * so it sits behind every card without layout cost or scroll jank.
 *
 * Same family as `AboutBackground` / `SettingsBackground` — reuses the shared
 * `.catalog-dust` keyframe so motion stays consistent across the ecosystem.
 * Pure Server Component.
 */
export function CategoriesBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Top-center bloom — cradles the hero */}
      <div
        className="absolute -top-[280px] left-1/2 h-[700px] w-[1200px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(22, 199, 132, 0.13) 0%, rgba(22, 199, 132, 0.045) 38%, transparent 70%)",
          filter: "blur(14px)",
        }}
      />

      {/* Left + right mid blooms — keep the grid edges from going flat */}
      <div
        className="absolute left-[-220px] top-[40%] h-[560px] w-[560px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(51, 240, 170, 0.07) 0%, transparent 62%)",
          filter: "blur(18px)",
        }}
      />
      <div
        className="absolute right-[-200px] top-[52%] h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(94, 156, 245, 0.05) 0%, rgba(51, 240, 170, 0.05) 40%, transparent 70%)",
          filter: "blur(18px)",
        }}
      />

      {/* Low fog band — a soft horizontal sheet behind the lower grid */}
      <div
        className="absolute inset-x-0 top-[58%] h-[280px]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(22, 199, 132, 0.05) 45%, transparent 100%)",
          filter: "blur(22px)",
        }}
      />

      {/* Bottom emerald spill — warms the discovery strip + footer seam */}
      <div
        className="absolute -bottom-[240px] left-1/2 h-[500px] w-[1100px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(22, 199, 132, 0.08) 0%, transparent 60%)",
          filter: "blur(20px)",
        }}
      />

      {/* Drifting dust — sparse + calm; shared keyframe */}
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

const DUST: ReadonlyArray<{
  left: string;
  top: string;
  delay: string;
  dustX: string;
}> = [
  { left: "12%", top: "16%", delay: "0s", dustX: "28px" },
  { left: "30%", top: "38%", delay: "3s", dustX: "-22px" },
  { left: "46%", top: "66%", delay: "6s", dustX: "24px" },
  { left: "64%", top: "22%", delay: "1.5s", dustX: "-28px" },
  { left: "78%", top: "52%", delay: "4.5s", dustX: "18px" },
  { left: "90%", top: "72%", delay: "7s", dustX: "-20px" },
  { left: "54%", top: "84%", delay: "2.5s", dustX: "26px" },
  { left: "20%", top: "76%", delay: "9s", dustX: "-16px" },
  { left: "38%", top: "12%", delay: "5.5s", dustX: "20px" },
];
