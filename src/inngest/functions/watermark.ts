import { and, eq } from "drizzle-orm";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { db } from "@/lib/db";
import { entitlements } from "@/lib/db/schema";
import { sendOrderReadyEmail } from "@/lib/email";
import {
  FULFILLMENT_EVENT,
  type FulfillmentTransactionCompletedData,
  inngest,
} from "@/lib/inngest/client";
import {
  ARTIFACTS_BUCKET,
  MASTERS_BUCKET,
  getObject,
  putObject,
} from "@/lib/storage";

/**
 * Watermark fulfillment worker (Roadmap §9 fulfillment pipeline, ADR-3).
 *
 * Triggered by `fulfillment.transaction.completed`. Iterates the order's
 * `bookIds` sequentially via `step.run`, so each per-book watermark is an
 * independently-checkpointed Inngest step — a failure on book #2 does not
 * re-stamp book #1 when Inngest retries (the step's stable name is the
 * checkpoint key).
 *
 * Per-book idempotency is double-layered:
 *   1. Inngest step-name dedupe (`watermark-<bookId>`) — re-runs of the
 *      same event skip completed steps automatically.
 *   2. DB-level guard — the worker reads `entitlement.status` first and
 *      short-circuits when it is already `ready` with an artifact key.
 *      This protects against a re-trigger from a different event (e.g.,
 *      a manual replay) producing a redundant R2 write.
 */
export const processFulfillment = inngest.createFunction(
  {
    id: "process-fulfillment-transaction",
    retries: 3,
    triggers: [{ event: FULFILLMENT_EVENT }],
  },
  async ({ event, step }) => {
    // v4 `event.data` is loosely typed without schemas; we cast through
    // the shared contract from `src/lib/inngest/client.ts` so the two
    // sides of the wire stay aligned.
    const data = event.data as FulfillmentTransactionCompletedData;
    const { orderId, userId, buyerName, buyerEmail, bookIds, transactionId } =
      data;

    const results: Array<{
      bookId: string;
      status: "already-ready" | "watermarked";
      artifactKey: string;
    }> = [];

    for (const bookId of bookIds) {
      const result = await step.run(`watermark-${bookId}`, async () => {
        return await watermarkOneBook({
          orderId,
          userId,
          bookId,
          buyerName,
        });
      });
      results.push({ bookId, ...result });

      // Send the "your book is ready" email — separate Inngest step so it
      // checkpoints independently of the watermark step (a retry of the
      // email never re-runs the watermark, and vice-versa). We skip the
      // send when the entitlement was already-ready (re-trigger scenario:
      // the customer already got the email on the original delivery).
      //
      // Resend-side idempotency via `idempotencyKey` (inside
      // `sendOrderReadyEmail`) means even if Inngest's at-least-once
      // delivery causes this step to fire twice, Resend dedupes server-
      // side and the customer never sees a duplicate.
      if (result.status === "watermarked") {
        await step.run(`email-order-ready-${bookId}`, async () => {
          const emailResult = await sendOrderReadyEmail({
            to: buyerEmail,
            buyerName,
            bookTitle: result.bookTitle,
            orderId,
            bookId,
          });
          if (!emailResult.ok) {
            // Log and continue — email failure is observable but does NOT
            // roll back fulfillment. Entitlement is already `ready`; the
            // customer can reach the book via /account/library.
            console.warn(
              `[email] order-ready send failed for order=${orderId} book=${bookId}: ${emailResult.error}`,
            );
          }
          return emailResult;
        });
      }
    }

    return {
      transactionId,
      orderId,
      bookCount: bookIds.length,
      results,
    };
  },
);

// ---------------------------------------------------------------------------
// Per-book worker — fetch master → stamp → upload → mark ready.
// Email is sent in the caller's separate `step.run` (SUB-PR 4.3).
// ---------------------------------------------------------------------------

interface WatermarkArgs {
  orderId: string;
  userId: string;
  bookId: string;
  buyerName: string | null;
}

interface WatermarkResult {
  status: "already-ready" | "watermarked";
  artifactKey: string;
  /**
   * Returned so the caller can compose the order-ready email without a
   * second DB lookup. Populated from `books.title` in step 1.
   */
  bookTitle: string;
}

async function watermarkOneBook(args: WatermarkArgs): Promise<WatermarkResult> {
  const { orderId, userId, bookId, buyerName } = args;

  // 1. Fetch the entitlement + book in one relational read.
  const entitlement = await db.query.entitlements.findFirst({
    where: (e, { eq: _eq, and: _and }) =>
      _and(_eq(e.userId, userId), _eq(e.bookId, bookId)),
    with: {
      book: { columns: { id: true, title: true, masterFileKey: true } },
    },
  });
  if (!entitlement) {
    throw new Error(
      `[watermark] no entitlement for user=${userId} book=${bookId}`,
    );
  }
  if (!entitlement.book) {
    throw new Error(`[watermark] book ${bookId} not found`);
  }
  if (!entitlement.book.masterFileKey) {
    throw new Error(
      `[watermark] book ${bookId} has no masterFileKey — cannot watermark`,
    );
  }

  // 1a. Idempotency short-circuit: already done? Return without touching R2.
  if (entitlement.status === "ready" && entitlement.watermarkedKey) {
    return {
      status: "already-ready",
      artifactKey: entitlement.watermarkedKey,
      bookTitle: entitlement.book.title,
    };
  }

  // 2. Pull the master PDF bytes from the private R2 bucket.
  const master = await getObject({
    bucket: MASTERS_BUCKET,
    key: entitlement.book.masterFileKey,
  });

  // 3. Stamp watermark — name + short order id (NO raw email — Roadmap §11
  //    PII minimization). The order id maps back to email server-side.
  const watermarkText = buildWatermarkText({ buyerName, orderId });
  const watermarkedBytes = await stampPdfWithWatermark(
    master.body,
    watermarkText,
    { bookId, orderId },
  );

  // 4. Upload artifact to the private ARTIFACTS bucket.
  const artifactKey = buildArtifactKey({ orderId, bookId });
  await putObject({
    bucket: ARTIFACTS_BUCKET,
    key: artifactKey,
    body: Buffer.from(watermarkedBytes),
    contentType: "application/pdf",
    cacheControl: "private, max-age=0, no-store",
    metadata: { orderId, userId, bookId },
  });

  // 5. Update the entitlement to `ready` + record the artifact key.
  await db
    .update(entitlements)
    .set({ status: "ready", watermarkedKey: artifactKey })
    .where(
      and(eq(entitlements.userId, userId), eq(entitlements.bookId, bookId)),
    );

  return {
    status: "watermarked",
    artifactKey,
    bookTitle: entitlement.book.title,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildArtifactKey(args: { orderId: string; bookId: string }): string {
  return `${args.orderId}/${args.bookId}.pdf`;
}

function buildWatermarkText(args: {
  buyerName: string | null;
  orderId: string;
}): string {
  const name = (args.buyerName?.trim() || "reader").slice(0, 80);
  const shortOrder = args.orderId.slice(0, 8);
  return `Licensed to ${name} · Order ${shortOrder} · Digital Bookstore`;
}

/**
 * Stamp a footer-line watermark on every page + embed forensic metadata.
 *
 * Memory profile: pdf-lib loads the full PDF into memory and rebuilds it
 * on `.save()`. Peak usage ≈ 2-3× the source size while processing — fine
 * for the assumed 1-50 MB range (A6), well under Vercel Function limits.
 * Very large PDFs (>100 MB) would warrant a streaming pipeline; out of
 * scope for SUB-PR 1.6.
 *
 * The watermark is intentionally subtle: small, slightly-transparent,
 * pinned to the page footer. Social DRM is about *trace and deter*, not
 * about defacing the book.
 */
async function stampPdfWithWatermark(
  masterBytes: Uint8Array,
  watermarkText: string,
  forensic: { bookId: string; orderId: string },
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(masterBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  for (const page of pdfDoc.getPages()) {
    page.drawText(watermarkText, {
      x: 36,
      y: 18,
      size: 8,
      font,
      color: rgb(0.4, 0.4, 0.4),
      opacity: 0.7,
    });
  }

  // Forensic-only XMP metadata — invisible to readers, queryable by tooling.
  pdfDoc.setSubject(watermarkText);
  pdfDoc.setProducer("Digital Bookstore");
  pdfDoc.setKeywords([
    `orderId:${forensic.orderId}`,
    `bookId:${forensic.bookId}`,
  ]);

  return await pdfDoc.save();
}

