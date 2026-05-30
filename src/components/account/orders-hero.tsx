import { Receipt } from "lucide-react";

import { LanternScene } from "@/components/order/lantern-scene";

/**
 * OrdersHero — the page header for `/account/orders`, sized for the main
 * dashboard column (right of the sidebar).
 *
 * LEFT  — "ACCOUNT / ORDERS" eyebrow, diamond, serif "Your orders" with
 *         `orders` accented, a calm subhead, and a small count chip.
 * RIGHT — the reused `<LanternScene>` (lantern + emerald crystal + books)
 *         in the shared hero frame; on desktop it stretches to match the
 *         editorial column's height, on mobile it's a strip below the text.
 *
 * Pure Server Component.
 */
export function OrdersHero({ count }: { count: number }) {
  return (
    <section className="relative overflow-hidden">
      <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_40%)] lg:gap-12">
        {/* LEFT — editorial */}
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
            Account / Orders
          </p>

          {/* Diamond ornament */}
          <div className="relative mt-4 flex h-6 w-6 items-center justify-center">
            <div
              aria-hidden
              className="absolute h-6 w-6 rounded-full opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(51, 240, 170, 0.7) 0%, transparent 70%)",
              }}
            />
            <span
              aria-hidden
              className="catalog-diamond block h-2 w-2 rounded-[1px] bg-emerald-bright"
              style={{ transform: "rotate(45deg)" }}
            />
          </div>

          <h1 className="mt-6 font-serif text-[40px] font-medium leading-[1.04] tracking-[-0.025em] text-fg-hi sm:text-[52px] lg:text-[60px]">
            Your <span className="home-headline-accent">orders</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-fg-mid sm:text-[17px]">
            View and manage your past orders — reopen a purchase, check its
            status, or jump back into your library.
          </p>

          {/* Count chip */}
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 text-xs tracking-tight text-fg-mid">
            <Receipt aria-hidden className="h-3.5 w-3.5 text-emerald-bright" strokeWidth={1.8} />
            {count === 0
              ? "No orders yet"
              : `${count} ${count === 1 ? "order" : "orders"} in your history`}
          </span>
        </div>

        {/* RIGHT — atmospheric scene */}
        <div className="relative -mr-4 aspect-[5/3] w-full overflow-hidden rounded-l-[28px] border border-white/[0.06] sm:-mr-6 lg:mr-0 lg:aspect-auto lg:min-h-[260px] lg:rounded-[24px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
          />
          <LanternScene />
        </div>
      </div>
    </section>
  );
}
