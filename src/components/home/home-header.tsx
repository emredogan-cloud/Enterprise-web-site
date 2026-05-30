"use client";

import { Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Homepage-scope dark sticky header (cinematic theme).
 *
 * Replaces the global `<SiteHeader>` (warm theme) which is hidden via
 * `body:has(.homepage-root) > header { display: none }` in globals.css.
 *
 * Client Component because:
 *   - `⌘K` / `Ctrl-K` keyboard shortcut wires a global keydown listener
 *     that routes to `/search`.
 *   - Future cart-count display would hook into the same `cart-changed`
 *     event the rest of the site uses (currently rendered as a static
 *     emerald dot, mirroring the reference image's notification badge).
 */
export function HomeHeader() {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const cmdK = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k";
      if (cmdK) {
        e.preventDefault();
        router.push("/search");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07110b]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-[15px] font-medium tracking-tight text-[#e6e6e0]"
        >
          <span className="font-serif">digital bookstore</span>
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-[#33f0aa] shadow-[0_0_8px_#33f0aa] transition-shadow group-hover:shadow-[0_0_14px_#33f0aa]"
          />
        </Link>

        {/* Center nav — hidden below md */}
        <nav
          aria-label="Primary"
          className="ml-6 hidden items-center gap-7 text-sm text-[#a7a7a0] md:flex"
        >
          <Link href="/books" className="transition-colors hover:text-[#e6e6e0]">
            Books
          </Link>
          <Link
            href="/books"
            className="transition-colors hover:text-[#e6e6e0]"
            title="All authors"
          >
            Authors
          </Link>
          <Link
            href="/books"
            className="transition-colors hover:text-[#e6e6e0]"
            title="All genres"
          >
            Genres
          </Link>
          <Link href="/blog" className="transition-colors hover:text-[#e6e6e0]">
            Blog
          </Link>
          <a
            href="#about"
            className="transition-colors hover:text-[#e6e6e0]"
          >
            About
          </a>
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-3">
          {/* Search pill */}
          <Link
            href="/search"
            className="group hidden h-9 w-64 items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 text-sm text-[#88918a] transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-[#e6e6e0] sm:flex"
          >
            <Search aria-hidden className="h-4 w-4" />
            <span className="flex-1 text-left">Search books, authors…</span>
            <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-[#a7a7a0]">
              ⌘K
            </kbd>
          </Link>

          {/* Search icon (compact, mobile) */}
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[#a7a7a0] transition-colors hover:text-[#e6e6e0] sm:hidden"
          >
            <Search aria-hidden className="h-4 w-4" />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[#a7a7a0] transition-colors hover:text-[#e6e6e0]"
          >
            <ShoppingCart aria-hidden className="h-4 w-4" />
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#33f0aa] shadow-[0_0_6px_#33f0aa]"
            />
          </Link>

          {/* Avatar */}
          <Link
            href="/account/library"
            aria-label="Account"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1ddf8f] to-[#0e7f54] text-[#032015] transition-transform hover:scale-105"
          >
            <User aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
