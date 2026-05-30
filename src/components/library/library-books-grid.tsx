import Link from "next/link";

import { DownloadButton } from "@/components/download-button";
import { type LibraryEntry } from "@/lib/db/queries/account";

/**
 * The owned-books grid (rendered when `getUserLibrary` returns ≥ 1 entry).
 *
 * Each tile is a cinematic glass card with:
 *   - CSS-rendered cover (gradient from a small palette so adjacent
 *     cards don't look identical — same approach as catalog when no
 *     `coverKey` is uploaded yet)
 *   - Title + subtitle
 *   - State-specific footer: `<DownloadButton>` when status === "ready",
 *     animated "Preparing your copy…" pulse when "pending",
 *     muted "Access revoked." when "revoked"
 *
 * Pure Server Component. `<DownloadButton>` is the only Client island
 * inside each tile (it triggers a signed-URL fetch).
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

export function LibraryBooksGrid({ library }: { library: LibraryEntry[] }) {
  return (
    <section className="mx-auto mt-8 max-w-[1320px] px-4 sm:px-6">
      <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {library.map((entry, i) => (
          <li key={entry.bookId}>
            <LibraryTile entry={entry} themeIndex={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}

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
      {/* Cover (links to book detail) */}
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

      {/* Meta + state */}
      <div className="mt-4 flex flex-1 flex-col gap-1 px-1 pb-1">
        <h3 className="line-clamp-2 font-serif text-[14px] font-medium leading-snug text-[#e6e6e0] transition-colors group-hover:text-[#33f0aa]">
          {entry.book.title}
        </h3>
        {entry.book.subtitle && (
          <p className="line-clamp-1 text-xs text-[#88918a]">{entry.book.subtitle}</p>
        )}

        <div className="mt-3">
          {entry.status === "ready" ? (
            <DownloadButton bookId={entry.bookId} />
          ) : entry.status === "pending" ? (
            <p className="inline-flex items-center gap-2 text-xs text-[#a7a7a0]">
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
