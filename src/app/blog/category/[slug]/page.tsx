import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryArticleCard } from "@/components/category/category-article-card";
import { CategoryHero } from "@/components/category/category-hero";
import { CategorySidebar } from "@/components/category/category-sidebar";
import { EditorialStrip } from "@/components/category/editorial-strip";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { RevealOnScroll } from "@/components/home/reveal-on-scroll";
import {
  getAllCategorySlugs,
  getCategoryBySlug,
  getPostBySlug,
} from "@/lib/blog";

/**
 * Cinematic blog-category archive — opens after the user taps a category
 * pill on `/blog`. Distinct surface from:
 *   - `/blog` (the index — atmospheric grid of all posts)
 *   - `/blog/[slug]` (the article detail with TOC + reading sidebar)
 *
 * This surface is the curated reading hub for a single topic. Layout:
 *
 *   ┌──────────────────────────────────────────────────┐
 *   │   Cinematic header                               │
 *   ├──────────────────────────────────────────────────┤
 *   │   Breadcrumb · Blog / <Category>                 │
 *   │                                                  │
 *   │   ┌──────── HERO (two-col) ────────┐             │
 *   │   │ ReadingRoomScene │ eyebrow,   │             │
 *   │   │   (atmospheric)  │ headline,  │             │
 *   │   │                  │ subtitle,  │             │
 *   │   │                  │ 4 stats    │             │
 *   │   └──────────────────┴────────────┘             │
 *   │                                                  │
 *   │   ┌──── ARTICLE FEED ───┐ ┌── SIDEBAR ──┐       │
 *   │   │ Horizontal cards    │ │ About card  │       │
 *   │   │ (~40% img · ~60% co) │ │ Newsletter  │       │
 *   │   └─────────────────────┘ └─────────────┘       │
 *   │                                                  │
 *   │   EditorialStrip (centered closing statement)    │
 *   ├──────────────────────────────────────────────────┤
 *   │   HomeFooter                                     │
 *   └──────────────────────────────────────────────────┘
 *
 * Classification target: `● SSG` via `generateStaticParams` →
 * `getAllCategorySlugs()`. The pre-redesign route shipped with the same
 * classification and two pre-rendered children (`behind-the-scenes`,
 * `reading-guides`); the rewrite preserves both.
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

  // Compute per-post reading minutes once, at build time. We re-load the
  // full post (markdown body included) because `BlogPostMeta` only carries
  // the metadata — `readingMinutes` is computed by `getPostBySlug`. The
  // file system read is cheap and SSG-cached, so doing it N times here is
  // fine even for a category with dozens of posts.
  const postsWithReading = await Promise.all(
    category.posts.map(async (meta) => {
      const full = await getPostBySlug(meta.slug);
      return {
        meta,
        readingMinutes: full?.readingMinutes ?? 5,
      };
    }),
  );

  const totalMinutes = postsWithReading.reduce(
    (sum, p) => sum + p.readingMinutes,
    0,
  );
  // Guard against div-by-zero on theoretically-empty categories. (In
  // practice `getCategoryBySlug` returns `null` for empty categories,
  // so this branch is defensive only.)
  const avgReadingMinutes =
    postsWithReading.length > 0 ? totalMinutes / postsWithReading.length : 0;

  return (
    <div className="cinematic-root">
      <CinematicHeader active="blog" />

      <main className="relative z-10">
        {/* Breadcrumb — keeps the path back to /blog visible */}
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
          <span className="text-[#e6e6e0]">{category.name}</span>
        </nav>

        <CategoryHero
          category={category}
          avgReadingMinutes={avgReadingMinutes}
        />

        {/* Two-col body — 68% feed / 32% sidebar */}
        <section className="mx-auto mt-16 max-w-[1320px] px-4 sm:mt-20 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,_1fr)_320px] lg:gap-12">
            {/* LEFT — article feed */}
            <RevealOnScroll stagger className="flex flex-col gap-8 sm:gap-10">
              {postsWithReading.map(({ meta, readingMinutes }) => (
                <CategoryArticleCard
                  key={meta.slug}
                  post={meta}
                  readingMinutes={readingMinutes}
                />
              ))}
            </RevealOnScroll>

            {/* RIGHT — sticky sidebar on desktop */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <CategorySidebar categorySlug={category.slug} />
            </div>
          </div>
        </section>

        <EditorialStrip categorySlug={category.slug} />

        <div className="h-20" />
      </main>

      <HomeFooter />
    </div>
  );
}
