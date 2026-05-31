import Link from "next/link";

import { AssetImage } from "@/components/cinematic/asset-image";
import type { CategorySummary } from "@/lib/db/queries/catalog";

import { RevealOnScroll } from "./reveal-on-scroll";

/**
 * "Browse by category" — up to 5 horizontal category cards.
 *
 * Phase 2.G — accepts real `CategorySummary[]` from the homepage
 * (`listAllCategories()` at SSG time). Cards now link to the actual
 * cinematic `/categories/{slug}` instead of `/books`.
 *
 * The sahte "12.4K books" count is gone — there's no per-category book
 * count exposed yet, so the card just shows the category name with a
 * subtle eyebrow. Cleaner and honest.
 *
 * Demo fallback for when the DB returns empty — same brand surface even
 * before the catalog is populated.
 */

interface CategoryCardData {
  name: string;
  href: string;
  gradient: string;
  /** Slug key for the optional genre artwork at /images/genres/{imageKey}.webp */
  imageKey: string;
}

// Deterministic gradient palette — 5 moods that cycle through the
// category list by index. Same family as the rest of the brand palette.
const CATEGORY_GRADIENTS = [
  "linear-gradient(160deg, #1a3326 0%, #0a1f14 100%), radial-gradient(circle at 30% 20%, rgba(51,240,170,0.15) 0%, transparent 60%)",
  "linear-gradient(160deg, #14292e 0%, #081116 100%), radial-gradient(circle at 70% 30%, rgba(99,180,255,0.16) 0%, transparent 60%)",
  "linear-gradient(160deg, #2c2316 0%, #14110a 100%), radial-gradient(circle at 50% 30%, rgba(255,190,90,0.16) 0%, transparent 60%)",
  "linear-gradient(160deg, #1a2336 0%, #0a0e16 100%), radial-gradient(circle at 30% 70%, rgba(160,160,255,0.14) 0%, transparent 60%)",
  "linear-gradient(160deg, #2c1f1a 0%, #1a0f0a 100%), radial-gradient(circle at 50% 50%, rgba(220,150,90,0.14) 0%, transparent 60%)",
];

const DEMO_FALLBACK: CategoryCardData[] = [
  { name: "Fiction", href: "/categories", gradient: CATEGORY_GRADIENTS[0], imageKey: "fiction" },
  { name: "Sci-Fi", href: "/categories", gradient: CATEGORY_GRADIENTS[1], imageKey: "science-fiction" },
  { name: "Growth", href: "/categories", gradient: CATEGORY_GRADIENTS[2], imageKey: "personal-growth" },
  { name: "Business", href: "/categories", gradient: CATEGORY_GRADIENTS[3], imageKey: "business" },
  { name: "History", href: "/categories", gradient: CATEGORY_GRADIENTS[4], imageKey: "history" },
];

export function CategoriesSection({
  categories = [],
}: {
  /** Real DB categories from `listAllCategories()`. Empty → demo fallback. */
  categories?: CategorySummary[];
}) {
  const cards: CategoryCardData[] =
    categories.length > 0
      ? categories.slice(0, 5).map((c, i) => ({
          name: c.name,
          href: `/categories/${c.slug}`,
          gradient: CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length],
          imageKey: c.slug,
        }))
      : DEMO_FALLBACK;

  return (
    <section className="relative px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-emerald-bright/80">
                Browse the shelves
              </p>
              <h2 className="mt-3 font-serif text-[36px] font-medium leading-tight tracking-tight text-fg-hi sm:text-[44px]">
                Browse by category
              </h2>
            </div>
            <Link
              href="/categories"
              className="text-sm font-medium text-emerald-bright underline-offset-4 hover:underline"
            >
              View all →
            </Link>
          </header>
        </RevealOnScroll>

        <RevealOnScroll
          stagger
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {cards.map((cat) => (
            <Link
              key={`${cat.name}-${cat.href}`}
              href={cat.href}
              className="home-card-hover group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.06]"
              style={{ background: cat.gradient }}
            >
              {/* Optional real genre artwork over the gradient base.
                  Missing → fallback renders nothing → gradient shows. */}
              <div aria-hidden className="absolute inset-0">
                <AssetImage
                  src={`/images/genres/${cat.imageKey}.webp`}
                  alt=""
                  fallback={null}
                  sizes="(min-width: 1024px) 20vw, 50vw"
                />
              </div>

              {/* Top emerald highlight */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
              />

              {/* Bottom dark gradient for text legibility */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-3/5"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col justify-end p-5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                  Genre
                </span>
                <h3 className="mt-2 font-serif text-2xl font-medium text-fg-hi transition-colors group-hover:text-emerald-bright">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
