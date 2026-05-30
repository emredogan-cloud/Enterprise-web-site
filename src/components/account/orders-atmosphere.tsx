/**
 * Page-level atmospheric backdrop for `/account/orders`.
 *
 * A calm "premium account zone at night" — a soft emerald bloom behind the
 * hero, a faint side tint, a low fog band behind the order list, and slow
 * dust. Pure-CSS `fixed` overlay (z-index -10) so it sits behind every glass
 * panel without layout cost or scroll jank.
 *
 * Same family as `SettingsBackground` / `CategoriesBackground` — reuses the
 * shared `.catalog-dust` keyframe for consistent motion. Pure Server
 * Component.
 */
export function OrdersAtmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Top bloom — cradles the hero */}
      <div
        className="absolute -top-[240px] left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(22, 199, 132, 0.11) 0%, rgba(22, 199, 132, 0.04) 38%, transparent 70%)",
          filter: "blur(13px)",
        }}
      />

      {/* Right tint — keeps the order list edge alive */}
      <div
        className="absolute -right-[200px] top-[160px] h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(51, 240, 170, 0.06) 0%, rgba(94, 156, 245, 0.03) 40%, transparent 70%)",
          filter: "blur(16px)",
        }}
      />

      {/* Low fog band behind the list */}
      <div
        className="absolute inset-x-0 top-[54%] h-[300px]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(22, 199, 132, 0.045) 45%, transparent 100%)",
          filter: "blur(22px)",
        }}
      />

      {/* Bottom spill — warms the pagination + footer seam */}
      <div
        className="absolute -bottom-[240px] left-1/2 h-[500px] w-[1100px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(22, 199, 132, 0.07) 0%, transparent 60%)",
          filter: "blur(20px)",
        }}
      />

      {/* Drifting dust — sparse + calm */}
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
  { left: "10%", top: "20%", delay: "0s", dustX: "26px" },
  { left: "28%", top: "44%", delay: "3s", dustX: "-20px" },
  { left: "48%", top: "70%", delay: "6s", dustX: "22px" },
  { left: "66%", top: "26%", delay: "1.5s", dustX: "-26px" },
  { left: "80%", top: "56%", delay: "4.5s", dustX: "18px" },
  { left: "92%", top: "74%", delay: "7s", dustX: "-18px" },
  { left: "56%", top: "86%", delay: "2.5s", dustX: "24px" },
  { left: "18%", top: "80%", delay: "9s", dustX: "-16px" },
];
