import type { Metadata } from "next";
import { Suspense } from "react";

import { buildPageMetadata } from "@/lib/metadata";

import { CatalogHero } from "@/components/catalog/catalog-hero";
import { CatalogShell } from "@/components/catalog/catalog-shell";
import {
  toCatalogItems,
  type CatalogItem,
} from "@/components/catalog/catalog-item";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { listPublishedBooks } from "@/lib/db/queries/catalog";

// ISR — revalidate every hour (matches the existing classification: `○ Static + ISR 1h`).
export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "All books · Browse the catalog",
  description:
    "Explore the entire collection of digital books. Filter by category, format, price, and rating; own every purchase forever.",
  path: "/books",
});

/**
 * `/books` — cinematic catalog page.
 *
 * Layout: dark cinematic-scoped (`.cinematic-root`) so the shared
 * `<CinematicHeader>` and `<HomeFooter>` render with the same visual
 * language as the homepage. Stays `○ Static + ISR 1h` because the
 * `listPublishedBooks()` fetch happens at build/regen time and the
 * interactive `<CatalogShell>` is a hydrating Client island.
 *
 * Data flow: the DB query returns `BookCardData[]`, which `toCatalogItems`
 * widens into the richer shape the catalog UI consumes (facet category,
 * formats, cover treatment). When the query returns nothing, the shell
 * renders its empty state.
 *
 * There used to be a demo-catalog fallback here — eleven hard-coded
 * bestsellers that rendered whenever no real book was published. It was
 * removed: those are books Valice Press has no right to sell, and a
 * visitor cannot distinguish "showcase" from "inventory". An empty shelf
 * is honest; a full shelf of other publishers' books is not.
 */
export default async function BooksCatalogPage() {
  // `toCatalogItems` attaches each book's real cover from the asset
  // manifest, so this page and every other shelf draw the same file.
  const books: CatalogItem[] = toCatalogItems(await listPublishedBooks());

  return (
    <div className="cinematic-root">
      <CinematicHeader active="books" />

      <main className="relative z-10">
        <CatalogHero />
        {/* Phase 2.F — `<CatalogShell>` uses `useSearchParams()` (URL-
            synced filter/sort/page state). Next.js requires a Suspense
            boundary around any client subtree that reads searchParams
            so the rest of the page can stay statically prerendered
            without bailing out to CSR. */}
        <Suspense fallback={<CatalogShellFallback />}>
          <CatalogShell books={books} />
        </Suspense>
      </main>

      <HomeFooter />
    </div>
  );
}


/**
 * Minimal placeholder rendered during the Suspense bail while
 * `<CatalogShell>` resolves its URL params. Keeps the layout from
 * jumping — same outer grid + a dim panel where the books go.
 */
function CatalogShellFallback() {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-8 px-6 pb-24 lg:grid-cols-[300px_minmax(0,_1fr)] lg:gap-12">
      <div className="hidden h-[400px] rounded-2xl border border-white/[0.05] bg-white/[0.02] lg:block" />
      <div className="min-h-[400px] rounded-2xl border border-white/[0.05] bg-white/[0.02]" />
    </div>
  );
}
