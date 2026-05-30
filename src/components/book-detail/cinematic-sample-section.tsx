/**
 * Cinematic sample section — wraps the SSG-rendered sample HTML in a
 * `home-glass` editorial frame with the same `cinematic-prose` typography
 * the blog uses for long-form reading (drop cap, emerald HR, glass
 * blockquotes).
 *
 * Phase 1.C. Pure Server Component. SEO-critical: the sample HTML lands
 * in the static payload at SSG time so crawlers see real writing inside
 * what is otherwise a paywalled file (Roadmap §13).
 *
 * Input-trust policy is identical to the warm `<SampleViewer>` — the
 * current sample source is our own controlled placeholder constant.
 */
export function CinematicSampleSection({ content }: { content: string }) {
  return (
    <section className="mx-auto mt-24 max-w-4xl px-4 sm:px-6">
      {/* Header */}
      <header className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
          Preview
        </p>

        {/* Diamond ornament */}
        <div className="relative mx-auto mt-4 flex h-6 w-6 items-center justify-center">
          <div
            aria-hidden
            className="absolute h-6 w-6 rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(circle, rgba(51,240,170,0.7) 0%, transparent 70%)",
            }}
          />
          <span
            aria-hidden
            className="catalog-diamond block h-2 w-2 rounded-[1px] bg-[#33f0aa]"
            style={{ transform: "rotate(45deg)" }}
          />
        </div>

        <h2 className="mt-5 font-serif text-[32px] font-medium leading-tight text-fg-hi sm:text-[40px]">
          A taste of the writing
        </h2>
        <p className="mt-4 text-fg-mid">
          Read the opening pages before you buy.
        </p>
      </header>

      {/* Glass-framed prose body */}
      <article
        className="home-glass relative mt-12 overflow-hidden rounded-[24px] p-8 sm:p-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/30 to-transparent"
        />
        <div
          className="cinematic-prose"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>
    </section>
  );
}
