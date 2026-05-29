"use server";

import { sql } from "drizzle-orm";

import { loadAuthenticatedLocalUser } from "@/lib/account";
import { db } from "@/lib/db";
import { readingProgress } from "@/lib/db/schema";

export interface SyncReadingProgressArgs {
  bookId: string;
  /** 1-indexed page number the user is currently viewing. */
  page: number;
  /** `(page / totalPages) * 100`, clamped to [0, 100]. */
  percent: number;
}

export interface SyncReadingProgressResult {
  ok: boolean;
}

/**
 * Idempotent UPSERT into `reading_progress` (Roadmap §10).
 *
 * Triggered from `<ReaderShell />` after a 2-second debounce on page
 * changes — fire-and-forget from the client (we never block reading
 * UX on a sync).
 *
 * Concurrency model:
 *   - Schema has `UNIQUE (user_id, book_id)` (`reading_progress_user_book_uk`
 *     from SUB-PR 0.3).
 *   - We INSERT and `ON CONFLICT` UPDATE — the DB itself is the lock.
 *     Two simultaneous sync calls (rapid resize + page flip, two tabs)
 *     converge to "last write wins" deterministically.
 *
 * Auth scope:
 *   - AuthN via `loadAuthenticatedLocalUser` (per the SUB-PR 2.2 brief).
 *   - **No entitlement check** — `reading_progress` is benign metadata
 *     keyed on the caller's own `user_id`. A malicious client can only
 *     pollute their own progress rows; they cannot read other users'
 *     data or affect any other user's library. The download / reader
 *     paths (1.7 / 2.1) remain the AuthZ chokepoints.
 *
 * Failure mode:
 *   - All exceptions are caught and logged; the action returns
 *     `{ ok: false }`. The reader continues; the next page flip will
 *     attempt another sync. We never throw — a sync failure must
 *     never break the reader.
 */
export async function syncReadingProgress(
  args: SyncReadingProgressArgs,
): Promise<SyncReadingProgressResult> {
  // Cheap input validation — reject malformed payloads before any IO.
  if (
    !args.bookId ||
    !Number.isInteger(args.page) ||
    args.page < 1 ||
    !Number.isFinite(args.percent)
  ) {
    return { ok: false };
  }

  // Clamp percent defensively — accept any positive page but never let a
  // garbage `percent` (negative, > 100, NaN) reach the DB.
  const percent = Math.max(0, Math.min(100, args.percent));

  const userCtx = await loadAuthenticatedLocalUser();
  if (!userCtx.ok) {
    return { ok: false };
  }

  try {
    await db
      .insert(readingProgress)
      .values({
        userId: userCtx.localUserId,
        bookId: args.bookId,
        page: args.page,
        percent,
      })
      .onConflictDoUpdate({
        target: [readingProgress.userId, readingProgress.bookId],
        // Canonical Postgres UPSERT: `EXCLUDED.<col>` references the row
        // that would have been inserted. Functionally equivalent to passing
        // the values again, but matches the §10 spec wording precisely.
        set: {
          page: sql`EXCLUDED.page`,
          percent: sql`EXCLUDED.percent`,
          updatedAt: sql`NOW()`,
        },
      });
    return { ok: true };
  } catch (err) {
    console.error("[reading-progress] sync failed:", err);
    return { ok: false };
  }
}
