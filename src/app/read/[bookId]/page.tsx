import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReaderShell } from "@/components/reader-shell";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { loadAuthenticatedLocalUser } from "@/lib/account";
import { db } from "@/lib/db";
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

  // AuthZ — entitlement lookup keyed on the UNIQUE (user_id, book_id)
  // composite index. The DB enforces ownership; a missing row 404s.
  // (Same discipline as `downloadBook` in SUB-PR 1.7, intentionally
  // duplicated for clarity — the reader and the downloader are two
  // separate read paths to the same private artifact.)
  const entitlement = await db.query.entitlements.findFirst({
    where: (e, { and, eq }) =>
      and(eq(e.userId, userCtx.localUserId), eq(e.bookId, bookId)),
    columns: { id: true, status: true, watermarkedKey: true },
    with: {
      book: { columns: { id: true, slug: true, title: true } },
    },
  });

  if (!entitlement) notFound();

  // State guard — only `ready` + a stored artifact key qualify.
  if (entitlement.status !== "ready" || !entitlement.watermarkedKey) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Almost there
        </p>
        <h1 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground">
          Your copy is still being prepared
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-muted-foreground">
          The watermark worker is still processing this book. Check{" "}
          <Link
            href="/account/library"
            className="text-primary underline-offset-4 hover:underline"
          >
            your library
          </Link>{" "}
          in a moment — the page auto-refreshes when each book is ready.
        </p>
      </main>
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

  // Short-TTL signed URL — pdf.js will use HTTP range requests against this
  // single URL; R2 signs the URL itself, not specific byte ranges, so range
  // requests work cleanly.
  let signedUrl: string;
  try {
    signedUrl = await generateSignedDownloadUrl({
      bucket: ARTIFACTS_BUCKET,
      key: entitlement.watermarkedKey,
    });
  } catch (err) {
    console.error("[reader] signed URL generation failed:", err);
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl font-medium leading-tight text-foreground">
          Could not start the reader
        </h1>
        <p className="mt-4 text-pretty text-muted-foreground">
          Please try again in a moment, or download the file from{" "}
          <Link
            href="/account/library"
            className="text-primary underline-offset-4 hover:underline"
          >
            your library
          </Link>
          .
        </p>
      </main>
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
