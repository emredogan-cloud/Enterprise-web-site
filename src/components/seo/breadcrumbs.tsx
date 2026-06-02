import Link from "next/link";

/**
 * Visible breadcrumb trail (WS-F) — the on-page counterpart to the
 * `BreadcrumbList` JSON-LD. Adds real crawlable internal links (Home →
 * hub → page) that improve crawl depth and orientation, in the same calm
 * cinematic chrome the legal pages already use. Pure Server Component.
 *
 * The last crumb is the current page: rendered as plain text (no link),
 * `aria-current="page"`.
 */
export interface Crumb {
  name: string;
  /** Omit on the final (current-page) crumb. */
  href?: string;
}

export function Breadcrumbs({
  trail,
  className = "",
}: {
  trail: ReadonlyArray<Crumb>;
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-[11px] uppercase tracking-[0.2em] text-fg-soft ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={`${crumb.name}-${i}`} className="flex items-center gap-2">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-emerald-bright"
                >
                  {crumb.name}
                </Link>
              ) : (
                <span
                  className={isLast ? "text-fg-hi" : undefined}
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.name}
                </span>
              )}
              {!isLast && (
                <span aria-hidden className="text-emerald-bright">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
