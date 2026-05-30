"use client";

import { useState, type FormEvent } from "react";

import {
  newsletterErrorMessage,
  subscribeToNewsletter,
  type NewsletterErrorCode,
} from "@/lib/newsletter-client";

import { SharePanel } from "./share-panel";

/**
 * Bottom strip — Author card LEFT + Newsletter CTA RIGHT.
 *
 * Per the brief: large glass strip, rounded ~32px, two-column on desktop,
 * stacking on mobile.
 *
 * Phase 2.A — wired to `/api/newsletter` (Resend Audiences). Four-state
 * UX (idle / loading / ok / error). When the env isn't configured the
 * route returns 503 and the form shows a real error rather than the
 * previous sahte "Thanks" message.
 */
export function AuthorNewsletterStrip({
  authorName = "Eleanor Page",
  bio = "Writer, reader, and lifelong student of what makes stories and ideas unforgettable.",
}: {
  authorName?: string;
  bio?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    | { state: "idle" }
    | { state: "loading" }
    | { state: "ok" }
    | { state: "error"; code: NewsletterErrorCode }
  >({ state: "idle" });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus({ state: "loading" });
    const result = await subscribeToNewsletter(trimmed);
    if (result.ok) {
      setStatus({ state: "ok" });
    } else {
      setStatus({ state: "error", code: result.code });
    }
  };

  return (
    <section className="mx-auto mt-24 max-w-5xl px-6">
      <div className="home-glass relative overflow-hidden rounded-[32px] p-7 sm:p-9">
        {/* Top emerald edge line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
        />

        <div className="grid gap-10 lg:grid-cols-[1fr_1px_1fr] lg:gap-12">
          {/* LEFT — Author card */}
          <div>
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="inline-block h-14 w-14 flex-shrink-0 rounded-full border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_14px_-4px_rgba(51,240,170,0.4)]"
                style={{
                  background:
                    "linear-gradient(135deg, #1ddf8f 0%, #0e7f54 100%)",
                }}
              />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
                  Written by
                </p>
                <p className="mt-0.5 font-serif text-[19px] font-medium text-fg-hi">
                  {authorName}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-fg-mid">
              {bio}
            </p>

            {/* Inline share strip — reuses the same panel */}
            <div className="mt-6 max-w-xs">
              <SharePanel />
            </div>
          </div>

          {/* Vertical divider on lg+ */}
          <div
            aria-hidden
            className="hidden h-full w-px self-stretch bg-gradient-to-b from-transparent via-white/[0.08] to-transparent lg:block"
          />

          {/* RIGHT — Newsletter CTA */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-bright">
              Newsletter
            </p>
            <h2 className="mt-3 font-serif text-[24px] font-medium leading-tight text-fg-hi sm:text-[28px]">
              Enjoyed this article?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-fg-mid">
              Subscribe to get more reading guides and book recommendations
              delivered to your inbox.
            </p>

            {status.state === "ok" ? (
              <p
                role="status"
                className="mt-6 inline-block rounded-full border border-emerald-bright/30 bg-emerald-bright/10 px-5 py-2.5 text-sm text-emerald-bright"
              >
                Thanks — you&apos;re on the list. The next book lands in your inbox.
              </p>
            ) : (
              <form
                onSubmit={onSubmit}
                className="mt-6 flex flex-col gap-3 sm:flex-row"
              >
                <label htmlFor="article-newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="article-newsletter-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  disabled={status.state === "loading"}
                  className="h-11 flex-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 text-sm text-fg-hi placeholder:text-fg-fade focus:border-emerald-bright/40 focus:outline-none focus:ring-2 focus:ring-emerald-bright/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={status.state === "loading"}
                  className="home-cta-primary inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold tracking-tight disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status.state === "loading" ? "Subscribing…" : "Subscribe"}
                </button>
              </form>
            )}

            {status.state === "error" && (
              <p role="alert" className="mt-4 text-sm text-[#ff9b9b]">
                {newsletterErrorMessage(status.code)}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
