"use client";

import { useEffect, useRef } from "react";

import {
  trackEvent,
  type AnalyticsEvent,
  type EventProps,
} from "@/lib/analytics";

/**
 * Client beacon for server-rendered pages that need a funnel event without
 * their own interactivity — e.g. `view_item` on `/books/[slug]` or
 * `purchase` on `/order/[id]`. Fires the event exactly once: on mount, or
 * (with `onView`) the first time a sentinel scrolls into view (used for
 * `sample_read`). Props must be PII-free.
 *
 * Renders nothing in the default (mount) mode; in `onView` mode it renders a
 * 1px sentinel span the IntersectionObserver watches.
 */
export function TrackEvent({
  event,
  props,
  onView = false,
}: {
  event: AnalyticsEvent;
  props?: EventProps;
  onView?: boolean;
}) {
  const fired = useRef(false);
  const sentinel = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const fire = () => {
      if (fired.current) return;
      fired.current = true;
      trackEvent(event, props);
    };

    if (!onView) {
      fire();
      return;
    }

    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      fire(); // graceful fallback when IO is unavailable
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          fire();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [event, props, onView]);

  return onView ? (
    <span ref={sentinel} aria-hidden className="block h-px w-full" />
  ) : null;
}
