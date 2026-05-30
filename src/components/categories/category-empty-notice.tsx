import { Sparkles } from "lucide-react";
import Link from "next/link";

/**
 * Premium empty / intro notice — shown above the gallery when the real
 * `categories` table is empty. NOT an error box: a calm glass strip that
 * frames the demo worlds below as a deliberate preview and offers a real
 * way forward (browse all books). The emerald accent comes from the top
 * edge line + corner glow + icon tile (the shared `.home-glass` border is
 * intentionally left subtle).
 *
 * Pure Server Component.
 */
export function CategoryEmptyNotice() {
  return (
    <div className="home-glass relative mx-auto flex max-w-2xl items-center gap-4 overflow-hidden rounded-[28px] px-5 py-4 sm:gap-5 sm:px-7 sm:py-5">
      {/* Top emerald edge line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/45 to-transparent"
      />
      {/* Corner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(51, 240, 170, 0.14) 0%, transparent 70%)",
        }}
      />

      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-deep/30 bg-emerald-deep/10 text-emerald-bright shadow-[0_0_14px_-3px_rgba(51,240,170,0.5)]">
        <Sparkles aria-hidden className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </span>

      <p className="min-w-0 flex-1 text-sm leading-relaxed text-fg-mid">
        The catalog hasn&apos;t been populated with categories yet — the worlds
        below are a preview of what&apos;s coming.{" "}
        <span className="text-fg-soft">Check back soon, or </span>
        <Link
          href="/books"
          className="font-medium text-emerald-bright underline decoration-emerald-bright/30 underline-offset-4 transition-colors hover:decoration-emerald-bright"
        >
          browse all books
        </Link>
        <span className="text-fg-soft"> directly.</span>
      </p>
    </div>
  );
}
