/**
 * Floating glass community card — top-right of the hero showcase.
 *
 * Phase 3.H — the previous "50K+ / 10K+ / 25K+" stats were fabricated
 * marketing numbers with no data behind them. They've been replaced with
 * an honest community badge: the avatar stack stays as a visual cue,
 * the false counts are gone, and a single calm line takes their place.
 *
 * When real analytics ship, this card can graduate to displaying actual
 * counts (booksOwned / authorsCount / readersTotal).
 */
export function StatsCard() {
  return (
    <div className="home-glass home-card-hover absolute right-2 top-6 z-30 hidden w-[220px] rounded-xl p-5 sm:block lg:right-6 lg:top-12 lg:w-[240px]">
      {/* Avatar stack — purely decorative community signal */}
      <div className="flex items-center -space-x-2">
        {[
          "linear-gradient(135deg, #1ddf8f, #0e7f54)",
          "linear-gradient(135deg, #33f0aa, #16c784)",
          "linear-gradient(135deg, #88918a, #5d675f)",
          "linear-gradient(135deg, #16c784, #033620)",
        ].map((bg, i) => (
          <span
            key={i}
            aria-hidden
            className="inline-block h-7 w-7 rounded-full border-2 border-[#07110b]"
            style={{ background: bg }}
          />
        ))}
      </div>

      {/* Tagline — no fake numbers */}
      <p className="mt-4 font-serif text-[18px] font-medium leading-tight text-fg-hi">
        A community of readers.
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-fg-mid">
        Independent. Curated. Yours to keep.
      </p>
    </div>
  );
}
