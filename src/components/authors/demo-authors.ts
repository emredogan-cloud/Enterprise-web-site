/**
 * Curated demo authors — used as the source for the `/authors` discovery
 * page until the real `authors` table grows past placeholder rows.
 *
 * Each entry covers all the data points the cinematic card needs:
 *   - identity (slug, name, role)
 *   - signature works + book count
 *   - follower-count badge string
 *   - genre category (for the filter pills/dropdown)
 *   - optional featured flag (drives the emerald solid border)
 *   - portrait theme: gradient + rim-light color (drives the CSS-rendered
 *     atmospheric portrait so we don't need a photo pipeline yet)
 */

export interface DemoAuthor {
  slug: string;
  name: string;
  role: string;
  works: string;
  bookCount: number;
  /** Pre-formatted display string, e.g. "12.5K" or "843". */
  followerCount: string;
  /** Must match one of `AUTHOR_GENRES`. */
  category: string;
  featured?: boolean;
  portrait: PortraitTheme;
  /** Server-resolved real portrait path (/images/authors/{slug}.webp) or
   *  null. Set by the page; the procedural portrait renders when null. */
  portraitSrc?: string | null;
}

export interface PortraitTheme {
  /** Background gradient — sets the overall mood. */
  background: string;
  /** Color of the silhouette body — usually a near-black with a hint of the bg tone. */
  silhouette: string;
  /** Rim-light color — the cinematic edge highlight (emerald, sepia, blue). */
  rimLight: string;
  /** Top-corner accent glow color. */
  accent: string;
}

export const AUTHOR_GENRES = [
  "Fiction",
  "Science Fiction",
  "Personal Growth",
  "Business",
  "History",
  "Philosophy",
  "Technology",
] as const;

export const AUTHOR_SORTS = ["Popular", "A → Z", "Most books"] as const;
export type AuthorSort = (typeof AUTHOR_SORTS)[number];

export const DEMO_AUTHORS: DemoAuthor[] = [
  {
    slug: "yuval-noah-harari",
    name: "Yuval Noah Harari",
    role: "Historian & Author",
    works: "Sapiens, Homo Deus",
    bookCount: 21,
    followerCount: "1.2M",
    category: "History",
    portrait: {
      background:
        "radial-gradient(ellipse at 35% 30%, #2d4a44 0%, #0d1916 60%, #050a08 100%)",
      silhouette: "#020806",
      rimLight: "rgba(180, 220, 200, 0.65)",
      accent: "rgba(120, 200, 170, 0.4)",
    },
  },
  {
    slug: "jane-austen",
    name: "Jane Austen",
    role: "Novelist",
    works: "Pride & Prejudice, Emma",
    bookCount: 8,
    followerCount: "2.4M",
    category: "Fiction",
    portrait: {
      background:
        "radial-gradient(ellipse at 40% 35%, #4a3a2a 0%, #1c1410 60%, #08060a 100%)",
      silhouette: "#0a0608",
      rimLight: "rgba(230, 200, 150, 0.6)",
      accent: "rgba(200, 170, 110, 0.35)",
    },
  },
  {
    slug: "dan-brown",
    name: "Dan Brown",
    role: "Author",
    works: "The Da Vinci Code, Inferno",
    bookCount: 12,
    followerCount: "843K",
    category: "Fiction",
    featured: true,
    portrait: {
      background:
        "radial-gradient(ellipse at 50% 35%, #1f3d2c 0%, #0a1b14 55%, #04100b 100%)",
      silhouette: "#02100a",
      rimLight: "rgba(51, 240, 170, 0.7)",
      accent: "rgba(51, 240, 170, 0.55)",
    },
  },
  {
    slug: "george-orwell",
    name: "George Orwell",
    role: "Author",
    works: "1984, Animal Farm",
    bookCount: 14,
    followerCount: "1.8M",
    category: "Fiction",
    portrait: {
      background:
        "radial-gradient(ellipse at 45% 30%, #2a2c33 0%, #0e1014 60%, #05060a 100%)",
      silhouette: "#020306",
      rimLight: "rgba(200, 210, 230, 0.55)",
      accent: "rgba(150, 170, 200, 0.3)",
    },
  },
  {
    slug: "j-k-rowling",
    name: "J.K. Rowling",
    role: "Novelist",
    works: "Harry Potter series",
    bookCount: 17,
    followerCount: "5.2M",
    category: "Fiction",
    portrait: {
      background:
        "radial-gradient(ellipse at 40% 30%, #3a2845 0%, #14081c 60%, #06040d 100%)",
      silhouette: "#04020a",
      rimLight: "rgba(210, 170, 240, 0.6)",
      accent: "rgba(170, 130, 220, 0.4)",
    },
  },
  {
    slug: "robert-kiyosaki",
    name: "Robert Kiyosaki",
    role: "Author",
    works: "Rich Dad Poor Dad",
    bookCount: 23,
    followerCount: "612K",
    category: "Business",
    portrait: {
      background:
        "radial-gradient(ellipse at 50% 30%, #4a2818 0%, #1c0d08 60%, #08040a 100%)",
      silhouette: "#06020a",
      rimLight: "rgba(240, 180, 110, 0.55)",
      accent: "rgba(220, 140, 80, 0.4)",
    },
  },
  {
    slug: "isaac-asimov",
    name: "Isaac Asimov",
    role: "Sci-Fi Master",
    works: "Foundation, I, Robot",
    bookCount: 506,
    followerCount: "418K",
    category: "Science Fiction",
    portrait: {
      background:
        "radial-gradient(ellipse at 50% 30%, #1c2a45 0%, #08101c 60%, #04060e 100%)",
      silhouette: "#02050c",
      rimLight: "rgba(130, 180, 240, 0.55)",
      accent: "rgba(100, 150, 220, 0.4)",
    },
  },
  {
    slug: "frank-herbert",
    name: "Frank Herbert",
    role: "Sci-Fi Novelist",
    works: "Dune saga",
    bookCount: 23,
    followerCount: "287K",
    category: "Science Fiction",
    portrait: {
      background:
        "radial-gradient(ellipse at 45% 35%, #4d3520 0%, #1a0d06 60%, #060406 100%)",
      silhouette: "#080404",
      rimLight: "rgba(240, 190, 110, 0.6)",
      accent: "rgba(220, 150, 70, 0.42)",
    },
  },
  {
    slug: "james-clear",
    name: "James Clear",
    role: "Author & Speaker",
    works: "Atomic Habits",
    bookCount: 3,
    followerCount: "1.1M",
    category: "Personal Growth",
    portrait: {
      background:
        "radial-gradient(ellipse at 50% 30%, #2a3a45 0%, #0a1820 60%, #040a0e 100%)",
      silhouette: "#02080c",
      rimLight: "rgba(150, 210, 240, 0.6)",
      accent: "rgba(120, 190, 230, 0.4)",
    },
  },
  {
    slug: "marcus-aurelius",
    name: "Marcus Aurelius",
    role: "Stoic Philosopher",
    works: "Meditations",
    bookCount: 1,
    followerCount: "923K",
    category: "Philosophy",
    portrait: {
      background:
        "radial-gradient(ellipse at 50% 30%, #3d3220 0%, #1a140a 60%, #08050a 100%)",
      silhouette: "#06030a",
      rimLight: "rgba(230, 190, 120, 0.55)",
      accent: "rgba(210, 160, 90, 0.4)",
    },
  },
  {
    slug: "martin-kleppmann",
    name: "Martin Kleppmann",
    role: "Systems Engineer & Author",
    works: "Designing Data-Intensive Apps",
    bookCount: 4,
    followerCount: "284K",
    category: "Technology",
    portrait: {
      background:
        "radial-gradient(ellipse at 45% 35%, #1a3326 0%, #0a1f14 55%, #040b08 100%)",
      silhouette: "#020806",
      rimLight: "rgba(51, 240, 170, 0.55)",
      accent: "rgba(22, 199, 132, 0.4)",
    },
  },
  {
    slug: "daniel-kahneman",
    name: "Daniel Kahneman",
    role: "Psychologist & Author",
    works: "Thinking, Fast and Slow",
    bookCount: 5,
    followerCount: "498K",
    category: "Personal Growth",
    portrait: {
      background:
        "radial-gradient(ellipse at 50% 30%, #353035 0%, #161015 60%, #07060a 100%)",
      silhouette: "#030208",
      rimLight: "rgba(220, 210, 220, 0.5)",
      accent: "rgba(180, 170, 190, 0.35)",
    },
  },
];

/** Per-genre author counts — drives the pill badges. */
export function getAuthorCountsByGenre(
  authors: DemoAuthor[],
): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();
  for (const a of authors) {
    counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
  }
  return AUTHOR_GENRES.map((name) => ({ name, count: counts.get(name) ?? 0 }));
}
