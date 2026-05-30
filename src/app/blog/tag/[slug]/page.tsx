import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CinematicHero } from "@/components/cinematic/cinematic-hero";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { getAllTagSlugs, getPostsByTag } from "@/lib/blog";

/**
 * /blog/tag/[slug] — tag hub.
 *
 * Phase 2.H. The blog category sidebar's "topic pills" link here once
 * `feat/cinematic-blog-category` merges. Until then, this page still
 * works standalone: any post with `tags: [...]` in its frontmatter
 * shows up in the matching tag-slug URL.
 *
 * Classification: `● SSG` via `generateStaticParams` from
 * `getAllTagSlugs()`. With no tagged posts, the static-params list is
 * empty and the route only handles 404 (no pre-rendered children).
 */

export const dynamic = "force-static";

type TagSlugParams = Promise<{ slug: string }>;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getAllTagSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: TagSlugParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getPostsByTag(slug);
  if (!tag) return { title: "Tag not found" };

  const description = `Blog posts tagged ${tag.name} — Digital Bookstore.`;
  const url = `/blog/tag/${slug}`;

  return {
    title: `#${tag.name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${tag.name} — Blog tag`,
      description,
      url,
      type: "website",
    },
  };
}

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function BlogTagPage({
  params,
}: {
  params: TagSlugParams;
}) {
  const { slug } = await params;
  const tag = await getPostsByTag(slug);
  if (!tag) notFound();

  return (
    <div className="cinematic-root">
      <CinematicHeader active="blog" />

      <main className="relative z-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mx-auto mt-6 max-w-[1320px] px-4 text-[11px] uppercase tracking-[0.18em] text-[#88918a] sm:px-6"
        >
          <Link
            href="/blog"
            className="transition-colors hover:text-[#33f0aa]"
          >
            Blog
          </Link>
          <span aria-hidden className="mx-2 text-[#33f0aa]">/</span>
          <span className="text-[#a7a7a0]">Tag</span>
          <span aria-hidden className="mx-2 text-[#33f0aa]">/</span>
          <span className="text-[#e6e6e0]">{tag.name}</span>
        </nav>

        <CinematicHero
          eyebrow="Blog tag"
          headlineHead="#"
          headlineTail={tag.name}
          size="md"
          align="center"
          subtitle={
            <p>
              {tag.posts.length === 1
                ? "One post under this tag."
                : `${tag.posts.length} posts under this tag.`}
            </p>
          }
        />

        {/* Post list */}
        <section className="mx-auto mt-16 max-w-3xl px-4 sm:px-6">
          <ul className="space-y-6">
            {tag.posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="home-glass home-card-hover group relative block overflow-hidden rounded-[20px] p-6"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/25 to-transparent"
                  />
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#88918a]">
                    <time dateTime={post.date}>
                      {DATE_FMT.format(new Date(post.date))}
                    </time>
                    <span aria-hidden className="text-[#33f0aa]">•</span>
                    <Link
                      href={`/blog/category/${post.categorySlug}`}
                      className="transition-colors hover:text-[#33f0aa]"
                    >
                      {post.category}
                    </Link>
                  </p>
                  <h2 className="mt-3 font-serif text-[22px] font-medium leading-tight text-[#e6e6e0] transition-colors group-hover:text-[#33f0aa] sm:text-[26px]">
                    {post.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-[#a7a7a0]">
                    {post.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}
