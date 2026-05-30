/**
 * Cinematic floating book cluster — pure CSS, no Client JS.
 *
 * Phase 3 correction (Issue 1): the hero now suspends THREE books in a
 * cosmic field rather than standing one on a lit pedestal. A large emerald
 * aura, a blurred nebula "strip", a slow orbital ring + drifting motes and a
 * faint starfield give the depth/parallax the reference asked for — the books
 * read as floating in an emerald void, not pasted on a panel. Each book bobs
 * at its own speed (`--bob-dur`) so the cluster breathes with parallax; the
 * back two are scaled down, dimmed and softly blurred for atmospheric depth.
 *
 * Animations (`hero-bob`, `hero-orbit`, `home-hero-aura`, `home-particle`)
 * are CSS-only and reduced-motion-safe, so this whole section ships as static
 * HTML with zero hydration cost.
 */
export function HeroBook() {
  return (
    <div className="relative mx-auto flex h-[560px] w-full max-w-lg items-center justify-center sm:h-[640px]">
      {/* Aura — large emerald bloom, breathing */}
      <div
        aria-hidden
        className="home-hero-aura pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(22, 199, 132, 0.3) 0%, rgba(22, 199, 132, 0.1) 32%, transparent 66%)",
          zIndex: 0,
        }}
      />

      {/* Nebula strip — the "cosmic shelf" the cluster floats along */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[180px] w-[150%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(51,240,170,0.10) 30%, rgba(122,160,255,0.07) 55%, rgba(51,240,170,0.08) 72%, transparent 100%)",
          filter: "blur(26px)",
          maskImage:
            "linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)",
          zIndex: 0,
        }}
      />

      {/* Faint orbital ring (static) + a single orbiting glow dot */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#33f0aa]/[0.07]"
        style={{ transform: "translate(-50%, -50%) rotateX(64deg)", zIndex: 0 }}
      />
      <div
        aria-hidden
        className="hero-orbit pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px]"
        style={{ marginLeft: -240, marginTop: -240, zIndex: 0 }}
      >
        <span
          className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#33f0aa]"
          style={{ boxShadow: "0 0 10px 2px rgba(51,240,170,0.7)" }}
        />
      </div>

      {/* Starfield + drifting motes */}
      <Starfield />
      <Particles />

      {/* BACK-LEFT book — small, dim, blurred (deep) */}
      <FloatingBook
        wrapperClassName="absolute left-[1%] top-[11%] sm:left-[5%]"
        zIndex={10}
        rotate={-13}
        opacity={0.82}
        blur={1.6}
        bobDur={9}
        bobDelay={0.8}
        size="sm"
        eyebrow="Collected"
        kicker="A"
        title={["Nightfall", "Atlas"]}
        author="L. Vesper"
        gradient="linear-gradient(150deg, #14223f 0%, #070d1e 100%)"
        accent="#7ab6ff"
      />

      {/* BACK-RIGHT book — small, slightly dim (mid) */}
      <FloatingBook
        wrapperClassName="absolute right-[1%] top-[23%] sm:right-[5%]"
        zIndex={10}
        rotate={12}
        opacity={0.88}
        blur={1}
        bobDur={8}
        bobDelay={2.2}
        size="sm"
        eyebrow="Essays"
        kicker="The"
        title={["Quiet", "Hours"]}
        author="A. Solenne"
        gradient="linear-gradient(150deg, #0e2e26 0%, #061712 100%)"
        accent="#33f0aa"
      />

      {/* CENTER book — large, crisp, front (the hero) */}
      <FloatingBook
        center
        zIndex={20}
        rotate={-3}
        opacity={1}
        bobDur={7}
        bobDelay={0}
        size="lg"
        eyebrow="Featured · Volume I"
        kicker="The"
        title={["Forgotten", "Library"]}
        author="M. R. Ashford"
        gradient="linear-gradient(135deg, #0a2418 0%, #07110b 50%, #051209 100%)"
        accent="#33f0aa"
      />

      {/* Diffuse base glow — suspends the cluster (NOT a hard pedestal) */}
      <div
        aria-hidden
        className="home-hero-pedestal pointer-events-none absolute bottom-[12%] left-1/2 z-[5] h-[70px] w-[320px] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(51,240,170,0.55) 0%, rgba(22,199,132,0.18) 38%, transparent 72%)",
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FloatingBook — one suspended cover. Static rotation on the outer wrapper,   */
/* vertical bob on the inner element (so the two transforms don't collide).    */
/* -------------------------------------------------------------------------- */

function FloatingBook({
  wrapperClassName,
  center = false,
  zIndex,
  rotate,
  opacity = 1,
  blur = 0,
  bobDur,
  bobDelay,
  size,
  eyebrow,
  kicker,
  title,
  author,
  gradient,
  accent,
}: {
  wrapperClassName?: string;
  center?: boolean;
  zIndex: number;
  rotate: number;
  opacity?: number;
  blur?: number;
  bobDur: number;
  bobDelay: number;
  size: "lg" | "sm";
  eyebrow: string;
  kicker: string;
  title: [string, string];
  author: string;
  gradient: string;
  accent: string;
}) {
  const dims =
    size === "lg"
      ? "h-[372px] w-[260px] sm:h-[428px] sm:w-[300px]"
      : "h-[214px] w-[150px] sm:h-[244px] sm:w-[172px]";
  const titleSize =
    size === "lg" ? "text-[40px] sm:text-[44px]" : "text-[22px] sm:text-[26px]";
  const pad = size === "lg" ? "p-7" : "p-4";

  return (
    <div
      className={center ? "relative" : wrapperClassName}
      style={{ zIndex, opacity, filter: blur ? `blur(${blur}px)` : undefined }}
    >
      {/* Outer = static rotation; inner = vertical bob (parallax via --bob-dur) */}
      <div style={{ transform: `rotate(${rotate}deg)` }}>
        <div
          className="hero-bob"
          style={
            {
              ["--bob-dur" as string]: `${bobDur}s`,
              animationDelay: `${bobDelay}s`,
            } as React.CSSProperties
          }
        >
          <div className={`relative ${dims}`}>
            {/* Cover */}
            <div
              className={`absolute inset-0 overflow-hidden rounded-l-sm rounded-r-md shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85),0_0_40px_-10px_rgba(22,199,132,0.3)]`}
              style={{ background: gradient }}
            >
              {/* Library-window lines */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, transparent 0, transparent 16px, rgba(255,255,255,0.4) 16px, rgba(255,255,255,0.4) 17px)",
                  maskImage:
                    "linear-gradient(180deg, transparent 0%, black 40%, black 70%, transparent 90%)",
                  WebkitMaskImage:
                    "linear-gradient(180deg, transparent 0%, black 40%, black 70%, transparent 90%)",
                }}
              />
              {/* Corner accent glow */}
              <div
                aria-hidden
                className="absolute -right-8 -top-8 h-32 w-32 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${accent}55 0%, transparent 70%)`,
                }}
              />
              {/* Cover typography */}
              <div className={`absolute inset-0 flex flex-col justify-between ${pad}`}>
                <div
                  className="text-[9px] font-medium uppercase tracking-[0.3em] sm:text-[10px]"
                  style={{ color: `${accent}cc` }}
                >
                  {eyebrow}
                </div>
                <div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/40 sm:text-[10px]">
                    {kicker}
                  </p>
                  <h3
                    className={`mt-2 font-serif font-medium leading-[0.95] tracking-tight text-white ${titleSize}`}
                  >
                    {title[0]}
                    <br />
                    {title[1]}
                  </h3>
                  <p className="mt-5 text-[11px] text-white/50">{author}</p>
                </div>
              </div>
              {/* Inner shine */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
                }}
              />
            </div>
            {/* Right page-edge highlight */}
            <div
              aria-hidden
              className="absolute bottom-[2px] right-0 top-[2px] w-[3px] rounded-r-md"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.14) 100%)",
              }}
            />
            {/* Left spine */}
            <div
              aria-hidden
              className="absolute bottom-1 left-0 top-1 w-[2px] rounded-l-sm bg-black/40"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** ~14 static stars scattered behind the cluster — varied size + opacity. */
function Starfield() {
  const stars = [
    { left: "8%", top: "18%", s: 2, o: 0.7 },
    { left: "16%", top: "62%", s: 1, o: 0.5 },
    { left: "24%", top: "34%", s: 1.5, o: 0.6 },
    { left: "33%", top: "78%", s: 1, o: 0.4 },
    { left: "44%", top: "12%", s: 2, o: 0.8 },
    { left: "52%", top: "88%", s: 1, o: 0.5 },
    { left: "61%", top: "22%", s: 1.5, o: 0.6 },
    { left: "70%", top: "70%", s: 1, o: 0.45 },
    { left: "78%", top: "40%", s: 2, o: 0.7 },
    { left: "86%", top: "16%", s: 1, o: 0.5 },
    { left: "92%", top: "58%", s: 1.5, o: 0.6 },
    { left: "12%", top: "44%", s: 1, o: 0.4 },
    { left: "66%", top: "52%", s: 1, o: 0.45 },
    { left: "38%", top: "50%", s: 1.5, o: 0.55 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {stars.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: st.left,
            top: st.top,
            height: st.s,
            width: st.s,
            opacity: st.o,
            boxShadow: "0 0 4px rgba(255,255,255,0.6)",
          }}
        />
      ))}
    </div>
  );
}

/** Eight emerald motes drifting upward. */
function Particles() {
  const particles = [
    { left: "14%", delay: 0, duration: 8 },
    { left: "26%", delay: 2.4, duration: 9 },
    { left: "40%", delay: 4.8, duration: 7.5 },
    { left: "54%", delay: 1.2, duration: 8.5 },
    { left: "66%", delay: 3.6, duration: 7 },
    { left: "80%", delay: 5.6, duration: 9.5 },
    { left: "90%", delay: 0.8, duration: 8 },
    { left: "32%", delay: 6.2, duration: 10 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[6] overflow-hidden">
      {particles.map((p, i) => (
        <span
          key={i}
          className="home-particle absolute bottom-0 block h-1 w-1 rounded-full bg-[#33f0aa]"
          style={{
            left: p.left,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            boxShadow: "0 0 8px #33f0aa",
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
