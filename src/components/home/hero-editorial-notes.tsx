/**
 * The three pieces of marginalia set into the hero photograph.
 *
 * They are the detail that makes the reference read as a printed page rather
 * than a landing page: a caption beside the image, a short list of what the
 * press is, and a line of italic copy signing off the bottom right corner.
 *
 * ALL THREE ARE HTML. None of it is drawn into the picture, so all of it is
 * selectable, translatable and readable by a screen reader — and none of it
 * has to be regenerated when the wording changes.
 *
 * Hidden below `lg`. On a narrow screen the photograph is behind the headline
 * and these would sit on top of the books; they are grace notes, and a grace
 * note that gets in the way is just an obstacle.
 */
export function HeroEditorialNotes() {
  return (
    <>
      {/* Left caption, tucked against the books' edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[30%] top-[22%] hidden xl:block"
      >
        <div className="flex gap-3">
          <span
            className="mt-1 block h-14 w-px shrink-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 100%)",
            }}
          />
          <p className="text-[9.5px] font-medium uppercase leading-[2.1] tracking-[0.3em] text-white/55">
            Ideas
            <br />
            travel
            <br />
            further
            <br />
            here.
          </p>
        </div>
      </div>

      {/* Right-hand list. Not decorative — it is three true claims about the
          press, so it stays in the accessibility tree as a list. */}
      <ul className="pointer-events-none absolute right-5 top-[18%] hidden w-[150px] list-none space-y-2.5 xl:block 2xl:right-10">
        <li className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-1 w-1 shrink-0 rounded-full bg-[#33f0aa] shadow-[0_0_6px_#33f0aa]"
          />
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Independent publishing
          </span>
        </li>
        <li
          aria-hidden
          className="h-px w-8"
          style={{ background: "rgba(255,255,255,0.22)" }}
        />
        <li>
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Curated editions
          </span>
        </li>
        <li
          aria-hidden
          className="h-px w-8"
          style={{ background: "rgba(255,255,255,0.22)" }}
        />
        <li>
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Yours to keep
          </span>
        </li>
      </ul>

      {/* Bottom-right sign-off. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[26%] right-5 hidden text-right xl:block 2xl:right-10"
      >
        <p className="font-serif text-[13px] italic leading-[1.6] text-white/60">
          Books
          <br />
          for a more
          <br />
          intentional
          <br />
          world.
        </p>
        <span
          className="ml-auto mt-3 block h-px w-10"
          style={{ background: "rgba(255,255,255,0.28)" }}
        />
      </div>
    </>
  );
}
