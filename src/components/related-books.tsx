import Link from "next/link";

import { BookCard } from "@/components/book-card";
import { getFeaturedBooks } from "@/lib/db/queries/catalog";

/**
 * Cross-link from the content hub (blog) into the commerce core (catalog).
 *
 * Why this exists (Roadmap §13 — internal linking is the second-most
 * important SEO surface after structured data):
 *   - Blog posts are content that ranks. Every blog post that ranks is a
 *     funnel into a buy page if — and only if — there is a clear,
 *     in-content link from post → book detail.
 *   - Reuses `BookCard`, so the visual treatment matches the rest of the
 *     catalog. Reuses `getFeaturedBooks`, which is `safeQuery`-wrapped, so
 *     an unprovisioned DB at build time degrades to "no related books"
 *     instead of crashing the post.
 *
 * Rendering contract:
 *   - Server Component. The DB read happens at SSG time (the blog detail
 *     route is `○ Static`), so the rendered HTML ships with the post.
 *   - If `getFeaturedBooks` returns an empty list (no DB, or no published
 *     books yet), this component renders nothing — empty state would just
 *     be visual noise on a blog post.
 *
 * Limit defaults to 3, the sweet spot for a cross-link grid: enough to give
 * the reader a real choice, few enough that the section doesn't dominate
 * the post.
 */
export async function RelatedBooks({ limit = 3 }: { limit?: number } = {}) {
  const books = await getFeaturedBooks(limit);
  if (books.length === 0) return null;

  return (
    <section className="mt-20 border-t border-border pt-16">
      <header className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          From the catalog
        </p>
        <h2 className="mt-3 font-serif text-3xl font-medium leading-tight text-foreground">
          Read something new
        </h2>
      </header>

      <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <li key={book.id}>
            <BookCard book={book} />
          </li>
        ))}
      </ul>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        <Link
          href="/books"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Browse the full catalog →
        </Link>
      </p>
    </section>
  );
}
