import Link from "next/link";

import { SearchBar } from "@/components/search-bar";

/**
 * Global site header — brand link + global search.
 *
 * Pure Server Component (no `"use client"`, no dynamic hooks): renders into
 * static HTML and embeds the also-static `SearchBar`. Embedding this in
 * `app/layout.tsx` therefore does NOT downgrade any static / SSG route to
 * dynamic — verified in the SUB-PR 1.2 build output.
 *
 * `sticky top-0` + a translucent `backdrop-blur` give the header a calm,
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
      </div>
    </header>
  );
}
