import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { getAuthenticatedUser } from "@/lib/auth";
import { upsertLocalUser } from "@/lib/db/users";

import { createBook } from "./actions";

// `/admin` reads Clerk session cookies and writes to the database — force
// dynamic rendering so Next.js never tries to prerender it at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// ---------------------------------------------------------------------------
// Admin context loader — resolves the signed-in user + their local DB row
// or returns a structured "blocked" reason. Wraps every potentially-failing
// dependency (Clerk, Postgres) so a missing env var becomes a calm in-page
// notice instead of a hard 500.
// ---------------------------------------------------------------------------
interface AdminContextOk {
  ok: true;
  email: string;
  localUserId: string;
}
interface AdminContextBlocked {
  ok: false;
  title: string;
  body: string;
  missing: ReadonlyArray<string>;
}
type AdminContext = AdminContextOk | AdminContextBlocked;

async function loadAdminContext(): Promise<AdminContext> {
  // Cheap pre-flight: detect the most common cause (missing env) before we
  // touch Clerk / the DB. Faster to surface and more actionable.
  const missing: string[] = [];
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    !process.env.CLERK_SECRET_KEY
  ) {
    missing.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY");
  }
  if (!process.env.DATABASE_URL) {
    missing.push("DATABASE_URL");
  }
  if (missing.length > 0) {
    return {
      ok: false,
      title: "Admin panel — configuration required",
      body: "The admin surface needs Clerk authentication and a database before it can load. Set the variables below and reload.",
      missing,
    };
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        ok: false,
        title: "Sign in required",
        body: "You need to be signed in with an admin account to use this page.",
        missing: [],
      };
    }
    const email = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    )?.emailAddress;
    if (!email) {
      return {
        ok: false,
        title: "Clerk user is missing a primary email",
        body: "Configure a primary email address on your Clerk account to use the admin.",
        missing: [],
      };
    }

    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ");
    const localUserId = await upsertLocalUser({
      clerkUserId: user.id,
      email,
      name: fullName || undefined,
    });

    return { ok: true, email, localUserId };
  } catch (err) {
    // Anything else — Clerk API call failing, DB connection refused, etc.
    return {
      ok: false,
      title: "Admin panel — system unavailable",
      body:
        err instanceof Error
          ? `Setup failed: ${err.message}`
          : "Setup failed for an unknown reason — see the server logs.",
      missing: [],
    };
  }
}

export default async function AdminPage() {
  const ctx = await loadAdminContext();

  if (!ctx.ok) {
    return (
      <UnprovisionedNotice
        title={ctx.title}
        body={ctx.body}
        missing={ctx.missing}
      />
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Admin · Catalog ingest
      </p>
      <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-foreground">
        Add a book
      </h1>
      <p className="mt-3 text-pretty text-muted-foreground">
        New titles land as <code className="rounded bg-muted px-1 py-0.5 text-xs">draft</code>.
        Master, cover, and sample R2 keys can be filled in after upload; the
        publish flow (status → <code className="rounded bg-muted px-1 py-0.5 text-xs">published</code>)
        lands in a later SUB-PR.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Signed in as {ctx.email} · local user{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[10px]">{ctx.localUserId}</code>
      </p>

      <form action={createBook} className="mt-10 space-y-6">
        <FormField label="Title" name="title" required />
        <FormField
          label="Slug"
          name="slug"
          required
          help="URL-safe identifier (no spaces). Example: learning-rust."
        />
        <FormField label="Subtitle" name="subtitle" />
        <FormField label="Description" name="description" textarea />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            label="Price (cents)"
            name="priceCents"
            type="number"
            required
            help="Stored as integer cents. 1500 = $15.00."
          />
          <FormField label="Currency" name="currency" defaultValue="USD" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Language" name="language" defaultValue="en" />
          <FormField label="Page count" name="pageCount" type="number" />
        </div>

        <FormField label="ISBN" name="isbn" />

        <fieldset className="space-y-6 rounded-md border border-input p-4">
          <legend className="px-2 text-sm font-medium text-muted-foreground">
            R2 object keys (optional now; required before publish)
          </legend>
          <FormField
            label="Cover key"
            name="coverKey"
            help="Path inside the ARTIFACTS bucket. Example: covers/learning-rust.jpg."
          />
          <FormField
            label="Sample key"
            name="sampleKey"
            help="HTML or PDF sample key in the ARTIFACTS bucket."
          />
          <FormField
            label="Master file key"
            name="masterFileKey"
            help="Path inside the MASTERS bucket. Required before publishing."
          />
        </fieldset>

        <div className="pt-2">
          <Button type="submit" size="lg">
            Create book (draft)
          </Button>
        </div>
      </form>
    </main>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  textarea?: boolean;
  help?: string;
}

function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  textarea,
  help,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {help && (
        <p className="mt-1 text-xs text-muted-foreground">{help}</p>
      )}
      {textarea ? (
        <textarea
          id={name}
          name={name}
          required={required}
          defaultValue={defaultValue}
          rows={4}
          className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          className="mt-2 block h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60"
        />
      )}
    </div>
  );
}
