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
      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-bright/40 px-4 py-2 text-sm font-medium text-emerald-bright transition hover:bg-emerald-bright/10"
    >
      Open PDF
      <span aria-hidden>↓</span>
    </a>
  );
}
