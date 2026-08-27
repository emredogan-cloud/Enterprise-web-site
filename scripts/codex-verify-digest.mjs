#!/usr/bin/env node
/**
 * Generate the CODEX_VERIFY_PEPPER / CODEX_VERIFY_DIGEST pair for
 * `/codex-enigmatica/verify`.
 *
 * The answer is read from STDIN and is never written anywhere: not to a
 * file, not to the terminal, not to shell history. What this prints is a
 * random pepper and a peppered SHA-256 digest — from which the answer
 * cannot be recovered.
 *
 * Usage (interactive; the typed answer is not echoed on a TTY):
 *
 *     node scripts/codex-verify-digest.mjs
 *
 * Then paste the two printed lines into the Vercel project's environment
 * (Production + Preview) or into `.env.local` for local development.
 *
 * ⚠ Re-running this produces a NEW pepper and therefore a NEW digest for
 * the same answer. That is intended — rotating the pepper is how you
 * invalidate a leaked digest. Set BOTH variables together or the endpoint
 * will reject every submission.
 */

import { createHash, randomBytes } from "node:crypto";
import { createInterface } from "node:readline";

/** The book's printed normalization contract, byte-for-byte. */
function normalize(raw) {
  return raw.normalize("NFKD").toUpperCase().replace(/[^A-Z]/g, "");
}

async function readAnswer() {
  if (process.stdin.isTTY) {
    process.stderr.write("Answer (input hidden): ");
    process.stdin.setRawMode(true);
  }
  const rl = createInterface({ input: process.stdin, terminal: false });
  for await (const line of rl) {
    rl.close();
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
      process.stderr.write("\n");
    }
    return line;
  }
  return "";
}

const raw = await readAnswer();
const normalized = normalize(raw);

if (!normalized) {
  process.stderr.write(
    "⛔ Nothing to hash — the input normalized to an empty string.\n",
  );
  process.exit(1);
}

const pepper = randomBytes(32).toString("hex");
const digest = createHash("sha256")
  .update(pepper, "utf8")
  .update("\0", "utf8")
  .update(normalized, "utf8")
  .digest("hex");

// Only the secrets are printed — never the answer, never its length.
process.stdout.write(`CODEX_VERIFY_PEPPER=${pepper}\n`);
process.stdout.write(`CODEX_VERIFY_DIGEST=${digest}\n`);
process.stderr.write(
  "\nPaste both lines into the Vercel environment (Production + Preview).\n" +
    "Set them TOGETHER — a mismatched pair rejects every submission.\n",
);
