"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import {
  campaignEndMs,
  campaignStartMs,
  campaignState,
  type CampaignState,
} from "@/lib/campaign";

/**
 * The campaign clock, shared by every surface that shows it.
 *
 * THREE PROBLEMS THIS SOLVES, IN ORDER OF HOW BADLY THEY BITE
 *
 * 1. **The visitor's clock is not the clock.** A countdown driven by
 *    `Date.now()` runs on a device that may be minutes out, deliberately
 *    wrong, or in any timezone. The offset between the server's `now` and the
 *    browser's is measured once against `/api/campaign` and applied to every
 *    tick afterwards, so the browser is only ever used to measure *elapsed*
 *    time — which it is good at — and never to decide what time it is.
 *
 * 2. **Stale pages.** `/books` and `/ebooks` are `revalidate = 3600`, so a
 *    page rendered while the promotion was live can be served an hour after it
 *    ended, gift boxes and all. Every component using this hook re-checks
 *    against the server on mount and removes itself when the window has
 *    closed. The build-time state is a first paint, not a verdict.
 *
 * 3. **One fetch per page, not one per component.** A shelf renders a gift box
 *    on every card. The sync promise is memoised at module scope, so twenty
 *    boxes and a banner share a single request.
 *
 * The optimistic first render uses the build-time constants — the same values
 * the server used — so there is no flash of the wrong state in the common case
 * where the clocks agree, which is nearly always.
 */

interface Sync {
  /** serverNow − clientNow, in ms. Added to `Date.now()` to get server time. */
  offsetMs: number;
  startsAtMs: number;
  endsAtMs: number;
}

let syncPromise: Promise<Sync> | null = null;
let syncedAtMs = 0;

/** Re-sync if the tab has been asleep longer than this. */
const RESYNC_AFTER_MS = 10 * 60 * 1000;

function fetchSync(): Promise<Sync> {
  const sentAt = Date.now();
  return fetch("/api/campaign", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((j: { serverNowMs: number; startsAtMs: number; endsAtMs: number }) => {
      // Charge half the round trip to the server's timestamp. Without it the
      // offset is systematically early by the whole latency, which on a slow
      // connection is the difference between "1 second left" and "expired".
      const rtt = Date.now() - sentAt;
      return {
        offsetMs: j.serverNowMs + rtt / 2 - Date.now(),
        startsAtMs: j.startsAtMs,
        endsAtMs: j.endsAtMs,
      };
    })
    .catch(() => {
      // The network is not a reason to lie about the offer. Falling back to
      // the build-time constants with a zero offset is the same state the
      // server-rendered HTML already showed.
      return { offsetMs: 0, startsAtMs: campaignStartMs(), endsAtMs: campaignEndMs() };
    });
}

function getSync(force = false): Promise<Sync> {
  if (force || !syncPromise || Date.now() - syncedAtMs > RESYNC_AFTER_MS) {
    syncedAtMs = Date.now();
    syncPromise = fetchSync();
  }
  return syncPromise;
}

export interface CampaignClock {
  /** False until the server clock has been consulted at least once. */
  ready: boolean;
  state: CampaignState;
  /** True while a request would actually be accepted. */
  open: boolean;
  msRemaining: number;
  endsAtMs: number;
}

export function useCampaign(): CampaignClock {
  const [sync, setSync] = useState<Sync | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    getSync().then((s) => {
      if (alive) setSync(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    // A one-second interval that keeps running in a background tab is wasted
    // work on someone's battery for a number nobody is looking at. It stops
    // when the tab is hidden and re-syncs when it comes back, which also
    // repairs the drift a suspended laptop introduces.
    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (id === null) id = setInterval(() => setNow(Date.now()), 1000);
    };
    const stop = () => {
      if (id !== null) {
        clearInterval(id);
        id = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        getSync(Date.now() - syncedAtMs > RESYNC_AFTER_MS).then(setSync);
        setNow(Date.now());
        start();
      } else {
        stop();
      }
    };
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const offset = sync?.offsetMs ?? 0;
  const endsAt = sync?.endsAtMs ?? campaignEndMs();
  const startsAt = sync?.startsAtMs ?? campaignStartMs();
  const serverNow = now + offset;

  // `campaignState` reads the window from env; when the API returned a
  // different one (the Founder extended it without a redeploy) that answer
  // wins, so the state is derived from the synced numbers directly.
  let state: CampaignState;
  if (!(endsAt > startsAt)) state = "ended";
  else if (serverNow < startsAt) state = "scheduled";
  else if (serverNow >= endsAt) state = "ended";
  else if (endsAt - serverNow <= 6 * 3_600_000) state = "expiring";
  else state = "active";

  // Before the first sync resolves, fall back to the pure function over
  // build-time constants — identical to what the server rendered.
  if (!sync) state = campaignState(serverNow);

  return {
    ready: sync !== null,
    state,
    open: state === "active" || state === "expiring",
    msRemaining: Math.max(0, endsAt - serverNow),
    endsAtMs: endsAt,
  };
}

/**
 * `prefers-reduced-motion: reduce`, as a hook.
 *
 * `useSyncExternalStore` rather than `useState` + an effect: a media query IS
 * an external store, and reading it into state inside an effect is the
 * cascading-render pattern React 19 now warns about. The server snapshot is
 * `false` — the same value the CSS already assumes — so the markup matches on
 * hydration and only changes if the visitor actually asked for less motion.
 */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/**
 * "Has this component hydrated yet?"
 *
 * WHY THIS EXISTS
 * The countdown renders a value derived from `Date.now()`. On the server that
 * is the server's clock at render time; in the browser it is the client's
 * clock a moment later. React compares the two and, quite rightly, reports a
 * hydration mismatch — which it did, on `/ebooks`, on the seconds digit.
 *
 * A time-dependent value simply cannot be server-rendered. The fix is not to
 * silence the warning with `suppressHydrationWarning` (which would hide real
 * mismatches in the same subtree) but to render something stable until the
 * client is in charge, then swap.
 *
 * `useSyncExternalStore` is the lint-clean way to express it: the server
 * snapshot is `false`, the client snapshot is `true`, nothing ever changes
 * afterwards, so `subscribe` is a no-op. React re-renders once after
 * hydration and does not complain, because that is exactly the transition
 * this API is for.
 */
const noopSubscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
