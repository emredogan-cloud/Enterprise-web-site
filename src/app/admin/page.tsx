import type { Metadata } from "next";
import Link from "next/link";

import { BookStatusBadge } from "@/components/book-status-badge";
import { Button } from "@/components/ui/button";
import { UnprovisionedNotice } from "@/components/unprovisioned-notice";
import { AdminAccessError, requireAdmin } from "@/lib/auth";
import {
  getDashboardMetrics,
  getRecentOrders,
  listAllBooksForAdmin,
  type BookAdminListItem,
  type DashboardMetrics,
  type OrderStatus,
  type RecentOrder,
} from "@/lib/db/queries/admin";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

import { createBook } from "./actions";

// `/admin` reads Clerk session cookies and writes to the database — force
// dynamic rendering so Next.js never tries to prerender it at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// ---------------------------------------------------------------------------
// Admin context loader — runs the strict `requireAdmin` gate from
// `src/lib/auth.ts` and maps any `AdminAccessError.kind` to the right
// `UnprovisionedNotice` content. Anything else (DB connection refused,
// Clerk API outage) degrades to a single "system unavailable" notice
// rather than a hard 500.
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

function checkRequiredEnv(): string[] {
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
  return missing;
}

function mapAdminAccessError(err: AdminAccessError): AdminContextBlocked {
  switch (err.kind) {
    case "unconfigured":
      return {
        ok: false,
        title: "Admin allowlist is empty",
        body: "Set ADMIN_EMAILS to a comma-separated list of admin email addresses, then redeploy.",
        missing: ["ADMIN_EMAILS"],
      };
    case "not_signed_in":
      return {
        ok: false,
        title: "Sign in required",
        body: "You need to be signed in with an admin account to use this page.",
        missing: [],
      };
    case "no_primary_email":
      return {
        ok: false,
        title: "Your Clerk account has no primary email",
        body: "Configure a primary email address on your Clerk account, then reload this page.",
        missing: [],
      };
    case "not_admin":
      return {
        ok: false,
        title: "Not authorized",
        body: "Your account is not on the admin allowlist. Ask another admin to add your email to ADMIN_EMAILS.",
        missing: [],
      };
  }
}

async function loadAdminContext(): Promise<AdminContext> {
  // Cheap pre-flight: detect the most common cause (missing env) before
  // we touch Clerk / the DB. Faster to surface and more actionable.
  const missingEnv = checkRequiredEnv();
  if (missingEnv.length > 0) {
    return {
      ok: false,
      title: "Admin panel — configuration required",
      body: "The admin surface needs Clerk authentication and a database before it can load. Set the variables below and reload.",
      missing: missingEnv,
    };
  }

  try {
    const { email, localUserId } = await requireAdmin();
    return { ok: true, email, localUserId };
  } catch (err) {
    if (err instanceof AdminAccessError) return mapAdminAccessError(err);
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

// ===========================================================================
// Page
// ===========================================================================
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

  // Both dashboard queries do their own `requireAdmin()` check (defense
  // in depth — same `cache()`-backed call, no extra cost). They are
  // `safeQuery`-wrapped, so a DB outage degrades to empty data rather
  // than a 500.
  const [metrics, recentOrders, catalog] = await Promise.all([
    getDashboardMetrics(),
    getRecentOrders(10),
    listAllBooksForAdmin(),
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-20 px-6 py-16">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Admin · Dashboard
        </p>
        <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-foreground">
          Bookstore at a glance
        </h1>
        <p className="mt-3 text-xs text-muted-foreground">
          Signed in as {ctx.email} · local user{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
            {ctx.localUserId}
          </code>
        </p>
      </header>

      <MetricsRow metrics={metrics} />

      <RecentOrdersSection orders={recentOrders} />

      <CatalogManagementSection books={catalog} />

      <CreateBookSection />
    </main>
  );
}

// ===========================================================================
// Metrics — 3 cards (revenue / books sold / users).
// ===========================================================================
function MetricsRow({ metrics }: { metrics: DashboardMetrics }) {
  const primary = metrics.revenueByCurrency[0];
  const others = metrics.revenueByCurrency.slice(1);

  const revenueValue = primary
    ? formatPrice(primary.netCents, primary.currency)
    : "—";
  const revenueSubline = primary
    ? `Gross ${formatPrice(primary.grossCents, primary.currency)} · ${primary.orderCount} paid ${primary.orderCount === 1 ? "order" : "orders"}`
    : "No paid orders yet";

  return (
    <section aria-labelledby="metrics-heading">
      <h2 id="metrics-heading" className="sr-only">
        Key metrics
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          label="Net revenue"
          value={revenueValue}
          sublabel={revenueSubline}
        />
        <StatCard
          label="Books sold"
          value={metrics.booksSold.toLocaleString("en-US")}
          sublabel="Across all paid orders"
        />
        <StatCard
          label="Total users"
          value={metrics.totalUsers.toLocaleString("en-US")}
          sublabel="Signed-in accounts (Clerk-synced)"
        />
      </div>

      {others.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          Additional currencies:{" "}
          {others
            .map(
              (c) =>
                `${formatPrice(c.netCents, c.currency)} (${c.orderCount} ${c.orderCount === 1 ? "order" : "orders"})`,
            )
            .join(" · ")}
        </p>
      )}
    </section>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
}

function StatCard({ label, value, sublabel }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 font-serif text-3xl font-medium leading-tight text-foreground">
        {value}
      </p>
      {sublabel && (
        <p className="mt-2 text-xs text-muted-foreground">{sublabel}</p>
      )}
    </div>
  );
}

// ===========================================================================
// Recent Orders table.
// ===========================================================================
function RecentOrdersSection({ orders }: { orders: RecentOrder[] }) {
  return (
    <section aria-labelledby="recent-orders-heading">
      <header className="flex items-baseline justify-between">
        <h2
          id="recent-orders-heading"
          className="font-serif text-2xl font-medium text-foreground"
        >
          Recent orders
        </h2>
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Newest {orders.length}
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No orders yet. Once a customer completes a checkout, it appears
            here.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Customer
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Items
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Total
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <RecentOrderRow key={o.id} order={o} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function RecentOrderRow({ order }: { order: RecentOrder }) {
  const firstTitle = order.items[0]?.bookTitle ?? "(empty order)";
  const moreCount = Math.max(0, order.items.length - 1);
  const itemSummary =
    moreCount > 0
      ? `${firstTitle} +${moreCount} more`
      : firstTitle;

  return (
    <tr className="text-foreground">
      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
        {formatOrderDate(order.createdAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-medium">{order.customerName ?? "—"}</span>
          <span className="text-xs text-muted-foreground">
            {order.customerEmail}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-foreground/80">
        {itemSummary}
        <span className="ml-2 text-muted-foreground">
          ({order.items.length}{" "}
          {order.items.length === 1 ? "item" : "items"})
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
        {formatPrice(order.totalCents, order.currency)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={order.status} />
      </td>
    </tr>
  );
}

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  paid: "border-primary/30 bg-primary/10 text-primary",
  pending: "border-border bg-muted text-muted-foreground",
  failed: "border-destructive/30 bg-destructive/10 text-destructive",
  refunded: "border-border bg-accent text-accent-foreground",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
        STATUS_BADGE_CLASSES[status],
      )}
    >
      {status}
    </span>
  );
}

function formatOrderDate(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ===========================================================================
// Catalog Management table (SUB-PR 4.4).
//
// Lists EVERY book — drafts, published, archived — newest-first. Each row
// links to /admin/books/[slug]/edit. Distinct from the public storefront's
// "/books" view which filters to status='published'.
// ===========================================================================
function CatalogManagementSection({ books }: { books: BookAdminListItem[] }) {
  return (
    <section aria-labelledby="catalog-management-heading">
      <header className="flex items-baseline justify-between">
        <h2
          id="catalog-management-heading"
          className="font-serif text-2xl font-medium text-foreground"
        >
          Catalog management
        </h2>
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          {books.length} {books.length === 1 ? "title" : "titles"}
        </p>
      </header>

      {books.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No books in the catalog yet. Use the &ldquo;Add a book&rdquo; form
            below to create the first draft.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Title
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Slug
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Price
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {books.map((book) => (
                <CatalogRow key={book.id} book={book} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function CatalogRow({ book }: { book: BookAdminListItem }) {
  return (
    <tr className="text-foreground">
      <td className="px-4 py-3">
        {book.status === "published" ? (
          <Link
            href={`/books/${book.slug}`}
            className="font-medium text-foreground underline-offset-2 hover:text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {book.title}
          </Link>
        ) : (
          <span className="font-medium text-foreground">{book.title}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          {book.slug}
        </code>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
        {formatPrice(book.priceCents, book.currency)}
      </td>
      <td className="px-4 py-3">
        <BookStatusBadge status={book.status} />
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <Link
          href={`/admin/books/${book.slug}/edit`}
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Edit →
        </Link>
      </td>
    </tr>
  );
}

// ===========================================================================
// Create Book form — unchanged from SUB-PR 0.6 except for the
// Paddle price ID field (SUB-PR 4.1, brief step 3).
// ===========================================================================
function CreateBookSection() {
  return (
    <section aria-labelledby="create-book-heading">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Catalog · Ingest
        </p>
        <h2
          id="create-book-heading"
          className="mt-3 font-serif text-2xl font-medium text-foreground"
        >
          Add a book
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          New titles land as{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">draft</code>.
          Master, cover, and sample R2 keys can be filled in after upload;
          the publish flow (status →{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">published</code>
          ) lands in a later SUB-PR.
        </p>
      </header>

      <form action={createBook} className="mt-8 max-w-3xl space-y-6">
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

        <fieldset className="space-y-6 rounded-md border border-input p-4">
          <legend className="px-2 text-sm font-medium text-muted-foreground">
            Merchant of Record (Paddle) — required before checkout
          </legend>
          <FormField
            label="Paddle price ID"
            name="paddlePriceId"
            help="Paste from Paddle dashboard. Example: pri_01h8z…. Checkout fails fast for any cart item without this id."
          />
        </fieldset>

        <div className="pt-2">
          <Button type="submit" size="lg">
            Create book (draft)
          </Button>
        </div>
      </form>
    </section>
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
