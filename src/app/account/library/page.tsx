import type { Metadata } from "next";

import { CoverImage } from "@/components/cover-image";
import { DownloadButton } from "@/components/download-button";
import { EmptyState } from "@/components/empty-state";
import { FulfillmentPoller } from "@/components/fulfillment-poller";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { loadAuthenticatedLocalUser } from "@/lib/account";
import {
  type LibraryEntry,
  getUserLibrary,
} from "@/lib/db/queries/account";

// Account routes read the cookie session + per-user DB — never cache,
// never prerender. Layout-level `<ClerkProvider>` already mounts above us.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your library",
  robots: { index: false, follow: false },
};

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

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <FulfillmentPoller enabled={hasPending} />

      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Your library
        </p>
        <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          Your books
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {library.length === 0
            ? "Nothing here yet."
            : `${library.length} ${library.length === 1 ? "book" : "books"} · yours forever, watermarked, never locked`}
        </p>
      </header>

      {library.length === 0 ? (
        <EmptyState
          heading="Your library is empty."
          body="Once you buy a book, it appears here — yours to re-download anytime, no extra charge."
        />
      ) : (
        <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {library.map((entry) => (
            <li key={entry.bookId}>
              <LibraryItem entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function LibraryItem({ entry }: { entry: LibraryEntry }) {
  return (
    <article className="flex flex-col gap-4">
      <CoverImage title={entry.book.title} coverKey={entry.book.coverKey} />
      <div>
        <h2 className="font-serif text-lg font-medium leading-snug text-foreground">
          {entry.book.title}
        </h2>
        {entry.book.subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">
            {entry.book.subtitle}
          </p>
        )}
      </div>
      <div className="mt-auto">
        {entry.status === "ready" ? (
          <DownloadButton bookId={entry.bookId} />
        ) : entry.status === "pending" ? (
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span
              aria-hidden
              className="inline-block size-2 animate-pulse rounded-full bg-primary/60"
            />
            Preparing your copy…
          </p>
        ) : (
          <p className="text-sm text-destructive">Access revoked.</p>
        )}
      </div>
    </article>
  );
}
