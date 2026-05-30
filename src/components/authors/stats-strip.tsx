import Link from "next/link";
import { BookOpen, Globe, PenTool, Users } from "lucide-react";

/**
 * Bottom stats + author CTA strip — large glass panel with two halves.
 *
 *   LEFT — four stats (10K+ Authors · 50K+ Books · 2M+ Readers · 120+ Countries),
 *           each with a small emerald-tinted icon.
 *   RIGHT — "Are you an author?" CTA, rendered as a visually distinct
 *           nested inner card (per the brief: slightly darker green
 *           surface, cleanly separated from the stats block).
 *
 * Pure Server Component; the only interactivity is the Apply Now link.
 */
export function StatsStrip() {
  const stats = [
    { icon: PenTool, value: "10K+", label: "Authors" },
    { icon: BookOpen, value: "50K+", label: "Books" },
    { icon: Users, value: "2M+", label: "Readers" },
    { icon: Globe, value: "120+", label: "Countries" },
  ];

  return (
    <section className="mx-auto mt-20 max-w-7xl px-6 sm:mt-24">
      <div className="home-glass relative overflow-hidden rounded-[32px] p-5 sm:p-7">
        {/* Top emerald edge line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
        />

        <div className="grid gap-5 lg:grid-cols-[2fr_1fr] lg:gap-7">
          {/* LEFT — stats block */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group flex items-center gap-3 rounded-2xl border border-white/[0.04] bg-white/[0.015] px-4 py-4 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[#16c784]/30 bg-[#16c784]/10 text-[#33f0aa] transition-shadow group-hover:shadow-[0_0_14px_rgba(51,240,170,0.3)]">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-[20px] font-medium leading-none text-[#e6e6e0] sm:text-[22px]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#88918a]">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT — nested inner card (per brief: distinct slightly-darker
              green surface, cleanly separated from the stats block) */}
          <div
            className="relative overflow-hidden rounded-2xl border border-[#16c784]/25 p-5"
            style={{
              background:
                "linear-gradient(160deg, #0a1f17 0%, #061410 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(51, 240, 170, 0.06), 0 12px 32px -16px rgba(0, 0, 0, 0.7)",
            }}
          >
            {/* Subtle bloom in the corner */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(51, 240, 170, 0.25) 0%, transparent 70%)",
              }}
            />

            <h3 className="font-serif text-[18px] font-medium leading-tight text-[#e6e6e0] sm:text-[19px]">
              Are you an author?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#a7a7a0]">
              Join our community and share your stories with the world.
            </p>
            <Link
              href="#apply"
              className="home-cta-primary mt-5 inline-flex h-10 items-center gap-2 rounded-full px-5 text-xs font-semibold tracking-tight"
            >
              <span>Apply Now</span>
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
