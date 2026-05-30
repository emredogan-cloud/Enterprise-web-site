import type { Metadata } from "next";
import Link from "next/link";

import { LegalShell } from "@/components/cinematic/legal-shell";

/**
 * /about — the brand-story page.
 *
 * Phase 1.B. Replaces the previous `<a href="#about">` anchor hack
 * in `cinematic-header.tsx`, which used to scroll to the footer's
 * `id="about"` (a hack that broke on every page that wasn't the
 * homepage). The header link is updated in this same sub-task to
 * `<Link href="/about">`.
 *
 * Lives inside the `(legal)` route group so it inherits the shared
 * cinematic shell + `<LegalShell>` interior chrome. The group name
 * is an internal detail — the URL stays `/about`.
 */
export const metadata: Metadata = {
  title: "About",
  description:
    "Why Digital Bookstore exists, who built it, and what it stands for.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Digital Bookstore",
    description:
      "Why Digital Bookstore exists, who built it, and what it stands for.",
    url: "/about",
    type: "article",
  },
};

export default function AboutPage() {
  return (
    <LegalShell
      eyebrow="About"
      title="A bookstore that doesn't lock you out"
      intro={
        <p>
          Digital Bookstore is a first-party online bookshop for digital
          books. It exists because every other digital reading platform
          either rents you the file, locks it to one device, or watches
          what you do with it. We thought there should be a better way
          — so we built it.
        </p>
      }
    >
      <h2>What we believe</h2>
      <p>
        A book you bought should belong to you. You should be able to
        open it on whatever device you own, read it offline, lend it
        loosely to a friend the way you would lend a paper book, and
        still have it ten years from now even if our company is gone.
      </p>
      <p>
        We sell watermarked PDFs. The watermark is a small footer line
        that encodes your purchase id — it&apos;s how we protect honest
        customers without locking honest customers out. There&apos;s no
        DRM, no required app, no &ldquo;please log in to see the page
        you already bought&rdquo;.
      </p>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We don&apos;t track you across the web.</li>
        <li>We don&apos;t sell your data, ever.</li>
        <li>We don&apos;t lock files to a device or to our reader.</li>
        <li>We don&apos;t expire your library when subscriptions change hands.</li>
      </ul>

      <h2>Who built it</h2>
      <p>
        Digital Bookstore is run by Emre Doğan as a sole proprietor.
        The site is a serious one-person project, built in the open —
        every architectural decision is documented in our{" "}
        <Link href="/blog/category/behind-the-scenes">behind-the-scenes</Link>{" "}
        posts, and every editorial direction is documented in our{" "}
        <Link href="/blog/category/reading-guides">reading guides</Link>.
      </p>
      <p>
        You can reach us at{" "}
        <a href="mailto:emre30283@gmail.com">emre30283@gmail.com</a>{" "}
        for anything — book requests, technical issues, feedback. Every
        email gets a real reply.
      </p>

      <h2>How the storefront actually works</h2>
      <p>
        Payments are handled by Paddle, our Merchant of Record. They
        process the card, collect any tax owed in your jurisdiction,
        and issue your receipt. We never touch payment details.
      </p>
      <p>
        After a successful payment, the watermarking pipeline (Inngest +
        Cloudflare R2) prepares your per-order PDF and drops it into
        your{" "}
        <Link href="/account/library">/account/library</Link>. From
        there you can download the file or open it in the in-browser
        reader. The reader is just PDF.js — your reading progress
        syncs across devices, but the file itself is plain PDF.
      </p>

      <h2>The promises</h2>
      <blockquote>
        <p>
          Buy once. Yours to keep. Never locked.
        </p>
      </blockquote>
      <p>
        Those three lines are the brand. Everything else — the
        cinematic design, the editorial blog, the personal newsletters —
        exists to reinforce that promise. The day we break it is the
        day this storefront stops being what it&apos;s supposed to be.
      </p>

      <hr />

      <h2>Where to go next</h2>
      <ul>
        <li>
          Browse books at{" "}
          <Link href="/books">/books</Link>
        </li>
        <li>
          Read the blog at{" "}
          <Link href="/blog">/blog</Link>
        </li>
        <li>
          See our policies:{" "}
          <Link href="/terms">Terms</Link> ·{" "}
          <Link href="/privacy">Privacy</Link> ·{" "}
          <Link href="/refund">Refunds</Link> ·{" "}
          <Link href="/kvkk">KVKK</Link>
        </li>
        <li>
          Find us on{" "}
          <a
            href="https://x.com/emredogancloud"
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </a>{" "}
          and{" "}
          <a
            href="https://github.com/emredogan-cloud"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </li>
      </ul>
    </LegalShell>
  );
}
