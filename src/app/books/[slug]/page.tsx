import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { CoverImage } from "@/components/cover-image";
import { SampleViewer } from "@/components/sample-viewer";
import {
  getPublishedBookBySlug,
  listPublishedBookSlugs,
} from "@/lib/db/queries/catalog";
import { formatPrice } from "@/lib/format";
import { PLACEHOLDER_SAMPLE_HTML } from "@/lib/placeholders/book-sample";
import { buildBookJsonLd, getBaseUrl, getCoverImageUrl } from "@/lib/seo";

// SSG + ISR per ADR-1: pre-generate all published-book slugs at build, then
// regenerate any page lazily on demand once `revalidate` elapses.
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
  // JSON-LD (Roadmap §13 — structured data). One `<script>` per page,
  // single `@graph` with Organization + Breadcrumbs + Book + Product/Offer.
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
    </main>
  );
}
