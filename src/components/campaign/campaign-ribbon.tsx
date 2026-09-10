"use client";

import { Gift, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { splitDuration } from "@/lib/campaign";

import { useCampaign } from "./use-campaign";

/**
 * The small campaign indicator carried by every page that is not `/`,
 * `/books` or `/ebooks` (brief §21).
 *
 * Constraints it is built to respect:
 *   - **It must not obscure navigation or content.** It sits bottom-left,
 *     clear of the header, clear of the footer's action row, and above
 *     nothing that is interactive. On small screens it shrinks to a pill.
 *   - **It must be dismissible.** A persistent floating advert that cannot be
 *     closed is the thing everyone hates about promotional bars. Dismissal is
 *     remembered for the rest of the campaign in `localStorage`, keyed to the
 *     campaign's end timestamp so the next promotion starts fresh without
 *     anyone having to remember to clear a key.
 *   - **It must link to the offer**, which is `/ebooks` — the shelf a visitor
 *     can actually take a book from.
 *
 * It renders nothing outside the campaign window, and it renders nothing until
 * the server clock has been consulted: a floating advert that appears and then
 * disappears on a stale page looks broken, so it simply waits the extra beat.
 *
 * WHERE IT DOES NOT GO
 * `/`, `/books` and `/ebooks` already carry the full countdown banner — a
 * floating pill repeating it in the corner is the same message twice. It also
 * stays off `/admin` (the operator is not the audience) and off checkout and
 * the reader, where a floating advert over someone's payment or their book is
 * simply rude. It is mounted once in the root layout and decides for itself,
 * because the alternative is remembering to add it to every new page.
 */
const SILENT_PREFIXES = ["/books", "/ebooks", "/admin", "/cart", "/order", "/read", "/account"];

function isSilent(pathname: string): boolean {
  if (pathname === "/") return true;
  // `/books` is silent but `/books/[slug]` is a product page and SHOULD carry
  // the reminder, so the shelf is matched exactly while the rest match by
  // prefix. Getting this backwards hides the offer on every book page, which
  // is the one place a reader is closest to wanting it.
  if (pathname === "/books" || pathname === "/ebooks") return true;
  return SILENT_PREFIXES.filter((p) => p !== "/books" && p !== "/ebooks").some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

const DISMISS_KEY = "valice.campaign.ribbon.dismissed";

/**
 * The dismissal, as an external store.
 *
 * `localStorage` cannot be read during render (it does not exist on the
 * server) and reading it into state inside an effect is the cascading-render
 * pattern React 19 warns about. `useSyncExternalStore` is the API for
 * precisely this shape: a value that lives outside React, has a server
 * snapshot, and changes when we tell it to.
 *
 * The stored value is the campaign's end timestamp rather than a boolean, so
 * a dismissal expires with the promotion it dismissed and the next campaign
 * starts clean without anyone remembering to clear a key.
 */
let cached: string | null = null;
let cacheLoaded = false;
const listeners = new Set<() => void>();

function readDismissed(): string | null {
  if (!cacheLoaded) {
    try {
      cached = window.localStorage.getItem(DISMISS_KEY);
    } catch {
      // Private mode or blocked storage. Showing the ribbon is the safe
      // default; never throw at a visitor over a preference.
      cached = null;
    }
    cacheLoaded = true;
  }
  return cached;
}

function subscribeDismissed(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function dismissUntil(value: string): void {
  cached = value;
  cacheLoaded = true;
  try {
    window.localStorage.setItem(DISMISS_KEY, value);
  } catch {
    // Not being able to remember it is survivable — the ribbon returns on the
    // next page rather than the visitor losing anything.
  }
  for (const l of listeners) l();
}

export function CampaignRibbon() {
  const pathname = usePathname() ?? "/";
  const { ready, open, msRemaining, endsAtMs } = useCampaign();
  const dismissedFor = useSyncExternalStore(
    subscribeDismissed,
    readDismissed,
    () => String(endsAtMs), // server snapshot: hidden, so nothing flashes in
  );

  if (isSilent(pathname)) return null;
  if (!ready || !open || dismissedFor === String(endsAtMs)) return null;

  const t = splitDuration(msRemaining);
  const compact =
    t.days > 0 ? `${t.days}d ${t.hours}h` : t.hours > 0 ? `${t.hours}h ${t.minutes}m` : `${t.minutes}m ${t.seconds}s`;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 print:hidden">
      <div
        className="pointer-events-auto flex items-center gap-2 rounded-full border py-2 pl-3 pr-2 backdrop-blur"
        style={{
          borderColor: "rgba(214,178,102,0.35)",
          background: "rgba(12, 24, 19, 0.88)",
          boxShadow: "0 12px 30px -14px rgba(0,0,0,0.8)",
        }}
      >
        <Link
          href="/ebooks"
          className="flex items-center gap-2 text-[12px] font-medium text-fg-hi hover:text-[#f0dfae] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6b266]/60 rounded-full"
        >
          <Gift aria-hidden className="h-4 w-4" style={{ color: "#d6b266" }} />
          <span className="hidden sm:inline">Every ebook free</span>
          <span className="sm:hidden">Free ebooks</span>
          <span className="tabular-nums text-fg-mid">· {compact}</span>
        </Link>
        <button
          type="button"
          onClick={() => dismissUntil(String(endsAtMs))}
          aria-label="Dismiss the free-ebook offer notice"
          className="rounded-full p-1 text-fg-soft transition-colors hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6b266]/60"
        >
          <X aria-hidden className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
