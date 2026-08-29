import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/metadata";

import { AuthorsHero } from "@/components/authors/authors-hero";
import { AuthorsShell } from "@/components/authors/authors-shell";
import { DEFAULT_PORTRAIT } from "@/components/authors/author-card-data";
import { listAllAuthors } from "@/lib/db/queries/catalog";
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
export const metadata: Metadata = buildPageMetadata({
  title: "Authors · Voices that inspire",
  description:
    "Discover the minds behind the books — explore authors, their stories, and their works.",
  path: "/authors",
  ogTitle: "Authors · Valice Press",
});

export default async function AuthorsDiscoveryPage() {
  // Real authors only — whoever has a published book. Resolve optional
  // portraits server-side (the discovery shell is a client component and
  // can't touch the filesystem). Missing → null → procedural portrait.
  // Drop /images/authors/{slug}.webp to light one up.
  const authors = (await listAllAuthors()).map((a) => ({
    ...a,
    portrait: DEFAULT_PORTRAIT,
    portraitSrc: resolveAsset(`/images/authors/${a.slug}.webp`),
  }));

  return (
    <div className="cinematic-root">
      <CinematicHeader active="authors" />

      <main className="relative z-10">
        <AuthorsHero />
        {authors.length > 0 ? (
          <>
            <AuthorsShell authors={authors} />
            <StatsStrip />
          </>
        ) : (
          <AuthorsEmpty />
        )}
        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}

/**
 * No author has a published book yet. Shown instead of the discovery shell
 * and the stats strip — a search box over nothing, above a row of zeroes,
 * is worse than a sentence explaining the situation.
 */
function AuthorsEmpty() {
  return (
    <section className="mx-auto mt-10 max-w-2xl px-6 text-center">
      <div className="home-glass rounded-[24px] px-8 py-14">
        <p className="font-serif text-xl text-fg-hi">
          No author pages yet.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-fg-soft">
          Author pages appear here as Valice Press titles are published.
        </p>
      </div>
    </section>
  );
}
