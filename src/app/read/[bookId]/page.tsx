import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { ReaderShell } from "@/components/reader-shell";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { loadAuthenticatedLocalUser } from "@/lib/account";
import { db } from "@/lib/db";
import { resolveEntitlementAccess } from "@/lib/db/queries/ownership";
import {
  ARTIFACTS_BUCKET,
  generateSignedDownloadUrl,
} from "@/lib/storage";

// Per-user, per-request. The signed URL is short-TTL by design (§11), so
// caching this response would defeat its security guarantee.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reader",
  robots: { index: false, follow: false },
};

type Params = Promise<{ bookId: string }>;

export default async function ReadBookPage({ params }: { params: Params }) {
  const { bookId } = await params;

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

  // AuthZ + state — delegated to the shared `resolveEntitlementAccess`
  // chokepoint (Phase D), the SAME one `downloadBook` uses, so the reader and
  // the downloader can never drift on the ownership/readiness rule. Keyed on
  // the UNIQUE (user_id, book_id) index → the DB enforces ownership and a
  // missing entitlement 404s (indistinguishable from a non-existent book — no
  // enumeration).
  const access = await resolveEntitlementAccess(userCtx.localUserId, bookId);

  if (access.state === "not-owned") notFound();

  // Only `ready` + a stored artifact key qualify; pending AND revoked both
  // fall here, so a revoked entitlement closes the reader gate immediately.
  if (access.state === "not-ready") {
    return (
      <ReaderFallback
        eyebrow="Almost there"
        title="Your copy is still being prepared"
        body={
          <>
            The watermark worker is still processing this book. Check{" "}
            <Link
              href="/account/library"
              className="text-emerald-bright underline-offset-4 hover:underline"
            >
              your library
            </Link>{" "}
            in a moment — the page auto-refreshes when each book is ready.
          </>
        }
      />
    );
  }

  // Resume-where-you-left-off (Roadmap §10 — `reading_progress`).
  // A missing row means the user has never opened this book; default to 1.
  const progress = await db.query.readingProgress.findFirst({
    where: (rp, { and, eq }) =>
      and(eq(rp.userId, userCtx.localUserId), eq(rp.bookId, bookId)),
    columns: { page: true },
  });
  const initialPage = progress?.page && progress.page >= 1 ? progress.page : 1;
  const entitlement = access.entitlement;

  // Short-TTL signed URL — pdf.js will use HTTP range requests against this
  // single URL; R2 signs the URL itself, not specific byte ranges, so range
  // requests work cleanly.
  let signedUrl: string;
  try {
    signedUrl = await generateSignedDownloadUrl({
      bucket: ARTIFACTS_BUCKET,
      key: access.artifactKey,
    });
  } catch (err) {
    console.error("[reader] signed URL generation failed:", err);
    return (
      <ReaderFallback
        eyebrow="Reader unavailable"
        title="Could not start the reader"
        body={
          <>
            Please try again in a moment, or download the file from{" "}
            <Link
              href="/account/library"
              className="text-emerald-bright underline-offset-4 hover:underline"
            >
              your library
            </Link>
            .
          </>
        }
      />
    );
  }

  return (
    <ReaderShell
      bookId={bookId}
      bookTitle={entitlement.book.title}
      signedUrl={signedUrl}
      initialPage={initialPage}
    />
  );
}

/**
 * Phase 2.E — cinematic fallback for the two non-happy-path /read states:
 *   1. Entitlement not yet `ready` (watermarking still in flight)
 *   2. Signed-URL mint failed at request time
 *
 * The happy-path `<ReaderShell>` is intentionally a focused fixed-overlay
 * that hides the rest of the chrome — that posture is unchanged. These
 * fallbacks, however, used to be warm-themed text dumps and produced a
 * tema-kırılma right inside an auth-gated flow. Now they share the
 * cinematic shell + a glass empty-card pattern.
 */
function ReaderFallback({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: ReactNode;
}) {
  return (
    <div className="cinematic-root">
      <CinematicHeader />

      <main className="relative z-10 mx-auto max-w-2xl px-4 py-24 sm:px-6">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
            {eyebrow}
          </p>

          {/* Diamond ornament */}
          <div className="relative mt-4 flex h-6 w-6 items-center justify-center">
            <div
              aria-hidden
              className="absolute h-6 w-6 rounded-full opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(51,240,170,0.7) 0%, transparent 70%)",
              }}
            />
            <span
              aria-hidden
              className="catalog-diamond block h-2 w-2 rounded-[1px] bg-[#33f0aa]"
              style={{ transform: "rotate(45deg)" }}
            />
          </div>

          <h1 className="mt-6 font-serif text-[32px] font-medium leading-tight text-fg-hi sm:text-[40px]">
            {title}
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-fg-mid sm:text-base">
            {body}
          </p>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
