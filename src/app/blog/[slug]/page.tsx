import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { BlogPosting, WithContext } from "schema-dts";

import { ArticleBody } from "@/components/article/article-body";
import { ArticleHero } from "@/components/article/article-hero";
import { AuthorNewsletterStrip } from "@/components/article/author-newsletter-strip";
import { ReadingSidebar } from "@/components/article/reading-sidebar";
import { RelatedBooks } from "@/components/related-books";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { getBaseUrl, SITE_NAME } from "@/lib/seo";

/**
 * Cinematic article reading page — opens after the user clicks
 * "Read more" inside `/blog`.
 *
 * Classification target: `●` (SSG) via `generateStaticParams`. No
 * `revalidate` — markdown content is deploy-pinned (per SUB-PR 3.2's
 * choice). The cinematic redesign preserves that contract exactly:
 *   - Page is a Server Component
 *   - Markdown HTML + TOC are computed at build time inside
 *     `getPostBySlug` (post-processed to inject heading IDs)
 *   - Only the `<ReadingSidebar>` (IntersectionObserver active tracking)
 *     and `<SharePanel>` (clipboard) + `<AuthorNewsletterStrip>` form
 *     are Client islands hydrating inside the static HTML
 *
 * `RelatedBooks` from SUB-PR 3.2 stays beneath the article as the
 * content-to-commerce bridge.
 */

type BlogSlugParams = Promise<{ slug: string }>;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: BlogSlugParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  const url = `/blog/${slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: post.date,
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: BlogSlugParams;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // BlogPosting JSON-LD — same shape as the previous warm-theme version.
  // The cinematic redesign doesn't change SEO surface.
  const baseUrl = getBaseUrl();
  const jsonLd: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${baseUrl}/blog/${slug}#post`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${baseUrl}/blog/${slug}` },
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    articleSection: post.category,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: SITE_NAME,
      url: baseUrl,
    },
  };

  return (
    <div className="cinematic-root">
      <CinematicHeader active="blog" />

      <main className="relative z-10">
        {/* JSON-LD — same structured-data contract as before */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* HERO — large cinematic panel */}
        <ArticleHero post={post} readingMinutes={post.readingMinutes} />

        {/* Reading layout — sidebar LEFT, article RIGHT.
            Sticky sidebar on lg+, stacks on mobile (TOC moves below hero). */}
        <section className="mx-auto mt-14 max-w-[1320px] px-4 sm:mt-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,_1fr)] lg:gap-14">
            {/* Sidebar — sticky on lg+ */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ReadingSidebar toc={post.toc} />
            </div>

            {/* Article body */}
            <div>
              <ArticleBody contentHtml={post.contentHtml} />
            </div>
          </div>
        </section>

        {/* Author + Newsletter strip */}
        <AuthorNewsletterStrip />

        {/* Related books — content-to-commerce bridge from SUB-PR 3.2 */}
        <div className="mx-auto max-w-5xl px-6">
          <RelatedBooks limit={3} />
        </div>

        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}
