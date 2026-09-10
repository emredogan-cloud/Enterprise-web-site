"use client";

import { Gift } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CAMPAIGN_HEADLINE, CAMPAIGN_REASON, splitDuration, spokenRemaining } from "@/lib/campaign";

import { useCampaign, useHydrated, usePrefersReducedMotion } from "./use-campaign";

/**
 * The campaign banner — the large, real-time countdown for `/`, `/books`
 * and `/ebooks`.
 *
 * It renders nothing at all outside the window. Not a greyed-out box, not
 * "offer ended" — nothing. An expired promotion left on the page is a worse
 * advert than no promotion, and the brief is explicit that the system must
 * stop saying "free" once the campaign is over (§22). The one exception is the
 * short grace state below, which exists so a visitor who was mid-countdown
 * when it hit zero sees an explanation rather than a banner that vanishes
 * under their cursor.
 *
 * `EXPIRING` is the same offer with a different temperature: amber instead of
 * gold, and the seconds start mattering. It is not a different promise.
 */
export function CampaignCountdown() {
  const { ready, state, msRemaining } = useCampaign();
  const reduced = usePrefersReducedMotion();
  const hydrated = useHydrated();

  // "Did this component ever see the campaign open?"
  //
  // It exists so a reader watching the clock hit zero gets an explanation
  // instead of a banner that evaporates under their cursor — while someone
  // arriving after it ended sees nothing at all.
  //
  // Set during render rather than in an effect. React sanctions adjusting
  // state while rendering for exactly this "derived from a value that
  // changed" case; the effect version is the cascading-render pattern React
  // 19 warns about, and a ref written during render is impure. The guard
  // makes it converge in one extra render and never loop.
  const [justEnded, setJustEnded] = useState(false);
  if (!justEnded && (state === "active" || state === "expiring")) {
    setJustEnded(true);
  }

  if (state === "scheduled") return null;
  if (state === "ended") {
    if (!justEnded) return null;
    return (
      <section
        aria-live="polite"
        className="mx-auto mt-6 max-w-[1440px] px-4 sm:px-6"
      >
        <div className="home-glass rounded-2xl px-5 py-4 text-center text-sm text-fg-mid">
          The free-ebook promotion has ended. Normal pricing has resumed —
          thank you to everyone who took a book.
        </div>
      </section>
    );
  }

  const expiring = state === "expiring";
  const t = splitDuration(msRemaining);

  return (
    <section
      className="mx-auto mt-6 max-w-[1440px] px-4 sm:px-6"
      aria-labelledby="campaign-heading"
    >
      <div
        className="relative overflow-hidden rounded-[24px] border px-5 py-6 sm:px-8 sm:py-7"
        style={{
          borderColor: expiring
            ? "rgba(245, 180, 70, 0.45)"
            : "rgba(214, 178, 102, 0.35)",
          background: expiring
            ? "linear-gradient(135deg, rgba(48,30,8,0.85) 0%, rgba(16,26,21,0.85) 60%)"
            : "linear-gradient(135deg, rgba(24,34,27,0.85) 0%, rgba(12,24,19,0.85) 60%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 48px -28px rgba(0,0,0,0.7)",
        }}
      >
        {/* A slow gold sweep. Decorative only — hidden from assistive tech and
            switched off entirely for reduced motion, where it would be a
            moving distraction behind text someone is trying to read. */}
        {!reduced && (
          <span
            aria-hidden
            className="campaign-sheen pointer-events-none absolute inset-0"
          />
        )}

        <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="max-w-xl">
            <p className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] sm:justify-start"
               style={{ color: expiring ? "#f5c46b" : "#d6b266" }}>
              <Gift aria-hidden className="h-3.5 w-3.5" />
              {expiring ? "Ending soon" : "Limited time"}
            </p>
            <h2
              id="campaign-heading"
              className="mt-2 font-serif text-[26px] font-medium leading-tight tracking-[-0.02em] text-fg-hi sm:text-[32px]"
            >
              {CAMPAIGN_HEADLINE}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-mid">
              {CAMPAIGN_REASON}{" "}
              <Link
                href="/ebooks"
                className="underline decoration-dotted underline-offset-4 hover:text-fg-hi"
              >
                Browse the ebooks
              </Link>
              .
            </p>
          </div>

          <div className="shrink-0">
            {/* The ticking digits are aria-hidden and a single polite live
                region carries the time in words instead. A screen reader
                announcing four changing numbers every second is unusable;
                once a minute, in prose, is information. */}
            {/* The digits are the one thing here that cannot be
                server-rendered: they are derived from the current time, so the
                server's markup and the client's first render disagree by
                however long the response took, and React reports a hydration
                mismatch. Until hydration the units render as placeholders of
                the same size, so the swap costs no layout shift and no
                warning. */}
            <div aria-hidden className="flex items-end gap-2 sm:gap-3">
              {hydrated ? (
                <>
                  {t.days > 0 && <Unit value={t.days} label="days" expiring={expiring} />}
                  <Unit value={t.hours} label="hrs" expiring={expiring} />
                  <Unit value={t.minutes} label="min" expiring={expiring} />
                  <Unit value={t.seconds} label="sec" expiring={expiring} />
                </>
              ) : (
                <>
                  <Unit label="hrs" expiring={expiring} />
                  <Unit label="min" expiring={expiring} />
                  <Unit label="sec" expiring={expiring} />
                </>
              )}
            </div>
            <p className="sr-only" aria-live="polite">
              {ready ? spokenRemaining(msRemaining) : "Checking how long is left."}
            </p>
            <p className="mt-2 text-center text-[11px] uppercase tracking-[0.22em] text-fg-soft">
              until normal pricing resumes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Unit({
  value,
  label,
  expiring,
}: {
  /** Omitted before hydration — see the note at the call site. */
  value?: number;
  label: string;
  expiring: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="min-w-[54px] rounded-xl border px-3 py-2 text-center font-serif text-[28px] font-medium tabular-nums sm:min-w-[64px] sm:text-[34px]"
        style={{
          color: expiring ? "#f7d69a" : "#eadfc4",
          borderColor: expiring ? "rgba(245,196,107,0.35)" : "rgba(214,178,102,0.28)",
          background: "rgba(0,0,0,0.25)",
        }}
      >
        {value === undefined ? "--" : String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-fg-soft">
        {label}
      </span>
    </div>
  );
}
