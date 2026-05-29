import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { CoverImage } from "@/components/cover-image";
import { ReviewForm } from "@/components/review-form";
import { ReviewsList } from "@/components/reviews-list";
import { SampleViewer } from "@/components/sample-viewer";
import { StarRating } from "@/components/star-rating";
import {
  getPublishedBookBySlug,
  listPublishedBookSlugs,
} from "@/lib/db/queries/catalog";
import {
  getBookRatingAggregate,
  getReviewsForBook,
} from "@/lib/db/queries/reviews";
import { formatPrice } from "@/lib/format";
import { PLACEHOLDER_SAMPLE_HTML } from "@/lib/placeholders/book-sample";
import { buildBookJsonLd, getBaseUrl, getCoverImageUrl } from "@/lib/seo";

// SSG + ISR per ADR-1: pre-generate all published-book slugs at build, then
// regenerate any page lazily on demand once `revalidate` elapses. The
// review SUBMISSION flow calls `revalidatePath` for the affected slug, so
// new reviews appear on the next request without waiting the full hour.
export const revalidate = 3600;

// In Next.js 16 the `params` argument is a Promise — must be awaited.
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
  if (!book) return { title: "Book not found" };

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
  if (!book) notFound();

  /*
   * Sample resolution (Roadmap §13 — SEO-critical):
   *   The sample HTML MUST be in the rendered DOM at SSG time so search
   *   engines (and trust-conscious readers) can see the writing inside
   *   what is otherwise a paywalled file. For SUB-PR 1.3 we always render
   *   the placeholder; once R2 sample-fetching is wired in a follow-up,
   *   this becomes:
   *
   *     const sampleHtml = book.sampleKey
   *       ? await fetchSampleFromR2(book.sampleKey)
   *       : PLACEHOLDER_SAMPLE_HTML;
   */
  const sampleHtml = PLACEHOLDER_SAMPLE_HTML;

  // -------------------------------------------------------------------------
  // Reviews — fetch the per-book list AND the SQL-level aggregate in
  // parallel with anything else still pending. Both are `safeQuery`-wrapped,
  // so a missing DB at build / ISR time degrades to `{count: 0, average: null}`
  // and `[]` respectively — the page renders, the JSON-LD omits
  // AggregateRating, and the form falls back to its empty state.
  // -------------------------------------------------------------------------
  const [reviewItems, ratingAggregate] = await Promise.all([
    getReviewsForBook(book.id),
    getBookRatingAggregate(book.id),
  ]);

  // Translate the aggregate into the JSON-LD input shape. When `count === 0`
  // we pass `null`, which the helper turns into "no `aggregateRating` field"
  // on both Book and Product (Google's eligibility rule).
  const aggregateRatingForJsonLd =
    ratingAggregate.count > 0 && ratingAggregate.average !== null
      ? {
          ratingValue: ratingAggregate.average,
          reviewCount: ratingAggregate.count,
        }
      : null;

  // -------------------------------------------------------------------------
  // JSON-LD (Roadmap §13 — structured data). One `<script>` per page,
  // single `@graph` with Organization + Breadcrumbs + Book + Product/Offer
  // + (when available) AggregateRating on both Book and Product.
  // -------------------------------------------------------------------------
  const baseUrl = getBaseUrl();
  const coverImageUrl = getCoverImageUrl(book.coverKey);
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
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/*
        JSON-LD is rendered as a normal <script type="application/ld+json">
        tag inside the SSG payload — crawlers parse it on the first GET.
        `dangerouslySetInnerHTML` is the canonical pattern; the content is
        a JSON-serialized object we control entirely.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-12 md:grid-cols-[minmax(0,_1fr)_minmax(0,_1.5fr)]">
        <div className="md:sticky md:top-16 md:self-start">
          {/*
            `priority` on the cover — it's the LCP candidate on this
            page, so Next/Image preloads it instead of lazy-loading.
            (Falls back to the typographic placeholder when no public
            R2 URL is configured; the prop is then a no-op.)
          */}
          <CoverImage title={book.title} coverKey={book.coverKey} priority />
        </div>

        <div>
          {book.authors.length > 0 && (
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {book.authors.map((a) => a.name).join(", ")}
            </p>
          )}

          <h1 className="mt-3 text-balance font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
            {book.title}
          </h1>

          {book.subtitle && (
            <p className="mt-4 text-xl text-muted-foreground">
              {book.subtitle}
            </p>
          )}

          {/*
            Aggregate rating headline — shown inline near the title when
            there is at least one review. Mirrors the JSON-LD payload so
            users see the same number crawlers do. Hidden entirely at
            zero reviews to avoid the "0.0 stars" anti-pattern.
          */}
          {ratingAggregate.count > 0 && ratingAggregate.average !== null && (
            <div className="mt-5 flex items-center gap-3">
              <StarRating value={ratingAggregate.average} size="sm" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {ratingAggregate.average.toFixed(1)}
                </span>{" "}
                · {ratingAggregate.count}{" "}
                {ratingAggregate.count === 1 ? "review" : "reviews"}
              </p>
            </div>
          )}

          {book.description && (
            <p className="mt-8 max-w-prose text-pretty text-base leading-relaxed text-foreground/80">
              {book.description}
            </p>
          )}

          <dl className="mt-10 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Price</dt>
            <dd className="font-medium">
              {formatPrice(book.priceCents, book.currency)}
            </dd>

            {book.pageCount !== null && (
              <>
                <dt className="text-muted-foreground">Pages</dt>
                <dd>{book.pageCount}</dd>
              </>
            )}

            <dt className="text-muted-foreground">Language</dt>
            <dd>{book.language}</dd>

            {book.isbn && (
              <>
                <dt className="text-muted-foreground">ISBN</dt>
                <dd className="font-mono text-xs">{book.isbn}</dd>
              </>
            )}
          </dl>

          <div className="mt-10">
            <AddToCartButton bookId={book.id} />
          </div>
        </div>
      </div>

      <section className="mt-20 border-t border-border pt-16">
        <header className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Preview
          </p>
          <p className="mt-2 text-base text-muted-foreground">
            A taste of the writing before you buy.
          </p>
        </header>

        <SampleViewer content={sampleHtml} />
      </section>

      <section
        id="reviews"
        className="mt-20 border-t border-border pt-16"
        aria-labelledby="reviews-heading"
      >
        <header className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Reader Reviews
          </p>
          <h2
            id="reviews-heading"
            className="mt-3 font-serif text-3xl font-medium leading-tight text-foreground"
          >
            What readers say
          </h2>
          {ratingAggregate.count > 0 && ratingAggregate.average !== null && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <StarRating value={ratingAggregate.average} size="md" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {ratingAggregate.average.toFixed(1)}
                </span>{" "}
                across {ratingAggregate.count}{" "}
                {ratingAggregate.count === 1 ? "review" : "reviews"}
              </p>
            </div>
          )}
        </header>

        {/*
          List of approved reviews — rendered into the SSG HTML, so search
          engines see the review copy (Roadmap §13: the crawler-visible
          content surface is what determines ranking).
        */}
        <div className="mx-auto mt-10 max-w-2xl">
          <ReviewsList reviews={reviewItems} />
        </div>

        {/*
          Write-a-review form. Client Component — Clerk-gated for auth UI;
          entitlement gate lives in the Server Action (the authoritative
          check). Embedding a Client Component inside an SSG page is safe;
          only the form hydrates, the page itself stays `● SSG`.
        */}
        <div className="mx-auto mt-12 max-w-xl">
          <h3 className="text-center font-serif text-xl font-medium text-foreground">
            Write a review
          </h3>
          <ReviewForm slug={slug} bookId={book.id} />
        </div>
      </section>
    </main>
  );
}
