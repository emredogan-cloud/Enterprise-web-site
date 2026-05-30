import type { BookStatus } from "@/lib/db/queries/admin";
import { cn } from "@/lib/utils";

/**
 * Admin-only pill that announces a book's `status` enum value.
 *
 * Phase 3.B — cinematic tones (warm shadcn tokens dropped):
 *   - `draft`     → calm muted (neutral, not-yet-published)
 *   - `published` → emerald (live in the catalog)
 *   - `archived`  → amber (soft warning, history preserved)
 *
 * Deliberately separate from the OrderStatus badge in `/admin/page.tsx`
 * and `/account/orders/page.tsx`. The enums look similar at a glance but
 * are fundamentally different domains — coupling them would invite the
 * wrong palette by mistake.
 */
const STATUS_CLASSES: Record<BookStatus, string> = {
  draft:
    "border-white/[0.12] bg-white/[0.04] text-fg-mid",
  published:
    "border-emerald-bright/30 bg-emerald-bright/10 text-emerald-bright",
  archived:
    "border-[#ffce63]/30 bg-[#ffce63]/8 text-[#ffce63]",
};

export function BookStatusBadge({
  status,
  className,
}: {
  status: BookStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        STATUS_CLASSES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
