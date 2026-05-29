"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { downloadBook } from "@/app/account/library/actions";

/**
 * Download button — calls the `downloadBook` Server Action, which does the
 * server-side ownership + status check, writes a `download_logs` row, then
 * returns a short-lived signed URL. On success we hard-navigate the browser
 * to the URL; on a denied / not-ready case we surface a calm inline error.
 *
 * Returning the URL (rather than `redirect()`-ing inside the action) gives
 * us symmetric error handling — `{ ok: false, error }` flows into the same
 * UI path as success. The user's experience is identical: click → file.
 */
export function DownloadButton({
  bookId,
  variant = "default",
  size = "lg",
  label = "Download",
}: {
  bookId: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
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

  return (
    <div className="flex flex-col items-stretch gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={pending}
        aria-live="polite"
      >
        {pending ? "Generating link…" : label}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
