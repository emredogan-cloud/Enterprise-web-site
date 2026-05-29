"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";

interface CreateBookInput {
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  priceCents: number;
  currency: string;
  language: string;
  masterFileKey?: string;
  coverKey?: string;
  sampleKey?: string;
  isbn?: string;
  pageCount?: number;
  /**
   * Paddle catalog `priceId` (e.g. `pri_01abc…`). Optional at create time —
   * the book can land in draft, get its Paddle price set up in the Paddle
   * dashboard, and have the id filled in via an edit flow before publish.
   * Checkout fails fast for any cart item lacking this value (SUB-PR 1.5).
   */
  paddlePriceId?: string;
}

/**
 * Server Action — create a new `book` row in `draft` status.
 *
 * Defense-in-depth:
 *   - `/admin` is already gated by the Clerk middleware (`src/proxy.ts`)
 *     and the page-level loader, but Server Actions are POST-callable.
 *     `requireUserId` is the backstop that ensures this action never runs
 *     unauthenticated even if someone invokes it from outside the form.
 *   - Every external dependency (Clerk auth, the database) is wrapped in
 *     try/catch so a missing env var degrades to a logged warning, never
 *     a hard 500 on the client.
 */
export async function createBook(formData: FormData): Promise<void> {
  try {
    await requireUserId();
    const input = parseCreateBookFormData(formData);

    await db.insert(books).values({
      title: input.title,
      slug: input.slug,
      subtitle: input.subtitle ?? null,
      description: input.description ?? null,
      priceCents: input.priceCents,
      currency: input.currency,
      language: input.language,
      masterFileKey: input.masterFileKey ?? null,
      coverKey: input.coverKey ?? null,
      sampleKey: input.sampleKey ?? null,
      isbn: input.isbn ?? null,
      pageCount: input.pageCount ?? null,
      paddlePriceId: input.paddlePriceId ?? null,
      // status defaults to "draft"; publishedAt stays null until publish flow.
    });

    revalidatePath("/admin");
    revalidatePath(`/books/${input.slug}`);
    // Note (SUB-PR 4.2): we deliberately do NOT call `revalidateTag` on
    // `CATALOG_TAG` here. Next.js 16 changed `revalidateTag`'s signature
    // to require a cache-life profile, with semantics that don't cleanly
    // match "purge now and reuse the original revalidate window." The
    // cached surfaces that consume `getFeaturedBooks` / `getBookSitemap
    // Entries` are themselves cached at higher layers (blog SSG at build,
    // sitemap ISR at 1h), so the unstable_cache invalidation would mostly
    // be architectural hygiene — the new-book visibility lag is bounded
    // by the higher-level cache, not by the 5-min Data Cache window.
    // When the Next.js 16 caching API stabilizes we'll wire this back in.
  } catch (err) {
    // Inline error display on the form lands in a later SUB-PR; for now we
    // log + swallow so the action never crashes the page. The admin route
    // already guards against unprovisioned environments before the form
    // renders, so the unhappy path here is mostly "DB rejected the row"
    // (e.g. duplicate slug) — surface as a return value in a follow-up.
    console.error("[admin] createBook failed:", err);
  }
}

function parseCreateBookFormData(formData: FormData): CreateBookInput {
  const getString = (key: string): string | undefined => {
    const raw = formData.get(key);
    if (typeof raw !== "string") return undefined;
    const trimmed = raw.trim();
    return trimmed === "" ? undefined : trimmed;
  };

  const getRequiredString = (key: string): string => {
    const value = getString(key);
    if (!value) throw new Error(`Missing required field: ${key}`);
    return value;
  };

  const getNumber = (key: string): number | undefined => {
    const raw = getString(key);
    if (raw === undefined) return undefined;
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      throw new Error(`Invalid number for field ${key}: ${raw}`);
    }
    return n;
  };

  const getRequiredNumber = (key: string): number => {
    const value = getNumber(key);
    if (value === undefined) {
      throw new Error(`Missing required field: ${key}`);
    }
    return value;
  };

  return {
    title: getRequiredString("title"),
    slug: getRequiredString("slug"),
    subtitle: getString("subtitle"),
    description: getString("description"),
    priceCents: getRequiredNumber("priceCents"),
    currency: getString("currency") ?? "USD",
    language: getString("language") ?? "en",
    masterFileKey: getString("masterFileKey"),
    coverKey: getString("coverKey"),
    sampleKey: getString("sampleKey"),
    isbn: getString("isbn"),
    pageCount: getNumber("pageCount"),
    paddlePriceId: getString("paddlePriceId"),
  };
}
