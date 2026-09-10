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
 * The free-ebook delivery email.
 *
 * A PUBLISHER'S LETTER, NOT A TICKET RESPONSE. Someone asked a small press for
 * a book and the press is sending it. The shape follows from that: thank them,
 * name what they asked for, hand it over, say where the rest of the shelf is,
 * say where the printed editions live, thank them again.
 *
 * THE BOOK ARRIVES ATTACHED.
 * It used to arrive as a signed link that died in fifteen minutes — fine for a
 * checkout download clicked seconds after paying, wrong for an email opened
 * tomorrow morning. The PDF is now attached to the message, so it is simply
 * *there*, in the reader's inbox, for as long as they keep the mail. The link
 * remains as a fallback for the case an attachment cannot be carried (a very
 * large master, an attachment the provider refused) and the body says which
 * of the two happened rather than leaving the reader hunting.
 *
 * AMAZON LINKS ARE PASSED IN, NEVER BUILT.
 * `editions` comes from `getAmazonEditions`, which only returns a format the
 * catalog says is live and for which somebody recorded a real URL. This
 * component renders what it is given and invents nothing; a book with no live
 * Amazon edition simply has no such section.
 *
 * TRANSACTIONAL, NOT MARKETING. No unsubscribe link, for the same reason
 * `order-ready.tsx` has none: unsubscribing from a book you asked for is not a
 * thing anyone wants, and offering it implies this is a mailing list. Anyone
 * who ticked the newsletter box got a separate marketing welcome with its own
 * unsubscribe.
 *
 * THE REVIEW LINE asks for an *honest* review, says it is optional, says
 * nothing depends on it, and links nowhere in particular. Nothing in this
 * system can check whether one was left. Amazon permits giving books away and
 * asking for an honest review; it forbids requiring one.
 */
export interface FreeBookEmailEdition {
  label: string;
  url: string;
}

export interface FreeBookEmailProps {
  bookTitle: string;
  bookSubtitle?: string | null;
  /** Present when the PDF could not be attached; null when it is attached. */
  downloadUrl?: string | null;
  expiresInMinutes?: number;
  attachmentFilename?: string | null;
  /** Live Amazon editions, already filtered and ordered. */
  editions?: FreeBookEmailEdition[];
  /** Absolute URL of the book's page on valicepress.com. */
  bookUrl: string;
  /** Absolute URL of the free companion page, when the book has one. */
  companionUrl?: string | null;
  siteUrl: string;
}

export function FreeBookEmail({
  bookTitle,
  bookSubtitle,
  downloadUrl,
  expiresInMinutes,
  attachmentFilename,
  editions = [],
  bookUrl,
  companionUrl,
  siteUrl,
}: FreeBookEmailProps) {
  const attached = !downloadUrl;

  return (
    <Html>
      <Head />
      <Preview>{`${bookTitle} — your copy from Valice Press`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={imprint}>VALICE PRESS</Text>

          <Heading style={h1}>Your copy of {bookTitle}</Heading>

          <Text style={text}>Hello,</Text>

          <Text style={text}>
            Thank you for finding Valice Press. We&apos;re a small independent
            house, and it means a great deal when someone asks for one of our
            books.
          </Text>

          <Text style={text}>
            You requested <strong>{bookTitle}</strong>
            {bookSubtitle ? <span style={sub}> — {bookSubtitle}</span> : null}.
          </Text>

          {attached ? (
            <Text style={callout}>
              <strong>The PDF is attached to this email</strong>
              {attachmentFilename ? (
                <>
                  {" "}
                  as <code style={code}>{attachmentFilename}</code>
                </>
              ) : null}
              . It&apos;s yours to keep — save it wherever you like to read.
            </Text>
          ) : (
            <>
              <Text style={callout}>
                Your copy is waiting here:{" "}
                <Link href={downloadUrl!} style={inlineLink}>
                  Download the PDF
                </Link>
              </Text>
              <Text style={small}>
                This link expires in about {expiresInMinutes ?? 15} minutes for
                security. If it has already expired, just reply to this email
                and we&apos;ll send a fresh one straight away.
              </Text>
            </>
          )}

          <Hr style={hr} />

          <Heading as="h2" style={h2}>
            More from Valice Press
          </Heading>
          <Text style={text}>
            If this one suits you, the rest of the shelf is here:{" "}
            <Link href={`${siteUrl}/books`} style={inlineLink}>
              browse every book
            </Link>
            . You can also read more about this title on its own page:{" "}
            <Link href={bookUrl} style={inlineLink}>
              {bookTitle}
            </Link>
            .
          </Text>

          {companionUrl ? (
            <Text style={text}>
              This book has a free companion page — extra material, practice
              sheets and notes:{" "}
              <Link href={companionUrl} style={inlineLink}>
                open the companion
              </Link>
              .
            </Text>
          ) : null}

          {editions.length > 0 ? (
            <>
              <Hr style={hr} />
              <Heading as="h2" style={h2}>
                Read it on Amazon
              </Heading>
              <Text style={text}>
                {bookTitle} is also available in print and on Kindle:
              </Text>
              <Section style={{ margin: "12px 0 0" }}>
                {editions.map((e) => (
                  <Text key={e.url} style={editionRow}>
                    <Link href={e.url} style={inlineLink}>
                      {e.label}
                    </Link>
                  </Text>
                ))}
              </Section>
            </>
          ) : null}

          <Hr style={hr} />

          <Text style={text}>
            Thank you again for reading with us. If anything is wrong with the
            file, or you were after a different edition, just reply to this
            email — a person reads them.
          </Text>

          <Text style={small}>
            If you have time after reading, we&apos;d be grateful for an honest
            review on Amazon. Reviews are completely optional and do not affect
            your eligibility for free books.
          </Text>

          <Text style={signoff}>
            — Valice Press
            <br />
            <Link href={siteUrl} style={inlineLink}>
              valicepress.com
            </Link>
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
  fontSize: "23px",
  fontWeight: 600,
  lineHeight: 1.3,
  margin: "14px 0 0",
};

const h2: React.CSSProperties = {
  color: "#14231d",
  fontSize: "15px",
  fontWeight: 700,
  letterSpacing: "0.02em",
  margin: "22px 0 0",
};

const text: React.CSSProperties = {
  color: "#333d38",
  fontSize: "15px",
  lineHeight: 1.65,
  margin: "16px 0 0",
};

const sub: React.CSSProperties = {
  color: "#5d6862",
};

/* The one line the reader is looking for. Given a little ground of its own so
   it is not just another paragraph in a wall of them. */
const callout: React.CSSProperties = {
  backgroundColor: "#f7f4ea",
  border: "1px solid #e6dcc0",
  borderRadius: "10px",
  color: "#2f3a34",
  fontSize: "15px",
  lineHeight: 1.6,
  margin: "20px 0 0",
  padding: "14px 16px",
};

const code: React.CSSProperties = {
  backgroundColor: "#ece7d8",
  borderRadius: "4px",
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: "13px",
  padding: "1px 5px",
};

const editionRow: React.CSSProperties = {
  color: "#333d38",
  fontSize: "15px",
  lineHeight: 1.6,
  margin: "6px 0 0",
};

const inlineLink: React.CSSProperties = {
  color: "#0f7a54",
  fontWeight: 600,
  textDecoration: "underline",
};

const small: React.CSSProperties = {
  color: "#5d6862",
  fontSize: "13px",
  lineHeight: 1.6,
  margin: "14px 0 0",
};

const signoff: React.CSSProperties = {
  color: "#333d38",
  fontSize: "15px",
  lineHeight: 1.7,
  margin: "22px 0 0",
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
  margin: "22px 0 0",
};
