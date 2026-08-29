import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { CatalogShell } from "@/components/catalog/catalog-shell";
import { toCatalogItems } from "@/components/catalog/catalog-item";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { resolveAsset } from "@/lib/assets";
import { listEbooks } from "@/lib/db/queries/catalog";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "Ebooks · Buy and download instantly",
  description:
    "Every Valice Press ebook, sold direct as a watermarked PDF. Buy once, download immediately, and read on any device — no subscription, no device lock.",
  path: "/ebooks",
});

/**
 * `/ebooks` — the only shelf on this site a reader can buy from.
 *
 * Print editions of Valice Press books are printed and shipped by Amazon;
 * this site cannot fulfil them and links out instead. Ebooks are the
 * opposite: they are sold here, delivered here, and re-downloadable from
 * the reader's library here. That is a big enough distinction that burying
 * it as a format filter on `/books` would be hiding the one thing the
 * storefront actually does.
 *
 * Kept `○ Static + ISR 1h`, same as `/books`: the query runs at build/regen
 * time and `<CatalogShell>` is a hydrating client island.
 */
export default async function EbooksPage() {
  const ebooks = toCatalogItems(await listEbooks()).map((b) => ({
    ...b,
    coverSrc: resolveAsset(`/images/books/${b.slug}.webp`),
  }));

  return (
    <div className="cinematic-root">
      <CinematicHeader active="ebooks" />

      <main className="relative z-10">
        <header className="mx-auto max-w-[1440px] px-6 pb-4 pt-16 sm:pt-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
            Ebooks
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-[40px] font-medium leading-[1.08] tracking-[-0.025em] text-fg-hi sm:text-[56px]">
            Bought here. Yours to keep.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-fg-mid">
            Every ebook is a watermarked PDF with no device lock and no
            expiry. Buy it once, download it as often as you like, and read
            it wherever you read. Print editions are handled by Amazon —
            you&apos;ll find those on each book&apos;s page.
          </p>
        </header>

        {ebooks.length === 0 ? (
          <EbooksEmpty />
        ) : (
          <Suspense fallback={<div className="min-h-[400px]" />}>
            <CatalogShell books={ebooks} />
          </Suspense>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}

/**
 * No ebook is on sale yet.
 *
 * This is the accurate state today: the Valice Press titles exist as
 * finished files but none has been released for sale. The page says that
 * rather than showing an empty grid with filters over nothing.
 */
function EbooksEmpty() {
  return (
    <section className="mx-auto mt-10 max-w-2xl px-6 pb-24 text-center">
      <div className="home-glass rounded-[24px] px-8 py-14">
        <p className="font-serif text-xl text-fg-hi">
          No ebook is on sale yet.
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-fg-soft">
          The first Valice Press editions are finished and in preparation.
          When one goes on sale it will appear here, and anyone on the list
          hears about it first.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/#newsletter"
            className="home-cta-primary inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold"
          >
            Tell me when it ships
          </Link>
          <Link
            href="/books"
            className="home-cta-secondary inline-flex h-10 items-center rounded-full px-5 text-sm font-medium"
          >
            See the catalogue
          </Link>
        </div>
      </div>
    </section>
  );
}
