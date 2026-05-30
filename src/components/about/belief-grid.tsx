import {
  BookOpen,
  EyeOff,
  Infinity as InfinityIcon,
  Unlock,
  type LucideIcon,
} from "lucide-react";

/**
 * "What we believe" — the belief system, as four glass cards.
 *
 * Reference treatment: a four-up row of luxury glass cards, each an
 * icon + title + supporting line. This is a *manifesto*, not a feature
 * list — the copy speaks in convictions, and the chrome (rounded-[30px]
 * glass + emerald hover bloom via `.home-card-hover`) makes each one feel
 * like a held principle. Preserves the meaning of the original About copy
 * (ownership / no DRM / privacy / reader-first).
 *
 * Pure Server Component.
 */

interface Belief {
  icon: LucideIcon;
  title: string;
  body: string;
}

const BELIEFS: ReadonlyArray<Belief> = [
  {
    icon: InfinityIcon,
    title: "You own what you buy",
    body: "A book you bought belongs to you — open it on any device you own, read it offline, and still have it ten years from now, even if we're gone.",
  },
  {
    icon: Unlock,
    title: "No DRM, ever",
    body: "We sell watermarked PDFs, not locked files. No required app, no “please log in to read the page you already paid for.”",
  },
  {
    icon: EyeOff,
    title: "Your privacy matters",
    body: "We don't track you across the web and we never sell your data. We collect only what's needed to deliver your books — nothing more.",
  },
  {
    icon: BookOpen,
    title: "Built for readers",
    body: "One person, reading-first. No ads, no engagement traps — just a quiet place to buy good books and actually keep them.",
  },
];

export function BeliefGrid() {
  return (
    <section aria-labelledby="beliefs-heading">
      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
          Our convictions
        </p>
        <h2
          id="beliefs-heading"
          className="mt-3 font-serif text-[32px] font-medium leading-tight tracking-[-0.02em] text-fg-hi sm:text-[40px]"
        >
          What we believe
        </h2>
        <p className="mt-3 text-base leading-relaxed text-fg-mid sm:text-[17px]">
          Four ideas the whole storefront is built to protect. Break any one
          of them and it stops being the thing it&apos;s supposed to be.
        </p>
      </header>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {BELIEFS.map((belief, i) => {
          const Icon = belief.icon;
          return (
            <li
              key={belief.title}
              className="home-glass home-card-hover group relative overflow-hidden rounded-[30px] p-7"
            >
              {/* Top emerald edge line */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/35 to-transparent"
              />
              {/* Corner index — small, calm */}
              <span
                aria-hidden
                className="absolute right-5 top-5 font-serif text-sm text-fg-fade transition-colors group-hover:text-emerald-bright/70"
              >
                0{i + 1}
              </span>

              {/* Self-contained tile (layered utilities only) so the hover
                  bloom actually animates — the shared `.home-icon-tile` is
                  unlayered and would override utility hover states. */}
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-deep/30 bg-emerald-deep/10 text-emerald-bright shadow-[0_0_12px_-2px_rgba(51,240,170,0.45)] transition-all duration-300 group-hover:border-emerald-bright/50 group-hover:bg-emerald-deep/20 group-hover:shadow-[0_0_20px_-2px_rgba(51,240,170,0.65)]">
                <Icon aria-hidden className="h-5 w-5" strokeWidth={1.7} />
              </span>

              <h3 className="mt-6 font-serif text-[20px] font-medium leading-tight text-fg-hi transition-colors group-hover:text-emerald-bright">
                {belief.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-mid">
                {belief.body}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
