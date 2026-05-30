import type { Metadata } from "next";

import { LegalShell } from "@/components/cinematic/legal-shell";

/**
 * Placeholder page that validates the `(legal)` route-group shell in
 * Phase 0.D. Real legal pages (`/terms`, `/privacy`, `/refund`, `/kvkk`)
 * land in Phase 1.A and follow the exact same composition pattern below.
 *
 * Hidden from SEO via `robots.noindex` — this route exists only as a
 * smoke test for the layout + shell + cinematic-prose pipeline and
 * should not appear in search results.
 */
export const metadata: Metadata = {
  title: "Legal shell — placeholder",
  description: "Phase 0.D placeholder for the cinematic legal route group.",
  robots: { index: false, follow: false },
};

export default function LegalPlaceholderPage() {
  return (
    <LegalShell
      eyebrow="Placeholder"
      title="Phase 0.D shell smoke test"
      lastUpdated="2026-05-30"
      intro={
        <p>
          This page exists only to verify the `(legal)` route group renders
          end-to-end with cinematic chrome + drop cap + emerald accents.
          Phase 1.A replaces it with real Terms / Privacy / Refund / KVKK
          copy.
        </p>
      }
    >
      <p>
        Legal copy renders here through the shared `cinematic-prose` styles
        — the same typography family the blog detail page uses. The first
        paragraph gets the emerald drop cap; headings render in the serif
        family with calibrated tracking; lists get emerald bullets; the
        first blockquote becomes a glass quote card with a large emerald
        opening quote mark.
      </p>

      <h2>How the shell composes</h2>
      <p>
        The `(legal)` route group provides the dark `.cinematic-root`
        shell + `CinematicHeader` + `HomeFooter`. Inside, `LegalShell`
        renders the breadcrumb, eyebrow, diamond ornament, title, the
        last-updated chip, an optional intro, and the long-form body
        container.
      </p>

      <h3>Why this matters</h3>
      <p>
        Legal pages are a brand-trust surface. The previous footer link
        targets were dead anchors (`href=&quot;#&quot;`). Phase 1 fills
        them with real, brand-consistent content using this shell.
      </p>

      <blockquote>
        <p>
          Better legal pages aren&apos;t corporate-cold. They&apos;re calm,
          clear, and worth reading.
        </p>
      </blockquote>

      <hr />

      <h2>Next steps (Phase 1.A)</h2>
      <ul>
        <li>Write `/terms` content (dijital kitap lisansı, hesap kuralları)</li>
        <li>Write `/privacy` content (Clerk + Paddle + R2 + Neon veri akışı)</li>
        <li>Write `/refund` content (14 gün iade, Paddle prosedürü)</li>
        <li>Write `/kvkk` content (TR uyum + iletişim)</li>
        <li>Delete this placeholder page</li>
      </ul>
    </LegalShell>
  );
}
