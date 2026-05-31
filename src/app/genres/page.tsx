import type { Metadata } from "next";

import { DEMO_GENRES } from "@/components/genres/demo-genres";
import { ExploreStrip } from "@/components/genres/explore-strip";
import { GenresShell } from "@/components/genres/genres-shell";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { resolveAsset } from "@/lib/assets";

/**
 * `/genres` — cinematic genre discovery page.
 *
 * Classification target: `○ Static`. No DB at request time; the demo
 * genre set is baked into the bundle. When a real `genres` query helper
 * lands (a later SUB-PR), we'll swap `DEMO_GENRES` for the live list
 * and keep the page static via ISR like the rest of the catalog tree.
 *
 * `/categories/[slug]` (existing per-category SSG detail pages) is the
 * destination for each card — clicking a genre card takes you to that
 * category's book listing.
 */
export const metadata: Metadata = {
  title: "Genres · Stories in every dimension",
  description:
    "From thrilling adventures to life-changing ideas — explore the genres that shape the way we read.",
  alternates: { canonical: "/genres" },
  openGraph: {
    title: "Genres · Digital Bookstore",
    description:
      "From thrilling adventures to life-changing ideas — explore the genres that shape the way we read.",
    url: "/genres",
    type: "website",
  },
};

export default function GenresDiscoveryPage() {
  // Resolve optional real genre artwork server-side (the shell is a client
  // component). Missing → null → SVG symbol. Drop /images/genres/{slug}.webp.
  const genres = DEMO_GENRES.map((g) => ({
    ...g,
    imageSrc: resolveAsset(`/images/genres/${g.slug}.webp`),
  }));

  return (
    <div className="cinematic-root">
      <CinematicHeader active="genres" />

      <main className="relative z-10">
        <GenresShell genres={genres} />
        <ExploreStrip />
        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}
