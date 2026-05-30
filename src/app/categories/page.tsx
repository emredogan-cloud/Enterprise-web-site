import type { Metadata } from "next";

import { CategoriesBackground } from "@/components/categories/categories-background";
import type { CategoryCardData } from "@/components/categories/category-card";
import { CategoryEmptyNotice } from "@/components/categories/category-empty-notice";
import {
  DEMO_CATEGORIES,
  resolveCategoryArtwork,
} from "@/components/categories/demo-categories";
import { DiscoveryStrip } from "@/components/categories/discovery-strip";
import { GenreGrid } from "@/components/categories/genre-grid";
import { CinematicHero } from "@/components/cinematic/cinematic-hero";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { listAllCategories } from "@/lib/db/queries/catalog";

/**
 * /categories — cinematic genre-discovery gallery.
 *
 * The doorway into literary worlds (per categories_referance_image.png):
 *
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │  CinematicHeader (sticky, Genres active)                        │
 *   ├─────────────────────────────────────────────────────────────────┤
 *   │  CinematicHero  ("Every genre", centered, drifting dust)        │
 *   │  CategoryEmptyNotice  (only when the catalog has no categories) │
 *   │  GenreGrid  (2×5 atmospheric worlds — each a CategoryScene)     │
 *   │  DiscoveryStrip  ("Can't find…? Browse all books")             │
 *   ├─────────────────────────────────────────────────────────────────┤
 *   │  HomeFooter                                                     │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * Behind everything: `<CategoriesBackground>` — a `fixed` atmospheric
 * overlay (emerald blooms + fog band + drifting dust).
 *
 * Functional integrity (the redesign is presentation-only):
 *   - the real `listAllCategories()` query is unchanged;
 *   - when categories exist they render as cards routing to the existing
 *     SSG `/categories/[slug]` pages (artwork picked by name via
 *     `resolveCategoryArtwork`);
 *   - when the catalog is empty the gallery still exists (architecture-
 *     first) using the curated demo worlds, each routing to a real
 *     `/search?q=` — no dead cards, no 404s into non-existent slug pages;
 *   - the empty-state message is preserved (restyled as a premium notice).
 *
 * Ships `○ Static` + ISR (same revalidate cadence as the rest of the
 * catalog). The only client island is the `<RevealOnScroll>` stagger inside
 * the grid — no Framer Motion (the ecosystem keeps the client bundle lean).
 */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Browse by category",
  description:
    "Step into every literary world — fantasy, science fiction, mystery, romance and more. Browse the Digital Bookstore catalog by category.",
  alternates: { canonical: "/categories" },
  openGraph: {
    title: "Browse by category — Digital Bookstore",
    description:
      "Step into every literary world — fantasy, science fiction, mystery, romance and more.",
    url: "/categories",
    type: "website",
  },
};

export default async function CategoriesIndexPage() {
  const categories = await listAllCategories();
  const hasReal = categories.length > 0;

  // Real categories route to their SSG detail pages; the empty-state demo
  // worlds route to a real search so every card goes somewhere real.
  const items: CategoryCardData[] = hasReal
    ? categories.map((cat, i) => {
        const { icon, artwork } = resolveCategoryArtwork(cat.name, i);
        return {
          key: cat.slug,
          name: cat.name,
          tagline: "Explore this collection.",
          href: `/categories/${cat.slug}`,
          icon,
          artwork,
        };
      })
    : DEMO_CATEGORIES.map((c) => ({
        key: c.slug,
        name: c.name,
        tagline: c.tagline,
        href: `/search?q=${encodeURIComponent(c.name)}`,
        icon: c.icon,
        artwork: c.artwork,
      }));

  return (
    <div className="cinematic-root">
      <CinematicHeader active="genres" />

      {/* Atmospheric backdrop — fixed, behind everything */}
      <CategoriesBackground />

      <main className="relative z-10">
        <CinematicHero
          eyebrow="Browse by category"
          headlineHead="Every"
          headlineTail="genre"
          size="lg"
          align="center"
          dust
          subtitle={
            <p>
              {hasReal
                ? `${categories.length} ${
                    categories.length === 1 ? "world" : "worlds"
                  } to explore — and the shelf keeps growing.`
                : "Categories will land here as the catalog grows. For now, step into the worlds below."}
            </p>
          }
        />

        {/* Premium empty notice — only when there are no real categories */}
        {!hasReal && (
          <section className="mx-auto mt-12 max-w-[1320px] px-4 sm:mt-14 sm:px-6">
            <CategoryEmptyNotice />
          </section>
        )}

        {/* The gallery — the main attraction */}
        <section className="mx-auto mt-12 max-w-[1320px] px-4 sm:mt-14 sm:px-6">
          <GenreGrid items={items} />
        </section>

        {/* Discovery CTA */}
        <div className="mt-24 sm:mt-28">
          <DiscoveryStrip />
        </div>

        <div className="h-24" />
      </main>

      <HomeFooter />
    </div>
  );
}
