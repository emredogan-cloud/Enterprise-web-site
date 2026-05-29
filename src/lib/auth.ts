/**
 * Server-side auth helpers (Roadmap ADR-8, §11).
 *
 * Identity vs. data split — important architectural boundary:
 *   - Clerk owns IDENTITY (login, email verification, magic links, sessions,
 *     social providers). It is the source of truth for "who is the user".
 *   - Our Postgres `users` table owns COMMERCIAL RELATIONSHIPS (orders,
 *     entitlements, reading progress, reviews — see §10 ERD).
 *
 * The two stores reconcile via a Clerk webhook handler (NOT YET BUILT — see
 * `syncClerkUserToDatabase` at the bottom of this file). The webhook will
 * land in a later SUB-PR and consume `user.created` / `user.updated` /
 * `user.deleted` events to upsert / soft-delete the local row keyed on
 * `auth_provider = 'clerk'` plus the Clerk user ID. Until that webhook
 * exists, code that needs the local row must do a just-in-time upsert.
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";

import { upsertLocalUser } from "@/lib/db/users";

/**
 * Returns the current authenticated Clerk user ID, or `null` if the request
 * is unauthenticated. Cheap — reads the session JWT, no Clerk API call.
 */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Returns the current Clerk user ID or throws `Unauthenticated` if the
 * request is not signed in. Use inside Server Actions / Route Handlers
 * after the middleware protection layer has already gated the route — the
 * throw is a defense-in-depth backstop, not the primary gate.
 */
export async function requireUserId(): Promise<string> {
  const userId = await getUserId();
  if (!userId) {
    throw new Error("Unauthenticated");
  }
  return userId;
}

/**
 * Returns the full Clerk user object (one network call to Clerk's API).
 * Prefer `getUserId()` when only the ID is needed.
 */
export async function getAuthenticatedUser() {
  return currentUser();
}

/**
 * Sync a Clerk user into the local Postgres `users` table.
 *
 * **NOT YET IMPLEMENTED.** This is a documented placeholder for the
 * `/api/webhooks/clerk` route handler that lands in a later SUB-PR (it
 * needs the auth provider's webhook signing secret, the Drizzle `users`
 * insert path, and the soft-delete policy on `user.deleted`). The function
 * is exported so it is visible in IDE autocomplete, and it THROWS on call
 * so accidental usage today fails loudly rather than silently no-op'ing.
 */
export async function syncClerkUserToDatabase(
  clerkUserId: string,
): Promise<void> {
  throw new Error(
    `syncClerkUserToDatabase(${clerkUserId}) is not yet implemented. The Clerk → Postgres sync webhook lands in a later SUB-PR.`,
  );
}

// ============================================================================
// Admin gate (SUB-PR 4.1)
// ============================================================================

/**
 * Strict AuthZ failure for admin surfaces.
 *
 * Carries a discriminating `kind` so callers (page-level loaders) can render
 * targeted messaging — "sign in", "not on the allowlist", "the env isn't
 * configured" — without inspecting error message strings.
 */
export type AdminAccessFailureKind =
  | "unconfigured" // ADMIN_EMAILS is empty / unset
  | "not_signed_in" // no Clerk session
  | "no_primary_email" // signed in but Clerk has no primary email
  | "not_admin"; // signed in, email exists, but not on allowlist

export class AdminAccessError extends Error {
  readonly kind: AdminAccessFailureKind;

  constructor(kind: AdminAccessFailureKind, message?: string) {
    super(message ?? `Admin access denied: ${kind}`);
    this.name = "AdminAccessError";
    this.kind = kind;
  }
}

/**
 * Parse `ADMIN_EMAILS` once per call.
 *
 * Case-insensitive comparison (we normalize both sides to lowercase). Empty
 * or unset env = empty allowlist = nobody is admin (safe default — never
 * silently grants admin when the env happens to be missing).
 */
function getAdminEmailAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

/**
 * Pure predicate — true iff `email` is on the allowlist.
 *
 * Exposed so non-admin surfaces (e.g., a future "you're signed in as an
 * admin" header chip) can read the same state without going through the
 * `requireAdmin` throw-on-fail path.
 */
export function isAdminEmail(email: string): boolean {
  const allowlist = getAdminEmailAllowlist();
  return allowlist.includes(email.trim().toLowerCase());
}

export interface AdminIdentity {
  /** Clerk's primary email for the signed-in user (lowercased). */
  email: string;
  /** Local Postgres `users.id` for the signed-in user. */
  localUserId: string;
}

/**
 * Strict admin gate. Returns `AdminIdentity` on success; throws
 * `AdminAccessError` on any failure (no signed-in user / no primary email /
 * email not on the allowlist / `ADMIN_EMAILS` unset).
 *
 * Wrapped with React's `cache()` so the per-request cost is fixed —
 * one Clerk API call + one allowlist check + one `users` upsert no
 * matter how many admin queries call this in a single render.
 *
 * Usage:
 *   - Call from every admin-only query as the first line of work.
 *   - Page-level `loadAdminContext` wraps the call in try/catch and maps
 *     `err.kind` to a calm `UnprovisionedNotice` instead of a 500.
 */
export const requireAdmin = cache(async (): Promise<AdminIdentity> => {
  const allowlist = getAdminEmailAllowlist();
  if (allowlist.length === 0) {
    throw new AdminAccessError(
      "unconfigured",
      "ADMIN_EMAILS is empty or unset — no admins are configured.",
    );
  }

  const user = await currentUser();
  if (!user) {
    throw new AdminAccessError(
      "not_signed_in",
      "No signed-in user; admin requires a Clerk session.",
    );
  }

  const email = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  )?.emailAddress;
  if (!email) {
    throw new AdminAccessError(
      "no_primary_email",
      "Signed-in Clerk user has no primary email address.",
    );
  }

  if (!isAdminEmail(email)) {
    throw new AdminAccessError(
      "not_admin",
      `User ${email} is not on ADMIN_EMAILS.`,
    );
  }

  // JIT-upsert the local row so admin queries that need `users.id` always
  // have it. Cheap when the row already exists (onConflictDoNothing).
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const localUserId = await upsertLocalUser({
    clerkUserId: user.id,
    email,
    name: fullName || undefined,
  });

  return { email: email.toLowerCase(), localUserId };
});
