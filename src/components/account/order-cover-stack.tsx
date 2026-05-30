/**
 * OrderCoverStack — the "personal library" preview inside an order card.
 *
 * Renders up to three overlapping mini book covers + a "+N" overflow tile.
 * Covers are *cinematic dark placeholders* (deterministic gradient by title +
 * a serif initial + spine sheen) rather than the shared `<CoverImage>`, whose
 * placeholder uses light-theme tokens that would glow bright on this dark
 * surface. This is the "temporary imagery, architecture-first" the brief asks
 * for — future-ready to swap in real covers once an order-cover asset path
 * exists. No empty slots.
 *
 * The whole stack micro-zooms on the parent card's `.group` hover.
 */

interface CoverItem {
  bookId: string;
  bookTitle: string;
}

export function OrderCoverStack({ items }: { items: CoverItem[] }) {
  const visible = items.slice(0, 3);
  const overflow = items.length - visible.length;

  if (items.length === 0) return null;

  return (
    <div className="flex items-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]">
      {visible.map((item, i) => (
        <div
          key={item.bookId}
          className={i > 0 ? "-ml-4" : ""}
          style={{ zIndex: i + 1 }}
        >
          <MiniCover title={item.bookTitle} />
        </div>
      ))}

      {overflow > 0 && (
        <div className="-ml-4" style={{ zIndex: visible.length + 1 }}>
          <div className="flex h-16 w-11 items-center justify-center rounded-[5px] border border-white/[0.12] bg-[#0c1813]/90 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.85)] backdrop-blur-sm">
            <span className="font-serif text-sm font-medium text-emerald-bright">
              +{overflow}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniCover({ title }: { title: string }) {
  const palette = COVER_PALETTE[hashString(title) % COVER_PALETTE.length];
  const initial = (title.trim().charAt(0) || "?").toUpperCase();

  return (
    <div
      className="relative h-16 w-11 overflow-hidden rounded-[5px] border border-white/10 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.8)]"
      style={{ background: palette.bg }}
    >
      {/* Spine sheen — left edge */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.20), rgba(255,255,255,0.02))",
        }}
      />
      {/* Corner glow */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 30% 18%, ${palette.glow}, transparent 62%)`,
        }}
      />
      {/* Title initial */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span aria-hidden className="font-serif text-lg text-white/75">
          {initial}
        </span>
      </div>
      {/* Bottom shade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: "linear-gradient(0deg, rgba(0,0,0,0.4), transparent)",
        }}
      />
    </div>
  );
}

/** Deterministic char-sum hash → stable cover color per title. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

const COVER_PALETTE: ReadonlyArray<{ bg: string; glow: string }> = [
  { bg: "linear-gradient(160deg, #13362a 0%, #081a12 100%)", glow: "rgba(51,240,170,0.28)" },
  { bg: "linear-gradient(160deg, #1b2546 0%, #080c1e 100%)", glow: "rgba(122,182,255,0.24)" },
  { bg: "linear-gradient(160deg, #3a1620 0%, #160a10 100%)", glow: "rgba(255,138,170,0.22)" },
  { bg: "linear-gradient(160deg, #3a2a12 0%, #160f06 100%)", glow: "rgba(255,200,99,0.24)" },
  { bg: "linear-gradient(160deg, #2c1a3e 0%, #100818 100%)", glow: "rgba(177,140,255,0.24)" },
  { bg: "linear-gradient(160deg, #123433 0%, #061818 100%)", glow: "rgba(94,228,216,0.24)" },
];
