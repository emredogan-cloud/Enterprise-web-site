/**
 * Free-ebook campaign — the queue's reads and writes.
 *
 * The public API of this module is deliberately narrow. Two things happen to a
 * free-book request: it gets created by an anonymous visitor, and it gets
 * looked at and fulfilled by an operator. Nothing else. There is no function
 * here that reads a request back out to the person who made it, because there
 * is no page that shows one: a request id in a URL is an enumeration hole
 * (brief §27 — "never expose another user's request"), and the confirmation a
 * visitor needs is the one they already have on screen.
 *
 * `resolveBookForRequest` is the reason the API route never trusts the client.
 * The form posts a slug; this looks up the real book and returns its real id,
 * title and price. A visitor who edits the payload gets a 404, not a book we
 * never meant to give away — and the price crossed out in the modal is the
 * price the database holds, not one the browser sent back to us.
 */

import { and, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { books, freeBookRequests } from "@/lib/db/schema";

export type FreeBookRequestStatus =
  | "pending"
  | "fulfilled"
  | "failed"
  | "duplicate"
  | "flagged";

/**
 * The book as the campaign needs it: enough to render the modal honestly and
 * enough to deliver the file afterwards.
 *
 * `masterFileKey` never leaves the server. It is on this shape because
 * fulfilment needs it, and every caller that renders is expected to project
 * it away — `toPublicBook` below does that in one place so no route has to
 * remember.
 */
export interface RequestableBook {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  priceCents: number;
  currency: string;
  pageCount: number | null;
  masterFileKey: string | null;
  epubFileKey: string | null;
}

/**
 * Strip the private R2 keys before anything is sent to a browser.
 *
 * An allow-list rather than a `delete` or a rest-spread exclusion: when a new
 * private column is added to `RequestableBook` later, a subtractive helper
 * silently starts leaking it and a constructive one does not compile until
 * somebody decides.
 */
export function toPublicBook(b: RequestableBook) {
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    subtitle: b.subtitle,
    description: b.description,
    priceCents: b.priceCents,
    currency: b.currency,
    pageCount: b.pageCount,
  };
}

/**
 * Look up a published book by slug.
 *
 * Only `status = 'published'` rows are returned. A draft book is not on the
 * shelf, so it cannot be the subject of a gift box, so a request naming one
 * is either a stale page or a hand-edited payload — both get the same 404.
 */
export async function resolveBookForRequest(
  slug: string,
): Promise<RequestableBook | null> {
  const rows = await db
    .select({
      id: books.id,
      slug: books.slug,
      title: books.title,
      subtitle: books.subtitle,
      description: books.description,
      priceCents: books.priceCents,
      currency: books.currency,
      pageCount: books.pageCount,
      masterFileKey: books.masterFileKey,
      epubFileKey: books.epubFileKey,
    })
    .from(books)
    .where(and(eq(books.slug, slug), eq(books.status, "published")))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * How many requests this email has made, and whether it already asked for
 * this exact book.
 *
 * Both numbers in one round trip because the API needs both on every
 * submission and a second query per request is a second chance to be slow
 * under the load a promotion is designed to create.
 *
 * `sinceMs` scopes the count to the campaign window rather than all time: a
 * reader who took two books in a promotion last year is not a suspicious
 * volume today.
 */
export async function getRequestHistory(
  email: string,
  bookSlug: string,
  sinceMs: number,
): Promise<{ total: number; sameBook: number }> {
  const since = new Date(sinceMs);
  const rows = await db
    .select({
      total: sql<number>`count(*)::int`,
      sameBook: sql<number>`count(*) filter (where ${freeBookRequests.bookSlug} = ${bookSlug})::int`,
    })
    .from(freeBookRequests)
    .where(
      and(eq(freeBookRequests.email, email), gte(freeBookRequests.createdAt, since)),
    );
  return { total: rows[0]?.total ?? 0, sameBook: rows[0]?.sameBook ?? 0 };
}

/** Requests from one IP hash inside a window — the automated-volume signal. */
export async function countRecentByIp(
  ipHash: string,
  sinceMs: number,
): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(freeBookRequests)
    .where(
      and(
        eq(freeBookRequests.ipHash, ipHash),
        gte(freeBookRequests.createdAt, new Date(sinceMs)),
      ),
    );
  return rows[0]?.n ?? 0;
}

export interface CreateRequestInput {
  email: string;
  book: RequestableBook;
  message: string | null;
  marketingConsent: boolean;
  ipHash: string | null;
  status: FreeBookRequestStatus;
  notes?: string | null;
}

export async function createFreeBookRequest(input: CreateRequestInput) {
  const rows = await db
    .insert(freeBookRequests)
    .values({
      email: input.email,
      bookId: input.book.id,
      bookSlug: input.book.slug,
      bookTitle: input.book.title,
      format: "PDF",
      message: input.message,
      marketingConsent: input.marketingConsent,
      ipHash: input.ipHash,
      status: input.status,
      notes: input.notes ?? null,
    })
    .returning({ id: freeBookRequests.id, status: freeBookRequests.status });
  return rows[0];
}

// ---------------------------------------------------------------------------
// Operator surface
// ---------------------------------------------------------------------------

export interface AdminFreeBookRequest {
  id: string;
  email: string;
  bookSlug: string;
  bookTitle: string;
  format: string;
  message: string | null;
  status: FreeBookRequestStatus;
  marketingConsent: boolean;
  notes: string | null;
  createdAt: Date;
  fulfilledAt: Date | null;
  /** Whether a master file exists to send. Null when the book row is gone. */
  hasMaster: boolean | null;
}

export async function listFreeBookRequests(opts: {
  status?: FreeBookRequestStatus;
  limit?: number;
}): Promise<AdminFreeBookRequest[]> {
  const limit = Math.min(Math.max(opts.limit ?? 200, 1), 500);
  const where = opts.status ? eq(freeBookRequests.status, opts.status) : undefined;
  return db
    .select({
      id: freeBookRequests.id,
      email: freeBookRequests.email,
      bookSlug: freeBookRequests.bookSlug,
      bookTitle: freeBookRequests.bookTitle,
      format: freeBookRequests.format,
      message: freeBookRequests.message,
      status: freeBookRequests.status,
      marketingConsent: freeBookRequests.marketingConsent,
      notes: freeBookRequests.notes,
      createdAt: freeBookRequests.createdAt,
      fulfilledAt: freeBookRequests.fulfilledAt,
      hasMaster: sql<boolean | null>`(${books.masterFileKey} is not null)`,
    })
    .from(freeBookRequests)
    .leftJoin(books, eq(freeBookRequests.bookId, books.id))
    .where(where)
    .orderBy(desc(freeBookRequests.createdAt))
    .limit(limit);
}

/** Counts by status, for the operator's summary strip. */
export async function getFreeBookRequestCounts(): Promise<
  Record<FreeBookRequestStatus | "total", number>
> {
  const rows = await db
    .select({
      status: freeBookRequests.status,
      n: sql<number>`count(*)::int`,
    })
    .from(freeBookRequests)
    .groupBy(freeBookRequests.status);
  const out = {
    pending: 0,
    fulfilled: 0,
    failed: 0,
    duplicate: 0,
    flagged: 0,
    total: 0,
  };
  for (const r of rows) {
    out[r.status as FreeBookRequestStatus] = r.n;
    out.total += r.n;
  }
  return out;
}

export async function markRequestStatus(
  id: string,
  status: FreeBookRequestStatus,
  notes?: string,
) {
  await db
    .update(freeBookRequests)
    .set({
      status,
      notes: notes ?? null,
      fulfilledAt: status === "fulfilled" ? new Date() : null,
    })
    .where(eq(freeBookRequests.id, id));
}

/** One request plus the private key needed to deliver it. Operator-only. */
export async function getRequestForFulfilment(id: string) {
  const rows = await db
    .select({
      id: freeBookRequests.id,
      email: freeBookRequests.email,
      bookSlug: freeBookRequests.bookSlug,
      bookTitle: freeBookRequests.bookTitle,
      status: freeBookRequests.status,
      masterFileKey: books.masterFileKey,
    })
    .from(freeBookRequests)
    .leftJoin(books, eq(freeBookRequests.bookId, books.id))
    .where(eq(freeBookRequests.id, id))
    .limit(1);
  return rows[0] ?? null;
}
