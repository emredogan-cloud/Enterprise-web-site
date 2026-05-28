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
}

/**
 * Server Action — create a new `book` row in `draft` status.
 *
 * Defense-in-depth:
 *   - `/admin` is already gated by the Clerk middleware (`src/proxy.ts`),
 *     but Server Actions are POST-callable. `requireUserId` is the
 *     backstop that ensures this action never runs unauthenticated even if
 *     someone invokes it from outside the form on the admin page.
 *
 * Side effects:
 *   - Revalidates `/admin` and the new book's public detail page (which
 *     itself does not exist until SUB-PR 1.1, but pre-emptive revalidation
 *     is cheap and safe).
 */
export async function createBook(formData: FormData): Promise<void> {
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
    // status defaults to "draft"; publishedAt stays null until publish flow.
  });

  revalidatePath("/admin");
  revalidatePath(`/books/${input.slug}`);
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
  };
}
