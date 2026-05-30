import { CinematicHero } from "@/components/cinematic/cinematic-hero";

/**
 * Blog editorial hero — Phase 3.E migrated to the shared
 * `<CinematicHero>`.
 *
 * Eyebrow + diamond + serif "Notes from the **bookstore**" headline
 * with the last word in emerald gradient. Two-line muted subtitle. Dust
 * on for the editorial atmosphere.
 */
export function BlogHero() {
  return (
    <CinematicHero
      eyebrow="Blog"
      headlineHead="Notes from the"
      headlineTail="bookstore"
      size="lg"
      align="center"
      dust
      subtitle={
        <p>
          Decisions behind the storefront, reading guides, and the
          occasional essay. Updated when there is something worth
          saying.
        </p>
      }
    />
  );
}
