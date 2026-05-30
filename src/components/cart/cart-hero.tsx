import { CinematicHero } from "@/components/cinematic/cinematic-hero";

/**
 * Cart hero — Phase 3.E migrated to the shared `<CinematicHero>`.
 *
 *   - `variant="empty"`     → "Your cart is empty"
 *   - `variant="with-items"`→ "{n} {book/books} ready" (n in emerald)
 *
 * Was ~125 lines of duplicated eyebrow + diamond + dust + headline JSX;
 * now ~30 lines of declarative composition.
 */
export function CartHero({
  variant,
  itemCount,
}: {
  variant: "empty" | "with-items";
  /** Only consulted when variant === "with-items". */
  itemCount?: number;
}) {
  if (variant === "empty") {
    return (
      <CinematicHero
        eyebrow="Your cart"
        headlineHead="Your cart is"
        headlineTail="empty"
        size="lg"
        align="center"
        dust
      />
    );
  }

  const count = itemCount ?? 0;
  return (
    <CinematicHero
      eyebrow="Your cart"
      headlineHead=""
      headlineTail={String(count)}
      size="lg"
      align="center"
      dust
      subtitle={
        <p>
          <span className="font-serif text-[20px] italic text-fg-mid">
            {count === 1 ? "book" : "books"} ready
          </span>
        </p>
      }
    />
  );
}
