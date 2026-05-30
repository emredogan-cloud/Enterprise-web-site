import { formatPrice } from "@/lib/format";

/**
 * Order summary — right-sidebar glass card.
 *
 * Subtotal / Tax / Total paid, with the total emphasized in emerald.
 *
 * Subtotal is derived (`totalCents - taxCents`) rather than queried
 * separately — Paddle stores total + tax, and tax is always the delta;
 * computing subtotal here avoids a denormalized column.
 *
 * Pure Server Component.
 */
export function OrderSummaryCard({
  totalCents,
  taxCents,
  currency,
}: {
  totalCents: number;
  taxCents: number;
  currency: string;
}) {
  const subtotalCents = Math.max(0, totalCents - taxCents);

  return (
    <article className="home-glass relative overflow-hidden rounded-[24px] p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
      />

      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
          Order summary
        </p>
      </header>

      <dl className="mt-5 space-y-3.5 text-sm">
        <Row label="Subtotal" value={formatPrice(subtotalCents, currency)} />
        <Row label="Tax" value={formatPrice(taxCents, currency)} />
      </dl>

      <div className="mt-5 border-t border-white/[0.06] pt-5">
        <dl className="flex items-baseline justify-between gap-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-mid">
            Total paid
          </dt>
          <dd className="font-serif text-[22px] font-medium tabular-nums text-emerald-bright">
            {formatPrice(totalCents, currency)}
          </dd>
        </dl>
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-fg-mid">{label}</dt>
      <dd className="tabular-nums text-fg-hi">{value}</dd>
    </div>
  );
}
