"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Global route-segment error boundary — backstops anything that slips past
 * the per-route try/catch guards (e.g. an unexpected throw during render).
 *
 * Required to be a Client Component by the Next.js `error.tsx` contract.
 * In dev we also surface the raw message; in production we keep it terse
 * so we never leak internal detail to end users.
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
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Something went wrong
      </p>
      <h1 className="mt-4 text-balance font-serif text-3xl font-medium leading-tight text-foreground">
        We hit an unexpected issue
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
        The server returned an error rendering this page. In local development
        this is usually a missing environment variable — check the dev console
        for the underlying message.
      </p>

      {process.env.NODE_ENV !== "production" && error.message && (
        <pre className="mx-auto mt-6 max-w-lg overflow-x-auto rounded-md border border-dashed border-border bg-muted/30 p-4 text-left font-mono text-xs text-muted-foreground">
          {error.message}
        </pre>
      )}

      <div className="mt-8">
        <Button onClick={reset} size="lg">
          Try again
        </Button>
      </div>
    </main>
  );
}
