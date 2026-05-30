import {
  BookOpenCheck,
  Scale,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Trust strip — 4 horizontal indicators below the danger zone.
 *
 * Reference treatment: a single horizontal glass strip with 4 columns
 * (icon + headline + micro-copy). Each column hover-brightens to
 * reinforce the "this is safe + cared for" vibe without claiming
 * specific certifications we don't actually have.
 *
 * Pure Server Component.
 */

interface TrustItem {
  icon: LucideIcon;
  title: string;
  body: string;
}

const ITEMS: ReadonlyArray<TrustItem> = [
  {
    icon: ShieldCheck,
    title: "Secure by design",
    body: "Watermarked PDFs, signed URLs, no DRM.",
  },
  {
    icon: BookOpenCheck,
    title: "Trusted platform",
    body: "Independent storefront with transparent policies.",
  },
  {
    icon: Scale,
    title: "Your rights matter",
    body: "GDPR + KVKK compliant, export + delete anytime.",
  },
  {
    icon: Sparkles,
    title: "Built for readers",
    body: "One person reading. No ads, no tracking.",
  },
];

export function TrustStrip() {
  return (
    <section
      aria-label="Trust indicators"
      className="home-glass relative overflow-hidden rounded-[24px] p-6 sm:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
      />

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.title} className="group flex items-start gap-3.5">
              <span className="home-icon-tile transition-all group-hover:bg-emerald-deep/15 group-hover:shadow-[0_0_14px_-2px_rgba(51,240,170,0.55)]">
                <Icon aria-hidden className="h-4 w-4" strokeWidth={1.7} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[15px] font-medium leading-tight text-fg-hi transition-colors group-hover:text-emerald-bright">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-fg-mid">
                  {item.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
