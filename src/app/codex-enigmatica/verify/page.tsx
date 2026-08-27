import type { Metadata } from "next";
import Link from "next/link";

import { VerifyForm } from "@/components/codex/verify-form";
import { buildPageMetadata } from "@/lib/metadata";

/**
 * `/codex-enigmatica/verify` — the address printed on the last leaf of
 * Codex Enigmatica.
 *
 * THE CONTRACT THIS PAGE IMPLEMENTS, quoted from the book itself:
 *
 *   "You can check your answers against the solutions in the back matter.
 *    The last question's answer is NOT in the back matter and is printed
 *    nowhere in this book.
 *
 *    You enter it on the VERIFICATION PAGE, whose address is printed on
 *    the last leaf of this book. That page levels case, spacing and
 *    punctuation BEFORE it compares; only the letters matter."
 *
 * Every clause of that is load-bearing and every clause is honoured:
 * the answer is nowhere in this repository (a peppered digest lives in a
 * server-only env var), and the normalization is implemented literally in
 * `@/lib/codex-verify`.
 *
 * ⚠ `noindex`. Not because the page is secret — the URL is printed in a
 * commercial book and is meant to be typed — but because a puzzle
 * verification endpoint in a search index invites crawlers, scrapers and
 * "answer to codex enigmatica" SERP pages. The reader arrives from the
 * book's last leaf; nobody needs to arrive from Google.
 *
 * Server Component. The only client code is the form itself.
 */
export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Codex Enigmatica — verification",
    description:
      "Enter the answer to the last question of Codex Enigmatica. Case, spacing and punctuation are levelled before comparison.",
    path: "/codex-enigmatica/verify",
    ogTitle: "Codex Enigmatica — verification",
    type: "website",
  }),
  robots: { index: false, follow: false },
};

export default function CodexVerifyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      {/* Breadcrumb — same construction as the legal shell */}
      <nav
        aria-label="Breadcrumb"
        className="text-[11px] uppercase tracking-[0.2em] text-fg-soft"
      >
        <Link href="/" className="transition-colors hover:text-emerald-bright">
          Home
        </Link>
        <span aria-hidden className="mx-2 text-emerald-bright">
          /
        </span>
        <span className="text-fg-hi">Codex Enigmatica</span>
      </nav>

      <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
        Verification
      </p>

      {/* Diamond ornament — the micro-detail every cinematic hero carries */}
      <div className="relative mt-4 flex h-6 w-6 items-center justify-center">
        <div
          aria-hidden
          className="absolute h-6 w-6 rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, rgba(51, 240, 170, 0.7) 0%, transparent 70%)",
          }}
        />
        <span
          aria-hidden
          className="catalog-diamond block h-2 w-2 rounded-[1px] bg-[#33f0aa]"
          style={{ transform: "rotate(45deg)" }}
        />
      </div>

      <h1 className="mt-6 font-serif text-[40px] font-medium leading-[1.1] tracking-[-0.025em] text-fg-hi sm:text-[52px]">
        Have you reached the final answer?
      </h1>

      <div className="mt-8 space-y-5 text-lg leading-relaxed text-fg-mid">
        <p>
          This is the page the last leaf of{" "}
          <em className="text-fg-hi not-italic">Codex Enigmatica</em> points
          at. One hundred puzzles give five sayings, and the five sayings meet
          in a single word. That word is printed nowhere in the book.
        </p>
        <p>
          Type it below. Nothing is recorded, nothing is scored, and a wrong
          answer costs you nothing but the typing.
        </p>
      </div>

      <VerifyForm />

      {/*
        Edition identification. A reader holding a copy needs to know this
        page is for the copy in their hands — and a future second edition
        with different answers will need its own route rather than
        silently breaking every printed first edition.
      */}
      <div className="mt-16 border-t border-white/[0.06] pt-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-fg-soft">
          Edition
        </p>
        <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-fg-soft">Title</dt>
          <dd className="text-fg-mid">
            Codex Enigmatica — One Hundred Engraved Enigmas and a Single
            Unbroken Mystery
          </dd>
          <dt className="text-fg-soft">Publisher</dt>
          <dd className="text-fg-mid">Vâliçe Press</dd>
          <dt className="text-fg-soft">Edition</dt>
          <dd className="text-fg-mid">First edition (English)</dd>
        </dl>
        <p className="mt-6 text-sm leading-relaxed text-fg-soft">
          If you are holding a later edition, use the address printed on its
          own last leaf — the answers are not shared between editions.
        </p>
      </div>

      {/* Where to go next — the flow does not dead-end here. */}
      <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm">
        <Link
          href="/books"
          className="text-fg-mid transition-colors hover:text-emerald-bright"
        >
          Browse the catalogue →
        </Link>
        <Link
          href="/privacy"
          className="text-fg-soft transition-colors hover:text-emerald-bright"
        >
          Privacy
        </Link>
        <a
          href="mailto:emre30283@gmail.com?subject=Codex%20Enigmatica"
          className="text-fg-soft transition-colors hover:text-emerald-bright"
        >
          Contact the publisher
        </a>
      </div>
    </article>
  );
}
