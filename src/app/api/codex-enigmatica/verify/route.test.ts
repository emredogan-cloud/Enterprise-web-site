/**
 * Route tests for POST /api/codex-enigmatica/verify.
 *
 * The unit tests in `src/lib/codex-verify.test.ts` cover the normalization
 * contract. THIS file covers the things that only exist at the HTTP
 * boundary, and every one of them is a security property rather than a
 * feature:
 *
 *   · both outcomes are 200, so the status line leaks nothing
 *   · the response body never contains the submission or the answer
 *   · a missing secret pair FAILS CLOSED (503, not "wrong")
 *   · a missing or unreachable rate limiter FAILS CLOSED (503, not open)
 *   · GET is 405 — a GET-able endpoint would put answers in access logs
 *
 * Upstash is mocked because the real limiter needs a network Redis; the
 * mock lets us drive `success: false` deterministically instead of firing
 * six real requests and hoping.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---- Upstash mocks -------------------------------------------------------
// `limitResult` is mutated per test to steer the limiter's verdict.
const limitResult = { success: true, limit: 5, remaining: 4, reset: 0 };
let limitThrows = false;

vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor() {}
  },
}));

vi.mock("@upstash/ratelimit", () => {
  class Ratelimit {
    static slidingWindow() {
      return {};
    }
    async limit() {
      if (limitThrows) throw new Error("redis unreachable");
      return { ...limitResult, reset: Date.now() + 60_000 };
    }
  }
  return { Ratelimit };
});

function post(body: unknown, raw?: string) {
  return new Request("https://example.test/api/codex-enigmatica/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "203.0.113.9",
    },
    body: raw ?? JSON.stringify(body),
  });
}

/** Import fresh so the route's memoized limiter re-reads the stubbed env. */
async function loadRoute() {
  vi.resetModules();
  return import("./route");
}

const PEPPER = "route-test-pepper";
/** sha256(PEPPER \0 "FIXTURE") — computed here, never hard-coded. */
async function fixtureDigest() {
  const { digestFor } = await import("@/lib/codex-verify");
  return digestFor("FIXTURE", PEPPER);
}

beforeEach(async () => {
  limitResult.success = true;
  limitThrows = false;
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://stub.upstash.io");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "stub-token");
  vi.stubEnv("CODEX_VERIFY_PEPPER", PEPPER);
  vi.stubEnv("CODEX_VERIFY_DIGEST", await fixtureDigest());
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/codex-enigmatica/verify", () => {
  it("accepts the correct answer with 200 + result:match", async () => {
    const { POST } = await loadRoute();
    const res = await POST(post({ answer: "FIXTURE" }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, result: "match" });
  });

  it("accepts it through the normalization contract", async () => {
    const { POST } = await loadRoute();
    const res = await POST(post({ answer: "  fIx-ture!  " }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, result: "match" });
  });

  it("⭑ answers a WRONG guess with 200 too — the status line leaks nothing ⭑", async () => {
    const { POST } = await loadRoute();
    const res = await POST(post({ answer: "WRONGWORD" }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, result: "no-match" });
  });

  it("⭑ never echoes the submission or reveals the answer ⭑", async () => {
    const { POST } = await loadRoute();
    for (const answer of ["FIXTURE", "WRONGWORD"]) {
      const res = await POST(post({ answer }));
      const text = JSON.stringify(await res.json());
      expect(text).not.toContain(answer);
      expect(text.toUpperCase()).not.toContain("FIXTURE");
      // and nothing that discloses shape
      expect(text).not.toMatch(/length|chars|letters/i);
    }
  });

  it("rejects empty and punctuation-only input as 400 empty", async () => {
    const { POST } = await loadRoute();
    for (const answer of ["", "   ", "!!!"]) {
      const res = await POST(post({ answer }));
      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({ ok: false, error: "empty" });
    }
  });

  it("rejects a missing `answer` key as 400", async () => {
    const { POST } = await loadRoute();
    const res = await POST(post({ nope: 1 }));
    expect(res.status).toBe(400);
  });

  it("rejects malformed JSON as 400 invalid-json", async () => {
    const { POST } = await loadRoute();
    const res = await POST(post(null, "{not json"));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: "invalid-json",
    });
  });

  it("rejects an over-long submission as 400 too-long", async () => {
    const { POST } = await loadRoute();
    const res = await POST(post({ answer: "A".repeat(5000) }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: "too-long",
    });
  });

  it("returns 429 with Retry-After once the limiter says no", async () => {
    limitResult.success = false;
    const { POST } = await loadRoute();
    const res = await POST(post({ answer: "FIXTURE" }));
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: "rate-limited",
    });
  });

  it("⭑ FAILS CLOSED when the rate limiter is unconfigured ⭑", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const { POST } = await loadRoute();
    const res = await POST(post({ answer: "FIXTURE" }));
    expect(res.status).toBe(503);
  });

  it("⭑ FAILS CLOSED when the rate-limit backend throws ⭑", async () => {
    limitThrows = true;
    const { POST } = await loadRoute();
    const res = await POST(post({ answer: "FIXTURE" }));
    expect(res.status).toBe(503);
  });

  it("⭑ FAILS CLOSED when the secret pair is missing ⭑", async () => {
    vi.stubEnv("CODEX_VERIFY_PEPPER", "");
    vi.stubEnv("CODEX_VERIFY_DIGEST", "");
    const { POST } = await loadRoute();
    const res = await POST(post({ answer: "FIXTURE" }));
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: "unavailable",
    });
  });

  it("rejects a malformed digest rather than trusting it", async () => {
    vi.stubEnv("CODEX_VERIFY_DIGEST", "not-a-sha256");
    const { POST } = await loadRoute();
    const res = await POST(post({ answer: "FIXTURE" }));
    expect(res.status).toBe(503);
  });

  it("never caches a verification response", async () => {
    const { POST } = await loadRoute();
    const res = await POST(post({ answer: "FIXTURE" }));
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });

  it("answers GET with 405 — answers must never ride in a query string", async () => {
    const { GET } = await loadRoute();
    const res = GET();
    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("POST");
  });
});
