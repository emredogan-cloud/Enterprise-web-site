"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteUserAccount } from "@/app/account/settings/actions";

/**
 * Two-stage delete UX — *the standard pattern for any destructive action*:
 *
 *   Stage 1: a single "Delete my account…" button. Clicking expands the
 *            confirmation panel; no destructive call has fired.
 *
 *   Stage 2: an in-place panel that requires typing `DELETE` to enable the
 *            confirm action. Cancel restores the initial state with no
 *            side effects. Confirm calls the Server Action; on success
 *            we redirect to `/`. On partial-success (local data
 *            anonymized but Clerk deletion failed), we still redirect —
 *            the GDPR-required local-data work is done — but inform the
 *            user so they can finish via their identity provider.
 *
 * The form is deliberately ugly-on-purpose (destructive token, dashed
 * border): we want this surface to *not* feel like an everyday CTA.
 */
export function DeleteAccountButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [stage, setStage] = useState<"idle" | "confirm">("idle");
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStage("idle");
    setTyped("");
    setError(null);
  };

  const handleDelete = () => {
    if (typed !== "DELETE") return;
    setError(null);
    startTransition(async () => {
      const result = await deleteUserAccount();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (!result.clerkDeleted) {
        // Local data is anonymized; Clerk still has the identity. Surface
        // a brief note before the redirect, then continue.
        alert(
          "Your data was removed from this site. To finish removing your sign-in identity, please use your auth provider's account-deletion flow.",
        );
      }
      router.push("/");
    });
  };

  if (stage === "idle") {
    return (
      <Button
        type="button"
        variant="destructive"
        onClick={() => setStage("confirm")}
      >
        Delete my account…
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-destructive bg-destructive/5 p-4">
      <p className="text-sm font-medium text-foreground">
        This will remove your personal data from this site.
      </p>
      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
        <li>
          • <strong>Deleted:</strong> reading progress, reviews, name, email.
        </li>
        <li>
          • <strong>Retained for tax / compliance (§11):</strong> orders, receipts, entitlements — stored under an anonymized account row.
        </li>
        <li>
          • <strong>Identity:</strong> your Clerk sign-in is best-effort
          removed too; if it cannot be, you can finish removal directly in Clerk.
        </li>
      </ul>
      <p className="mt-3 text-xs text-foreground">
        Type{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
          DELETE
        </code>{" "}
        to confirm.
      </p>
      <input
        type="text"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        className="mt-2 block h-9 w-40 rounded-md border border-input bg-background px-3 font-mono text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60"
        aria-label="Type DELETE to confirm"
      />
      <div className="mt-4 flex gap-2">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={pending || typed !== "DELETE"}
        >
          {pending ? "Deleting…" : "Confirm delete"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={reset}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
