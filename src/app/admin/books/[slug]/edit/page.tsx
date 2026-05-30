import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminDeleteBookButton } from "@/components/admin-delete-book-button";
import { AdminEditBookForm } from "@/components/admin-edit-book-form";
import { BookStatusBadge } from "@/components/book-status-badge";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { AdminAccessError, requireAdmin } from "@/lib/auth";
import { getBookForEdit } from "@/lib/db/queries/admin";

/**
 * /admin/books/[slug]/edit — internal book editor.
 *
 * Phase 3.B cinematic redesign (Internal Dashboard family). Same shell
 * as /admin; mid-density single-record edit surface with a clearly-
 * separated "Danger zone" panel for irreversible actions.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit book",
  robots: { index: false, follow: false },
};

interface AdminGate {
  ok: boolean;
  notice?: { title: string; body: string; missing: string[] };
}

async function checkAdminGate(): Promise<AdminGate> {
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    !process.env.CLERK_SECRET_KEY ||
    !process.env.DATABASE_URL
  ) {
    return {
      ok: false,
      notice: {
        title: "Admin panel — configuration required",
        body: "The admin surface needs Clerk authentication and a database before it can load.",
        missing: [
          ...(!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
            ? ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"]
            : []),
          ...(!process.env.CLERK_SECRET_KEY ? ["CLERK_SECRET_KEY"] : []),
          ...(!process.env.DATABASE_URL ? ["DATABASE_URL"] : []),
        ],
      },
    };
  }

  try {
    await requireAdmin();
    return { ok: true };
  } catch (err) {
    if (err instanceof AdminAccessError) {
      const titleByKind = {
        unconfigured: "Admin allowlist is empty",
        not_signed_in: "Sign in required",
        no_primary_email: "Your Clerk account has no primary email",
        not_admin: "Not authorized",
      } as const;
      return {
        ok: false,
        notice: {
          title: titleByKind[err.kind],
          body:
            err.kind === "not_admin"
              ? "Your account is not on the admin allowlist."
              : err.kind === "unconfigured"
                ? "Set ADMIN_EMAILS to a comma-separated list of admin emails, then redeploy."
                : "Sign in with an admin account to use this page.",
          missing: err.kind === "unconfigured" ? ["ADMIN_EMAILS"] : [],
        },
      };
    }
    throw err;
  }
}

type EditPageParams = Promise<{ slug: string }>;

export default async function AdminEditBookPage({
  params,
}: {
  params: EditPageParams;
}) {
  const gate = await checkAdminGate();
  if (!gate.ok && gate.notice) {
    return (
      <UnprovisionedNotice
        title={gate.notice.title}
        body={gate.notice.body}
        missing={gate.notice.missing}
      />
    );
  }

  const { slug } = await params;
  const book = await getBookForEdit(slug);
  if (!book) notFound();

  return (
    <div className="cinematic-root">
      <CinematicHeader />

      <main className="relative z-10 mx-auto max-w-3xl space-y-12 px-4 py-16 sm:px-6">
        <header>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="text-[11px] uppercase tracking-[0.2em] text-fg-soft"
          >
            <Link
              href="/admin"
              className="transition-colors hover:text-emerald-bright"
            >
              Admin
            </Link>
            <span aria-hidden className="mx-2 text-emerald-bright">
              /
            </span>
            <span className="text-fg-hi">Edit book</span>
          </nav>

          <h1 className="mt-5 font-serif text-[36px] font-medium leading-tight tracking-[-0.025em] text-fg-hi sm:text-[44px]">
            {book.title}
          </h1>

          <div className="mt-4 flex items-center gap-3 text-sm">
            <code className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-xs text-fg-mid">
              {book.slug}
            </code>
            <BookStatusBadge status={book.status} />
          </div>
        </header>

        {/* Edit form panel */}
        <section
          aria-labelledby="edit-form-heading"
          className="home-glass relative overflow-hidden rounded-[24px] p-6 sm:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/35 to-transparent"
          />
          <h2 id="edit-form-heading" className="sr-only">
            Edit book details
          </h2>
          <AdminEditBookForm book={book} />
        </section>

        {/* Danger zone */}
        <section
          aria-labelledby="danger-zone-heading"
          className="rounded-[24px] border border-dashed border-[#ff7a7a]/30 bg-[#ff7a7a]/[0.04] p-6 sm:p-8"
        >
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff9b9b]">
              Danger zone
            </p>
            <h2
              id="danger-zone-heading"
              className="mt-2 font-serif text-[20px] font-medium leading-tight text-fg-hi"
            >
              Irreversible actions
            </h2>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-fg-mid">
              Deleting a book is irreversible. The database refuses the
              operation for any book with order or entitlement history —
              archive instead by setting the status to{" "}
              <code className="rounded border border-white/[0.08] bg-white/[0.04] px-1 py-0.5 text-xs text-[#ffce63]">
                archived
              </code>{" "}
              above.
            </p>
          </header>
          <div className="mt-6">
            <AdminDeleteBookButton
              bookId={book.id}
              slug={book.slug}
              title={book.title}
            />
          </div>
        </section>

        <div className="h-12" />
      </main>

      <HomeFooter />
    </div>
  );
}
