import Link from "next/link";
import { Search, Sparkles } from "lucide-react";

/**
 * "Try searching for" suggestion strip beneath the main input.
 *
 * Each pill is a real link to `/search?q=<suggestion>` — clicking actually
 * performs that search. Pure Server Component; the per-pill hover lift +
 * glow runs via CSS classes.
 *
 * Suggestions come from the live catalog, and that is the whole point. They
 * used to be a hard-coded list — "Atomic Habits", "George Orwell", "Science
 * Fiction", "Mindset" — written against demo data that no longer exists.
 * Every one of the six returned nothing, so the one component whose job is
 * to show a new visitor what this store has was teaching them it has
 * nothing, and the first pill advertised a bestseller Valice Press has no
 * right to sell.
 *
 * A suggestion that returns no results is worse than no suggestion, so an
 * empty catalog renders nothing at all.
 */
export function SuggestionPills({
  suggestions,
}: {
  suggestions: readonly string[];
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mx-auto mt-6 max-w-3xl px-6 text-center">
      {/* Label */}
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
        <Sparkles
          aria-hidden
          className="h-3 w-3 text-emerald-bright"
          strokeWidth={2.2}
        />
        <span>Try searching for</span>
      </p>

      {/* Horizontal pill row */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {suggestions.map((s) => (
          <Link
            key={s}
            href={`/search?q=${encodeURIComponent(s)}`}
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-fg-mid transition-all hover:-translate-y-0.5 hover:border-emerald-bright/30 hover:bg-emerald-bright/8 hover:text-fg-hi hover:shadow-[0_8px_24px_-8px_rgba(51,240,170,0.3)]"
          >
            <Search
              aria-hidden
              className="h-3 w-3 text-fg-fade transition-colors group-hover:text-emerald-bright"
              strokeWidth={2.4}
            />
            <span>{s}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
