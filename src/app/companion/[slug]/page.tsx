import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buildPageMetadata } from "@/lib/metadata";
import { getCompanion, listCompanions } from "@/lib/companions";
import { CompanionSignup } from "@/components/companion/companion-signup";
import { CompanionDownloadLink } from "@/components/companion/companion-download-link";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";

/**
 * /companion/[slug] — the free digital companion to a printed book.
 *
 * This is the landing point for a QR code printed inside a paperback, and the
 * single mechanism by which an Amazon buyer becomes a Valice reader. Amazon
 * never tells a publisher who bought a book; this page is how someone tells
 * us themselves.
 *
 * Statically generated for every companion in the registry, with no database
 * dependency at all. That is deliberate and load-bearing: a printed QR code
 * outlives deploys, schema changes and outages, so the page it points at must
 * be renderable from a constant. It resolves whether or not the book is on
 * sale, listed, or even still in the catalogue — see `src/lib/companions.ts`.
 */

export const dynamic = "force-static";

export function generateStaticParams() {
  return listCompanions().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const companion = getCompanion(slug);
  if (!companion) return buildPageMetadata({
    title: "Companion",
    description: "Free companion material from Valice Press.",
    path: `/companion/${slug}`,
    robots: { index: false },
  });

  return buildPageMetadata({
    title: `${companion.bookTitle} — free companion`,
    description: companion.intro,
    path: `/companion/${companion.slug}`,
    // Indexable: these pages are genuinely useful on their own and are a
    // legitimate long-tail search surface ("hangul practice sheet pdf"),
    // not a thin doorway page.
  });
}

export default async function CompanionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const companion = getCompanion(slug);
  if (!companion) notFound();

  const bookIsBuyable = companion.state === "book-available";

  return (
    <div className="cinematic-root min-h-screen">
      <CinematicHeader />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-emerald-bright/80">
          Free companion
        </p>
        <h1 className="mt-4 font-serif text-[34px] font-medium leading-tight tracking-tight text-fg-hi sm:text-[42px]">
          {companion.bookTitle}
        </h1>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-fg-mid">
          {companion.intro}
        </p>

        {/* Honest statement of where the book itself stands. Shown instead of
            a buy button rather than alongside one, so the page never implies
            a purchase is possible when it isn't. */}
        {!bookIsBuyable && (
          <div className="mt-8 rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] p-5">
            <p className="text-sm leading-relaxed text-fg-mid">
              {companion.stateNote}
            </p>
          </div>
        )}

        {/* When the book IS on sale, one calm link to its page — the page
            carries the real format cards and prices; nothing is duplicated
            here that could go stale under a printed QR code. */}
        {bookIsBuyable && (
          <p className="mt-6 text-sm text-fg-mid">
            <Link
              href={`/books/${companion.bookSlug}`}
              className="text-emerald-bright hover:underline"
            >
              See the book, its formats and where to buy it
            </Link>
          </p>
        )}

        <section className="mt-12" aria-labelledby="downloads">
          <h2 id="downloads" className="font-serif text-2xl text-fg-hi">
            {companion.assetsHeading ?? "Practice material"}
          </h2>
          <p className="mt-2 text-sm text-fg-low">
            Free, no sign-up, reprint as often as you like.
          </p>

          <ul className="mt-6 space-y-4">
            {companion.assets.map((asset) => (
              <li
                key={asset.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-serif text-lg text-fg-hi">{asset.title}</h3>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-fg-low">
                    {asset.meta}
                  </span>
                </div>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-fg-mid">
                  {asset.description}
                </p>
                <CompanionDownloadLink
                  companionSlug={companion.slug}
                  assetId={asset.id}
                  href={asset.href}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <CompanionSignup
            source={companion.newsletterSource}
            bookTitle={companion.bookTitle}
          />
        </section>

        <section className="mt-14 border-t border-white/8 pt-8">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-low">
            About this material
          </h2>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-fg-mid">
            {companion.rightsNote}
          </p>
          <p className="mt-4 text-sm text-fg-mid">
            <Link href="/books" className="text-emerald-bright hover:underline">
              Browse the Valice Press catalogue
            </Link>
          </p>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}
