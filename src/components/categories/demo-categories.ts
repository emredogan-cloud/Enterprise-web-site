import {
  BookOpen,
  Castle,
  Feather,
  Ghost,
  Heart,
  Landmark,
  Mountain,
  Rocket,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Demo category catalog — 10 hand-curated literary worlds backing the
 * `/categories` discovery gallery when the real `categories` table is empty
 * (architecture-first, per the brief: the gallery must exist even before the
 * catalog is populated).
 *
 * Each entry carries identity (slug, name), an evocative `tagline` (we do NOT
 * fabricate book counts — the data layer has none, and inventing numbers
 * would be dishonest), a lucide `icon`, a `match` regex used to map a real DB
 * category name onto the right world, and an `artwork` theme the
 * `<CategoryScene>` renderer switches on to paint a full-bleed atmosphere.
 *
 * Distinct from `demo-genres.ts` (which backs `/genres` with broad, circular
 * symbol artwork). These are fiction sub-genres with full-bleed scenes — the
 * two pages stay independent so neither regresses.
 */

export type CategorySceneKind =
  | "castle" // fantasy
  | "neon-city" // science fiction
  | "fog-street" // mystery
  | "columns" // historical fiction
  | "warm-hills" // romance
  | "dark-forest" // horror
  | "mountains" // adventure
  | "open-book" // literary fiction
  | "ink-desk" // poetry
  | "starfield"; // young adult

export interface CategoryArtwork {
  scene: CategorySceneKind;
  /** Two-stop backdrop gradient for the scene. */
  bg: [string, string];
  /** Primary glow color (the lit object / horizon). */
  glow: string;
  /** Outer halo bloom color. */
  halo: string;
}

export interface DemoCategory {
  slug: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  artwork: CategoryArtwork;
  /** Keyword matcher for mapping a real category name onto this world. */
  match: RegExp;
}

export const DEMO_CATEGORIES: DemoCategory[] = [
  {
    slug: "fantasy",
    name: "Fantasy",
    tagline: "Maps, magic, and myth.",
    icon: Castle,
    match: /fantasy|magic|myth|epic/i,
    artwork: {
      scene: "castle",
      bg: ["#2a1c4a", "#0b0718"],
      glow: "#b18cff",
      halo: "rgba(177, 140, 255, 0.35)",
    },
  },
  {
    slug: "science-fiction",
    name: "Science Fiction",
    tagline: "Futures, space, and the edge of possible.",
    icon: Rocket,
    match: /sci[\s-]?fi|science fiction|space|cyber/i,
    artwork: {
      scene: "neon-city",
      bg: ["#0e2440", "#04091c"],
      glow: "#7ab6ff",
      halo: "rgba(122, 182, 255, 0.34)",
    },
  },
  {
    slug: "mystery",
    name: "Mystery",
    tagline: "Clues in the fog.",
    icon: Search,
    match: /myster|crime|thriller|detective|noir/i,
    artwork: {
      scene: "fog-street",
      bg: ["#16262b", "#070f12"],
      glow: "#5ee4d8",
      halo: "rgba(94, 228, 216, 0.30)",
    },
  },
  {
    slug: "historical-fiction",
    name: "Historical Fiction",
    tagline: "The long arc of the past.",
    icon: Landmark,
    match: /histor|ancient|classic period|war/i,
    artwork: {
      scene: "columns",
      bg: ["#2e2310", "#100a04"],
      glow: "#e8b56d",
      halo: "rgba(232, 181, 109, 0.32)",
    },
  },
  {
    slug: "romance",
    name: "Romance",
    tagline: "Hearts, longing, and warm light.",
    icon: Heart,
    match: /romance|love/i,
    artwork: {
      scene: "warm-hills",
      bg: ["#3a1c2a", "#160a10"],
      glow: "#ff9ab7",
      halo: "rgba(255, 154, 183, 0.34)",
    },
  },
  {
    slug: "horror",
    name: "Horror",
    tagline: "What waits in the dark.",
    icon: Ghost,
    match: /horror|scary|gothic|supernatural/i,
    artwork: {
      scene: "dark-forest",
      bg: ["#2a0e10", "#0a0405"],
      glow: "#ff5a52",
      halo: "rgba(255, 90, 82, 0.28)",
    },
  },
  {
    slug: "adventure",
    name: "Adventure",
    tagline: "Far horizons and high places.",
    icon: Mountain,
    match: /adventure|action|expedition|survival/i,
    artwork: {
      scene: "mountains",
      bg: ["#123026", "#06140d"],
      glow: "#33f0aa",
      halo: "rgba(51, 240, 170, 0.36)",
    },
  },
  {
    slug: "literary-fiction",
    name: "Literary Fiction",
    tagline: "Quiet truths, carefully told.",
    icon: BookOpen,
    match: /literary|literature|fiction|contemporary/i,
    artwork: {
      scene: "open-book",
      bg: ["#23241f", "#0b0c08"],
      glow: "#e0d4b8",
      halo: "rgba(224, 212, 184, 0.30)",
    },
  },
  {
    slug: "poetry",
    name: "Poetry",
    tagline: "Few words, deep wells.",
    icon: Feather,
    match: /poet|verse|lyric/i,
    artwork: {
      scene: "ink-desk",
      bg: ["#13243f", "#060c18"],
      glow: "#9ab6e8",
      halo: "rgba(154, 182, 232, 0.30)",
    },
  },
  {
    slug: "young-adult",
    name: "Young Adult",
    tagline: "Coming of age, under big skies.",
    icon: Sparkles,
    match: /young adult|ya|teen|coming of age/i,
    artwork: {
      scene: "starfield",
      bg: ["#2a1840", "#0c0618"],
      glow: "#d18cff",
      halo: "rgba(209, 140, 255, 0.33)",
    },
  },
];

/**
 * Map a real DB category name onto one of the curated worlds — keyword match
 * first, then a deterministic palette cycle by index so adjacent real tiles
 * never share a look. The icon stays neutral (`BookOpen`) on the fallback
 * path because we can't infer a meaningful glyph from an unknown name.
 */
export function resolveCategoryArtwork(
  name: string,
  index: number,
): { icon: LucideIcon; artwork: CategoryArtwork } {
  const hit = DEMO_CATEGORIES.find((c) => c.match.test(name));
  if (hit) return { icon: hit.icon, artwork: hit.artwork };
  const fallback = DEMO_CATEGORIES[index % DEMO_CATEGORIES.length];
  return { icon: BookOpen, artwork: fallback.artwork };
}
