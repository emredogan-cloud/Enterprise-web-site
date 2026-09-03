import { NextResponse, type NextRequest } from "next/server";

import { ANALYTICS_EVENTS, type AnalyticsEvent } from "@/lib/analytics";
import { db } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema";
import { isInternalRequest } from "@/lib/internal-traffic";

/**
 * POST /api/events — first-party funnel event sink.
 *
 * Why it exists: Vercel Web Analytics custom events are dropped on the Hobby
 * plan, so `trackEvent` also beacons here. This route is the only place the
 * events are actually recorded.
 *
 * Contract, enforced not advised:
 *   - `event` must be one of ANALYTICS_EVENTS; anything else is dropped.
 *   - `props` is an object of at most 12 keys, each a string (≤ 120 chars),
 *     number, boolean or null; keys that look like PII (`email`, `name`,
 *     `address`, `phone`, `query`, `q`, `search`) are refused outright.
 *   - `path` is a pathname (no query string, ≤ 200 chars) or nothing.
 *   - The referrer HOST is taken from the Referer header; never the URL.
 *   - Body over 2 KB → 413. Bad body → 204 anyway: a beacon is fire-and-
 *     forget and the page must never see an error from analytics.
 *
 * The response is always 204 unless the payload is oversize; a database
 * failure is logged and swallowed for the same reason.
 */

const MAX_BODY_BYTES = 2048;
const MAX_PROPS = 12;
const MAX_STRING = 120;
const PII_KEYS = /^(e-?mail|name|first_?name|last_?name|address|phone|query|q|search|user_?id|ip)$/i;
const EVENT_SET = new Set<string>(ANALYTICS_EVENTS);

type Props = Record<string, string | number | boolean | null>;

export function validateEventPayload(raw: unknown):
  | { ok: true; event: AnalyticsEvent; props: Props; path: string | null; bookSlug: string | null }
  | { ok: false; reason: string } {
  if (typeof raw !== "object" || raw === null) return { ok: false, reason: "not-an-object" };
  const body = raw as Record<string, unknown>;
  const event = typeof body.event === "string" ? body.event : "";
  if (!EVENT_SET.has(event)) return { ok: false, reason: "unknown-event" };

  const props: Props = {};
  const rawProps = body.props;
  if (rawProps !== undefined && rawProps !== null) {
    if (typeof rawProps !== "object" || Array.isArray(rawProps)) {
      return { ok: false, reason: "props-not-object" };
    }
    const entries = Object.entries(rawProps as Record<string, unknown>);
    if (entries.length > MAX_PROPS) return { ok: false, reason: "too-many-props" };
    for (const [k, v] of entries) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,39}$/.test(k)) return { ok: false, reason: "bad-key" };
      if (PII_KEYS.test(k)) return { ok: false, reason: "pii-key" };
      if (v === null || typeof v === "number" || typeof v === "boolean") {
        if (typeof v === "number" && !Number.isFinite(v)) return { ok: false, reason: "bad-number" };
        props[k] = v;
      } else if (typeof v === "string") {
        if (v.length > MAX_STRING) return { ok: false, reason: "string-too-long" };
        if (v.includes("@")) return { ok: false, reason: "pii-value" };
        props[k] = v;
      } else {
        return { ok: false, reason: "bad-value" };
      }
    }
  }

  let path: string | null = null;
  if (typeof body.path === "string" && body.path) {
    const p = body.path.split("?")[0].split("#")[0];
    if (!p.startsWith("/") || p.length > 200) return { ok: false, reason: "bad-path" };
    path = p;
  }

  const slugCandidate =
    typeof props.slug === "string"
      ? props.slug
      : typeof props.bookSlug === "string"
        ? props.bookSlug
        : null;
  const bookSlug =
    slugCandidate && /^[a-z0-9-]{1,80}$/.test(slugCandidate) ? slugCandidate : null;

  return { ok: true, event: event as AnalyticsEvent, props, path, bookSlug };
}

function referrerHost(req: NextRequest): string | null {
  const ref = req.headers.get("referer");
  if (!ref) return null;
  try {
    return new URL(ref).host.slice(0, 120);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // Internal traffic is acknowledged and discarded. The Founder checking the
  // storefront is not a customer, and neither is a verification script.
  if (isInternalRequest(req.headers)) return new NextResponse(null, { status: 204 });
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }
  let raw: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });
    raw = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  const v = validateEventPayload(raw);
  if (!v.ok) return new NextResponse(null, { status: 204 });

  try {
    await db.insert(analyticsEvents).values({
      event: v.event,
      props: v.props,
      path: v.path,
      referrerHost: referrerHost(req),
      bookSlug: v.bookSlug,
      source: "client",
    });
  } catch (err) {
    console.error(
      "[api/events] insert failed:",
      err instanceof Error ? err.message : err,
    );
  }
  return new NextResponse(null, { status: 204 });
}
