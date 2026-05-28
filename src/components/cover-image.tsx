/**
 * Cover image renderer with a typographic placeholder fallback.
 *
 * SUB-PR 1.1 always renders the placeholder: the catalog is empty and
 * wiring real cover URLs needs (a) `R2_PUBLIC_BASE_URL` provisioned and
 * (b) `next.config.ts > images.remotePatterns` set for that hostname.
 * Both arrive when the first real cover is uploaded; this component is
 * the single swap-point.
 *
 * The `coverKey` is preserved on a `data-cover-key` attribute so the
 * intended source key is debuggable from the DOM today and ready to
 * drive a `next/image` `src` tomorrow.
 */
export function CoverImage({
  title,
  coverKey,
}: {
  title: string;
  coverKey?: string | null;
}) {
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
      {/* subtle bottom shade — gives the placeholder a hint of "spine" weight */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-secondary/40 to-transparent" />
    </div>
  );
}
