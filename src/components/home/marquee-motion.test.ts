import { describe, expect, it } from "vitest";

import { PX_PER_SECOND, calibratedPlaybackRate } from "./marquee-motion";

/**
 * The shelf's speed is the one number a reader feels, and it was wrong on every
 * screen except the one it was written on. The old formula was the reciprocal
 * of this one; the two agree only where the answer is 1, which is exactly where
 * the desktop lane sits. So these cases are deliberately real measurements from
 * two real screens rather than round numbers — a test built from the same
 * breakpoint that hid the bug would hide it again.
 */
describe("calibratedPlaybackRate", () => {
  /** The animation the CSS declares, at every width. */
  const DURATION_MS = 192_000;
  const speedOf = (lane: number) =>
    (lane / (DURATION_MS / 1000)) * calibratedPlaybackRate(lane, DURATION_MS);

  it("hits the target speed on the desktop lane (1854px viewport, 216px cards)", () => {
    expect(speedOf(6534)).toBeCloseTo(PX_PER_SECOND, 6);
  });

  it("hits the same speed on the phone lane (392px viewport, 150px cards)", () => {
    // Measured on a Redmi Note 8. The old formula gave 16.07 px/s here.
    expect(speedOf(4482)).toBeCloseTo(PX_PER_SECOND, 6);
  });

  it("asks for a faster rate as the lane gets narrower, never a slower one", () => {
    const wide = calibratedPlaybackRate(6534, DURATION_MS);
    const narrow = calibratedPlaybackRate(4482, DURATION_MS);
    expect(narrow).toBeGreaterThan(wide);
  });

  it("holds the speed across every breakpoint's lane width", () => {
    // 27 cards plus gaps, at each card size the shelf actually renders.
    for (const card of [150, 170, 190, 216]) {
      const lane = 27 * (card + 26);
      expect(speedOf(lane)).toBeCloseTo(PX_PER_SECOND, 6);
    }
  });

  it("honours an explicit speed, so the hover factor stays a pure multiplier", () => {
    expect(speedOf(6534) * 0.38).toBeCloseTo(12.92, 2);
    const slow = (lane: number) =>
      (lane / (DURATION_MS / 1000)) * calibratedPlaybackRate(lane, DURATION_MS, 13);
    expect(slow(4482)).toBeCloseTo(13, 6);
  });

  it("falls back to 1 rather than to NaN or Infinity before layout settles", () => {
    // A lane of zero width is what `getBoundingClientRect` returns for a track
    // that has not been laid out yet; dividing by it would set the rate to
    // Infinity and freeze or fling the shelf.
    expect(calibratedPlaybackRate(0, DURATION_MS)).toBe(1);
    expect(calibratedPlaybackRate(6534, 0)).toBe(1);
    expect(calibratedPlaybackRate(Number.NaN, DURATION_MS)).toBe(1);
  });
});
