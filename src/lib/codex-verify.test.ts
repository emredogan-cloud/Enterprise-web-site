/**
 * Unit tests for the Codex Enigmatica verification core.
 *
 * Two things are being protected here, and only one of them is
 * correctness:
 *
 *   1. The NORMALIZATION CONTRACT is printed in a commercial book. "That
 *      page levels case, spacing and punctuation BEFORE it compares; only
 *      the letters matter" is a promise to a paying reader, and once a
 *      copy is printed the promise cannot be edited. These tests are what
 *      stop a later refactor from quietly breaking it.
 *
 *   2. The endpoint must FAIL CLOSED. A verification page that accepts
 *      everything when its secrets are missing is worse than one that is
 *      down, because nobody notices.
 *
 * ⚠ No test in this file contains the real answer. The fixtures use an
 * obviously-fake value; the production digest lives only in the server
 * environment.
 */

import { describe, expect, it } from "vitest";

import {
  digestFor,
  digestsMatch,
  MAX_SUBMISSION_LENGTH,
  normalizeAnswer,
  verifySubmission,
  type VerifyConfig,
} from "./codex-verify";

const FAKE_PEPPER = "test-pepper-not-the-production-one";
const FAKE_ANSWER = "FIXTURE";
const FAKE_CONFIG: VerifyConfig = {
  pepper: FAKE_PEPPER,
  digest: digestFor(FAKE_ANSWER, FAKE_PEPPER),
};

describe("normalizeAnswer — the printed contract", () => {
  it("levels case", () => {
    expect(normalizeAnswer("fixture")).toBe("FIXTURE");
    expect(normalizeAnswer("FiXtUrE")).toBe("FIXTURE");
  });

  it("levels spacing, including interior and exotic whitespace", () => {
    expect(normalizeAnswer("  fix ture  ")).toBe("FIXTURE");
    expect(normalizeAnswer("fix\tture")).toBe("FIXTURE");
    expect(normalizeAnswer("fix ture")).toBe("FIXTURE");
  });

  it("levels punctuation, including smart quotes and dashes", () => {
    expect(normalizeAnswer("f.i,x-t’u!r?e")).toBe("FIXTURE");
    expect(normalizeAnswer("«fixture»")).toBe("FIXTURE");
  });

  it("strips digits — the book says a number is never an answer", () => {
    expect(normalizeAnswer("fixture42")).toBe("FIXTURE");
    expect(normalizeAnswer("42")).toBe("");
  });

  it("strips accents down to their base letters", () => {
    expect(normalizeAnswer("fíxtûre")).toBe("FIXTURE");
  });

  it("is idempotent", () => {
    const once = normalizeAnswer(" Fix-ture! ");
    expect(normalizeAnswer(once)).toBe(once);
  });
});

describe("digest", () => {
  it("is stable for the same pepper + answer", () => {
    expect(digestFor("ABC", FAKE_PEPPER)).toBe(digestFor("ABC", FAKE_PEPPER));
  });

  it("changes completely with the pepper — the brute-force defence", () => {
    expect(digestFor("ABC", "pepper-a")).not.toBe(digestFor("ABC", "pepper-b"));
  });

  it("is a 64-char lowercase hex string", () => {
    expect(digestFor("ABC", FAKE_PEPPER)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("compares equal digests without throwing on length mismatch", () => {
    expect(digestsMatch("abc", "abc")).toBe(true);
    expect(digestsMatch("abc", "abcd")).toBe(false);
  });
});

describe("verifySubmission", () => {
  it("matches the canonical answer", () => {
    expect(verifySubmission(FAKE_ANSWER, FAKE_CONFIG)).toEqual({
      result: "match",
    });
  });

  it("matches it through the full normalization contract", () => {
    expect(verifySubmission("  fIx-ture!  ", FAKE_CONFIG)).toEqual({
      result: "match",
    });
  });

  it("rejects a different word", () => {
    expect(verifySubmission("something-else", FAKE_CONFIG)).toEqual({
      result: "no-match",
    });
  });

  it("treats empty and punctuation-only input as empty, not as wrong", () => {
    expect(verifySubmission("", FAKE_CONFIG)).toEqual({ result: "empty" });
    expect(verifySubmission("   ", FAKE_CONFIG)).toEqual({ result: "empty" });
    expect(verifySubmission("!!!...", FAKE_CONFIG)).toEqual({ result: "empty" });
  });

  it("rejects a non-string body value", () => {
    expect(verifySubmission(42, FAKE_CONFIG)).toEqual({ result: "empty" });
    expect(verifySubmission(null, FAKE_CONFIG)).toEqual({ result: "empty" });
    expect(verifySubmission({ answer: "x" }, FAKE_CONFIG)).toEqual({
      result: "empty",
    });
  });

  it("caps the submission length before it reaches the hash", () => {
    const huge = "A".repeat(MAX_SUBMISSION_LENGTH + 1);
    expect(verifySubmission(huge, FAKE_CONFIG)).toEqual({ result: "too-long" });
  });

  it("⭑ FAILS CLOSED when the secret pair is missing ⭑", () => {
    // The single most important test in this file: an unprovisioned
    // deployment must never answer "match" to anything.
    expect(verifySubmission(FAKE_ANSWER, null)).toEqual({
      result: "unavailable",
    });
    expect(verifySubmission("anything at all", null)).toEqual({
      result: "unavailable",
    });
  });
});
