import type { Metadata } from "next";
import Link from "next/link";

import { CinematicHero } from "@/components/cinematic/cinematic-hero";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { listAllCategories } from "@/lib/db/queries/catalog";

/**
 * /categories — the browse-by-category index.
 *
 * Phase 2.D. Audit-noted gap: the footer's "Categories" link used to
 * 404 (or fall through to /books); this is the missing index that
 * fills the gap. Click a tile → `/categories/[slug]` (cinematic since
 * Phase 1.F).
 *
 * Pure Server Component; SSG + ISR (same revalidate cadence as the rest
 * of the catalog).
 */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Browse by category",
  description:
    "Browse the Digital Bookstore catalog by category — every genre, alphabetical, with one tile per surface.",
  alternates: { canonical: "/categories" },
  openGraph: {
    title: "Browse by category — Digital Bookstore",
    description:
      "Browse the Digital Bookstore catalog by category — every genre, alphabetical, with one tile per surface.",
    url: "/categories",
    type: "website",
  },
};

// 8 gradient palettes — assigned by index so adjacent tiles don't look
// identical even when no per-category cover key exists yet. Same family
// as the library tile palette so the brand color story holds.
const TILE_PALETTE: Array<{ gradient: string; accent: string }> = [
  {
    gradient: "linear-gradient(160deg, #1a3326 0%, #0a1f14 100%)",
    accent: "#33f0aa",
  },
  {
    gradient: "linear-gradient(160deg, #1a2c4f 0%, #050a1e 100%)",
    accent: "#7ab6ff",
  },
  {
    gradient: "linear-gradient(160deg, #c98341 0%, #4b1f0a 100%)",
    accent: "#ffce63",
  },
  {
    gradient: "linear-gradient(160deg, #b41c1c 0%, #4a0808 100%)",
    accent: "#f4d4a8",
  },
  {
    gradient: "linear-gradient(160deg, #2c1f1a 0%, #14110a 100%)",
    accent: "#d1a86a",
  },
  {
    gradient: "linear-gradient(160deg, #3a2845 0%, #14081c 100%)",
    accent: "#b18cff",
  },
  {
    gradient: "linear-gradient(160deg, #1d3d3b 0%, #061818 100%)",
    accent: "#5ee4d8",
  },
  {
    gradient: "linear-gradient(160deg, #3a2128 0%, #1a0b10 100%)",
    accent: "#ff9ab7",
  },
];

export default async function CategoriesIndexPage() {
  const categories = await listAllCategories();

  return (
    <div className="cinematic-root">
      <CinematicHeader />

      <main className="relative z-10">
        <CinematicHero
          eyebrow="Browse by category"
          headlineHead="Every"
          headlineTail="genre"
          size="md"
          align="center"
          subtitle={
            <p>
              {categories.length === 0
                ? "Categories will land here as the catalog grows."
                : categories.length === 1
                  ? "One category to explore."
                  : `${categories.length} categories to explore.`}
            </p>
          }
        />

        {/* Grid OR empty state */}
        <section className="mx-auto mt-20 max-w-[1320px] px-4 sm:mt-24 sm:px-6">
          {categories.length === 0 ? (
            <div className="home-glass mx-auto max-w-md rounded-[20px] p-8 text-center">
              <p className="text-sm leading-relaxed text-fg-mid">
                The catalog hasn&apos;t been populated with categories yet.
                Check back soon or browse{" "}
                <Link
                  href="/books"
                  className="text-emerald-bright transition-colors hover:text-fg-hi"
                >
                  all books
                </Link>{" "}
                directly.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((cat, i) => {
                const palette = TILE_PALETTE[i % TILE_PALETTE.length];
                return (
                  <li key={cat.slug}>
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="home-glass home-card-hover group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[22px] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-bright/40"
                    >
                      {/* Top emerald edge */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/30 to-transparent"
                      />

                      {/* Base gradient */}
                      <div
                        aria-hidden
                        className="absolute inset-0 -z-10"
                        style={{ background: palette.gradient }}
                      />

                      {/* Corner accent bloom */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-50"
                        style={{
                          background: `radial-gradient(circle, ${palette.accent}55 0%, transparent 70%)`,
                        }}
                      />

                      {/* Eyebrow */}
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                        Genre
                      </span>

                      {/* Name */}
                      <div>
                        <h2 className="font-serif text-[24px] font-medium leading-[1.05] text-white transition-colors group-hover:text-emerald-bright">
                          {cat.name}
                        </h2>
                        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-bright">
                          Explore
                          <span
                            aria-hidden
                            className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                          >
                            →
                          </span>
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="h-24" />
      </main>

      <HomeFooter />
    </div>
  );
}
