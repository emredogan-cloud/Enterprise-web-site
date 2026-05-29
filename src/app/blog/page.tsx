import type { Metadata } from "next";
import Link from "next/link";

import { BlogCard } from "@/components/blog-card";
import { EmptyState } from "@/components/empty-state";
import { getAllCategories, getAllPosts } from "@/lib/blog";

/**
 * Blog index — the content hub's front door (Roadmap §6 IA, §13 SEO).
 *
 * Pure `○ Static`: no dynamic segments, no DB read at render time, no
 * dynamic APIs. All data resolves at build time from `src/content/blog/`,
 * so the HTML is generated once during `next build` and served as a
 * static asset for the lifetime of the deploy.
 *
 * No `revalidate` export is set on purpose — markdown content is
 * deploy-pinned (new posts ship in PRs), so ISR would re-render the
 * page without anything actually changing.
 */
export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes from the Digital Bookstore — choices behind the storefront, reading guides, and occasional essays.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — Digital Bookstore",
    description:
      "Notes from the Digital Bookstore — choices behind the storefront, reading guides, and occasional essays.",
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
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Blog
        </p>
        <h1 className="mt-4 text-balance font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          Notes from the bookstore
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
          Decisions behind the storefront, reading guides, and the occasional
          essay. Updated when there is something worth saying.
        </p>
      </header>

      {categories.length > 0 && (
        <nav
          aria-label="Browse posts by category"
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog/category/${cat.slug}`}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {cat.name}
              <span className="ml-1.5 text-foreground/40">({cat.postCount})</span>
            </Link>
          ))}
        </nav>
      )}

      {posts.length === 0 ? (
        <EmptyState
          heading="No posts yet."
          body="Once a markdown file lands in src/content/blog/, it appears here."
        />
      ) : (
        <ul className="mt-16 space-y-16">
          {posts.map((post) => (
            <li key={post.slug}>
              <BlogCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
