import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Library,
  Newspaper,
  Scale,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { GitHubIcon, XIcon } from "@/components/brand-icons";

/**
 * "Where to go next" — guided exploration via real-routed nav cards.
 *
 * Reference treatment: a row of glass cards with a soft hover lift and an
 * arrow that drifts on hover. Internal destinations use `next/link` and an
 * `ArrowRight`; external surfaces (X, GitHub) use a real `<a target=_blank>`
 * and an `ArrowUpRight`. No dead buttons — every card goes somewhere real.
 *
 * Pure Server Component.
 */

interface NextStep {
  icon: ReactNode;
  label: string;
  desc: string;
  href: string;
  external?: boolean;
}

const STEPS: ReadonlyArray<NextStep> = [
  {
    icon: <Library className="h-[18px] w-[18px]" strokeWidth={1.7} />,
    label: "Browse books",
    desc: "The full catalog",
    href: "/books",
  },
  {
    icon: <Newspaper className="h-[18px] w-[18px]" strokeWidth={1.7} />,
    label: "Read the blog",
    desc: "Essays & dispatches",
    href: "/blog",
  },
  {
    icon: <Compass className="h-[18px] w-[18px]" strokeWidth={1.7} />,
    label: "Reading guides",
    desc: "Where to start",
    href: "/blog/category/reading-guides",
  },
  {
    icon: <Scale className="h-[18px] w-[18px]" strokeWidth={1.7} />,
    label: "Legal & policies",
    desc: "Terms, privacy, refunds, KVKK",
    href: "/terms",
  },
  {
    icon: <XIcon className="h-[18px] w-[18px]" />,
    label: "Follow on X",
    desc: "@emredogancloud",
    href: "https://x.com/emredogancloud",
    external: true,
  },
  {
    icon: <GitHubIcon className="h-[18px] w-[18px]" />,
    label: "GitHub",
    desc: "Built in the open",
    href: "https://github.com/emredogan-cloud",
    external: true,
  },
];

export function NextStepsGrid() {
  return (
    <section aria-labelledby="next-steps-heading">
      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
          Keep going
        </p>
        <h2
          id="next-steps-heading"
          className="mt-3 font-serif text-[32px] font-medium leading-tight tracking-[-0.02em] text-fg-hi sm:text-[40px]"
        >
          Where to go next
        </h2>
        <p className="mt-3 text-base leading-relaxed text-fg-mid sm:text-[17px]">
          A few doors out of here — into the catalog, the writing, and the work
          behind it.
        </p>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {STEPS.map((step) => (
          <li
            key={step.label}
            className="home-glass home-card-hover group relative overflow-hidden rounded-[24px]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/30 to-transparent"
            />
            <NextStepLink step={step}>
              <span className="home-icon-tile">{step.icon}</span>

              <span className="min-w-0 flex-1">
                <span className="block font-serif text-[17px] font-medium leading-tight text-fg-hi transition-colors group-hover:text-emerald-bright">
                  {step.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-fg-soft">
                  {step.desc}
                </span>
              </span>

              {step.external ? (
                <ArrowUpRight
                  aria-hidden
                  className="h-4 w-4 flex-shrink-0 text-fg-soft transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-bright"
                  strokeWidth={1.8}
                />
              ) : (
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 flex-shrink-0 text-fg-soft transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-emerald-bright"
                  strokeWidth={1.8}
                />
              )}
            </NextStepLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Internal links route through `next/link`; external surfaces use a real
 * `<a target="_blank">` with `rel="noopener noreferrer"`. The shared inner
 * layout (icon + label + arrow) lives in `children`.
 */
function NextStepLink({
  step,
  children,
}: {
  step: NextStep;
  children: ReactNode;
}) {
  const className =
    "flex items-center gap-4 p-5 focus-visible:outline-none sm:p-6";

  if (step.external) {
    return (
      <a
        href={step.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={step.href} className={className}>
      {children}
    </Link>
  );
}
