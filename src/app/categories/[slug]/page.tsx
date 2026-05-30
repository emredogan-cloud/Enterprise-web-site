import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CinematicBookTile } from "@/components/cinematic/cinematic-book-tile";
import { CinematicHero } from "@/components/cinematic/cinematic-hero";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import {
  getCategoryPageBySlug,
  listCategorySlugs,
} from "@/lib/db/queries/catalog";

/**
 * /categories/[slug] — Curated Archive page (genre detail).
 *
 * Phase 1.F cinematic redesign. This is where `<GenreCard>` on
 * `/genres` discovery lands — previously a warm-theme dump after a
 * cinematic discovery surface (audit P1.6). Now: dark, consistent.
 *
 * Decision: we DO NOT create `/genres/[slug]` (the audit-noted gap).
 * Instead `<GenreCard>` keeps pointing at `/categories/[slug]` (its
 * current hrefs) and this page becomes the cinematic genre detail.
 * One detail route, one source of truth.
 *
 * Layout:
 *   1. <CinematicHero size="md"> — eyebrow "Genre" + diamond + name
 *      (last word emerald). No panel art — solo variant; the books grid
 *      below is the visual focus.
 *   2. Glass tile grid (`<CinematicBookTile>`) — same chrome as
 *      /authors/[slug] for consistency.
 *   3. Empty state + editorial closer.
 *
 * Classification target preserved: `● SSG` via `generateStaticParams`
 * over `listCategorySlugs()`. ISR `revalidate = 3600`.
 */

// SSG + ISR per ADR-1.
export const revalidate = 3600;

type CategorySlugParams = Promise<{ slug: string }>;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await listCategorySlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: CategorySlugParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryPageBySlug(slug);
  if (!category) return { title: "Category not found" };
  const description = `Browse ${category.name} on Digital Bookstore.`;
  const url = `/categories/${slug}`;
  return {
    title: category.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: category.name,
      description,
      url,
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: CategorySlugParams;
}) {
  const { slug } = await params;
  const category = await getCategoryPageBySlug(slug);
  if (!category) notFound();

  const { head, tail } = splitNameForAccent(category.name);

  return (
    <div className="cinematic-root">
      <CinematicHeader active="genres" />

      <main className="relative z-10">
        <CinematicHero
          eyebrow="Genre"
          headlineHead={head}
          headlineTail={tail}
          size="md"
          align="center"
          subtitle={
            <p>
              {category.books.length === 0
                ? "No published titles in this genre yet."
                : category.books.length === 1
                  ? "One published title to explore."
                  : `${category.books.length} published titles to explore.`}
            </p>
          }
        />

        {/* Books grid OR empty state */}
        <section className="mx-auto mt-20 max-w-[1320px] px-4 sm:mt-24 sm:px-6">
          {category.books.length === 0 ? (
            <div className="home-glass mx-auto max-w-md rounded-[20px] p-8 text-center">
              <p className="text-sm leading-relaxed text-fg-mid">
                Once titles are tagged with this category and published,
                they appear here.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {category.books.map((book) => (
                <li key={book.id}>
                  <CinematicBookTile book={book} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Editorial closer */}
        <section className="mx-auto mt-24 max-w-3xl px-6 text-center sm:mt-28">
          <div className="relative mx-auto flex h-5 w-5 items-center justify-center">
            <div
              aria-hidden
              className="absolute h-5 w-5 rounded-full opacity-50"
              style={{
                background:
                  "radial-gradient(circle, rgba(51,240,170,0.6) 0%, transparent 70%)",
              }}
            />
            <span
              aria-hidden
              className="catalog-diamond block h-1.5 w-1.5 rounded-[1px] bg-[#33f0aa]"
              style={{ transform: "rotate(45deg)" }}
            />
          </div>
          <p className="mt-5 font-serif text-[18px] italic leading-relaxed text-fg-mid sm:text-[20px]">
            Browse other genres at the discovery hub.
          </p>
        </section>

        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}

/** Single-word category → all emerald. Multi-word → last word emerald. */
function splitNameForAccent(name: string): { head: string; tail: string } {
  const words = name.trim().split(/\s+/);
  if (words.length <= 1) return { head: "", tail: name };
  return {
    head: words.slice(0, -1).join(" "),
    tail: words[words.length - 1],
  };
}
