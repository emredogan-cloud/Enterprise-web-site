import Link from "next/link";

/**
 * Quiet "continue browsing" closer for the book detail page.
 *
 * Phase 1.C — placeholder for the real `<RelatedBooks>` shelf the
 * execution roadmap calls for (a Phase 2/3 follow-up; needs a real
 * "books in the same category / by the same author" query that doesn't
 * exist today). For now we close the page with a centered editorial
 * line + two soft CTAs back to the catalog and the blog. Not noisy;
 * not empty either.
 */
export function ExploreStrip() {
  return (
    <section className="mx-auto mt-24 max-w-3xl px-6 text-center sm:mt-28">
      {/* Tiny emerald diamond — same micro-ornament as every editorial strip */}
      <div className="relative mx-auto flex h-5 w-5 items-center justify-center">
        <div
          aria-hidden
          className="absolute h-5 w-5 rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(51,240,170,0.6) 0%, transparent 70%)",
          }}
        />
        <span
          aria-hidden
          className="catalog-diamond block h-1.5 w-1.5 rounded-[1px] bg-[#33f0aa]"
          style={{ transform: "rotate(45deg)" }}
        />
      </div>

      <p className="mt-5 font-serif text-[18px] italic leading-relaxed text-[#a7a7a0] sm:text-[20px]">
        One book at a time. Yours to keep.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/books"
          className="home-cta-secondary inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold tracking-tight"
        >
          Browse the catalog
        </Link>
        <Link
          href="/blog/category/reading-guides"
          className="text-sm text-[#a7a7a0] transition-colors hover:text-[#33f0aa]"
        >
          Or pick from our reading guides →
        </Link>
      </div>
    </section>
  );
}
