"use server";

/**
 * Server Actions for the book detail page (Roadmap §6, §11).
 *
 * `submitReview` is the only action right now. It is the *write* path for
 * the book detail page; everything else on `/books/[slug]` is read-only
 * SSG / ISR content.
 *
 * The action is authoritative for AuthZ — the Client Component renders
 * "Sign in to review" for unauthenticated visitors and (optimistically)
 * shows the form for signed-in users, but the *real* gate is here:
 *
 *   1. Require Clerk session              → no anonymous review writes
 *   2. JIT-upsert local user row          → so we have a stable UUID
 *   3. Verify `entitlements.status='ready'` → verified-purchaser model
 *   4. Validate rating + body server-side  → defense-in-depth
 *   5. Upsert review (ON CONFLICT on the schema's UK)
 *   6. `revalidatePath` the affected book page
 *
 * Never throws. Returns a discriminated union so the calling form can
 * surface a precise inline error message without bouncing the user to
 * Next.js's error boundary.
 */

import { revalidatePath } from "next/cache";

import {
  getAuthenticatedUser,
  getUserId,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { upsertLocalUser } from "@/lib/db/users";

// -----------------------------------------------------------------------------
// Types — exported so the client form can type its handler.
// -----------------------------------------------------------------------------

export interface SubmitReviewInput {
  slug: string;
  bookId: string;
  /** Integer 1–5, validated server-side. */
  rating: number;
  /** Optional. Trimmed and length-capped server-side. */
  body: string | null;
}

export type SubmitReviewResult =
  | { ok: true }
  | { ok: false; error: string };

// -----------------------------------------------------------------------------
// Limits — kept here so they're discoverable from one place.
// -----------------------------------------------------------------------------

const MIN_RATING = 1;
const MAX_RATING = 5;
const MAX_BODY_LENGTH = 4000;

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

export async function submitReview(
  input: SubmitReviewInput,
): Promise<SubmitReviewResult> {
  // ---- 1. Validate input shape (cheap, no I/O) -----------------------------
  const ratingInt = Math.trunc(input.rating);
  if (
    !Number.isFinite(input.rating) ||
    ratingInt !== input.rating ||
    ratingInt < MIN_RATING ||
    ratingInt > MAX_RATING
  ) {
    return {
      ok: false,
      error: `Rating must be a whole number between ${MIN_RATING} and ${MAX_RATING}.`,
    };
  }

  const bodyTrimmed =
    typeof input.body === "string" ? input.body.trim() : "";
  if (bodyTrimmed.length > MAX_BODY_LENGTH) {
    return {
      ok: false,
      error: `Review text must be ${MAX_BODY_LENGTH.toLocaleString()} characters or fewer.`,
    };
  }
  const bodyOrNull = bodyTrimmed.length > 0 ? bodyTrimmed : null;

  if (typeof input.bookId !== "string" || input.bookId.length === 0) {
    return { ok: false, error: "Missing book reference." };
  }
  if (typeof input.slug !== "string" || input.slug.length === 0) {
    return { ok: false, error: "Missing book slug." };
  }

  // ---- 2. AuthN (require Clerk session) ------------------------------------
  const clerkUserId = await getUserId();
  if (!clerkUserId) {
    return { ok: false, error: "Please sign in to write a review." };
  }

  // ---- 3. Resolve local user row (JIT) -------------------------------------
  // We need the email to upsert; pull it from Clerk. One Clerk API call per
  // submission is acceptable — this is a low-frequency write path.
  const clerkUser = await getAuthenticatedUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;
  if (!email) {
    return {
      ok: false,
      error: "Your account is missing a verified email. Update it before reviewing.",
    };
  }
  const userId = await upsertLocalUser({
    clerkUserId,
    email,
    name: clerkUser?.fullName ?? undefined,
  });

  // ---- 4. AuthZ — verified-purchaser gate ---------------------------------
  // The brief is explicit: only users with `entitlements.status = 'ready'`
  // for this book may review. That excludes:
  //   - users who never bought it (no entitlement row)
  //   - users whose watermark job is still in-flight (`pending`)
  //   - users whose entitlement was revoked (refund, fraud, etc.)
  const entitled = await db.query.entitlements.findFirst({
    where: (e, { and, eq }) =>
      and(
        eq(e.userId, userId),
        eq(e.bookId, input.bookId),
        eq(e.status, "ready"),
      ),
    columns: { id: true },
  });
  if (!entitled) {
    return {
      ok: false,
      error: "Only readers who own this book can leave a review.",
    };
  }

  // ---- 5. Persist (upsert via the schema's (user_id, book_id) UK) ----------
  // The unique index `reviews_user_book_uk` enforces one review per
  // (user, book). `onConflictDoUpdate` turns "edit my review" into the
  // same code path as "create my review" — no separate update endpoint.
  // `createdAt` is deliberately omitted from the SET so the original
  // submission timestamp is preserved across edits.
  //
  // `status: 'approved'` is the explicit override of the schema default
  // (`pending`). The verified-purchaser gate above is the trust signal;
  // pre-moderation would just add latency. The 'pending' / 'rejected'
  // states are kept available for a future flagging workflow.
  try {
    await db
      .insert(reviews)
      .values({
        userId,
        bookId: input.bookId,
        rating: ratingInt,
        body: bodyOrNull,
        status: "approved",
      })
      .onConflictDoUpdate({
        target: [reviews.userId, reviews.bookId],
        set: {
          rating: ratingInt,
          body: bodyOrNull,
          status: "approved",
        },
      });
  } catch (err) {
    console.error("[submitReview] insert failed:", err);
    return {
      ok: false,
      error: "We couldn't save your review just now. Please try again shortly.",
    };
  }

  // ---- 6. ISR invalidation -------------------------------------------------
  // Targeted revalidation: only this book's page needs re-rendering. The
  // catalog browse, other book pages, and the home page all stay cached.
  revalidatePath(`/books/${input.slug}`);

  return { ok: true };
}
