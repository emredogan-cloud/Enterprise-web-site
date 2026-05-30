import { CinematicRecommendationCarousel } from "@/components/cinematic/recommendation-carousel";
import { DEMO_BOOKS } from "@/components/catalog/demo-books";

import { RecommendationCard } from "./recommendation-card";

/**
 * "You might like" recommendation shelf for the cart page.
 *
 * Phase 3.F — carousel logic (arrows + scroll + edge fades) moved into
 * the shared `<CinematicRecommendationCarousel>` primitive.
 *
 * Picks: first 8 entries from the catalog's demo set, so the showcase
 * stays consistent with what users see on the /books page.
 */
export function RecommendationShelf() {
  const picks = DEMO_BOOKS.slice(0, 8);

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
