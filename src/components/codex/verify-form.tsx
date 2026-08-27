"use client";

import { useState, type FormEvent } from "react";

import { trackEvent } from "@/lib/analytics";
import {
  verifyCodexAnswer,
  verifyErrorMessage,
  type VerifyErrorCode,
} from "@/lib/codex-verify-client";
import {
  newsletterErrorMessage,
  subscribeToNewsletter,
  type NewsletterErrorCode,
} from "@/lib/newsletter-client";

/**
 * The verification form — the interactive half of `/codex-enigmatica/verify`.
 *
 * Four states: idle / checking / correct / incorrect, plus a separate
 * error channel for the things that are not about the answer at all
 * (rate limit, provider down, network).
 *
 * ⚠ WHAT THIS COMPONENT MUST NEVER DO, and why each line matters:
 *
 *   · It never holds the answer, a digest, or a pepper. Everything it
 *     knows is what the reader typed.
 *   · It never states or implies the answer's LENGTH. There is no
 *     `maxLength={5}`, no character boxes, no counter — a five-slot input
 *     would hand a third of the puzzle to anyone who loads the page.
 *   · It never distinguishes "wrong" from "nearly right". There is one
 *     failure sentence and it is the same every time.
 *   · Its analytics events carry no payload (see `@/lib/analytics`).
 *
 * The optional newsletter opt-in appears only AFTER a correct answer and
 * is genuinely optional: verification completes, and stays complete,
 * whether or not the reader subscribes.
 */
export function VerifyForm() {
  const [answer, setAnswer] = useState("");
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "checking" }
    | { kind: "correct" }
    | { kind: "incorrect" }
    | { kind: "error"; code: VerifyErrorCode }
  >({ kind: "idle" });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.kind === "checking") return;

    setState({ kind: "checking" });
    trackEvent("codex_verify_attempt");

    const result = await verifyCodexAnswer(answer);
    if (!result.ok) {
      setState({ kind: "error", code: result.code });
      return;
    }
    if (result.match) {
      trackEvent("codex_verify_success");
      setState({ kind: "correct" });
    } else {
      setState({ kind: "incorrect" });
    }
  };

  if (state.kind === "correct") return <VerifiedPanel />;

  return (
    <div className="mt-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="codex-answer" className="sr-only">
          The answer to the last question
        </label>
        <input
          id="codex-answer"
          name="answer"
          type="text"
          value={answer}
          onChange={(e) => {
            setAnswer(e.currentTarget.value);
            if (state.kind !== "idle" && state.kind !== "checking") {
              setState({ kind: "idle" });
            }
          }}
          disabled={state.kind === "checking"}
          /*
           * Deliberately unhelpful to a machine and helpful to a person:
           * every browser affordance that might remember, complete, or
           * correct a puzzle answer is switched off. `spellCheck={false}`
           * also stops a red underline implying the word is wrong.
           */
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Your answer"
          aria-describedby="codex-answer-help"
          className="h-12 flex-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 text-sm tracking-[0.15em] text-fg-hi placeholder:tracking-normal placeholder:text-fg-fade focus:border-emerald-bright/40 focus:outline-none focus:ring-2 focus:ring-emerald-bright/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state.kind === "checking"}
          className="home-cta-primary inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold tracking-tight disabled:cursor-not-allowed disabled:opacity-70"
        >
          {state.kind === "checking" ? "Checking…" : "Verify"}
        </button>
      </form>

      <p id="codex-answer-help" className="mt-4 text-sm text-fg-soft">
        Case, spacing and punctuation do not matter. Only the letters are
        compared — exactly as the contract page says.
      </p>

      {state.kind === "incorrect" && (
        <p
          role="status"
          className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm leading-relaxed text-fg-mid"
        >
          That isn&apos;t the verification value for this edition.
        </p>
      )}

      {state.kind === "error" && (
        <p
          role="alert"
          className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-5 py-4 text-sm leading-relaxed text-amber-200/90"
        >
          {verifyErrorMessage(state.code)}
        </p>
      )}
    </div>
  );
}

/**
 * What a reader sees once the answer is accepted.
 *
 * Restrained on purpose. The book's voice is a dry archivist who does not
 * congratulate anybody twice, and the last page of a two-hundred-puzzle
 * book should not end in confetti.
 *
 * The opt-in below is the ONLY thing asked of a finisher, it is asked
 * after the fact, and declining it costs them nothing — the verification
 * above is already complete and does not un-complete.
 */
function VerifiedPanel() {
  const [email, setEmail] = useState("");
  const [sub, setSub] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "ok" }
    | { kind: "error"; code: NewsletterErrorCode }
  >({ kind: "idle" });

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setSub({ kind: "loading" });
    // Tagged at the source: this address arrived from someone who had
    // already solved the book, which is a materially different audience
    // from a homepage visitor — and the only moment that fact is known.
    const result = await subscribeToNewsletter(trimmed, "codex-verify");
    if (result.ok) {
      trackEvent("newsletter_signup");
      setSub({ kind: "ok" });
    } else {
      setSub({ kind: "error", code: result.code });
    }
  };

  return (
    <div className="mt-12">
      <div
        role="status"
        className="home-glass relative overflow-hidden rounded-[24px] px-7 py-10 sm:px-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[320px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(22, 199, 132, 0.18) 0%, transparent 60%)",
          }}
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
          Verified
        </p>
        <h2 className="mt-4 font-serif text-[30px] font-medium leading-tight tracking-tight text-fg-hi sm:text-[36px]">
          That is the answer.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-mid">
          A hundred puzzles, five sayings, one word — and you found the word
          that is written nowhere in the book. Whoever wrote the original
          did not put it there either.
        </p>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-fg-mid">
          Nothing else is required of you. This page keeps no record of who
          you are, and there is no score to claim.
        </p>
        <p className="mt-6 text-sm text-fg-soft">— The Archivist</p>
      </div>

      {/* ── Optional. Genuinely. ─────────────────────────────────────── */}
      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-fg-soft">
          Optional
        </p>
        <h3 className="mt-3 font-serif text-xl font-medium text-fg-hi">
          Tell me when the next one is built
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-mid">
          If you want to hear when the next book in this series exists, leave
          an email. One message when there is something to say, an
          unsubscribe link in every one of them, and nothing else — your
          verification above is already complete either way.
        </p>

        {sub.kind === "ok" ? (
          <p
            role="status"
            className="mt-6 inline-block rounded-full border border-emerald-bright/30 bg-emerald-bright/10 px-5 py-2.5 text-sm text-emerald-bright"
          >
            Noted. You&apos;ll hear from me when there is a reason to.
          </p>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="codex-email" className="sr-only">
              Email address
            </label>
            <input
              id="codex-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              disabled={sub.kind === "loading"}
              className="h-11 flex-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 text-sm text-fg-hi placeholder:text-fg-fade focus:border-emerald-bright/40 focus:outline-none focus:ring-2 focus:ring-emerald-bright/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sub.kind === "loading"}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/[0.12] px-6 text-sm font-medium text-fg-hi transition-colors hover:border-emerald-bright/40 hover:text-emerald-bright disabled:cursor-not-allowed disabled:opacity-70"
            >
              {sub.kind === "loading" ? "Sending…" : "Keep me posted"}
            </button>
          </form>
        )}

        {sub.kind === "error" && (
          <p role="alert" className="mt-4 text-sm text-amber-200/90">
            {newsletterErrorMessage(sub.code)}
          </p>
        )}
      </div>
    </div>
  );
}
