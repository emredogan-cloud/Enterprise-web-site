"use client";

import { useState, type FormEvent } from "react";

import {
  newsletterErrorMessage,
  subscribeToNewsletter,
  type NewsletterErrorCode,
  type NewsletterSource,
} from "@/lib/newsletter-client";
import { trackEvent } from "@/lib/analytics";

/**
 * Optional email signup on a companion page.
 *
 * Placed BELOW the free downloads, never above them, and worded so that
 * declining costs the reader nothing. The material on this page is already
 * theirs; this asks whether they want to hear when the next one exists.
 *
 * The heading says what arrives and roughly how often, because "subscribe"
 * with no promise is how lists get built and then unsubscribed from. Consent
 * is captured with the source tag so the record shows what was agreed to.
 */
export function CompanionSignup({
  source,
  bookTitle,
}: {
  source: NewsletterSource;
  bookTitle: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    | { state: "idle" }
    | { state: "loading" }
    | { state: "ok" }
    | { state: "error"; code: NewsletterErrorCode }
  >({ state: "idle" });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus({ state: "loading" });
    const result = await subscribeToNewsletter(trimmed, source);
    if (result.ok) {
      trackEvent("newsletter_signup");
      setStatus({ state: "ok" });
    } else {
      setStatus({ state: "error", code: result.code });
    }
  };

  if (status.state === "ok") {
    return (
      <div className="rounded-2xl border border-emerald-bright/30 bg-emerald-bright/5 p-6">
        <p className="font-serif text-lg text-fg-hi">You&apos;re on the list.</p>
        <p className="mt-2 text-sm leading-relaxed text-fg-mid">
          We&apos;ll write when there&apos;s a new practice set or the next book
          in this line is ready. Every email has a one-click unsubscribe, and we
          don&apos;t send discount blasts.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <h2 className="font-serif text-xl text-fg-hi">
        Want to know when we add more?
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-fg-mid">
        Optional — the sheets above are yours either way. If you&apos;d like an
        email when we publish new practice material or the next book after{" "}
        <span className="text-fg-hi">{bookTitle}</span>, leave an address. A few
        emails a year, unsubscribe in one click.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="companion-email" className="sr-only">
          Email address
        </label>
        <input
          id="companion-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={status.state === "loading"}
          className="min-w-0 flex-1 rounded-xl border border-white/12 bg-black/25 px-4 py-3 text-sm text-fg-hi outline-none transition placeholder:text-fg-low focus:border-emerald-bright/50 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status.state === "loading"}
          className="rounded-xl bg-emerald-bright px-6 py-3 text-sm font-medium text-black transition hover:bg-emerald-bright/90 disabled:opacity-60"
        >
          {status.state === "loading" ? "Adding…" : "Keep me posted"}
        </button>
      </div>

      {status.state === "error" && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {newsletterErrorMessage(status.code)}
        </p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-fg-low">
        We only ever get your address because you typed it here. Amazon does not
        share customer details with publishers, and we never buy lists.
      </p>
    </form>
  );
}
