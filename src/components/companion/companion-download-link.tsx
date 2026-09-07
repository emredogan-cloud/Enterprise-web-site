"use client";

import { trackEvent } from "@/lib/analytics";

/**
 * A companion download link that records `companion_download` (companion
 * slug + asset id, nothing else) when followed. The link itself is an
 * ordinary anchor: if scripting fails the download still works, which is the
 * whole point of a page that a printed QR code points at.
 */
export function CompanionDownloadLink({
  companionSlug,
  assetId,
  href,
}: {
  companionSlug: string;
  assetId: string;
  href: string;
}) {
  return (
    <a
      href={href}
      onClick={() =>
        trackEvent("companion_download", { companion: companionSlug, asset: assetId })
      }
      /* PHASE 9 — `py-2` on 14px text gives a 37px control. This page exists
         because a printed QR code points at it: the reader is holding a book in
         one hand and the phone in the other, and this link IS the page's job.
         44px below sm:, the original 37px from sm: up so the desktop
         composition is untouched. */
      className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-bright/40 px-4 py-2 text-sm font-medium text-emerald-bright transition hover:bg-emerald-bright/10 sm:min-h-0"
    >
      Open PDF
      <span aria-hidden>↓</span>
    </a>
  );
}
