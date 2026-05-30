import Link from "next/link";

/**
 * Order action bar — bottom row CTAs.
 *
 * Secondary "Back to library" + primary emerald "Continue shopping".
 * On mobile, both buttons stack and reverse order (primary up top —
 * thumb reachability for the more-common next action).
 *
 * Pure Server Component.
 */
export function OrderActionBar() {
  return (
    <section
      aria-label="Order next steps"
      className="flex flex-col-reverse items-stretch justify-end gap-3 pt-6 sm:flex-row sm:items-center sm:gap-4"
    >
      <Link
        href="/account/library"
        className="inline-flex h-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] px-6 text-sm font-medium tracking-tight text-fg-hi transition-all hover:-translate-y-0.5 hover:border-emerald-bright/40 hover:bg-emerald-bright/8 hover:shadow-[0_8px_18px_-6px_rgba(51,240,170,0.3)]"
      >
        Back to library
      </Link>
      <Link
        href="/books"
        className="home-cta-primary group inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-tight"
      >
        Continue shopping
        <span
          aria-hidden
          className="inline-block transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </Link>
    </section>
  );
}
