import type { BookStatus } from "@/lib/db/queries/admin";
import { cn } from "@/lib/utils";

/**
 * Admin-only pill that announces a book's `status` enum value.
 *
 * Color mapping follows the storefront's brand:
 *   - `draft`     → muted (no-publish-yet, neutral)
 *   - `published` → primary evergreen (the "live" state)
 *   - `archived`  → accent (warm, distinct from destructive — archiving
 *                   is a soft action; it preserves history without
 *                   destroying data)
 *
 * Deliberately separate from the OrderStatus badge that lives inside
 * `src/app/admin/page.tsx`. The enums look similar at a glance but are
 * fundamentally different domains — coupling them would invite a future
 * dev to use the wrong palette by mistake.
 */
const STATUS_CLASSES: Record<BookStatus, string> = {
  draft: "border-border bg-muted text-muted-foreground",
  published: "border-primary/30 bg-primary/10 text-primary",
  archived: "border-border bg-accent text-accent-foreground",
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
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
        STATUS_CLASSES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
