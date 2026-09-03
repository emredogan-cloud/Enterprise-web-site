import { CoverArt } from "@/components/cinematic/cover-art";

/**
 * OrderCoverStack — the "personal library" preview inside an order card.
 *
 * Renders up to three overlapping mini book covers + a "+N" overflow tile.
 * Each mini cover is the book's real cover (`coverSrc`, attached by the
 * orders query from the asset manifest); the typographic stand-in renders
 * only for a book that has no cover asset. The whole stack micro-zooms on
 * the parent card's `.group` hover.
 */

interface CoverItem {
  bookId: string;
  bookTitle: string;
  coverSrc?: string | null;
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
          <div className="relative h-16 w-11 overflow-hidden rounded-[5px] border border-white/10 bg-[#0a1410] shadow-[0_6px_14px_-6px_rgba(0,0,0,0.8)]">
            <CoverArt
              src={item.coverSrc}
              title={item.bookTitle}
              sizes="44px"
              titleClassName="font-serif text-[7px] font-medium leading-tight text-white line-clamp-2"
            />
          </div>
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
