/**
 * Newsletter subscribe client helper.
 *
 * Phase 2.A — single shared `fetch()` for all three cinematic newsletter
 * forms (home, article, category sidebar). Wraps the `/api/newsletter`
 * endpoint that Phase 0.C shipped: POST { email } → 200 / 400 / 503 / 500.
 *
 * Returns a tagged result that the calling form can map straight into a
 * 4-state UI (idle / loading / ok / error). Never throws — even network
 * failures resolve to `{ ok: false, code: "network" }` so the form
 * shows a real error instead of a hung pending state.
 */

export type NewsletterErrorCode =
  | "invalid-email"
  | "provider-unavailable"
  | "rate-limited"
  | "internal-error"
  | "network";

export type NewsletterResult =
  | { ok: true }
  | { ok: false; code: NewsletterErrorCode };

/**
 * Map an error code into a calm, user-facing sentence. Same vocabulary
 * across all three forms so the brand voice stays consistent.
 */
export function newsletterErrorMessage(code: NewsletterErrorCode): string {
  switch (code) {
    case "invalid-email":
      return "That email doesn't look right. Mind double-checking?";
    case "provider-unavailable":
      return "Subscriptions are temporarily unavailable. Please try again later.";
    case "rate-limited":
      return "Too many tries — give it a minute and try again.";
    case "internal-error":
      return "Something went wrong on our side. Please try again in a moment.";
    case "network":
      return "Couldn't reach the server. Check your connection and try again.";
  }
}

/**
 * Submit an email to `/api/newsletter`. The route's response taxonomy is:
 *   200 { ok: true, status }
 *   400 { ok: false, error: "invalid-email" | "invalid-json" }
 *   429 (middleware-emitted; no body required)
 *   503 { ok: false, error: "provider-unavailable" }
 *   500 { ok: false, error: "internal-error" }
 */
export async function subscribeToNewsletter(
  email: string,
): Promise<NewsletterResult> {
  let res: Response;
  try {
    res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    return { ok: false, code: "network" };
  }

  if (res.ok) return { ok: true };

  // Status-first taxonomy — middleware can return 429 with no body.
  if (res.status === 429) return { ok: false, code: "rate-limited" };
  if (res.status === 503) return { ok: false, code: "provider-unavailable" };

  // For 400 / 500 we parse the JSON body to discriminate.
  let body: { error?: string } = {};
  try {
    body = (await res.json()) as { error?: string };
  } catch {
    // ignored — body wasn't JSON
  }

  if (res.status === 400) {
    return {
      ok: false,
      code: body.error === "invalid-email" ? "invalid-email" : "internal-error",
    };
  }

  // 500 + anything else
  return { ok: false, code: "internal-error" };
}
