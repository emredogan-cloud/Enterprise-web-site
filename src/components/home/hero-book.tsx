/**
 * Cinematic floating book showcase — pure CSS, no Client JS.
 *
 * Built from layered DOM elements (cover gradient, spine highlight, title
 * typography, page-edge accent) so we don't depend on an external cover
 * image being uploaded. The `.home-hero-book` animation in globals.css
 * makes it float; `.home-hero-pedestal` and `.home-hero-aura` add the
 * stage-light beneath.
 *
 * Pedestal sits behind the book via z-index layering; the aura sits even
 * further back for the radial bloom.
 */
export function HeroBook() {
  return (
    <div className="relative mx-auto flex h-[520px] w-full max-w-md items-center justify-center sm:h-[600px]">
      {/* Aura — large radial bloom behind everything */}
      <div
        aria-hidden
        className="home-hero-aura pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(22, 199, 132, 0.32) 0%, rgba(22, 199, 132, 0.12) 30%, transparent 65%)",
          zIndex: 0,
        }}
      />

      {/* Background floating cards (mid-ground depth) */}
      <BackgroundCard
        className="-left-4 top-12 sm:-left-12"
        rotate={-12}
        depth={0.6}
      />
      <BackgroundCard
        className="-right-2 top-8 sm:-right-10"
        rotate={10}
        depth={0.5}
      />
      <BackgroundCard
        className="bottom-32 -left-2 sm:-left-8"
        rotate={6}
        depth={0.4}
      />

      {/* Particles drifting up — staggered via inline delays */}
      <Particles />

      {/* THE BOOK — central floating element */}
      <div
        className="home-hero-book relative z-20"
        style={{ transform: "rotate(-3deg)" }}
      >
        <div className="relative h-[400px] w-[280px] sm:h-[460px] sm:w-[320px]">
          {/* Cover */}
          <div
            className="absolute inset-0 overflow-hidden rounded-r-md rounded-l-sm shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),0_0_40px_-10px_rgba(22,199,132,0.3)]"
            style={{
              background:
                "linear-gradient(135deg, #0a2418 0%, #07110b 50%, #051209 100%)",
            }}
          >
            {/* Subtle library-window pattern */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent 0, transparent 18px, rgba(255,255,255,0.4) 18px, rgba(255,255,255,0.4) 19px)",
                maskImage:
                  "linear-gradient(180deg, transparent 0%, black 40%, black 70%, transparent 90%)",
              }}
            />

            {/* Top corner emerald glow */}
            <div
              aria-hidden
              className="absolute -right-8 -top-8 h-32 w-32 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(51, 240, 170, 0.4) 0%, transparent 70%)",
              }}
            />

            {/* Cover typography */}
            <div className="absolute inset-0 flex flex-col justify-between p-7">
              <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#33f0aa]/80">
                Featured · Volume I
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">
                  The
                </p>
                <h3 className="mt-2 font-serif text-[40px] font-medium leading-[0.95] tracking-tight text-white sm:text-[44px]">
                  Forgotten
                  <br />
                  Library
                </h3>
                <p className="mt-6 text-xs text-white/50">
                  M. R. Ashford
                </p>
              </div>
            </div>

            {/* Inner shine highlight */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background:
                  "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
              }}
            />
          </div>

          {/* Right edge — page thickness highlight */}
          <div
            aria-hidden
            className="absolute right-0 top-[2px] bottom-[2px] w-[3px] rounded-r-md"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.14) 100%)",
            }}
          />

          {/* Left spine — subtle inner edge */}
          <div
            aria-hidden
            className="absolute left-0 top-1 bottom-1 w-[2px] rounded-l-sm bg-black/40"
          />
        </div>
      </div>

      {/* Pedestal glow — beneath the book */}
      <div
        aria-hidden
        className="home-hero-pedestal pointer-events-none absolute bottom-[60px] left-1/2 z-10 h-[60px] w-[280px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, #33f0aa 0%, rgba(22, 199, 132, 0.4) 30%, transparent 70%)",
        }}
      />

      {/* Floor shadow — beneath the pedestal, deeper */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[40px] left-1/2 h-[40px] w-[320px] -translate-x-1/2 rounded-full bg-black/60 blur-2xl"
      />
    </div>
  );
}

/** Mid-ground card — suggests "other books / curated picks" depth. */
function BackgroundCard({
  className,
  rotate,
  depth,
}: {
  className: string;
  rotate: number;
  depth: number;
}) {
  return (
    <div
      aria-hidden
      className={`absolute z-10 h-32 w-24 rounded-md border border-white/10 ${className}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        opacity: depth,
        background:
          "linear-gradient(160deg, rgba(10, 36, 24, 0.7) 0%, rgba(7, 17, 11, 0.6) 100%)",
        backdropFilter: "blur(8px)",
        boxShadow:
          "0 12px 24px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
      }}
    />
  );
}

/** Eight subtle drifting particles. Animation duration + delay varies for organic feel. */
function Particles() {
  const particles = [
    { left: "10%", delay: 0, duration: 8 },
    { left: "22%", delay: 2.4, duration: 9 },
    { left: "38%", delay: 4.8, duration: 7.5 },
    { left: "52%", delay: 1.2, duration: 8.5 },
    { left: "68%", delay: 3.6, duration: 7 },
    { left: "82%", delay: 5.6, duration: 9.5 },
    { left: "92%", delay: 0.8, duration: 8 },
    { left: "30%", delay: 6.2, duration: 10 },
  ];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
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
