import manifest from "./manifest.json";

/**
 * Book previews — real pages, rendered to WebP by
 * `scripts/catalog/build-previews.mjs` from the same PDFs the buyer gets.
 *
 * The manifest is generated, never hand-edited: a page can only be listed
 * here because it was actually rendered, so the product page cannot end up
 * pointing at an image that does not exist. Regenerate it whenever a
 * preview range changes in `scripts/catalog/preview-pages.mjs`.
 */

export interface PreviewPage {
  /** Public path under /images/previews. */
  src: string;
  /** The page number as printed in the book. */
  page: number;
}

export interface BookPreview {
  /** One line on what this run of pages shows, and why it was chosen. */
  note: string;
  pages: PreviewPage[];
}

const PREVIEWS = manifest as Record<string, BookPreview>;

/**
 * The preview for a book, or `null` when none has been rendered.
 *
 * Null is a normal state, not an error: a draft title, or one whose source
 * PDF is not on this machine, simply has no preview and the product page
 * omits the section entirely.
 */
export function getPreview(slug: string): BookPreview | null {
  const preview = PREVIEWS[slug];
  return preview && preview.pages.length > 0 ? preview : null;
}

/** Slugs that have a rendered preview. Used by tests and reporting. */
export function previewSlugs(): string[] {
  return Object.keys(PREVIEWS).filter((s) => getPreview(s) !== null);
}
