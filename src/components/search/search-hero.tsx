import { CinematicHero } from "@/components/cinematic/cinematic-hero";

/**
 * Search hero — Phase 3.E migrated to the shared `<CinematicHero>`.
 *
 * Centered eyebrow + diamond + serif "Search the **catalog**" with the
 * last word in emerald. Dust on. No subtitle — the input below carries
 * the next intent.
 */
export function SearchHero() {
  return (
    <CinematicHero
      eyebrow="Search"
      headlineHead="Search the"
      headlineTail="catalog"
      size="lg"
      align="center"
      dust
    />
  );
}
