/**
 * Unit tests for the SEO helpers (SUB-PR 4.5).
 *
 * Targets:
 *   - `getBaseUrl()` — env-driven canonical-origin resolution with
 *     fallback + trailing-slash normalization
 *   - `getCoverImageUrl()` — null cascade behavior + path joining
 *   - `buildBookJsonLd()` — the `AggregateRating` guard from SUB-PR 3.3
 *     (Google rich-results eligibility hinges on this not emitting an
 *     entry when reviewCount === 0)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildBookJsonLd, getBaseUrl, getCoverImageUrl } from "./seo";

beforeEach(() => {
  vi.unstubAllEnvs();
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getBaseUrl", () => {
  it("falls back to http://localhost:3000 when NEXT_PUBLIC_APP_URL is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(getBaseUrl()).toBe("http://localhost:3000");
  });

  it("returns the configured URL when NEXT_PUBLIC_APP_URL is set", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://kitabevi.com.tr");
    expect(getBaseUrl()).toBe("https://kitabevi.com.tr");
  });

  it("strips a single trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://kitabevi.com.tr/");
    expect(getBaseUrl()).toBe("https://kitabevi.com.tr");
  });
});

describe("getCoverImageUrl", () => {
  it("returns null when coverKey is null", () => {
    vi.stubEnv("R2_PUBLIC_BASE_URL", "https://files.example.com");
    expect(getCoverImageUrl(null)).toBeNull();
    expect(getCoverImageUrl(undefined)).toBeNull();
  });

  it("returns null when R2_PUBLIC_BASE_URL is unset (even with a key)", () => {
    vi.stubEnv("R2_PUBLIC_BASE_URL", "");
    expect(getCoverImageUrl("covers/learning-rust.jpg")).toBeNull();
  });

  it("joins the base URL with the key", () => {
    vi.stubEnv("R2_PUBLIC_BASE_URL", "https://files.example.com");
    expect(getCoverImageUrl("covers/learning-rust.jpg")).toBe(
      "https://files.example.com/covers/learning-rust.jpg",
    );
  });

  it("normalizes a trailing slash on the base AND a leading slash on the key (no double-slash)", () => {
    vi.stubEnv("R2_PUBLIC_BASE_URL", "https://files.example.com/");
    expect(getCoverImageUrl("/covers/learning-rust.jpg")).toBe(
      "https://files.example.com/covers/learning-rust.jpg",
    );
  });
});

describe("buildBookJsonLd — AggregateRating guard", () => {
  const baseArgs = {
    baseUrl: "https://kitabevi.com.tr",
    slug: "learning-rust",
    title: "Learning Rust",
    subtitle: null,
    description: null,
    isbn: null,
    language: "en",
    pageCount: null,
    priceCents: 1500,
    currency: "USD",
    authors: [],
    coverImageUrl: null,
  };

  it("omits aggregateRating when not provided", () => {
    const graph = buildBookJsonLd(baseArgs);
    const entities = graph["@graph"];
    for (const entity of entities) {
      expect(entity).not.toHaveProperty("aggregateRating");
    }
  });

  it("omits aggregateRating when reviewCount is 0 (Google's eligibility rule)", () => {
    const graph = buildBookJsonLd({
      ...baseArgs,
      aggregateRating: { ratingValue: 0, reviewCount: 0 },
    });
    const entities = graph["@graph"];
    for (const entity of entities) {
      expect(entity).not.toHaveProperty("aggregateRating");
    }
  });

  it("includes aggregateRating on BOTH Book and Product when reviewCount > 0", () => {
    const graph = buildBookJsonLd({
      ...baseArgs,
      aggregateRating: { ratingValue: 4.5, reviewCount: 23 },
    });
    const entities = graph["@graph"] as ReadonlyArray<
      Record<string, unknown>
    >;
    const book = entities.find((e) => e["@type"] === "Book");
    const product = entities.find((e) => e["@type"] === "Product");
    expect(book).toBeDefined();
    expect(product).toBeDefined();
    expect(book?.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.5,
      reviewCount: 23,
      bestRating: 5,
      worstRating: 1,
    });
    expect(product?.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.5,
      reviewCount: 23,
      bestRating: 5,
      worstRating: 1,
    });
  });
});
