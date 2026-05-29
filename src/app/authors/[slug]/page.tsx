import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookCard } from "@/components/book-card";
import { EmptyState } from "@/components/empty-state";
import {
  getAuthorPageBySlug,
  listAuthorSlugs,
} from "@/lib/db/queries/catalog";

// SSG + ISR per ADR-1 — same revalidate cadence as the books list.
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
  const description = author.bio
    ? `${author.bio.slice(0, 157).trim()}…`
    : `Books by ${author.name} on Digital Bookstore.`;
  const url = `/authors/${slug}`;
  return {
    title: author.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: author.name,
      description,
      url,
      type: "profile",
    },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: AuthorSlugParams;
}) {
  const { slug } = await params;
  const author = await getAuthorPageBySlug(slug);
  if (!author) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Author
        </p>
        <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          {author.name}
        </h1>
        {author.bio && (
          <p className="mt-6 text-pretty text-base leading-relaxed text-muted-foreground">
            {author.bio}
          </p>
        )}
      </header>

      {author.books.length === 0 ? (
        <EmptyState
          heading="No published books yet."
          body={`Once ${author.name} has a published title, it appears here.`}
        />
      ) : (
        <ul className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {author.books.map((book) => (
            <li key={book.id}>
              <BookCard book={book} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
