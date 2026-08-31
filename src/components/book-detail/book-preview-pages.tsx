import Image from "next/image";

import { getPreview } from "@/lib/previews";

/**
 * The book's preview: real pages from the book, rendered as images.
 *
 * This replaces a section that showed the same invented sample prose on
 * every product page — a passage about buying a DRM'd ebook, presented under
 * "Read the opening pages before you buy" as though it were an excerpt from
 * whichever book you were looking at. On the Meditations page it attributed
 * modern invented text to Marcus Aurelius.
 *
 * Images rather than extracted text, deliberately. Half this catalog is
 * bestiary plates, board diagrams and write-in puzzle grids; running those
 * through a text extractor produces something that is not the page and not
 * what the buyer would receive. A rendered page is the page.
 *
 * A book with no rendered preview renders nothing at all. There is no
 * fallback copy, because the only fallback available is the fabrication this
 * component exists to remove.
 */
export function BookPreviewPages({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const preview = getPreview(slug);
  if (!preview) return null;

  return (
    <section
      aria-labelledby="preview-heading"
      className="mx-auto mt-24 max-w-5xl px-4 sm:px-6"
    >
      <header className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
          Preview
        </p>

        <div className="relative mx-auto mt-4 flex h-6 w-6 items-center justify-center">
          <div
            aria-hidden
            className="absolute h-6 w-6 rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(circle, rgba(51,240,170,0.7) 0%, transparent 70%)",
            }}
          />
          <span
            aria-hidden
            className="catalog-diamond block h-2 w-2 rounded-[1px] bg-[#33f0aa]"
            style={{ transform: "rotate(45deg)" }}
          />
        </div>

        <h2 className="mt-5 font-serif text-[32px] font-medium leading-tight text-fg-hi sm:text-[40px]">
          Look inside
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-fg-mid">{preview.note}</p>
      </header>

      {/* Horizontal on wide screens, stacked on a phone. The scroller is its
          own overflow container so a wide page image never makes the body
          scroll sideways. */}
      <ul
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4
                   [scrollbar-width:thin] sm:gap-6"
      >
        {preview.pages.map((p) => (
          <li
            key={p.src}
            className="home-glass relative w-[78vw] max-w-[420px] shrink-0 snap-center
                       overflow-hidden rounded-[18px] p-2 sm:w-[340px]"
          >
            <Image
              src={p.src}
              // Described by page number rather than by inventing a summary
              // of what is on it — a screen reader user is told exactly what
              // this is and can go to the format table to buy the book.
              alt={`${title} — page ${p.page}`}
              width={1100}
              height={1650}
              className="h-auto w-full rounded-[12px] bg-white"
              sizes="(max-width: 640px) 78vw, 340px"
            />
            <p className="pb-1 pt-2 text-center text-[11px] tabular-nums text-fg-fade">
              Page {p.page}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-2 text-center text-[13px] text-fg-soft">
        {preview.pages.length} pages from the book itself, shown at reading
        size.
      </p>
    </section>
  );
}
