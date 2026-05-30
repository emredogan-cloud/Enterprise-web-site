"use client";

import { useState, useTransition } from "react";

import { exportUserData } from "@/app/account/settings/actions";

/**
 * "Export my data" — calls the Server Action, receives a stringified JSON
 * payload + filename, and triggers a browser download via a temporary Blob
 * URL. No server-side file is ever materialized; nothing is ever cached.
 *
 * Phase 3.A — cinematic chrome (`.home-cta-secondary`). The temporary
 * anchor is `appendChild`/`removeChild`'d to satisfy older Firefox versions
 * that ignore a click on a detached `<a>`. `URL.revokeObjectURL` is called
 * immediately after to release the blob memory.
 */
export function ExportDataButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await exportUserData();
      if (!result.ok) {
        setError(result.error);
        return;
      }

      const blob = new Blob([result.json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-live="polite"
        className="home-cta-secondary inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold tracking-tight disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Preparing your data…" : "Export my data"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-[#ff9b9b]">
          {error}
        </p>
      )}
    </div>
  );
}
