import { CinematicStarRating } from "@/components/book-detail/cinematic-star-rating";
import type { ReviewItem } from "@/lib/db/queries/reviews";

/**
 * Cinematic per-review list — one glass card per review.
 *
 * Phase 1.C. Pure Server Component, SSG-rendered so the review text is
 * indexable (Roadmap §13). Replaces the warm-divided list with stacked
 * glass cards + cinematic typography.
 *
 * Empty-state copy matches the original behavior (most common case:
 * a freshly-published book with no reviews yet).
 */
export function CinematicReviewsList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return (
      <div className="home-glass mt-8 rounded-[20px] p-8 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/30 to-transparent"
        />
        <p className="text-sm text-[#88918a]">
          No reviews yet. Be the first to share your thoughts.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-10 space-y-4">
      {reviews.map((r) => (
        <li
          key={r.id}
          className="home-glass relative overflow-hidden rounded-[18px] p-6"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/25 to-transparent"
          />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CinematicStarRating value={r.rating} size="sm" />
              <span className="text-sm font-medium text-[#e6e6e0]">
                {r.authorName}
              </span>
            </div>
            <time
              dateTime={r.createdAt.toISOString()}
              className="text-[11px] uppercase tracking-[0.18em] text-[#88918a]"
            >
              {formatReviewDate(r.createdAt)}
            </time>
          </div>
          {r.body && (
            <p className="mt-3 text-pretty text-[15px] leading-relaxed text-[#d4d4cc]">
              {r.body}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function formatReviewDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
