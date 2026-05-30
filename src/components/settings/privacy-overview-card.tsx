import { ArrowUpRight, Download, Lock, Trash2 } from "lucide-react";
import Link from "next/link";

/**
 * Privacy overview — 3-column glass card explaining the storefront's
 * privacy posture in one calm row.
 *
 * Maps to the existing `/privacy` legal page (which Phase 1.A wrote).
 * The three columns are aspirational summaries; the actual policy is
 * one link away.
 *
 * Pure Server Component.
 */

interface PrivacyPoint {
  icon: typeof Lock;
  title: string;
  body: string;
}

const POINTS: ReadonlyArray<PrivacyPoint> = [
  {
    icon: Lock,
    title: "Your data is private",
    body: "We collect what we need to deliver your books, and nothing more.",
  },
  {
    icon: Download,
    title: "Export anytime",
    body: "Download a JSON of your library, orders, and reviews on demand.",
  },
  {
    icon: Trash2,
    title: "Delete anytime",
    body: "Remove your personal data in two clicks — full audit in privacy policy.",
  },
];

export function PrivacyOverviewCard() {
  return (
    <article className="home-glass relative overflow-hidden rounded-[28px] p-6 sm:p-8">
      {/* Top emerald edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
      />

      {/* Header */}
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
          Privacy
        </p>
        <h2 className="mt-2 font-serif text-[26px] font-medium leading-tight text-fg-hi sm:text-[28px]">
          Your data is yours
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-mid">
          Total control over what we collect, how it&apos;s used, and when it
          leaves.
        </p>
      </header>

      {/* 3-column subgrid */}
      <ul className="mt-7 grid gap-5 sm:grid-cols-3 sm:gap-6">
        {POINTS.map((point) => {
          const Icon = point.icon;
          return (
            <li
              key={point.title}
              className="rounded-[18px] border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <span className="home-icon-tile">
                <Icon aria-hidden className="h-4 w-4" strokeWidth={1.6} />
              </span>
              <p className="mt-4 font-serif text-[16px] font-medium leading-tight text-fg-hi">
                {point.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-fg-mid">
                {point.body}
              </p>
            </li>
          );
        })}
      </ul>

      {/* Policy link */}
      <div className="mt-7 flex items-center justify-between border-t border-white/[0.06] pt-5">
        <p className="text-xs text-fg-soft">
          Full details in our privacy policy.
        </p>
        <Link
          href="/privacy"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-bright transition-colors hover:text-fg-hi"
        >
          Read privacy policy
          <ArrowUpRight
            aria-hidden
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </article>
  );
}
