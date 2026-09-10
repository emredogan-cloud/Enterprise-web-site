import type { Metadata } from "next";
import Link from "next/link";

import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { AdminAccessError, requireAdmin } from "@/lib/auth";
import { campaignEndMs, campaignState } from "@/lib/campaign";
import {
  getFreeBookRequestCounts,
  listFreeBookRequests,
  type AdminFreeBookRequest,
  type FreeBookRequestStatus,
} from "@/lib/db/queries/free-books";

import { RequestRowActions } from "./row-actions";

/**
 * /admin/free-books — the fulfilment queue for the free-ebook promotion.
 *
 * The whole point of this page is that a promise made on the storefront
 * ("you'll receive your PDF by email within 24 hours") has somewhere to be
 * kept. A request system with no operator surface is a table nobody reads and
 * a promise nobody keeps.
 *
 * Ordered newest-first and filterable by status, with the counts across the
 * top so the size of the queue is visible without scrolling it. `pending` is
 * the default view because it is the only one that represents work.
 *
 * `ƒ Dynamic`, never prerendered: it reads Clerk session cookies and live
 * rows, and a cached fulfilment queue would be actively harmful.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free-ebook requests",
  robots: { index: false, follow: false },
};

const STATUSES: Array<FreeBookRequestStatus | "all"> = [
  "pending",
  "fulfilled",
  "failed",
  "duplicate",
  "flagged",
  "all",
];

export default async function FreeBookRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminAccessError) {
      return (
        <div className="cinematic-root">
          <CinematicHeader />
          <main id="main-content" className="mx-auto max-w-3xl px-6 py-24">
            <h1 className="font-serif text-3xl text-fg-hi">Admin</h1>
            <p className="mt-4 text-fg-mid">{err.message}</p>
          </main>
          <HomeFooter />
        </div>
      );
    }
    throw err;
  }

  const sp = await searchParams;
  const raw = sp.status ?? "pending";
  const filter = (STATUSES as string[]).includes(raw) ? raw : "pending";

  const [rows, counts] = await Promise.all([
    listFreeBookRequests({
      status: filter === "all" ? undefined : (filter as FreeBookRequestStatus),
      limit: 300,
    }),
    getFreeBookRequestCounts(),
  ]);

  const state = campaignState();

  return (
    <div className="cinematic-root">
      <CinematicHeader />

      <main id="main-content" className="relative z-10 mx-auto max-w-[1320px] px-4 py-14 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
          Admin
        </p>
        <h1 className="mt-3 font-serif text-[34px] font-medium tracking-[-0.02em] text-fg-hi">
          Free-ebook requests
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-mid">
          The promotion is currently <strong className="text-fg-hi">{state}</strong>
          {state !== "ended" && (
            <> — it closes {new Date(campaignEndMs()).toUTCString()}.</>
          )}{" "}
          Fulfilling a request mints a 15-minute signed link to the private
          master and emails it. Nothing here grants standing access to a file.
        </p>

        {/* Counts strip */}
        <div className="mt-8 flex flex-wrap gap-2">
          {STATUSES.map((s) => {
            const n = s === "all" ? counts.total : counts[s];
            const active = filter === s;
            return (
              <Link
                key={s}
                href={`/admin/free-books?status=${s}`}
                className={[
                  "rounded-full border px-3.5 py-1.5 text-[12px] font-medium capitalize transition-colors",
                  active
                    ? "border-emerald-bright/60 bg-emerald-bright/10 text-emerald-bright"
                    : "border-white/10 text-fg-mid hover:border-white/25 hover:text-fg-hi",
                ].join(" ")}
              >
                {s} <span className="tabular-nums opacity-70">{n}</span>
              </Link>
            );
          })}
        </div>

        {rows.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-8 text-center text-sm text-fg-mid">
            No {filter === "all" ? "" : filter} requests.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full min-w-[900px] text-left text-[13px]">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.16em] text-fg-soft">
                <tr>
                  <Th>Requested</Th>
                  <Th>Email</Th>
                  <Th>Book</Th>
                  <Th>Message</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <Row key={r.id} r={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-6 text-[12px] leading-relaxed text-fg-soft">
          Customer email addresses appear on this page and nowhere else on the
          site. This route is admin-only, <code>noindex</code>, and never
          cached.
        </p>
      </main>

      <HomeFooter />
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-semibold">{children}</th>;
}

function Row({ r }: { r: AdminFreeBookRequest }) {
  return (
    <tr className="border-t border-white/6 align-top">
      <td className="whitespace-nowrap px-4 py-3 text-fg-soft tabular-nums">
        {r.createdAt.toISOString().slice(0, 16).replace("T", " ")}
      </td>
      <td className="px-4 py-3 text-fg-hi">
        {r.email}
        {r.marketingConsent && (
          <span className="ml-2 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-emerald-bright ring-1 ring-emerald-bright/30">
            list
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="text-fg-hi">{r.bookTitle}</span>
        <span className="block text-[11px] text-fg-soft">
          {r.bookSlug} · {r.format}
          {r.hasMaster === false && (
            <span className="ml-1 text-amber-300">· no master file</span>
          )}
        </span>
      </td>
      {/* React escapes this. The message is stored exactly as typed and is
          never interpolated into HTML anywhere — see the API route. */}
      <td className="max-w-[280px] px-4 py-3 text-fg-mid">
        {r.message ? (
          <span className="line-clamp-3 whitespace-pre-wrap break-words">{r.message}</span>
        ) : (
          <span className="text-fg-fade">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <StatusPill status={r.status} />
        {r.notes && (
          <span className="mt-1 block max-w-[220px] text-[11px] leading-snug text-fg-soft">
            {r.notes}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <RequestRowActions id={r.id} status={r.status} hasMaster={r.hasMaster !== false} />
      </td>
    </tr>
  );
}

function StatusPill({ status }: { status: FreeBookRequestStatus }) {
  const tone: Record<FreeBookRequestStatus, string> = {
    pending: "text-sky-300 ring-sky-300/30",
    // Amber, like `flagged`: both mean "look at this one". A row still saying
    // SENDING minutes later is a send that died mid-flight, and it needs to be
    // as visible as a request that needs judgement.
    sending: "text-amber-200 ring-amber-200/40",
    fulfilled: "text-emerald-bright ring-emerald-bright/30",
    failed: "text-red-300 ring-red-300/30",
    duplicate: "text-fg-soft ring-white/15",
    flagged: "text-amber-300 ring-amber-300/30",
  };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ring-1 ${tone[status]}`}
    >
      {status}
    </span>
  );
}
