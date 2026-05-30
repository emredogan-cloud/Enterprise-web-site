import type { Metadata } from "next";
import Link from "next/link";

import { LegalShell } from "@/components/cinematic/legal-shell";

/**
 * /terms — Terms of Service.
 *
 * Phase 1.A. Plain-English, brand-aligned policy. Not legal advice; we
 * still recommend an attorney review before opening to broad markets,
 * but every clause here reflects how the storefront actually works:
 *   - Paddle as Merchant of Record (ADR-2 / Roadmap §11)
 *   - Personal, non-transferable license per purchase
 *   - Watermarked PDF artifacts (ADR-3) — not DRM
 *   - Account deletion / data export self-serve in /account/settings
 */
export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The rules for buying, downloading, and reading books on Digital Bookstore.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of service — Digital Bookstore",
    description:
      "The rules for buying, downloading, and reading books on Digital Bookstore.",
    url: "/terms",
    type: "article",
  },
};

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Terms of service"
      lastUpdated="2026-05-30"
      intro={
        <p>
          These terms describe the agreement between you and Digital
          Bookstore when you create an account, buy a book, or use any
          part of this site. We&apos;ve kept the language direct because
          legal pages no one reads protect no one.
        </p>
      }
    >
      <h2>1. Who we are</h2>
      <p>
        Digital Bookstore is a first-party online store for digital
        books. The site is operated by Emre Doğan as a sole proprietor.
        You can reach us at{" "}
        <a href="mailto:emre30283@gmail.com">emre30283@gmail.com</a>{" "}
        for any question about these terms or your account.
      </p>

      <h2>2. Accounts</h2>
      <p>
        Authentication is handled by Clerk. You agree to provide a
        working email, to keep your sign-in credentials private, and to
        let us know promptly if you suspect unauthorized use of your
        account.
      </p>
      <p>
        You can delete your account at any time from{" "}
        <Link href="/account/settings">/account/settings</Link>. Deletion
        removes your profile and your library entitlements; finalized
        orders and tax records are retained as required by Paddle and
        applicable accounting law.
      </p>

      <h2>3. Buying a book</h2>
      <p>
        When you click Checkout, you&apos;re redirected to Paddle, our
        Merchant of Record. Paddle handles the transaction, collects any
        applicable VAT or sales tax, and issues your receipt. We never
        see your card details. Prices shown on the site are the price
        we ask Paddle to charge; the final total at checkout may
        include taxes set by your jurisdiction.
      </p>
      <p>
        A successful payment grants you a personal, non-transferable
        license to download and read the book. You may keep the file
        forever and read it on any device you own; you may not resell,
        redistribute, or upload it for others to access.
      </p>

      <h2>4. What you download</h2>
      <p>
        Files are PDF artifacts watermarked with a small footer line that
        encodes your purchase id. The watermark is the only protection;
        we don&apos;t use DRM, and the file isn&apos;t locked to a
        device. If you find a watermarked copy of your purchase
        circulating publicly, contact us — we&apos;ll work with you to
        figure out what happened.
      </p>

      <h2>5. Returns</h2>
      <p>
        Refunds are governed by our{" "}
        <Link href="/refund">Refund Policy</Link>. The short version: if
        you haven&apos;t downloaded the book, email us within 14 days
        and we&apos;ll process the refund through Paddle. Once
        you&apos;ve downloaded, the license is fulfilled and the
        purchase is non-refundable.
      </p>

      <h2>6. Acceptable use</h2>
      <p>
        Don&apos;t do anything illegal with the service. In particular:
      </p>
      <ul>
        <li>Don&apos;t share, resell, or publicly republish purchased books</li>
        <li>Don&apos;t attempt to circumvent the rate limiter or auth</li>
        <li>Don&apos;t script automated downloads or scraping</li>
        <li>Don&apos;t submit content (reviews, etc.) you don&apos;t own the rights to</li>
      </ul>
      <p>
        We reserve the right to revoke account access for serious or
        repeated violations. Revocation cancels future access but does
        not retroactively un-fulfill purchases.
      </p>

      <h2>7. Reviews and user-submitted content</h2>
      <p>
        When you post a review, you grant Digital Bookstore a
        non-exclusive license to display it on the book&apos;s page and
        in editorial summaries. You can delete your own reviews at any
        time. We may remove reviews that contain spam, abuse, or off-topic
        content.
      </p>

      <h2>8. Changes to the service</h2>
      <p>
        We may add features, change prices for new purchases, or
        discontinue parts of the site. Books you&apos;ve already bought
        stay in your library — that&apos;s the &ldquo;buy once, yours to
        keep&rdquo; promise, and it survives any product change.
      </p>

      <h2>9. Disclaimers and liability</h2>
      <p>
        The service is provided &ldquo;as is.&rdquo; We work hard to keep
        it reliable but we don&apos;t guarantee uninterrupted access.
        Our total liability for any claim arising from your use of the
        service is limited to the amount you paid us in the twelve
        months preceding the claim.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by the laws of Turkey. Disputes that
        can&apos;t be resolved by email will be heard by the courts of
        İstanbul. If you&apos;re an EU consumer, you also retain the
        rights given to you by your local consumer-protection law.
      </p>

      <h2>11. Changes to these terms</h2>
      <p>
        We&apos;ll update this page when material changes happen and
        bump the &ldquo;last updated&rdquo; date at the top. For
        breaking changes that affect existing accounts, we&apos;ll also
        email you at the address on file.
      </p>

      <hr />

      <p>
        Questions? Reach us at{" "}
        <a href="mailto:emre30283@gmail.com">emre30283@gmail.com</a>.
        We answer every message.
      </p>
    </LegalShell>
  );
}
