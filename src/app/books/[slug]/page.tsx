import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookHero } from "@/components/book-detail/book-hero";
import { DEMO_BOOKS, type DemoBook } from "@/components/catalog/demo-books";
import { CinematicReviewForm } from "@/components/book-detail/cinematic-review-form";
import { CinematicReviewsList } from "@/components/book-detail/cinematic-reviews-list";
import { CinematicSampleSection } from "@/components/book-detail/cinematic-sample-section";
import { CinematicStarRating } from "@/components/book-detail/cinematic-star-rating";
import { ExploreStrip } from "@/components/book-detail/explore-strip";
import { RelatedBooksShelf } from "@/components/book-detail/related-books-shelf";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { resolveAsset } from "@/lib/assets";
import {
  getPublishedBookBySlug,
  listPublishedBooks,
  listPublishedBookSlugs,
} from "@/lib/db/queries/catalog";
import {
  getBookRatingAggregate,
  getReviewsForBook,
} from "@/lib/db/queries/reviews";
import { PLACEHOLDER_SAMPLE_HTML } from "@/lib/placeholders/book-sample";
import { buildBookJsonLd, getBaseUrl, getCoverImageUrl } from "@/lib/seo";

/**
 * /books/[slug] — Product Detail page.
 *
 * Phase 1.C cinematic redesign. Wraps the cinematic shell
 * (`.cinematic-root` + `<CinematicHeader>` + `<HomeFooter>`) around a
 * new composition:
 *
 *   1. <BookHero> — two-col: sticky cover + buy panel LEFT, meta + title
 *      + description RIGHT
 *   2. <CinematicSampleSection> — glass-framed sample, SSG-rendered for SEO
 *   3. Reviews section — aggregate header + <CinematicReviewsList> +
 *      <CinematicReviewForm>
 *   4. <ExploreStrip> — quiet "continue browsing" close
 *
 * Classification target preserved: `● SSG` via `generateStaticParams`
 * over `listPublishedBookSlugs()`. ISR `revalidate = 3600`.
 *
 * Functional contracts preserved end-to-end:
 *   - JSON-LD payload (Roadmap §13 — Book + Product + Offer +
 *     AggregateRating when reviews exist) is rendered verbatim
 *   - Sample HTML lands in the static payload (paywall-content fix)
 *   - Review submission flow (server action `submitReview` → revalidate)
 *     untouched; the form just has cinematic chrome
 *   - Add-to-cart uses the same `addToCart` server action + `cart-changed`
 *     event broadcast
 */

// SSG + ISR per ADR-1. The review SUBMISSION flow calls `revalidatePath`
// for the affected slug, so new reviews appear on the next request
// without waiting the full hour.
export const revalidate = 3600;

type BookSlugParams = Promise<{ slug: string }>;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await listPublishedBookSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: BookSlugParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getPublishedBookBySlug(slug);
  if (!book) {
    // Demo-catalog fallback (Issue 4): keep the title meaningful for the
    // preview detail page rather than emitting "Book not found".
    const demo = DEMO_BOOKS.find((b) => b.slug === slug);
    if (demo) {
      return {
        title: demo.title,
        description: `${demo.title} by ${demo.author} — a preview listing on Digital Bookstore.`,
        alternates: { canonical: `/books/${slug}` },
        robots: { index: false, follow: true },
      };
    }
    return { title: "Book not found" };
  }

  // Description preference: explicit subtitle > description excerpt > fallback.
  const description =
    book.subtitle ??
    (book.description
      ? `${book.description.slice(0, 157).trim()}…`
      : `${book.title} — Digital Bookstore`);

  const coverImageUrl = getCoverImageUrl(book.coverKey);
  const url = `/books/${slug}`;

  return {
    title: book.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: book.title,
      description,
      url,
      type: "book",
      ...(coverImageUrl
        ? {
            images: [
              { url: coverImageUrl, alt: `Cover of ${book.title}` },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: book.title,
      description,
      ...(coverImageUrl ? { images: [coverImageUrl] } : {}),
    },
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: BookSlugParams;
}) {
  const { slug } = await params;
  const book = await getPublishedBookBySlug(slug);
  if (!book) {
    // Issue 4 — when the live DB has no matching title, fall back to the
    // demo catalog so the card click lands on a real (preview) product page
    // instead of a 404. Genuinely unknown slugs still 404.
    const demo = DEMO_BOOKS.find((b) => b.slug === slug);
    if (demo) return <DemoBookDetail demo={demo} />;
    notFound();
  }

  // Sample resolution — placeholder for now; R2-served samples are a
  // follow-up (unchanged from the pre-cinematic page).
  const sampleHtml = PLACEHOLDER_SAMPLE_HTML;

  // Reviews + aggregate + related books in parallel — all `safeQuery`-
  // wrapped so a missing DB degrades to `{count: 0, average: null}` /
  // `[]` / `[]` respectively. The related-books query is the simplest
  // possible "anything else published" pick; a future SUB-PR can swap
  // it for a category- or author-similarity query.
  const [reviewItems, ratingAggregate, allBooks] = await Promise.all([
    getReviewsForBook(book.id),
    getBookRatingAggregate(book.id),
    listPublishedBooks(),
  ]);

  const relatedBooks = allBooks
    .filter((b) => b.slug !== slug)
    .slice(0, 6);

  const aggregateRatingForJsonLd =
    ratingAggregate.count > 0 && ratingAggregate.average !== null
      ? {
          ratingValue: ratingAggregate.average,
          reviewCount: ratingAggregate.count,
        }
      : null;

  // JSON-LD payload — identical shape to the pre-cinematic page.
  const baseUrl = getBaseUrl();
  const coverImageUrl = getCoverImageUrl(book.coverKey);
  // Hero cover priority: R2 `coverKey` URL → local public asset
  // (`/images/books/{slug}.webp`) → typographic placeholder. This is what
  // lets a slug-named cover render when `coverKey` is still null.
  const coverSrc =
    coverImageUrl ?? resolveAsset(`/images/books/${slug}.webp`);
  const jsonLd = buildBookJsonLd({
    baseUrl,
    slug,
    title: book.title,
    subtitle: book.subtitle,
    description: book.description,
    isbn: book.isbn,
    language: book.language,
    pageCount: book.pageCount,
    priceCents: book.priceCents,
    currency: book.currency,
    authors: book.authors,
    coverImageUrl,
    aggregateRating: aggregateRatingForJsonLd,
  });

  return (
    <div className="cinematic-root">
      <CinematicHeader active="books" />

      <main className="relative z-10">
        {/* JSON-LD — same payload, same emission strategy */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <BookHero
          bookId={book.id}
          slug={slug}
          title={book.title}
          subtitle={book.subtitle}
          description={book.description}
          coverKey={book.coverKey}
          coverSrc={coverSrc}
          priceCents={book.priceCents}
          currency={book.currency}
          pageCount={book.pageCount}
          language={book.language}
          isbn={book.isbn}
          authors={book.authors}
          ratingAggregate={ratingAggregate}
        />

        <CinematicSampleSection content={sampleHtml} />

        {/* Reviews section */}
        <section
          id="reviews"
          aria-labelledby="reviews-heading"
          className="mx-auto mt-24 max-w-3xl px-4 sm:px-6"
        >
          <header className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
              Reader reviews
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

            <h2
              id="reviews-heading"
              className="mt-5 font-serif text-[32px] font-medium leading-tight text-fg-hi sm:text-[40px]"
            >
              What readers say
            </h2>

            {ratingAggregate.count > 0 && ratingAggregate.average !== null && (
              <div className="mt-5 flex items-center justify-center gap-3">
                <CinematicStarRating
                  value={ratingAggregate.average}
                  size="md"
                />
                <p className="text-sm text-fg-mid">
                  <span className="font-medium text-fg-hi">
                    {ratingAggregate.average.toFixed(1)}
                  </span>{" "}
                  across {ratingAggregate.count}{" "}
                  {ratingAggregate.count === 1 ? "review" : "reviews"}
                </p>
              </div>
            )}
          </header>

          <CinematicReviewsList reviews={reviewItems} />

          {/* Write-a-review form */}
          <div className="mt-12">
            <h3 className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
              Write a review
            </h3>
            <CinematicReviewForm slug={slug} bookId={book.id} />
          </div>
        </section>

        {/* Phase 3.F — RelatedBooksShelf resolves the Phase 1.C
            "related shelf follow-up" carry-forward. ExploreStrip stays
            below as the closing quiet line; both surfaces complement
            each other (catalog discovery + brand closer). */}
        <RelatedBooksShelf books={relatedBooks} />

        <ExploreStrip />

        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}

/**
 * Demo-catalog preview detail (Issue 4 fallback). Reuses the real
 * `<BookHero>` in `preview` mode (plain-text author, "browse the catalog"
 * CTA instead of a FK-backed add-to-cart) + the SSG sample section + the
 * brand closer. No reviews / related shelf — those need a real book row.
 */
function DemoBookDetail({ demo }: { demo: DemoBook }) {
  return (
    <div className="cinematic-root">
      <CinematicHeader active="books" />

      <main className="relative z-10">
        <BookHero
          bookId={demo.id}
          slug={demo.slug}
          title={demo.title}
          subtitle={null}
          description={`A preview listing in the ${demo.category} collection. Once the storefront is stocked, full descriptions, samples, and reader reviews appear here.`}
          coverKey={null}
          coverSrc={resolveAsset(`/images/books/${demo.slug}.webp`)}
          priceCents={demo.priceCents}
          currency="USD"
          pageCount={null}
          language="English"
          isbn={null}
          authors={[{ slug: "", name: demo.author }]}
          ratingAggregate={{ count: 0, average: null }}
          preview
        />

        <CinematicSampleSection content={PLACEHOLDER_SAMPLE_HTML} />

        <ExploreStrip />

        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}
