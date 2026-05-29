/**
 * Privacy-retention purge job (Roadmap §11 — "auto-expire watermark/
 * download PII per retention schedule").
 *
 * Two retention windows:
 *   - `download_logs` rows  : 30 days  (velocity / abuse-detection trail)
 *   - watermarked artifacts : 730 days (≈ 2 years; PII baked into the PDF)
 *
 * What this function does on each run:
 *   1. DELETE every `download_logs` row older than `DOWNLOAD_LOG_RETENTION_DAYS`.
 *   2. NULL-OUT `entitlements.watermarked_key` for entitlements older than
 *      `WATERMARK_RETENTION_DAYS`. The corresponding R2 object becomes
 *      unreachable through our app — a future enhancement can also issue
 *      an R2 `DeleteObjectCommand` against each key to remove the bytes
 *      themselves. (For now: documented but not wired.)
 *
 * Important: this purge does NOT touch the underlying entitlement row.
 * The user's "yours forever" perpetual license remains valid; only the
 * specific watermarked artifact expires. If the user requests the book
 * after expiry, the watermark worker can re-stamp on demand (a future
 * SUB-PR wires that flow).
 *
 * Scheduling: this is a pure DB function. Wire it as a Vercel Cron job:
 *
 *   // vercel.json
 *   {
 *     "crons": [
 *       { "path": "/api/cron/purge-expired-pii", "schedule": "0 3 * * *" }
 *     ]
 *   }
 *
 *   // src/app/api/cron/purge-expired-pii/route.ts (FUTURE SUB-PR)
 *   import { purgeExpiredPrivacyData } from "@/lib/privacy-retention";
 *   export async function GET(request: Request) {
 *     // Verify Vercel Cron signature here before invoking.
 *     const result = await purgeExpiredPrivacyData();
 *     return Response.json(result);
 *   }
 *
 * Idempotency: the queries are time-based, set-based, and side-effect-free
 * beyond the targeted writes. Running the job hourly vs. daily vs. weekly
 * yields the same eventual state — the only delta is how soon expired data
 * is purged after its retention window closes.
 */

import { and, isNotNull, lt } from "drizzle-orm";

import { db } from "@/lib/db";
import { downloadLogs, entitlements } from "@/lib/db/schema";

export const DOWNLOAD_LOG_RETENTION_DAYS = 30;
export const WATERMARK_RETENTION_DAYS = 730; // ≈ 2 years

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface PurgeResult {
  downloadLogsDeleted: number;
  watermarkArtifactsCleared: number;
}

export async function purgeExpiredPrivacyData(): Promise<PurgeResult> {
  const now = Date.now();
  const logsCutoff = new Date(now - DOWNLOAD_LOG_RETENTION_DAYS * MS_PER_DAY);
  const watermarkCutoff = new Date(
    now - WATERMARK_RETENTION_DAYS * MS_PER_DAY,
  );

  // 1. Delete expired download_logs.
  const deletedLogs = await db
    .delete(downloadLogs)
    .where(lt(downloadLogs.createdAt, logsCutoff))
    .returning({ id: downloadLogs.id });

  // 2. Clear stale watermarked_key references. We leave the entitlement
  //    row itself intact — perpetual ownership is preserved; only the
  //    PII-bearing artifact reference expires. (The R2 object remains
  //    orphaned in storage until a future SUB-PR adds a deleteObject
  //    sweep — at that point this function can delete the bytes too.)
  const clearedWatermarks = await db
    .update(entitlements)
    .set({ watermarkedKey: null })
    .where(
      and(
        lt(entitlements.createdAt, watermarkCutoff),
        isNotNull(entitlements.watermarkedKey),
      ),
    )
    .returning({ id: entitlements.id });

  return {
    downloadLogsDeleted: deletedLogs.length,
    watermarkArtifactsCleared: clearedWatermarks.length,
  };
}
