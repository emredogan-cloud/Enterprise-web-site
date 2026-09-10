import { afterEach, describe, expect, it, vi } from "vitest";

import {
  EXPIRING_WINDOW_HOURS,
  campaignEndMs,
  campaignIsOpen,
  campaignMsRemaining,
  campaignStartMs,
  campaignState,
  splitDuration,
  spokenRemaining,
} from "./campaign";

/**
 * The campaign's state machine is the one part of this feature that decides
 * whether the store is giving books away. Every other piece — the banner, the
 * gift boxes, the modal — is decoration over these five branches, and the API
 * route refuses or accepts on the strength of `campaignIsOpen` alone.
 *
 * The brief's TEST 22 is "campaign expires correctly when tested against a
 * temporary test timestamp". That is exactly what these do: they point the
 * env vars at a window and walk `now` across both of its edges.
 */

const START = "2026-09-10T00:00:00.000Z";
const END = "2026-09-12T12:00:00.000Z";

function windowEnv(start = START, end = END) {
  vi.stubEnv("NEXT_PUBLIC_FREE_CAMPAIGN_START", start);
  vi.stubEnv("NEXT_PUBLIC_FREE_CAMPAIGN_END", end);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("campaignState", () => {
  it("is scheduled before the window opens", () => {
    windowEnv();
    expect(campaignState(Date.parse(START) - 1)).toBe("scheduled");
  });

  it("is active the instant it opens", () => {
    windowEnv();
    expect(campaignState(Date.parse(START))).toBe("active");
  });

  it("becomes expiring inside the final window", () => {
    windowEnv();
    const end = Date.parse(END);
    const hour = 3_600_000;
    expect(campaignState(end - (EXPIRING_WINDOW_HOURS + 1) * hour)).toBe("active");
    expect(campaignState(end - EXPIRING_WINDOW_HOURS * hour)).toBe("expiring");
    expect(campaignState(end - 1)).toBe("expiring");
  });

  it("is ended AT the end, not a second after", () => {
    // The boundary that matters. `>` instead of `>=` here would leave the
    // promotion open for one more second after the countdown reads 00:00,
    // which is exactly the second a screenshot gets taken.
    windowEnv();
    expect(campaignState(Date.parse(END))).toBe("ended");
    expect(campaignState(Date.parse(END) + 1)).toBe("ended");
  });

  it("treats a backwards or zero-length window as ended", () => {
    // A mis-typed env var must fail closed. The cost of a promotion that
    // refuses to start is a missed weekend; the cost of one that refuses to
    // stop is every book, forever.
    windowEnv(END, START);
    expect(campaignState(Date.parse(START) + 1000)).toBe("ended");
    windowEnv(START, START);
    expect(campaignState(Date.parse(START))).toBe("ended");
  });

  it("falls back to the built-in window when an env var is unparseable", () => {
    vi.stubEnv("NEXT_PUBLIC_FREE_CAMPAIGN_END", "not a date");
    // The fallback is a real timestamp, so the machine still answers.
    expect(Number.isFinite(campaignEndMs())).toBe(true);
    expect(campaignEndMs()).toBeGreaterThan(campaignStartMs());
  });
});

describe("campaignIsOpen", () => {
  it("is open exactly while active or expiring", () => {
    windowEnv();
    const start = Date.parse(START);
    const end = Date.parse(END);
    expect(campaignIsOpen(start - 1)).toBe(false);
    expect(campaignIsOpen(start)).toBe(true);
    expect(campaignIsOpen(end - 1)).toBe(true);
    expect(campaignIsOpen(end)).toBe(false);
  });

  it("closes against a temporary window that has just elapsed", () => {
    // TEST 22, in the form the QA pass runs it: point the campaign at a
    // window two minutes wide and step past its end.
    const s = "2026-01-01T00:00:00.000Z";
    const e = "2026-01-01T00:02:00.000Z";
    windowEnv(s, e);
    expect(campaignIsOpen(Date.parse(s) + 60_000)).toBe(true);
    expect(campaignIsOpen(Date.parse(e) + 1)).toBe(false);
    expect(campaignState(Date.parse(e) + 1)).toBe("ended");
  });
});

describe("campaignMsRemaining", () => {
  it("never goes negative", () => {
    windowEnv();
    expect(campaignMsRemaining(Date.parse(END) + 10_000)).toBe(0);
  });

  it("counts down in real milliseconds", () => {
    windowEnv();
    const end = Date.parse(END);
    expect(campaignMsRemaining(end - 5_000)).toBe(5_000);
  });
});

describe("splitDuration", () => {
  it("splits a duration into days/hours/minutes/seconds", () => {
    const d = splitDuration(((2 * 24 + 3) * 60 + 4) * 60_000 + 5_000);
    expect(d).toMatchObject({ days: 2, hours: 3, minutes: 4, seconds: 5 });
  });

  it("floors a negative duration at zero rather than producing -0 units", () => {
    expect(splitDuration(-9_999)).toMatchObject({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
    });
  });
});

describe("spokenRemaining", () => {
  it("says the offer ended at zero", () => {
    expect(spokenRemaining(0)).toBe("The offer has ended.");
  });

  it("omits seconds until the last minute", () => {
    // A screen reader announcing a ticking second hand for two days is noise,
    // not information. Seconds only appear when they are the whole story.
    expect(spokenRemaining(3 * 3_600_000 + 4 * 60_000 + 5_000)).toBe(
      "3 hours, 4 minutes left",
    );
    expect(spokenRemaining(42_000)).toBe("42 seconds left");
  });

  it("uses singular units where they are singular", () => {
    expect(spokenRemaining(3_600_000 + 60_000)).toBe("1 hour, 1 minute left");
  });
});
