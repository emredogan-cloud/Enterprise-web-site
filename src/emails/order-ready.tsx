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

/**
 * "Your digital book is ready" transactional email (SUB-PR 4.3).
 *
 * Design intent — same calm-literary tone as the storefront (Roadmap §7):
 *   - Serif heading using a web-safe stack (Georgia → Times) since
 *     Fraunces won't reliably load in webmail clients.
 *   - Single primary CTA (open library) in the brand evergreen.
 *   - Warm paper-and-ink palette mapped from OKLCH to widely-supported
 *     hex (email clients understand hex; OKLCH support is spotty).
 *   - No images, no decorative borders, no marketing chrome — this is a
 *     transactional notification, not a campaign.
 *
 * `<Preview>` controls the snippet that webmail clients show under the
 * subject line in the inbox list. Keep it ≤90 chars and informative.
 */
export interface OrderReadyEmailProps {
  buyerName: string | null;
  bookTitle: string;
  orderId: string;
  /** Absolute URL — relative paths render as broken links in webmail. */
  libraryUrl: string;
}

// ---------------------------------------------------------------------------
// Style constants — hand-mapped from the site's design tokens.
// Email clients strip <link rel="stylesheet">; every style must be inline.
// ---------------------------------------------------------------------------

const COLORS = {
  background: "#fdfbf5", // warm paper
  surface: "#ffffff",
  foreground: "#2a261f", // warm dark gray
  mutedForeground: "#6b6258",
  primary: "#1e5c47", // evergreen
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
  color: COLORS.foreground,
} as const;

const containerStyle = {
  backgroundColor: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "40px 36px",
} as const;

const brandStyle = {
  color: COLORS.mutedForeground,
  fontFamily: FONT_SANS,
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "0.2em",
  margin: "0 0 16px 0",
  textTransform: "uppercase",
} as const;

const titleStyle = {
  color: COLORS.foreground,
  fontFamily: FONT_SERIF,
  fontSize: "28px",
  fontWeight: 500,
  letterSpacing: "-0.01em",
  lineHeight: 1.2,
  margin: "0 0 24px 0",
} as const;

const textStyle = {
  color: COLORS.foreground,
  fontFamily: FONT_SANS,
  fontSize: "16px",
  lineHeight: 1.6,
  margin: "0 0 16px 0",
} as const;

const strongStyle = {
  color: COLORS.foreground,
  fontFamily: FONT_SERIF,
  fontSize: "18px",
  fontWeight: 500,
} as const;

const buttonStyle = {
  backgroundColor: COLORS.primary,
  borderRadius: "6px",
  color: COLORS.primaryForeground,
  display: "inline-block",
  fontFamily: FONT_SANS,
  fontSize: "15px",
  fontWeight: 500,
  padding: "12px 24px",
  textDecoration: "none",
} as const;

const hrStyle = {
  border: "none",
  borderTop: `1px solid ${COLORS.border}`,
  margin: "32px 0 16px 0",
} as const;

const footerStyle = {
  color: COLORS.mutedForeground,
  fontFamily: FONT_SANS,
  fontSize: "12px",
  letterSpacing: "0.1em",
  margin: 0,
  textTransform: "uppercase",
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OrderReadyEmail({
  buyerName,
  bookTitle,
  orderId,
  libraryUrl,
}: OrderReadyEmailProps) {
  // First-name extraction; falls back to a neutral greeting if no name.
  const firstName = buyerName?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hi ${firstName},` : "Hello,";
  const shortOrderRef = orderId.slice(0, 8);

  return (
    <Html>
      <Head />
      <Preview>{`Your digital book is ready: ${bookTitle}`}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text style={brandStyle}>Digital Bookstore</Text>

          <Heading as="h1" style={titleStyle}>
            Your book is ready
          </Heading>

          <Text style={textStyle}>{greeting}</Text>

          <Text style={textStyle}>
            <span style={strongStyle}>{bookTitle}</span> has been watermarked
            and is now in your library. The PDF is yours to keep — download it,
            read it online, save it to whichever reader you prefer.
          </Text>

          <Section style={{ margin: "32px 0", textAlign: "center" }}>
            <Link href={libraryUrl} style={buttonStyle}>
              Open my library
            </Link>
          </Section>

          <Text style={textStyle}>
            If the button above doesn&apos;t work, paste this link into your
            browser:
          </Text>
          <Text
            style={{
              ...textStyle,
              color: COLORS.mutedForeground,
              fontSize: "13px",
              wordBreak: "break-all",
            }}
          >
            <Link
              href={libraryUrl}
              style={{ color: COLORS.primary, textDecoration: "underline" }}
            >
              {libraryUrl}
            </Link>
          </Text>

          <Hr style={hrStyle} />

          <Text style={footerStyle}>
            Order ref · {shortOrderRef} · Digital Bookstore
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Default export for `@react-email/preview-server` so this template
// shows up in the live preview tool (`npx email dev`) without extra wiring.
export default OrderReadyEmail;
