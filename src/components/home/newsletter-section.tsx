"use client";

import { useState, type FormEvent } from "react";

import { RevealOnScroll } from "./reveal-on-scroll";

/**
 * "Stay in the loop" — glass CTA with email input.
 *
 * Client Component because the form has local state. The actual newsletter
 * subscription endpoint is not wired yet (Beehiiv / ConvertKit decision
 * is part of the STRATEJI_VE_KITAP_FIKIRLERI roadmap) — for now we just
 * accept the email and show a success state, validating the UX.
 */
export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: POST to /api/newsletter (lands in a follow-up SUB-PR once
    // a provider is chosen — see STRATEJI_VE_KITAP_FIKIRLERI §9).
    setStatus("success");
  };

  return (
    <section className="relative px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <RevealOnScroll>
          <div className="home-glass relative overflow-hidden rounded-3xl px-8 py-14 text-center sm:px-14 sm:py-20">
            {/* Bloom backdrop */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(22, 199, 132, 0.16) 0%, transparent 60%)",
              }}
            />

            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#33f0aa]/80">
              Stay in the loop
            </p>
            <h2 className="mt-4 font-serif text-[36px] font-medium leading-tight tracking-tight text-[#e6e6e0] sm:text-[44px]">
              New books, every Tuesday
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[#a7a7a0]">
              One short email when we add something we love. No discount spam,
              no marketing chrome — just the next book that&apos;s worth your
              time.
            </p>

            {status === "success" ? (
              <p
                role="status"
                className="mx-auto mt-10 inline-block rounded-full border border-[#33f0aa]/30 bg-[#33f0aa]/10 px-5 py-2.5 text-sm text-[#33f0aa]"
              >
                Thanks — you&apos;ll hear from us soon.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  className="h-12 flex-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 text-sm text-[#e6e6e0] placeholder:text-[#5d675f] focus:border-[#33f0aa]/40 focus:outline-none focus:ring-2 focus:ring-[#33f0aa]/20"
                />
                <button
                  type="submit"
                  className="home-cta-primary inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-semibold tracking-tight"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
