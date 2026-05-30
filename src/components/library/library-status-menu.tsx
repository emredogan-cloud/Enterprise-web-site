"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { updateReadStatus } from "@/app/account/library/actions";
import type { ReadStatus } from "@/lib/db/queries/account";

/**
 * Per-tile read-status menu — a small inline dropdown that flips the
 * entitlement's `readStatus` via the `updateReadStatus` server action.
 *
 * Phase 2.B. Closed-form dropdown (no overlay portal — keeps the DOM
 * cheap inside a long library grid). Tab + Esc + click-outside dismiss.
 *
 * Optimistic UI: the new status is reflected immediately in the local
 * state; the server action runs in a transition. On failure, the local
 * state reverts and a small inline error briefly shows.
 */

const OPTIONS: ReadonlyArray<{ value: ReadStatus; label: string }> = [
  { value: "not_started", label: "Not started" },
  { value: "reading", label: "Reading" },
  { value: "finished", label: "Finished" },
];

export function LibraryStatusMenu({
  bookId,
  initialStatus,
}: {
  bookId: string;
  initialStatus: ReadStatus;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ReadStatus>(initialStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Click-outside + Esc dismiss
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (next: ReadStatus) => {
    setOpen(false);
    if (next === current) return;
    const previous = current;
    setCurrent(next); // optimistic
    setError(null);
    startTransition(async () => {
      const result = await updateReadStatus(bookId, next);
      if (!result.ok) {
        setCurrent(previous); // revert
        setError(result.error);
        // Clear the error after a short pause so the UI stays calm.
        window.setTimeout(() => setError(null), 4000);
      }
    });
  };

  const currentLabel =
    OPTIONS.find((o) => o.value === current)?.label ?? "Status";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] transition-all ${
          current === "reading"
            ? "border-[#33f0aa]/40 bg-[#33f0aa]/10 text-[#33f0aa]"
            : current === "finished"
              ? "border-white/[0.12] bg-white/[0.04] text-[#a7a7a0]"
              : "border-white/[0.08] bg-white/[0.02] text-[#88918a] hover:text-[#a7a7a0]"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span>{currentLabel}</span>
        <ChevronDown aria-hidden className="h-3 w-3" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-9 z-30 w-40 overflow-hidden rounded-[14px] border border-white/[0.1] bg-[#0a1410]/95 p-1 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.8)] backdrop-blur-md"
        >
          {OPTIONS.map((opt) => {
            const isActive = opt.value === current;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => pick(opt.value)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                    isActive
                      ? "bg-[#33f0aa]/10 text-[#33f0aa]"
                      : "text-[#a7a7a0] hover:bg-white/[0.04] hover:text-[#e6e6e0]"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isActive && <Check aria-hidden className="h-3 w-3" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p
          role="alert"
          className="absolute right-0 top-9 z-20 mt-1 rounded-md border border-[#ff6a6a]/30 bg-[#ff6a6a]/5 px-2 py-1 text-[10px] text-[#ff9b9b]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
