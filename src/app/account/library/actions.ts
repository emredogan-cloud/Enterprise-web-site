"use server";

import { headers } from "next/headers";

import { loadAuthenticatedLocalUser } from "@/lib/account";
import { db } from "@/lib/db";
import { downloadLogs } from "@/lib/db/schema";
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
export async function downloadBook(bookId: string): Promise<DownloadResult> {
  if (!bookId) {
    return { ok: false, error: "Missing book reference." };
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

  // 2. AuthZ — entitlement lookup, keyed on the UNIQUE (user_id, book_id)
  //    composite index. A missing row means "you don't own this book".
  const entitlement = await db.query.entitlements.findFirst({
    where: (e, { and, eq }) =>
      and(eq(e.userId, userCtx.localUserId), eq(e.bookId, bookId)),
    columns: { id: true, status: true, watermarkedKey: true },
  });

  if (!entitlement) {
    return { ok: false, error: "You do not own this book." };
  }

  // 3. State — only `ready` entitlements with a real artifact key qualify.
  if (entitlement.status !== "ready" || !entitlement.watermarkedKey) {
    return {
      ok: false,
      error:
        "Your copy is still being prepared. Please check back in a moment.",
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
      key: entitlement.watermarkedKey,
      // Default TTL = 600s; the storage module's hard ceiling is 900s.
    });
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
