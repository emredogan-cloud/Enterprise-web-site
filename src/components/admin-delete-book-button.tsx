"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteBook } from "@/app/admin/actions";

/**
 * Two-step inline-confirmation delete button for the admin edit page.
 *
 * Phase 3.B — cinematic chrome (warm `<Button variant="destructive">`
 * dropped). Same two-step destruction-protection discipline: a single
 * misclick never destroys data.
 *
 * Failure path is the common case for purchased books:
 *   `entitlements.book_id` and `order_items.book_id` are both
 *   `onDelete: 'restrict'` (Roadmap §11 — preserve commercial paper
 *   trail). The action returns a structured error pointing the operator
 *   at archiving (`status: 'archived'`) instead of deleting.
 */
export function AdminDeleteBookButton({
  bookId,
  slug,
  title,
}: {
  bookId: string;
  slug: string;
  title: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteBook({ id: bookId, slug });
      if (result.ok) {
        // ISR invalidation in the action busts /books, /books/<slug>,
        // /sitemap.xml, /authors/[slug], /categories/[slug].
        router.push("/admin");
      } else {
        setError(result.error);
        setConfirming(false);
      }
    });
  };

  if (!confirming) {
    return (
      <div className="space-y-3">
        {error && (
          <p
            role="alert"
            className="rounded-[14px] border border-[#ff7a7a]/30 bg-[#ff7a7a]/8 px-3 py-2 text-sm text-[#ff9b9b]"
          >
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          disabled={pending}
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#ff7a7a]/30 bg-[#ff7a7a]/8 px-5 text-sm font-semibold tracking-tight text-[#ff9b9b] transition-all hover:border-[#ff7a7a]/50 hover:bg-[#ff7a7a]/12 hover:text-[#ffb0b0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete this book
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-[16px] border border-[#ff7a7a]/30 bg-[#ff7a7a]/[0.04] p-5">
      <p className="text-sm text-fg-hi">
        Permanently delete{" "}
        <strong className="font-medium">&ldquo;{title}&rdquo;</strong>?
      </p>
      <p className="text-xs leading-relaxed text-fg-mid">
        This cannot be undone. If the book has ever been purchased, the
        database will refuse the delete — archive it instead by setting the
        status to{" "}
        <code className="rounded border border-white/[0.08] bg-white/[0.04] px-1 py-0.5 text-[10px] text-[#ffce63]">
          archived
        </code>
        .
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#ff7a7a]/40 bg-[#ff7a7a]/12 px-5 text-sm font-semibold tracking-tight text-[#ffb0b0] transition-all hover:border-[#ff7a7a]/60 hover:bg-[#ff7a7a]/18 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium text-fg-mid transition-colors hover:bg-white/[0.04] hover:text-fg-hi disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
