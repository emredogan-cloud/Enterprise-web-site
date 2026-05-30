import { RevealOnScroll } from "@/components/home/reveal-on-scroll";

import { CategoryCard, type CategoryCardData } from "./category-card";

/**
 * Genre discovery grid — the main attraction. A 2×5 gallery on desktop that
 * collapses to 3-up (tablet) and 2-up (mobile). Cards reveal with an 80ms
 * stagger via the shared `<RevealOnScroll stagger>` (IntersectionObserver +
 * CSS — the ecosystem's motion system, no Framer Motion).
 *
 * Pure presentational — the page decides whether `items` are real categories
 * (→ `/categories/[slug]`) or the demo worlds (→ `/search?q=`).
 */
export function GenreGrid({ items }: { items: CategoryCardData[] }) {
  return (
    <RevealOnScroll
      stagger
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5"
    >
      {items.map((item) => (
        <CategoryCard key={item.key} item={item} />
      ))}
    </RevealOnScroll>
  );
}
