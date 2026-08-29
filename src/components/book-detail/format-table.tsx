import type { BookFormat } from "@/lib/db/queries/catalog";
import { formatPrice } from "@/lib/format";

/**
 * The editions a book is available in, and how each one is bought.
 *
 * The central rule this component exists to enforce: **a print edition is
 * never an add-to-cart.** Amazon's KDP print pipeline only fulfils orders
 * placed on Amazon — it has no mechanism to ship a book ordered on this
 * site. So `fulfillment === "amazon"` renders a link out, labelled so the
 * reader knows they are leaving, and `fulfillment === "direct"` renders the
 * add-to-cart the storefront can actually honour.
 *
 * The second rule: no button without a destination. A print edition that
 * has been typeset but not yet uploaded to KDP has no ASIN, so there is
 * nowhere for a "Buy on Amazon" button to go. Those render as a stated
 * forthcoming edition instead of a button that 404s on Amazon.
 */

const FORMAT_LABELS: Record<BookFormat["format"], string> = {
  ebook: "Ebook",
  paperback: "Paperback",
  hardcover: "Hardcover",
  large_print: "Large print",
};

/** What the reader actually gets, in one line. */
const FORMAT_NOTES: Record<BookFormat["format"], string> = {
  ebook: "Watermarked PDF — yours to keep, readable on any device",
  paperback: "Printed and shipped by Amazon",
  hardcover: "Printed and shipped by Amazon",
  large_print: "Larger type, printed and shipped by Amazon",
};

function amazonHref(f: BookFormat): string | null {
  if (f.amazonUrl) return f.amazonUrl;
  if (f.amazonAsin) return `https://www.amazon.com/dp/${f.amazonAsin}`;
  return null;
}

export function FormatTable({
  formats,
  addToCartSlot,
}: {
  formats: BookFormat[];
  /**
   * The real add-to-cart island, rendered for the direct ebook row. Passed
   * in rather than imported so this stays a Server Component and the
   * client boundary remains exactly where it already was.
   */
  addToCartSlot?: React.ReactNode;
}) {
  if (formats.length === 0) return null;

  return (
    <section aria-labelledby="formats-heading" className="mt-12">
      <h2
        id="formats-heading"
        className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-bright"
      >
        Editions
      </h2>

      <ul className="mt-5 divide-y divide-white/[0.06] border-y border-white/[0.06]">
        {formats.map((f) => {
          const href = amazonHref(f);
          const buyable = f.availability === "available";
          const isDirect = f.fulfillment === "direct";

          return (
            <li
              key={f.format}
              className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[17px] text-fg-hi">
                  {FORMAT_LABELS[f.format]}
                </p>
                <p className="mt-0.5 text-[13px] text-fg-soft">
                  {FORMAT_NOTES[f.format]}
                  {f.pageCount ? ` · ${f.pageCount} pages` : ""}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {f.priceCents !== null && (
                  <span className="font-serif text-[17px] tabular-nums text-fg-hi">
                    {formatPrice(f.priceCents, f.currency)}
                  </span>
                )}

                {/* Direct ebook, buyable now → the real add-to-cart. */}
                {isDirect && buyable && addToCartSlot}

                {/* Amazon edition, live → link out, clearly marked. */}
                {!isDirect && buyable && href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="home-cta-secondary inline-flex h-10 items-center rounded-full px-5 text-sm font-medium"
                  >
                    Buy on Amazon
                    <span aria-hidden className="ml-1.5">
                      ↗
                    </span>
                    <span className="sr-only"> (opens on amazon.com)</span>
                  </a>
                )}

                {/* Everything else: the edition exists, you cannot buy it
                    here yet, and we say which of those two it is rather
                    than showing a button that goes nowhere. */}
                {!buyable && (
                  <span className="text-[13px] text-fg-fade">Not yet available</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {formats.some((f) => f.fulfillment === "amazon") && (
        <p className="mt-4 text-[13px] leading-relaxed text-fg-soft">
          Print editions are printed and shipped by Amazon. Valice Press
          cannot fulfil a print order placed on this site, so those buttons
          take you to Amazon to complete the purchase there.
        </p>
      )}
    </section>
  );
}
