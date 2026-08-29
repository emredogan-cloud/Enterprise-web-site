import { CinematicRecommendationCarousel } from "@/components/cinematic/recommendation-carousel";
import type { CatalogItem } from "@/components/catalog/catalog-item";

import { RecommendationCard } from "./recommendation-card";

/**
 * "You might like" recommendation shelf for the cart page.
 *
 * Phase 3.F — carousel logic (arrows + scroll + edge fades) moved into
 * the shared `<CinematicRecommendationCarousel>` primitive.
 *
 * Picks are real published books passed in by the page. When the catalog
 * has nothing to recommend the shelf renders nothing at all — an empty
 * "You might like" heading over a blank rail is worse than no shelf.
 */
export function RecommendationShelf({ picks }: { picks: CatalogItem[] }) {
  if (picks.length === 0) return null;

  return (
    <section className="relative mt-24 px-6 sm:mt-28">
      {/* Section heading — centered, editorial */}
      <header className="text-center">
        <h2 className="font-serif text-[28px] font-medium leading-tight tracking-tight text-fg-hi sm:text-[34px]">
          You might like
        </h2>
        <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-emerald-bright/50 to-transparent" />
      </header>

      <div className="mt-10 lg:mx-12">
        <CinematicRecommendationCarousel arrowVariant="outset">
          {picks.map((book) => (
            <RecommendationCard key={book.id} book={book} />
          ))}
        </CinematicRecommendationCarousel>
      </div>
    </section>
  );
}
