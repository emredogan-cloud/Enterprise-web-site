"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { Star } from "lucide-react";
import { useState, useTransition } from "react";

import { submitReview } from "@/app/books/[slug]/actions";
import { cn } from "@/lib/utils";

/**
 * Cinematic write-a-review form for `/books/[slug]`.
 *
 * Phase 1.C. Same server-action contract as the warm `<ReviewForm>`:
 *   - Two-layer Clerk safety (module-level constant + auth-guarded
 *     inner component — no useUser on unprovisioned environments)
 *   - Server-action (`submitReview`) is the authoritative entitlement
 *     gate; client UI never trusts its own state
 *   - Same a11y: aria-pressed on star buttons, role=alert / role=status
 *
 * Chrome is fully cinematic: glass panel, emerald stars, `.home-cta-primary`
 * submit, dark inputs.
 */

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const MAX_BODY_LENGTH = 4000;

interface CinematicReviewFormProps {
  slug: string;
  bookId: string;
}

export function CinematicReviewForm(props: CinematicReviewFormProps) {
  if (!CLERK_ENABLED) {
    return (
      <div className="home-glass mt-8 rounded-[20px] p-6 text-center">
        <p className="text-sm text-[#88918a]">
          Reviews aren&apos;t available right now — sign-in is not
          configured for this environment.
        </p>
      </div>
    );
  }
  return <CinematicReviewFormAuthed {...props} />;
}

function CinematicReviewFormAuthed({
  slug,
  bookId,
}: CinematicReviewFormProps) {
  const { isLoaded, isSignedIn } = useUser();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!isLoaded) {
    return (
      <div
        className="mt-8 h-32 animate-pulse rounded-[20px] border border-white/[0.06] bg-white/[0.02]"
        aria-hidden
      />
    );
  }
  if (!isSignedIn) {
    return (
      <div className="home-glass mt-8 rounded-[20px] p-8 text-center">
        <p className="text-sm text-[#a7a7a0]">
          Sign in to share your thoughts on this book.
        </p>
        <div className="mt-5">
          <SignInButton mode="modal">
            <button
              type="button"
              className="home-cta-secondary inline-flex h-10 items-center justify-center rounded-full px-5 text-xs font-semibold tracking-tight"
            >
              Sign in to review
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

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
    <form
      onSubmit={handleSubmit}
      className="home-glass mt-8 space-y-5 rounded-[20px] p-6 sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/35 to-transparent"
      />
      <fieldset disabled={pending} className="space-y-3">
        <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#88918a]">
          Your rating
        </legend>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              aria-pressed={rating === n}
              onClick={() => setRating(n)}
              className="rounded-md p-1 transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33f0aa]/40"
            >
              <Star
                aria-hidden
                className={cn(
                  "h-7 w-7 transition-colors",
                  n <= rating
                    ? "fill-[#33f0aa] text-[#33f0aa] [filter:drop-shadow(0_0_6px_rgba(51,240,170,0.55))]"
                    : "fill-transparent text-white/15",
                )}
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="review-body"
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#88918a]"
        >
          Your review{" "}
          <span className="text-[10px] font-normal lowercase tracking-normal text-[#5d675f]">
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
          className="mt-2 w-full rounded-[14px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-[#e6e6e0] placeholder:text-[#5d675f] focus-visible:border-[#33f0aa]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33f0aa]/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <p className="mt-2 text-[11px] text-[#5d675f]">
          {body.length.toLocaleString()} / {MAX_BODY_LENGTH.toLocaleString()}{" "}
          characters
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-[14px] border border-[#ff6a6a]/30 bg-[#ff6a6a]/5 px-4 py-3 text-sm text-[#ff9b9b]"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className="rounded-[14px] border border-[#33f0aa]/30 bg-[#33f0aa]/5 px-4 py-3 text-sm text-[#33f0aa]"
        >
          Thanks — your review has been published. It will appear on the next
          page refresh.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="home-cta-primary inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold tracking-tight disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Submitting…" : success ? "Update review" : "Submit review"}
      </button>
    </form>
  );
}
