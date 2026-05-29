import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminDeleteBookButton } from "@/components/admin-delete-book-button";
import { AdminEditBookForm } from "@/components/admin-edit-book-form";
import { BookStatusBadge } from "@/components/book-status-badge";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { AdminAccessError, requireAdmin } from "@/lib/auth";
import { getBookForEdit } from "@/lib/db/queries/admin";

// Same dynamic posture as `/admin` — Clerk session + admin-only DB reads
// at request time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit book",
  robots: { index: false, follow: false },
};

// ---------------------------------------------------------------------------
// AdminAccessError → notice mapping, mirrored from /admin/page.tsx.
// Centralizing in `src/lib/auth.ts` is a possible future refactor; for now
// keeping each admin route's mapping local makes the failure modes easy to
// trace when debugging in production.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

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
    <main className="mx-auto max-w-3xl space-y-12 px-6 py-16">
      <header>
        <nav
          aria-label="Breadcrumb"
          className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
        >
          <Link href="/admin" className="hover:text-primary">
            Admin
          </Link>
          <span aria-hidden className="mx-2">
            /
          </span>
          <span>Edit book</span>
        </nav>
        <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-foreground">
          {book.title}
        </h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            {book.slug}
          </code>
          <BookStatusBadge status={book.status} />
        </div>
      </header>

      <section aria-labelledby="edit-form-heading">
        <h2 id="edit-form-heading" className="sr-only">
          Edit book details
        </h2>
        <AdminEditBookForm book={book} />
      </section>

      <section
        aria-labelledby="danger-zone-heading"
        className="mt-20 border-t border-destructive/30 pt-12"
      >
        <header>
          <h2
            id="danger-zone-heading"
            className="font-serif text-xl font-medium text-destructive"
          >
            Danger zone
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Deleting a book is irreversible. The database refuses the operation
            for any book with order or entitlement history — archive instead by
            setting the status to <code>archived</code> above.
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
    </main>
  );
}
