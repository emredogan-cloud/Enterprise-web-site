import { NextResponse } from "next/server";

import {
  DOWNLOAD_MAX_OPENS,
  DOWNLOAD_TTL_HOURS,
  isFreshDownloadStart,
  recordDownload,
  resolveDownloadToken,
} from "@/lib/db/queries/free-books";
import { logger } from "@/lib/logger";
import { MASTERS_BUCKET, streamObject } from "@/lib/storage";

/**
 * GET /download/<token> — the reader's copy of a book too large to attach.
 *
 * WHY THIS EXISTS
 * Three masters are past any mail provider's ceiling (104 MB, 93 MB, 67 MB;
 * Gmail itself stops at 25 MB), so those deliveries fall back to a link. The
 * link used to be the raw signed R2 URL, roughly 700 characters of
 * `…r2.cloudflarestorage.com/bookstore-masters-dev/books/<slug>/master/v1/
 * master.pdf?X-Amz-Algorithm=…`. That put the account id, the bucket name and
 * the object path in front of the customer, looked exactly like the kind of
 * URL a phishing filter is built to distrust, and expired in fifteen minutes.
 *
 * Now the reader gets `valicepress.com/download/<token>` and stays on the
 * imprint's own domain.
 *
 * WHAT THE URL CANNOT BE MADE TO DO
 * The token names a REQUEST, not a file. There is no slug, id, bucket or path
 * anywhere in it, so there is nothing to tamper with: editing the URL cannot
 * select another book, and `..` cannot escape anything, because no part of the
 * request reaches a storage key. The key is found by looking the row up, and
 * the row was written by the server when the reader asked for that one book.
 *
 * WHY IT STREAMS
 * `streamObject` hands the S3 body straight to the response. Reading 104 MB
 * into a Buffer inside a serverless function is how you meet its memory
 * ceiling. Range requests pass through so a big download can resume.
 *
 * A row is a record of an ask, never a standing right: the token expires
 * after `DOWNLOAD_TTL_HOURS` and closes after `DOWNLOAD_MAX_OPENS` fresh
 * opens, whichever comes first.
 *
 * WHAT IT NEVER RETURNS: the bucket, the key, a signed URL, the recipient's
 * address, or any hint about books other than the one the token names.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** A small, calm page — this is a customer-facing surface, not an API. */
function page(title: string, body: string, status: number) {
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Valice Press</title>
<style>
 :root{color-scheme:dark}
 body{margin:0;min-height:100vh;display:grid;place-items:center;background:#050705;
      color:#e6e6e0;font:16px/1.6 ui-serif,Georgia,serif;padding:24px}
 .card{max-width:460px;text-align:center}
 p.k{font:600 11px/1 ui-monospace,monospace;letter-spacing:.24em;text-transform:uppercase;color:#d6b266;margin:0 0 18px}
 h1{font-size:26px;font-weight:600;margin:0 0 14px;letter-spacing:-.01em}
 p{color:#a7a7a0;margin:0 0 10px}
 a{color:#e2c074}
</style></head><body><div class="card">
<p class="k">Valice Press</p><h1>${title}</h1>${body}
<p style="margin-top:22px"><a href="https://valicepress.com/books">Browse the library</a></p>
</div></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token: raw } = await params;
  const token = decodeURIComponent(raw ?? "").trim();

  const row = await resolveDownloadToken(token);

  // Unknown token. One generic answer, so probing cannot distinguish "never
  // existed" from "belonged to someone else" — and with 256 bits of entropy
  // nobody is arriving here by guessing anyway.
  if (!row) {
    return page(
      "This link isn’t valid",
      `<p>We couldn’t find a download for this link. It may have been mistyped,
       or the link may have been replaced by a newer one.</p>
       <p>Reply to the email we sent you and we’ll send a fresh link.</p>`,
      404,
    );
  }

  if (row.expired) {
    return page(
      "This link has expired",
      `<p>Download links last ${DOWNLOAD_TTL_HOURS} hours, and this one has
       passed that.</p>
       <p>Reply to the email we sent you and we’ll send a fresh one straight
       away — the book is still yours.</p>`,
      410,
    );
  }

  /**
   * Opened too many times.
   *
   * Same generic, calm answer as an expiry: a reader who hit the ceiling
   * legitimately gets a fresh link by replying, and a link that leaked stops
   * paying out. `DOWNLOAD_MAX_OPENS` explains the number.
   */
  if ((row.downloadCount ?? 0) >= DOWNLOAD_MAX_OPENS) {
    return page(
      "This link has been used up",
      `<p>This download has been opened too many times, so we&rsquo;ve closed
       it. That usually means the link was shared further than intended.</p>
       <p>Reply to the email we sent you and we&rsquo;ll send a fresh one — the
       book is still yours.</p>`,
      429,
    );
  }

  if (!row.masterFileKey) {
    logger.error("[download] token resolved but the book has no master", {
      requestId: row.id,
    });
    return page(
      "We can’t reach that file",
      `<p>Something is wrong on our side rather than yours. Reply to the email
       we sent you and a person will sort it out.</p>`,
      500,
    );
  }

  try {
    const range = req.headers.get("range");
    const object = await streamObject({
      bucket: MASTERS_BUCKET,
      key: row.masterFileKey,
      range,
    });

    /**
     * Counted after the bytes start moving, before they finish — a download
     * this size may be abandoned halfway, and "they opened the link" is the
     * fact worth recording. Never allowed to block the response.
     *
     * Only a FRESH START counts. A resumed download and the seven other
     * connections a download manager opens are one reader collecting one book,
     * and charging them eight opens against `DOWNLOAD_MAX_OPENS` would close
     * the link on the person it is for.
     */
    const freshStart = isFreshDownloadStart(range);
    if (freshStart) {
      void recordDownload(row.id).catch((err) =>
        logger.error("[download] could not record the download", {
          requestId: row.id,
          err: String(err),
        }),
      );
    }

    const headers = new Headers({
      "content-type": object.contentType ?? "application/pdf",
      // The filename the reader ends up with is the book, not `master.pdf`.
      "content-disposition": `attachment; filename="${row.bookSlug}.pdf"`,
      // A private link to a private file: no shared cache may keep a copy.
      "cache-control": "private, no-store, max-age=0",
      "accept-ranges": "bytes",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    });
    if (object.contentLength !== undefined) {
      headers.set("content-length", String(object.contentLength));
    }
    if (object.contentRange) headers.set("content-range", object.contentRange);

    return new NextResponse(object.body, { status: object.status, headers });
  } catch (err) {
    logger.error("[download] storage read failed", {
      requestId: row.id,
      err: String(err),
    });
    return page(
      "We couldn’t start your download",
      `<p>The file didn’t come back from storage. Please try the link again in
       a minute — and if it still fails, reply to the email and we’ll send it
       another way.</p>`,
      502,
    );
  }
}
