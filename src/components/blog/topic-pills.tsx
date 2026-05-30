"use client";

import { BookOpen, ClipboardList, type LucideIcon } from "lucide-react";

/**
 * Topic-filter pills shown beneath the hero.
 *
 * Per the brief: each pill has a category-specific icon + a count badge.
 * Pure presentational — receives current filter state + setter from
 * `<BlogShell>`. Clicking an already-active pill clears the filter
 * (back to "all topics"); clicking a different pill switches to it.
 *
 * Icons are mapped by category name; unknown categories fall back to
 * the generic clipboard. New categories can be added by extending
 * `CATEGORY_ICONS`.
 */

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Behind the Scenes": ClipboardList,
  "Reading Guides": BookOpen,
};

export interface TopicCount {
  slug: string;
  name: string;
  postCount: number;
}

export function TopicPills({
  topics,
  active,
  onChange,
}: {
  topics: TopicCount[];
  /** Active category slug, or `null` for "all". */
  active: string | null;
  onChange: (slug: string | null) => void;
}) {
  if (topics.length === 0) return null;

  return (
    <nav
      aria-label="Browse posts by topic"
      className="mt-10 flex flex-wrap items-center justify-center gap-3"
    >
      {topics.map((t) => {
        const Icon = CATEGORY_ICONS[t.name] ?? ClipboardList;
        const isActive = active === t.slug;
        return (
          <button
            key={t.slug}
            type="button"
            onClick={() => onChange(isActive ? null : t.slug)}
            aria-pressed={isActive}
            className={`group inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm transition-all ${
              isActive
                ? "border-[#33f0aa]/40 bg-[#33f0aa]/10 text-[#33f0aa] shadow-[0_0_18px_rgba(51,240,170,0.25)]"
                : "border-white/[0.08] bg-white/[0.03] text-[#a7a7a0] hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-[#e6e6e0] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]"
            }`}
          >
            <Icon
              aria-hidden
              className={`h-3.5 w-3.5 transition-colors ${
                isActive ? "text-[#33f0aa]" : "text-[#88918a] group-hover:text-[#33f0aa]"
              }`}
            />
            <span className="font-medium">{t.name}</span>
            <span
              className={`rounded-full px-1.5 text-[10px] font-semibold tabular-nums ${
                isActive
                  ? "bg-[#33f0aa]/20 text-[#33f0aa]"
                  : "bg-white/[0.05] text-[#5d675f]"
              }`}
            >
              {t.postCount}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
