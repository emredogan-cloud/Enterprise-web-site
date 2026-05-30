import type { Metadata } from "next";
import { eq } from "drizzle-orm";

import { CinematicHero } from "@/components/cinematic/cinematic-hero";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { ExportDataButton } from "@/components/export-data-button";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { loadAuthenticatedLocalUser } from "@/lib/account";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * /account/settings — profile + privacy actions.
 *
 * Phase 3.A cinematic redesign (Account Dashboard family — same shell
 * as /account/orders from Phase 2.C). Two stacked glass panels:
 *
 *   1. Profile — read-only display of email, name, member-since
 *   2. Privacy — Export Data + Delete Account (both buttons rewritten
 *      to cinematic chrome in this same phase)
 *
 * Classification: `ƒ Dynamic` (per-user session + per-request DB read).
 */

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

  // Pull the local-row's `createdAt` ("member since"). The other fields
  // are already on `userCtx`; this single targeted column read is the
  // only DB call this page needs.
  const [localUser] = await db
    .select({ createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userCtx.localUserId))
    .limit(1);

  return (
    <div className="cinematic-root">
      <CinematicHeader />

      <main className="relative z-10">
        <CinematicHero
          eyebrow="Your account"
          headlineHead=""
          headlineTail="Settings"
          size="md"
          align="center"
          subtitle={
            <p>
              Your profile, your data, your account — every control on one page.
            </p>
          }
        />

        <section className="mx-auto mt-16 max-w-2xl space-y-6 px-4 sm:px-6">
          {/* Profile panel */}
          <article className="home-glass relative overflow-hidden rounded-[24px] p-6 sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/35 to-transparent"
            />
            <header>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
                Profile
              </p>
              <h2 className="mt-2 font-serif text-[22px] font-medium leading-tight text-fg-hi sm:text-[24px]">
                Who you are on the site
              </h2>
            </header>

            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-8 gap-y-4 text-sm">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-soft">
                Email
              </dt>
              <dd className="font-mono text-xs text-fg-hi">
                {userCtx.email}
              </dd>

              {userCtx.name && (
                <>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-soft">
                    Name
                  </dt>
                  <dd className="text-fg-hi">{userCtx.name}</dd>
                </>
              )}

              {localUser?.createdAt && (
                <>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-soft">
                    Member since
                  </dt>
                  <dd className="text-fg-hi">
                    {DATE_FMT.format(localUser.createdAt)}
                  </dd>
                </>
              )}
            </dl>
          </article>

          {/* Privacy panel */}
          <article className="home-glass relative overflow-hidden rounded-[24px] p-6 sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/35 to-transparent"
            />
            <header>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
                Privacy
              </p>
              <h2 className="mt-2 font-serif text-[22px] font-medium leading-tight text-fg-hi sm:text-[24px]">
                Your data is yours
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-fg-mid">
                Export it anytime, or remove it from this site entirely.
                Both actions are documented in our{" "}
                <a
                  href="/privacy"
                  className="text-emerald-bright underline-offset-4 hover:underline"
                >
                  privacy policy
                </a>
                .
              </p>
            </header>

            <div className="mt-8 space-y-3">
              <h3 className="font-serif text-[16px] font-medium text-fg-hi">
                Export your data
              </h3>
              <p className="text-sm leading-relaxed text-fg-mid">
                Download a JSON file with your profile, orders, entitlements,
                reading progress, and reviews. Internal storage keys are not
                included.
              </p>
              <ExportDataButton />
            </div>

            <div className="mt-10 space-y-3 border-t border-white/[0.06] pt-8">
              <h3 className="font-serif text-[16px] font-medium text-fg-hi">
                Delete your account
              </h3>
              <p className="text-sm leading-relaxed text-fg-mid">
                Removes your personal data (reading progress, reviews, name,
                email). Commercial records (orders, receipts, entitlements)
                are retained for tax compliance, attached to an anonymized
                account row.
              </p>
              <DeleteAccountButton />
            </div>
          </article>
        </section>

        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}
