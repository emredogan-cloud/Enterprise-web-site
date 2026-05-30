import Link from "next/link";

import { DownloadButton } from "@/components/download-button";
import { LibraryStatusMenu } from "@/components/library/library-status-menu";
import type { LibraryView } from "@/components/library/library-filters";
import { type LibraryEntry } from "@/lib/db/queries/account";

/**
 * The owned-books grid (rendered when `getUserLibrary` returns ≥ 1 entry).
 *
 * Phase 2.B — now accepts the filtered + sorted entries from
 * `<LibraryShell>` plus a `view` mode that selects between three
 * layouts:
 *
 *   - `grid`   → 5-up tile grid (the original)
 *   - `shelf`  → horizontal-scrolling 2-up "shelf" rows (compact)
 *   - `list`   → table-style single-line per book (data-dense)
 *
 * Each layout exposes the same actions: download (when ready), pending
 * pulse, revoked notice — plus the new `<LibraryStatusMenu>` so the
 * "Reading" / "Finished" tabs are populatable by the user.
 *
 * Pure Server Component (the `<DownloadButton>` and
 * `<LibraryStatusMenu>` inside each entry are the only Client islands).
 */

const COVER_PALETTE: Array<{ gradient: string; accent: string }> = [
  {
    gradient: "linear-gradient(160deg, #1a3326 0%, #0a1f14 100%)",
    accent: "#33f0aa",
  },
  {
    gradient: "linear-gradient(160deg, #1a2c4f 0%, #050a1e 100%)",
    accent: "#7ab6ff",
  },
  {
    gradient: "linear-gradient(160deg, #c98341 0%, #4b1f0a 100%)",
    accent: "#ffce63",
  },
  {
    gradient: "linear-gradient(160deg, #b41c1c 0%, #4a0808 100%)",
    accent: "#f4d4a8",
  },
  {
    gradient: "linear-gradient(160deg, #2c1f1a 0%, #14110a 100%)",
    accent: "#d1a86a",
  },
  {
    gradient: "linear-gradient(160deg, #3a2845 0%, #14081c 100%)",
    accent: "#b18cff",
  },
];

export function LibraryBooksGrid({
  library,
  view = "grid",
}: {
  library: LibraryEntry[];
  view?: LibraryView;
}) {
  if (library.length === 0) return null;

  if (view === "list") {
    return <LibraryListView entries={library} />;
  }
  if (view === "shelf") {
    return <LibraryShelfView entries={library} />;
  }
  return <LibraryGridView entries={library} />;
}

// ─────────────────────────────────────────────────────────────────────────
// Grid view — the original 5-up tile grid.
// ─────────────────────────────────────────────────────────────────────────
function LibraryGridView({ entries }: { entries: LibraryEntry[] }) {
  return (
    <section className="mx-auto mt-8 max-w-[1320px] px-4 sm:px-6">
      <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {entries.map((entry, i) => (
          <li key={entry.bookId}>
            <LibraryTile entry={entry} themeIndex={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Shelf view — horizontal-scrolling row with two visible at a time on
// mobile. Same tile primitive, just a different container.
// ─────────────────────────────────────────────────────────────────────────
function LibraryShelfView({ entries }: { entries: LibraryEntry[] }) {
  return (
    <section className="mx-auto mt-8 max-w-[1320px] px-4 sm:px-6">
      <ul className="cart-shelf-track -mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-2">
        {entries.map((entry, i) => (
          <li
            key={entry.bookId}
            className="w-[42vw] flex-shrink-0 snap-start sm:w-[260px]"
          >
            <LibraryTile entry={entry} themeIndex={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// List view — data-dense single-line-per-book layout. Small cover, title,
// status menu, download.
// ─────────────────────────────────────────────────────────────────────────
function LibraryListView({ entries }: { entries: LibraryEntry[] }) {
  return (
    <section className="mx-auto mt-8 max-w-[1320px] px-4 sm:px-6">
      <ul className="space-y-3">
        {entries.map((entry, i) => (
          <li key={entry.bookId}>
            <LibraryListRow entry={entry} themeIndex={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────

function LibraryTile({
  entry,
  themeIndex,
}: {
  entry: LibraryEntry;
  themeIndex: number;
}) {
  const palette = COVER_PALETTE[themeIndex % COVER_PALETTE.length];
  return (
    <article className="home-glass home-card-hover group relative flex flex-col overflow-hidden rounded-[22px] p-3">
      {/* Status menu — top-right above the cover, doesn't compete with download */}
      <div className="absolute right-4 top-4 z-20">
        <LibraryStatusMenu
          bookId={entry.bookId}
          initialStatus={entry.readStatus}
        />
      </div>

      <Link
        href={`/books/${entry.book.slug}`}
        className="relative block aspect-[2/3] overflow-hidden rounded-[14px] border border-white/[0.08] shadow-[0_18px_36px_-14px_rgba(0,0,0,0.7)]"
      >
        <div className="absolute inset-0" style={{ background: palette.gradient }} />
        <div
          aria-hidden
          className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle, ${palette.accent}55 0%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-between p-3">
          <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/45">
            Owned
          </span>
          <p className="font-serif text-[15px] font-medium leading-tight text-white">
            {entry.book.title}
          </p>
        </div>
        <div
          aria-hidden
          className="absolute right-0 top-[2px] bottom-[2px] w-[2px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.14) 100%)",
          }}
        />
      </Link>

      <div className="mt-4 flex flex-1 flex-col gap-1 px-1 pb-1">
        <h3 className="line-clamp-2 font-serif text-[14px] font-medium leading-snug text-fg-hi transition-colors group-hover:text-emerald-bright">
          {entry.book.title}
        </h3>
        {entry.book.subtitle && (
          <p className="line-clamp-1 text-xs text-fg-soft">
            {entry.book.subtitle}
          </p>
        )}

        <div className="mt-3">
          {entry.status === "ready" ? (
            <DownloadButton bookId={entry.bookId} />
          ) : entry.status === "pending" ? (
            <p className="inline-flex items-center gap-2 text-xs text-fg-mid">
              <span
                aria-hidden
                className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#33f0aa] shadow-[0_0_6px_#33f0aa]"
              />
              Preparing your copy…
            </p>
          ) : (
            <p className="text-xs text-[#ff9b9b]">Access revoked.</p>
          )}
        </div>
      </div>
    </article>
  );
}

function LibraryListRow({
  entry,
  themeIndex,
}: {
  entry: LibraryEntry;
  themeIndex: number;
}) {
  const palette = COVER_PALETTE[themeIndex % COVER_PALETTE.length];
  return (
    <article className="home-glass relative flex items-center gap-4 overflow-hidden rounded-[16px] p-3 sm:gap-5 sm:p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/25 to-transparent"
      />

      {/* Mini cover — w-14 keeps it row-height friendly */}
      <Link
        href={`/books/${entry.book.slug}`}
        className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-md border border-white/[0.08]"
      >
        <div
          className="absolute inset-0"
          style={{ background: palette.gradient }}
        />
        <div
          aria-hidden
          className="absolute -right-3 -top-3 h-10 w-10 rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle, ${palette.accent}55 0%, transparent 70%)`,
          }}
        />
      </Link>

      {/* Title + subtitle */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/books/${entry.book.slug}`}
          className="block font-serif text-base font-medium leading-tight text-fg-hi transition-colors hover:text-emerald-bright"
        >
          {entry.book.title}
        </Link>
        {entry.book.subtitle && (
          <p className="mt-1 line-clamp-1 text-xs text-fg-soft">
            {entry.book.subtitle}
          </p>
        )}
      </div>

      {/* Status menu */}
      <div className="flex-shrink-0">
        <LibraryStatusMenu
          bookId={entry.bookId}
          initialStatus={entry.readStatus}
        />
      </div>

      {/* Download / pending / revoked */}
      <div className="flex-shrink-0">
        {entry.status === "ready" ? (
          <DownloadButton bookId={entry.bookId} size="sm" />
        ) : entry.status === "pending" ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-fg-mid">
            <span
              aria-hidden
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#33f0aa]"
            />
            Preparing…
          </span>
        ) : (
          <span className="text-xs text-[#ff9b9b]">Revoked</span>
        )}
      </div>
    </article>
  );
}
