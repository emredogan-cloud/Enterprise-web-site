import Link from "next/link";
import type { ReactNode } from "react";

/**
 * <LegalShell> — the canonical interior chrome for every long-form
 * legal / informational page (`/terms`, `/privacy`, `/refund`, `/kvkk`,
 * `/about`).
 *
 * Pairs with the `(legal)/layout.tsx` route-group layout: the layout
 * provides the dark `.cinematic-root` + `<CinematicHeader>` +
 * `<HomeFooter>`; this shell provides the eyebrow + title + breadcrumb
 * + last-updated chip + a styled content surface for the legal copy
 * (markdown-rendered or hand-authored React).
 *
 * Cinematic typography for the content body re-uses `.cinematic-prose`
 * (defined in globals.css for `/blog/[slug]`) — drop cap, emerald HR,
 * glass blockquote — which matches the editorial voice we want for
 * legal copy too (luxurious, calm, not corporate-cold).
 *
 * Phase 0.D scope: shell only. Phase 1.A fills in Terms / Privacy /
 * Refund / KVKK content. Phase 1.B re-uses this for /about.
 *
 * Pure Server Component.
 */

export interface LegalShellProps {
  /** Small uppercase label above the title (e.g. "LEGAL", "POLICY", "ABOUT"). */
  eyebrow: string;

  /** The page title — appears as <h1>. Use sentence case ("Terms of service"). */
  title: string;

  /**
   * Optional ISO-8601 date string ("2026-05-30") of the last meaningful
   * update. Rendered as a small chip near the title — important for legal
   * pages (users + regulators want to see when policy changed).
   */
  lastUpdated?: string;

  /** Optional short paragraph under the title, before the long-form body. */
  intro?: ReactNode;

  /** The body content — typically a markdown-rendered HTML string or JSX. */
  children: ReactNode;
}

export function LegalShell({
  eyebrow,
  title,
  lastUpdated,
  intro,
  children,
}: LegalShellProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      {/* Breadcrumb back to / */}
      <nav
        aria-label="Breadcrumb"
        className="text-[11px] uppercase tracking-[0.2em] text-[#88918a]"
      >
        <Link
          href="/"
          className="transition-colors hover:text-[#33f0aa]"
        >
          Home
        </Link>
        <span aria-hidden className="mx-2 text-[#33f0aa]">/</span>
        <span className="text-[#e6e6e0]">{eyebrow}</span>
      </nav>

      {/* Eyebrow */}
      <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#33f0aa]">
        {eyebrow}
      </p>

      {/* Diamond ornament — same micro-detail as every cinematic hero */}
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
          className="catalog-diamond block h-2 w-2 rounded-[1px] bg-[#33f0aa]"
          style={{ transform: "rotate(45deg)" }}
        />
      </div>

      {/* Title */}
      <h1 className="mt-6 font-serif text-[40px] font-medium leading-[1.1] tracking-[-0.025em] text-[#e6e6e0] sm:text-[52px]">
        {title}
      </h1>

      {/* Last-updated chip — small but legally important */}
      {lastUpdated && (
        <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#88918a]">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-[#33f0aa] shadow-[0_0_6px_#33f0aa]"
          />
          Last updated{" "}
          <time dateTime={lastUpdated} className="text-[#a7a7a0]">
            {formatLastUpdated(lastUpdated)}
          </time>
        </p>
      )}

      {/* Optional intro paragraph */}
      {intro && (
        <div className="mt-8 text-lg leading-relaxed text-[#a7a7a0]">
          {intro}
        </div>
      )}

      {/* Long-form body — reuses cinematic-prose for typography */}
      <div className="cinematic-prose mt-12">{children}</div>
    </article>
  );
}

function formatLastUpdated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
