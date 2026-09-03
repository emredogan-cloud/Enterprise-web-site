import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/metadata";

import { AuthorsHero } from "@/components/authors/authors-hero";
import { AuthorsShell } from "@/components/authors/authors-shell";
import { DEFAULT_PORTRAIT } from "@/components/authors/author-card-data";
import { listAllAuthors } from "@/lib/db/queries/catalog";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { authorPortraitSrc } from "@/lib/asset-map";

/**
 * `/authors` — cinematic author discovery page.
 *
 * Real authors only: whoever has a published book, from the `authors`
 * table. Portraits resolve through the asset map — a verified or
 * public-domain likeness at `/images/authors/<slug>.webp`, otherwise the
 * designed identity mark.
 *
 * The stats strip that used to close this page ("10K+ authors · 50K+ books
 * · 2M+ readers · 120+ countries", with an "Apply now" link to nowhere) is
 * gone. None of those numbers was measured; the catalogue has three authors
 * and nine books, and a figure that cannot be pointed at is not displayed.
 */
export const metadata: Metadata = buildPageMetadata({
  title: "Authors",
  description:
    "The authors published by Valice Press, with their books.",
  path: "/authors",
  ogTitle: "Authors · Valice Press",
});

export default async function AuthorsDiscoveryPage() {
  const authors = (await listAllAuthors()).map((a) => ({
    ...a,
    portrait: DEFAULT_PORTRAIT,
    portraitSrc: authorPortraitSrc(a.slug),
  }));

  return (
    <div className="cinematic-root">
      <CinematicHeader active="authors" />

      <main className="relative z-10">
        <AuthorsHero />
        {authors.length > 0 ? <AuthorsShell authors={authors} /> : <AuthorsEmpty />}
        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}

/**
 * No author has a published book yet. Shown instead of the discovery shell —
 * a search box over nothing is worse than a sentence explaining the situation.
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
