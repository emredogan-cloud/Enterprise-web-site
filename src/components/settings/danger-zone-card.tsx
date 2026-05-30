import { DeleteAccountButton } from "@/components/delete-account-button";

/**
 * Delete account — isolated danger zone card.
 *
 * Reference treatment: dark glass with subtle warm-red atmospheric
 * burst on the right side. The button itself preserves Phase 3.A's
 * two-stage destruction-protection UX (typed "DELETE" confirmation),
 * just lives inside this richer card chrome now.
 *
 * Tone discipline: warm-red, not aggressive red. The brand is "buy
 * once, yours to keep" — deleting the account is a serious choice,
 * not an alarming one.
 */
export function DangerZoneCard() {
  return (
    <article className="home-glass relative overflow-hidden rounded-[28px]">
      {/* Top warm-red edge — softer + warmer than the emerald default */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff7a7a]/35 to-transparent"
      />

      <div className="grid gap-0 lg:grid-cols-[1.5fr_1fr]">
        {/* LEFT — copy + delete button */}
        <div className="p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff9b9b]">
            Danger zone
          </p>
          <h2 className="mt-2 font-serif text-[26px] font-medium leading-tight text-fg-hi sm:text-[28px]">
            Delete your account
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-fg-mid">
            Removes your personal data — reading progress, reviews, name,
            email. Commercial records (orders, receipts, entitlements) are
            retained for tax compliance, attached to an anonymized account
            row. This action is irreversible.
          </p>

          <div className="mt-7">
            <DeleteAccountButton />
          </div>
        </div>

        {/* Vertical divider on lg+ */}
        <div
          aria-hidden
          className="pointer-events-none hidden h-full w-px self-stretch bg-gradient-to-b from-transparent via-white/[0.08] to-transparent lg:block"
        />

        {/* RIGHT — red burst illustration */}
        <div className="relative h-[180px] overflow-hidden border-t border-white/[0.05] lg:h-auto lg:border-l lg:border-t-0">
          <DangerBurst />
        </div>
      </div>
    </article>
  );
}

/**
 * Atmospheric red burst — radial nebula in warm red, signaling
 * "permanent change" without screaming. Same compositional family as
 * the export illustration (dark base + bloom + drifting motes).
 */
function DangerBurst() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Base dark gradient */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 60% 50%, #2a0a0a 0%, #0a0405 60%, #050203 100%)",
        }}
      />

      {/* Primary red bloom — center-right */}
      <div
        aria-hidden
        className="absolute right-[15%] top-[35%] h-[280px] w-[280px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 100, 100, 0.45) 0%, rgba(190, 50, 50, 0.18) 35%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />

      {/* Secondary deeper red — lower */}
      <div
        aria-hidden
        className="absolute right-[25%] top-[55%] h-[180px] w-[180px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 70, 70, 0.25) 0%, transparent 65%)",
          filter: "blur(10px)",
        }}
      />

      {/* Burst particle pattern — looks like sparks, not snow */}
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <radialGradient id="burstCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 180, 180, 0.6)" />
            <stop offset="40%" stopColor="rgba(255, 100, 100, 0.3)" />
            <stop offset="100%" stopColor="rgba(255, 100, 100, 0)" />
          </radialGradient>
        </defs>

        {/* Bright core dot */}
        <circle cx="130" cy="100" r="14" fill="url(#burstCore)" />
        <circle
          cx="130"
          cy="100"
          r="3"
          fill="rgba(255, 220, 220, 0.85)"
          style={{ filter: "blur(0.5px)" }}
        />

        {/* Spark trails — short radial lines */}
        {SPARKS.map((s, i) => (
          <line
            key={i}
            x1="130"
            y1="100"
            x2={130 + Math.cos(s.angle) * s.length}
            y2={100 + Math.sin(s.angle) * s.length}
            stroke="rgba(255, 140, 140, 0.5)"
            strokeWidth="0.6"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Drifting motes — red-tinted */}
      {MOTES.map((m, i) => (
        <span
          key={i}
          aria-hidden
          className="catalog-dust absolute h-[2px] w-[2px] rounded-full bg-[#ff9b9b]"
          style={
            {
              left: m.left,
              top: m.top,
              animationDelay: `${m.delay}s`,
              boxShadow: "0 0 5px rgba(255, 155, 155, 0.8)",
              ["--dust-x" as string]: m.dustX,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Left edge fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-12 lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(10, 4, 5, 0.7) 0%, transparent 100%)",
        }}
      />

      {/* Top fade — keeps the danger eyebrow's mood crisp where panel meets */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-12"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

// 8 sparks radiating from the bright core at varying angles + lengths.
const SPARKS: ReadonlyArray<{ angle: number; length: number }> = [
  { angle: 0, length: 24 },
  { angle: Math.PI / 4, length: 18 },
  { angle: Math.PI / 2, length: 22 },
  { angle: (3 * Math.PI) / 4, length: 16 },
  { angle: Math.PI, length: 26 },
  { angle: (5 * Math.PI) / 4, length: 14 },
  { angle: (3 * Math.PI) / 2, length: 20 },
  { angle: (7 * Math.PI) / 4, length: 17 },
];

const MOTES: ReadonlyArray<{
  left: string;
  top: string;
  delay: string;
  dustX: string;
}> = [
  { left: "35%", top: "25%", delay: "0s", dustX: "10px" },
  { left: "55%", top: "70%", delay: "2.5s", dustX: "-12px" },
  { left: "80%", top: "30%", delay: "5s", dustX: "8px" },
  { left: "20%", top: "55%", delay: "7.5s", dustX: "-10px" },
];
