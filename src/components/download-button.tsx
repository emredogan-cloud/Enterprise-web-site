"use client";

import { useState, useTransition } from "react";

import { downloadBook } from "@/app/account/library/actions";

/**
 * Download button — calls the `downloadBook` Server Action, which does
 * the server-side ownership + status check, writes a `download_logs`
 * row, then returns a short-lived signed URL. On success we
 * hard-navigate the browser to the URL; on a denied / not-ready case
 * we surface a calm inline error.
 *
 * Phase 1.E — cinematic chrome (drops the warm shadcn `<Button>`
 * dependency). The same shape ships across:
 *   - `/account/library` (Phase 0 cinematic): library tile per-book
 *     download
 *   - `/order/[id]` (Phase 1.E cinematic): post-checkout per-item
 *     download
 *
 * Variant API:
 *   - "default" (default) → emerald primary pill (`home-cta-primary`)
 *   - "secondary"         → glass secondary pill (`home-cta-secondary`)
 *
 * Size API: maps to vertical height; chrome is otherwise identical.
 */
export function DownloadButton({
  bookId,
  variant = "default",
  size = "lg",
  label = "Download",
}: {
  bookId: string;
  variant?: "default" | "secondary";
  size?: "default" | "sm" | "lg";
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await downloadBook(bookId);
      if (result.ok) {
        window.location.href = result.url;
      } else {
        setError(result.error);
      }
    });
  };

  const heightClass =
    size === "sm" ? "h-9" : size === "default" ? "h-10" : "h-11";
  const chromeClass =
    variant === "secondary" ? "home-cta-secondary" : "home-cta-primary";

  return (
    <div className="flex flex-col items-stretch gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-live="polite"
        className={`${chromeClass} ${heightClass} inline-flex items-center justify-center rounded-full px-5 text-sm font-semibold tracking-tight disabled:cursor-not-allowed disabled:opacity-70`}
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
            />
            Generating link…
          </span>
        ) : (
          label
        )}
      </button>
      {error && (
        <p
          role="alert"
          className="text-xs text-[#ff9b9b]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
