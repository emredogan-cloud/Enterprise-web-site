"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
 *
 * Phase 0.F — the avatar slot now hosts Clerk's `<UserButton>` (signed
 * in: real avatar + sign-out menu) / `<SignInButton>` (signed out:
 * pill). When the Clerk publishable key is missing (local dev before
 * `vercel env pull`), the slot falls back to the legacy avatar link so
 * the cinematic shell still renders on unprovisioned environments.
 */

// Inlined at build time. Used to short-circuit Clerk hook usage when no
// provider is mounted (see `<AccountSlot>` below).
const CLERK_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);
export type ActiveNavSection =
  | "home"
  | "books"
  | "authors"
  | "genres"
  | "blog"
  | "library"
  | "about";

const NAV_ITEMS: { key: ActiveNavSection; label: string; href: string }[] = [
  { key: "books", label: "Books", href: "/books" },
  // `/authors` is the cinematic discovery page (SUB-PR — authors redesign).
  // Previously fell through to /books because no index existed.
  { key: "authors", label: "Authors", href: "/authors" },
  // `/genres` is the cinematic discovery page (SUB-PR — genres redesign).
  // Previously fell through to /books because no index existed.
  { key: "genres", label: "Genres", href: "/genres" },
  { key: "blog", label: "Blog", href: "/blog" },
  // `/account/library` is the cinematic personal library (SUB-PR — library
  // redesign). Auth-gated server-side; the link itself is always visible.
  { key: "library", label: "Library", href: "/account/library" },
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
          {/* Phase 1.B — was `<a href="#about">` (anchor hack to the
              footer's id="about"; only worked on the homepage). Now
              points at the real /about page. */}
          <Link
            href="/about"
            className={`relative transition-colors ${
              active === "about"
                ? "text-[#e6e6e0]"
                : "text-[#a7a7a0] hover:text-[#e6e6e0]"
            }`}
          >
            About
            {active === "about" && (
              <span
                aria-hidden
                className="absolute -bottom-[22px] left-0 right-0 h-[2px] rounded-full bg-[#33f0aa] shadow-[0_0_10px_#33f0aa]"
              />
            )}
          </Link>
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

          {/* Cart — badge dot is state-driven (Phase 1.H). Was always-on
              before; now fetches `/api/cart/count` on mount + listens for
              the `cart-changed` custom event that RecommendationCard,
              CartLine, AddToCart all dispatch. */}
          <CartTriggerWithBadge />

          {/* Account slot — Clerk-aware. Renders sign-in pill when signed
              out, UserButton (real avatar + menu + sign-out) when signed
              in, and falls back to the legacy avatar link when no Clerk
              provider is mounted (e.g. unprovisioned local dev). */}
          <AccountSlot />
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Cart trigger with state-driven badge (Phase 1.H).
//
// Replaces the previous always-on dot. The dot now reflects whether the
// cart has any items: fetches `/api/cart/count` on mount + refetches on
// every `cart-changed` window event that RecommendationCard, CartLine,
// AddToCart all dispatch. Network failures fall back to "no dot".
// ─────────────────────────────────────────────────────────────────────────

function CartTriggerWithBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const res = await fetch("/api/cart/count", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { count?: number };
        if (!cancelled && typeof data.count === "number") {
          setCount(data.count);
        }
      } catch {
        // Network/parse error → leave previous value; never throw to UI.
      }
    }

    refresh();
    window.addEventListener("cart-changed", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("cart-changed", refresh);
    };
  }, []);

  const hasItems = count !== null && count > 0;

  return (
    <Link
      href="/cart"
      aria-label={
        count === null
          ? "Cart"
          : count === 0
            ? "Cart, empty"
            : `Cart, ${count} ${count === 1 ? "item" : "items"}`
      }
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[#a7a7a0] transition-colors hover:text-[#e6e6e0]"
    >
      <ShoppingCart aria-hidden className="h-4 w-4" />
      {hasItems && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#33f0aa] shadow-[0_0_6px_#33f0aa]"
        />
      )}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Account slot — encapsulates the Clerk vs unprovisioned-fallback branch.
//
// Rules-of-hooks safety: each leaf component consistently calls (or does
// not call) `useAuth`. The outer `<AccountSlot>` picks the leaf without
// ever conditionally toggling a hook itself.
// ─────────────────────────────────────────────────────────────────────────

function AccountSlot() {
  if (!CLERK_CONFIGURED) return <LegacyAccountFallback />;
  return <ClerkAccountSlot />;
}

/** Legacy avatar link — used when Clerk isn't configured. Keeps the
 * cinematic shell renderable on unprovisioned environments. */
function LegacyAccountFallback() {
  return (
    <Link
      href="/account/library"
      aria-label="Account"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1ddf8f] to-[#0e7f54] text-[#032015] transition-transform hover:scale-105"
    >
      <User aria-hidden className="h-4 w-4" />
    </Link>
  );
}

/** Cinematic-themed UserButton appearance. Tuned to read against the
 * dark sticky header without dragging in `@clerk/themes`. */
const USER_BUTTON_APPEARANCE = {
  variables: {
    colorPrimary: "#1ddf8f",
    colorBackground: "#0c1813",
    colorText: "#e6e6e0",
    colorTextSecondary: "#a7a7a0",
    colorInputBackground: "rgba(255, 255, 255, 0.03)",
    colorInputText: "#e6e6e0",
    borderRadius: "0.75rem",
  },
  elements: {
    avatarBox:
      "h-9 w-9 ring-1 ring-white/[0.08] shadow-[0_0_0_1px_rgba(51,240,170,0.15)]",
    userButtonPopoverCard:
      "bg-[#0c1813] border border-white/[0.08] shadow-[0_28px_60px_-22px_rgba(0,0,0,0.8)]",
    userButtonPopoverActionButton:
      "text-[#a7a7a0] hover:text-[#e6e6e0] hover:bg-white/[0.04]",
    userButtonPopoverActionButtonText: "text-[#e6e6e0]",
    userButtonPopoverFooter: "hidden",
  },
} as const;

function ClerkAccountSlot() {
  const { isLoaded, isSignedIn } = useAuth();

  // First paint while Clerk is hydrating — show a calm neutral placeholder
  // (NOT the emerald gradient avatar, which would flash and then morph
  // into a different shape once isSignedIn resolves).
  if (!isLoaded) {
    return (
      <div
        aria-hidden
        className="h-9 w-9 rounded-full border border-white/[0.08] bg-white/[0.03]"
      />
    );
  }

  if (isSignedIn) {
    // After-sign-out redirect is configured at the <ClerkProvider> level
    // (defaults to "/"); not a UserButton prop in Clerk v7+.
    return <UserButton appearance={USER_BUTTON_APPEARANCE} />;
  }

  // Signed-out: small cinematic "Sign in" pill that triggers the modal.
  return (
    <SignInButton mode="modal">
      <button
        type="button"
        className="inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 text-sm text-[#e6e6e0] transition-colors hover:border-[#33f0aa]/40 hover:bg-[#33f0aa]/10"
      >
        <User aria-hidden className="h-3.5 w-3.5" />
        Sign in
      </button>
    </SignInButton>
  );
}
