/**
 * Route tests for POST /api/newsletter.
 *
 * The route already existed; what is new is the `source` tag that makes
 * ONE audience segmentable. These tests pin the two properties that make
 * that tag safe rather than merely present:
 *
 *   · `source` is untrusted browser input, so only an allow-listed value
 *     ever reaches the stored contact record — an arbitrary string must
 *     not become a contact property
 *   · a bad tag is DROPPED, not rejected: a mistyped or stale tag must
 *     never cost a person their subscription
 *
 * Plus the pre-existing contract (validation, fail-closed on missing
 * provider env, 405 on GET), which had no coverage at all.
 *
 * Resend is mocked: the real SDK needs a network key, and we want to
 * assert on the exact payload the route hands it.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---- Resend mock ---------------------------------------------------------
const created: Array<Record<string, unknown>> = [];
let createResult: { data?: unknown; error?: { name: string } } = {
  data: { id: "contact_1" },
};
let createThrows = false;

vi.mock("resend", () => ({
  Resend: class {
    contacts = {
      create: async (payload: Record<string, unknown>) => {
        if (createThrows) throw new Error("network down");
        created.push(payload);
        return createResult;
      },
    };
  },
}));

async function post(body: unknown) {
  const { POST } = await import("./route");
  return POST(
    new Request("https://example.test/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/newsletter", () => {
  beforeEach(() => {
    created.length = 0;
    createResult = { data: { id: "contact_1" } };
    createThrows = false;
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("RESEND_AUDIENCE_ID", "aud_test");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // ---- the source tag ----------------------------------------------------

  it("records an allow-listed source as a contact property", async () => {
    const res = await post({ email: "a@b.co", source: "codex-verify" });
    expect(res.status).toBe(200);
    expect(created).toHaveLength(1);
    expect(created[0].properties).toEqual({
      source: "codex-verify",
      signup_purpose: "product-updates",
    });
  });

  it.each(["home", "article", "category", "codex-verify"])(
    "accepts the %s source",
    async (source) => {
      await post({ email: "a@b.co", source });
      expect(
        (created[0].properties as Record<string, string>).source,
      ).toBe(source);
    },
  );

  it("DROPS an unknown source but still subscribes", async () => {
    // A bad tag is our bug, not the subscriber's. Rejecting here would
    // cost a real person their subscription over a typo in our code.
    const res = await post({ email: "a@b.co", source: "not-a-real-source" });
    expect(res.status).toBe(200);
    expect(created[0].properties).toBeUndefined();
  });

  it("never writes arbitrary input into the contact record", async () => {
    await post({ email: "a@b.co", source: "<script>alert(1)</script>" });
    expect(JSON.stringify(created[0])).not.toContain("script");
  });

  it("omits properties entirely when no source is given", async () => {
    await post({ email: "a@b.co" });
    expect(created[0]).toEqual({
      audienceId: "aud_test",
      email: "a@b.co",
      unsubscribed: false,
    });
  });

  it("does not record IP, user agent or country", async () => {
    await post({ email: "a@b.co", source: "home" });
    const blob = JSON.stringify(created[0]).toLowerCase();
    for (const forbidden of ["ip", "useragent", "user_agent", "country"]) {
      expect(Object.keys(created[0]).join(",").toLowerCase()).not.toContain(
        forbidden,
      );
    }
    expect(blob).not.toContain("mozilla");
  });

  // ---- validation --------------------------------------------------------

  it("normalizes the email to lower case and trims it", async () => {
    await post({ email: "  A@B.CO  " });
    expect(created[0].email).toBe("a@b.co");
  });

  it.each(["", "nope", "a@b", "a b@c.co"])(
    "rejects %o as invalid-email",
    async (email) => {
      const res = await post({ email });
      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        ok: false,
        error: "invalid-email",
      });
      expect(created).toHaveLength(0);
    },
  );

  it("rejects an over-long address without calling the provider", async () => {
    const res = await post({ email: `${"a".repeat(250)}@b.co` });
    expect(res.status).toBe(400);
    expect(created).toHaveLength(0);
  });

  it("rejects a non-JSON body", async () => {
    const res = await post("not json");
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: "invalid-json",
    });
  });

  // ---- provider failure --------------------------------------------------

  it("FAILS CLOSED with 503 when the provider env is missing", async () => {
    vi.stubEnv("RESEND_AUDIENCE_ID", "");
    const res = await post({ email: "a@b.co" });
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: "provider-unavailable",
    });
    expect(created).toHaveLength(0);
  });

  it("maps a provider validation_error back to invalid-email", async () => {
    createResult = { error: { name: "validation_error" } };
    const res = await post({ email: "a@b.co" });
    expect(res.status).toBe(400);
  });

  it("returns 500 on an unexpected provider throw", async () => {
    createThrows = true;
    const res = await post({ email: "a@b.co" });
    expect(res.status).toBe(500);
  });

  it("answers GET with 405 and an Allow header", async () => {
    const { GET } = await import("./route");
    const res = GET();
    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("POST");
  });
});
