import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CoverImage } from "@/components/cover-image";
import { formatPrice } from "@/lib/format";
import {
  getPublishedBookBySlug,
  listPublishedBookSlugs,
} from "@/lib/db/queries/catalog";

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

  return { title: book.title, description };
}

export default async function BookDetailPage({
  params,
}: {
  params: BookSlugParams;
}) {
  const { slug } = await params;
  const book = await getPublishedBookBySlug(slug);
  if (!book) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-[minmax(0,_1fr)_minmax(0,_1.5fr)]">
        <div className="md:sticky md:top-16 md:self-start">
          <CoverImage title={book.title} coverKey={book.coverKey} />
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

          <p className="mt-10 text-xs text-muted-foreground">
            Buy flow lands in SUB-PR 1.4 / 1.5. This page is a static
            scaffold of the §6 detail surface.
          </p>
        </div>
      </div>
    </main>
  );
}
