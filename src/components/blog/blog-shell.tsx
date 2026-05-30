"use client";

import { useMemo, useState } from "react";

import { RevealOnScroll } from "@/components/home/reveal-on-scroll";
import type { BlogPostMeta } from "@/lib/blog";

import { ArticleRow } from "./article-row";
import { TopicPills, type TopicCount } from "./topic-pills";

/**
 * Editorial feed container — holds the active-topic filter state and
 * renders pills + a stagger-revealed list of `<ArticleRow>`s.
 *
 * Why one Client wrapper instead of fine-grained Server+Client mix:
 *   - The topic pills and the feed list share a single filter state.
 *     Lifting it here is simpler than a Context / URL sync.
 *   - The page (`src/app/blog/page.tsx`) stays Server / Static: it
 *     reads `getAllPosts()` and `getAllCategories()` at build time and
 *     passes both as props. This Client wrapper just orchestrates
 *     the local UI state on top of build-time data.
 *
 * Pills are presentational; clicking the active one clears the filter
 * (returns the user to "all topics"). Clicking a different pill switches
 * to it. The feed re-renders via React's normal `useMemo` flow.
 */
export function BlogShell({
  posts,
  topics,
}: {
  posts: BlogPostMeta[];
  topics: TopicCount[];
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    if (!activeSlug) return posts;
    return posts.filter((p) => p.categorySlug === activeSlug);
  }, [posts, activeSlug]);

  return (
    <>
      {/* Topic pills row */}
      <TopicPills
        topics={topics}
        active={activeSlug}
        onChange={setActiveSlug}
      />

      {/* Article feed — stagger reveal on scroll */}
      <section className="mx-auto mt-20 max-w-5xl px-6 sm:mt-24">
        {filteredPosts.length === 0 ? (
          <EmptyResults
            categoryName={
              topics.find((t) => t.slug === activeSlug)?.name ?? ""
            }
            onClear={() => setActiveSlug(null)}
          />
        ) : (
          <RevealOnScroll stagger className="flex flex-col gap-20 sm:gap-24">
            {filteredPosts.map((post) => (
              <div key={post.slug} className="relative">
                <ArticleRow post={post} />

                {/* Soft glow divider between rows — fades out at the last item */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-12 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent last:hidden"
                />
              </div>
            ))}
          </RevealOnScroll>
        )}
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty-state — shown when filter yields zero matches                        */
/* -------------------------------------------------------------------------- */

function EmptyResults({
  categoryName,
  onClear,
}: {
  categoryName: string;
  onClear: () => void;
}) {
  return (
    <div className="home-glass mx-auto max-w-md rounded-2xl px-8 py-12 text-center">
      <p className="font-serif text-lg text-fg-hi">
        No posts in <span className="text-emerald-bright">{categoryName}</span> yet.
      </p>
      <p className="mt-2 text-sm text-fg-soft">
        New essays land when something is worth saying.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="home-cta-secondary mt-6 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium"
      >
        See all topics
      </button>
    </div>
  );
}
