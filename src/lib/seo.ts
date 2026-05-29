/**
 * SEO helpers (Roadmap §13 — "the paywall-content problem" + structured data).
 *
 * Two narrow responsibilities:
 *  - URL construction (`getBaseUrl`, `getCoverImageUrl`) — never throw on
 *    missing env so build / dev / unprovisioned environments keep rendering.
 *  - JSON-LD assembly (`buildBookJsonLd`) — a typed Graph payload covering
 *    Organization + BreadcrumbList + Book + Product + Offer per the brief.
 *    `AggregateRating` is deliberately omitted; it lands when reviews ship
 *    in SUB-PR 3.3 (Google rejects a 0-rating AggregateRating anyway).
 */

import type { Graph } from "schema-dts";

export const SITE_NAME = "Digital Bookstore";

const DEFAULT_DEV_BASE_URL = "http://localhost:3000";

/**
 * Canonical site origin. Reads `NEXT_PUBLIC_APP_URL` (declared in
 * `.env.example` since SUB-PR 0.2). Falls back to localhost for
 * unprovisioned dev / build so server-rendering never crashes; production
 * deploys MUST set the env (Vercel's project URL is the natural source).
 */
export function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (!fromEnv) return DEFAULT_DEV_BASE_URL;
  return fromEnv.replace(/\/$/, "");
}

/**
 * Construct a public URL for a cover stored at `coverKey` in R2.
 *
 * Returns `null` when either `coverKey` is empty OR `R2_PUBLIC_BASE_URL`
 * has not been provisioned. Both cases fall back to the typographic
 * placeholder rendered by `<CoverImage />` — no broken image links and
 * no Next/Image attempts against an unconfigured host.
 */
export function getCoverImageUrl(
  coverKey: string | null | undefined,
): string | null {
  if (!coverKey) return null;
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/${coverKey.replace(/^\//, "")}`;
}

interface BookJsonLdArgs {
  baseUrl: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  isbn: string | null;
  language: string;
  pageCount: number | null;
  priceCents: number;
  /** ISO-4217 currency code (e.g., "USD"). */
  currency: string;
  authors: ReadonlyArray<{ name: string }>;
  coverImageUrl: string | null;
}

/**
 * JSON-LD `@graph` for the book detail page — Organization,
 * BreadcrumbList, Book, Product + nested Offer.
 *
 * Wrapped in a single graph (rather than multiple `<script>` tags) so
 * `@id` cross-references are visible to crawlers; the Book and Product
 * share canonical identity through the shared book URL.
 */
export function buildBookJsonLd(args: BookJsonLdArgs): Graph {
  const bookUrl = `${args.baseUrl}/books/${args.slug}`;
  const longDescription = args.description ?? args.subtitle ?? undefined;
  const cover = args.coverImageUrl ?? undefined;
  const priceText = (args.priceCents / 100).toFixed(2);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${args.baseUrl}/#organization`,
        name: SITE_NAME,
        url: args.baseUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: args.baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Books",
            item: `${args.baseUrl}/books`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: args.title,
            item: bookUrl,
          },
        ],
      },
      {
        "@type": "Book",
        "@id": `${bookUrl}#book`,
        name: args.title,
        ...(longDescription ? { description: longDescription } : {}),
        ...(args.isbn ? { isbn: args.isbn } : {}),
        bookFormat: "https://schema.org/EBook",
        inLanguage: args.language,
        ...(args.authors.length > 0
          ? {
              author: args.authors.map((a) => ({
                "@type": "Person" as const,
                name: a.name,
              })),
            }
          : {}),
        ...(args.pageCount ? { numberOfPages: args.pageCount } : {}),
        ...(cover ? { image: cover } : {}),
      },
      {
        "@type": "Product",
        name: args.title,
        ...(longDescription ? { description: longDescription } : {}),
        ...(cover ? { image: [cover] } : {}),
        brand: { "@type": "Organization", name: SITE_NAME },
        offers: {
          "@type": "Offer",
          url: bookUrl,
          price: priceText,
          priceCurrency: args.currency.toUpperCase(),
          availability: "https://schema.org/InStock",
          seller: { "@type": "Organization", name: SITE_NAME },
        },
      },
    ],
  };
}
