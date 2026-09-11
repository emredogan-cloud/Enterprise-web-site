"use client";

import { useEffect, useRef } from "react";

/**
 * The shelf's motion controller.
 *
 * WHY THIS EXISTS AT ALL — THE HOVER JUMP.
 * The slowdown used to be one line of CSS:
 *
 *     .marquee:hover .marquee-track { animation-duration: calc(var(--d) * 2.6) }
 *
 * A CSS animation's progress is `currentTime ÷ duration`. Changing the
 * duration keeps `currentTime` and changes the denominator, so progress is
 * divided by 2.6 and the track teleports backwards. Measured on the live page
 * with the animation parked a quarter of the way through the cycle:
 *
 *     translateX before hover : -3037.5px
 *     translateX after  hover : -3660.6px
 *     instant jump            :  -623.1px  =  -4.2 card positions
 *
 * Which is exactly what it looked like: a book jumping about four places the
 * moment the pointer touched it, and jumping back on the way out. Nothing was
 * reordering — the data never moved. The whole track was being thrown.
 *
 * `playbackRate` is the fix, and it is the fix by specification: setting it
 * updates the animation's start time so that `currentTime` is preserved. The
 * speed changes; the position cannot move. The rate is ramped over ~450ms with
 * one short-lived rAF so the change reads as deceleration rather than a gear
 * change — the loop ends when the ramp does.
 *
 * WHY NOT `animation-play-state: paused`: a shelf that stops dead under the
 * cursor reads as broken, and parking on it is how a visitor finds the seam.
 *
 * WHAT THIS DELIBERATELY IS NOT: per-card listeners, per-card timers, React
 * state per frame, or anything that touches the DOM order. Two listeners on
 * one container, one animation, one transform.
 */

/** Shelf speed at rest, in CSS pixels per second. */
export const PX_PER_SECOND = 34;
/** Speed under the pointer, as a fraction of the resting speed (~13 px/s). */
const HOVER_FACTOR = 0.38;
/** How long the change of pace takes. */
const RAMP_MS = 450;

/**
 * The playback rate that makes one lane take `laneWidth / pxPerSecond` seconds.
 *
 * A lane crosses its own width once per `duration`, so its natural speed is
 * `laneWidth / duration`. Multiplying the rate multiplies the speed, so the
 * rate we want is simply `wanted ÷ natural`.
 *
 * THE TRAP, BECAUSE IT ALREADY CAUGHT US ONCE. The reciprocal of this —
 * `(laneWidth / pxPerSecond) * 1000 / duration` — is dimensionally plausible
 * and agrees with the right answer at exactly one point: when the rate is 1.
 * The desktop lane happens to land there (6534px over 192s is 34.03 px/s), so
 * a desktop measurement read 34.06 px/s and looked perfect while the phone
 * ran at 16.07 px/s — half speed, and slower the narrower the screen got,
 * when a narrower lane should ask for a *faster* rate. Found by measuring a
 * real device, not by reading the line.
 */
export function calibratedPlaybackRate(
  laneWidthPx: number,
  durationMs: number,
  pxPerSecond = PX_PER_SECOND,
): number {
  if (!(laneWidthPx > 0) || !(durationMs > 0)) return 1;
  const naturalPxPerSecond = laneWidthPx / (durationMs / 1000);
  return pxPerSecond / naturalPxPerSecond;
}

export function MarqueeMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const track = root.querySelector<HTMLElement>(".marquee-track");
    if (!track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let raf = 0;
    /**
     * The rate that makes the shelf travel at PX_PER_SECOND.
     *
     * The card size changes across breakpoints, so one server-rendered
     * duration would mean a different speed at every width. Calibrating a
     * multiplier instead keeps the shelf at the same real-world pace on a
     * phone and on a widescreen — and, unlike rewriting the duration, cannot
     * move the track, because that is what `playbackRate` guarantees.
     *
     * Measured on a real Redmi Note 8 at 392px and on a 1854px desktop, which
     * is the only way the first version of this formula was caught being
     * upside down. See `calibratedPlaybackRate`.
     */
    let base = 1;
    let current = 1;
    let target = 1;

    const animation = () => track.getAnimations()[0];

    const calibrate = () => {
      const a = animation();
      const lane = (track.firstElementChild as HTMLElement | null)?.getBoundingClientRect()
        .width;
      const duration = Number(a?.effect?.getTiming().duration ?? 0);
      if (!a || !lane || !duration) return;
      base = calibratedPlaybackRate(lane, duration);
      current = target = base;
      a.playbackRate = base;
    };

    const step = () => {
      const a = animation();
      if (!a) return;
      // Exponential ease toward the target: fast at first, settling softly.
      const k = 1 - Math.exp((-1000 / 60) * (5 / RAMP_MS));
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.002) current = target;
      a.playbackRate = current;
      raf = current === target ? 0 : requestAnimationFrame(step);
    };

    const to = (rate: number) => {
      target = rate;
      if (!raf) raf = requestAnimationFrame(step);
    };

    const slow = () => to(base * HOVER_FACTOR);
    const full = () => to(base);

    calibrate();

    // One pair of listeners on the container. `pointerenter`/`pointerleave`
    // do not bubble from the cards, so moving between two cards inside the
    // shelf never re-fires them — the pace stays steady while the pointer
    // sweeps across, instead of stuttering once per card.
    root.addEventListener("pointerenter", slow);
    root.addEventListener("pointerleave", full);
    // Keyboard users get the same courtesy while they read a card. Focus
    // changes the speed and nothing else; the order is untouchable.
    root.addEventListener("focusin", slow);
    root.addEventListener("focusout", full);

    // Card size is breakpoint-dependent, so the calibration is too.
    const onResize = () => {
      calibrate();
      if (target !== base) target = base * HOVER_FACTOR;
    };
    window.addEventListener("resize", onResize);

    const onReduced = () => {
      if (reduced.matches) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    reduced.addEventListener("change", onReduced);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerenter", slow);
      root.removeEventListener("pointerleave", full);
      root.removeEventListener("focusin", slow);
      root.removeEventListener("focusout", full);
      window.removeEventListener("resize", onResize);
      reduced.removeEventListener("change", onReduced);
    };
  }, []);

  return (
    <div ref={ref} className="marquee group relative mt-8 sm:mt-10">
      {children}
    </div>
  );
}
