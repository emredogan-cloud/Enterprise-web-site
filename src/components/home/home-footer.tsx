import Link from "next/link";
import { Moon } from "lucide-react";

/*
 * Brand-icon SVGs are inlined below — lucide-react v1.16 dropped them
 * (trademark concerns). 16×16, currentColor-driven so hover styles work.
 *
 * Phase 0.E — Instagram and Facebook removed: per the audit + execution
 * roadmap (Decision 2), we don't link to profiles that don't exist for
 * this project. X + GitHub are the two real social surfaces.
 */
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

/**
 * Minimal cinematic footer.
 *
 * 4-column nav + social icons + dark-mode indicator chip.
 * Pure Server Component, no JS.
 */
export function HomeFooter() {
  /*
   * Phase 0.E — column structure realigned to the audit:
   *
   *   • Shop:    All Books + Bestsellers / New Releases (query-param
   *              variants of /books — the catalog already sorts by these
   *              keys client-side; URL sync lands in Phase 2.F) +
   *              Categories (index page lands in Phase 2.D — until then
   *              this is a known soft-404).
   *   • Discover: unchanged (all three already work).
   *   • Support:  + Contact (mailto) — closes the "where do I report a
   *              problem?" gap the audit flagged in §5.3.
   *   • Legal:   + KVKK for TR compliance. URLs stay "#" until the four
   *              real pages ship in Phase 1.A — the structure itself is
   *              now production-ready.
   */
  const columns = [
    {
      title: "Shop",
      links: [
        { label: "All Books", href: "/books" },
        { label: "Bestsellers", href: "/books?sort=rating" },
        { label: "New Releases", href: "/books?sort=newest" },
        { label: "Categories", href: "/categories" },
      ],
    },
    {
      title: "Discover",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Reading Guides", href: "/blog/category/reading-guides" },
        { label: "Behind the Scenes", href: "/blog/category/behind-the-scenes" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Library", href: "/account/library" },
        { label: "Orders", href: "/account/orders" },
        { label: "Settings", href: "/account/settings" },
        { label: "Contact", href: "mailto:emre30283@gmail.com" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms", href: "#" },
        { label: "Privacy", href: "#" },
        { label: "Refund Policy", href: "#" },
        { label: "KVKK", href: "#" },
      ],
    },
  ];

  return (
    <footer id="about" className="relative border-t border-white/[0.06] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* Brand column */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-base font-medium text-[#e6e6e0]"
            >
              <span className="font-serif">digital bookstore</span>
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-[#33f0aa] shadow-[0_0_8px_#33f0aa]"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#88918a]">
              A first-party bookstore for digital books. Buy once, download, and
              read anywhere. Yours to keep — never locked.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a7a7a0]">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#88918a] transition-colors hover:text-[#e6e6e0]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar — copyright, social, theme indicator */}
        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center">
          {/* Left: copyright + social */}
          <div className="flex items-center gap-5">
            <p className="text-xs text-[#5d675f]">
              © {new Date().getFullYear()} Digital Bookstore. All rights reserved.
            </p>
            {/*
              Phase 0.E — only the two real, owner-controlled accounts get
              icons. Instagram and Facebook were `href="#"` dead links;
              empty social slots read as an abandoned brand.
            */}
            <div className="flex items-center gap-3 text-[#5d675f]">
              <a
                href="https://x.com/emredogancloud"
                aria-label="X (Twitter)"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#33f0aa]"
              >
                <XIcon className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/emredogan-cloud"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#33f0aa]"
              >
                <GitHubIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right: dark-mode indicator chip (visual only — confirms tone) */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-[#a7a7a0]">
            <Moon aria-hidden className="h-3 w-3 text-[#33f0aa]" />
            Dark
          </div>
        </div>
      </div>
    </footer>
  );
}
