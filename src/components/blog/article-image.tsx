/**
 * Article preview "scene" — a CSS-rendered cinematic vignette per category.
 *
 * No photo asset pipeline yet, so each scene is composed from layered
 * gradients + geometric primitives to evoke the article's tone:
 *   - `warm-library` — open book on warm parchment, soft amber bloom
 *   - `emerald-portal` — glowing arched doorway flanked by shelves
 *   - `dark-shelf` — stacked book spines on a muted dark warm wall
 *
 * Each scene scales gracefully, looks distinctive at thumbnail size, and
 * carries the dark cinematic DNA of the site. Slow zoom on hover is
 * driven by the parent `<ArticleRow>` via `group-hover` utilities.
 */

export type ArticleScene = "warm-library" | "emerald-portal" | "dark-shelf";

/** Map a post slug → scene. Falls back to `dark-shelf` for new posts. */
export function sceneForSlug(slug: string): ArticleScene {
  if (slug.includes("how-to-choose")) return "warm-library";
  if (slug.includes("why-we-built")) return "emerald-portal";
  if (slug.includes("designing-for-readers")) return "dark-shelf";
  return "dark-shelf";
}

export function ArticleImage({ scene }: { scene: ArticleScene }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[22px] border border-white/[0.08] shadow-[0_24px_56px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)_inset]">
      {/* Emerald edge glow — subtle top-light wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/30 to-transparent"
      />

      {/* The actual scene — wrapped in a parent group-hover zoom target */}
      <div
        className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
      >
        {scene === "warm-library" && <WarmLibraryScene />}
        {scene === "emerald-portal" && <EmeraldPortalScene />}
        {scene === "dark-shelf" && <DarkShelfScene />}
      </div>

      {/* Foreground vignette — anchors the scene + adds depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,0,0,0.5) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 1 — warm library / open book                                         */
/* -------------------------------------------------------------------------- */

function WarmLibraryScene() {
  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          "linear-gradient(160deg, #5e3a1d 0%, #2b1709 60%, #14080b 100%)",
      }}
    >
      {/* Faint horizontal shelf lines */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent 0, transparent 28px, rgba(0,0,0,0.45) 28px, rgba(0,0,0,0.45) 29px)",
        }}
      />

      {/* Warm bloom behind the book */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[58%] h-[260px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255, 198, 110, 0.45) 0%, rgba(255, 150, 60, 0.18) 35%, transparent 70%)",
        }}
      />

      {/* The open book — two pages + spine */}
      <div className="absolute left-1/2 top-1/2 flex h-[55%] w-[78%] -translate-x-1/2 -translate-y-1/2 items-stretch">
        {/* Left page */}
        <div
          className="relative flex-1 rounded-l-md"
          style={{
            background:
              "linear-gradient(180deg, #f0e6c8 0%, #d6c794 100%)",
            boxShadow:
              "inset 6px 0 12px -6px rgba(0,0,0,0.4), 0 12px 30px -8px rgba(0,0,0,0.5)",
            transform: "perspective(800px) rotateY(8deg)",
            transformOrigin: "right center",
          }}
        >
          {/* Faux text lines */}
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute h-[2px] rounded-full bg-[#8b6f3a]/40"
              style={{
                top: `${18 + i * 12}%`,
                left: "12%",
                right: `${12 + (i % 3) * 8}%`,
              }}
            />
          ))}
        </div>
        {/* Center spine */}
        <div
          aria-hidden
          className="w-[2px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 100%)",
          }}
        />
        {/* Right page */}
        <div
          className="relative flex-1 rounded-r-md"
          style={{
            background:
              "linear-gradient(180deg, #f0e6c8 0%, #d6c794 100%)",
            boxShadow:
              "inset -6px 0 12px -6px rgba(0,0,0,0.4), 0 12px 30px -8px rgba(0,0,0,0.5)",
            transform: "perspective(800px) rotateY(-8deg)",
            transformOrigin: "left center",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute h-[2px] rounded-full bg-[#8b6f3a]/40"
              style={{
                top: `${18 + i * 12}%`,
                left: `${12 + (i % 3) * 8}%`,
                right: "12%",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 2 — emerald portal (matches the "Why we built" article reference)    */
/* -------------------------------------------------------------------------- */

function EmeraldPortalScene() {
  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          "radial-gradient(ellipse at 50% 70%, #08221a 0%, #04130d 60%, #020806 100%)",
      }}
    >
      {/* Vertical bookshelf rim suggestion — left flank */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-[18%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0, transparent 8px, rgba(180,140,90,0.22) 8px, rgba(180,140,90,0.22) 12px, transparent 12px, transparent 26px, rgba(120,100,70,0.18) 26px, rgba(120,100,70,0.18) 32px)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 25%, black 80%, transparent 100%)",
        }}
      />
      {/* Vertical bookshelf rim — right flank */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-[18%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0, transparent 8px, rgba(180,140,90,0.22) 8px, rgba(180,140,90,0.22) 12px, transparent 12px, transparent 26px, rgba(120,100,70,0.18) 26px, rgba(120,100,70,0.18) 32px)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 25%, black 80%, transparent 100%)",
        }}
      />

      {/* Strong central emerald aura */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[55%] h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(51, 240, 170, 0.55) 0%, rgba(22, 199, 132, 0.22) 30%, transparent 65%)",
        }}
      />

      {/* The arched portal */}
      <div
        className="absolute left-1/2 top-1/2 h-[68%] w-[42%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "linear-gradient(180deg, rgba(51, 240, 170, 0.95) 0%, rgba(22, 199, 132, 0.85) 60%, rgba(8, 60, 38, 0.6) 100%)",
          borderRadius: "50% 50% 8px 8px / 28% 28% 8px 8px",
          boxShadow:
            "0 0 60px 12px rgba(51, 240, 170, 0.5), inset 0 -20px 40px rgba(0,0,0,0.4)",
        }}
      />

      {/* Floor reflection */}
      <div
        aria-hidden
        className="absolute bottom-[12%] left-1/2 h-[30px] w-[60%] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(51,240,170,0.4) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 3 — dark shelf with stacked book spines                              */
/* -------------------------------------------------------------------------- */

function DarkShelfScene() {
  // Hand-tuned spine palette so the row of "books" feels collected, not random.
  const spines = [
    { width: 14, color: "#7a3a2b", height: 78 },
    { width: 10, color: "#3a4c3f", height: 88 },
    { width: 16, color: "#2c3852", height: 72 },
    { width: 12, color: "#5e3826", height: 82 },
    { width: 18, color: "#1f2d24", height: 92 },
    { width: 10, color: "#6b5028", height: 76 },
    { width: 14, color: "#3b2438", height: 84 },
    { width: 12, color: "#2c3441", height: 80 },
    { width: 16, color: "#4a3225", height: 88 },
    { width: 10, color: "#293c30", height: 74 },
    { width: 14, color: "#5b3a52", height: 86 },
    { width: 18, color: "#1b2528", height: 80 },
    { width: 12, color: "#6e4f30", height: 84 },
  ];

  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          "linear-gradient(180deg, #1a1410 0%, #0a0608 70%, #050304 100%)",
      }}
    >
      {/* Warm side-light bloom (top-right) */}
      <div
        aria-hidden
        className="absolute -right-12 -top-12 h-[260px] w-[280px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 178, 90, 0.22) 0%, transparent 70%)",
        }}
      />

      {/* The shelf — single row of stacked spines, centered */}
      <div className="absolute inset-x-0 bottom-[18%] flex items-end justify-center gap-[3px] px-6">
        {spines.map((s, i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{
              width: `${s.width}px`,
              height: `${s.height}%`,
              background: `linear-gradient(180deg, ${s.color} 0%, ${darken(s.color, 0.35)} 100%)`,
              boxShadow:
                "inset 1px 0 0 rgba(255,255,255,0.08), inset -1px 0 0 rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.5)",
            }}
          >
            {/* Tiny gold band — only on some spines */}
            {i % 3 === 0 && (
              <span
                aria-hidden
                className="mt-2 block h-[2px] w-[60%] rounded-full bg-[#d4a020]/40"
                style={{ marginLeft: "20%" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Shelf surface — dark wood band beneath the spines */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[16%]"
        style={{
          background:
            "linear-gradient(180deg, #2a1810 0%, #0a0405 100%)",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.6)",
        }}
      />
    </div>
  );
}

/** Quick darken-by-percent for spine bottom-gradient (string in, string out). */
function darken(hex: string, amount: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
