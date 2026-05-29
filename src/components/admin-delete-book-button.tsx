"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteBook } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

/**
 * Two-step inline-confirmation delete button for the admin edit page
 * (SUB-PR 4.4).
 *
 * Why two-step inline instead of a modal:
 *   - Modal would need a dialog primitive we haven't installed yet
 *     (Radix Dialog) and the keyboard / focus management that goes with
 *     it. Inline confirmation is cheaper and accessible by default.
 *   - The "Delete" → "Confirm delete" two-click flow has the same
 *     destruction-protection property as a modal: a single misclick
 *     never destroys data.
 *
 * The book-title literal is rendered in the confirmation text so the
 * admin can see exactly what they're about to delete.
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
        // Hard delete succeeded; navigate back to the catalog table.
        // ISR invalidation inside the action has already busted /books,
        // /books/<slug>, /sitemap.xml, /authors/[slug], /categories/[slug].
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
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          disabled={pending}
        >
          Delete this book
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
      <p className="text-sm text-foreground">
        Permanently delete{" "}
        <strong className="font-medium">&ldquo;{title}&rdquo;</strong>?
      </p>
      <p className="text-xs text-muted-foreground">
        This cannot be undone. If the book has ever been purchased, the
        database will refuse the delete — archive it instead by setting the
        status to <code>archived</code>.
      </p>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={pending}
        >
          {pending ? "Deleting…" : "Yes, delete"}
        </Button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
