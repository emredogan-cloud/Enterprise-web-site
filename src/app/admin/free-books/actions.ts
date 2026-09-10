"use server";

import { revalidatePath } from "next/cache";

import { AdminAccessError, requireAdmin } from "@/lib/auth";
import {
  getRequestForFulfilment,
  markRequestStatus,
  type FreeBookRequestStatus,
} from "@/lib/db/queries/free-books";
import { sendFreeBookEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { generateSignedDownloadUrl, MASTERS_BUCKET } from "@/lib/storage";

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

export async function fulfilFreeBookRequest(id: string): Promise<FulfilResult> {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminAccessError) return { ok: false, message: adminMessage(err) };
    throw err;
  }

  const row = await getRequestForFulfilment(id);
  if (!row) return { ok: false, message: "That request no longer exists." };

  if (!row.masterFileKey) {
    // Recorded as `failed` with the reason, rather than left pending forever:
    // a queue where the un-fulfillable rows look exactly like the ones nobody
    // has got to yet is a queue that stops being read.
    await markRequestStatus(
      id,
      "failed",
      "no master file on the book row — nothing to deliver",
    );
    revalidatePath("/admin/free-books");
    return {
      ok: false,
      message: `${row.bookTitle} has no master file in R2, so there is nothing to send. Upload one and try again.`,
    };
  }

  let url: string;
  try {
    url = await generateSignedDownloadUrl({
      bucket: MASTERS_BUCKET,
      key: row.masterFileKey,
      ttlSeconds: DELIVERY_TTL_SECONDS,
    });
  } catch (err) {
    logger.error("[free-books] signed URL failed", { id, err: String(err) });
    await markRequestStatus(id, "failed", `signed URL failed: ${String(err).slice(0, 200)}`);
    revalidatePath("/admin/free-books");
    return { ok: false, message: "Could not create a download link. See the logs." };
  }

  const sent = await sendFreeBookEmail({
    to: row.email,
    bookTitle: row.bookTitle,
    downloadUrl: url,
    expiresInMinutes: Math.round(DELIVERY_TTL_SECONDS / 60),
  });

  if (!sent.ok) {
    await markRequestStatus(id, "failed", `email failed: ${sent.error.slice(0, 200)}`);
    revalidatePath("/admin/free-books");
    return { ok: false, message: `Email failed: ${sent.error}` };
  }

  await markRequestStatus(id, "fulfilled");
  revalidatePath("/admin/free-books");
  return { ok: true, message: `Sent ${row.bookTitle} to ${row.email}.` };
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
