import type { Metadata } from "next";

import { BlogHero } from "@/components/blog/blog-hero";
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
export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes from the Digital Bookstore — decisions behind the storefront, reading guides, and the occasional essay.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — Digital Bookstore",
    description:
      "Notes from the Digital Bookstore — decisions behind the storefront, reading guides, and the occasional essay.",
    url: "/blog",
    type: "website",
  },
};

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
