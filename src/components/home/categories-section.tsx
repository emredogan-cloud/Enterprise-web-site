import Link from "next/link";

import { RevealOnScroll } from "./reveal-on-scroll";

/**
 * "Browse by category" — 5 horizontal category cards.
 *
 * Each card is a gradient panel with overlay text + book count. No image
 * dependency — palettes evoke the category mood. Hover lifts + bloom via
 * `.home-card-hover`.
 */
export function CategoriesSection() {
  const categories = [
    {
      name: "Fiction",
      count: "12.4K books",
      href: "/books",
      gradient:
        "linear-gradient(160deg, #1a3326 0%, #0a1f14 100%), radial-gradient(circle at 30% 20%, rgba(51,240,170,0.15) 0%, transparent 60%)",
    },
    {
      name: "Sci-Fi",
      count: "4.1K books",
      href: "/books",
      gradient:
        "linear-gradient(160deg, #14292e 0%, #081116 100%), radial-gradient(circle at 70% 30%, rgba(99,180,255,0.16) 0%, transparent 60%)",
    },
    {
      name: "Growth",
      count: "6.8K books",
      href: "/books",
      gradient:
        "linear-gradient(160deg, #2c2316 0%, #14110a 100%), radial-gradient(circle at 50% 30%, rgba(255,190,90,0.16) 0%, transparent 60%)",
    },
    {
      name: "Business",
      count: "9.2K books",
      href: "/books",
      gradient:
        "linear-gradient(160deg, #1a2336 0%, #0a0e16 100%), radial-gradient(circle at 30% 70%, rgba(160,160,255,0.14) 0%, transparent 60%)",
    },
    {
      name: "History",
      count: "3.5K books",
      href: "/books",
      gradient:
        "linear-gradient(160deg, #2c1f1a 0%, #1a0f0a 100%), radial-gradient(circle at 50% 50%, rgba(220,150,90,0.14) 0%, transparent 60%)",
    },
  ];

  return (
    <section className="relative px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#33f0aa]/80">
                Browse the shelves
              </p>
              <h2 className="mt-3 font-serif text-[36px] font-medium leading-tight tracking-tight text-[#e6e6e0] sm:text-[44px]">
                Browse by category
              </h2>
            </div>
            <Link
              href="/books"
              className="text-sm font-medium text-[#33f0aa] underline-offset-4 hover:underline"
            >
              View all →
            </Link>
          </header>
        </RevealOnScroll>

        <RevealOnScroll
          stagger
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="home-card-hover group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.06]"
              style={{ background: cat.gradient }}
            >
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
                <h3 className="font-serif text-2xl font-medium text-[#e6e6e0] transition-colors group-hover:text-[#33f0aa]">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs font-medium text-[#a7a7a0]">
                  {cat.count}
                </p>
              </div>
            </Link>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
