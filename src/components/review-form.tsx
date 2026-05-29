"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { Star } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { submitReview } from "@/app/books/[slug]/actions";
import { cn } from "@/lib/utils";

/**
 * Review submission form for the book detail page.
 *
 * SSG-friendly: this Client Component is mounted inside the `● SSG`
 * `/books/[slug]` page; embedding a Client Component does NOT promote
 * its parent to dynamic. Only the form hydrates on the client.
 *
 * Two-layer Clerk-safety pattern:
 *   1. Module-level `CLERK_ENABLED` const — `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
 *      is inlined by Next.js at build time, so this is a *static* branch.
 *      When Clerk isn't provisioned, the inner component (which calls
 *      `useUser`) is never rendered — no hook context errors at runtime.
 *   2. The Server Action (`submitReview`) is the authoritative gate.
 *      Anything that reaches this UI without auth/entitlement just sees
 *      an inline error from the action; nothing on the page assumes
 *      client-side state is trustworthy.
 *
 * a11y notes:
 *   - The rating buttons expose `aria-pressed` so screen readers announce
 *     the current selection.
 *   - Success and error regions use `role="status"` / `role="alert"` so
 *     the result of submission is announced without a focus shift.
 */

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const MAX_BODY_LENGTH = 4000;

interface ReviewFormProps {
  slug: string;
  bookId: string;
}

export function ReviewForm(props: ReviewFormProps) {
  if (!CLERK_ENABLED) {
    return (
      <p className="mt-8 rounded-md border border-dashed border-border px-6 py-8 text-center text-sm text-muted-foreground">
        Reviews aren&apos;t available right now — sign-in is not configured for
        this environment.
      </p>
    );
  }
  return <ReviewFormAuthed {...props} />;
}

/**
 * Inner component — assumes Clerk is mounted, so `useUser` is safe.
 * Never rendered when `CLERK_ENABLED` is false (build-time guard above).
 */
function ReviewFormAuthed({ slug, bookId }: ReviewFormProps) {
  const { isLoaded, isSignedIn } = useUser();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  // ---- Loading / signed-out fast paths ------------------------------------
  if (!isLoaded) {
    return (
      <div
        className="mt-8 h-32 animate-pulse rounded-md border border-border bg-muted/40"
        aria-hidden
      />
    );
  }
  if (!isSignedIn) {
    return (
      <div className="mt-8 rounded-md border border-dashed border-border px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Sign in to share your thoughts on this book.
        </p>
        <div className="mt-4">
          <SignInButton mode="modal">
            <Button variant="outline" size="sm">
              Sign in to review
            </Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // ---- Submission handler --------------------------------------------------
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please choose a rating before submitting.");
      setSuccess(false);
      return;
    }
    startTransition(async () => {
      const result = await submitReview({
        slug,
        bookId,
        rating,
        body: body.trim() ? body : null,
      });
      if (result.ok) {
        setError(null);
        setSuccess(true);
      } else {
        setError(result.error);
        setSuccess(false);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <fieldset disabled={pending}>
        <legend className="text-sm font-medium text-foreground">
          Your rating
        </legend>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              aria-pressed={rating === n}
              onClick={() => setRating(n)}
              className="rounded-md p-1 transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <Star
                aria-hidden
                className={cn(
                  "h-7 w-7 transition-colors",
                  n <= rating
                    ? "fill-primary text-primary"
                    : "fill-transparent text-muted-foreground/40",
                )}
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="review-body"
          className="text-sm font-medium text-foreground"
        >
          Your review{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        </label>
        <textarea
          id="review-body"
          name="body"
          rows={4}
          maxLength={MAX_BODY_LENGTH}
          value={body}
          onChange={(e) => setBody(e.currentTarget.value)}
          disabled={pending}
          placeholder="Share what you thought — what worked, what didn't, who you'd recommend it to…"
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {body.length.toLocaleString()} / {MAX_BODY_LENGTH.toLocaleString()}{" "}
          characters
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground"
        >
          Thanks — your review has been published. It will appear here on the
          next page refresh.
        </p>
      )}

      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Submitting…" : success ? "Update review" : "Submit review"}
      </Button>
    </form>
  );
}
