import { CreditCard, Globe, ShieldOff, Zap } from "lucide-react";

import { RevealOnScroll } from "./reveal-on-scroll";

/**
 * "Why readers love us" — 4 glass feature cards.
 *
 * Cards use `.home-glass` + `.home-card-hover` from globals.css for the
 * uniform glassmorphism + hover lift treatment.
 */
export function WhyReadersSection() {
  const features = [
    {
      icon: Zap,
      title: "Instant Access",
      body: "Pay and download in seconds. Your PDF is ready before you finish your coffee.",
    },
    {
      icon: Globe,
      title: "Any Device",
      body: "Read in-browser, on iPad, Kindle, or your favorite desktop reader. No lock-in.",
    },
    {
      icon: ShieldOff,
      title: "DRM-Free",
      body: "No hard locks, no expiring licenses. Watermarked, but yours forever.",
    },
    {
      icon: CreditCard,
      title: "Secure Checkout",
      body: "Backed by a global merchant of record. Local taxes handled for you.",
    },
  ];

  return (
    <section id="why" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-emerald-bright/80">
              Why readers love us
            </p>
            <h2 className="mt-4 font-serif text-[36px] font-medium leading-tight tracking-tight text-fg-hi sm:text-[44px]">
              Designed for the way you actually read
            </h2>
          </header>
        </RevealOnScroll>

        <RevealOnScroll
          stagger
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="home-glass home-card-hover rounded-2xl p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-deep/30 bg-emerald-deep/10">
                  <Icon
                    aria-hidden
                    className="h-5 w-5 text-emerald-bright"
                  />
                </span>
                <h3 className="mt-5 font-serif text-lg font-medium text-fg-hi">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-mid">
                  {feature.body}
                </p>
              </div>
            );
          })}
        </RevealOnScroll>
      </div>
    </section>
  );
}
