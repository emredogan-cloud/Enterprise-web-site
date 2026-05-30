import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Cinematic read-only star rating — emerald fill, not warm yellow.
 *
 * Phase 1.C — the canonical aggregate-rating glyph for the dark theme.
 * Same arithmetic + a11y as `<StarRating>` (warm); chrome only differs.
 * `value` is in [0, max]; renders `max` stars with the first
 * `Math.round(value)` filled.
 */
export function CinematicStarRating({
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
                ? "fill-[#33f0aa] text-emerald-bright [filter:drop-shadow(0_0_4px_rgba(51,240,170,0.5))]"
                : "fill-transparent text-white/15",
            )}
          />
        );
      })}
    </span>
  );
}
