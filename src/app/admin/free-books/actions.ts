"use server";

import { revalidatePath } from "next/cache";

import { AdminAccessError, requireAdmin } from "@/lib/auth";
import { markRequestStatus, type FreeBookRequestStatus } from "@/lib/db/queries/free-books";
import { deliverFreeBookRequest, type FulfilResult } from "@/lib/free-book-delivery";

/**
 * The admin panel's two buttons.
 *
 * Both are thin: check the Clerk gate, do the thing, revalidate the list. The
 * delivery itself lives in `@/lib/free-book-delivery` because the ops route
 * performs exactly the same send behind a bearer token, and the two must not
 * be allowed to drift.
 */

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
  const result = await deliverFreeBookRequest(id);
  revalidatePath("/admin/free-books");
  return result;
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
