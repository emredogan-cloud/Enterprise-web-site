import type { Metadata } from "next";

import { FulfillmentPoller } from "@/components/fulfillment-poller";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { LibraryBooksGrid } from "@/components/library/library-books-grid";
import { LibraryEmptyPanel } from "@/components/library/library-empty-panel";
import { LibraryFilters } from "@/components/library/library-filters";
import { LibraryHero } from "@/components/library/library-hero";
import { LibraryRecommendationShelf } from "@/components/library/library-recommendation-shelf";
import { LibraryStats } from "@/components/library/library-stats";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { loadAuthenticatedLocalUser } from "@/lib/account";
import { getUserLibrary } from "@/lib/db/queries/account";

// Account routes read the cookie session + per-user DB — never cache,
// never prerender. The cinematic redesign preserves the classification.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your library",
  robots: { index: false, follow: false },
};

/**
 * Cinematic library page — opens after purchase / from the nav.
 *
 * Two states (both inside `.cinematic-root`):
 *   - **Empty** (`library.length === 0`): hero + stats (all zero) +
 *     filter bar + empty focal panel + recommendation shelf.
 *   - **With books**: same hero + stats (with real counts) + filter
 *     bar + owned-books grid + recommendation shelf.
 *
 * Auth gate untouched — `loadAuthenticatedLocalUser()` returns either a
 * resolved user context or a structured `UnprovisionedNotice` payload.
 * The notice surface uses the warm theme by default; rather than
 * cinematic-ize the gate too, we accept the visual hop in the unauth
 * case (it's rare and the notice is actionable).
 */
export default async function LibraryPage() {
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

  const library = await getUserLibrary(userCtx.localUserId);
  const hasPending = library.some((entry) => entry.status === "pending");
  const isEmpty = library.length === 0;

  return (
    <div className="cinematic-root">
      <CinematicHeader active="library" />

      <main className="relative z-10">
        {/* Poll for pending fulfillments — unchanged behavior */}
        <FulfillmentPoller enabled={hasPending} />

        <LibraryHero />
        <LibraryStats booksOwned={library.length} />
        <LibraryFilters />

        {isEmpty ? (
          <LibraryEmptyPanel />
        ) : (
          <LibraryBooksGrid library={library} />
        )}

        <LibraryRecommendationShelf />

        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}
