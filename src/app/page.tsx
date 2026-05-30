import type { Metadata } from "next";

import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedBooksSection } from "@/components/home/featured-books-section";
import { Hero } from "@/components/home/hero";
import { HomeFooter } from "@/components/home/home-footer";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { WhyReadersSection } from "@/components/home/why-readers-section";
import {
  getFeaturedBooks,
  listAllCategories,
} from "@/lib/db/queries/catalog";

/**
 * Cinematic homepage — dark luxury SaaS aesthetic.
 *
 * Pure Server Component → page ships as `○ Static + ISR 1h`. The page's
 * own dark theme is scoped via `.cinematic-root`; the global
 * `<SiteHeader>` from `app/layout.tsx` is hidden by the `:has()` rule in
 * `globals.css`, and this page renders its own dark `<CinematicHeader>`
 * instead.
 *
 * Phase 2.G — featured books and categories are now sourced from the
 * real catalog queries (`getFeaturedBooks(6)`, `listAllCategories()`).
 * Both sections fall back to their original curated demo set when the
 * DB returns empty, so the homepage never looks abandoned on a fresh
 * deploy.
 */

export const revalidate = 3600; // ISR — matches the catalog's revalidate cadence.

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

export default async function Home() {
  // Both fetches are SSG-time and safeQuery-wrapped — a missing or empty
  // DB degrades to `[]` and each section drops back to its curated demo
  // fallback (preserves the cinematic atmosphere on a fresh deploy).
  const [featuredBooks, categories] = await Promise.all([
    getFeaturedBooks(6),
    listAllCategories(),
  ]);

  return (
    <div className="cinematic-root">
      <CinematicHeader active="home" />

      <main className="relative z-10">
        <Hero />
        <WhyReadersSection />
        <CategoriesSection categories={categories} />
        <FeaturedBooksSection books={featuredBooks} />
        <NewsletterSection />
      </main>

      <HomeFooter />
    </div>
  );
}
