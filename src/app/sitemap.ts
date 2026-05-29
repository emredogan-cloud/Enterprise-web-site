import type { MetadataRoute } from "next";

import { getAllCategories, getAllPosts } from "@/lib/blog";
import {
  getBookSitemapEntries,
  listAuthorSlugs,
  listCategorySlugs,
} from "@/lib/db/queries/catalog";
import { getBaseUrl } from "@/lib/seo";

/**
 * Dynamic XML sitemap (Roadmap §13 — "dynamic XML sitemaps").
 *
 * Next.js App Router serves this at `/sitemap.xml`. The function runs at
 * SSG time and re-runs at the configured ISR cadence; DB reads go through
 * the `safeQuery`-wrapped catalog helpers, and blog reads go through the
 * filesystem-backed loader — so a missing `DATABASE_URL` degrades to "site
 * + blog URLs only", and a missing `src/content/blog/` degrades to "site
 * + catalog URLs only".
 *
 * Priority + `changeFrequency` are *hints* to crawlers, not contracts;
 * the values below reflect the SEO weight of each surface (catalog browse
 * is daily; per-book pages weekly; hub pages weekly; blog posts monthly
 * since editorial content drifts slower than catalog metadata).
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const [books, categories, authors, blogPosts, blogCategories] =
    await Promise.all([
      getBookSitemapEntries(),
      listCategorySlugs(),
      listAuthorSlugs(),
      getAllPosts(),
      getAllCategories(),
    ]);

  const generatedAt = new Date();

  // Blog-index + blog-category lastModified track the most recent post —
  // those surfaces are effectively the digest of all posts beneath them,
  // so crawlers should re-fetch them when new content lands.
  const newestPostDate =
    blogPosts.length > 0 ? new Date(blogPosts[0].date) : generatedAt;

  const blogCategoryLastMod = new Map<string, Date>();
  for (const p of blogPosts) {
    const existing = blogCategoryLastMod.get(p.categorySlug);
    const d = new Date(p.date);
    if (!existing || d > existing) blogCategoryLastMod.set(p.categorySlug, d);
  }

  return [
    {
      url: `${baseUrl}/`,
      lastModified: generatedAt,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/books`,
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...books.map((b) => ({
      url: `${baseUrl}/books/${b.slug}`,
      lastModified: b.lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map(({ slug }) => ({
      url: `${baseUrl}/categories/${slug}`,
      lastModified: generatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...authors.map(({ slug }) => ({
      url: `${baseUrl}/authors/${slug}`,
      lastModified: generatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    // Blog index
    {
      url: `${baseUrl}/blog`,
      lastModified: newestPostDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    // Blog posts (canonical content URLs)
    ...blogPosts.map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // Blog category hubs
    ...blogCategories.map((c) => ({
      url: `${baseUrl}/blog/category/${c.slug}`,
      lastModified: blogCategoryLastMod.get(c.slug) ?? generatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
