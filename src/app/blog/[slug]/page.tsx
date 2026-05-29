import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { BlogPosting, WithContext } from "schema-dts";

import { RelatedBooks } from "@/components/related-books";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { PROSE_CLASSES } from "@/lib/prose";
import { getBaseUrl, SITE_NAME } from "@/lib/seo";
import { cn } from "@/lib/utils";

/**
 * Blog post detail (Roadmap §6, §13).
 *
 * Classification target: `●` (SSG) via `generateStaticParams`. No
 * `revalidate` export — markdown is deploy-pinned.
 *
 * Internal-linking surface (the SEO point of the blog):
 *   - Above the article, a back-link to the index + a chip linking to the
 *     category hub (`/blog/category/<slug>`).
 *   - Below the article, a `RelatedBooks` grid that links to up to three
 *     `/books/<slug>` detail pages — the content-to-commerce bridge.
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
      // `type: "article"` unlocks `publishedTime` + `section` + `tags` —
      // the canonical OG shape for editorial content.
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

  const baseUrl = getBaseUrl();
  // BlogPosting JSON-LD (Roadmap §13 — structured data for editorial
  // content). Mirrors the Book/Product graph on book pages, but keeps the
  // payload to a single top-level entity — there's nothing on a blog post
  // to cross-reference the way a Book / Offer pair would benefit from.
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
    <main className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
      >
        <Link href="/blog" className="hover:text-primary">
          Blog
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <Link
          href={`/blog/category/${post.categorySlug}`}
          className="hover:text-primary"
        >
          {post.category}
        </Link>
      </nav>

      <header className="mt-6">
        <h1 className="text-balance font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-6 text-sm uppercase tracking-[0.15em] text-muted-foreground">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>
      </header>

      {/*
        Markdown body. The HTML was produced by `marked` at build time;
        content is repo-controlled (authors PR markdown files), so the
        `dangerouslySetInnerHTML` boundary is safe — same trust posture as
        SUB-PR 1.3's SampleViewer.
      */}
      <article
        className={cn(PROSE_CLASSES, "mt-12")}
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/*
        Content-to-commerce internal-linking surface (Roadmap §13).
        Server Component — `getFeaturedBooks` runs at SSG time; rendered
        HTML ships with the post, so the link juice flows immediately.
      */}
      <RelatedBooks limit={3} />
    </main>
  );
}

/** Mirrors `BlogCard`'s date formatting for visual consistency. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
