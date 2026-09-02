import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { eq, isNotNull } from "drizzle-orm";

import { AdminAccessError, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import {
  buildWatermarkText,
  stampPdfWithWatermark,
} from "@/inngest/functions/watermark";
import {
  ARTIFACTS_BUCKET,
  MASTERS_BUCKET,
  deleteObject,
  generateSignedDownloadUrl,
  getObject,
  putObject,
} from "@/lib/storage";

/**
 * GET /api/admin/fulfillment-check?slug=<book> — run the delivery half of a
 * purchase, on the real master, in the real production runtime, without
 * inventing a sale.
 *
 * WHAT IT PROVES
 *   master in R2 → pdf-lib stamps every page → artifact written to R2 →
 *   signed URL issued → the bytes come back through that URL and are a PDF.
 *
 * That is the whole of what a buyer receives, and every step of it runs here
 * exactly as the Inngest worker runs it — same functions, same buckets, same
 * memory ceiling, same 8 MB masters. Before this route the path had never
 * been executed in production, because it had never had a customer.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 * No order row, no entitlement, no `commerce_events`, no Paddle transaction,
 * no email. A test that writes a fake order into the production ledger buys
 * a little more coverage at the price of a revenue number nobody can trust
 * afterwards. The two links this route does not exercise — the Paddle webhook
 * signature and the Inngest trigger — are covered by
 * `scripts/tmp/e2e-fulfillment.mjs`, which needs `PADDLE_WEBHOOK_SECRET` and
 * therefore an operator.
 *
 * The probe artifact is written under `diagnostics/` and deleted before the
 * response is sent, whether or not the read-back succeeded.
 *
 * Auth: signed-in admin, or `Authorization: Bearer $OPS_DIAG_TOKEN`.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function tokenAccepted(req: Request): boolean {
  const expected = process.env.OPS_DIAG_TOKEN;
  if (!expected || expected.length < 32) return false;
  const header = req.headers.get("authorization") ?? "";
  const presented = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (presented.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(presented), Buffer.from(expected));
}

export async function GET(req: Request) {
  if (!tokenAccepted(req)) {
    try {
      await requireAdmin();
    } catch (err) {
      if (err instanceof AdminAccessError) {
        return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
      }
      throw err;
    }
  }

  const slug = new URL(req.url).searchParams.get("slug");
  const rows = slug
    ? await db
        .select({ slug: books.slug, title: books.title, key: books.masterFileKey })
        .from(books)
        .where(eq(books.slug, slug))
    : await db
        .select({ slug: books.slug, title: books.title, key: books.masterFileKey })
        .from(books)
        .where(isNotNull(books.masterFileKey))
        .limit(1);

  const book = rows[0];
  if (!book?.key) {
    return NextResponse.json(
      { ok: false, error: slug ? `no master_file_key for ${slug}` : "no book has a master" },
      { status: 404 },
    );
  }

  const started = Date.now();
  const steps: Record<string, unknown> = { slug: book.slug, masterKey: book.key };
  const probeKey = `diagnostics/fulfillment-check-${Date.now()}.pdf`;

  try {
    const master = await getObject({ bucket: MASTERS_BUCKET, key: book.key });
    steps.masterBytes = master.body.byteLength;
    steps.masterContentType = master.contentType ?? null;

    const t0 = Date.now();
    const stamped = await stampPdfWithWatermark(
      master.body,
      buildWatermarkText({ buyerName: "storage diagnostic", orderId: "diagnostic-probe" }),
      { bookId: book.slug, orderId: "diagnostic-probe" },
    );
    steps.watermarkMs = Date.now() - t0;
    steps.watermarkedBytes = stamped.byteLength;

    await putObject({
      bucket: ARTIFACTS_BUCKET,
      key: probeKey,
      body: Buffer.from(stamped),
      contentType: "application/pdf",
      cacheControl: "private, max-age=0, no-store",
    });
    steps.artifactWritten = true;

    // The customer never touches the bucket; they get a short-lived signed
    // URL. Fetching it here is the only way to know that URL actually works
    // from outside the function.
    const url = await generateSignedDownloadUrl({
      bucket: ARTIFACTS_BUCKET,
      key: probeKey,
      ttlSeconds: 120,
    });
    const res = await fetch(url);
    const bytes = res.ok ? Buffer.from(await res.arrayBuffer()) : null;
    steps.signedUrlStatus = res.status;
    steps.signedUrlContentType = res.headers.get("content-type");
    steps.downloadedBytes = bytes?.byteLength ?? 0;
    steps.isPdf = bytes ? bytes.subarray(0, 5).toString("latin1") === "%PDF-" : false;
    steps.bytesMatch = bytes ? bytes.byteLength === stamped.byteLength : false;
  } catch (err) {
    steps.error = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  } finally {
    try {
      await deleteObject({ bucket: ARTIFACTS_BUCKET, key: probeKey });
      steps.probeDeleted = true;
    } catch (err) {
      steps.probeDeleted = false;
      steps.probeDeleteError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    ok: Boolean(steps.isPdf && steps.bytesMatch && !steps.error),
    checkedAt: new Date().toISOString(),
    totalMs: Date.now() - started,
    note: "Delivery path only. No order, entitlement or transaction was created.",
    ...steps,
  });
}
