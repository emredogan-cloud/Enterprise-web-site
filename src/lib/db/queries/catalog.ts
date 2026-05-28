/**
 * Catalog read queries (Roadmap §6, §8, §10).
 *
 * Every public function:
 *   - is read-only,
 *   - returns a UI-friendly shape (no `bookAuthors` junction noise),
 *   - is wrapped in `safeQuery` so a missing/unprovisioned DB during build
 *     or scaffolding degrades to an empty result instead of crashing the
 *     page (graceful-empty-states requirement). Once `DATABASE_URL` is set,
 *     the fallback branch never executes.
 *
 * Column-level projection (via `columns: { … }`) is deliberate — the
 * `books` table carries the heavy `search_tsv` and the private
 * `master_file_key`; neither should leave the DB layer.
 */

import { sql } from "drizzle-orm";

import type { BookCardData } from "@/components/book-card";

import { db } from "@/lib/db";

// -----------------------------------------------------------------------------
// safeQuery — make build / unprovisioned-env resilient.
// -----------------------------------------------------------------------------
async function safeQuery<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await run();
  } catch (err) {
    console.warn(
      `[catalog] ${label} failed (DB unavailable or query error):`,
      err instanceof Error ? err.message : err,
    );
    return fallback;
  }
}

// -----------------------------------------------------------------------------
// Books — catalog browse + detail.
// -----------------------------------------------------------------------------
export async function listPublishedBooks(): Promise<BookCardData[]> {
  return safeQuery(
    "listPublishedBooks",
    async () => {
      const rows = await db.query.books.findMany({
        where: (b, { eq }) => eq(b.status, "published"),
        orderBy: (b, { desc }) => desc(b.publishedAt),
        columns: {
          id: true,
          slug: true,
          title: true,
          subtitle: true,
          coverKey: true,
          priceCents: true,
          currency: true,
        },
        with: {
          bookAuthors: {
            orderBy: (ba, { asc }) => asc(ba.position),
            with: {
              author: { columns: { slug: true, name: true } },
            },
          },
        },
      });
      return rows.map((b) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        subtitle: b.subtitle,
        coverKey: b.coverKey,
        priceCents: b.priceCents,
        currency: b.currency,
        authors: b.bookAuthors.map((ba) => ba.author),
      }));
    },
    [],
  );
}

export async function listPublishedBookSlugs(): Promise<Array<{ slug: string }>> {
  return safeQuery(
    "listPublishedBookSlugs",
    async () => {
      const rows = await db.query.books.findMany({
        where: (b, { eq }) => eq(b.status, "published"),
        columns: { slug: true },
      });
      return rows;
    },
    [],
  );
}

export interface BookDetail extends BookCardData {
  description: string | null;
  pageCount: number | null;
  language: string;
  isbn: string | null;
  publishedAt: Date | null;
}

export async function getPublishedBookBySlug(
  slug: string,
): Promise<BookDetail | null> {
  return safeQuery(
    "getPublishedBookBySlug",
    async () => {
      const book = await db.query.books.findFirst({
        where: (b, { eq, and }) =>
          and(eq(b.slug, slug), eq(b.status, "published")),
        columns: {
          id: true,
          slug: true,
          title: true,
          subtitle: true,
          description: true,
          coverKey: true,
          priceCents: true,
          currency: true,
          pageCount: true,
          language: true,
          isbn: true,
          publishedAt: true,
        },
        with: {
          bookAuthors: {
            orderBy: (ba, { asc }) => asc(ba.position),
            with: {
              author: { columns: { slug: true, name: true } },
            },
          },
        },
      });
      if (!book) return null;
      return {
        id: book.id,
        slug: book.slug,
        title: book.title,
        subtitle: book.subtitle,
        description: book.description,
        coverKey: book.coverKey,
        priceCents: book.priceCents,
        currency: book.currency,
        pageCount: book.pageCount,
        language: book.language,
        isbn: book.isbn,
        publishedAt: book.publishedAt,
        authors: book.bookAuthors.map((ba) => ba.author),
      };
    },
    null,
  );
}

// -----------------------------------------------------------------------------
// Full-text search (Roadmap §10 FTS — uses `books.search_tsv` + GIN index)
//
// `websearch_to_tsquery('english', $1)` is the right parser for user input:
//   - accepts natural quoted phrases ("watermarked pdf")
//   - supports `or` and `-negation` syntax
//   - gracefully tolerates malformed input (returns an empty query, no crash)
//
// Ranking with `ts_rank(search_tsv, query)` keeps the most relevant titles
// at the top. Hard `limit(50)` caps result-set size — search is for *finding*,
// not for browsing pages of results.
//
// The user's `query` string is passed as a parameter (not interpolated), so
// it is safe from SQL injection — `websearch_to_tsquery` parses it server-side.
// -----------------------------------------------------------------------------
export async function searchBooks(query: string): Promise<BookCardData[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return safeQuery(
    "searchBooks",
    async () => {
      const rows = await db.query.books.findMany({
        where: (b, { eq, and }) =>
          and(
            eq(b.status, "published"),
            sql`${b.searchTsv} @@ websearch_to_tsquery('english', ${trimmed})`,
          ),
        orderBy: (b, { desc }) =>
          desc(
            sql`ts_rank(${b.searchTsv}, websearch_to_tsquery('english', ${trimmed}))`,
          ),
        columns: {
          id: true,
          slug: true,
          title: true,
          subtitle: true,
          coverKey: true,
          priceCents: true,
          currency: true,
        },
        with: {
          bookAuthors: {
            orderBy: (ba, { asc }) => asc(ba.position),
            with: {
              author: { columns: { slug: true, name: true } },
            },
          },
        },
        limit: 50,
      });
      return rows.map((b) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        subtitle: b.subtitle,
        coverKey: b.coverKey,
        priceCents: b.priceCents,
        currency: b.currency,
        authors: b.bookAuthors.map((ba) => ba.author),
      }));
    },
    [],
  );
}

// -----------------------------------------------------------------------------
// Categories — hub pages.
// -----------------------------------------------------------------------------
export async function listCategorySlugs(): Promise<Array<{ slug: string }>> {
  return safeQuery(
    "listCategorySlugs",
    async () => {
      const rows = await db.query.categories.findMany({
        columns: { slug: true },
      });
      return rows;
    },
    [],
  );
}

export interface CategoryPageData {
  slug: string;
  name: string;
  books: BookCardData[];
}

export async function getCategoryPageBySlug(
  slug: string,
): Promise<CategoryPageData | null> {
  return safeQuery(
    "getCategoryPageBySlug",
    async () => {
      const category = await db.query.categories.findFirst({
        where: (c, { eq }) => eq(c.slug, slug),
        with: {
          bookCategories: {
            with: {
              book: {
                columns: {
                  id: true,
                  slug: true,
                  title: true,
                  subtitle: true,
                  coverKey: true,
                  priceCents: true,
                  currency: true,
                  status: true,
                  publishedAt: true,
                },
                with: {
                  bookAuthors: {
                    orderBy: (ba, { asc }) => asc(ba.position),
                    with: {
                      author: { columns: { slug: true, name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!category) return null;

      const books: BookCardData[] = category.bookCategories
        .map((bc) => bc.book)
        .filter((b) => b.status === "published")
        .sort(
          (a, b) =>
            (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
        )
        .map((b) => ({
          id: b.id,
          slug: b.slug,
          title: b.title,
          subtitle: b.subtitle,
          coverKey: b.coverKey,
          priceCents: b.priceCents,
          currency: b.currency,
          authors: b.bookAuthors.map((ba) => ba.author),
        }));

      return {
        slug: category.slug,
        name: category.name,
        books,
      };
    },
    null,
  );
}

// -----------------------------------------------------------------------------
// Authors — author hub pages.
// -----------------------------------------------------------------------------
export async function listAuthorSlugs(): Promise<Array<{ slug: string }>> {
  return safeQuery(
    "listAuthorSlugs",
    async () => {
      const rows = await db.query.authors.findMany({
        columns: { slug: true },
      });
      return rows;
    },
    [],
  );
}

export interface AuthorPageData {
  slug: string;
  name: string;
  bio: string | null;
  books: BookCardData[];
}

export async function getAuthorPageBySlug(
  slug: string,
): Promise<AuthorPageData | null> {
  return safeQuery(
    "getAuthorPageBySlug",
    async () => {
      const author = await db.query.authors.findFirst({
        where: (a, { eq }) => eq(a.slug, slug),
        with: {
          bookAuthors: {
            with: {
              book: {
                columns: {
                  id: true,
                  slug: true,
                  title: true,
                  subtitle: true,
                  coverKey: true,
                  priceCents: true,
                  currency: true,
                  status: true,
                  publishedAt: true,
                },
                with: {
                  bookAuthors: {
                    orderBy: (ba, { asc }) => asc(ba.position),
                    with: {
                      author: { columns: { slug: true, name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!author) return null;

      const books: BookCardData[] = author.bookAuthors
        .map((ba) => ba.book)
        .filter((b) => b.status === "published")
        .sort(
          (a, b) =>
            (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
        )
        .map((b) => ({
          id: b.id,
          slug: b.slug,
          title: b.title,
          subtitle: b.subtitle,
          coverKey: b.coverKey,
          priceCents: b.priceCents,
          currency: b.currency,
          authors: b.bookAuthors.map((ba) => ba.author),
        }));

      return {
        slug: author.slug,
        name: author.name,
        bio: author.bio,
        books,
      };
    },
    null,
  );
}
