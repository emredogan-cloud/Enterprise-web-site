"use client";

import { useEffect } from "react";

import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";

/**
 * Global route-segment error boundary — backstops anything that slips
 * past the per-route try/catch guards (e.g. an unexpected throw during
 * render).
 *
 * Required to be a Client Component by the Next.js `error.tsx` contract.
 *
 * Phase 3.C — cinematic rewrite. Same logic (console.error mirror + dev
 * pre + reset button); only the chrome changed. Wraps itself in the
 * cinematic shell so a render failure stays on-brand.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Mirror to the browser console so devs see the underlying issue in
    // local dev (and so production observability has a hook to wire to).
    console.error("[error.tsx] route segment failed:", error);
  }, [error]);

  return (
    <div className="cinematic-root">
      <CinematicHeader />

      <main className="relative z-10 mx-auto max-w-2xl px-4 py-24 sm:px-6">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#ff9b9b]">
            Something went wrong
          </p>

          {/* Diamond ornament — same family, warm-red tinted for error state */}
          <div className="relative mt-4 flex h-6 w-6 items-center justify-center">
            <div
              aria-hidden
              className="absolute h-6 w-6 rounded-full opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(255, 154, 154, 0.6) 0%, transparent 70%)",
              }}
            />
            <span
              aria-hidden
              className="block h-2 w-2 rounded-[1px] bg-[#ff9b9b]"
              style={{ transform: "rotate(45deg)" }}
            />
          </div>

          <h1 className="mt-6 font-serif text-[32px] font-medium leading-tight text-fg-hi sm:text-[40px]">
            We hit an unexpected issue
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-fg-mid sm:text-base">
            The server returned an error rendering this page. In local
            development this is usually a missing environment variable —
            check the dev console for the underlying message.
          </p>

          {process.env.NODE_ENV !== "production" && error.message && (
            <pre className="mt-8 w-full max-w-lg overflow-x-auto rounded-[14px] border border-dashed border-white/[0.1] bg-white/[0.02] p-4 text-left font-mono text-xs text-fg-mid">
              {error.message}
            </pre>
          )}

          <div className="mt-8">
            <button
              type="button"
              onClick={reset}
              className="home-cta-primary inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-semibold tracking-tight"
            >
              Try again
            </button>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
