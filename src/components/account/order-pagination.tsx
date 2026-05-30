import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * OrderPagination — cinematic glass pager (Prev · 1 2 3 · Next).
 *
 * Renders nothing for a single page. Order histories are per-user and small,
 * so every page number is shown (no ellipsis windowing needed). Fully
 * controlled by `<OrdersBrowser>`.
 */
export function OrderPagination({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Order history pages"
      className="flex items-center justify-center gap-2 pt-2"
    >
      <Arrow
        direction="prev"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      />

      {pages.map((p) => {
        const active = p === page;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            aria-label={`Page ${p}`}
            aria-current={active ? "page" : undefined}
            className={`h-10 w-10 rounded-full text-sm font-medium tabular-nums transition-all duration-300 ${
              active
                ? "bg-gradient-to-b from-[#1ddf8f] to-[#16c784] text-[#032015] shadow-[0_0_18px_-4px_rgba(51,240,170,0.7)]"
                : "border border-white/[0.08] bg-white/[0.03] text-fg-mid hover:-translate-y-0.5 hover:border-emerald-bright/40 hover:text-fg-hi"
            }`}
          >
            {p}
          </button>
        );
      })}

      <Arrow
        direction="next"
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
      />
    </nav>
  );
}

function Arrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous page" : "Next page"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-fg-mid transition-all duration-300 enabled:hover:-translate-y-0.5 enabled:hover:border-emerald-bright/40 enabled:hover:text-emerald-bright disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Icon aria-hidden className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}
