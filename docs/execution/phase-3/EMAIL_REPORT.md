# Email — Phase 3

Sending works, and it was verified by reading a delivered message rather than
by reading a log line. Doing that found a defect nothing else would have
caught.

---

## 1. Delivery: proven

| Step | Evidence, 2026-09-02 |
|---|---|
| Signup | `POST /api/newsletter` → `{"ok":true,"status":"subscribed"}` |
| Send | no `welcome email failed` line in the production log — the Phase 2 marker of Resend refusing the domain is gone |
| Delivery | message arrived 16:16:43 UTC from **`hello@valicepress.com`** |
| DKIM | `dkim=pass header.i=@valicepress.com header.s=resend` |
| SPF | `spf=pass` (`54.240.9.17`, `rsend.valicepress.com`) |
| DMARC | **`dmarc=pass (p=NONE) header.from=valicepress.com`** |
| Return-Path | `…@rsend.valicepress.com` — aligned subdomain, correct |

The Phase 2 failure (*"The valicepress.com domain is not verified"*) **is
fixed.** The domain is verified in the account holding the production API key.

DMARC policy is `p=NONE`. That is monitoring, not enforcement. Moving to
`p=quarantine` once a few weeks of clean sends have accumulated is worth doing;
it is a DNS change and costs nothing.

---

## 2. The defect: the unsubscribe link was a template variable

The welcome email put `{{{RESEND_UNSUBSCRIBE_URL}}}` in the body and in the
`List-Unsubscribe` header. Resend substitutes that token only for sends bound
to an **audience contact** — a Broadcast. The welcome mail is a plain
`emails.send`, so the token went out **literally**. A reader who wanted off the
list was shown the string `{{{RESEND_UNSUBSCRIBE_URL}}}` where the link
belonged.

This is not cosmetic. RFC 8058 one-click unsubscribe is a Gmail and Yahoo
requirement for bulk senders; a broken one is answered with the spam button,
and enough of those lose a sending domain. The domain had been verified for
three days.

### The fix

`src/lib/unsubscribe.ts` signs a link this codebase controls:

- HMAC-SHA256 over the **lowercased** address (mail clients do not preserve
  case), truncated to 20 hex characters — ~80 bits, unguessable, and short
  enough to survive an email client wrapping a long URL;
- key **derived** from `RESEND_API_KEY` through a fixed domain-separation label
  rather than stored separately: the key is already required for the mail to
  exist, never leaves the server, and cannot be confused with any other use of
  it;
- **no expiry.** An unsubscribe link has to work in a message someone kept for
  two years.

Plus `/unsubscribe` (a confirm-then-POST page — a GET that acted would let a
link prefetcher unsubscribe people who never clicked) and
`POST /api/newsletter/unsubscribe`, which is the endpoint mail clients call
directly for one-click. Both paths run the same code.

### Verified end to end in production

```
List-Unsubscribe: <https://valicepress.com/unsubscribe?e=…&t=1fcb75c276b9f5372451>
List-Unsubscribe-Post: List-Unsubscribe=One-Click

POST /api/newsletter/unsubscribe?e=…&t=1fcb…  →  {"ok":true,"status":"unsubscribed"}
POST …&t=<same token, different address>      →  400 {"ok":false,"error":"invalid-link"}
```

Seven unit tests cover forgery, truncation, case-insensitivity, the
absent-key case and the URL shape.

---

## 3. The remaining defect: consent is not being recorded

Every signup logs:

> `[api/newsletter] Resend rejected the consent properties — subscribing
> WITHOUT a consent record. Resend said: One or more properties do not exist`

and stores the contact with **`consentRecorded: false`**. The four properties —
`source`, `signup_purpose`, `consent_text`, `consent_at` — must be declared on
the audience before Resend will accept them, and **the Resend API has no
endpoint that declares audience properties**. It is one dashboard screen.

Until it is done, the list has subscribers with no stored record of what they
consented to. Handbook **F2**.

---

## 4. Source tags

One master audience, tagged by origin — not one list per form. The allow-list is
closed, because `source` arrives from the browser and an arbitrary string would
be written straight into a stored contact:

`home` · `article` · `category` · `codex-verify` · `hangul-companion` ·
`world-games-companion` · `dudeney-companion`

`dudeney-companion` and `world-games-companion` were both exercised today and
accepted. They cannot be *confirmed stored* until the properties above exist —
the tag is one of the rejected properties.

---

## 5. Flows

| Flow | State |
|---|---|
| **Welcome** | live, verified in an inbox today |
| **Order ready** | code path exists and is called by the watermark worker; **never fired**, because no order has existed. `sendOrderReadyEmail` uses a Resend idempotency key, so Inngest's at-least-once delivery cannot send it twice. |
| Purchase follow-up | not built |
| Next product | not built |
| New release | not built |
| Re-engagement | not built |

Building the last four before the first one has ever fired would be writing
copy for an audience of two test aliases. The order-ready email is the one that
matters next, and it fires the moment there is an order.

---

## 6. Volume

Two subscribers, both agent test aliases; one unsubscribed by the test that
proved unsubscribe works. **The list is effectively empty.** No newsletter has
been sent and none should be until there is someone to send it to.
