import Link from "next/link";

import { AssetImage } from "@/components/cinematic/asset-image";

import { HeroBook } from "./hero-book";
import { ScrollCue } from "./scroll-cue";
import { StatsCard } from "./stats-card";
import { TrustRow } from "./trust-row";

/**
 * Cinematic hero — the page's wow moment.
 *
 * Two-column layout: text (left, ~45%) + showcase (right, ~55%).
 * On mobile the layout stacks; the showcase scales down to ~520px.
 *
 * Pure Server Component — `HeroBook` uses CSS-only float + breathe
 * animations from globals.css, so this entire section ships as static
 * HTML with zero JS hydration cost.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-32 lg:pt-20">
        {/* LEFT — text + CTAs + trust */}
        <div className="relative z-10 max-w-[560px]">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 backdrop-blur-md">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-[#33f0aa] shadow-[0_0_6px_#33f0aa]"
            />
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-fg-mid">
              New · Curated Digital Library
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-7 font-serif text-[56px] font-medium leading-[1.02] tracking-[-0.025em] text-fg-hi sm:text-[68px] lg:text-[80px] xl:text-[88px]">
            <span className="block">Find it.</span>
            <span className="block">Own it.</span>
            <span
              className="block"
              style={{
                background:
                  "linear-gradient(135deg, #33f0aa 0%, #1ddf8f 60%, #16c784 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Read it anywhere.
            </span>
          </h1>

          {/* Supporting copy */}
          <p className="mt-7 max-w-[480px] text-[17px] leading-[1.65] text-fg-mid sm:text-[18px]">
            A modern digital bookstore for the readers of today. Buy once,
            download a watermarked-free PDF, and read on any device. Yours to
            keep — never locked.
          </p>

          {/* CTA row */}
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/books"
              className="home-cta-primary inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold tracking-tight"
            >
              <span
                aria-hidden
                className="text-base leading-none"
              >
                ↗
              </span>
              Browse Catalog
            </Link>
            <Link
              href="#why"
              className="home-cta-secondary inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-medium tracking-tight"
            >
              <span aria-hidden className="text-base leading-none">
                ▶
              </span>
              Watch Demo
            </Link>
          </div>

          {/* Trust row */}
          <TrustRow />
        </div>

        {/* RIGHT — cinematic showcase. Optional real hero artwork
            (/images/homepage/hero_reading_room.webp) renders when present;
            otherwise the procedural floating-book cluster is the fallback. */}
        <div className="relative">
          <div className="relative mx-auto h-[560px] w-full max-w-lg sm:h-[640px]">
            <AssetImage
              src="/images/homepage/hero_reading_room.webp"
              alt="A cinematic late-night reading room"
              fallback={<HeroBook />}
              sizes="(min-width: 1024px) 44vw, 100vw"
              priority
              imgClassName="object-contain"
            />
          </div>
          <StatsCard />
        </div>
      </div>

      {/* Scroll cue — centered at bottom of hero */}
      <div className="pointer-events-none flex justify-center pb-10">
        <ScrollCue />
      </div>
    </section>
  );
}
