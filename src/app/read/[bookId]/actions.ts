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
 * Idempotent reading-progress sync (Roadmap §10) — the action
 * `<ReaderShell />` calls after a 2-second debounce on page changes
 * (fire-and-forget; reading UX is never blocked on a sync).
 *
 * Thin wrapper: validate input → AuthN (`loadAuthenticatedLocalUser`) →
 * delegate to `writeReadingProgress`, which enforces the Phase E ownership
 * gate and performs the UPSERT. Never throws — a sync failure must never
 * break the reader.
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

  const userCtx = await loadAuthenticatedLocalUser();
  if (!userCtx.ok) {
    return { ok: false };
  }

  return writeReadingProgress({
    userId: userCtx.localUserId,
    bookId: args.bookId,
    page: args.page,
    percent: args.percent,
  });
}

/**
 * Core reading-progress write. Exported so the Phase E reader/progress e2e
 * harness can drive it against the real DB without a Clerk session — the
 * `syncReadingProgress` action above is the only production caller and
 * supplies the authenticated `userId`.
 *
 * **Ownership gate (Phase E hardening):** only a user who OWNS the book — has
 * an entitlement for `(userId, bookId)`, any status — may write progress for
 * it. This path used to be AuthN-only; the gate makes progress writes
 * ownership-protected and consistent with the download / reader access rules,
 * so a non-owner can no longer create progress rows for books they don't own.
 *
 * **Isolation** is unchanged and structural: `reading_progress` has
 * UNIQUE (user_id, book_id) and we only ever write the caller's own
 * `user_id`, so one user can never read or overwrite another user's progress.
 *
 * Concurrency: INSERT ... ON CONFLICT UPDATE — the DB is the lock; two
 * simultaneous syncs converge to "last write wins". `percent` is clamped to
 * [0, 100] defensively. Never throws.
 */
export async function writeReadingProgress(args: {
  userId: string;
  bookId: string;
  page: number;
  percent: number;
}): Promise<SyncReadingProgressResult> {
  // Ownership gate — entitlement existence keyed on the UNIQUE
  // (user_id, book_id) index. A missing row means the caller does not own
  // this book, so they may not write progress for it.
  const owned = await db.query.entitlements.findFirst({
    where: (e, { and, eq }) =>
      and(eq(e.userId, args.userId), eq(e.bookId, args.bookId)),
    columns: { id: true },
  });
  if (!owned) {
    return { ok: false };
  }

  // Clamp percent defensively — never let a garbage `percent` reach the DB.
  const percent = Math.max(0, Math.min(100, args.percent));

  try {
    await db
      .insert(readingProgress)
      .values({
        userId: args.userId,
        bookId: args.bookId,
        page: args.page,
        percent,
      })
      .onConflictDoUpdate({
        target: [readingProgress.userId, readingProgress.bookId],
        // Canonical Postgres UPSERT: `EXCLUDED.<col>` references the row
        // that would have been inserted. Matches the §10 spec wording.
        set: {
          page: sql`EXCLUDED.page`,
          percent: sql`EXCLUDED.percent`,
          updatedAt: sql`NOW()`,
        },
      });
    return { ok: true };
  } catch (err) {
    console.error("[reading-progress] write failed:", err);
    return { ok: false };
  }
}
