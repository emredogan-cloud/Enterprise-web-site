import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { CoverImage } from "@/components/cover-image";
import { DownloadButton } from "@/components/download-button";
import { FulfillmentPoller } from "@/components/fulfillment-poller";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { loadAuthenticatedLocalUser } from "@/lib/account";
import { getOrderForUser } from "@/lib/db/queries/account";
import { formatPrice } from "@/lib/format";

// Per-user, per-request — never cache.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

export default async function OrderPage({ params }: { params: Params }) {
  const { id: orderId } = await params;

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

  // `getOrderForUser` enforces ownership in its WHERE clause — a non-owning
  // user gets `null` (indistinguishable from "no such order"). 404 either way.
  const order = await getOrderForUser({
    orderId,
    userId: userCtx.localUserId,
  });
  if (!order) notFound();

  const hasPending = order.entitlements.some((e) => e.status === "pending");

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <FulfillmentPoller enabled={hasPending} />

      <header className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Thank you for your purchase
        </p>
        <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-foreground">
          Your order
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Order {order.id.slice(0, 8)} ·{" "}
          {formatPrice(order.totalCents, order.currency)}
          {order.taxCents > 0 ? (
            <>
              {" "}
              ({formatPrice(order.taxCents, order.currency)} tax)
            </>
          ) : null}
        </p>
      </header>

      {hasPending && (
        <div className="mt-10 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-5 text-center">
          <p className="font-medium text-foreground">
            Preparing your watermarked copy…
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This usually takes a few seconds. The page updates automatically
            when each book is ready.
          </p>
        </div>
      )}

      <ul className="mt-10 space-y-4">
        {order.entitlements.map((ent) => (
          <li key={ent.bookId}>
            <article className="flex gap-6 rounded-lg border border-border p-4">
              <div className="w-20 shrink-0">
                <CoverImage
                  title={ent.book.title}
                  coverKey={ent.book.coverKey}
                />
              </div>
              <div className="flex flex-1 flex-col">
                <h2 className="font-serif text-lg font-medium leading-tight text-foreground">
                  {ent.book.title}
                </h2>
                {ent.book.subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {ent.book.subtitle}
                  </p>
                )}

                <div className="mt-auto pt-3">
                  {ent.status === "ready" ? (
                    <DownloadButton bookId={ent.bookId} size="default" />
                  ) : ent.status === "pending" ? (
                    <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        aria-hidden
                        className="inline-block size-2 animate-pulse rounded-full bg-primary/60"
                      />
                      Preparing your copy…
                    </p>
                  ) : (
                    <p className="text-sm text-destructive">
                      Access revoked.
                    </p>
                  )}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-center text-xs text-muted-foreground">
        All your purchased books also live in{" "}
        <Link
          href="/account/library"
          className="text-primary underline-offset-4 hover:underline"
        >
          your library
        </Link>{" "}
        — yours to re-download anytime.
      </p>
    </main>
  );
}
