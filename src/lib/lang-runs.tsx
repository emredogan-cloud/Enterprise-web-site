import { Fragment, type ReactNode } from "react";

/**
 * Wrap runs of Hangul in `<span lang="ko">`.
 *
 * WHY
 * WCAG 2.2 SC 3.1.2 (Language of Parts, Level AA) asks that a passage in a
 * different language be marked as such, so assistive technology pronounces it
 * correctly rather than reading Korean with an English voice. The product has
 * exactly one such passage — "Hangul practice grid (원고지 style)" on
 * `/companion/hangul` — mixed into an otherwise English string, so it cannot be
 * marked by putting `lang` on the whole element.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO
 * It does not change which font renders the Hangul. On the reference device
 * (Redmi Note 8, Android 11) every Korean family name — `Noto Sans KR`,
 * `Noto Sans CJK KR`, `Apple SD Gothic Neo`, `Malgun Gothic`, `Nanum Gothic` —
 * resolves to the same physical face, `Noto Sans CJK SC`, because Android ships
 * a single unified CJK font. A CSS fallback stack is provably a no-op there,
 * and shipping a Korean webfont for three distinct glyphs on one route would
 * cost tens of kilobytes for a typographic nicety. See PHASE_7_REPORT.md.
 *
 * The marking is still worth having on its own terms, and it makes a
 * `:lang(ko)` rule possible the day a Korean face is actually available.
 */
const HANGUL = /([ᄀ-ᇿ㄰-㆏가-힯]+)/g;

export function withLangRuns(text: string): ReactNode {
  if (!HANGUL.test(text)) return text;
  HANGUL.lastIndex = 0;

  const parts = text.split(HANGUL);
  return parts.map((part, i) =>
    // `split` with a capturing group puts the matches at the odd indices.
    i % 2 === 1 ? (
      <span key={i} lang="ko">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
