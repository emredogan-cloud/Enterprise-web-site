/**
 * Demo genre catalog — 8 hand-curated genres backing the `/genres`
 * discovery page until a real `genres` table + queries land.
 *
 * Each entry carries:
 *   - identity (slug, name, description)
 *   - book count (formatted display string)
 *   - applicable formats (drives the format dropdown filter)
 *   - an `artwork` theme that the `<GenreArtwork>` SVG renderer switches on
 */

export type GenreArtworkKind =
  | "book"
  | "planet"
  | "plant"
  | "king"
  | "column"
  | "chip"
  | "bust"
  | "camera";

export interface DemoGenre {
  slug: string;
  name: string;
  description: string;
  bookCountLabel: string;
  formats: ReadonlyArray<"PDF" | "EPUB" | "MOBI">;
  artwork: {
    kind: GenreArtworkKind;
    /** Two-stop background gradient for the circular artwork backdrop. */
    bg: [string, string];
    /** Primary symbol color (the glowing object itself). */
    glow: string;
    /** Outer halo color (radial bloom). */
    halo: string;
  };
  /** Server-resolved real artwork path (/images/genres/{slug}.webp) or null.
   *  Set by the page; the SVG symbol renders when null. */
  imageSrc?: string | null;
}

export const FORMAT_OPTIONS = ["All Formats", "PDF", "EPUB", "MOBI"] as const;
export type FormatFilter = (typeof FORMAT_OPTIONS)[number];

export const DEMO_GENRES: DemoGenre[] = [
  {
    slug: "fiction",
    name: "Fiction",
    description: "Lose yourself in imaginative worlds and unforgettable stories.",
    bookCountLabel: "12,540 books",
    formats: ["PDF", "EPUB", "MOBI"],
    artwork: {
      kind: "book",
      bg: ["#3a2210", "#0d0608"],
      glow: "#ffce63",
      halo: "rgba(255, 178, 90, 0.35)",
    },
  },
  {
    slug: "science-fiction",
    name: "Science Fiction",
    description: "Explore the future, space, and endless possibilities.",
    bookCountLabel: "7,932 books",
    formats: ["PDF", "EPUB", "MOBI"],
    artwork: {
      kind: "planet",
      bg: ["#0e1c34", "#04081a"],
      glow: "#7ab6ff",
      halo: "rgba(122, 182, 255, 0.32)",
    },
  },
  {
    slug: "personal-growth",
    name: "Personal Growth",
    description: "Daily habits, mindset, and the books that change your path.",
    bookCountLabel: "6,418 books",
    formats: ["PDF", "EPUB"],
    artwork: {
      kind: "plant",
      bg: ["#0a2418", "#04130d"],
      glow: "#33f0aa",
      halo: "rgba(51, 240, 170, 0.4)",
    },
  },
  {
    slug: "business",
    name: "Business",
    description: "Strategy, leadership, and the playbooks behind every great firm.",
    bookCountLabel: "5,807 books",
    formats: ["PDF", "EPUB"],
    artwork: {
      kind: "king",
      bg: ["#2a200a", "#100904"],
      glow: "#f4c44b",
      halo: "rgba(244, 196, 75, 0.35)",
    },
  },
  {
    slug: "history",
    name: "History",
    description: "Ancient empires, forgotten civilizations, the long arc of time.",
    bookCountLabel: "4,231 books",
    formats: ["PDF", "EPUB", "MOBI"],
    artwork: {
      kind: "column",
      bg: ["#2c1f12", "#100805"],
      glow: "#e8b56d",
      halo: "rgba(232, 181, 109, 0.32)",
    },
  },
  {
    slug: "technology",
    name: "Technology",
    description: "Systems, code, and the deep ideas behind modern computing.",
    bookCountLabel: "3,612 books",
    formats: ["PDF", "EPUB"],
    artwork: {
      kind: "chip",
      bg: ["#0a2024", "#03090c"],
      glow: "#33f0aa",
      halo: "rgba(51, 240, 170, 0.32)",
    },
  },
  {
    slug: "philosophy",
    name: "Philosophy",
    description: "Timeless questions, the examined life, the ethics of being.",
    bookCountLabel: "2,058 books",
    formats: ["PDF", "EPUB", "MOBI"],
    artwork: {
      kind: "bust",
      bg: ["#26241f", "#0c0a08"],
      glow: "#e0d4b8",
      halo: "rgba(224, 212, 184, 0.28)",
    },
  },
  {
    slug: "arts-photography",
    name: "Arts & Photography",
    description: "Composition, color theory, and the eye behind every great image.",
    bookCountLabel: "1,847 books",
    formats: ["PDF", "EPUB"],
    artwork: {
      kind: "camera",
      bg: ["#2a121a", "#100509"],
      glow: "#ff9580",
      halo: "rgba(255, 149, 128, 0.32)",
    },
  },
];
