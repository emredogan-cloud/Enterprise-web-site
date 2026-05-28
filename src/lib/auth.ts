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
