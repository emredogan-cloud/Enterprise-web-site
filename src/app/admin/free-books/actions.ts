"use server";

import { revalidatePath } from "next/cache";

import { AdminAccessError, requireAdmin } from "@/lib/auth";
import {
  claimRequestForSending,
  getAmazonEditions,
  getRequestForFulfilment,
  markRequestStatus,
  type FreeBookRequestStatus,
} from "@/lib/db/queries/free-books";
import { getCompanionForBook } from "@/lib/companions";
import { sendFreeBookEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { generateSignedDownloadUrl, getObject, headObject, MASTERS_BUCKET } from "@/lib/storage";

/**
 * Fulfilment for the free-ebook promotion.
 *
 * WHY THE LINK IS MINTED HERE AND NOT STORED
 * The delivered file lives in the private masters bucket. Nothing in this
 * feature ever writes an R2 key, a bucket name or a public URL into a row, an
 * email body or a page — the operator presses a button, a signed URL is
 * created for this send only, and it expires. A request row is therefore a
 * record of an ask, never a standing right to a file (brief §25).
 *
 * WHY THE TTL IS LONGER THAN THE STORE'S DEFAULT
 * A purchase download is clicked seconds after checkout, so ten minutes is
 * generous. This link is in an email that may be opened tomorrow morning. A
 * ten-minute link would be dead on arrival for most recipients, and a dead
 * link in a gift is worse than no gift — so it is minted at the bucket's
 * ceiling and the operator can simply send again.
 *
 * WHY IT IS AN OPERATOR ACTION AT ALL
 * The modal promises delivery "within 24 hours" rather than instantly, and
 * that is the honest description of this design. Automatic sending would mean
 * a route that mails a private master to any address that can post a form —
 * which is a much larger thing to get right than a promotion needs.
 */

const DELIVERY_TTL_SECONDS = 900; // the bucket's hard ceiling — see storage/index.ts

export interface FulfilResult {
  ok: boolean;
  message: string;
}

function adminMessage(err: AdminAccessError): string {
  switch (err.kind) {
    case "unconfigured":
      return "Admin allowlist is empty (ADMIN_EMAILS).";
    case "not_signed_in":
      return "Sign in required.";
    case "no_primary_email":
      return "Your account is missing a primary email.";
    case "not_admin":
      return "You are not on the admin allowlist.";
  }
}

/**
 * How large a master may be before we stop trying to attach it.
 *
 * Resend's ceiling is 40 MB for the whole message, and base64 inflates a
 * binary by about a third — so 24 MB of PDF is already ~32 MB on the wire
 * before any HTML. 20 MB leaves honest headroom. Anything bigger falls back to
 * the signed link, which is a worse experience but a working one, and the
 * email says which of the two the reader got.
 */
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

/** `the-great-book-of-world-myths` → `the-great-book-of-world-myths.pdf`. */
function attachmentFilename(slug: string): string {
  return `${slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 120)}.pdf`;
}

export async function fulfilFreeBookRequest(id: string): Promise<FulfilResult> {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminAccessError) return { ok: false, message: adminMessage(err) };
    throw err;
  }

  /**
   * CLAIM THE ROW BEFORE DOING ANYTHING ELSE.
   *
   * One atomic UPDATE decides who is sending. A second click — another tab, a
   * retry, a refresh mid-send — loses the race and is told so rather than
   * mailing the reader a second copy. See `claimRequestForSending`.
   */
  const claim = await claimRequestForSending(id);
  if (!claim) {
    return {
      ok: false,
      message: "A send for this request is already in flight. Refresh in a moment.",
    };
  }

  /** Put the row back where it was found, with a reason, on any failure. */
  const fail = async (status: FreeBookRequestStatus, note: string, message: string) => {
    await markRequestStatus(id, status, note);
    revalidatePath("/admin/free-books");
    return { ok: false, message };
  };

  const row = await getRequestForFulfilment(id);
  if (!row) {
    revalidatePath("/admin/free-books");
    return { ok: false, message: "That request no longer exists." };
  }

  if (!row.masterFileKey) {
    // Recorded as `failed` with the reason, rather than left pending forever:
    // a queue where the un-fulfillable rows look exactly like the ones nobody
    // has got to yet is a queue that stops being read.
    return fail(
      "failed",
      "no master file on the book row — nothing to deliver",
      `${row.bookTitle} has no master file in R2, so there is nothing to send. Upload one and try again.`,
    );
  }

  /**
   * THE FILE, FETCHED SERVER-SIDE.
   *
   * The bytes go from the private bucket into the message and nowhere else —
   * no public URL, no key in a row, nothing written to disk. If the object is
   * too big to carry, or R2 will not give it up, the signed link takes over
   * below rather than the whole send failing.
   */
  let attachment: { filename: string; content: Buffer } | null = null;
  let attachmentNote = "";
  try {
    const head = await headObject({ bucket: MASTERS_BUCKET, key: row.masterFileKey });
    if (!head.exists) {
      return fail(
        "failed",
        `master missing in R2: ${head.error ?? "not found"}`,
        `The master file for ${row.bookTitle} is not in R2. Upload it and try again.`,
      );
    }
    if ((head.contentLength ?? 0) > MAX_ATTACHMENT_BYTES) {
      attachmentNote = `too large to attach (${Math.round((head.contentLength ?? 0) / 1048576)} MB) — sent as a link`;
    } else {
      const obj = await getObject({ bucket: MASTERS_BUCKET, key: row.masterFileKey });
      attachment = {
        filename: attachmentFilename(row.bookSlug),
        content: Buffer.from(obj.body),
      };
    }
  } catch (err) {
    logger.error("[free-books] master fetch failed", { id, err: String(err) });
    attachmentNote = "could not read the master — sent as a link";
  }

  /**
   * The link is minted only when the attachment could not be. Nothing is
   * stored; it exists for the length of this send.
   */
  let url: string | null = null;
  if (!attachment) {
    try {
      url = await generateSignedDownloadUrl({
        bucket: MASTERS_BUCKET,
        key: row.masterFileKey,
        ttlSeconds: DELIVERY_TTL_SECONDS,
      });
    } catch (err) {
      logger.error("[free-books] signed URL failed", { id, err: String(err) });
      return fail(
        "failed",
        `no attachment and signed URL failed: ${String(err).slice(0, 160)}`,
        "Could not attach the PDF or create a download link. See the logs.",
      );
    }
  }

  // Amazon editions come from the catalog, never from a template. A format
  // that is `coming_soon`, or has no recorded URL, is simply not offered.
  const editions = await getAmazonEditions(row.bookId);
  const companion = getCompanionForBook(row.bookSlug);

  const sent = await sendFreeBookEmail({
    to: row.email,
    bookTitle: row.bookTitle,
    bookSubtitle: row.bookSubtitle,
    bookPath: `/books/${row.bookSlug}`,
    companionPath: companion ? `/companion/${companion.slug}` : null,
    editions,
    attachment,
    downloadUrl: url,
    expiresInMinutes: Math.round(DELIVERY_TTL_SECONDS / 60),
  });

  if (!sent.ok) {
    return fail(
      "failed",
      `email failed: ${sent.error.slice(0, 200)}`,
      `Email failed: ${sent.error}`,
    );
  }

  // Only now. A row says `fulfilled` when a provider accepted the message and
  // at no earlier point — the whole reason `sending` exists is so the middle
  // of this function is never mistaken for either end of it.
  await markRequestStatus(
    id,
    "fulfilled",
    attachmentNote
      ? attachmentNote
      : `PDF attached (${attachment ? Math.round(attachment.content.byteLength / 1024) : 0} KB)` +
        (editions.length ? `; ${editions.length} Amazon edition(s) linked` : ""),
  );
  revalidatePath("/admin/free-books");

  const how = attachment ? "with the PDF attached" : "with a download link";
  return { ok: true, message: `Sent ${row.bookTitle} to ${row.email} ${how}.` };
}

/** Move a request between states by hand — the operator's escape hatch. */
export async function setFreeBookRequestStatus(
  id: string,
  status: FreeBookRequestStatus,
  notes?: string,
): Promise<FulfilResult> {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminAccessError) return { ok: false, message: adminMessage(err) };
    throw err;
  }
  await markRequestStatus(id, status, notes);
  revalidatePath("/admin/free-books");
  return { ok: true, message: `Marked ${status}.` };
}
