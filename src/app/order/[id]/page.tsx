import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FulfillmentPoller } from "@/components/fulfillment-poller";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { OrderActionBar } from "@/components/order/order-action-bar";
import { OrderHero } from "@/components/order/order-hero";
import { OrderItemsPanel } from "@/components/order/order-items-panel";
import { OrderStatusTimeline } from "@/components/order/order-status-timeline";
import { OrderSummaryCard } from "@/components/order/order-summary-card";
import { OrderTrustStrip } from "@/components/order/order-trust-strip";
import { SupportCard } from "@/components/order/support-card";
import { WhatHappensNextStrip } from "@/components/order/what-happens-next-strip";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { loadAuthenticatedLocalUser } from "@/lib/account";
import { getOrderForUser } from "@/lib/db/queries/account";

/**
 * /order/[id] — Cinematic post-checkout confirmation experience.
 *
 * Composition (per the forensic analysis of order_referance_image.png):
 *
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │  CinematicHeader (sticky)                                       │
 *   ├─────────────────────────────────────────────────────────────────┤
 *   │  OrderHero (Thank you! + Order ID + Total pill | LanternScene) │
 *   │                                                                 │
 *   │  OrderStatusTimeline (4-step: received → processing → preparing │
 *   │                       → completed)                              │
 *   │                                                                 │
 *   │  ┌─── Your digital items (panel) ──┐  ┌─── OrderSummary ──┐    │
 *   │  │ • cover + meta + status + DL   │  │ Subtotal           │    │
 *   │  │ • cover + meta + status + DL   │  │ Tax                │    │
 *   │  └────────────────────────────────┘  │ Total paid (emrld) │    │
 *   │                                       └────────────────────┘    │
 *   │                                       ┌─── SupportCard ────┐   │
 *   │                                       │ Need help?         │   │
 *   │                                       │ Contact support →  │   │
 *   │                                       └────────────────────┘   │
 *   │                                                                 │
 *   │  WhatHappensNextStrip (3 cards: email / download / library)    │
 *   │                                                                 │
 *   │  OrderTrustStrip (Secure payment / Instant access / Yours      │
 *   │                   forever / Read anywhere)                      │
 *   │                                                                 │
 *   │  OrderActionBar (Back to library | Continue shopping →)        │
 *   ├─────────────────────────────────────────────────────────────────┤
 *   │  HomeFooter                                                     │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * Functional preservation (Phase 1.E discipline carried forward):
 *   - `loadAuthenticatedLocalUser` auth gate unchanged
 *   - `getOrderForUser` ownership-enforced query unchanged (extended in
 *     this PR to also pull per-item price snapshots; existing callers
 *     are unaffected)
 *   - `<FulfillmentPoller enabled={hasPending}>` polls and revalidates
 *     while any entitlement is still watermarking
 *   - `<DownloadButton>` inside each item row uses the same
 *     `downloadBook` server action with audit-log + signed-URL flow
 *   - `<UnprovisionedNotice>` fallback path preserved
 *
 * Classification stays `ƒ Dynamic` — per-user session + per-request DB
 * read.
 */

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
        {/* Background poller — flips entitlement status as Inngest
            finishes each watermark job. No UI; just revalidatePath. */}
        <FulfillmentPoller enabled={hasPending} />

        <div className="mx-auto max-w-[1320px] px-4 pt-8 sm:px-6 sm:pt-12">
          {/* Hero */}
          <OrderHero
            orderId={order.id}
            totalCents={order.totalCents}
            currency={order.currency}
          />

          {/* Status timeline — keeps the customer informed without
              having to refresh */}
          <div className="mt-10 sm:mt-14">
            <OrderStatusTimeline entitlements={order.entitlements} />
          </div>

          {/* Two-column body — items LEFT, summary + support RIGHT */}
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,_1fr)_320px] lg:gap-10">
            <OrderItemsPanel
              entitlements={order.entitlements}
              currency={order.currency}
            />

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <OrderSummaryCard
                totalCents={order.totalCents}
                taxCents={order.taxCents}
                currency={order.currency}
              />
              <SupportCard />
            </aside>
          </div>

          {/* What happens next */}
          <div className="mt-16">
            <WhatHappensNextStrip />
          </div>

          {/* Trust strip */}
          <div className="mt-10">
            <OrderTrustStrip />
          </div>

          {/* Action bar */}
          <OrderActionBar />

          <div className="h-20" />
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
