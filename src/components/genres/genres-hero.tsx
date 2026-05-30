"use client";

import { ChevronDown, Search } from "lucide-react";

import { FORMAT_OPTIONS, type FormatFilter } from "./demo-genres";

/**
 * Two-column genres hero — visual LEFT, editorial RIGHT.
 *
 * Per the brief: the search input + format dropdown are NOT centered
 * on the page; they sit left-aligned within the right column, hanging
 * off the same left edge as the eyebrow / headline / subtitle above.
 *
 * Client Component because the search/dropdown control state is owned
 * here and lifted up to the page via callbacks. (Alternative: lift the
 * state into a parent shell. Kept here for simplicity since this is
 * the only interactive surface above the grid.)
 *
 * The LEFT visual is a self-contained cinematic arch panel — rounded
 * 32px, soft emerald edge glow, atmospheric scene composed entirely
 * from CSS gradients + a glowing arch silhouette. No image asset needed.
 */
export function GenresHero({
  searchQuery,
  formatFilter,
  onSearchChange,
  onFormatChange,
}: {
  searchQuery: string;
  formatFilter: FormatFilter;
  onSearchChange: (q: string) => void;
  onFormatChange: (f: FormatFilter) => void;
}) {
  const dust = [
    { left: "10%", delay: 0, xDrift: "30px" },
    { left: "30%", delay: 3.4, xDrift: "-22px" },
    { left: "48%", delay: 6.4, xDrift: "16px" },
    { left: "66%", delay: 1.6, xDrift: "-14px" },
    { left: "82%", delay: 4.4, xDrift: "22px" },
    { left: "94%", delay: 7.6, xDrift: "-30px" },
  ];

  return (
    <section className="relative overflow-hidden px-6 pb-12 pt-12 sm:pb-16 sm:pt-16 lg:pt-20">
      {/* Wide ambient bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[40%] -z-10 h-[460px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(22, 199, 132, 0.14) 0%, rgba(22, 199, 132, 0.04) 45%, transparent 70%)",
        }}
      />

      {/* Drifting dust */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {dust.map((d, i) => (
          <span
            key={i}
            className="catalog-dust absolute bottom-0 block h-[3px] w-[3px] rounded-full bg-[#33f0aa]"
            style={
              {
                left: d.left,
                animationDelay: `${d.delay}s`,
                ["--dust-x" as string]: d.xDrift,
                boxShadow: "0 0 6px rgba(51, 240, 170, 0.7)",
                opacity: 0,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,_42%)_minmax(0,_1fr)] lg:gap-14">
        {/* LEFT — cinematic visual panel */}
        <ArchPanel />

        {/* RIGHT — editorial content */}
        <div>
          {/* Eyebrow */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#33f0aa]">
            Genres
          </p>

          {/* Diamond ornament */}
          <div className="relative mt-4 flex h-6 w-6 items-center justify-center">
            <div
              aria-hidden
              className="absolute h-6 w-6 rounded-full opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(51, 240, 170, 0.7) 0%, transparent 70%)",
              }}
            />
            <span
              aria-hidden
              className="catalog-diamond block h-2 w-2 rounded-[1px] bg-[#33f0aa]"
              style={{ transform: "rotate(45deg)" }}
            />
          </div>

          {/* Headline with emerald-gradient "dimension" */}
          <h1 className="mt-6 font-serif text-[48px] font-medium leading-[1.05] tracking-[-0.025em] text-[#e6e6e0] sm:text-[58px] lg:text-[64px] xl:text-[72px]">
            Stories in every{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #33f0aa 0%, #1ddf8f 60%, #16c784 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              dimension
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#a7a7a0] sm:text-[17px]">
            From thrilling adventures to life-changing ideas.
            <br className="hidden sm:block" />
            Explore genres that shape the way we read.
          </p>

          {/* Search + format dropdown — left-aligned within this column */}
          <div className="mt-8 flex max-w-md flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5d675f]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.currentTarget.value)}
                placeholder="Search genres..."
                className="h-11 w-full rounded-full border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 text-sm text-[#e6e6e0] placeholder:text-[#5d675f] transition-colors focus:border-[#33f0aa]/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#33f0aa]/20"
              />
            </div>

            <div className="relative sm:w-44">
              <select
                value={formatFilter}
                onChange={(e) =>
                  onFormatChange(e.currentTarget.value as FormatFilter)
                }
                aria-label="Filter by format"
                className="h-11 w-full cursor-pointer appearance-none rounded-full border border-white/[0.08] bg-white/[0.03] pl-4 pr-10 text-sm text-[#e6e6e0] transition-colors hover:border-white/[0.14] focus:border-[#33f0aa]/40 focus:outline-none focus:ring-2 focus:ring-[#33f0aa]/20"
              >
                {FORMAT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#0a1410]">
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a7a7a0]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* ArchPanel — cinematic glowing arch in a dark cathedral-like atmosphere     */
/* -------------------------------------------------------------------------- */

function ArchPanel() {
  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[32px] border border-white/[0.08] shadow-[0_28px_60px_-22px_rgba(0,0,0,0.8),0_0_0_1px_rgba(51,240,170,0.05)_inset,0_0_40px_-12px_rgba(22,199,132,0.4)]">
      {/* Background — dark cathedral atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 75%, #0d2418 0%, #05140d 60%, #020806 100%)",
        }}
      />

      {/* Top emerald edge line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
      />

      {/* Tall vertical bookshelf-like rims flanking the arch */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-[22%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0, transparent 7px, rgba(180,140,90,0.18) 7px, rgba(180,140,90,0.18) 9px, transparent 9px, transparent 22px, rgba(120,100,70,0.14) 22px, rgba(120,100,70,0.14) 26px)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-[22%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0, transparent 7px, rgba(180,140,90,0.18) 7px, rgba(180,140,90,0.18) 9px, transparent 9px, transparent 22px, rgba(120,100,70,0.14) 22px, rgba(120,100,70,0.14) 26px)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%)",
        }}
      />

      {/* Strong central aura behind the arch */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[55%] h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(51, 240, 170, 0.55) 0%, rgba(22, 199, 132, 0.22) 30%, transparent 65%)",
        }}
      />

      {/* The arch itself */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[70%] w-[34%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "linear-gradient(180deg, rgba(51, 240, 170, 0.95) 0%, rgba(22, 199, 132, 0.85) 60%, rgba(8, 60, 38, 0.5) 100%)",
          borderRadius: "50% 50% 8px 8px / 28% 28% 8px 8px",
          boxShadow:
            "0 0 70px 14px rgba(51, 240, 170, 0.5), inset 0 -20px 40px rgba(0,0,0,0.4)",
        }}
      />

      {/* Floor reflection */}
      <div
        aria-hidden
        className="absolute bottom-[10%] left-1/2 h-[40px] w-[70%] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(51,240,170,0.45) 0%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />

      {/* Foreground vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 110%, rgba(0,0,0,0.55) 0%, transparent 65%)",
        }}
      />
    </div>
  );
}
