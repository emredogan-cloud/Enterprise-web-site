import Link from "next/link";

import { CartIndicator } from "@/components/cart-indicator";
import { SearchBar } from "@/components/search-bar";

/**
 * Global site header — brand link + global search + cart indicator.
 *
 * Pure Server Component. The interactive bits inside (`SearchBar` is a
 * Server-Component HTML form; `CartIndicator` is a Client Component that
 * fetches its count from `/api/cart/count`) all keep the layout itself
 * SERVER-STATIC, so every catalog route inheriting `app/layout.tsx` stays
 * `○ Static` / `● SSG`.
 *
 * `sticky top-0` + a translucent `backdrop-blur` gives the header a calm,
 * always-reachable presence without dominating page content.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Link
          href="/"
          className="font-serif text-lg font-medium text-foreground transition-colors hover:text-primary"
        >
          Digital Bookstore
        </Link>

        <div className="ml-auto w-full max-w-sm">
          <SearchBar />
        </div>

        <CartIndicator />
      </div>
    </header>
  );
}
