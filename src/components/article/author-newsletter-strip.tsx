"use client";

import { useState, type FormEvent } from "react";

import { SharePanel } from "./share-panel";

/**
 * Bottom strip — Author card LEFT + Newsletter CTA RIGHT.
 *
 * Per the brief: large glass strip, rounded ~32px, two-column on desktop,
 * stacking on mobile.
 *
 * Client Component because the newsletter form holds local state. The
 * actual subscription endpoint isn't wired yet (Beehiiv decision is in
 * `STRATEJI_VE_KITAP_FIKIRLERI.md §9`) — for now we accept the email and
 * show a success state, mirroring the homepage newsletter section.
 */
export function AuthorNewsletterStrip({
  authorName = "Eleanor Page",
  bio = "Writer, reader, and lifelong student of what makes stories and ideas unforgettable.",
}: {
  authorName?: string;
  bio?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok">("idle");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: wire to /api/newsletter once a provider lands (STRATEJI §9).
    setStatus("ok");
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#88918a]">
                  Written by
                </p>
                <p className="mt-0.5 font-serif text-[19px] font-medium text-[#e6e6e0]">
                  {authorName}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[#a7a7a0]">
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#33f0aa]">
              Newsletter
            </p>
            <h2 className="mt-3 font-serif text-[24px] font-medium leading-tight text-[#e6e6e0] sm:text-[28px]">
              Enjoyed this article?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#a7a7a0]">
              Subscribe to get more reading guides and book recommendations
              delivered to your inbox.
            </p>

            {status === "ok" ? (
              <p
                role="status"
                className="mt-6 inline-block rounded-full border border-[#33f0aa]/30 bg-[#33f0aa]/10 px-5 py-2.5 text-sm text-[#33f0aa]"
              >
                Thanks — you&apos;ll hear from us soon.
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
                  className="h-11 flex-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 text-sm text-[#e6e6e0] placeholder:text-[#5d675f] focus:border-[#33f0aa]/40 focus:outline-none focus:ring-2 focus:ring-[#33f0aa]/20"
                />
                <button
                  type="submit"
                  className="home-cta-primary inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold tracking-tight"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
