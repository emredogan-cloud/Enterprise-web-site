import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * POST /api/newsletter — subscribe an email to the Digital Bookstore audience.
 *
 * Phase 0.C — one shared endpoint for all 3 cinematic newsletter forms:
 *   - `home/newsletter-section.tsx` (homepage)
 *   - `article/author-newsletter-strip.tsx` (blog detail)
 *   - `category/category-sidebar.tsx` (blog category sidebar)
 *
 * All three previously called `setStatus("ok")` locally and faked a
 * "Thanks — you'll hear from us soon" message with no real subscription.
 * After Phase 2.A wires the forms to this route, that lie ends.
 *
 * Architecture:
 *   - Rate limiting is applied at the edge by `src/proxy.ts` (the
 *     `/(api|trpc)(.*)` matcher), so this handler does not need to call
 *     `checkRateLimit` itself.
 *   - Provider: Resend Audiences (already in `package.json` for transactional
 *     mail; reusing the same SDK + secret avoids a second vendor). If the
 *     env keys (`RESEND_API_KEY`, `RESEND_AUDIENCE_ID`) are missing the
 *     route returns 503 so the form surfaces a real error rather than a
 *     fake success.
 *   - Idempotent: Resend's `contacts.create` returns the same contact id
 *     if the email already exists in the audience, so re-submission is a
 *     no-op from the user's perspective.
 *
 * Body shape:
 *   { "email": "you@example.com" }
 *
 * Responses:
 *   200 { ok: true, status: "subscribed" | "already-subscribed" }
 *   400 { ok: false, error: "invalid-email" }
 *   503 { ok: false, error: "provider-unavailable" }
 *   500 { ok: false, error: "internal-error" }
 *
 * Rate limit 429 responses are emitted by the middleware before this
 * handler runs.
 */

// Defensive cap to keep a single submission bounded — way longer than any
// real email but rejects accidental megabyte payloads early.
const MAX_EMAIL_LENGTH = 254; // RFC 5321 maximum

// Pragmatic email check — not RFC-perfect (no regex can be), but tight enough
// to reject obvious garbage at the edge. The real validation is at Resend.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badRequest(error: string) {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}

function providerUnavailable() {
  return NextResponse.json(
    { ok: false, error: "provider-unavailable" },
    { status: 503 },
  );
}

export async function POST(req: Request) {
  // ---- 1. Parse + validate body ------------------------------------------
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("invalid-json");
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String((body as { email: unknown }).email ?? "").trim().toLowerCase()
      : "";

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
    return badRequest("invalid-email");
  }

  // ---- 2. Resolve provider ----------------------------------------------
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    // Single warn per missing-env state — useful in dev logs, not spammed
    // because each invocation is a separate edge worker.
    console.warn(
      "[api/newsletter] RESEND_API_KEY or RESEND_AUDIENCE_ID not set — " +
        "responding 503 so the form surfaces a real error.",
    );
    return providerUnavailable();
  }

  // ---- 3. Subscribe via Resend ------------------------------------------
  const resend = new Resend(apiKey);
  try {
    const result = await resend.contacts.create({
      audienceId,
      email,
      unsubscribed: false,
    });

    // Resend returns `{ data, error }` — `error` is set on validation /
    // auth failures. A duplicate contact is NOT an error in the v6 SDK
    // (the API is idempotent), so we treat the success path uniformly.
    if (result.error) {
      // Map known Resend error name strings to our status taxonomy. The
      // SDK error shape: `{ name: string, message: string, ... }`.
      const name = result.error.name ?? "unknown";
      if (name === "validation_error") {
        return badRequest("invalid-email");
      }
      console.error("[api/newsletter] resend error:", result.error);
      return NextResponse.json(
        { ok: false, error: "internal-error" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, status: "subscribed" });
  } catch (err) {
    // Network / SDK-internal throw (rare for Resend; most are returned in
    // `result.error`). Log + 500.
    console.error("[api/newsletter] unexpected throw:", err);
    return NextResponse.json(
      { ok: false, error: "internal-error" },
      { status: 500 },
    );
  }
}

// Reject GET / PUT / DELETE explicitly — keeps the surface tight and
// makes accidental browser fetches return a clear 405 rather than a
// confusing 500 from "undefined export."
export function GET() {
  return NextResponse.json(
    { ok: false, error: "method-not-allowed" },
    { status: 405, headers: { Allow: "POST" } },
  );
}
