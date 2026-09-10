"use client";

import { useState } from "react";

import { FreeBookModal, type FreeBookSubject } from "./free-book-modal";
import { useCampaign, usePrefersReducedMotion } from "./use-campaign";

/**
 * The gift-box CTA that sits beside an ebook's price.
 *
 * WHY IT IS A BUTTON AND NOT A LINK
 * The card it lives on is already one big link to the product page (an overlay
 * `<a>` covering the whole card). A gift box that navigated would be a second
 * destination inside a single click target, and on a touch screen the two are
 * a coin toss. So this is a real `<button>` at a higher stacking level that
 * stops the event before the card's overlay link sees it — the same pattern
 * the wishlist button on that card already uses.
 *
 * WHY IT DISAPPEARS BY ITSELF
 * The shelves are `revalidate = 3600`, so this markup can be served an hour
 * after the promotion ends. `useCampaign()` checks the server clock and the
 * box removes itself. The API refuses too — this is the courtesy, that is the
 * gate.
 *
 * WHY THE LABEL IS A PROP
 * "FREE" in English, "ÜCRETSİZ" in Turkish. The brief named both; the site is
 * English, so English is the default and the Turkish label is available for
 * the Turkish surfaces without a second component.
 */
export function GiftBox({
  book,
  label = "FREE",
  size = "sm",
}: {
  book: FreeBookSubject;
  label?: string;
  size?: "sm" | "lg";
}) {
  const { open } = useCampaign();
  const reduced = usePrefersReducedMotion();
  const [modalOpen, setModalOpen] = useState(false);

  if (!open) return null;

  const lg = size === "lg";

  return (
    <>
      <button
        type="button"
        // The card wraps everything in an overlay link. Without both of these
        // a tap on the gift box navigates to the product page instead of
        // opening the modal — which reads as the button being broken.
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setModalOpen(true);
        }}
        aria-haspopup="dialog"
        aria-label={`Request ${book.title} free during the limited-time promotion`}
        className={[
          "gift-box relative z-[3] inline-flex shrink-0 items-center gap-1.5 rounded-full border font-bold uppercase tracking-[0.14em] transition-transform",
          lg ? "px-4 py-2 text-[12px]" : "px-2.5 py-1 text-[10px]",
          reduced ? "" : "gift-box--alive",
        ].join(" ")}
        style={{
          borderColor: "rgba(226, 192, 116, 0.55)",
          background:
            "linear-gradient(140deg, rgba(247,222,160,0.96) 0%, rgba(214,178,102,0.96) 55%, rgba(184,146,72,0.96) 100%)",
          color: "#2a1f06",
          boxShadow:
            "0 6px 16px -8px rgba(214,178,102,0.9), inset 0 1px 0 rgba(255,255,255,0.45)",
        }}
      >
        <GiftGlyph className={lg ? "h-4 w-4" : "h-3 w-3"} />
        {label}
      </button>

      {modalOpen && (
        <FreeBookModal book={book} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

/**
 * The box itself, drawn rather than imported.
 *
 * `lucide-react`'s `Gift` is a fine icon but it is one path with a fixed lid.
 * This one has the lid as its own group so the opening animation in the modal
 * can hinge it, and the two halves stay in register because they are drawn on
 * the same 24-unit grid.
 */
export function GiftGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9Z" />
        <path d="M3 7.5h18v3.5H3z" />
        <path d="M12 7.5V21" />
        <path d="M12 7.5S10.5 3 8 3a2.2 2.2 0 0 0 0 4.5Z" />
        <path d="M12 7.5S13.5 3 16 3a2.2 2.2 0 0 1 0 4.5Z" />
      </g>
    </svg>
  );
}
