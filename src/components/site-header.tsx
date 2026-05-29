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

        {/*
          Primary nav — kept to two items so the header stays calm.
          `/books` is the catalog front door; `/blog` is the content hub
          (SUB-PR 3.2). Both are server-rendered links, so the header
          stays static and the layout's `○ Static` / `● SSG` parents
          remain pre-renderable.
        */}
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
          <Link href="/books" className="transition-colors hover:text-primary">
            Books
          </Link>
          <Link href="/blog" className="transition-colors hover:text-primary">
            Blog
          </Link>
        </nav>

        <div className="ml-auto w-full max-w-sm">
          <SearchBar />
        </div>

        <CartIndicator />
      </div>
    </header>
  );
}
