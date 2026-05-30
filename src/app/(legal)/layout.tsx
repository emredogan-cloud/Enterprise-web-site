import type { ReactNode } from "react";

import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";

/**
 * `(legal)` route group layout — shared cinematic shell for every legal /
 * informational page (`/terms`, `/privacy`, `/refund`, `/kvkk`, plus
 * `/about` if we re-home it here in Phase 1.B).
 *
 * The group's parens keep `/legal-placeholder` (and the real pages later)
 * at the URL root — `legal/` does NOT appear in the path.
 *
 * Phase 0.D scope: this layout + an empty test page validate the shell.
 * Real legal content lands in Phase 1.A.
 */
export default function LegalGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="cinematic-root">
      <CinematicHeader />

      <main className="relative z-10">
        {children}
      </main>

      <HomeFooter />
    </div>
  );
}
