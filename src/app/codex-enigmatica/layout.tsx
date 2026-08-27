import type { ReactNode } from "react";

import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";

/**
 * `/codex-enigmatica/*` — shared shell for the book's own surfaces.
 *
 * Deliberately IDENTICAL in construction to `app/(legal)/layout.tsx`: the
 * dark `.cinematic-root` canvas, the cinematic header, the site footer.
 * A reader arriving here from a printed page is arriving at Vâliçe Press,
 * not at a detached microsite, and the chrome has to say so before the
 * copy does.
 *
 * This is a real path segment rather than a `(group)` because the URL is
 * PRINTED IN A BOOK and can never change: `/codex-enigmatica/verify` has
 * to be legible, typeable, and obviously about this title.
 */
export default function CodexEnigmaticaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="cinematic-root">
      <CinematicHeader />
      <main className="relative z-10">{children}</main>
      <HomeFooter />
    </div>
  );
}
