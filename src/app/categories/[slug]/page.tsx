import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookCard } from "@/components/book-card";
import { EmptyState } from "@/components/empty-state";
import {
  getCategoryPageBySlug,
  listCategorySlugs,
} from "@/lib/db/queries/catalog";

// SSG + ISR per ADR-1 — same revalidate cadence as the books list.
export const revalidate = 3600;

type CategorySlugParams = Promise<{ slug: string }>;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await listCategorySlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: CategorySlugParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryPageBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: `Browse ${category.name} on Digital Bookstore.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: CategorySlugParams;
}) {
  const { slug } = await params;
  const category = await getCategoryPageBySlug(slug);
  if (!category) notFound();

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Category
        </p>
        <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          {category.name}
        </h1>
      </header>

      {category.books.length === 0 ? (
        <EmptyState
          heading="No books in this category yet."
          body="Once titles are tagged with this category and published, they appear here."
        />
      ) : (
        <ul className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {category.books.map((book) => (
            <li key={book.id}>
              <BookCard book={book} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
