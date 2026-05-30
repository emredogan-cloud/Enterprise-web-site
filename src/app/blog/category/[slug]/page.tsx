import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogCard } from "@/components/blog-card";
import { getAllCategorySlugs, getCategoryBySlug } from "@/lib/blog";

/**
 * Blog category hub (Roadmap §6, §13).
 *
 * Classification target: `●` (SSG) via `generateStaticParams`. No
 * `revalidate` — categories are derived from markdown frontmatter, which
 * is deploy-pinned.
 *
 * Internal-linking surface:
 *   - One link to every post in the category.
 *   - Breadcrumb back to `/blog`.
 *   - Each `BlogCard`'s chip links back to *this* category — harmless
 *     self-link but reinforces the cluster topology that search engines
 *     map for topical authority.
 */

type CategorySlugParams = Promise<{ slug: string }>;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: CategorySlugParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };

  const description = `Blog posts filed under ${category.name} — Digital Bookstore.`;
  const url = `/blog/category/${slug}`;

  return {
    title: category.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${category.name} — Blog`,
      description,
      url,
      type: "website",
    },
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: CategorySlugParams;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <nav
        aria-label="Breadcrumb"
        className="text-xs uppercase tracking-[0.12em] text-muted-foreground"
      >
        <Link href="/blog" className="hover:text-primary">
          Blog
        </Link>
      </nav>

      <header className="mt-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Category
        </p>
        <h1 className="mt-3 text-balance font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          {category.name}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {category.posts.length}{" "}
          {category.posts.length === 1 ? "post" : "posts"}
        </p>
      </header>

      <ul className="mt-16 space-y-16">
        {category.posts.map((post) => (
          <li key={post.slug}>
            <BlogCard post={post} />
          </li>
        ))}
      </ul>
    </main>
  );
}
