/**
 * Codex Enigmatica verification — client fetch helper.
 *
 * Mirrors `newsletter-client.ts`: one shared `fetch()`, a tagged result
 * the form maps straight into UI state, and never throws — a dropped
 * connection resolves to `{ ok: false, code: "network" }` so the form
 * shows a real error instead of hanging in "checking…".
 *
 * ⚠ THIS FILE SHIPS TO THE BROWSER. It therefore contains no answer, no
 * digest, no pepper, no length, and no hint of any of them. Its entire
 * knowledge of the puzzle is the string the reader typed.
 */

export type VerifyErrorCode =
  | "empty"
  | "too-long"
  | "rate-limited"
  | "unavailable"
  | "network";

export type VerifyResult =
  | { ok: true; match: boolean }
  | { ok: false; code: VerifyErrorCode };

/**
 * Calm, non-revealing copy for every failure mode.
 *
 * None of these sentences tells the reader anything about the answer —
 * not its length, not its shape, not how close they were.
 */
export function verifyErrorMessage(code: VerifyErrorCode): string {
  switch (code) {
    case "empty":
      return "Type the answer first.";
    case "too-long":
      return "That is longer than any answer in this book.";
    case "rate-limited":
      return "Too many attempts. Wait a minute and try again.";
    case "unavailable":
      return "Verification is temporarily unavailable. Please try again later.";
    case "network":
      return "Couldn't reach the server. Check your connection and try again.";
  }
}

/**
 * POST the reader's submission.
 *
 * The route answers 200 for BOTH outcomes — correct and incorrect — so
 * success is read from the body, never from the status line.
 */
export async function verifyCodexAnswer(answer: string): Promise<VerifyResult> {
  let res: Response;
  try {
    res = await fetch("/api/codex-enigmatica/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });
  } catch {
    return { ok: false, code: "network" };
  }

  if (res.status === 429) return { ok: false, code: "rate-limited" };
  if (res.status === 503) return { ok: false, code: "unavailable" };

  let body: { ok?: boolean; result?: string; error?: string } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    return { ok: false, code: "network" };
  }

  if (res.ok && body.ok) return { ok: true, match: body.result === "match" };

  if (res.status === 400) {
    return {
      ok: false,
      code: body.error === "too-long" ? "too-long" : "empty",
    };
  }

  return { ok: false, code: "unavailable" };
}
