import { BookOpen, Download, Mail, type LucideIcon } from "lucide-react";

/**
 * "What happens next?" — horizontal 3-card strip explaining the
 * post-purchase fulfillment journey.
 *
 * Reduces uncertainty (the reference treats this as a trust UX): the
 * customer just paid; the next minutes-to-hours matter, so we show
 * them in plain language with cinematic chrome.
 *
 * Pure Server Component.
 */

interface NextStep {
  icon: LucideIcon;
  title: string;
  body: string;
}

const STEPS: ReadonlyArray<NextStep> = [
  {
    icon: Mail,
    title: "Check your email",
    body: "We’ll send a confirmation receipt and notify you as each book is ready.",
  },
  {
    icon: Download,
    title: "Download & enjoy",
    body: "Watermarked PDFs in your library — no DRM, no expiry, no third-party reader.",
  },
  {
    icon: BookOpen,
    title: "View in your library",
    body: "Your purchased books also appear in /account/library — yours to re-download anytime.",
  },
];

export function WhatHappensNextStrip() {
  return (
    <section aria-labelledby="what-happens-next-heading">
      <header className="mb-5">
        <h2
          id="what-happens-next-heading"
          className="font-serif text-[24px] font-medium leading-tight text-fg-hi sm:text-[28px]"
        >
          What happens next?
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-fg-mid">
          Three small things, in order.
        </p>
      </header>

      <ul className="grid gap-5 sm:grid-cols-3 sm:gap-6">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className="home-glass home-card-hover relative overflow-hidden rounded-[20px] p-6"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/30 to-transparent"
              />

              {/* Step number — small, calm */}
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-bright">
                Step {i + 1}
              </p>

              {/* Icon tile */}
              <span className="home-icon-tile mt-4">
                <Icon aria-hidden className="h-4 w-4" strokeWidth={1.7} />
              </span>

              {/* Title */}
              <p className="mt-5 font-serif text-[18px] font-medium leading-tight text-fg-hi">
                {step.title}
              </p>

              <p className="mt-2 text-sm leading-relaxed text-fg-mid">
                {step.body}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
