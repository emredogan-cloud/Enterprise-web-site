import type { Metadata } from "next";

import { AboutBackground } from "@/components/about/about-background";
import { AboutHero } from "@/components/about/about-hero";
import { BeliefGrid } from "@/components/about/belief-grid";
import { FounderCard } from "@/components/about/founder-card";
import { ManifestoStrip } from "@/components/about/manifesto-strip";
import { NextStepsGrid } from "@/components/about/next-steps-grid";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { RevealOnScroll } from "@/components/home/reveal-on-scroll";

/**
 * /about — the cinematic brand-philosophy + trust manifesto page.
 *
 * This is the ideological heart of the bookstore: why it exists, what it
 * believes, who built it, and why a reader should trust it. Composition
 * (per the forensic analysis of about_referance_image.png):
 *
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │  CinematicHeader (sticky, About active)                         │
 *   ├─────────────────────────────────────────────────────────────────┤
 *   │  AboutHero  (manifesto headline + CTA | AboutScene artwork)     │
 *   │                                                                 │
 *   │  BeliefGrid  (4 glass cards — the convictions)                  │
 *   │                                                                 │
 *   │  FounderCard (Who built it — editorial copy | contact card)    │
 *   │                                                                 │
 *   │  ManifestoStrip ("Buy once. Yours to keep. Never locked.")     │
 *   │                                                                 │
 *   │  NextStepsGrid (guided exploration — real-routed nav cards)    │
 *   ├─────────────────────────────────────────────────────────────────┤
 *   │  HomeFooter                                                     │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * Behind everything: `<AboutBackground>` — a `fixed` atmospheric overlay
 * (radial emerald blooms + drifting dust) at z-index -10.
 *
 * History: `/about` previously lived in the `(legal)` route group and used
 * the generic `<LegalShell>` (same chrome as /terms, /privacy). That shared
 * layout can't express a bespoke hero or an "About" active nav state, so —
 * matching every other cinematic surface (/order, /account/settings) — the
 * page is now standalone and owns its own `cinematic-root` + header +
 * footer. The URL is unchanged. Content meaning is preserved; only the
 * presentation became cinematic.
 *
 * Pure Server Component → ships as `○ Static`; the only client island is
 * the tiny `<RevealOnScroll>` IntersectionObserver wrapper (no Framer
 * Motion — the ecosystem deliberately keeps the client bundle lean).
 */
export const metadata: Metadata = {
  title: "About",
  description:
    "Why Digital Bookstore exists, who built it, and what it stands for. Buy once, yours to keep, never locked.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Digital Bookstore",
    description:
      "Why Digital Bookstore exists, who built it, and what it stands for.",
    url: "/about",
    type: "article",
  },
};

export default function AboutPage() {
  return (
    <div className="cinematic-root">
      <CinematicHeader active="about" />

      {/* Atmospheric backdrop — fixed, behind every section */}
      <AboutBackground />

      <main className="relative z-10">
        <div className="mx-auto max-w-[1320px] px-4 pt-8 sm:px-6 sm:pt-12">
          {/* Hero paints immediately (LCP) — its motion is ambient, not a
              fade-in, so there's no reveal wrapper here. */}
          <AboutHero />

          <RevealOnScroll className="mt-24 sm:mt-32">
            <BeliefGrid />
          </RevealOnScroll>

          <RevealOnScroll className="mt-24 sm:mt-32">
            <FounderCard />
          </RevealOnScroll>

          <RevealOnScroll className="mt-24 sm:mt-32">
            <ManifestoStrip />
          </RevealOnScroll>

          <RevealOnScroll className="mt-24 sm:mt-32">
            <NextStepsGrid />
          </RevealOnScroll>

          <div className="h-24" />
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
