import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { loadAuthenticatedLocalUser } from "@/lib/account";
import {
  type UserOrderSummary,
  getUserOrders,
} from "@/lib/db/queries/account";
import { formatPrice } from "@/lib/format";

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
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Account
        </p>
        <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-foreground">
          Your orders
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {orders.length === 0
            ? "No orders yet."
            : `${orders.length} ${orders.length === 1 ? "order" : "orders"}`}
        </p>
      </header>

      {orders.length === 0 ? (
        <EmptyState
          heading="You have not bought a book yet."
          body="When you do, your receipts land here."
        />
      ) : (
        <ul className="mt-12 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function OrderCard({ order }: { order: UserOrderSummary }) {
  const dateText = DATE_FMT.format(order.createdAt);
  return (
    <article className="rounded-lg border border-border p-5">
      <header className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {dateText}
          </p>
          <Link
            href={`/order/${order.id}`}
            className="mt-1 inline-block font-serif text-lg font-medium text-foreground transition-colors hover:text-primary"
          >
            Order {order.id.slice(0, 8)}
          </Link>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium text-foreground">
            {formatPrice(order.totalCents, order.currency)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {ORDER_STATUS_LABEL[order.status]}
          </p>
        </div>
      </header>

      <ul className="mt-4 space-y-1 text-sm text-foreground/80">
        {order.items.map((item) => (
          <li key={item.bookId}>
            <Link
              href={`/books/${item.bookSlug}`}
              className="hover:underline"
            >
              {item.bookTitle}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
