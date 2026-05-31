import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthorPortrait } from "@/components/authors/author-portrait";
import {
  DEMO_AUTHORS,
  type PortraitTheme,
} from "@/components/authors/demo-authors";
import { CinematicBookTile } from "@/components/cinematic/cinematic-book-tile";
import { CinematicHero } from "@/components/cinematic/cinematic-hero";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import {
  getAuthorPageBySlug,
  listAuthorSlugs,
} from "@/lib/db/queries/catalog";
import { resolveAsset } from "@/lib/assets";

/**
 * /authors/[slug] — Personality Detail page.
 *
 * Phase 1.D cinematic redesign. Layout:
 *
 *   1. <CinematicHero variant="with-panel" panelSide="left"> — CSS-rendered
 *      author portrait on the left, eyebrow + name (last word emerald) +
 *      bio on the right
 *   2. Books section — small heading + cinematic glass tile grid using
 *      `<CinematicBookTile>` (real BookCardData), or an editorial empty
 *      card when the author has no published titles yet
 *   3. Editorial closer — quiet "explore the catalog" line
 *
 * Classification target preserved: `● SSG` via `generateStaticParams`
 * over `listAuthorSlugs()`. ISR `revalidate = 3600`.
 */

// SSG + ISR per ADR-1.
export const revalidate = 3600;

type AuthorSlugParams = Promise<{ slug: string }>;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await listAuthorSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: AuthorSlugParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorPageBySlug(slug);
  const demo = author ? null : DEMO_AUTHORS.find((a) => a.slug === slug);
  if (!author && !demo) return { title: "Author not found" };

  const name = author?.name ?? demo!.name;
  const description = author?.bio
    ? `${author.bio.slice(0, 157).trim()}…`
    : demo
      ? `${demo.role}. Known for ${demo.works}.`
      : `Books by ${name} on Digital Bookstore.`;
  const url = `/authors/${slug}`;

  return {
    title: name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: name,
      description,
      url,
      type: "profile",
    },
    ...(demo ? { robots: { index: false, follow: true } } : {}),
  };
}

// Default portrait theme — used when an author doesn't have a custom
// PortraitTheme set (current state: real DB authors have no portrait
// data; the discovery `/authors` page uses bespoke themes per demo
// author, but per-author profiles fall back to this calm emerald scheme).
const DEFAULT_PORTRAIT: PortraitTheme = {
  background:
    "radial-gradient(ellipse at 35% 30%, #1a3326 0%, #0a1f14 60%, #050a08 100%)",
  silhouette: "#06120c",
  rimLight: "#33f0aa",
  accent: "rgba(51, 240, 170, 0.4)",
};

export default async function AuthorPage({
  params,
}: {
  params: AuthorSlugParams;
}) {
  const { slug } = await params;
  const realAuthor = await getAuthorPageBySlug(slug);

  // Issue 5 — fall back to the demo author roster (with its bespoke portrait
  // theme) when the live DB has no match, so author cards never 404.
  const demo = realAuthor ? null : DEMO_AUTHORS.find((a) => a.slug === slug);
  if (!realAuthor && !demo) notFound();

  const name = realAuthor?.name ?? demo!.name;
  const bio = realAuthor
    ? realAuthor.bio
    : `${demo!.role}. Known for ${demo!.works}.`;
  const books = realAuthor?.books ?? [];
  const portrait = realAuthor ? DEFAULT_PORTRAIT : demo!.portrait;

  // Split the name so the last token gets the emerald accent (same
  // strategy as every cinematic hero).
  const { head, tail } = splitNameForAccent(name);

  return (
    <div className="cinematic-root">
      <CinematicHeader active="authors" />

      <main className="relative z-10">
        <CinematicHero
          eyebrow="Author"
          headlineHead={head}
          headlineTail={tail}
          subtitle={
            bio ? (
              <p>{bio}</p>
            ) : (
              <p>Books by {name} on Digital Bookstore.</p>
            )
          }
          size="md"
          variant="with-panel"
          panelSide="left"
          panel={
            <div className="group h-full w-full">
              <AuthorPortrait
                theme={portrait}
                imageSrc={resolveAsset(`/images/authors/${slug}.webp`)}
              />
            </div>
          }
        />

        {/* Books section */}
        <section className="mx-auto mt-20 max-w-[1320px] px-4 sm:mt-24 sm:px-6">
          <header className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
              Published works
            </p>

            <div className="relative mx-auto mt-4 flex h-6 w-6 items-center justify-center">
              <div
                aria-hidden
                className="absolute h-6 w-6 rounded-full opacity-60"
                style={{
                  background:
                    "radial-gradient(circle, rgba(51,240,170,0.7) 0%, transparent 70%)",
                }}
              />
              <span
                aria-hidden
                className="catalog-diamond block h-2 w-2 rounded-[1px] bg-[#33f0aa]"
                style={{ transform: "rotate(45deg)" }}
              />
            </div>

            <h2 className="mt-5 font-serif text-[28px] font-medium leading-tight text-fg-hi sm:text-[36px]">
              {books.length === 0
                ? "No titles published yet"
                : books.length === 1
                  ? "One published title"
                  : `${books.length} published titles`}
            </h2>
          </header>

          {books.length === 0 ? (
            <div className="home-glass mx-auto mt-12 max-w-md rounded-[20px] p-8 text-center">
              <p className="text-sm leading-relaxed text-fg-mid">
                When {name} has a published title, it appears here. In
                the meantime, browse the rest of the catalog.
              </p>
            </div>
          ) : (
            <ul className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {books.map((book) => (
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
            Discover more voices. The catalog runs deeper than this profile.
          </p>
        </section>

        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}

/** Single-word name → all emerald. Multi-word → last word emerald. */
function splitNameForAccent(name: string): { head: string; tail: string } {
  const words = name.trim().split(/\s+/);
  if (words.length <= 1) return { head: "", tail: name };
  return {
    head: words.slice(0, -1).join(" "),
    tail: words[words.length - 1],
  };
}
