import { Receipt } from "lucide-react";
import Link from "next/link";

/**
 * OrdersEmptyState — shown when the user has no orders at all. The full
 * dashboard architecture (sidebar + hero) still renders around it; this is
 * just the main-column content. A calm, premium prompt — not an error box.
 *
 * Pure Server Component.
 */
export function OrdersEmptyState() {
  return (
    <div className="home-glass relative overflow-hidden rounded-[28px] p-10 text-center sm:p-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
      />
      {/* Soft emerald bloom behind the icon */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-6 h-40 w-40 -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(51, 240, 170, 0.14) 0%, transparent 70%)",
        }}
      />

      <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-deep/30 bg-emerald-deep/10 text-emerald-bright shadow-[0_0_20px_-4px_rgba(51,240,170,0.55)]">
        <Receipt aria-hidden className="h-6 w-6" strokeWidth={1.6} />
      </span>

      <p className="relative mt-6 font-serif text-[22px] font-medium leading-tight text-fg-hi sm:text-[26px]">
        You haven&apos;t bought a book yet
      </p>
      <p className="relative mx-auto mt-3 max-w-sm text-sm leading-relaxed text-fg-mid">
        When you do, every order lands here — with its status, receipt, and a
        one-tap path back into your library.
      </p>

      <Link
        href="/books"
        className="home-cta-primary group relative mt-7 inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold tracking-tight"
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
  );
}
