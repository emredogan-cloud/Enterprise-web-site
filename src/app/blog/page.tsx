import type { Metadata } from "next";

import { BlogHero } from "@/components/blog/blog-hero";
import { buildPageMetadata } from "@/lib/metadata";
import { BlogShell } from "@/components/blog/blog-shell";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { getAllCategories, getAllPosts } from "@/lib/blog";

/**
 * Blog index — cinematic editorial redesign.
 *
 * Stays `○ Static`: markdown is read at build time from `src/content/
 * blog/` via the existing `getAllPosts()` / `getAllCategories()`
 * helpers. The interactive `<BlogShell>` (topic filter pills + feed)
 * is a Client island; the page itself is a Server Component.
 *
 * No `revalidate` — content is deploy-pinned (new posts ship in PRs).
 * Same architectural call as the original index; only the visual
 * language changed.
 */
export const metadata: Metadata = buildPageMetadata({
  title: "Blog",
  description:
    "Notes from the Valice Press — decisions behind the storefront, reading guides, and the occasional essay.",
  path: "/blog",
  ogTitle: "Blog — Valice Press",
});

export default async function BlogIndexPage() {
  const [posts, categories] = await Promise.all([
    getAllPosts(),
    getAllCategories(),
  ]);

  return (
    <div className="cinematic-root">
      <CinematicHeader active="blog" />

      <main className="relative z-10">
        <BlogHero />
        <BlogShell posts={posts} topics={categories} />
      </main>

      <HomeFooter />
    </div>
  );
}
