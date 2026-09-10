import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

/**
 * The free-ebook delivery email.
 *
 * TRANSACTIONAL, NOT MARKETING. It is sent because a person asked for this
 * specific file, and it carries no unsubscribe link for the same reason
 * `order-ready.tsx` carries none: unsubscribing from a book you asked for is
 * not a thing anyone wants to do, and offering it implies this is a mailing
 * list. Anyone who ticked the newsletter box got a separate, marketing
 * welcome email with its own unsubscribe.
 *
 * THE REVIEW LINE
 * There is one sentence about reviews. It asks for an *honest* review, says
 * plainly that it is optional, says plainly that nothing depends on it, and
 * links nowhere in particular. It does not ask for stars, does not ask for a
 * positive review, does not offer anything in return, and there is nothing
 * anywhere in this system that could check whether one was left. Amazon
 * permits giving books away and permits asking for an honest review; it
 * forbids requiring one or trying to influence what it says.
 *
 * THE LINK EXPIRES, AND THE EMAIL SAYS SO
 * The download URL is a signed, short-lived link to a private bucket. A
 * recipient who opens this tomorrow will find it dead, so the expiry is
 * stated in the body rather than discovered by clicking. Telling them who to
 * ask for a fresh one is the difference between an expired link and a lost
 * customer.
 */
export interface FreeBookEmailProps {
  bookTitle: string;
  downloadUrl: string;
  expiresInMinutes: number;
}

export function FreeBookEmail({
  bookTitle,
  downloadUrl,
  expiresInMinutes,
}: FreeBookEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Your copy of ${bookTitle} is ready to download`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={imprint}>VALICE PRESS</Text>

          <Heading style={h1}>Your ebook is ready</Heading>

          <Text style={text}>
            Here is your copy of <strong>{bookTitle}</strong>, free as part of
            our limited-time promotion. Thank you for reading with us.
          </Text>

          <Section style={{ margin: "28px 0" }}>
            <Button style={button} href={downloadUrl}>
              Download the PDF
            </Button>
          </Section>

          <Text style={small}>
            This download link expires in about {expiresInMinutes} minutes for
            security. If it has already expired, just reply to this email and
            we&apos;ll send a fresh one straight away.
          </Text>

          <Hr style={hr} />

          <Text style={small}>
            If you have time after reading, we&apos;d be grateful for an honest
            review on Amazon. Reviews are completely optional and do not affect
            your eligibility for free books.
          </Text>

          <Text style={footer}>
            You&apos;re receiving this because you requested this book at
            valicepress.com.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default FreeBookEmail;

const body: React.CSSProperties = {
  backgroundColor: "#f5f4f0",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: "32px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e6e3da",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px",
};

const imprint: React.CSSProperties = {
  color: "#8a7a4e",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.24em",
  margin: 0,
};

const h1: React.CSSProperties = {
  color: "#14231d",
  fontSize: "24px",
  fontWeight: 600,
  lineHeight: 1.25,
  margin: "14px 0 0",
};

const text: React.CSSProperties = {
  color: "#333d38",
  fontSize: "15px",
  lineHeight: 1.65,
  margin: "16px 0 0",
};

const small: React.CSSProperties = {
  color: "#5d6862",
  fontSize: "13px",
  lineHeight: 1.6,
  margin: "12px 0 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#16c784",
  borderRadius: "999px",
  color: "#03281b",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: 600,
  padding: "13px 26px",
  textDecoration: "none",
};

const hr: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e6e3da",
  margin: "26px 0 0",
};

const footer: React.CSSProperties = {
  color: "#8b948e",
  fontSize: "12px",
  lineHeight: 1.6,
  margin: "18px 0 0",
};
