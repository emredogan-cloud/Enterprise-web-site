"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * IntersectionObserver-driven fade-up reveal wrapper.
 *
 * Why not Framer Motion: a single page-scoped IntersectionObserver costs
 * ~0KB on top of React; Framer Motion would add ~50KB for the same effect
 * and the page is `○ Static` — we want the leanest possible client bundle.
 *
 * Usage:
 *   <RevealOnScroll>           // single block
 *   <RevealOnScroll stagger>   // direct children fade in with 80ms stagger
 *
 * Both modes flip a `data-reveal="visible"` attribute when the wrapper
 * enters the viewport; the CSS in `globals.css` reads that attribute and
 * runs the fade-up transition.
 */
export function RevealOnScroll({
  children,
  stagger = false,
  delay = 0,
  className,
}: {
  children: ReactNode;
  /** When true, applies cascading delays to direct children. */
  stagger?: boolean;
  /** Initial delay in ms before this block reveals. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the user prefers reduced motion, reveal immediately and skip
    // the observer — the CSS reduced-motion rule already neutralizes
    // the transition, but we shouldn't even register the observer.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-reveal", "visible");
      const kids = stagger ? Array.from(el.children) : [];
      for (const k of kids) k.setAttribute("data-reveal", "visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal", "visible");
            observer.unobserve(entry.target);
          }
        }
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.1,
      },
    );

    if (stagger) {
      const kids = Array.from(el.children) as HTMLElement[];
      kids.forEach((kid, i) => {
        kid.setAttribute("data-reveal", "");
        kid.style.setProperty("--reveal-delay", `${delay + i * 80}ms`);
        observer.observe(kid);
      });
    } else {
      el.setAttribute("data-reveal", "");
      if (delay > 0) el.style.setProperty("--reveal-delay", `${delay}ms`);
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [stagger, delay]);

  /*
   * The hiding attribute is rendered on the SERVER, not applied in the effect.
   *
   * Before this, the markup shipped visible and the effect then set
   * `data-reveal=""` — whose CSS rule is `opacity: 0` — so on a slow device the
   * section painted, disappeared at hydration, and faded back in. Rendering the
   * attribute up front means the reader never sees the flash.
   *
   * The stagger case cannot mark its children server-side (they are opaque
   * `children`), so the wrapper carries `data-reveal-stagger` and globals.css
   * hides its direct children until the observer promotes each one.
   *
   * A <noscript> rule in the root layout forces everything visible when
   * JavaScript never arrives, so this can never hide content permanently.
   */
  return (
    <div
      ref={ref}
      className={className}
      {...(stagger ? { "data-reveal-stagger": "" } : { "data-reveal": "" })}
    >
      {children}
    </div>
  );
}
