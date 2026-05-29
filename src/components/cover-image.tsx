import Image from "next/image";

import { getCoverImageUrl } from "@/lib/seo";

/**
 * Cover image renderer.
 *
 * Two render paths, chosen at request time based on environment + data:
 *
 *   1. **Next/Image** — when `coverKey` is set AND `R2_PUBLIC_BASE_URL` is
 *      provisioned, render the real cover via `next/image`. The image
 *      flows through Next's optimization route (`/_next/image`), so the
 *      browser only ever sees a same-origin request — the remote-pattern
 *      allowlist in `next.config.ts` guards the server-side fetch.
 *
 *   2. **Typographic placeholder** — fallback when either piece of state
 *      is missing. Same calm 2:3 paper-toned tile from SUB-PR 1.1.
 *
 * The `priority` prop opts the rendered image into LCP-friendly preload
 * (no lazy-loading, no blur-up). Pass `priority` on above-the-fold
 * surfaces — chiefly the book detail page's hero cover. Catalog grids
 * stay lazy-loaded.
 *
 * The intended `coverKey` is preserved on `data-cover-key` either way so
 * the DOM is debuggable.
 */
export function CoverImage({
  title,
  coverKey,
  priority = false,
}: {
  title: string;
  coverKey?: string | null;
  priority?: boolean;
}) {
  const src = getCoverImageUrl(coverKey);

  if (src) {
    return (
      <div
        data-cover-key={coverKey || undefined}
        className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-muted"
      >
        <Image
          src={src}
          alt={`Cover of ${title}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  const initial = (title.charAt(0) || "?").toUpperCase();
  return (
    <div
      data-cover-key={coverKey || undefined}
      className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-gradient-to-br from-secondary via-muted to-secondary"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          aria-hidden
          className="select-none font-serif text-7xl text-muted-foreground/30"
        >
          {initial}
        </span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-secondary/40 to-transparent" />
    </div>
  );
}
