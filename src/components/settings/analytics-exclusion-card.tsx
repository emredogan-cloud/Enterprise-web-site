"use client";

import { EyeOff } from "lucide-react";
import { useSyncExternalStore } from "react";

import {
  INTERNAL_COOKIE,
  INTERNAL_COOKIE_MAX_AGE_SECONDS,
  VA_DISABLE_KEY,
  isInternalBrowser,
} from "@/lib/internal-traffic";

/**
 * "Exclude my visits from analytics" — the switch the Founder flips once per
 * browser profile so that routine checking of the storefront does not count
 * as customer traffic.
 *
 * It sets the two markers `@/lib/internal-traffic` documents: the
 * `va-disable` localStorage key that Vercel's own opt-out example reads, and
 * the `vp_internal` cookie the first-party event sink checks. Both live only
 * in this browser; nothing identifies the visitor to anyone else, and an
 * ordinary reader who never opens this card is never affected.
 *
 * Offered to every signed-in account, not just the Founder: a reader who
 * would rather not be measured is entitled to the same switch.
 */

// The browser's marker is external state: read through useSyncExternalStore
// so the server render (unknown) and the client render (known) reconcile
// without a setState-in-effect.
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
function notify() {
  for (const cb of listeners) cb();
}
function readClient(): "on" | "off" {
  return isInternalBrowser() ? "on" : "off";
}
function readServer(): "unknown" {
  return "unknown";
}

function setInternal(on: boolean) {
  try {
    if (on) window.localStorage.setItem(VA_DISABLE_KEY, "1");
    else window.localStorage.removeItem(VA_DISABLE_KEY);
  } catch {
    // Storage may be unavailable; the cookie below still carries the choice.
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = on
    ? `${INTERNAL_COOKIE}=1; Max-Age=${INTERNAL_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`
    : `${INTERNAL_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
  notify();
}

export function AnalyticsExclusionCard() {
  const state = useSyncExternalStore(subscribe, readClient, readServer);
  const excluded = state === "on";

  return (
    <article className="home-glass relative overflow-hidden rounded-[28px] p-6 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
      />
      <header className="flex items-start gap-4">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-deep/30 bg-emerald-deep/10 text-emerald-bright">
          <EyeOff aria-hidden className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
            Analytics
          </p>
          <h2 className="mt-2 font-serif text-[24px] font-medium leading-tight text-fg-hi sm:text-[26px]">
            Exclude this browser from analytics
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-fg-mid">
            Turn this on in a browser you use to check the site and its page
            views and funnel events stop being counted. The setting lives only
            in this browser profile, for a year, and identifies nobody. Turn
            it on in each browser you use.
          </p>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setInternal(!excluded)}
          disabled={state === "unknown"}
          aria-pressed={excluded}
          className={
            excluded
              ? "home-cta-secondary inline-flex h-10 items-center rounded-full px-5 text-sm font-medium"
              : "home-cta-primary inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold"
          }
        >
          {state === "unknown"
            ? "Checking…"
            : excluded
              ? "Count my visits again"
              : "Exclude my visits"}
        </button>
        <span className="text-xs text-fg-soft" data-analytics-exclusion={state}>
          {state === "unknown"
            ? ""
            : excluded
              ? "This browser is excluded from Vercel Analytics and the first-party funnel."
              : "This browser is counted like any visitor."}
        </span>
      </div>
    </article>
  );
}
