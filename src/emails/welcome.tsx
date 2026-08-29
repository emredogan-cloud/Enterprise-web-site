import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import type { NewsletterSource } from "@/lib/newsletter-client";

/**
 * Welcome email — the one message a new subscriber gets on signing up.
 *
 * This is a MARKETING email, not a transactional one, and the difference is
 * load-bearing: it is only ever sent to someone who ticked the box, and it
 * carries an unsubscribe link. `order-ready.tsx` is the transactional
 * counterpart and deliberately carries no marketing chrome at all.
 *
 * Tone: one email, saying what the list is and what it is not. No launch
 * countdown, no "we're so excited", no second CTA competing with the first.
 * A publisher that emails rarely should say so plainly, because that is the
 * actual promise being made.
 *
 * The `source` variant changes only the opening paragraph. Someone who
 * arrived from the back of a printed puzzle book has already met Valice
 * Press and should not be greeted as a stranger to it — but they get the
 * same list, the same cadence and the same unsubscribe. One audience,
 * segmented; never one list per book.
 */
export interface WelcomeEmailProps {
  source: NewsletterSource | null;
  /** Absolute URL — relative paths render as broken links in webmail. */
  catalogUrl: string;
  /** Absolute unsubscribe URL supplied by the ESP. */
  unsubscribeUrl: string;
}

const COLORS = {
  background: "#fdfbf5",
  surface: "#ffffff",
  foreground: "#2a261f",
  mutedForeground: "#6b6258",
  primary: "#1e5c47",
  primaryForeground: "#fdfbf5",
  border: "#e5dfd2",
} as const;

const FONT_SERIF =
  'Georgia, "Times New Roman", "Hoefler Text", Cambria, serif';
const FONT_SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

const bodyStyle = {
  backgroundColor: COLORS.background,
  fontFamily: FONT_SANS,
  margin: 0,
  padding: "32px 0",
};

const containerStyle = {
  backgroundColor: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "10px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "40px",
};

const headingStyle = {
  color: COLORS.foreground,
  fontFamily: FONT_SERIF,
  fontSize: "26px",
  fontWeight: 500,
  lineHeight: 1.25,
  margin: "0 0 20px",
};

const textStyle = {
  color: COLORS.foreground,
  fontSize: "15px",
  lineHeight: 1.65,
  margin: "0 0 16px",
};

const mutedStyle = {
  color: COLORS.mutedForeground,
  fontSize: "13px",
  lineHeight: 1.6,
  margin: "0 0 10px",
};

const ctaStyle = {
  backgroundColor: COLORS.primary,
  borderRadius: "999px",
  color: COLORS.primaryForeground,
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 600,
  padding: "12px 24px",
  textDecoration: "none",
};

const brandStyle = {
  color: COLORS.primary,
  fontFamily: FONT_SERIF,
  fontSize: "15px",
  margin: "0 0 28px",
};

/** Opening line, by where the person signed up. */
function opener(source: NewsletterSource | null): string {
  switch (source) {
    case "codex-verify":
      return "You reached the verification page at the back of Codex Enigmatica, which means you got further than most people do. Thank you for signing up while you were there.";
    case "article":
    case "category":
      return "Thank you for subscribing from the journal. You'll hear from us when there's something worth reading.";
    case "home":
    default:
      return "Thank you for subscribing. You'll hear from us when there's something worth reading.";
  }
}

export function WelcomeEmail({
  source,
  catalogUrl,
  unsubscribeUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>What to expect from Valice Press — and how often.</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text style={brandStyle}>Valice Press</Text>

          <Heading style={headingStyle}>You&apos;re on the list.</Heading>

          <Text style={textStyle}>{opener(source)}</Text>

          <Text style={textStyle}>
            Valice Press publishes a small number of carefully made books —
            world mythology, bestiaries, puzzle books and games — rather
            than a large number of quick ones. That means this list is
            quiet. We write when a book is finished or a new edition is
            ready, and not on a schedule in between.
          </Text>

          <Section style={{ margin: "28px 0" }}>
            <Link href={catalogUrl} style={ctaStyle}>
              See what we&apos;re working on
            </Link>
          </Section>

          <Hr
            style={{
              border: "none",
              borderTop: `1px solid ${COLORS.border}`,
              margin: "32px 0 20px",
            }}
          />

          <Text style={mutedStyle}>
            You&apos;re receiving this because you subscribed at
            valicepress.com. We never received your address from Amazon or
            any other retailer — they don&apos;t share it, and we
            wouldn&apos;t use it if they did.
          </Text>
          <Text style={mutedStyle}>
            <Link
              href={unsubscribeUrl}
              style={{ color: COLORS.mutedForeground }}
            >
              Unsubscribe
            </Link>{" "}
            at any time. One click, no questions.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;
