import { afterEach, describe, expect, it, vi } from "vitest";

import {
  normalizeEmail,
  unsubscribeToken,
  unsubscribeUrl,
  verifyUnsubscribeToken,
} from "@/lib/unsubscribe";

/**
 * The bug these tests exist for: the welcome email was delivered with the
 * literal string `{{{RESEND_UNSUBSCRIBE_URL}}}` as its unsubscribe link,
 * because Resend only expands that token for audience-bound sends. The
 * replacement is a link this codebase signs itself, so it is this codebase's
 * job to prove the link works and cannot be forged.
 */
describe("unsubscribe links", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function withKey() {
    vi.stubEnv("RESEND_API_KEY", "re_test_key_0123456789");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://valicepress.com");
  }

  it("normalizes case and surrounding space", () => {
    expect(normalizeEmail("  Reader@Example.COM ")).toBe("reader@example.com");
  });

  it("verifies a token it produced", () => {
    withKey();
    const token = unsubscribeToken("reader@example.com");
    expect(token).toBeTruthy();
    expect(verifyUnsubscribeToken("reader@example.com", token!)).toBe(true);
  });

  it("treats the address case-insensitively, because mail clients do not preserve it", () => {
    withKey();
    const token = unsubscribeToken("reader@example.com")!;
    expect(verifyUnsubscribeToken("Reader@Example.com", token)).toBe(true);
  });

  it("rejects another address's token — one link must not unsubscribe everyone", () => {
    withKey();
    const token = unsubscribeToken("reader@example.com")!;
    expect(verifyUnsubscribeToken("someone-else@example.com", token)).toBe(false);
  });

  it("rejects a truncated token without throwing (mail clients wrap long URLs)", () => {
    withKey();
    const token = unsubscribeToken("reader@example.com")!;
    expect(verifyUnsubscribeToken("reader@example.com", token.slice(0, 8))).toBe(false);
    expect(verifyUnsubscribeToken("reader@example.com", "")).toBe(false);
  });

  it("builds an absolute URL carrying the address and the token", () => {
    withKey();
    const url = new URL(unsubscribeUrl("Reader@example.com")!);
    expect(url.origin).toBe("https://valicepress.com");
    expect(url.pathname).toBe("/unsubscribe");
    expect(url.searchParams.get("e")).toBe("reader@example.com");
    expect(url.searchParams.get("t")).toHaveLength(20);
  });

  it("returns null rather than an unsignable link when no key is configured", () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect(unsubscribeToken("reader@example.com")).toBeNull();
    expect(unsubscribeUrl("reader@example.com")).toBeNull();
    expect(verifyUnsubscribeToken("reader@example.com", "anything")).toBe(false);
  });
});
