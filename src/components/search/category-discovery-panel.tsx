import Link from "next/link";
import { FolderOpen } from "lucide-react";

import { categoryLook } from "@/components/categories/category-icons";

/**
 * Right panel — Browse by category.
 *
 * Per the brief: 2×4 grid; each card uses a **centered vertical stack**
 * (icon TOP, title + count CENTERED BELOW with generous gap).
 *
 * Categories come from the database. This panel used to render the eight
 * hard-coded `DEMO_GENRES` — "Fiction · 12,540 books", "Science Fiction ·
 * 7,932 books" and so on, some 44,000 titles in total — beside a catalog of
 * eight. Every card also linked to a `/categories/<slug>` that did not
 * exist. Both are gone; the counts shown now are counted.
 */
export function CategoryDiscoveryPanel({
  categories,
}: {
  categories: ReadonlyArray<{ slug: string; name: string; bookCount: number }>;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="home-glass relative overflow-hidden rounded-[28px] p-6 sm:p-7">
      {/* Top emerald edge line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
      />

      {/* Header */}
      <header className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-deep/30 bg-emerald-deep/10 text-emerald-bright shadow-[0_0_12px_-2px_rgba(51,240,170,0.4)]">
          <FolderOpen aria-hidden className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        <h2 className="font-serif text-[18px] font-medium text-fg-hi">
          Browse by category
        </h2>
      </header>

      {/* 2×4 grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}`}
            className="group flex flex-col items-center justify-start gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-4 text-center transition-all hover:-translate-y-1 hover:border-emerald-bright/30 hover:bg-white/[0.04] hover:shadow-[0_18px_32px_-16px_rgba(0,0,0,0.6),0_0_22px_-8px_rgba(51,240,170,0.4)]"
          >
            {/* The category's own glyph — no invented "genre world" scene */}
            <CategoryGlyph slug={c.slug} />

            {/* Title + count CENTERED below, generous gap above */}
            <div className="mt-1">
              <h3 className="font-serif text-[13px] font-medium leading-tight text-fg-hi transition-colors group-hover:text-emerald-bright sm:text-sm">
                {c.name}
              </h3>
              <p className="mt-1 text-[10px] tabular-nums text-fg-soft">
                {c.bookCount} {c.bookCount === 1 ? "book" : "books"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CategoryGlyph({ slug }: { slug: string }) {
  const { icon: Icon, tint } = categoryLook(slug);
  return (
    <span
      className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/[0.08] text-emerald-bright"
      style={{ background: `radial-gradient(circle at 50% 35%, ${tint} 0%, rgba(7,17,11,0.9) 70%)` }}
    >
      <Icon aria-hidden className="h-7 w-7" strokeWidth={1.6} />
    </span>
  );
}
