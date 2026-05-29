"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { loadAuthenticatedLocalUser } from "@/lib/account";
import { db } from "@/lib/db";
import { readingProgress, reviews, users } from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type ExportUserDataResult =
  | { ok: true; filename: string; json: string }
  | { ok: false; error: string };

export type DeleteUserAccountResult =
  | { ok: true; clerkDeleted: boolean }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// `exportUserData` — GDPR data export (Roadmap §11 — "data export & delete").
// ---------------------------------------------------------------------------

/**
 * Build a single JSON blob of every row keyed on the caller's `userId`,
 * across the five categories the spec calls out: profile, orders,
 * entitlements, reading progress, reviews.
 *
 * Privacy posture:
 *   - Includes user-facing fields only. Internal storage keys
 *     (`watermarked_key`, `master_file_key`) and FTS columns are
 *     explicitly EXCLUDED from the projection — the export is for the
 *     human, not for our infra.
 *   - All queries are `userId`-scoped via the SQL WHERE clause; the user
 *     cannot pull anyone else's data.
 *
 * Returns `{ ok: true, filename, json }`. The Client Component turns the
 * JSON string into a Blob and triggers a browser download.
 */
export async function exportUserData(): Promise<ExportUserDataResult> {
  const userCtx = await loadAuthenticatedLocalUser();
  if (!userCtx.ok) {
    return { ok: false, error: "You must be signed in to export your data." };
  }

  const { localUserId } = userCtx;

  try {
    const [profile, userOrders, userEntitlements, userProgress, userReviews] =
      await Promise.all([
        db.query.users.findFirst({
          where: (u, { eq: _eq }) => _eq(u.id, localUserId),
          columns: {
            id: true,
            email: true,
            name: true,
            authProvider: true,
            locale: true,
            createdAt: true,
          },
        }),
        db.query.orders.findMany({
          where: (o, { eq: _eq }) => _eq(o.userId, localUserId),
          orderBy: (o, { desc }) => desc(o.createdAt),
          columns: {
            id: true,
            morOrderRef: true,
            totalCents: true,
            taxCents: true,
            currency: true,
            status: true,
            createdAt: true,
          },
          with: {
            items: {
              columns: { bookId: true, priceCentsAtPurchase: true },
              with: {
                book: { columns: { slug: true, title: true } },
              },
            },
          },
        }),
        db.query.entitlements.findMany({
          where: (e, { eq: _eq }) => _eq(e.userId, localUserId),
          orderBy: (e, { desc }) => desc(e.createdAt),
          // Deliberately omit `watermarkedKey` — it's an internal storage path.
          columns: {
            bookId: true,
            orderId: true,
            status: true,
            createdAt: true,
          },
          with: { book: { columns: { slug: true, title: true } } },
        }),
        db.query.readingProgress.findMany({
          where: (rp, { eq: _eq }) => _eq(rp.userId, localUserId),
          orderBy: (rp, { desc }) => desc(rp.updatedAt),
          columns: {
            bookId: true,
            page: true,
            percent: true,
            updatedAt: true,
          },
          with: { book: { columns: { slug: true, title: true } } },
        }),
        db.query.reviews.findMany({
          where: (r, { eq: _eq }) => _eq(r.userId, localUserId),
          orderBy: (r, { desc }) => desc(r.createdAt),
          columns: {
            bookId: true,
            rating: true,
            body: true,
            status: true,
            createdAt: true,
          },
          with: { book: { columns: { slug: true, title: true } } },
        }),
      ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      generator: "digital-bookstore",
      profile: profile ?? null,
      orders: userOrders,
      entitlements: userEntitlements,
      readingProgress: userProgress,
      reviews: userReviews,
    };

    const filename = `digital-bookstore-export-${localUserId}-${Date.now()}.json`;
    return {
      ok: true,
      filename,
      json: JSON.stringify(payload, null, 2),
    };
  } catch (err) {
    console.error("[export] failed:", err);
    return {
      ok: false,
      error: "Could not export your data right now. Please try again.",
    };
  }
}

// ---------------------------------------------------------------------------
// `deleteUserAccount` — GDPR right-to-erasure for personal data, with
// commercial-record retention (Roadmap §11 — "auto-expire watermark/download
// PII per retention schedule" + tax-record retention via MoR).
// ---------------------------------------------------------------------------

/**
 * Two-phase deletion:
 *
 *   Phase 1 — LOCAL DATA (atomic, in a DB transaction):
 *     - DELETE FROM reading_progress WHERE user_id = $localUserId
 *     - DELETE FROM reviews          WHERE user_id = $localUserId
 *     - UPDATE users SET (email anonymized, name=NULL, auth_provider='deleted')
 *       WHERE id = $localUserId
 *     - Commercial rows — orders, order_items, entitlements — are LEFT INTACT.
 *       Their FKs back to users.id stay valid because the row still exists,
 *       just anonymized. This is the §11 + MoR-tax-records retention promise.
 *
 *   Phase 2 — CLERK IDENTITY (best-effort, OUTSIDE the tx):
 *     - clerkClient.users.deleteUser($clerkUserId)
 *     - On failure: the local data is already anonymized (the GDPR-required
 *       work). We return { ok: true, clerkDeleted: false } so the UI can
 *       surface a "complete deletion via your auth provider" instruction.
 *
 * Order matters: local first, Clerk second. If we did Clerk first and the
 * local tx failed, the user would be locked out of cleaning up their own
 * residual data.
 *
 * Idempotency: the email anonymization uses `deleted-${localUserId}@anonymous.local`
 * — guaranteed unique (UUIDs don't collide), so repeated calls converge
 * deterministically. The `users.email` UNIQUE constraint is preserved.
 */
export async function deleteUserAccount(): Promise<DeleteUserAccountResult> {
  const userCtx = await loadAuthenticatedLocalUser();
  if (!userCtx.ok) {
    return { ok: false, error: "You must be signed in to delete your account." };
  }
  const { localUserId, clerkUserId } = userCtx;

  // Phase 1 — atomic local-data anonymization.
  try {
    await db.transaction(async (tx) => {
      await tx.delete(readingProgress).where(eq(readingProgress.userId, localUserId));
      await tx.delete(reviews).where(eq(reviews.userId, localUserId));
      await tx
        .update(users)
        .set({
          email: `deleted-${localUserId}@anonymous.local`,
          name: null,
          authProvider: "deleted",
          // `locale` is NOT NULL with a default; leave as-is — not identifying.
        })
        .where(eq(users.id, localUserId));
    });
  } catch (err) {
    console.error("[delete-account] local anonymization failed:", err);
    return {
      ok: false,
      error:
        "Could not anonymize your local data. Please contact support — no changes have been made.",
    };
  }

  // Phase 2 — best-effort Clerk identity deletion.
  let clerkDeleted = false;
  try {
    const client = await clerkClient();
    await client.users.deleteUser(clerkUserId);
    clerkDeleted = true;
  } catch (err) {
    console.warn(
      "[delete-account] Clerk identity deletion failed; local data is already anonymized:",
      err,
    );
  }

  return { ok: true, clerkDeleted };
}
