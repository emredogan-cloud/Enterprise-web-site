/**
 * Demo catalog — used as fallback when the live DB has no published books
 * yet. As soon as the admin publishes real titles via /admin, the
 * `listPublishedBooks()` query takes over and these stop being shown.
 *
 * The shape is intentionally richer than `BookCardData` so the catalog UI
 * has everything it needs (category, formats, badges, gradient covers)
 * without a network call. When we wire the same UI to real DB data,
 * we map the DB row into this shape.
 */

export interface DemoBook {
  id: string;
  slug: string;
  title: string;
  author: string;
  priceCents: number;
  rating: number;
  /** Must match one of CATEGORIES below. */
  category: string;
  /** Subset of FORMATS below. */
  formats: ReadonlyArray<"PDF" | "EPUB" | "MOBI">;
  badge?: { label: string; tone: "bestseller" | "popular" | "new" };
  cover: { gradient: string; accent: string; darkText?: boolean };
  /** Server-resolved real cover (/images/books/{slug}.webp) or null. Set by
   *  the page; the gradient/typographic cover renders when null. */
  coverSrc?: string | null;
}

export const CATEGORIES = [
  "Fiction",
  "Science Fiction",
  "Personal Growth",
  "Business",
  "History",
  "Technology",
  "Philosophy",
] as const;

export const FORMATS = ["PDF", "EPUB", "MOBI"] as const;

export const DEMO_BOOKS: DemoBook[] = [
  {
    id: "demo-1",
    slug: "the-midnight-library",
    title: "The Midnight Library",
    author: "Matt Haig",
    priceCents: 1900,
    rating: 4.8,
    category: "Fiction",
    formats: ["PDF", "EPUB"],
    badge: { label: "Bestseller", tone: "bestseller" },
    cover: {
      gradient: "linear-gradient(160deg, #1a2c4f 0%, #050a1e 100%)",
      accent: "#7ab6ff",
    },
  },
  {
    id: "demo-2",
    slug: "the-silent-patient",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    priceCents: 1800,
    rating: 4.6,
    category: "Fiction",
    formats: ["PDF", "EPUB", "MOBI"],
    cover: {
      gradient: "linear-gradient(160deg, #161e26 0%, #060a10 100%)",
      accent: "#88918a",
    },
  },
  {
    id: "demo-3",
    slug: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    priceCents: 1900,
    rating: 4.9,
    category: "Personal Growth",
    formats: ["PDF", "EPUB", "MOBI"],
    badge: { label: "Bestseller", tone: "bestseller" },
    cover: {
      gradient: "linear-gradient(160deg, #ffb74d 0%, #c97114 100%)",
      accent: "#3a2208",
      darkText: true,
    },
  },
  {
    id: "demo-4",
    slug: "the-psychology-of-money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    priceCents: 2200,
    rating: 4.8,
    category: "Business",
    formats: ["PDF", "EPUB"],
    badge: { label: "Popular", tone: "popular" },
    cover: {
      gradient: "linear-gradient(160deg, #f1ede4 0%, #c5bca8 100%)",
      accent: "#16c784",
      darkText: true,
    },
  },
  {
    id: "demo-5",
    slug: "dune",
    title: "Dune",
    author: "Frank Herbert",
    priceCents: 2400,
    rating: 4.9,
    category: "Science Fiction",
    formats: ["PDF", "EPUB", "MOBI"],
    cover: {
      gradient: "linear-gradient(160deg, #c98341 0%, #4b1f0a 100%)",
      accent: "#ffce63",
    },
  },
  {
    id: "demo-6",
    slug: "1984",
    title: "1984",
    author: "George Orwell",
    priceCents: 1500,
    rating: 4.7,
    category: "Fiction",
    formats: ["PDF", "EPUB", "MOBI"],
    cover: {
      gradient: "linear-gradient(160deg, #2a2d35 0%, #0a0d14 100%)",
      accent: "#ff4d4d",
    },
  },
  {
    id: "demo-7",
    slug: "sapiens",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    priceCents: 2100,
    rating: 4.7,
    category: "History",
    formats: ["PDF", "EPUB"],
    badge: { label: "Popular", tone: "popular" },
    cover: {
      gradient: "linear-gradient(160deg, #b41c1c 0%, #4a0808 100%)",
      accent: "#f4d4a8",
    },
  },
  {
    id: "demo-8",
    slug: "thinking-fast-and-slow",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    priceCents: 2400,
    rating: 4.6,
    category: "Personal Growth",
    formats: ["PDF", "EPUB"],
    cover: {
      gradient: "linear-gradient(160deg, #e2dfd4 0%, #98948b 100%)",
      accent: "#2a261f",
      darkText: true,
    },
  },
  {
    id: "demo-9",
    slug: "the-subtle-art-of-not-giving-a-fck",
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    priceCents: 1700,
    rating: 4.5,
    category: "Personal Growth",
    formats: ["PDF", "EPUB", "MOBI"],
    cover: {
      gradient: "linear-gradient(160deg, #ff8a3d 0%, #b34616 100%)",
      accent: "#1a1612",
      darkText: true,
    },
  },
  {
    id: "demo-10",
    slug: "brave-new-world",
    title: "Brave New World",
    author: "Aldous Huxley",
    priceCents: 1600,
    rating: 4.4,
    category: "Fiction",
    formats: ["PDF", "EPUB"],
    cover: {
      gradient: "linear-gradient(160deg, #c83232 0%, #4e0a0a 100%)",
      accent: "#ffe6b3",
    },
  },
  {
    id: "demo-11",
    slug: "the-pragmatic-programmer",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    priceCents: 3900,
    rating: 4.8,
    category: "Technology",
    formats: ["PDF", "EPUB"],
    badge: { label: "New", tone: "new" },
    cover: {
      gradient: "linear-gradient(160deg, #1a3326 0%, #0a1f14 100%)",
      accent: "#33f0aa",
    },
  },
  {
    id: "demo-12",
    slug: "meditations",
    title: "Meditations",
    author: "Marcus Aurelius",
    priceCents: 1200,
    rating: 4.9,
    category: "Philosophy",
    formats: ["PDF", "EPUB", "MOBI"],
    cover: {
      gradient: "linear-gradient(160deg, #2c1f1a 0%, #14110a 100%)",
      accent: "#d1a86a",
    },
  },
  {
    id: "demo-13",
    slug: "designing-data-intensive-applications",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    priceCents: 4400,
    rating: 4.9,
    category: "Technology",
    formats: ["PDF", "EPUB"],
    badge: { label: "Bestseller", tone: "bestseller" },
    cover: {
      gradient: "linear-gradient(160deg, #163450 0%, #06131f 100%)",
      accent: "#33f0aa",
    },
  },
  {
    id: "demo-14",
    slug: "zero-to-one",
    title: "Zero to One",
    author: "Peter Thiel",
    priceCents: 2000,
    rating: 4.6,
    category: "Business",
    formats: ["PDF", "EPUB"],
    cover: {
      gradient: "linear-gradient(160deg, #f4f2ed 0%, #c2bfb6 100%)",
      accent: "#1a1612",
      darkText: true,
    },
  },
  {
    id: "demo-15",
    slug: "the-foundation-trilogy",
    title: "The Foundation Trilogy",
    author: "Isaac Asimov",
    priceCents: 2600,
    rating: 4.7,
    category: "Science Fiction",
    formats: ["PDF", "EPUB", "MOBI"],
    cover: {
      gradient: "linear-gradient(160deg, #1d1535 0%, #07051a 100%)",
      accent: "#b18cff",
    },
  },
  {
    id: "demo-16",
    slug: "the-art-of-war",
    title: "The Art of War",
    author: "Sun Tzu",
    priceCents: 1400,
    rating: 4.7,
    category: "History",
    formats: ["PDF", "EPUB", "MOBI"],
    cover: {
      gradient: "linear-gradient(160deg, #3a1c1c 0%, #150808 100%)",
      accent: "#d4a020",
    },
  },
];

/**
 * Compute the per-category book counts shown in the sidebar.
 * Returns categories in display order (matches the brief).
 */
export function getCategoryCounts(books: DemoBook[]): Array<{
  name: string;
  count: number;
}> {
  const counts = new Map<string, number>();
  for (const book of books) {
    counts.set(book.category, (counts.get(book.category) ?? 0) + 1);
  }
  return CATEGORIES.map((name) => ({ name, count: counts.get(name) ?? 0 }));
}

/** Same for formats. */
export function getFormatCounts(books: DemoBook[]): Array<{
  name: string;
  count: number;
}> {
  const counts = new Map<string, number>();
  for (const book of books) {
    for (const fmt of book.formats) {
      counts.set(fmt, (counts.get(fmt) ?? 0) + 1);
    }
  }
  return FORMATS.map((name) => ({ name, count: counts.get(name) ?? 0 }));
}

/** Per-rating-floor counts: 5★ = exactly 5; 4★ = 4.0..4.9; etc. */
export function getRatingCounts(books: DemoBook[]): Array<{
  stars: number;
  count: number;
}> {
  const counts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: books.filter(
      (b) => Math.floor(b.rating) === stars && b.rating < stars + 1,
    ).length,
  }));
  return counts;
}
