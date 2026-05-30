import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { OrderStatus, UserOrderSummary } from "@/lib/db/queries/account";
import { formatPrice } from "@/lib/format";

import { OrderCoverStack } from "./order-cover-stack";

/**
 * OrderCard — one cinematic row in the order history.
 *
 * Three zones (per the reference), wholly wrapped in a `<Link>` to the
 * existing `/order/[id]` detail page (a big, accessible target — no nested
 * interactive elements):
 *   LEFT   — ORDER eyebrow + short id + purchase date / time
 *   CENTER — `<OrderCoverStack>` book previews ("personal library" feel)
 *   RIGHT  — soft status pill + supporting line + price + "View details"
 *
 * Reuses `.home-glass` + `.home-card-hover`. Dates are formatted in UTC so
 * the server and client render identically (this card hydrates inside the
 * client `<OrdersBrowser>`).
 */

// UTC-fixed so SSR + hydration agree (no timezone mismatch flicker).
const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});
const TIME_FMT = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

interface StatusStyle {
  label: string;
  line: string;
  border: string;
  bg: string;
  text: string;
  dot: string;
}

const STATUS_CONFIG: Record<OrderStatus, StatusStyle> = {
  paid: {
    label: "Completed",
    line: "All items available in your library.",
    border: "border-emerald-bright/30",
    bg: "bg-emerald-bright/8",
    text: "text-emerald-bright",
    dot: "bg-[#33f0aa] shadow-[0_0_6px_#33f0aa]",
  },
  pending: {
    label: "Processing",
    line: "Preparing your digital items.",
    border: "border-[#ffce63]/30",
    bg: "bg-[#ffce63]/8",
    text: "text-[#ffce63]",
    dot: "bg-[#ffce63] animate-pulse",
  },
  failed: {
    label: "Failed",
    line: "Payment could not be processed.",
    border: "border-[#ff6a6a]/30",
    bg: "bg-[#ff6a6a]/8",
    text: "text-[#ff9b9b]",
    dot: "bg-[#ff6a6a]",
  },
  refunded: {
    label: "Refunded",
    line: "This order was refunded.",
    border: "border-white/[0.14]",
    bg: "bg-white/[0.04]",
    text: "text-fg-mid",
    dot: "bg-[#a7a7a0]",
  },
};

export function OrderCard({ order }: { order: UserOrderSummary }) {
  const status = STATUS_CONFIG[order.status];
  const shortId = order.id.slice(0, 8).toUpperCase();

  return (
    <Link
      href={`/order/${order.id}`}
      className="group block rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-bright/50"
    >
      <article className="home-glass home-card-hover relative overflow-hidden rounded-[24px] p-5 sm:p-6">
        {/* Top emerald edge line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/30 to-transparent"
        />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          {/* LEFT — metadata */}
          <div className="min-w-0 sm:w-[190px] sm:flex-shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-fg-soft">
              Order
            </p>
            <p className="mt-1.5 font-mono text-[15px] tracking-tight text-fg-hi">
              #{shortId}
            </p>
            <p className="mt-2 text-sm text-fg-mid">
              {DATE_FMT.format(order.createdAt)}
            </p>
            <p className="mt-0.5 text-xs tabular-nums text-fg-soft">
              {TIME_FMT.format(order.createdAt)} UTC
            </p>
          </div>

          {/* CENTER — book previews */}
          <div className="flex flex-1 justify-start sm:justify-center">
            <OrderCoverStack items={order.items} />
          </div>

          {/* RIGHT — status + price + CTA */}
          <div className="flex flex-col gap-3 sm:w-[230px] sm:flex-shrink-0 sm:items-end">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border ${status.border} ${status.bg} px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${status.text}`}
            >
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>

            <p className="text-xs leading-relaxed text-fg-soft sm:text-right">
              {status.line}
            </p>

            <p className="font-serif text-[22px] font-medium tabular-nums text-fg-hi">
              {formatPrice(order.totalCents, order.currency)}
            </p>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-bright transition-colors group-hover:text-fg-hi">
              View details
              <ArrowRight
                aria-hidden
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
