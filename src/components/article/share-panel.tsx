"use client";

import { Check, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

/**
 * Glass share panel below the TOC.
 *
 * Four circular icon buttons: X/Twitter (inline SVG — Lucide dropped the
 * brand icon), Facebook (inline SVG), LinkedIn (Lucide), and Copy-link
 * (Lucide + clipboard interaction).
 *
 * The current page URL is resolved on click via `window.location.href`
 * — keeps the component prop-free and SSR-safe.
 */
export function SharePanel() {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail under strict permissions; fall back to no-op
      // — the user can still copy from the address bar.
    }
  };

  const share = (intent: "twitter" | "facebook" | "linkedin") => {
    if (typeof window === "undefined") return;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const intentUrl =
      intent === "twitter"
        ? `https://twitter.com/intent/tweet?url=${url}&text=${title}`
        : intent === "facebook"
          ? `https://www.facebook.com/sharer/sharer.php?u=${url}`
          : `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer,width=600,height=520");
  };

  return (
    <div className="home-glass relative overflow-hidden rounded-[24px] p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/35 to-transparent"
      />

      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#88918a]">
        Share this article
      </p>

      <div className="mt-4 flex items-center gap-2.5">
        <IconButton
          label="Share on X"
          onClick={() => share("twitter")}
        >
          <TwitterIcon className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton
          label="Share on Facebook"
          onClick={() => share("facebook")}
        >
          <FacebookIcon className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton
          label="Share on LinkedIn"
          onClick={() => share("linkedin")}
        >
          <LinkedinIcon className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton label="Copy link" onClick={onCopy} active={copied}>
          {copied ? (
            <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.2} />
          ) : (
            <LinkIcon aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
          )}
        </IconButton>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  active = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
        active
          ? "border-[#33f0aa]/60 bg-[#33f0aa]/15 text-[#33f0aa] shadow-[0_0_12px_rgba(51,240,170,0.4)]"
          : "border-white/[0.1] bg-white/[0.03] text-[#a7a7a0] hover:-translate-y-0.5 hover:border-[#33f0aa]/40 hover:bg-[#33f0aa]/10 hover:text-[#33f0aa] hover:shadow-[0_8px_18px_-6px_rgba(51,240,170,0.4)]"
      }`}
    >
      {children}
    </button>
  );
}

/* Brand SVGs — Lucide v1.16 dropped these (trademark concerns) */
function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.027-3.036-1.852-3.036-1.853 0-2.136 1.445-2.136 2.939v5.666H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.37-1.852 3.602 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.78 13.019H3.554V9h3.563v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
