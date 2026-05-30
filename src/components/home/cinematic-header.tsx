"use client";

import { Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Dark sticky header — shared by every cinematic-scoped route
 * (currently `/` and `/books`; available to any future page that
 * wraps itself in `.cinematic-root`).
 *
 * The global `<SiteHeader>` (warm theme, calm-literary tone) is hidden
 * on cinematic pages by `body:has(.cinematic-root) > header { display:
 * none }` in globals.css — this component takes its place.
 *
 * Client Component because:
 *   - `⌘K` / `Ctrl-K` global keyboard shortcut routes to `/search`
 *   - The search-pill / cart / avatar all need to feel reactive at
 *     hover-time; doing the hover with CSS is fine but ergonomic to
 *     keep the whole thing in one Client component.
 *
 * `active` prop drives the underline + micro emerald glow under the
 * current section's nav link. Pass it from each page that mounts the
 * header.
 */
export type ActiveNavSection = "home" | "books" | "authors" | "genres" | "blog";

const NAV_ITEMS: { key: ActiveNavSection; label: string; href: string }[] = [
  { key: "books", label: "Books", href: "/books" },
  // `/authors` is the new cinematic discovery page (SUB-PR — authors redesign).
  // Previously fell through to /books because no index existed.
  { key: "authors", label: "Authors", href: "/authors" },
  { key: "genres", label: "Genres", href: "/books" },
  { key: "blog", label: "Blog", href: "/blog" },
];

export function CinematicHeader({ active }: { active?: ActiveNavSection }) {
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
          className="ml-6 hidden items-center gap-7 text-sm md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative transition-colors ${
                  isActive ? "text-[#e6e6e0]" : "text-[#a7a7a0] hover:text-[#e6e6e0]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute -bottom-[22px] left-0 right-0 h-[2px] rounded-full bg-[#33f0aa] shadow-[0_0_10px_#33f0aa]"
                  />
                )}
              </Link>
            );
          })}
          <a
            href="#about"
            className={`transition-colors ${
              "about" === (active as string | undefined)
                ? "text-[#e6e6e0]"
                : "text-[#a7a7a0] hover:text-[#e6e6e0]"
            }`}
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
