/**
 * Quiet centered editorial statement closing the category page.
 *
 * Per the brief: tiny emerald diamond ornament + a short, calm line that
 * captures the editorial promise of the surface.
 *
 * Per-category copy lives in the SLOGANS map; an unknown slug falls back
 * to a generic "Stories, ideas, and notes" line.
 */
export function EditorialStrip({
  categorySlug,
}: {
  categorySlug: string;
}) {
  const slogan = SLOGANS[categorySlug] ?? DEFAULT_SLOGAN;

  return (
    <section className="mx-auto mt-20 max-w-3xl px-6 text-center sm:mt-24">
      {/* Tiny emerald diamond ornament (matches the hero diamond) */}
      <div className="relative mx-auto flex h-5 w-5 items-center justify-center">
        <div
          aria-hidden
          className="absolute h-5 w-5 rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(51, 240, 170, 0.6) 0%, transparent 70%)",
          }}
        />
        <span
          aria-hidden
          className="catalog-diamond block h-1.5 w-1.5 rounded-[1px] bg-[#33f0aa]"
          style={{ transform: "rotate(45deg)" }}
        />
      </div>

      <p className="mt-5 font-serif text-[18px] italic leading-relaxed text-[#a7a7a0] sm:text-[20px]">
        {slogan}
      </p>
    </section>
  );
}

const SLOGANS: Record<string, string> = {
  "reading-guides": "Better reading. Better thinking. Better living.",
  "behind-the-scenes":
    "Built in the open. Argued for. Shipped with intention.",
};
const DEFAULT_SLOGAN =
  "Stories, ideas, and notes from the Digital Bookstore.";
