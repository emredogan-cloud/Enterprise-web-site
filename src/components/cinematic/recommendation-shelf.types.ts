/**
 * <RecommendationShelf> — shared interface (Phase 0.H planning artifact).
 *
 * Decision record for the Phase 3.F dedupe. Audit §6.10 flagged that
 * `cart/recommendation-shelf.tsx` and `library/library-recommendation-shelf.tsx`
 * are ~85% identical: same horizontal carousel, same arrow controls, same
 * hidden-scrollbar (`.cart-shelf-track`), same `<RecommendationCard>` child.
 *
 * Phase 0 ships the **interface** so:
 *   1. New consumers (e.g. `/books/[slug]` "Related books" in Phase 1.C,
 *      `/order/[id]` "Continue your library" in Phase 1.E) can target this
 *      shape from day one instead of cloning a third nearly-identical shelf.
 *   2. Phase 3.F's implementation work is a *migration*, not a *design*.
 *
 * NO RUNTIME EXPORT from this file. It's intentionally a type-only module:
 * the shared component itself doesn't exist yet (lands in Phase 3.F).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Migration plan (executed in Phase 3.F)
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   1. Create `src/components/cinematic/recommendation-shelf.tsx` that
 *      implements `RecommendationShelfProps` below.
 *   2. Move `RecommendationCard` from `cart/` to `cinematic/` (it's
 *      already pure visual — no cart-specific imports).
 *   3. Rewrite `cart/recommendation-shelf.tsx` as a thin wrapper that
 *      passes the cart's recommendation list (`getRecommendedBooks()`)
 *      through.
 *   4. Rewrite `library/library-recommendation-shelf.tsx` the same way.
 *   5. Delete the duplicated arrow-button + carousel-track JSX from both.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Open questions resolved up-front
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   Q: Should the shelf own the data fetch, or be presentational?
 *   A: Presentational. The caller passes `items` (already fetched by the
 *      server component above). Keeps the shelf SSR-friendly and decouples
 *      it from `cart/actions` vs `library/queries`.
 *
 *   Q: Should the card variant be configurable?
 *   A: No. `<RecommendationCard>` always renders the same shape. If a
 *      future consumer needs a different card (smaller, no price, no +
 *      button), it should use a different component, not a variant.
 *
 *   Q: Should the title + CTA be required?
 *   A: Yes for title (every shelf has one), optional for CTA. Most shelves
 *      have a "View all →" link in the top-right; the empty cart's might
 *      not.
 *
 *   Q: What about the empty state (zero items)?
 *   A: Caller's responsibility. The shelf renders nothing when `items` is
 *      empty — same as today. Empty UI lives in the caller (cart shows
 *      the empty-cart card, library shows the empty-library panel).
 */

/**
 * The bookish shape `<RecommendationCard>` consumes. Intentionally narrow
 * — the card doesn't care where it was loaded from. Matches the current
 * shape in `cart/recommendation-card.tsx` exactly so the Phase 3.F
 * migration is a no-op for existing consumers.
 */
export interface RecommendationBook {
  /** Book slug used for the `/books/{slug}` link. */
  slug: string;
  /** Display title. */
  title: string;
  /** Author display name (already joined / first-author for multi-author books). */
  author: string;
  /** Price in cents — same units as `books.price_cents` in Drizzle. */
  priceCents: number;
  /** ISO 4217 currency code (defaults to USD). */
  currency?: string;
  /** Internal DB id — used by `addToCart()` server action. */
  id: string;
}

/**
 * The shelf header CTA shape. Both `href` and `label` are required;
 * styling is bound to the cinematic palette (no caller override).
 */
export interface RecommendationShelfCta {
  href: string;
  label: string;
}

/**
 * The full prop surface of the future shared shelf. Both existing shelves
 * (`cart/`, `library/`) MUST be expressible through this shape with no
 * additional props — verified by tracing both today.
 */
export interface RecommendationShelfProps {
  /** Section eyebrow (uppercase tracked — e.g. "RECOMMENDED FOR YOU"). */
  eyebrow: string;
  /** Section headline (e.g. "Continue building your library"). */
  title: string;
  /** Optional subtitle paragraph under the title. */
  subtitle?: string;
  /** Optional right-aligned "View all →" CTA. */
  cta?: RecommendationShelfCta;
  /** Items to display. Empty array = render nothing. */
  items: RecommendationBook[];
}
