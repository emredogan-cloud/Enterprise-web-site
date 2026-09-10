import Link from "next/link";

/**
 * One line under the hero pointing at the book's free companion page.
 *
 * WHY THIS EXISTS
 * The companion was already linked from `<DirectEditionPanel>` — but only
 * there, as the sixth bullet of "What arrives when you buy the Valice
 * edition". That framing is wrong twice over: the material is free to
 * everyone whether or not they ever buy, and the panel only renders for
 * books we sell directly, so a print-only title hid its own free material
 * completely.
 *
 * The reader this serves arrives from outside — a podcast listener, a link
 * in a forum, a QR code — and has not decided to buy anything yet. Giving
 * them the free thing first is both the honest order and the one that earns
 * the second visit. It stays one quiet line rather than a banner: this is a
 * book page, not a landing funnel.
 */
export function CompanionCallout({
  companionSlug,
  label,
}: {
  companionSlug: string;
  /** What the material actually is, in the reader's words. */
  label: string;
}) {
  return (
    <div className="mx-auto mt-10 max-w-[900px] px-4 sm:px-6">
      <Link
        href={`/companion/${companionSlug}`}
        className="group flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl border border-emerald-bright/25 bg-emerald-bright/[0.04] px-5 py-4 transition hover:border-emerald-bright/50 hover:bg-emerald-bright/[0.07]"
      >
        <span className="font-mono text-[12px] lg:text-[11px] uppercase tracking-[0.18em] text-emerald-bright">
          Free companion
        </span>
        <span className="text-sm leading-relaxed text-fg-mid">
          {label}{" "}
          <span className="whitespace-nowrap text-emerald-bright group-hover:underline">
            Open it <span aria-hidden>→</span>
          </span>
        </span>
      </Link>
    </div>
  );
}
