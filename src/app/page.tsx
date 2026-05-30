import type { Metadata } from "next";

import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedBooksSection } from "@/components/home/featured-books-section";
import { Hero } from "@/components/home/hero";
import { HomeFooter } from "@/components/home/home-footer";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { WhyReadersSection } from "@/components/home/why-readers-section";

/**
 * Cinematic homepage — dark luxury SaaS aesthetic (Roadmap §7 redesign).
 *
 * Pure Server Component → page ships as `○ Static`. The page's own dark
 * theme is scoped via `.homepage-root`; the global `<SiteHeader>` from
 * `app/layout.tsx` is hidden by the `:has()` rule in `globals.css`, and
 * this page renders its own dark `<HomeHeader>` instead.
 *
 * Only four Client islands hydrate inside this static page:
 *   • `<HomeHeader>` — ⌘K keyboard shortcut + interactive nav
 *   • `<RevealOnScroll>` (×N) — IntersectionObserver fade-up triggers
 *   • `<NewsletterSection>` form — local input state
 *
 * Everything else (hero showcase, cards, footer) is pure HTML + CSS
 * animation, keeping the client-bundle cost minimal and the LCP fast.
 */
export const metadata: Metadata = {
  title: {
    absolute: "Digital Bookstore — Find it. Own it. Read it anywhere.",
  },
  description:
    "A modern digital bookstore. Buy a digital book once, download a watermarked-free PDF, and read it on any device. Yours to keep — never locked.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Digital Bookstore — Find it. Own it. Read it anywhere.",
    description:
      "Buy a digital book once, download a watermarked-free PDF, and read it on any device. Yours to keep — never locked.",
    url: "/",
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="cinematic-root">
      <CinematicHeader active="home" />

      <main className="relative z-10">
        <Hero />
        <WhyReadersSection />
        <CategoriesSection />
        <FeaturedBooksSection />
        <NewsletterSection />
      </main>

      <HomeFooter />
    </div>
  );
}
