# Email System — Final

> Verified 2026-08-31 by sending real mail from production and reading
> Resend's delivery log. Not by inspecting the code — the code was fine.

---

## Status

| Path | State |
|---|---|
| Newsletter signup → Resend audience | ✅ **Working** — contacts verified present via API |
| Welcome email | ✅ **Delivered** — *"You're on the Valice Press list"* |
| Order-ready email | ✅ **Delivered** — *"Your digital book is ready: The Great Book of World Games"* |
| Consent record | ⚠️ **Not stored** — 4 properties must be declared in the Resend dashboard |
| Sending domain | ⚠️ **Unverified** — mail goes out as `onboarding@resend.dev`, which Resend delivers **only to the account owner** |

**The two warnings are the same blocker twice.** Both need something outside
this repository, and the domain one needs `valicepress.com`.

---

## Three defects, all of which reported success while failing

Every one of these was live, and every one is a variant of the same failure
mode: the system told the user it had worked.

### 1. The audience ID was copied out of Resend's documentation

`RESEND_AUDIENCE_ID` was `5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d`. That is the
placeholder from the code sample in Resend's own right-hand docs panel, not an
audience. Resend answered `404 Audience not found` and every signup on the
live site returned **500**. Corrected to `e898020f-…` ("General").

### 2. The route blamed the subscriber for our misconfiguration

With the audience fixed, every valid address came back
`400 {"error":"invalid-email"}`.

The route mapped **every** Resend `validation_error` to `invalid-email`, and
Resend was rejecting the contact for an entirely different reason:
`422 One or more properties do not exist`. So a configuration fault on our
side was telling people that their own email address was malformed.

That is the worst shape this bug could take. The user cannot act on it, and
they will not report it, because they assume they mistyped. It now returns
`invalid-email` only when the provider actually faults the address.

### 3. No transactional email could render, and then none could send

`@react-email/render` was never installed. The Resend SDK loads it with a
dynamic `import()`, so **both** templates failed:

```
Failed to render React component. Make sure to install
`@react-email/render` or `@react-email/components`.
```

This took out the welcome email and the **order-ready** email — the one that
tells a buyer their download exists. It was invisible because both call sites
are deliberately fire-and-forget: a failed send must never turn a successful
subscription or a completed purchase into an error.

With the renderer installed, the welcome email *still* did not arrive, and
still logged nothing. `void sendWelcomeEmail(...)` does not survive in a
serverless function — the handler returns, the instance freezes, the pending
promise is discarded, and it never settles, so the `.then()` that would have
logged the failure never runs either. Now wrapped in Next 16's `after()`,
which keeps the invocation alive until the send completes.

---

## Verified flows

### New subscriber

```
POST /api/newsletter
  → validate (length, shape)
  → Resend contacts.create  ─── 422 on properties ──▶ retry without them
  → 200 { ok, status, consentRecorded }
  → after(): welcome email
```

| Case | Result |
|---|---|
| Valid new address | `200 {"ok":true,"status":"subscribed"}`, contact present in audience |
| Duplicate | `200`, idempotent, no second contact |
| Malformed | `400 invalid-email` |
| Missing | `400 invalid-email` |
| Invalid JSON | `400 invalid-json` |
| Unknown `source` tag | Dropped silently; subscription still succeeds |
| Provider down / misconfigured | `500 internal-error` + a real log line — never a false success |

`source` is an allow-list (`home`, `article`, `category`, `codex-verify`).
It arrives from the browser and is untrusted, so anything else is dropped
rather than written into a contact record — and dropped rather than rejected,
because a bad tag is not the subscriber's problem.

### Purchase

```
transaction.completed → order → entitlement → Inngest → watermark → R2
  → entitlement ready → order-ready email
```

Verified in production: **delivered**. The email is sent inside an Inngest
`step.run`, so it is awaited properly and Resend's idempotency key means
at-least-once delivery cannot double-send.

---

## The consent record — what is stored and what is not

Every subscription attempts four properties:

| Property | Meaning |
|---|---|
| `source` | Which form. One audience, tagged by origin — not one list per form. |
| `signup_purpose` | `product-updates` — the machine-readable scope. |
| `consent_text` | **The sentence the person actually agreed to, verbatim.** |
| `consent_at` | ISO timestamp. |

`consent_text` is stored in full rather than as a code, because if the form
wording changes later a stored code cannot answer the one question a consent
record exists to answer: *what did this person agree to?*

**Deliberately NOT collected:** IP address, user agent, country. None is
needed to honour this consent, and collecting personal data because it happens
to be in the request is how a mailing list becomes a surveillance record. A
test asserts their absence.

### Why it is not landing

Resend requires custom contact properties to be **declared on the audience
before** a contact may carry them, and rejects the whole create otherwise.
There is no API for declaring them — `GET`/`POST /audiences/{id}/properties`
both return `405 Method not allowed`. It is a dashboard action.

Until then the route subscribes the person without the metadata, logs at
**error** level, and returns `consentRecorded: false` so the gap is visible
from the response alone. Losing the consent record is bad; losing the
subscription of someone who asked for it is worse.

**Fix (~5 minutes):** Resend → Audiences → General → Properties → add
`source`, `signup_purpose`, `consent_text`, `consent_at`.

---

## The sending domain

The only verified domain on this Resend account is **`ehliyetegitim.com`** — a
different business entirely. `EMAIL_FROM` therefore falls back to
`Valice Press <onboarding@resend.dev>`, and Resend's shared onboarding sender
**delivers only to the account owner's own address**. A real subscriber would
get nothing.

This was proved rather than assumed: a send to a `+tag` alias was rejected
with *"You can only send testing emails to your own email address"*; the same
send to the bare address was **delivered**.

**Fix:** register `valicepress.com`, verify it in Resend, set `EMAIL_FROM` to
something like `Valice Press <hello@valicepress.com>`. Blocked behind B0.

---

## Unsubscribe

Both templates use Resend's `{{{RESEND_UNSUBSCRIBE_URL}}}` token plus RFC 8058
one-click headers (`List-Unsubscribe`, `List-Unsubscribe-Post`). Gmail and
Yahoo require these on bulk mail, and they are the difference between a reader
unsubscribing and a reader marking the message as spam. Hard-coding a link
would have produced an unsubscribe button that unsubscribes nobody.

---

## Placement

Newsletter capture appears on the homepage, blog articles, blog category
sidebars, and the Codex Enigmatica verification page (tagged `codex-verify`).
It is deliberately **not** on book pages, checkout, the library or the reader:
those surfaces have a job, and the primary purpose of the site remains reader
value rather than list growth.
