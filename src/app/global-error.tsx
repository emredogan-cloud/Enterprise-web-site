"use client";

import { useEffect } from "react";

/**
 * GLOBAL error boundary — last-resort UI for failures in the ROOT layout.
 *
 * Next.js error.tsx files only catch errors thrown *inside* their segment;
 * they cannot catch a throw from the root layout itself (because the root
 * layout is what would otherwise wrap them). This file is the only thing
 * Next.js will render when `app/layout.tsx` throws — so it must render its
 * own `<html>` and `<body>`, and it must NOT depend on anything the failed
 * layout might have provided (fonts, globals.css, providers, …).
 *
 * Everything is inline-styled and uses system fonts so this UI is visible
 * even in catastrophic failure modes.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error.tsx] root layout failed:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: "6rem 1.5rem",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          background: "#faf8f3",
          color: "#1a1815",
          minHeight: "100vh",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        <main style={{ maxWidth: "32rem", margin: "0 auto" }}>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#7a716a",
              fontWeight: 500,
              margin: 0,
            }}
          >
            Something went wrong
          </p>
          <h1
            style={{
              marginTop: "1rem",
              marginBottom: 0,
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
              fontSize: "1.875rem",
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          >
            The site failed to load
          </h1>
          <p style={{ marginTop: "1rem", color: "#7a716a" }}>
            The root layout could not render. This is usually a missing
            environment variable — check the server logs for the underlying
            message.
          </p>
          {process.env.NODE_ENV !== "production" && error.message && (
            <pre
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                borderRadius: "0.375rem",
                border: "1px dashed #d1c9bf",
                background: "rgba(0,0,0,0.03)",
                color: "#5a534c",
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace',
                fontSize: "0.75rem",
                textAlign: "left",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.625rem 1.5rem",
              borderRadius: "0.375rem",
              background: "#264e2f",
              color: "#faf8f3",
              border: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
