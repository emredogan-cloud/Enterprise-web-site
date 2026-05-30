import { Search } from "lucide-react";

/**
 * Bottom empty-search panel — large horizontal glass card.
 *
 * LEFT: large circular search icon inside a thin glass ring with a
 *        soft ambient emerald glow (mirrors the empty-cart focal ring).
 * RIGHT: serif headline + muted body inviting the user to try a query.
 *
 * On mobile the layout stacks vertically (icon above text), still
 * premium.
 */
export function EmptySearchCard() {
  return (
    <div className="mx-auto mt-16 max-w-4xl px-6">
      <div className="home-glass relative overflow-hidden rounded-[32px] px-8 py-12 sm:px-12 sm:py-14">
        {/* Top emerald edge line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
        />

        {/* Card-internal bloom backdrop (subtle) */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[18%] top-1/2 -z-10 h-[280px] w-[280px] -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(22, 199, 132, 0.14) 0%, transparent 65%)",
          }}
        />

        <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:gap-10 sm:text-left">
          {/* LEFT — circular icon ring */}
          <div className="relative h-[96px] w-[96px] flex-shrink-0">
            {/* Outer pulsing aura — uses the existing home-hero-aura keyframe */}
            <div
              aria-hidden
              className="home-hero-aura absolute left-1/2 top-1/2 h-[150px] w-[150px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(51, 240, 170, 0.42) 0%, transparent 65%)",
              }}
            />
            {/* Thin glass ring */}
            <div className="relative flex h-[96px] w-[96px] items-center justify-center rounded-full border border-emerald-bright/30 bg-white/[0.025] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_24px_-6px_rgba(51,240,170,0.4)]">
              <Search
                aria-hidden
                className="h-9 w-9 text-emerald-bright"
                strokeWidth={1.4}
              />
            </div>
          </div>

          {/* RIGHT — content */}
          <div className="min-w-0">
            <h2 className="font-serif text-[26px] font-medium leading-tight tracking-tight text-fg-hi sm:text-[30px]">
              Enter a search term.
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-fg-mid">
              Try a title, an author name, or a topic to find books, authors,
              and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
