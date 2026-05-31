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
import { unstable_cache } from "next/cache";

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
// Cache tags (SUB-PR 4.2 — Next.js Data Cache invalidation surface).
//
// Any write path that mutates the catalog (e.g., admin `createBook`) calls
// `revalidateTag(CATALOG_TAG)` so cached reads pick up the change without
// waiting for the 5-minute revalidate window to elapse.
//
// Both tags are added to every cached catalog query, so an operator can
// invalidate "everything book-shaped" (CATALOG_TAG) or just the book set
// (BOOKS_TAG) depending on which surface mutated.
// -----------------------------------------------------------------------------
export const CATALOG_TAG = "catalog";
export const BOOKS_TAG = "books";
/**
 * 1-hour Data Cache window. Deliberately set to 3600s (not 300s) for two
 * reasons:
 *   1. Matches the existing `/sitemap.xml` page-level revalidate so the
 *      effective ISR cadence on the sitemap stays at 1 hour (Next.js
 *      uses min(page, cache) — a 5m inner cache would silently tighten
 *      the sitemap to 5m).
 *   2. The blog detail route consumes `getFeaturedBooks` via the
 *      `RelatedBooks` Server Component. A short inner-cache revalidate
 *      would propagate UP and turn the SUB-PR 3.2 "pure static" blog
 *      pages into ISR routes — fine in principle, but it would also
 *      mean the markdown loader (`src/lib/blog.ts`) has to read
 *      `src/content/**` at runtime, requiring `outputFileTracingIncludes`
 *      coverage. 1h ISR + the markdown trace include in `next.config.ts`
 *      together make this safe.
 */
const CACHE_REVALIDATE_SECONDS = 3600;

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
          bookCategories: {
            with: {
              category: { columns: { name: true } },
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
        // Primary collection for the catalog card — first by name when a book
        // belongs to several (deterministic; book_categories has no order col).
        primaryCategory:
          b.bookCategories
            .map((bc) => bc.category.name)
            .sort((a, z) => a.localeCompare(z))[0] ?? null,
      }));
    },
    [],
  );
}

/**
 * The "featured books" used by cross-link surfaces such as the blog's
 * `RelatedBooks` component (SUB-PR 3.2, Roadmap §13 — internal linking).
 *
 * Heuristic for v1: the most-recently-published books, capped by `limit`.
 * That keeps the surface fresh for free; we can later swap the ordering
 * for category-overlap or hand-curated picks without changing the consumer.
 *
 * Caching layout (SUB-PR 4.2):
 *   - The raw DB query (`_getFeaturedBooksFromDb`) is wrapped with
 *     `unstable_cache` so successful results live in Next.js's Data Cache
 *     for 5 minutes. Multiple `RelatedBooks` renders within that window
 *     share one Postgres round-trip.
 *   - The public `getFeaturedBooks` wraps THAT in `safeQuery` so a DB
 *     outage degrades to `[]` without poisoning the cache: when the
 *     underlying query throws, `unstable_cache` does NOT cache the
 *     rejection — the next call retries the DB.
 *   - Tag `CATALOG_TAG` / `BOOKS_TAG` lets `createBook` invalidate on
 *     write without waiting the full 5 minutes.
 */
const _getFeaturedBooksFromDb = unstable_cache(
  async (limit: number): Promise<BookCardData[]> => {
    const rows = await db.query.books.findMany({
      where: (b, { eq }) => eq(b.status, "published"),
      orderBy: (b, { desc }) => desc(b.publishedAt),
      limit,
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
  ["catalog:getFeaturedBooks"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CATALOG_TAG, BOOKS_TAG] },
);

export async function getFeaturedBooks(limit: number): Promise<BookCardData[]> {
  return safeQuery(
    "getFeaturedBooks",
    () => _getFeaturedBooksFromDb(limit),
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
// Sitemap entries — published-book slugs + their last-modified timestamps.
// Used by `src/app/sitemap.ts` to emit accurate `<lastmod>` per URL.
// -----------------------------------------------------------------------------
export interface BookSitemapEntry {
  slug: string;
  lastModified: Date;
}

/**
 * Sitemap entry generator — cached on the same `CATALOG_TAG` / `BOOKS_TAG`
 * tags as `getFeaturedBooks` so a single `revalidateTag(CATALOG_TAG)` on
 * book publish invalidates both surfaces atomically.
 *
 * The page that calls this (`src/app/sitemap.ts`) has its OWN ISR cadence
 * (`revalidate: 3600`); this Data Cache layer is a second, finer-grained
 * cache. They compose: the sitemap re-renders at most every hour, and
 * within an hour, repeat calls (e.g., during a single SSG build) reuse
 * the DB result through this layer.
 */
const _getBookSitemapEntriesFromDb = unstable_cache(
  async (): Promise<BookSitemapEntry[]> => {
    const rows = await db.query.books.findMany({
      where: (b, { eq }) => eq(b.status, "published"),
      columns: { slug: true, updatedAt: true },
    });
    return rows.map((r) => ({ slug: r.slug, lastModified: r.updatedAt }));
  },
  ["catalog:getBookSitemapEntries"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CATALOG_TAG, BOOKS_TAG] },
);

export async function getBookSitemapEntries(): Promise<BookSitemapEntry[]> {
  return safeQuery(
    "getBookSitemapEntries",
    () => _getBookSitemapEntriesFromDb(),
    [],
  );
}

// -----------------------------------------------------------------------------
// Cart — fetch the published-book details for the IDs in a session cart.
// -----------------------------------------------------------------------------
export async function getCartBooks(bookIds: string[]): Promise<BookCardData[]> {
  if (bookIds.length === 0) return [];
  return safeQuery(
    "getCartBooks",
    async () => {
      const rows = await db.query.books.findMany({
        where: (b, { and, eq, inArray }) =>
          and(eq(b.status, "published"), inArray(b.id, bookIds)),
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

// -----------------------------------------------------------------------------
// Checkout — narrow projection of just what is needed to start a Paddle
// transaction (id, title, price, currency, Paddle price-id).
// -----------------------------------------------------------------------------
export interface CheckoutItem {
  id: string;
  title: string;
  priceCents: number;
  currency: string;
  paddlePriceId: string | null;
}

export async function getCheckoutItems(
  bookIds: string[],
): Promise<CheckoutItem[]> {
  if (bookIds.length === 0) return [];
  return safeQuery(
    "getCheckoutItems",
    async () => {
      const rows = await db.query.books.findMany({
        where: (b, { and, eq, inArray }) =>
          and(eq(b.status, "published"), inArray(b.id, bookIds)),
        columns: {
          id: true,
          title: true,
          priceCents: true,
          currency: true,
          paddlePriceId: true,
        },
      });
      return rows;
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

/**
 * Phase 2.D — every category with its name and slug, ordered by name.
 * Powers the `/categories` index page (the new browse-by-category hub).
 *
 * Currently returns just slug + name; a future enhancement can add
 * book-count or featured cover via a sub-query.
 */
export interface CategorySummary {
  slug: string;
  name: string;
}

export async function listAllCategories(): Promise<CategorySummary[]> {
  return safeQuery(
    "listAllCategories",
    async () => {
      const rows = await db.query.categories.findMany({
        columns: { slug: true, name: true },
        orderBy: (c, { asc }) => asc(c.name),
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
