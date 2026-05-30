import type { Metadata } from "next";

import { AccountSidebar } from "@/components/account/account-sidebar";
import { OrdersAtmosphere } from "@/components/account/orders-atmosphere";
import { OrdersBrowser } from "@/components/account/orders-browser";
import { OrdersEmptyState } from "@/components/account/orders-empty-state";
import { OrdersHero } from "@/components/account/orders-hero";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { loadAuthenticatedLocalUser } from "@/lib/account";
import { getUserOrders } from "@/lib/db/queries/account";

/**
 * /account/orders — Cinematic order-history dashboard.
 *
 * This is *order history management* (Account → Orders) — not the
 * /order/[id] post-purchase confirmation. Layout (per
 * account_orders_referance_image.png):
 *
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │  CinematicHeader (sticky)                                        │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │  ┌──── AccountSidebar ────┐  ┌──── Main column ───────────────┐  │
 *   │  │  Dashboard             │  │  OrdersHero (text | lantern)   │  │
 *   │  │  Library               │  │  OrdersBrowser:                │  │
 *   │  │  Orders ●              │  │   · OrdersFilterBar            │  │
 *   │  │  Settings              │  │   · OrderCard × page           │  │
 *   │  │  Wishlist  ◌           │  │       (meta | covers | status) │  │
 *   │  │  Addresses ◌           │  │   · OrderPagination            │  │
 *   │  │  Payment   ◌           │  │  (OrdersEmptyState if none)    │  │
 *   │  │  Notif.    ◌           │  └────────────────────────────────┘  │
 *   │  │  SupportCard           │                                       │
 *   │  └────────────────────────┘                                       │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │  HomeFooter                                                      │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Behind everything: `<OrdersAtmosphere>` fixed backdrop.
 *
 * Functional preservation (redesign is presentation-only):
 *   - `loadAuthenticatedLocalUser` auth gate + `<UnprovisionedNotice>`
 *     fallback unchanged.
 *   - `getUserOrders(localUserId)` query unchanged (ownership-scoped).
 *   - Each card links to the existing `/order/[id]` detail page.
 *   - Empty state preserved (now inside the full dashboard architecture).
 *
 * Classification stays `ƒ Dynamic` — per-user session + per-request DB read;
 * never cached. Search / filter / sort / pagination are in-memory client
 * work over the already-fetched list (no extra round-trips).
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
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

      {/* Atmospheric backdrop — fixed, behind every panel */}
      <OrdersAtmosphere />

      <main className="relative z-10 mx-auto max-w-[1320px] px-4 pt-8 sm:px-6 sm:pt-12">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,_1fr)] lg:gap-12">
          {/* LEFT — account sidebar (collapses to a top stack on mobile) */}
          <AccountSidebar active="orders" />

          {/* RIGHT — orders content */}
          <div className="min-w-0 space-y-10 sm:space-y-12">
            <OrdersHero count={orders.length} />

            {orders.length === 0 ? (
              <OrdersEmptyState />
            ) : (
              <OrdersBrowser orders={orders} />
            )}
          </div>
        </div>

        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}
