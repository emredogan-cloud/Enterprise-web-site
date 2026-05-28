/**
 * User-row helpers — the bridge between Clerk identity and our Postgres
 * `users` table (Roadmap §10, ADR-8).
 *
 * Until the Clerk → Postgres sync webhook lands (see `syncClerkUserToDatabase`
 * in `src/lib/auth.ts`), every server-side code path that needs a *local*
 * user row must call `upsertLocalUser` first. This file is the single home
 * for that pattern, so the webhook can replace it with one targeted change.
 */

import { eq } from "drizzle-orm";

import { db } from "./index";
import { users } from "./schema";

export interface UpsertLocalUserArgs {
  clerkUserId: string;
  email: string;
  name?: string;
  locale?: string;
}

/**
 * Just-in-time upsert into the local `users` table.
 *
 * Strategy:
 *   - INSERT new row with `email` (UNIQUE per §10) and Clerk identity stored
 *     as `auth_provider = "clerk:<userId>"`.
 *   - ON CONFLICT (email) DO NOTHING — idempotent; if the row already exists
 *     we read its id back in a second short SELECT.
 *   - This keeps the function safe to call on every request that needs the
 *     local row, with predictable, audit-friendly SQL.
 *
 * Returns the local Postgres user UUID.
 */
export async function upsertLocalUser({
  clerkUserId,
  email,
  name,
  locale,
}: UpsertLocalUserArgs): Promise<string> {
  const authProvider = `clerk:${clerkUserId}`;

  const inserted = await db
    .insert(users)
    .values({
      email,
      name: name ?? null,
      authProvider,
      locale: locale ?? "en",
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  if (inserted.length > 0) {
    return inserted[0].id;
  }

  // Row already existed — read it back.
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!existing) {
    // Should be unreachable: either we just inserted, or the conflict means
    // a row with this email exists. If neither holds, the DB is wedged.
    throw new Error(
      `upsertLocalUser: could not locate user after ON CONFLICT (email=${email}).`,
    );
  }

  return existing.id;
}
