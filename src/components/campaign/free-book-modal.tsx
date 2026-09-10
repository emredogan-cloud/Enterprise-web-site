"use client";

import { Check, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { CAMPAIGN_REASON } from "@/lib/campaign";
import { formatCatalogPrice } from "@/lib/format";
import { subscribeToNewsletter } from "@/lib/newsletter-client";

import { GiftGlyph } from "./gift-box";
import { usePrefersReducedMotion } from "./use-campaign";

/**
 * Everything the modal needs to describe ONE book truthfully.
 *
 * `slug` is the only field the server trusts. Title, price and cover are
 * passed for rendering; the API looks all three up again from the slug so a
 * hand-edited payload cannot change what is recorded or what is delivered.
 */
export interface FreeBookSubject {
  slug: string;
  title: string;
  author?: string | null;
  /** Short description. Trimmed for the modal; the full text is on the page. */
  description?: string | null;
  priceCents: number;
  currency?: string;
  coverSrc?: string | null;
  pageCount?: number | null;
  /** e.g. "Watermarked PDF · Valice Classics". Rendered verbatim. */
  edition?: string | null;
}

type Phase = "form" | "sending" | "done" | "duplicate";

/**
 * The free-book request modal.
 *
 * THE ONE RULE THIS COMPONENT EXISTS TO KEEP
 * Nothing here is conditional on an Amazon review. The review line appears
 * only AFTER a successful request, is worded as a favour rather than a
 * requirement, says out loud that it changes nothing, and has no field to
 * report back through. There is no "paste your review link", no upload, no
 * second book unlocked by one. Amazon permits free copies and permits asking
 * for an honest review; it forbids requiring one or trying to influence what
 * it says. The wording below is written to be defensible against that rule
 * read strictly.
 *
 * ACCESSIBILITY
 * `role="dialog"` + `aria-modal`, focus moved to the panel on open and
 * returned to the trigger on close, Escape closes, Tab is trapped inside, the
 * backdrop is click-to-close, and the celebration is skipped entirely under
 * `prefers-reduced-motion`. The success state is announced through a polite
 * live region rather than by moving focus, so a screen-reader user is told
 * what happened without being yanked.
 */
export function FreeBookModal({
  book,
  onClose,
}: {
  book: FreeBookSubject;
  onClose: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<Element | null>(null);
  const titleId = useId();
  const descId = useId();

  const [phase, setPhase] = useState<Phase>("form");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => onClose(), [onClose]);

  // MOUNT-ONLY. This effect must not re-run, and the empty dependency array is
  // load-bearing rather than lazy.
  //
  // It used to depend on `close`, which is rebuilt whenever `onClose` changes
  // — and `onClose` is an inline arrow in <GiftBox>, so it changed on every
  // render. The effect therefore re-ran constantly and re-captured
  // `document.activeElement`, which by then was whatever the keyboard user had
  // tabbed to *inside* the dialog. On close, focus was handed back to an
  // element that no longer existed and the browser dropped it on <body>, which
  // is precisely the bug returning focus is supposed to prevent. Caught by
  // keyboard-testing the close path rather than by reading the code.
  //
  // Focus is restored in the CLEANUP, not in the close handler: `useEffect`
  // cleanup runs after React has removed the dialog from the DOM, so the
  // browser cannot blur what we just focused. It also covers every way the
  // dialog can go away — Escape, the close button, the backdrop, or the parent
  // simply unmounting.
  useEffect(() => {
    const trigger = document.activeElement;
    returnFocusRef.current = trigger;

    // Focus the panel rather than the email field: announcing the dialog's
    // name and purpose first is the point of a dialog, and jumping straight
    // into a text input skips it.
    panelRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      const el = returnFocusRef.current;
      if (el instanceof HTMLElement && document.contains(el)) el.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const root = panelRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === root)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [close]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      emailRef.current?.focus();
      return;
    }

    setPhase("sending");
    let res: Response;
    try {
      res = await fetch("/api/free-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          slug: book.slug,
          message: message.trim() || undefined,
          marketingConsent: consent,
          website: honeypot,
        }),
      });
    } catch {
      setPhase("form");
      setError("We couldn't reach the server. Please check your connection and try again.");
      return;
    }

    if (!res.ok) {
      setPhase("form");
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(errorMessage(res.status, body.error));
      return;
    }

    const body = (await res.json().catch(() => ({}))) as { status?: string };

    // The mailing list is a separate consent and therefore a separate call, to
    // the endpoint that already owns the audience, the verbatim consent
    // sentence and the welcome mail. It is fired after the request has
    // succeeded and its failure is swallowed: the book request stands either
    // way, and telling someone their book failed because a newsletter did
    // would be false.
    if (consent) {
      void subscribeToNewsletter(trimmed, "free-ebook-campaign");
    }

    setPhase(body.status === "duplicate" ? "duplicate" : "done");
  }

  const priceLabel = formatCatalogPrice(book.priceCents, book.currency ?? "USD");
  const showsRealPrice = book.priceCents > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        aria-hidden
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className={[
          "relative z-[1] w-full max-w-3xl overflow-hidden rounded-t-[24px] border bg-[#0c1813] shadow-2xl outline-none sm:rounded-[24px]",
          reduced ? "" : "free-book-modal-in",
        ].join(" ")}
        style={{ borderColor: "rgba(214,178,102,0.28)" }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-[2] rounded-full p-2 text-fg-soft transition-colors hover:bg-white/5 hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6b266]/60"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>

        <div className="grid gap-0 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* ---------------------------------------------------------------
              LEFT — the book. Cover, title, short description, the real price
              struck through, $0.00, edition line. Every value comes from the
              card that was clicked, so the wrong book cannot appear here.
              --------------------------------------------------------------- */}
          <aside
            className="border-b border-white/5 p-6 sm:border-b-0 sm:border-r"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <div className="mx-auto w-[140px] overflow-hidden rounded-lg shadow-lg sm:w-[160px]">
              {book.coverSrc ? (
                <Image
                  src={book.coverSrc}
                  alt=""
                  width={320}
                  height={480}
                  className="h-auto w-full"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center bg-[#12241d] text-center text-[11px] text-fg-soft">
                  {book.title}
                </div>
              )}
            </div>

            <h3
              id={titleId}
              className="mt-4 font-serif text-[19px] font-medium leading-snug text-fg-hi"
            >
              {book.title}
            </h3>
            {book.author && (
              <p className="mt-1 text-xs text-fg-soft">{book.author}</p>
            )}

            {book.description && (
              <p className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-fg-mid">
                {book.description}
              </p>
            )}

            <div className="mt-4 flex items-baseline gap-3">
              {/* A struck-through price is only honest when there IS one. A
                  book whose `price_cents` is 0 is not sold on this site at any
                  price (see `formatCatalogPrice`), so striking through "$0"
                  would invent a discount. Those books show the free line
                  alone. */}
              {showsRealPrice && (
                <span className="text-[15px] text-fg-soft line-through tabular-nums">
                  {priceLabel}
                </span>
              )}
              <span
                className="font-serif text-[26px] font-medium tabular-nums"
                style={{ color: "#e9d49a" }}
              >
                $0.00
              </span>
            </div>

            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-fg-soft">
              {book.edition ??
                `Watermarked PDF${book.pageCount ? ` · ${book.pageCount} pages` : ""}`}
            </p>
          </aside>

          {/* ---------------------------------------------------------------
              RIGHT — the request.
              --------------------------------------------------------------- */}
          <div className="p-6 sm:p-7">
            {phase === "done" || phase === "duplicate" ? (
              <SuccessPanel
                duplicate={phase === "duplicate"}
                title={book.title}
                reduced={reduced}
                onClose={close}
              />
            ) : (
              <form onSubmit={submit} noValidate>
                <p
                  className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em]"
                  style={{ color: "#d6b266" }}
                >
                  <GiftGlyph className="h-4 w-4" />
                  Limited-time promotion
                </p>

                <h4 className="mt-3 font-serif text-[22px] font-medium leading-tight text-fg-hi">
                  This ebook is yours, free.
                </h4>

                <p id={descId} className="mt-3 text-[14px] leading-relaxed text-fg-mid">
                  You&apos;re eligible to receive this ebook free during our
                  limited-time Valice Press promotion. {CAMPAIGN_REASON}
                </p>

                <div className="mt-5">
                  <label
                    htmlFor="free-book-email"
                    className="block text-[13px] font-medium text-fg-hi"
                  >
                    Email address
                  </label>
                  <p className="mt-1 text-[12px] text-fg-soft">
                    Enter your email address to receive the PDF.
                  </p>
                  <input
                    ref={emailRef}
                    id="free-book-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "free-book-error" : undefined}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-[15px] text-fg-hi placeholder:text-fg-fade focus:border-[#d6b266]/60 focus:outline-none focus:ring-2 focus:ring-[#d6b266]/25"
                  />
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="free-book-message"
                    className="block text-[13px] font-medium text-fg-hi"
                  >
                    Message / request{" "}
                    <span className="font-normal text-fg-soft">(optional)</span>
                  </label>
                  <textarea
                    id="free-book-message"
                    name="message"
                    rows={3}
                    maxLength={1000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Anything you'd like us to know — another title you're after, a format question, or nothing at all."
                    className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-[14px] text-fg-hi placeholder:text-fg-fade focus:border-[#d6b266]/60 focus:outline-none focus:ring-2 focus:ring-[#d6b266]/25"
                  />
                </div>

                <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-relaxed text-fg-mid">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-black/30 accent-[#d6b266]"
                  />
                  <span>
                    Email me occasionally about new books and editions. Optional
                    — leaving this unticked does not affect your free book.
                  </span>
                </label>

                {/* Honeypot. Off-screen rather than display:none — some bots
                    skip hidden fields — and marked so assistive tech ignores
                    it and autofill never touches it. */}
                <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
                  <label htmlFor="free-book-website">Website</label>
                  <input
                    id="free-book-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {error && (
                  <p
                    id="free-book-error"
                    role="alert"
                    className="mt-3 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-[13px] text-red-200"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={phase === "sending"}
                  className="home-cta-primary mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {phase === "sending" ? (
                    <>
                      <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send me the ebook"
                  )}
                </button>

                <p className="mt-3 text-[11.5px] leading-relaxed text-fg-soft">
                  We use your address to send this book and nothing else unless
                  you ticked the box above.{" "}
                  <a
                    href="/privacy"
                    className="underline decoration-dotted underline-offset-2 hover:text-fg-mid"
                  >
                    Privacy notice
                  </a>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function errorMessage(status: number, code?: string): string {
  if (status === 409) {
    return "The promotion has just ended, so we can't take new requests. Sorry — you were very close.";
  }
  if (status === 429) {
    return "That's a lot of books in a short time. Please give it a few minutes, or reply to one of our emails and we'll help directly.";
  }
  if (code === "invalid-email") return "Please enter a valid email address.";
  if (code === "message-too-long") return "That message is a little long — please trim it to 1000 characters.";
  if (code === "unknown-book" || code === "invalid-book") {
    return "We couldn't find that book. Please refresh the page and try again.";
  }
  return "Something went wrong on our side. Please try again in a moment.";
}

/**
 * The confirmation.
 *
 * Two honest claims and one honest non-claim:
 *   - "Request received" — true the moment the row is written.
 *   - "within 24 hours" — the brief's wording, and it is the truthful one:
 *     delivery is an operator action against a signed URL, not an automatic
 *     send. Promising "instantly" would be a lie the first time someone
 *     refreshed their inbox.
 *   - the review line makes no claim at all about what a review should say and
 *     states plainly that it changes nothing.
 */
function SuccessPanel({
  duplicate,
  title,
  reduced,
  onClose,
}: {
  duplicate: boolean;
  title: string;
  reduced: boolean;
  onClose: () => void;
}) {
  return (
    <div aria-live="polite">
      <div className="flex items-center gap-3">
        <span
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            reduced ? "" : "free-book-pop",
          ].join(" ")}
          style={{
            background: "linear-gradient(140deg, #f7dea0 0%, #d6b266 100%)",
            color: "#2a1f06",
          }}
        >
          <Check aria-hidden className="h-5 w-5" strokeWidth={3} />
        </span>
        <div>
          <h4 className="font-serif text-[20px] font-medium text-fg-hi">
            {duplicate ? "You've already asked for this one" : "Request received."}
          </h4>
          <p className="text-[13px] text-fg-soft">{title}</p>
        </div>
      </div>

      <p className="mt-4 text-[14px] leading-relaxed text-fg-mid">
        {duplicate ? (
          <>
            We already have a request for this title from your address, so we
            haven&apos;t queued a second one. If the first email hasn&apos;t
            arrived, check your spam folder — and if it still isn&apos;t there,
            reply to any Valice Press email and we&apos;ll send it straight
            over.
          </>
        ) : (
          <>You&apos;ll receive your PDF by email within 24 hours.</>
        )}
      </p>

      <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.02] p-4">
        <p className="text-[13px] leading-relaxed text-fg-mid">
          If you have time after reading, we&apos;d be grateful for an honest
          review on Amazon. Reviews are completely optional and do not affect
          your eligibility for free books.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onClose}
          className="home-cta-primary inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[13px] font-semibold"
        >
          Keep browsing
        </button>
        <a
          href="/ebooks"
          className="home-cta-secondary inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[13px] font-semibold"
        >
          See every ebook
        </a>
      </div>
    </div>
  );
}
