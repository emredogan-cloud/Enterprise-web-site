import Link from "next/link";

/**
 * What a direct buyer actually receives, said before they pay.
 *
 * WHY IT EXISTS
 * The storefront used to describe the direct edition in a single cell of the
 * formats table — "DRM-free watermarked PDF" — and nowhere else. Everything a
 * buyer gets beyond that file (the online reader, the permanent library, the
 * unlimited re-download, the free companion) was true and invisible, while the
 * one thing that was NOT true — an EPUB promised in the Paddle description —
 * was the only extra a customer ever saw. This panel inverts that.
 *
 * THE RULE THIS PANEL FOLLOWS
 * Every line is derived from something the system will actually do. `hasEpub`
 * is `books.epub_file_key`, the same column the fulfillment worker branches
 * on; the companion line renders only for a companion that exists. There is no
 * prop for "say we have an EPUB" — the only way to make that line appear is to
 * put an EPUB in the bucket.
 */

export interface DirectEditionPanelProps {
  title: string;
  pageCount: number | null;
  /** True only when `books.epub_file_key` is set — see the note above. */
  hasEpub: boolean;
  /** Companion slug, when this book has a free companion pack. */
  companionSlug?: string | null;
}

function Item({ head, children }: { head: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden
        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-bright"
      />
      <span className="text-[14px] leading-relaxed text-fg-mid">
        <strong className="font-medium text-fg-hi">{head}</strong>
        {children ? <> — {children}</> : null}
      </span>
    </li>
  );
}

export function DirectEditionPanel({
  title,
  pageCount,
  hasEpub,
  companionSlug,
}: DirectEditionPanelProps) {
  return (
    <section
      aria-labelledby="direct-edition-heading"
      className="mx-auto mt-16 max-w-[900px] px-6"
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
          Buying it here
        </p>
        <h2
          id="direct-edition-heading"
          className="mt-3 font-serif text-[22px] font-medium leading-tight text-fg-hi sm:text-[26px]"
        >
          What arrives when you buy the Valice edition
        </h2>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          <Item head={hasEpub ? "PDF and EPUB" : "A watermarked PDF"}>
            {hasEpub
              ? `both files, ${pageCount ? `the ${pageCount}-page print interior` : "the print interior"} and a reflowable edition for a phone or an e-reader`
              : `${pageCount ? `all ${pageCount} pages of ` : ""}the print interior, exactly as it is set`}
          </Item>
          <Item head="No DRM">
            it opens in any reader, on every device you own, with nothing to
            activate and no account to keep
          </Item>
          <Item head="A permanent library">
            the book stays in your account at valicepress.com; we do not expire
            it and we do not take it back
          </Item>
          <Item head="Unlimited re-downloads">
            lost the file, changed laptops, four years later — download it again
          </Item>
          <Item head="Read it in the browser">
            the online reader remembers where you stopped, so a phone in a queue
            picks up from the same page
          </Item>
          {companionSlug ? (
            <Item head="The free companion">
              <Link
                href={`/companion/${companionSlug}`}
                className="text-emerald-bright underline-offset-4 hover:underline"
              >
                printable sheets for {title}
              </Link>
              , free to anyone, no email required
            </Item>
          ) : null}
        </ul>

        <p className="mt-6 text-[13px] leading-relaxed text-fg-fade">
          Each copy carries a quiet line naming the reader it was sold to. That
          is the whole of our copy protection: we would rather trust you and
          sign the book than lock it.
        </p>
      </div>
    </section>
  );
}
