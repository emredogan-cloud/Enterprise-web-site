import Image from "next/image";
import Link from "next/link";

import { CategoryCoverStack } from "@/components/categories/category-cover-stack";
import { categoryLook } from "@/components/categories/category-icons";
import { categoryArtSrc } from "@/lib/asset-map";
import type { CategorySummary } from "@/lib/db/queries/catalog";

import { RevealOnScroll } from "./reveal-on-scroll";

/**
 * "Browse by category" — up to five category cards on the homepage.
 *
 * Accepts real `CategorySummary[]` from the homepage (`listAllCategories()`
 * at SSG time). Each card links to `/categories/{slug}` and shows the real
 * covers filed in the category — the same composition as the `/categories`
 * gallery, so the two pages cannot disagree about what a category looks like.
 * A bespoke image at `/images/categories/<slug>.webp` takes over when present.
 *
 * Until Phase 4 the cards were five gradients cycled by index with a lookup
 * for artwork that never matched a real slug. The demo fallback of invented
 * genres ("Fiction", "Sci-Fi", "Growth", "Business") is gone: an empty
 * catalogue renders no section rather than a fictional one.
 */
export function CategoriesSection({
  categories = [],
}: {
  /** Real DB categories from `listAllCategories()`. Empty → section hidden. */
  categories?: CategorySummary[];
}) {
  const cards = categories.slice(0, 5);
  if (cards.length === 0) return null;

  return (
    <section className="relative px-6 py-14 sm:py-24 lg:px-12 lg:py-28 xl:px-16 2xl:px-20">
      <div className="mx-auto w-full max-w-[1700px]">
        <RevealOnScroll>
          <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] lg:text-[11px] font-medium uppercase tracking-[0.3em] text-emerald-bright/80">
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
          {cards.map((cat) => {
            const look = categoryLook(cat.slug);
            const art = categoryArtSrc(cat.slug);
            return (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="home-card-hover group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07110b] transition-colors hover:border-emerald-bright/25"
              >
                <div className="absolute inset-0">
                  {art ? (
                    <Image
                      src={art}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                      /* Held back at rest so the title reads, and released on
                         hover. The artwork is the category's identity — a card
                         that dims it permanently is just a coloured rectangle. */
                      className="object-cover brightness-[0.78] saturate-[0.92] transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.04] group-hover:brightness-100 group-hover:saturate-100 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ) : (
                    <CategoryCoverStack
                      coverSrcs={cat.coverSrcs}
                      name={cat.name}
                      tint={look.tint}
                    />
                  )}
                </div>

                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
                />
                {/* Two layers, doing two different jobs. The vignette settles
                    the busy edges of a photographic plate; the foot gradient is
                    what actually carries the type. The new category art is far
                    brighter than the flat textures it replaces, so the foot has
                    to be darker than it used to be — measured against the
                    lightest pixel under the title, not against the average. */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(120% 90% at 50% 35%, transparent 40%, rgba(3,8,6,0.55) 100%)",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[72%]"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(3,8,6,0.96) 0%, rgba(3,8,6,0.82) 28%, rgba(3,8,6,0.38) 62%, transparent 100%)",
                  }}
                />

                <div className="relative z-10 flex h-full flex-col justify-end p-5">
                  <span className="text-[12px] lg:text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    {cat.bookCount === 1 ? "1 book" : `${cat.bookCount} books`}
                  </span>
                  <h3 className="mt-2 font-serif text-2xl font-medium text-fg-hi transition-colors group-hover:text-emerald-bright">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </RevealOnScroll>
      </div>
    </section>
  );
}
