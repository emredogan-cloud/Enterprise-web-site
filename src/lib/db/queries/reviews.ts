/**
 * Reviews queries (Roadmap §6, §10, §13).
 *
 * Two read paths are exposed:
 *   - `getReviewsForBook(bookId)` — the per-book list shown on the detail
 *     page. Filters to `status = 'approved'` so any future moderation
 *     workflow (hide/reject) immediately takes effect on the public page
 *     without a code change.
 *   - `getBookRatingAggregate(bookId)` — `{ count, average }` for SEO
 *     `AggregateRating` JSON-LD and the page's headline summary.
 *
 * Both are `safeQuery`-wrapped (same discipline as `catalog.ts` /
 * `account.ts`), so an unprovisioned DB at build time degrades to an
 * empty list / zero-count aggregate instead of breaking SSG.
 */

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { reviews, users } from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// safeQuery — local copy; the catalog/account modules each keep their own
// to avoid coupling the query files through a shared utility import.
// ---------------------------------------------------------------------------
async function safeQuery<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await run();
  } catch (err) {
    console.warn(
      `[reviews] ${label} failed (DB unavailable or query error):`,
      err instanceof Error ? err.message : err,
    );
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReviewItem {
  id: string;
  rating: number;
  body: string | null;
  createdAt: Date;
  /**
   * Display name resolved server-side. Sourced from `users.name` (set by
   * the JIT upsert from Clerk's full name). Falls back to "Reader" when
   * the user has not provided a name — never leaks the email address.
   */
  authorName: string;
}

export interface RatingAggregate {
  /** Total number of `approved` reviews for the book. */
  count: number;
  /**
   * Mean rating across approved reviews, rounded to 1 decimal place.
   * `null` when there are zero reviews — callers MUST treat this as
   * "no aggregate" (e.g., omit AggregateRating from JSON-LD).
   */
  average: number | null;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * All approved reviews for a book, newest first. Joins `users.name` for
 * the display name; the email and any other PII columns are NOT projected.
 */
export async function getReviewsForBook(
  bookId: string,
): Promise<ReviewItem[]> {
  return safeQuery(
    "getReviewsForBook",
    async () => {
      const rows = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          body: reviews.body,
          createdAt: reviews.createdAt,
          // `users.name` is nullable; we resolve to "Reader" in the map step.
          authorName: users.name,
        })
        .from(reviews)
        .innerJoin(users, eq(users.id, reviews.userId))
        .where(and(eq(reviews.bookId, bookId), eq(reviews.status, "approved")))
        .orderBy(sql`${reviews.createdAt} desc`);

      return rows.map((r) => ({
        id: r.id,
        rating: r.rating,
        body: r.body,
        createdAt: r.createdAt,
        authorName: r.authorName?.trim() || "Reader",
      }));
    },
    [],
  );
}

/**
 * `{ count, average }` for the book — exactly the inputs the JSON-LD
 * `AggregateRating` shape needs. Computed in SQL (single round-trip) so it
 * scales beyond a few hundred reviews without dragging every row to the
 * app server.
 */
export async function getBookRatingAggregate(
  bookId: string,
): Promise<RatingAggregate> {
  return safeQuery(
    "getBookRatingAggregate",
    async () => {
      // `::int` and `::real` cast the Postgres numeric results into types
      // that Drizzle marshals as plain numbers (vs. `string` for default
      // numeric). `avg()` returns NULL when there are no rows; we use that
      // to signal "no aggregate" rather than `0`, which would be misread
      // as "everyone gave it zero stars".
      const [agg] = await db
        .select({
          count: sql<number>`count(*)::int`,
          average: sql<number | null>`avg(${reviews.rating})::real`,
        })
        .from(reviews)
        .where(
          and(eq(reviews.bookId, bookId), eq(reviews.status, "approved")),
        );

      if (!agg || agg.count === 0) return { count: 0, average: null };
      return {
        count: agg.count,
        average:
          agg.average === null
            ? null
            : Math.round(agg.average * 10) / 10, // 1-decimal place
      };
    },
    { count: 0, average: null },
  );
}
