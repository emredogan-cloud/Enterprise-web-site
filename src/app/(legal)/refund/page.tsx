import type { Metadata } from "next";
import Link from "next/link";

import { LegalShell } from "@/components/cinematic/legal-shell";

/**
 * /refund — Refund Policy.
 *
 * Phase 1.A. Direct, customer-friendly. Reinforces the "buy once, yours
 * to keep" brand promise (the audit specifically called for this) and
 * gives the EU-required 14-day window for digital goods that haven't
 * been downloaded yet.
 */
export const metadata: Metadata = {
  title: "Refund policy",
  description:
    "How refunds work for digital books bought on Digital Bookstore — 14 days, no questions asked, before you download.",
  alternates: { canonical: "/refund" },
  openGraph: {
    title: "Refund policy — Digital Bookstore",
    description:
      "How refunds work for digital books bought on Digital Bookstore — 14 days, no questions asked, before you download.",
    url: "/refund",
    type: "article",
  },
};

export default function RefundPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Refund policy"
      lastUpdated="2026-05-30"
      intro={
        <p>
          We sell digital books. Once you download one, the file is
          yours forever — that&apos;s the &ldquo;buy once, yours to
          keep&rdquo; promise. The flip side: once the download has
          happened, we can&apos;t pull it back. This page explains how
          we handle refunds in that context.
        </p>
      }
    >
      <h2>The short version</h2>
      <ul>
        <li>
          <strong>14 days, no questions asked</strong> if you
          haven&apos;t downloaded the book yet.
        </li>
        <li>
          <strong>Case-by-case after download</strong> — email us; we
          read every message.
        </li>
        <li>
          <strong>Always full refund</strong> if the file is corrupted,
          the wrong book, or never delivered.
        </li>
      </ul>

      <h2>1. Before you download</h2>
      <p>
        You have fourteen days from the moment of purchase to request a
        full refund, no questions asked. The only condition: the book
        must not have been downloaded from your library yet. You can
        check this on your{" "}
        <Link href="/account/orders">orders page</Link> — every order
        shows whether the file has been pulled.
      </p>
      <p>
        To request a refund, email{" "}
        <a href="mailto:emre30283@gmail.com">emre30283@gmail.com</a>{" "}
        with your order id (also on the orders page). We&apos;ll
        process the refund through Paddle, our payment processor.
        Paddle returns the funds to the same card or wallet you paid
        with; the transfer usually completes within five business days
        depending on your bank.
      </p>

      <h2>2. After you download</h2>
      <p>
        Once the file has been downloaded, the license is fulfilled and
        the purchase is treated as final. We do this so we can keep the
        &ldquo;buy once, yours to keep&rdquo; promise honest — your
        copy stays yours, and we don&apos;t need to claw back what
        you&apos;ve already saved to your disk.
      </p>
      <p>
        That said: if you have a real problem (you bought the wrong
        book by accident, the file you got has a defect, your
        circumstances changed in an unusual way), email us. We&apos;ll
        look at the situation on its merits. We&apos;re a small,
        independent storefront and we&apos;d rather make it right than
        hide behind a policy.
      </p>

      <h2>3. Defective files or wrong delivery</h2>
      <p>
        If the book you received is corrupted, won&apos;t open, has
        missing pages, or simply isn&apos;t the book you ordered, you
        get a full refund regardless of whether you&apos;ve downloaded.
        Email us, ideally with a screenshot of the issue, and
        we&apos;ll process the refund as soon as we verify.
      </p>

      <h2>4. Never delivered</h2>
      <p>
        If a watermarking job fails and your book never arrives in your
        library after thirty minutes from purchase, refresh{" "}
        <Link href="/account/library">/account/library</Link> once. If
        the book still isn&apos;t there, email us with the order id —
        we&apos;ll either retry the delivery or refund the purchase.
      </p>

      <h2>5. Refunds and the watermark</h2>
      <p>
        Every downloaded PDF is watermarked with a small footer line
        that encodes the purchase id. The watermark stays attached to
        the file even after a refund; if a refunded copy surfaces
        publicly, we can trace it back. This protects honest customers
        from price increases caused by widespread leaking, and it
        keeps the refund process trust-based rather than DRM-based.
      </p>

      <h2>6. EU consumers</h2>
      <p>
        If you&apos;re in the European Union, you have the digital
        right of withdrawal under Directive 2011/83/EU — fourteen days
        for digital content as long as performance hasn&apos;t started
        (i.e. the download hasn&apos;t happened). By purchasing and
        downloading a file within the fourteen-day window, you
        explicitly consent to immediate performance and waive the
        right of withdrawal for that specific purchase. Other purchases
        in your account are unaffected.
      </p>

      <h2>7. Disputes</h2>
      <p>
        If you&apos;d rather not contact us directly, you can also open
        a dispute through Paddle (your receipt has the link) or through
        your card issuer. We&apos;d still rather hear from you first —
        most issues are resolved faster by email than through a
        chargeback.
      </p>

      <hr />

      <p>
        Refund questions, edge cases, or unusual situations:{" "}
        <a href="mailto:emre30283@gmail.com">emre30283@gmail.com</a>.
        Reply within two business days.
      </p>
    </LegalShell>
  );
}
