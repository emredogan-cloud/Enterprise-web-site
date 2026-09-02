/**
 * Ownership / artifact-access resolution — the SINGLE source of truth for
 * "may this user access this book's private artifact?" (Roadmap §11, ADR-3).
 *
 * The download Server Action (`/account/library/actions.ts`) and the reader
 * page (`/read/[bookId]/page.tsx`) are two read paths to the same private R2
 * artifact. Before Phase D each duplicated the entitlement lookup AND the
 * `status === 'ready' && watermarkedKey` predicate; this module collapses both
 * into one tested chokepoint so the security rule can never drift between the
 * two surfaces.
 *
 * Security properties (verified by the Phase D audit):
 *   - Ownership is enforced in the WHERE clause, keyed on the UNIQUE
 *     (user_id, book_id) index. A caller can only ever resolve an entitlement
 *     for the `userId` it passes — i.e. its own authenticated session's local
 *     user id — so **cross-user access is structurally impossible**.
 *   - A missing entitlement is indistinguishable from "book does not exist"
 *     (`not-owned`), so callers cannot enumerate the catalog or other users'
 *     libraries.
 *   - `revoked` and `pending` both resolve to `not-ready`; only a `ready`
 *     entitlement WITH a stored artifact key yields `ready`. Revoking access
 *     (status → 'revoked') therefore closes both the download and the reader
 *     gate immediately, with no code change at the call sites.
 */

import { db } from "@/lib/db";
import type { EntitlementStatus } from "@/lib/db/queries/account";

export interface AccessEntitlement {
  id: string;
  status: EntitlementStatus;
  watermarkedKey: string | null;
  epubKey: string | null;
  book: { id: string; slug: string; title: string };
}

/**
 * The resolved access decision. Callers map each state onto their own UX:
 *   - download: not-owned → "you do not own", not-ready → "still preparing",
 *     ready → signed URL.
 *   - reader: not-owned → notFound(), not-ready → fallback, ready → render.
 */
export type EntitlementAccess =
  | { state: "not-owned" }
  | { state: "not-ready"; entitlement: AccessEntitlement }
  | {
      state: "ready";
      entitlement: AccessEntitlement;
      artifactKey: string;
      /** The watermarked EPUB, when this order produced one. */
      epubKey: string | null;
    };

export async function resolveEntitlementAccess(
  userId: string,
  bookId: string,
): Promise<EntitlementAccess> {
  const entitlement = await db.query.entitlements.findFirst({
    where: (e, { and, eq }) => and(eq(e.userId, userId), eq(e.bookId, bookId)),
    columns: { id: true, status: true, watermarkedKey: true, epubKey: true },
    with: {
      book: { columns: { id: true, slug: true, title: true } },
    },
  });

  if (!entitlement) return { state: "not-owned" };

  if (entitlement.status !== "ready" || !entitlement.watermarkedKey) {
    return { state: "not-ready", entitlement };
  }

  return {
    state: "ready",
    entitlement,
    // Narrowed to a non-null string by the guard above — callers can pass it
    // straight to `generateSignedDownloadUrl` without re-checking.
    artifactKey: entitlement.watermarkedKey,
    // The EPUB is optional by design. `ready` is decided by the PDF alone, so
    // this is null both for books that have no EPUB and for the rare order
    // whose EPUB step failed — in either case the caller offers one format
    // instead of two rather than refusing the download.
    epubKey: entitlement.epubKey,
  };
}
