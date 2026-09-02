"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { loadAuthenticatedLocalUser } from "@/lib/account";
import { db } from "@/lib/db";
import { downloadLogs, entitlements } from "@/lib/db/schema";
import type { ReadStatus } from "@/lib/db/queries/account";
import { resolveEntitlementAccess } from "@/lib/db/queries/ownership";
import {
  ARTIFACTS_BUCKET,
  generateSignedDownloadUrl,
} from "@/lib/storage";

export type DownloadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Secure download Server Action (Roadmap §11).
 *
 * Discipline — in strict order, no shortcuts:
 *   1. **AuthN** — require an authenticated Clerk session via
 *      `loadAuthenticatedLocalUser`. Unauthenticated → friendly error,
 *      never a 500.
 *   2. **AuthZ** — look up the entitlement keyed on (userId, bookId)
 *      from the UNIQUE composite index. The DB enforces ownership.
 *   3. **State check** — `entitlement.status === "ready"` AND a
 *      `watermarked_key` exists. A pending entitlement gets a calm
 *      "still preparing" message, not a download link.
 *   4. **Audit log** — insert a `download_logs` row (entitlement_id,
 *      ip, user_agent) BEFORE returning the URL. This is the velocity
 *      trail §11 calls for; failure here is logged but does not block
 *      the legitimate download.
 *   5. **Signed URL** — `generateSignedDownloadUrl` from the
 *      `ARTIFACTS_BUCKET` with the configured short TTL (10 min default,
 *      15 min hard ceiling from SUB-PR 0.4).
 *
 * Returning `{ ok, url } | { ok, error }` rather than `redirect()`-ing
 * gives the calling Client Component symmetric handling — success ⇒
 * `window.location.href = url`; refusal ⇒ inline error. From the user's
 * perspective the experience is identical to a direct redirect.
 *
 * Rate-limiting (also §11) — out of scope for SUB-PR 1.7. The audit
 * trail in `download_logs` is the data source a future SUB-PR's
 * limiter will consume.
 */
export type DownloadFormat = "pdf" | "epub";

export async function downloadBook(
  bookId: string,
  format: DownloadFormat = "pdf",
): Promise<DownloadResult> {
  if (!bookId) {
    return { ok: false, error: "Missing book reference." };
  }
  if (format !== "pdf" && format !== "epub") {
    return { ok: false, error: "Unknown format." };
  }

  // 1. AuthN
  const userCtx = await loadAuthenticatedLocalUser();
  if (!userCtx.ok) {
    return {
      ok: false,
      error:
        userCtx.title === "Sign in required"
          ? "Please sign in to download."
          : "Account temporarily unavailable. Please try again.",
    };
  }

  // 2-3. AuthZ + state — delegated to the shared `resolveEntitlementAccess`
  //      chokepoint (Phase D) so the reader and the downloader can never
  //      drift on the ownership/readiness rule. Keyed on the UNIQUE
  //      (user_id, book_id) index → cross-user access is structurally
  //      impossible, and a missing entitlement is indistinguishable from a
  //      non-existent book (no enumeration).
  const access = await resolveEntitlementAccess(userCtx.localUserId, bookId);

  if (access.state === "not-owned") {
    return { ok: false, error: "You do not own this book." };
  }
  if (access.state === "not-ready") {
    return {
      ok: false,
      error:
        "Your copy is still being prepared. Please check back in a moment.",
    };
  }
  const entitlement = access.entitlement;

  // One purchase, more than one file. The entitlement is the permission; the
  // format is which of the files that permission covers. `ready` is decided by
  // the PDF, so an order whose EPUB step failed still downloads its PDF — and
  // asking for the EPUB says so plainly instead of handing over a PDF the
  // reader did not ask for.
  const artifactKey = format === "epub" ? access.epubKey : access.artifactKey;
  if (!artifactKey) {
    return {
      ok: false,
      error: "This edition has no EPUB. The PDF is ready to download.",
    };
  }

  // 4. Audit log — insert BEFORE returning the URL so the request appears
  //    in the velocity trail even if the client never actually clicks
  //    through. Best-effort: a log failure must not block a legitimate
  //    download (we log to console + return the URL anyway).
  try {
    const headerStore = await headers();
    const forwardedFor = headerStore.get("x-forwarded-for");
    const ip =
      forwardedFor?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      null;
    const userAgent = headerStore.get("user-agent") ?? null;

    await db.insert(downloadLogs).values({
      entitlementId: entitlement.id,
      ip,
      userAgent,
    });
  } catch (err) {
    console.error("[download] audit-log insert failed:", err);
  }

  // 5. Signed URL — short TTL, signed-URL-only access (§11).
  try {
    const url = await generateSignedDownloadUrl({
      bucket: ARTIFACTS_BUCKET,
      key: artifactKey,
      // Default TTL = 600s; the storage module's hard ceiling is 900s.
    });

    // Phase 2.B — stamp the entitlement so the library "Downloaded" tab
    // can filter without joining download_logs. Best-effort; a failure
    // here must NOT block the legitimate download (we already have the
    // signed URL in hand and the audit log row went in above).
    try {
      await db
        .update(entitlements)
        .set({ lastDownloadedAt: new Date() })
        .where(eq(entitlements.id, entitlement.id));
    } catch (err) {
      console.error("[download] lastDownloadedAt stamp failed:", err);
    }

    return { ok: true, url };
  } catch (err) {
    console.error("[download] signed URL generation failed:", err);
    return {
      ok: false,
      error:
        "Could not generate download link. Please try again in a moment.",
    };
  }
}

// ---------------------------------------------------------------------------
// Phase 2.B — update the read_status on a user's entitlement.
// ---------------------------------------------------------------------------

export type UpdateReadStatusResult =
  | { ok: true }
  | { ok: false; error: string };

const VALID_READ_STATUSES: ReadonlyArray<ReadStatus> = [
  "not_started",
  "reading",
  "finished",
];

/**
 * Phase 2.B — set the per-entitlement reading lifecycle status.
 *
 * Same auth + ownership discipline as `downloadBook`:
 *   1. Auth gate via `loadAuthenticatedLocalUser`
 *   2. Ownership enforced via composite (userId, bookId) WHERE clause
 *   3. Input validation against the closed enum set
 *   4. Revalidates `/account/library` so the filter bar re-renders
 *      with the new status on the next paint
 */
export async function updateReadStatus(
  bookId: string,
  status: ReadStatus,
): Promise<UpdateReadStatusResult> {
  if (!bookId) {
    return { ok: false, error: "Missing book reference." };
  }
  if (!VALID_READ_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const userCtx = await loadAuthenticatedLocalUser();
  if (!userCtx.ok) {
    return {
      ok: false,
      error:
        userCtx.title === "Sign in required"
          ? "Please sign in to update your library."
          : "Account temporarily unavailable. Please try again.",
    };
  }

  try {
    const result = await db
      .update(entitlements)
      .set({ readStatus: status })
      .where(
        and(
          eq(entitlements.userId, userCtx.localUserId),
          eq(entitlements.bookId, bookId),
        ),
      )
      .returning({ id: entitlements.id });

    if (result.length === 0) {
      return { ok: false, error: "You do not own this book." };
    }

    // Drop the cached page so the new status renders on the next request.
    revalidatePath("/account/library");
    return { ok: true };
  } catch (err) {
    console.error("[updateReadStatus] failed:", err);
    return { ok: false, error: "Could not update status. Please try again." };
  }
}
