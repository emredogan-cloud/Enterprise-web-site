import type { Metadata } from "next";
import { eq } from "drizzle-orm";

import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { DangerZoneCard } from "@/components/settings/danger-zone-card";
import { ExportDataCard } from "@/components/settings/export-data-card";
import { PrivacyOverviewCard } from "@/components/settings/privacy-overview-card";
import { ProfileIdentityCard } from "@/components/settings/profile-identity-card";
import { SettingsBackground } from "@/components/settings/settings-background";
import { SettingsHero } from "@/components/settings/settings-hero";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { TrustStrip } from "@/components/settings/trust-strip";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { loadAuthenticatedLocalUser } from "@/lib/account";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * /account/settings — Cinematic Account Control Center.
 *
 * Layout:
 *
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │                  CinematicHeader (sticky)                        │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │  ┌──── Sidebar ────┐ ┌──── Main column ──────────────────────┐  │
 *   │  │  ACCOUNT        │ │  SettingsHero (text + desk scene)     │  │
 *   │  │  · Library      │ │                                       │  │
 *   │  │  · Orders       │ │  Profile & Identity                   │  │
 *   │  │  · Settings ●   │ │  Privacy overview (3 columns)         │  │
 *   │  │  · Profile      │ │  Export your data (illustration)      │  │
 *   │  │  · Security ◌   │ │  Danger zone (delete, red burst)      │  │
 *   │  │  · Notif.   ◌   │ │  Trust strip (4 indicators)           │  │
 *   │  │  · Billing  ◌   │ └───────────────────────────────────────┘  │
 *   │  │                 │                                            │
 *   │  │  Member card    │                                            │
 *   │  └─────────────────┘                                            │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │                  HomeFooter                                      │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Behind everything: `<SettingsBackground>` atmospheric `fixed` overlay
 * (radial blooms + drifting dust), z-index -10 so it sits behind every
 * card without affecting layout.
 *
 * Functional preservation (audit + Phase 3 protocol):
 *   - `loadAuthenticatedLocalUser` auth gate unchanged
 *   - `users.createdAt` query unchanged
 *   - `<ExportDataButton>` server-action wiring preserved (wrapped in
 *     `<ExportDataCard>` chrome only)
 *   - `<DeleteAccountButton>` two-stage destruction UX preserved
 *     (wrapped in `<DangerZoneCard>` chrome only)
 *   - `<UnprovisionedNotice>` fallback preserved
 *
 * Classification stays `ƒ Dynamic` — per-user session + per-request DB
 * read; never cache.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account settings",
  robots: { index: false, follow: false },
};

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

  const [localUser] = await db
    .select({ createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userCtx.localUserId))
    .limit(1);

  const memberSince = localUser?.createdAt ?? null;

  return (
    <div className="cinematic-root">
      <CinematicHeader />

      {/* Atmospheric backdrop — fixed, behind every card */}
      <SettingsBackground />

      <main className="relative z-10 mx-auto max-w-[1320px] px-4 pt-8 sm:px-6 sm:pt-12">
        {/* Two-column body: sidebar + main */}
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,_1fr)] lg:gap-12">
          {/* LEFT — sidebar (collapses to top stack on mobile) */}
          <SettingsSidebar memberSince={memberSince} />

          {/* RIGHT — settings content */}
          <div className="min-w-0 space-y-8 sm:space-y-10">
            <SettingsHero />

            <ProfileIdentityCard
              email={userCtx.email}
              name={userCtx.name ?? null}
              memberSince={memberSince}
            />

            <PrivacyOverviewCard />

            <ExportDataCard />

            <DangerZoneCard />

            <TrustStrip />
          </div>
        </div>

        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}
