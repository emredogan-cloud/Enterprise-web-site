import Link from "next/link";
import { Moon } from "lucide-react";

/*
 * Brand-icon SVGs are inlined below — lucide-react v1.16 dropped them
 * (trademark concerns). 16×16, currentColor-driven so hover styles work.
 */
function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22 12a10 10 0 1 0-11.563 9.875v-6.987H7.898V12h2.539V9.797c0-2.506 1.492-3.89 3.776-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.261c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.888h-2.33v6.987A10.002 10.002 0 0 0 22 12z" />
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
  const columns = [
    {
      title: "Shop",
      links: [
        { label: "All Books", href: "/books" },
        { label: "Bestsellers", href: "/books" },
        { label: "New Releases", href: "/books" },
        { label: "Categories", href: "/books" },
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
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms", href: "#" },
        { label: "Privacy", href: "#" },
        { label: "Refund Policy", href: "#" },
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
            <div className="flex items-center gap-3 text-[#5d675f]">
              <a
                href="#"
                aria-label="Twitter / X"
                className="transition-colors hover:text-[#33f0aa]"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="transition-colors hover:text-[#33f0aa]"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="transition-colors hover:text-[#33f0aa]"
              >
                <FacebookIcon className="h-4 w-4" />
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
