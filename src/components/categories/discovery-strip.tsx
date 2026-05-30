import { ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * Discovery CTA strip — centered, below the gallery, with an elegant emerald
 * separator (a glowing diamond on a hairline). Encourages exploration without
 * a hard sell, and routes to the real catalog. Pure Server Component.
 */
export function DiscoveryStrip() {
  return (
    <section
      aria-label="Browse the full catalog"
      className="mx-auto max-w-3xl px-4 text-center"
    >
      {/* Elegant separator — hairline with a centered glowing diamond.
          The diamond is flex-centered (not translate-centered) because the
          `catalog-diamond` pulse animation overrides `transform`. */}
      <div aria-hidden className="relative mx-auto mb-10 h-6 w-full max-w-md">
        <div
          className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(51,240,170,0.45), transparent)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="catalog-diamond block h-2 w-2 rounded-[1px] bg-emerald-bright"
            style={{ transform: "rotate(45deg)" }}
          />
        </div>
      </div>

      <h2 className="font-serif text-[26px] font-medium leading-tight tracking-[-0.02em] text-fg-hi sm:text-[32px]">
        Can&apos;t find what you&apos;re looking for?
      </h2>
      <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-fg-mid">
        Browse the entire catalog — every title we carry, gathered in one
        place.
      </p>

      <Link
        href="/books"
        className="home-cta-primary group mt-7 inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold tracking-tight"
      >
        Browse all books
        <ArrowRight
          aria-hidden
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </Link>
    </section>
  );
}
