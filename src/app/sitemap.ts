import type { MetadataRoute } from "next";

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
 * SSG time and re-runs at the configured ISR cadence; all DB reads go
 * through the `safeQuery`-wrapped catalog helpers, so a missing
 * `DATABASE_URL` degrades to "site URLs only" rather than crashing the
 * sitemap.
 *
 * Priority + `changeFrequency` are *hints* to crawlers, not contracts;
 * the values below reflect the SEO weight of each surface (catalog browse
 * gets daily; per-book pages get weekly; hubs get weekly).
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const [books, categories, authors] = await Promise.all([
    getBookSitemapEntries(),
    listCategorySlugs(),
    listAuthorSlugs(),
  ]);

  const generatedAt = new Date();

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
  ];
}
