"use client";

import { useMemo, useState } from "react";

import { RevealOnScroll } from "@/components/home/reveal-on-scroll";

import {
  type DemoGenre,
  type FormatFilter,
} from "./demo-genres";
import { GenreCard } from "./genre-card";
import { GenresHero } from "./genres-hero";

/**
 * Client shell — owns the search + format filter state, renders the
 * hero (search lives there per the brief's layout) and the filtered
 * 4-col genre grid below.
 *
 * The page itself stays Server / Static; only this shell + its inner
 * filtering UI hydrate on the client.
 */
export function GenresShell({ genres }: { genres: DemoGenre[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("All Formats");

  const filtered = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return genres.filter((g) => {
      if (needle) {
        const hay = `${g.name} ${g.description}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (formatFilter !== "All Formats" && !g.formats.includes(formatFilter)) {
        return false;
      }
      return true;
    });
  }, [genres, searchQuery, formatFilter]);

  return (
    <>
      <GenresHero
        searchQuery={searchQuery}
        formatFilter={formatFilter}
        onSearchChange={setSearchQuery}
        onFormatChange={setFormatFilter}
      />

      <section className="mx-auto mt-4 max-w-7xl px-6">
        {filtered.length === 0 ? (
          <EmptyResults
            onClear={() => {
              setSearchQuery("");
              setFormatFilter("All Formats");
            }}
          />
        ) : (
          <RevealOnScroll
            stagger
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {filtered.map((g) => (
              <GenreCard key={g.slug} genre={g} />
            ))}
          </RevealOnScroll>
        )}
      </section>
    </>
  );
}

function EmptyResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="home-glass mx-auto max-w-md rounded-2xl px-8 py-12 text-center">
      <p className="font-serif text-lg text-fg-hi">
        No genres match those filters.
      </p>
      <p className="mt-2 text-sm text-fg-soft">
        Try a different format, or clear the search.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="home-cta-secondary mt-6 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium"
      >
        Reset filters
      </button>
    </div>
  );
}
