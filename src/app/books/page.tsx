import type { Metadata } from "next";

import { CatalogHero } from "@/components/catalog/catalog-hero";
import { CatalogShell } from "@/components/catalog/catalog-shell";
import { DEMO_BOOKS, type DemoBook } from "@/components/catalog/demo-books";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { listPublishedBooks } from "@/lib/db/queries/catalog";

// ISR — revalidate every hour (matches the existing classification: `○ Static + ISR 1h`).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All books · Browse the catalog",
  description:
    "Explore the entire collection of digital books. Filter by category, format, price, and rating; own every purchase forever.",
  alternates: { canonical: "/books" },
  openGraph: {
    title: "All books · Browse the catalog",
    description:
      "Explore the entire collection of digital books. Filter by category, format, price, and rating; own every purchase forever.",
    url: "/books",
    type: "website",
  },
};

/**
 * `/books` — cinematic catalog page.
 *
 * Layout: dark cinematic-scoped (`.cinematic-root`) so the shared
 * `<CinematicHeader>` and `<HomeFooter>` render with the same visual
 * language as the homepage. Stays `○ Static + ISR 1h` because the
 * `listPublishedBooks()` fetch happens at build/regen time and the
 * interactive `<CatalogShell>` is a hydrating Client island.
 *
 * Data flow: the DB query returns `BookCardData[]`. The catalog UI
 * needs richer dimensions (category, format, rating, badge, cover
 * gradient) that the current schema doesn't yet expose at the query
 * layer. Until those columns ship (a separate SUB-PR), the page falls
 * back to a curated `DEMO_BOOKS` set whenever the DB returns empty —
 * which matches the brief's "do not simplify, do not fall back to
 * generic marketplace UI" rule. When real books exist they take over;
 * when they don't, the cinematic showcase still lands.
 */
export default async function BooksCatalogPage() {
  const realBooks = await listPublishedBooks();
  const books: DemoBook[] =
    realBooks.length > 0 ? mapRealBooksToShell(realBooks) : DEMO_BOOKS;

  return (
    <div className="cinematic-root">
      <CinematicHeader active="books" />

      <main className="relative z-10">
        <CatalogHero />
        <CatalogShell books={books} />
      </main>

      <HomeFooter />
    </div>
  );
}

/**
 * Translate live `BookCardData` rows into the richer `DemoBook` shape
 * the catalog UI consumes. Defaults stand in for fields the current
 * query doesn't yet surface (category/format/rating/badge); a later
 * SUB-PR can extend `listPublishedBooks` to include them.
 *
 * Cover gradients cycle through a small palette so adjacent cards
 * don't look identical when no real cover image is uploaded yet.
 */
function mapRealBooksToShell(
  rows: Array<{
    id: string;
    slug: string;
    title: string;
    priceCents: number;
    currency: string;
    authors: ReadonlyArray<{ name: string }>;
  }>,
): DemoBook[] {
  const palette: DemoBook["cover"][] = [
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
  ];

  return rows.map((row, i) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    author: row.authors[0]?.name ?? "—",
    priceCents: row.priceCents,
    rating: 0,
    category: "Fiction",
    formats: ["PDF"],
    cover: palette[i % palette.length],
  }));
}
