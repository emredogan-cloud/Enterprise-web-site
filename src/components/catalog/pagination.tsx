"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Glass pill pagination — per the brief, the active page is a distinct
 * emerald rounded square (not just colored text), and the entire pill
 * sits inside a single dark glass container.
 *
 * Page selector window: shows up to ~7 visible buttons. If totalPages is
 * larger, ellipsis collapses the middle while always keeping page 1 and
 * the last page reachable.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex justify-center"
    >
      <div className="home-glass inline-flex items-center gap-1 rounded-full p-1.5">
        {/* Prev */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#a7a7a0] transition-all hover:bg-white/[0.05] hover:text-[#e6e6e0] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`gap-${i}`}
              aria-hidden
              className="flex h-9 w-7 items-center justify-center text-xs text-[#5d675f]"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium tabular-nums transition-all ${
                p === currentPage
                  ? "bg-gradient-to-b from-[#33f0aa] to-[#16c784] text-[#03281b] shadow-[0_0_16px_rgba(51,240,170,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]"
                  : "text-[#a7a7a0] hover:bg-white/[0.05] hover:text-[#e6e6e0]"
              }`}
            >
              {p}
            </button>
          ),
        )}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#a7a7a0] transition-all hover:bg-white/[0.05] hover:text-[#e6e6e0] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
}

/**
 * Compact page-list builder.
 *   - Always show pages 1 and `totalPages`
 *   - Show a window of ±1 around `current`
 *   - Insert "ellipsis" markers between gaps
 *
 * For totalPages ≤ 7, just lists every page (no ellipsis needed).
 */
type PageOrGap = number | "ellipsis";

function buildPageList(current: number, total: number): PageOrGap[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const result: PageOrGap[] = [1];
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);

  if (windowStart > 2) result.push("ellipsis");
  for (let p = windowStart; p <= windowEnd; p++) result.push(p);
  if (windowEnd < total - 1) result.push("ellipsis");
  result.push(total);
  return result;
}
