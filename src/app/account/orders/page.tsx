import type { Metadata } from "next";
import Link from "next/link";

import { CinematicHero } from "@/components/cinematic/cinematic-hero";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { loadAuthenticatedLocalUser } from "@/lib/account";
import {
  type UserOrderSummary,
  getUserOrders,
} from "@/lib/db/queries/account";
import { formatPrice } from "@/lib/format";

/**
 * /account/orders — order history list.
 *
 * Phase 2.C cinematic redesign (Account Dashboard family). Same shell as
 * the rest of the cinematic surfaces; long-form order rows inside a
 * `home-glass` panel.
 *
 * Classification stays `ƒ Dynamic` — per-user session + per-request DB
 * read; never cache.
 */

// Per-user, per-request — never cache.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
};

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
});

const ORDER_STATUS_LABEL: Record<UserOrderSummary["status"], string> = {
  paid: "Paid",
  pending: "Awaiting confirmation",
  failed: "Failed",
  refunded: "Refunded",
};

/**
 * Status-pill tone per order status. Keeps the visual hierarchy tight —
 * paid is emerald, pending is calm, failed/refunded are warm reds.
 */
const ORDER_STATUS_TONE: Record<
  UserOrderSummary["status"],
  { border: string; bg: string; text: string; dot: string }
> = {
  paid: {
    border: "border-[#33f0aa]/30",
    bg: "bg-[#33f0aa]/8",
    text: "text-[#33f0aa]",
    dot: "bg-[#33f0aa] shadow-[0_0_6px_#33f0aa]",
  },
  pending: {
    border: "border-white/[0.12]",
    bg: "bg-white/[0.04]",
    text: "text-[#a7a7a0]",
    dot: "bg-[#a7a7a0] animate-pulse",
  },
  failed: {
    border: "border-[#ff6a6a]/30",
    bg: "bg-[#ff6a6a]/8",
    text: "text-[#ff9b9b]",
    dot: "bg-[#ff6a6a]",
  },
  refunded: {
    border: "border-[#ffce63]/30",
    bg: "bg-[#ffce63]/8",
    text: "text-[#ffce63]",
    dot: "bg-[#ffce63]",
  },
};

export default async function OrdersPage() {
  const userCtx = await loadAuthenticatedLocalUser();
  if (!userCtx.ok) {
    return (
      <UnprovisionedNotice
        title={userCtx.title}
        body={userCtx.body}
        missing={userCtx.missing}
      />
    );
  }

  const orders = await getUserOrders(userCtx.localUserId);

  return (
    <div className="cinematic-root">
      <CinematicHeader />

      <main className="relative z-10">
        <CinematicHero
          eyebrow="Your account"
          headlineHead="Your"
          headlineTail="orders"
          size="md"
          align="center"
          subtitle={
            <p>
              {orders.length === 0
                ? "No orders yet."
                : orders.length === 1
                  ? "One order in your history."
                  : `${orders.length} orders in your history.`}
            </p>
          }
        />

        <section className="mx-auto mt-16 max-w-3xl px-4 sm:px-6">
          {orders.length === 0 ? (
            <div className="home-glass relative overflow-hidden rounded-[24px] p-10 text-center">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/35 to-transparent"
              />
              <p className="font-serif text-[20px] font-medium leading-tight text-[#e6e6e0] sm:text-[22px]">
                You haven&apos;t bought a book yet.
              </p>
              <p className="mt-3 text-sm text-[#a7a7a0]">
                When you do, your receipts land here.
              </p>
              <Link
                href="/books"
                className="home-cta-primary group mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-tight"
              >
                Browse the catalog
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li key={order.id}>
                  <OrderRow order={order} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}

function OrderRow({ order }: { order: UserOrderSummary }) {
  const dateText = DATE_FMT.format(order.createdAt);
  const tone = ORDER_STATUS_TONE[order.status];

  return (
    <article className="home-glass relative overflow-hidden rounded-[20px] p-5 sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/25 to-transparent"
      />

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#88918a]">
            {dateText}
          </p>
          <Link
            href={`/order/${order.id}`}
            className="mt-1 inline-block font-serif text-[18px] font-medium text-[#e6e6e0] transition-colors hover:text-[#33f0aa]"
          >
            Order{" "}
            <span className="font-mono text-[15px] tracking-tight">
              {order.id.slice(0, 8)}
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
          <p className="font-serif text-[20px] font-medium tabular-nums text-[#e6e6e0]">
            {formatPrice(order.totalCents, order.currency)}
          </p>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border ${tone.border} ${tone.bg} px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${tone.text}`}
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${tone.dot}`}
            />
            {ORDER_STATUS_LABEL[order.status]}
          </span>
        </div>
      </header>

      {order.items.length > 0 && (
        <ul className="mt-5 space-y-1.5 text-sm">
          {order.items.map((item) => (
            <li
              key={item.bookId}
              className="flex items-center gap-2 text-[#a7a7a0]"
            >
              <span
                aria-hidden
                className="h-1 w-1 rounded-full bg-[#33f0aa]/60"
              />
              <Link
                href={`/books/${item.bookSlug}`}
                className="transition-colors hover:text-[#e6e6e0]"
              >
                {item.bookTitle}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5">
        <Link
          href={`/order/${order.id}`}
          className="text-xs font-semibold uppercase tracking-[0.15em] text-[#33f0aa] transition-colors hover:text-[#e6e6e0]"
        >
          View details →
        </Link>
      </div>
    </article>
  );
}
