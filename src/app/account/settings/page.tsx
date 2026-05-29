import type { Metadata } from "next";
import { eq } from "drizzle-orm";

import { DeleteAccountButton } from "@/components/delete-account-button";
import { ExportDataButton } from "@/components/export-data-button";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { loadAuthenticatedLocalUser } from "@/lib/account";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

// Per-user, per-request — never cache.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account settings",
  robots: { index: false, follow: false },
};

const DATE_FMT = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export default async function SettingsPage() {
  const userCtx = await loadAuthenticatedLocalUser();
  if (!userCtx.ok) {
    return (
      <UnprovisionedNotice
        title={userCtx.title}
        body={userCtx.body}
        missing={userCtx.missing}
      />
    );
  }

  // Pull the local-row's `createdAt` ("member since"). The other fields are
  // already on `userCtx`; this single targeted column read is the only DB
  // call this page needs.
  const [localUser] = await db
    .select({ createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userCtx.localUserId))
    .limit(1);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Account
        </p>
        <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-foreground">
          Settings
        </h1>
      </header>

      <section className="mt-12">
        <h2 className="font-serif text-xl font-medium text-foreground">
          Profile
        </h2>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="font-mono text-xs">{userCtx.email}</dd>
          {userCtx.name && (
            <>
              <dt className="text-muted-foreground">Name</dt>
              <dd>{userCtx.name}</dd>
            </>
          )}
          {localUser?.createdAt && (
            <>
              <dt className="text-muted-foreground">Member since</dt>
              <dd>{DATE_FMT.format(localUser.createdAt)}</dd>
            </>
          )}
        </dl>
      </section>

      <section className="mt-16 border-t border-border pt-12">
        <h2 className="font-serif text-xl font-medium text-foreground">
          Privacy
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your data is yours. Export it anytime, or remove it from this site
          entirely. Both actions are documented in our privacy policy.
        </p>

        <div className="mt-8 space-y-3">
          <h3 className="font-serif text-base font-medium text-foreground">
            Export your data
          </h3>
          <p className="text-sm text-muted-foreground">
            Download a JSON file with your profile, orders, entitlements,
            reading progress, and reviews. Internal storage keys are not
            included.
          </p>
          <ExportDataButton />
        </div>

        <div className="mt-10 space-y-3">
          <h3 className="font-serif text-base font-medium text-foreground">
            Delete your account
          </h3>
          <p className="text-sm text-muted-foreground">
            Removes your personal data (reading progress, reviews, name,
            email). Commercial records (orders, receipts, entitlements) are
            retained for tax compliance, attached to an anonymized account
            row.
          </p>
          <DeleteAccountButton />
        </div>
      </section>
    </main>
  );
}
