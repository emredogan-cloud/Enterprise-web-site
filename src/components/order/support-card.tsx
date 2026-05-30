import { ArrowUpRight, LifeBuoy } from "lucide-react";

/**
 * Support card — right-sidebar companion under the order summary.
 *
 * Small headline + reassuring micro-copy + Contact support `mailto:`
 * CTA. Reuses the brand's footer-Support contact email (emre30283@…)
 * so the route stays consistent with what the footer offers.
 *
 * Pure Server Component.
 */
export function SupportCard() {
  return (
    <article className="home-glass relative overflow-hidden rounded-[24px] p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
      />

      <header className="flex items-center gap-2.5">
        <span className="home-icon-tile">
          <LifeBuoy aria-hidden className="h-4 w-4" strokeWidth={1.7} />
        </span>
        <p className="font-serif text-[18px] font-medium leading-tight text-fg-hi">
          Need help?
        </p>
      </header>

      <p className="mt-4 text-sm leading-relaxed text-fg-mid">
        Something looks off, or just have a question? Email us — we read
        every message and answer fast.
      </p>

      <a
        href="mailto:emre30283@gmail.com"
        className="group mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-sm font-medium tracking-tight text-fg-hi transition-all hover:-translate-y-0.5 hover:border-emerald-bright/40 hover:bg-emerald-bright/8 hover:text-emerald-bright hover:shadow-[0_8px_18px_-6px_rgba(51,240,170,0.3)]"
      >
        Contact support
        <ArrowUpRight
          aria-hidden
          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </a>
    </article>
  );
}
