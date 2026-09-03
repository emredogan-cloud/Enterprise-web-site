import type { Metadata } from "next";

import { CategoriesBackground } from "@/components/categories/categories-background";
import { buildPageMetadata } from "@/lib/metadata";
import type { CategoryCardData } from "@/components/categories/category-card";
import { CategoryEmptyNotice } from "@/components/categories/category-empty-notice";
import { categoryLook } from "@/components/categories/category-icons";
import { DiscoveryStrip } from "@/components/categories/discovery-strip";
import { GenreGrid } from "@/components/categories/genre-grid";
import { CinematicHero } from "@/components/cinematic/cinematic-hero";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { categoryArtSrc } from "@/lib/asset-map";
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
 *   │  GenreGrid  (one card per real category, its own covers)        │
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
 *     SSG `/categories/[slug]` pages, each showing the covers of the books
 *     actually filed in it;
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

export const metadata: Metadata = buildPageMetadata({
  title: "Browse by category",
  description:
    "Myth and folklore, puzzles, traditional games, books for young readers, language workbooks and public-domain classics — the Valice Press catalog, by category.",
  path: "/categories",
  ogTitle: "Browse by category — Valice Press",
  ogDescription:
    "Myth and folklore, puzzles, games, young readers, language and classics.",
});

export default async function CategoriesIndexPage() {
  const categories = await listAllCategories();
  const hasReal = categories.length > 0;

  // Real categories only. The `hasReal` false branch used to render eight
  // invented "worlds" so the page never looked empty; a category gallery
  // that invents categories is the specific thing this page must not do.
  // Each card's artwork is the real covers filed in the category (or a
  // bespoke image at /images/categories/<slug>.webp when one exists). The
  // keyword-matched "genre world" scenes are gone: none matched a real
  // category, so every card used to fall through to the same castle.
  const items: CategoryCardData[] = hasReal
    ? categories.map((cat) => {
        const { icon, tint } = categoryLook(cat.slug);
        return {
          key: cat.slug,
          name: cat.name,
          tagline:
            cat.bookCount === 1 ? "1 book" : `${cat.bookCount} books`,
          href: `/categories/${cat.slug}`,
          icon,
          tint,
          coverSrcs: cat.coverSrcs,
          artSrc: categoryArtSrc(cat.slug),
        };
      })
    : [];

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
