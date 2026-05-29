import { StarRating } from "@/components/star-rating";
import type { ReviewItem } from "@/lib/db/queries/reviews";

/**
 * Renders the list of approved reviews for a book.
 *
 * Pure Server Component — runs at SSG/ISR time on the `/books/[slug]`
 * route. The rendered list ships inside the static HTML payload so
 * crawlers see the review content (Roadmap §13 — the "paywall content
 * problem" applies to reviews too: hidden behind hydration = invisible to
 * search engines).
 *
 * Empty-state copy is deliberately written for the most common case:
 * a freshly-published book that hasn't accumulated reviews yet.
 */
export function ReviewsList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-muted-foreground">
        No reviews yet. Be the first to share your thoughts.
      </p>
    );
  }

  return (
    <ul className="mt-10 divide-y divide-border border-t border-border">
      {reviews.map((r) => (
        <li key={r.id} className="py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <StarRating value={r.rating} size="sm" />
              <span className="text-sm font-medium text-foreground">
                {r.authorName}
              </span>
            </div>
            <time
              dateTime={r.createdAt.toISOString()}
              className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
            >
              {formatReviewDate(r.createdAt)}
            </time>
          </div>
          {r.body && (
            <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/90">
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
