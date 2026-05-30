import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookCover } from "@/components/book-detail/book-cover";
import { CinematicHero } from "@/components/cinematic/cinematic-hero";
import { DownloadButton } from "@/components/download-button";
import { FulfillmentPoller } from "@/components/fulfillment-poller";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { loadAuthenticatedLocalUser } from "@/lib/account";
import { getOrderForUser } from "@/lib/db/queries/account";
import { formatPrice } from "@/lib/format";

/**
 * /order/[id] — Trust Moment page.
 *
 * Phase 1.E cinematic redesign. This is the page a customer sees
 * immediately after Paddle redirects from a successful checkout. Per
 * the audit, the warm version was the worst tema-kırılma in the funnel
 * (cinematic cart → checkout flow → warm receipt → cinematic library).
 *
 * The cinematic version stays focused and small — no marketing noise,
 * no "discover more". Just: thank you, here are your books, here's
 * how to read them.
 *
 * Layout:
 *   1. <CinematicHero size="md"> — eyebrow "ORDER CONFIRMED" + diamond
 *      + "Thank you" headline + order id / total subtitle
 *   2. Pending banner (only when at least one entitlement is still
 *      watermarking) — explains the delay + lets FulfillmentPoller
 *      flip it when it's done
 *   3. Glass card per entitlement: cover (small) + title/subtitle +
 *      per-status footer (download / preparing / revoked)
 *   4. "View your library" closing CTA
 *
 * Classification stays `ƒ Dynamic` (per-user session + per-request DB
 * read; never cache).
 */

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

  const order = await getOrderForUser({
    orderId,
    userId: userCtx.localUserId,
  });
  if (!order) notFound();

  const hasPending = order.entitlements.some((e) => e.status === "pending");

  return (
    <div className="cinematic-root">
      <CinematicHeader />

      <main className="relative z-10">
        {/* Background poller — flips entitlement status as Inngest finishes
            each watermark job. No UI side; just `revalidatePath` calls. */}
        <FulfillmentPoller enabled={hasPending} />

        <CinematicHero
          eyebrow="Order confirmed"
          headlineHead="Thank"
          headlineTail="you"
          size="md"
          subtitle={
            <p>
              Order{" "}
              <span className="font-mono text-fg-hi">
                {order.id.slice(0, 8)}
              </span>{" "}
              · {formatPrice(order.totalCents, order.currency)}
              {order.taxCents > 0 ? (
                <>
                  {" "}
                  (
                  <span className="text-fg-mid">
                    {formatPrice(order.taxCents, order.currency)} tax
                  </span>
                  )
                </>
              ) : null}
            </p>
          }
          align="center"
        />

        <section className="mx-auto mt-16 max-w-3xl px-4 sm:px-6">
          {hasPending && (
            <div
              role="status"
              className="home-glass relative mb-10 overflow-hidden rounded-[20px] px-6 py-5 text-center"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/35 to-transparent"
              />
              <p className="inline-flex items-center gap-2 font-medium text-fg-hi">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#33f0aa] shadow-[0_0_6px_#33f0aa]"
                />
                Preparing your watermarked copy…
              </p>
              <p className="mt-2 text-sm text-fg-mid">
                This usually takes a few seconds. The page updates
                automatically when each book is ready.
              </p>
            </div>
          )}

          <ul className="space-y-4">
            {order.entitlements.map((ent) => (
              <li key={ent.bookId}>
                <OrderItemCard
                  bookId={ent.bookId}
                  title={ent.book.title}
                  subtitle={ent.book.subtitle}
                  coverKey={ent.book.coverKey}
                  status={ent.status}
                />
              </li>
            ))}
          </ul>

          <div className="mt-14 text-center">
            <Link
              href="/account/library"
              className="home-cta-primary inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold tracking-tight"
            >
              View your library →
            </Link>
            <p className="mt-4 text-xs text-fg-soft">
              All your purchased books also live in your library — yours
              to re-download anytime.
            </p>
          </div>
        </section>

        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}

/**
 * One entitlement row — cover thumbnail, title/subtitle, status footer.
 * Pure Server Component (the DownloadButton inside is the only client
 * island when status === "ready").
 */
function OrderItemCard({
  bookId,
  title,
  subtitle,
  coverKey,
  status,
}: {
  bookId: string;
  title: string;
  subtitle: string | null;
  coverKey: string | null;
  status: "ready" | "pending" | "revoked";
}) {
  return (
    <article className="home-glass relative flex gap-5 overflow-hidden rounded-[20px] p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/25 to-transparent"
      />

      {/* Small cover — w-20 keeps it compact next to the meta */}
      <div className="w-20 shrink-0">
        <BookCover title={title} coverKey={coverKey} />
      </div>

      {/* Meta + status footer */}
      <div className="flex flex-1 flex-col">
        <h2 className="font-serif text-[18px] font-medium leading-tight text-fg-hi">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm italic text-fg-mid">{subtitle}</p>
        )}

        <div className="mt-auto pt-4">
          {status === "ready" ? (
            <DownloadButton bookId={bookId} size="default" />
          ) : status === "pending" ? (
            <p className="inline-flex items-center gap-2 text-sm text-fg-mid">
              <span
                aria-hidden
                className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#33f0aa] shadow-[0_0_6px_#33f0aa]"
              />
              Preparing your copy…
            </p>
          ) : (
            <p className="text-sm text-[#ff9b9b]">Access revoked.</p>
          )}
        </div>
      </div>
    </article>
  );
}
