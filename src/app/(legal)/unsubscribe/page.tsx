import type { Metadata } from "next";

import { LegalShell } from "@/components/cinematic/legal-shell";
import { buildPageMetadata } from "@/lib/metadata";
import { normalizeEmail, verifyUnsubscribeToken } from "@/lib/unsubscribe";

import { UnsubscribeForm } from "./unsubscribe-form";

/**
 * /unsubscribe — the human end of the link in every Valice Press email.
 *
 * Deliberately a confirm-then-POST page rather than a GET that acts. Mail
 * clients and security scanners prefetch links; a GET that unsubscribed on
 * sight would remove people who never clicked anything. The one-click path
 * mail clients actually use is the POST endpoint named by
 * `List-Unsubscribe-Post`, which this page shares.
 *
 * The signature is checked here so a wrong or truncated link says so at once
 * instead of after a click.
 */
export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Unsubscribe",
    description: "Leave the Valice Press mailing list.",
    path: "/unsubscribe",
  }),
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string }>;
}) {
  const { e, t } = await searchParams;
  const email = normalizeEmail(e ?? "");
  const valid = Boolean(email && t && verifyUnsubscribeToken(email, t));

  return (
    <LegalShell
      eyebrow="Mailing list"
      title="Unsubscribe"
      lastUpdated="2026-09-02"
      intro={
        valid ? (
          <p>
            One click and we stop writing to <strong>{email}</strong>. No
            confirmation email, no exit survey.
          </p>
        ) : (
          <p>
            This link is incomplete or has been altered in transit — some mail
            clients break long URLs across lines. Open the original email and
            click the link there, or write to{" "}
            <a href="mailto:hello@valicepress.com">hello@valicepress.com</a> and
            we will remove you by hand.
          </p>
        )
      }
    >
      {valid ? <UnsubscribeForm email={email} token={t as string} /> : null}
      <h2>What happens next</h2>
      <p>
        Your address is marked unsubscribed with our email provider and stops
        receiving list mail immediately. We keep the record of the address
        itself so that a later send cannot accidentally re-add you — removing
        it entirely is what makes someone hear from a list again a year later.
      </p>
      <p>
        This does not affect email about something you have bought. If you own
        a book here, the delivery and receipt messages for that order still
        reach you.
      </p>
    </LegalShell>
  );
}
