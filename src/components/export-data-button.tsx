"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { exportUserData } from "@/app/account/settings/actions";

/**
 * "Export my data" — calls the Server Action, receives a stringified JSON
 * payload + filename, and triggers a browser download via a temporary Blob
 * URL. No server-side file is ever materialized; nothing is ever cached.
 *
 * The temporary anchor is `appendChild`/`removeChild`'d to satisfy older
 * Firefox versions that ignore a click on a detached `<a>`. `URL.revokeObjectURL`
 * is called immediately after to release the blob memory.
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
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={pending}
        aria-live="polite"
      >
        {pending ? "Preparing your data…" : "Export my data"}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
