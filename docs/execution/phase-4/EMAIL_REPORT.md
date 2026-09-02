# Email — Phase 4

Short, because the work was done in Phase 3 and the last open item was closed by the Founder.

## Consent is now recorded — the Phase 3 defect is closed

A signup returns `consentRecorded: true`. The four audience properties — `source`, `signup_purpose`, `consent_text`, `consent_at` — are declared in Resend, so the list now stores what each subscriber agreed to and when. Until today every signup logged *"Resend rejected the consent properties"* and stored a contact with no record of consent.

Verified by making the system do it: a fresh signup at 17:58 UTC returned `consentRecorded: true`, and the welcome mail arrived in the Founder's inbox from `hello@valicepress.com` a second later.

## Everything else still works

| | |
|---|---|
| Delivery | dkim=pass · spf=pass · dmarc=pass, `header.i=@valicepress.com` |
| One-click unsubscribe | RFC 8058 headers present, POST returns `unsubscribed`, a forged token 400s |
| Source tags | `world-games-companion` and `dudeney-companion` both accepted |

The signed unsubscribe link built in Phase 3 is unchanged. It replaced a literal `{{{RESEND_UNSUBSCRIBE_URL}}}` that had been going out in every welcome email — a defect found by reading a delivered message rather than by reading code, which remains the only way that class of bug is ever found.

## Flows

| Flow | State |
|---|---|
| Welcome | live, verified today |
| Order ready | code path exists, Resend idempotency key in place, **never fired** — no order has existed |
| Purchase follow-up, next product, new release, re-engagement | not built |

Not building the last four is deliberate. The list has **three subscribers and all three are agent test aliases**. Writing a re-engagement sequence for an empty list is theatre, and the order-ready email — the one that matters next — fires the moment there is an order.

## What to do when there is a first customer

In this order, and not before:

1. Confirm the order-ready email actually arrives (it has never been sent to a real person).
2. Nothing else for two weeks.
3. Then a single message, to buyers only, offering the companion for the book they bought.

A quiet list is the promise the welcome email makes: *"this list is quiet. We write when a book is finished or a new edition is ready, and not on a schedule in between."* The first send that breaks that promise costs more than it earns.
