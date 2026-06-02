/**
 * Unit tests for the canonical site-origin resolver (WS-A).
 *
 * Focus: the empty-string trap fix + the fallback chain + the production
 * misconfiguration guard. These guarantee no env value can silently emit
 * `localhost` canonicals in production, and that an empty string falls
 * THROUGH rather than blowing up `new URL("")`.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { assertSiteUrlConfigured, getSiteUrl } from "./site-url";

beforeEach(() => {
  vi.unstubAllEnvs();
  // Neutralize Vercel system vars that may leak from the host environment.
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
  vi.stubEnv("VERCEL_ENV", "");
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getSiteUrl", () => {
  it("returns the configured NEXT_PUBLIC_APP_URL origin", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://kitabevi.com.tr");
    expect(getSiteUrl()).toBe("https://kitabevi.com.tr");
  });

  it("strips a trailing slash and any path (origin only)", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://kitabevi.com.tr/");
    expect(getSiteUrl()).toBe("https://kitabevi.com.tr");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://kitabevi.com.tr/ignored/path");
    expect(getSiteUrl()).toBe("https://kitabevi.com.tr");
  });

  it("falls THROUGH an empty string (the `??` trap fix) to localhost", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("falls through whitespace-only / malformed / non-http values", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "   ");
    expect(getSiteUrl()).toBe("http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "not a url");
    expect(getSiteUrl()).toBe("http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "ftp://example.com");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("self-heals to VERCEL_PROJECT_PRODUCTION_URL when NEXT_PUBLIC_APP_URL is empty", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "enterprise-web-site.vercel.app");
    expect(getSiteUrl()).toBe("https://enterprise-web-site.vercel.app");
  });

  it("prefers NEXT_PUBLIC_APP_URL over the Vercel alias", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://brand.example");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "enterprise-web-site.vercel.app");
    expect(getSiteUrl()).toBe("https://brand.example");
  });
});

describe("assertSiteUrlConfigured", () => {
  it("THROWS on Vercel production when no valid origin resolves", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(() => assertSiteUrlConfigured()).toThrow(/FATAL/);
  });

  it("does NOT throw on Vercel production when a valid origin resolves", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://kitabevi.com.tr");
    expect(() => assertSiteUrlConfigured()).not.toThrow();
  });

  it("does NOT throw off-production even with no env (graceful local/preview)", () => {
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(() => assertSiteUrlConfigured()).not.toThrow();
  });
});
