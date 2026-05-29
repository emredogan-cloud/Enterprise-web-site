import { getAuthenticatedUser } from "@/lib/auth";
import { upsertLocalUser } from "@/lib/db/users";

/**
 * Account-context loader — used by every protected, account-aware page
 * (`/order/[id]`, `/account/library`, future `/account/orders`, etc.).
 *
 * Composes the four things a protected page needs:
 *   1. Cheap env pre-flight (Clerk + DB) so unprovisioned environments
 *      surface a structured `{ ok: false }` instead of a hard 500.
 *   2. Clerk identity (`getAuthenticatedUser`).
 *   3. Primary email extraction (Clerk's `emailAddresses` is multi-entry).
 *   4. JIT upsert into the local `users` table — the bridge that lets
 *      the rest of the request query `entitlements`, `orders`, etc. by
 *      our local UUID rather than the Clerk id (Roadmap §10 / ADR-8).
 *
 * The `ok: false` branch carries `title`/`body`/`missing` shaped for
 * `<UnprovisionedNotice />` so pages can spread the values onto the
 * fallback component without bespoke mapping.
 */

export interface AuthedLocalUserOk {
  ok: true;
  clerkUserId: string;
  email: string;
  name: string | null;
  localUserId: string;
}

export interface AuthedLocalUserBlocked {
  ok: false;
  title: string;
  body: string;
  missing: ReadonlyArray<string>;
}

export type AuthedLocalUserResult = AuthedLocalUserOk | AuthedLocalUserBlocked;

export async function loadAuthenticatedLocalUser(): Promise<AuthedLocalUserResult> {
  const missing: string[] = [];
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    !process.env.CLERK_SECRET_KEY
  ) {
    missing.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY");
  }
  if (!process.env.DATABASE_URL) {
    missing.push("DATABASE_URL");
  }
  if (missing.length > 0) {
    return {
      ok: false,
      title: "Configuration required",
      body: "This page needs Clerk authentication and a database before it can load. Set the variables below and reload.",
      missing,
    };
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        ok: false,
        title: "Sign in required",
        body: "Please sign in to view this page.",
        missing: [],
      };
    }
    const email = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    )?.emailAddress;
    if (!email) {
      return {
        ok: false,
        title: "Clerk user is missing a primary email",
        body: "Add a primary email address to your Clerk account to use this page.",
        missing: [],
      };
    }

    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ");
    const localUserId = await upsertLocalUser({
      clerkUserId: user.id,
      email,
      name: fullName || undefined,
    });

    return {
      ok: true,
      clerkUserId: user.id,
      email,
      name: fullName || null,
      localUserId,
    };
  } catch (err) {
    return {
      ok: false,
      title: "Account temporarily unavailable",
      body:
        err instanceof Error
          ? `Setup failed: ${err.message}`
          : "Setup failed for an unknown reason — see the server logs.",
      missing: [],
    };
  }
}
