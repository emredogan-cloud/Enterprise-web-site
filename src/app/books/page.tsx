import type { Metadata } from "next";

import { BookCard } from "@/components/book-card";
import { EmptyState } from "@/components/empty-state";
import { listPublishedBooks } from "@/lib/db/queries/catalog";

// ISR — revalidate every hour. Static at build, refreshed on demand thereafter.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Browse all books",
  description:
    "Browse the full catalog of digital books — owned, never locked.",
};

export default async function BooksCatalogPage() {
  const allBooks = await listPublishedBooks();

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Catalog
        </p>
        <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          All books
        </h1>
      </header>

      {allBooks.length === 0 ? (
        <EmptyState
          heading="No books yet."
          body="The catalog is empty. Once titles are published from /admin, they appear here."
        />
      ) : (
        <ul className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {allBooks.map((book) => (
            <li key={book.id}>
              <BookCard book={book} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
