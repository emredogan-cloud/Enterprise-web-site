"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteUserAccount } from "@/app/account/settings/actions";

/**
 * Two-stage delete UX — the standard pattern for any destructive action.
 *
 * Phase 3.A — cinematic chrome. The same two-stage discipline as before:
 *
 *   Stage 1: a single "Delete my account…" pill. Clicking expands the
 *            confirmation panel; no destructive call has fired.
 *
 *   Stage 2: an in-place panel that requires typing `DELETE` to enable
 *            the confirm action. Cancel restores the initial state with
 *            no side effects. Confirm calls the Server Action; on
 *            success we redirect to `/`. Partial-success (local data
 *            anonymized but Clerk deletion failed) still redirects —
 *            the GDPR-required local-data work is done — but informs
 *            the user so they can finish via their identity provider.
 *
 * Tones are deliberately calm-but-warning — a soft red on glass — so the
 * surface reads as a serious choice without screaming. The dashed
 * `border-[#ff7a7a]/30` border is the canonical "destructive panel" look
 * inside the cinematic theme.
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
      <button
        type="button"
        onClick={() => setStage("confirm")}
        className="inline-flex h-10 items-center justify-center rounded-full border border-[#ff7a7a]/30 bg-[#ff7a7a]/8 px-5 text-sm font-semibold tracking-tight text-[#ff9b9b] transition-all hover:border-[#ff7a7a]/50 hover:bg-[#ff7a7a]/12 hover:text-[#ffb0b0]"
      >
        Delete my account…
      </button>
    );
  }

  return (
    <div className="rounded-[16px] border border-dashed border-[#ff7a7a]/30 bg-[#ff7a7a]/[0.04] p-5">
      <p className="text-sm font-medium text-fg-hi">
        This will remove your personal data from this site.
      </p>
      <ul className="mt-3 space-y-1.5 text-xs text-fg-mid">
        <li>
          <span className="text-[#ff9b9b]">•</span>{" "}
          <strong className="text-fg-hi">Deleted:</strong> reading
          progress, reviews, name, email.
        </li>
        <li>
          <span className="text-[#ff9b9b]">•</span>{" "}
          <strong className="text-fg-hi">
            Retained for tax / compliance:
          </strong>{" "}
          orders, receipts, entitlements — stored under an anonymized
          account row.
        </li>
        <li>
          <span className="text-[#ff9b9b]">•</span>{" "}
          <strong className="text-fg-hi">Identity:</strong> your
          sign-in is best-effort removed too; if it cannot be, you can
          finish removal directly in your auth provider.
        </li>
      </ul>
      <p className="mt-4 text-xs text-fg-mid">
        Type{" "}
        <code className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-[#ff9b9b]">
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
        className="mt-2 block h-9 w-40 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 font-mono text-sm text-fg-hi focus-visible:border-[#ff7a7a]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a7a]/20"
        aria-label="Type DELETE to confirm"
      />
      <div className="mt-5 flex gap-2.5">
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending || typed !== "DELETE"}
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#ff7a7a]/40 bg-[#ff7a7a]/12 px-5 text-sm font-semibold tracking-tight text-[#ffb0b0] transition-all hover:border-[#ff7a7a]/60 hover:bg-[#ff7a7a]/18 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Deleting…" : "Confirm delete"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={pending}
          className="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium text-fg-mid transition-colors hover:bg-white/[0.04] hover:text-fg-hi disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-[#ff9b9b]">
          {error}
        </p>
      )}
    </div>
  );
}
