import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Read-only star rating display.
 *
 * Used on:
 *   - the aggregate headline at the top of the reviews section
 *     ("4.5 ★★★★☆ · 23 reviews")
 *   - each individual `ReviewsList` item
 *
 * `value` is a number in the closed range [0, max]; rendered as `max`
 * `<Star>` glyphs with the first `Math.round(value)` filled.
 *
 * a11y: the visible glyphs are `aria-hidden`; the whole component
 * exposes a single `aria-label` like "4 out of 5 stars" so screen
 * readers don't enumerate every star individually.
 */
export function StarRating({
  value,
  max = 5,
  size = "md",
  className,
}: {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const filled = Math.round(Math.max(0, Math.min(value, max)));
  const sizeClass =
    size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <span
      role="img"
      aria-label={`${value.toFixed(1)} out of ${max} stars`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {Array.from({ length: max }, (_, i) => {
        const isFilled = i < filled;
        return (
          <Star
            key={i}
            aria-hidden
            className={cn(
              sizeClass,
              isFilled
                ? "fill-primary text-primary"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        );
      })}
    </span>
  );
}
