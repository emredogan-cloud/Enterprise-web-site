import Link from "next/link";
import { Search, Sparkles } from "lucide-react";

/**
 * "Try searching for" suggestion strip beneath the main input.
 *
 * Each pill is a real link to `/search?q=<suggestion>` — clicking
 * actually performs that search. Pure Server Component; the per-pill
 * hover lift + glow runs via CSS classes.
 *
 * Suggestions are pre-curated picks that exist in our demo data so
 * they return real results when the FTS query runs (or, when no real
 * catalog entries match, surface the demo placeholder still gracefully).
 */
export function SuggestionPills() {
  const suggestions = [
    "Atomic Habits",
    "George Orwell",
    "Science Fiction",
    "Personal Growth",
    "Mindset",
    "History",
  ];

  return (
    <div className="mx-auto mt-6 max-w-3xl px-6 text-center">
      {/* Label */}
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#88918a]">
        <Sparkles
          aria-hidden
          className="h-3 w-3 text-[#33f0aa]"
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
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-[#a7a7a0] transition-all hover:-translate-y-0.5 hover:border-[#33f0aa]/30 hover:bg-[#33f0aa]/8 hover:text-[#e6e6e0] hover:shadow-[0_8px_24px_-8px_rgba(51,240,170,0.3)]"
          >
            <Search
              aria-hidden
              className="h-3 w-3 text-[#5d675f] transition-colors group-hover:text-[#33f0aa]"
              strokeWidth={2.4}
            />
            <span>{s}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
