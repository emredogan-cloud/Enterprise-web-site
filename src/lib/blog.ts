/**
 * Blog content loader (Roadmap §6 IA, §13 SEO).
 *
 * Data source: filesystem markdown files in `src/content/blog/*.md`.
 * Each file carries YAML frontmatter (title, date, category, excerpt) and a
 * markdown body; both are parsed at build time and baked into the SSG output.
 *
 * Why a filesystem CMS (and not the database):
 *   - Blog posts are highly static and content-heavy. Putting them in
 *     Postgres adds a query per pageview for content that almost never
 *     changes between deploys.
 *   - Authoring in `.md` works with the repo's normal review flow
 *     (PRs, code review, history). New posts ship through deploys.
 *   - Eliminates a DB dependency from the SEO-critical content surface.
 *     Per ADR-1, blog routes must be statically pre-rendered; sourcing from
 *     the filesystem keeps them genuinely static — no DB at request time.
 *
 * Module-level cache (`_postsCache`) holds the parsed-frontmatter list as a
 * single in-flight `Promise` so multiple route imports within one build pass
 * share one directory scan. Cache lifetime = process lifetime; for SSG that
 * is the build; for ISR (not currently used on blog routes) it would be the
 * serverless instance.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { marked } from "marked";

// -----------------------------------------------------------------------------
// Paths + slugs
// -----------------------------------------------------------------------------

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "blog");
const MD_EXT = ".md";

/**
 * Turn a human-readable category name into a URL slug.
 *
 *   "Behind the Scenes" → "behind-the-scenes"
 *   "Reading Guides"    → "reading-guides"
 *
 * Single source of truth: the frontmatter `category` field carries the
 * human-readable name; the slug is derived deterministically here. Authors
 * never have to keep two fields in sync.
 */
export function slugifyCategory(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// -----------------------------------------------------------------------------
// Types — frontmatter, summary, and full post.
// -----------------------------------------------------------------------------

/**
 * What a list-item needs (the index, category hubs, RelatedBooks-style
 * cross-links). No rendered HTML — that's only loaded on the detail page.
 */
export interface BlogPostMeta {
  slug: string;
  title: string;
  /** ISO 8601 date string (frontmatter `date`). */
  date: string;
  /** Human-readable category (frontmatter `category`). */
  category: string;
  /** Derived URL slug for the category — never stored in frontmatter. */
  categorySlug: string;
  excerpt: string;
}

export interface BlogPost extends BlogPostMeta {
  /** Markdown body rendered to HTML via `marked`. */
  contentHtml: string;
}

export interface CategorySummary {
  slug: string;
  name: string;
  postCount: number;
}

// -----------------------------------------------------------------------------
// Frontmatter validation — narrow `unknown` from gray-matter to a typed shape.
// We don't pull in zod for two fields; a hand-written guard is cheaper.
// -----------------------------------------------------------------------------

interface RawFrontmatter {
  title: string;
  date: string;
  category: string;
  excerpt: string;
}

function isValidFrontmatter(
  data: Record<string, unknown>,
  filename: string,
): data is Record<string, unknown> & RawFrontmatter {
  for (const field of ["title", "date", "category", "excerpt"] as const) {
    if (typeof data[field] !== "string" || (data[field] as string).length === 0) {
      console.warn(
        `[blog] skipping ${filename}: missing or non-string frontmatter field "${field}"`,
      );
      return false;
    }
  }
  return true;
}

// -----------------------------------------------------------------------------
// Module-level cache — one directory scan + parse per process.
// -----------------------------------------------------------------------------

let _postsCache: Promise<BlogPostMeta[]> | null = null;

async function loadAllPostsMeta(): Promise<BlogPostMeta[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(CONTENT_DIR);
  } catch (err) {
    // The directory genuinely might not exist in a freshly-cloned env that
    // hasn't run this SUB-PR's migration; degrade to "no posts" rather than
    // crash the entire blog index route.
    console.warn(
      `[blog] content directory missing or unreadable (${CONTENT_DIR}):`,
      err instanceof Error ? err.message : err,
    );
    return [];
  }

  const mdFiles = entries.filter((name) => name.endsWith(MD_EXT));

  const parsed = await Promise.all(
    mdFiles.map(async (filename) => {
      const filePath = path.join(CONTENT_DIR, filename);
      const raw = await fs.readFile(filePath, "utf8");
      const { data } = matter(raw);
      if (!isValidFrontmatter(data, filename)) return null;

      const slug = filename.slice(0, -MD_EXT.length);
      const meta: BlogPostMeta = {
        slug,
        title: data.title,
        date: data.date,
        category: data.category,
        categorySlug: slugifyCategory(data.category),
        excerpt: data.excerpt,
      };
      return meta;
    }),
  );

  const valid = parsed.filter((p): p is BlogPostMeta => p !== null);

  // Newest first — the index ranks recency, and category hubs follow the same
  // ordering for consistency.
  valid.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return valid;
}

function getAllPostsCached(): Promise<BlogPostMeta[]> {
  if (!_postsCache) _postsCache = loadAllPostsMeta();
  return _postsCache;
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/** All posts, newest first. */
export async function getAllPosts(): Promise<BlogPostMeta[]> {
  return getAllPostsCached();
}

/** Just the slugs — for `generateStaticParams` on `/blog/[slug]`. */
export async function getAllPostSlugs(): Promise<string[]> {
  const posts = await getAllPostsCached();
  return posts.map((p) => p.slug);
}

/**
 * Full post (metadata + rendered HTML). Re-reads the file from disk so the
 * markdown body is fresh; the metadata path is still cached.
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const meta = (await getAllPostsCached()).find((p) => p.slug === slug);
  if (!meta) return null;

  const filePath = path.join(CONTENT_DIR, `${slug}${MD_EXT}`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch (err) {
    // Defensive: a post we just enumerated should always be readable. If it
    // isn't, treat as "not found" rather than throwing into the route.
    console.warn(
      `[blog] post file unreadable (${filePath}):`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }

  const { content } = matter(raw);
  // `marked.parse` is sync by default in marked v18 but is typed as
  // `string | Promise<string>`; awaiting handles both contracts safely.
  const contentHtml = await marked.parse(content);

  return { ...meta, contentHtml };
}

/** Distinct categories with post counts — for browsing surfaces. */
export async function getAllCategories(): Promise<CategorySummary[]> {
  const posts = await getAllPostsCached();
  const map = new Map<string, CategorySummary>();
  for (const p of posts) {
    const existing = map.get(p.categorySlug);
    if (existing) {
      existing.postCount += 1;
    } else {
      map.set(p.categorySlug, {
        slug: p.categorySlug,
        name: p.category,
        postCount: 1,
      });
    }
  }
  // Alphabetical so the chip order is stable across builds.
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/** Just the category slugs — for `generateStaticParams` on the category route. */
export async function getAllCategorySlugs(): Promise<string[]> {
  const cats = await getAllCategories();
  return cats.map((c) => c.slug);
}

export interface CategoryPagePosts {
  slug: string;
  name: string;
  posts: BlogPostMeta[];
}

/**
 * All posts in a given category slug, plus the human-readable category name.
 * Returns `null` if no posts use that category (i.e., the slug is unknown).
 */
export async function getCategoryBySlug(
  categorySlug: string,
): Promise<CategoryPagePosts | null> {
  const posts = await getAllPostsCached();
  const matching = posts.filter((p) => p.categorySlug === categorySlug);
  if (matching.length === 0) return null;
  // Use the first post's category-name as the human-readable label; all
  // posts that map to the same slug should agree on this (single source of
  // truth: the frontmatter `category` field).
  return {
    slug: categorySlug,
    name: matching[0].category,
    posts: matching,
  };
}
