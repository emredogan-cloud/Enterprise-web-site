import { formatPrice } from "@/lib/format";

import { AssetImage } from "@/components/cinematic/asset-image";

import { LanternScene } from "./lantern-scene";

/**
 * Order hero — celebratory two-column composition at the top of
 * `/order/[id]`.
 *
 * LEFT: small "ORDER CONFIRMED" emerald eyebrow, huge serif "Thank
 * you!" with the trailing token in emerald gradient, supporting line,
 * and an info row carrying the order id + the total-paid emerald pill.
 *
 * RIGHT: `<LanternScene>` atmospheric panel (warm lantern + crystal +
 * book silhouettes on a quiet shelf).
 *
 * Pure Server Component — no client interactivity.
 */
export function OrderHero({
  orderId,
  totalCents,
  currency,
}: {
  orderId: string;
  totalCents: number;
  currency: string;
}) {
  // Show only the human-readable head of the UUID — the full id appears
  // in copy-friendly form on the order summary card; the hero stays calm.
  const shortId = orderId.slice(0, 8).toUpperCase();
  const totalLabel = formatPrice(totalCents, currency);

  return (
    <section className="relative overflow-hidden">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_42%)] lg:gap-16">
        {/* LEFT — copy + info row */}
        <div className="relative z-10 pt-2 text-center sm:pt-6 lg:text-left">
          {/* Eyebrow */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
            Order confirmed
          </p>

          {/* Diamond ornament */}
          <div className="relative mx-auto mt-4 flex h-6 w-6 items-center justify-center lg:mx-0">
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

          {/* Headline — last token (the !) carries the emerald accent */}
          <h1 className="mt-6 font-serif text-[56px] font-medium leading-[1.02] tracking-[-0.025em] text-fg-hi sm:text-[72px] lg:text-[88px]">
            Thank{" "}
            <span className="home-headline-accent">you!</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-fg-mid sm:text-[17px] lg:mx-0">
            Your order has been received and is now being prepared.
          </p>

          {/* Info row — Order ID + Total paid pill */}
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-5 lg:justify-start">
            <p className="text-[11px] uppercase tracking-[0.18em] text-fg-soft">
              Order ID{" "}
              <span className="ml-1.5 font-mono text-xs tracking-tight text-fg-mid">
                {shortId}
              </span>
            </p>

            <span
              className="inline-flex items-center gap-2 rounded-full border border-emerald-bright/30 bg-emerald-bright/8 px-4 py-1.5 text-sm font-semibold tracking-tight text-emerald-bright shadow-[0_0_14px_-2px_rgba(51,240,170,0.4)]"
              aria-label={`Total paid ${totalLabel}`}
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-emerald-bright shadow-[0_0_6px_#33f0aa]"
              />
              Total paid{" "}
              <span className="tabular-nums text-fg-hi">{totalLabel}</span>
            </span>
          </div>
        </div>

        {/* RIGHT — atmospheric scene. Bleeds toward the right edge on
            desktop; collapses to a 5:3 strip above the text on mobile. */}
        <div className="relative -mr-4 aspect-[5/3] w-full overflow-hidden rounded-l-[32px] border border-white/[0.06] sm:-mr-6 lg:mr-0 lg:aspect-[4/3] lg:rounded-[24px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
          />
          <AssetImage
            src="/images/order/order_lantern_scene.webp"
            alt=""
            fallback={<LanternScene />}
            sizes="(min-width: 1024px) 42vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
