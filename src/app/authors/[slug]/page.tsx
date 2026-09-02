import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildPageMetadata } from "@/lib/metadata";
import { buildAuthorJsonLd, getBaseUrl } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

import { AuthorPortrait } from "@/components/authors/author-portrait";
import { DEFAULT_PORTRAIT } from "@/components/authors/author-card-data";
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
  if (!author) return { title: "Author not found" };

  // A bio is stored with its paragraph breaks; a meta description is one
  // line. Collapse first, then trim — otherwise the newline survives into
  // the <meta> tag and the snippet reads as a fragment.
  const oneLine = author.bio?.replace(/\s+/g, " ").trim();
  const description = oneLine
    ? oneLine.length > 157
      ? `${oneLine.slice(0, 157).trim()}…`
      : oneLine
    : `Books by ${author.name} on Valice Press.`;

  return buildPageMetadata({
    title: author.name,
    description,
    path: `/authors/${slug}`,
    type: "profile",
  });
}


export default async function AuthorPage({
  params,
}: {
  params: AuthorSlugParams;
}) {
  const { slug } = await params;
  const author = await getAuthorPageBySlug(slug);

  // A slug with no author row is not an author. The demo-roster fallback
  // that used to render here invented a role and a "known for" line for
  // whoever was asked about — see `author-card-data.ts`.
  if (!author) notFound();

  const { name, bio } = author;
  const books = author.books;
  const portrait = DEFAULT_PORTRAIT;

  // Split the name so the last token gets the emerald accent (same
  // strategy as every cinematic hero).
  const { head, tail } = splitNameForAccent(name);

  return (
    <div className="cinematic-root">
      <CinematicHeader active="authors" />

      <main className="relative z-10">
        {/* Author entity graph (Organization + Breadcrumb + ProfilePage +
            Person) + visible breadcrumb trail (WS-G / WS-F) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildAuthorJsonLd({ baseUrl: getBaseUrl(), slug, name, bio }),
            ),
          }}
        />
        <div className="mx-auto max-w-[1320px] px-4 pt-6 sm:px-6">
          <Breadcrumbs
            trail={[
              { name: "Home", href: "/" },
              { name: "Authors", href: "/authors" },
              { name },
            ]}
          />
        </div>

        <CinematicHero
          eyebrow="Author"
          headlineHead={head}
          headlineTail={tail}
          subtitle={
            bio ? (
              // The bio is authored as paragraphs. Rendering it as one <p>
              // silently glued four of them into a single block.
              <>
                {bio
                  .split(/\n{2,}/)
                  .map((para) => para.trim())
                  .filter(Boolean)
                  .map((para) => (
                    <p key={para.slice(0, 32)}>{para}</p>
                  ))}
              </>
            ) : (
              <p>Books by {name} on Valice Press.</p>
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
