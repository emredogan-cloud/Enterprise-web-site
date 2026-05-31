import type { Metadata } from "next";

import { AuthorsHero } from "@/components/authors/authors-hero";
import { AuthorsShell } from "@/components/authors/authors-shell";
import { DEMO_AUTHORS } from "@/components/authors/demo-authors";
import { StatsStrip } from "@/components/authors/stats-strip";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { resolveAsset } from "@/lib/assets";

/**
 * `/authors` — cinematic author discovery page.
 *
 * Classification target: `○ Static`. No DB calls at request time, no
 * dynamic APIs. The demo author dataset is baked into the bundle at
 * build; when a real authors table is exposed via a query helper (a
 * later SUB-PR), we'll switch `DEMO_AUTHORS` for the live list and
 * keep the page static via ISR like the rest of the catalog tree.
 *
 * `/authors/[slug]` (the existing author detail page) is a separate
 * SSG route that uses the warm-theme layout for long-form bio reading;
 * the cinematic redesign here is for the discovery surface only.
 */
export const metadata: Metadata = {
  title: "Authors · Voices that inspire",
  description:
    "Discover the minds behind the books — explore authors, their stories, and their works.",
  alternates: { canonical: "/authors" },
  openGraph: {
    title: "Authors · Digital Bookstore",
    description:
      "Discover the minds behind the books — explore authors, their stories, and their works.",
    url: "/authors",
    type: "website",
  },
};

export default function AuthorsDiscoveryPage() {
  // Resolve optional real portraits server-side (the discovery shell is a
  // client component and can't touch the filesystem). Missing → null →
  // procedural portrait. Drop /images/authors/{slug}.webp to light one up.
  const authors = DEMO_AUTHORS.map((a) => ({
    ...a,
    portraitSrc: resolveAsset(`/images/authors/${a.slug}.webp`),
  }));

  return (
    <div className="cinematic-root">
      <CinematicHeader active="authors" />

      <main className="relative z-10">
        <AuthorsHero />
        <AuthorsShell authors={authors} />
        <StatsStrip />
        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}
