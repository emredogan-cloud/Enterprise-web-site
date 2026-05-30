import { BookCover } from "@/components/book-detail/book-cover";
import { DownloadButton } from "@/components/download-button";
import type { OrderEntitlement } from "@/lib/db/queries/account";
import { formatPrice } from "@/lib/format";

/**
 * Your digital items — main glass panel with per-book rows.
 *
 * Each row: small book cover LEFT, title + author CENTER, price + status
 * pill RIGHT. When a book is `ready`, the right cluster also shows a
 * `<DownloadButton>` so the reader can pull the file immediately
 * without leaving the order page.
 *
 * Reuses:
 *   - `<BookCover>` (Phase 1.C) — same cinematic cover with emerald
 *     rim used on the book detail page
 *   - `<DownloadButton>` (Phase 1.E rewrite) — same server action
 *     contract as `/account/library`
 *
 * Pure Server Component (DownloadButton is the only client island
 * inside each row).
 */
export function OrderItemsPanel({
  entitlements,
  currency,
}: {
  entitlements: ReadonlyArray<OrderEntitlement>;
  currency: string;
}) {
  return (
    <section aria-labelledby="order-items-heading">
      <header className="mb-5 flex items-baseline justify-between gap-4">
        <h2
          id="order-items-heading"
          className="font-serif text-[24px] font-medium leading-tight text-fg-hi sm:text-[28px]"
        >
          Your digital items
        </h2>
        <p className="text-[11px] uppercase tracking-[0.18em] text-fg-soft">
          {entitlements.length}{" "}
          {entitlements.length === 1 ? "title" : "titles"}
        </p>
      </header>

      <article className="home-glass relative overflow-hidden rounded-[28px] p-3 sm:p-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
        />

        <ul className="divide-y divide-white/[0.05]">
          {entitlements.map((ent) => (
            <li key={ent.bookId}>
              <OrderItemRow item={ent} currency={currency} />
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

function OrderItemRow({
  item,
  currency,
}: {
  item: OrderEntitlement;
  currency: string;
}) {
  const priceLabel =
    item.priceCentsAtPurchase !== null
      ? formatPrice(item.priceCentsAtPurchase, currency)
      : null;

  return (
    <div className="flex items-center gap-5 p-3 transition-colors hover:bg-white/[0.02] sm:p-4">
      {/* Cover — w-16 keeps the row compact */}
      <div className="w-16 flex-shrink-0 sm:w-20">
        <BookCover title={item.book.title} coverKey={item.book.coverKey} />
      </div>

      {/* Title + subtitle */}
      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-[18px] font-medium leading-tight text-fg-hi">
          {item.book.title}
        </h3>
        {item.book.subtitle && (
          <p className="mt-1 line-clamp-1 text-sm italic text-fg-mid">
            {item.book.subtitle}
          </p>
        )}

        {/* Per-status microcopy */}
        {item.status === "pending" && (
          <p className="mt-2 text-xs text-fg-soft">
            You&apos;ll receive an email once ready.
          </p>
        )}
        {item.status === "revoked" && (
          <p className="mt-2 text-xs text-[#ff9b9b]">
            This book is no longer accessible. Contact support if you believe
            this is an error.
          </p>
        )}
      </div>

      {/* Right cluster — price + status / download */}
      <div className="flex flex-col items-end gap-2.5 sm:gap-3">
        {priceLabel && (
          <span className="font-serif text-[17px] font-medium tabular-nums text-fg-hi">
            {priceLabel}
          </span>
        )}

        <ItemStatusPill status={item.status} />

        {item.status === "ready" && (
          <DownloadButton bookId={item.bookId} size="sm" />
        )}
      </div>
    </div>
  );
}

function ItemStatusPill({ status }: { status: OrderEntitlement["status"] }) {
  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-bright/30 bg-emerald-bright/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-bright">
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-emerald-bright shadow-[0_0_6px_#33f0aa]"
        />
        Ready
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-fg-mid">
        <span
          aria-hidden
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-bright shadow-[0_0_6px_#33f0aa]"
        />
        Preparing
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff7a7a]/30 bg-[#ff7a7a]/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#ff9b9b]">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#ff7a7a]" />
      Revoked
    </span>
  );
}
