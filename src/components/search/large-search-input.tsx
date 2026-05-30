"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

/**
 * Wide cinematic search input (~720-900px max-width).
 *
 * Per the brief: glass pill, LEFT search icon, CENTER placeholder, RIGHT
 * `⌘K` shortcut chip. Subtle emerald edge glow; focus deepens the glow.
 *
 * Client Component because:
 *   - `⌘K` / `Ctrl-K` global shortcut focuses this input no matter what
 *     route the user is on. (The header already routes to `/search` when
 *     `⌘K` is pressed elsewhere; when the user lands here, the same
 *     shortcut focuses this input directly.)
 *   - On submit, push `/search?q=…` via `useRouter` so the URL updates
 *     and Next.js re-renders the page with the new query.
 *
 * `defaultValue` comes from the page-level prop (which reads `?q=` server-
 * side). The page passes `key={defaultValue}` so back/forward navigation
 * remounts this component with the fresh value — no in-effect setState
 * needed (React 19 flags that as an anti-pattern; key-driven remount is
 * the canonical alternative for resetting controlled state on prop change).
 */
export function LargeSearchInput({
  defaultValue = "",
  placeholder = "Search books, authors, topics…",
}: {
  defaultValue?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);

  // Global ⌘K / Ctrl-K — focus this input.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const cmdK = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k";
      if (cmdK) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-8 w-full max-w-[860px] px-6"
      role="search"
    >
      <div
        className={`relative flex items-center rounded-full border bg-white/[0.03] backdrop-blur-md transition-all duration-300 ${
          focused
            ? "border-[#33f0aa]/50 shadow-[0_0_0_4px_rgba(51,240,170,0.08),0_0_32px_-4px_rgba(51,240,170,0.5)]"
            : "border-white/[0.08] shadow-[0_0_18px_-6px_rgba(51,240,170,0.2)]"
        }`}
      >
        {/* Search icon */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#5d675f]"
        >
          <Search className="h-5 w-5" />
        </span>

        {/* The actual input */}
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete="off"
          aria-label="Search the catalog"
          className="h-14 w-full rounded-full bg-transparent pl-14 pr-24 text-[15px] text-[#e6e6e0] placeholder:text-[#5d675f] focus:outline-none"
        />

        {/* ⌘K shortcut chip — right */}
        <kbd
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-white/[0.12] bg-white/[0.04] px-2 py-1 font-mono text-[11px] font-medium text-[#a7a7a0] backdrop-blur-md sm:inline-flex"
        >
          <span className="text-[12px] leading-none">⌘</span>
          <span>K</span>
        </kbd>
      </div>
    </form>
  );
}
