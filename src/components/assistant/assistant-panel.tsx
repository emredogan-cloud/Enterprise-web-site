"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/components/campaign/use-campaign";

/**
 * The conversation itself.
 *
 * Loaded on demand by `<AssistantLauncher>` — nothing in this file is in the
 * bundle of a visitor who never opens it.
 *
 * IT IS NOT A MODAL, AND THAT IS DELIBERATE.
 * The gift modal traps focus because it asks for an email address and there is
 * one thing to do. This is a panel someone keeps open *while* they read a book
 * page; trapping focus in it would mean they could not tab to the page they
 * came for. So: `role="dialog"` with `aria-modal="false"`, focus moved in on
 * open as a convenience, Escape to close, focus handed back to the launcher —
 * and the rest of the page stays completely usable, scroll included. Nothing
 * here touches `document.body`.
 *
 * WHY IT STREAMS AS PLAIN TEXT
 * The route answers `text/plain`, not a framework-specific stream envelope, so
 * this reads it with `fetch` + a `TextDecoder` in about twenty lines and the
 * page carries no chat-client library at all. Tool calls happen server-side;
 * by the time anything arrives here it is prose.
 */

interface Turn {
  role: "user" | "assistant";
  content: string;
}

const OPENERS = [
  "What do you publish?",
  "Which books are free right now?",
  "How does the free ebook work?",
];

/** `/books/<slug>` is the only route whose slug is a book. */
function bookSlugFromPath(pathname: string): string | null {
  const m = /^\/books\/([a-z0-9-]+)\/?$/.exec(pathname);
  return m ? m[1]! : null;
}

export function AssistantPanel({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Focus the input on open — the only reason anyone opens this is to type.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape closes, from anywhere inside the panel or out of it. Captured on
  // the document because the visitor may well have tabbed back to the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // A stream outliving its panel would write into a dead component and, worse,
  // keep spending on an answer nobody is reading.
  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, busy]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || busy) return;

      const history: Turn[] = [...turns, { role: "user", content: question }];
      setTurns([...history, { role: "assistant", content: "" }]);
      setDraft("");
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: history,
            page: { path: pathname, bookSlug: bookSlugFromPath(pathname) },
          }),
        });

        if (!res.ok || !res.body) throw new Error(String(res.status));

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          // Replace the trailing (empty) assistant turn as the text arrives.
          setTurns([...history, { role: "assistant", content: acc }]);
        }
        if (!acc.trim()) throw new Error("empty");
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        // Whatever went wrong, the visitor gets a sentence and a way forward —
        // never a status code, a provider name or a stack.
        setTurns([
          ...history,
          {
            role: "assistant",
            content:
              "Sorry — I couldn't answer that one. Everything we publish is at /books, " +
              "and the free-ebook offer is on every ebook page at /ebooks.",
          },
        ]);
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, pathname, turns],
  );

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Ask about our books"
      className={[
        "fixed z-40 flex flex-col overflow-hidden rounded-2xl border shadow-2xl print:hidden",
        "bottom-20 right-4 left-4 max-h-[min(30rem,70vh)] sm:bottom-24 sm:right-6 sm:left-auto sm:w-[24rem]",
        reduced ? "" : "promo-card-in",
      ].join(" ")}
      style={{
        borderColor: "rgba(214,178,102,0.32)",
        background: "linear-gradient(160deg, rgba(20,30,24,0.98) 0%, rgba(9,18,14,0.99) 72%)",
        backdropFilter: "blur(10px)",
      }}
    >
      <header
        className="flex items-center justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: "rgba(214,178,102,0.18)" }}
      >
        <div className="min-w-0">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.26em]"
            style={{ color: "#d6b266" }}
          >
            Valice Press
          </p>
          <p className="text-[13px] text-fg-mid">Ask about our books</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the reading assistant"
          className="shrink-0 rounded-full p-1.5 text-fg-soft transition-colors hover:bg-white/5 hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6b266]/60"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden focusable="false">
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div
        ref={scrollRef}
        // A live region so a screen-reader user hears the answer arrive without
        // having to go looking for it. Polite, so it never interrupts.
        aria-live="polite"
        aria-atomic="false"
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {turns.length === 0 ? (
          <div className="space-y-3">
            <p className="text-[13px] leading-relaxed text-fg-mid">
              I can look anything up in our catalogue — subjects, authors, formats, prices,
              and how the free-ebook offer works.
            </p>
            <div className="flex flex-wrap gap-2">
              {OPENERS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void send(q)}
                  className="rounded-full border px-3 py-1.5 text-[12px] text-fg-mid transition-colors hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6b266]/60"
                  style={{ borderColor: "rgba(214,178,102,0.28)" }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          turns.map((t, i) => <Bubble key={i} turn={t} pending={busy && i === turns.length - 1} />)
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
        className="flex items-end gap-2 border-t px-3 py-3"
        style={{ borderColor: "rgba(214,178,102,0.18)" }}
      >
        <label htmlFor="assistant-input" className="sr-only">
          Your question
        </label>
        <textarea
          id="assistant-input"
          ref={inputRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends; Shift+Enter is a newline. The other way round in a
            // one-line box means every visitor's first message is an empty one.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(draft);
            }
          }}
          maxLength={1000}
          placeholder="Ask about a book…"
          className="max-h-24 min-h-[2.25rem] flex-1 resize-none rounded-xl border bg-transparent px-3 py-2 text-[13px] text-fg-hi placeholder:text-fg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6b266]/50"
          style={{ borderColor: "rgba(214,178,102,0.24)" }}
        />
        <button
          type="submit"
          disabled={busy || draft.trim() === ""}
          aria-label="Send"
          className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6b266]/60"
          style={{
            background: "linear-gradient(140deg, rgba(247,222,160,0.95) 0%, rgba(214,178,102,0.95) 100%)",
            color: "#2a1f06",
          }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden focusable="false">
            {/* A paper plane pointing at the send direction. */}
            <path d="M3 3l18 9-18 9 4-9-4-9Z" fill="currentColor" />
          </svg>
        </button>
      </form>
    </div>
  );
}

function Bubble({ turn, pending }: { turn: Turn; pending: boolean }) {
  if (turn.role === "user") {
    return (
      <p
        className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 text-[13px] leading-relaxed"
        style={{ background: "rgba(214,178,102,0.16)", color: "#f0e7d2" }}
      >
        {turn.content}
      </p>
    );
  }
  if (pending && turn.content === "") {
    return (
      <p className="text-[13px] text-fg-soft" aria-label="Looking that up">
        <span className="assistant-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </p>
    );
  }
  return (
    <p className="max-w-[92%] whitespace-pre-wrap text-[13px] leading-relaxed text-fg-mid">
      {linkify(turn.content)}
    </p>
  );
}

/**
 * Turn the site paths in an answer into real links.
 *
 * The assistant is told to write plain paths like `/books/<slug>` rather than
 * markdown, so there is no parser here and no markdown dependency — just the
 * one pattern the prompt promises, made clickable. Anything that is not a
 * site path is left exactly as it was written, which is the safe default: this
 * renders as text nodes, so a model that emitted HTML would produce visible
 * angle brackets rather than markup.
 */
function linkify(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\/(?:books|ebooks|categories|authors|companion|blog|search|cart|about)(?:\/[a-z0-9-]+)*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    // Trailing punctuation belongs to the sentence, not to the URL.
    const raw = m[1]!;
    const href = raw.replace(/[.,;:!?)]+$/, "");
    out.push(
      <Link
        key={`l${key++}`}
        href={href}
        className="font-medium underline decoration-[#d6b266]/40 underline-offset-2 transition-colors hover:text-[#f0dfae]"
        style={{ color: "#e2c074" }}
      >
        {href}
      </Link>,
    );
    if (href.length < raw.length) out.push(raw.slice(href.length));
    last = m.index + raw.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
