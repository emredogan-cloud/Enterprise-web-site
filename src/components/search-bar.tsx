/**
 * Search bar — a pure HTML form. Zero client JS, works without JavaScript.
 *
 * Architectural choice (Roadmap §8 / ADR-1): rendering this as a Server
 * Component with `<form action="/search" method="GET">` keeps `layout.tsx`
 * (and every page that embeds it) safely Server-only. No `useRouter`, no
 * `useSearchParams`, no `"use client"`, so no dynamic-rendering bleed into
 * the static catalog surfaces.
 *
 * Submitting the form navigates to `/search?q=<input>` — Next.js handles
 * the navigation, and only `/search` itself is classified as Dynamic.
 *
 * The submit button is keyboard-equivalent — pressing Enter in the input
 * submits the form natively. We don't render a visible button to keep the
 * header layout compact; an `sr-only` button keeps it accessible as a
 * second activation path for assistive tech that prefers explicit buttons.
 */
export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  return (
    <form
      action="/search"
      method="GET"
      role="search"
      className="relative"
    >
      <label htmlFor="catalog-search" className="sr-only">
        Search books
      </label>
      <input
        id="catalog-search"
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search books, authors, topics…"
        autoComplete="off"
        className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/60"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}
