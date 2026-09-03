# Amazon Ads: access, API, and what only a person can do

**Written 2026-09-03.** Every procedural statement below was read on the day from Amazon's own documentation, in a browser, and the URL is cited. Nothing is recalled from training data, because this is exactly the kind of thing that changes: the refresh-token rule quoted in §5 changed on **30 July 2026** and would have been wrong two months ago.

Statuses are used strictly:

| | |
|---|---|
| **VERIFIED** | measured on the system that owns the fact, in this session |
| **DOCUMENTED** | stated by Amazon in the cited page, read today |
| **REQUIRES AMAZON APPROVAL** | Amazon decides; nobody here can |
| **FOUNDER-ONLY** | needs an account, a signature or a credential the agent must never hold |
| **AGENT-DOABLE** | the agent can do it, once a credential exists |
| **UNVERIFIED** | could not be established from here, and is not claimed |

---

## 1. Where this actually stands, in one paragraph

**No Amazon credential of any kind exists in this environment, and the agent cannot create one.** Re-probed today (`node scripts/tmp/ads-probe.mjs`): zero environment variables match `AMAZON|ADS|LWA|SP_API|SELLING_PARTNER|ATTRIBUTION` in the repository or in Vercel production; `POST https://api.amazon.com/auth/o2/token` answers **400** for want of a client id; `GET https://advertising-api.amazon.com/v2/profiles` answers **401**. That is VERIFIED, not assumed, and it is the same answer Phase 3 and Phase 4 got. The blockage is not technical and no amount of code moves it: the whole chain begins with an Amazon Developer registration made under the account holder's own email, and Amazon's own documentation says that association **cannot be changed once it is set**.

The practical consequence for Phase 5: **Pilot B (World Games · Amazon paid acquisition) cannot start until a person spends about forty minutes at three Amazon web consoles.** §4 is that forty minutes, written out. Everything after it the agent can carry.

---

## 2. The architecture, as of today

```
   Amazon Developer account            ← one, under the Founder's email, permanent
        │
        ├── Login with Amazon (LwA) security profile
        │      client_id  amzn1.application-oa2-client.…
        │      client_secret
        │      Allowed Return URLs  ← the redirect_uri of the OAuth grant
        │
        ├── Amazon Ads API application  ← REQUIRES AMAZON APPROVAL (≈ 1 business day)
        │      scopes granted on approval:
        │         advertising::campaign_management   (everything below)
        │         advertising::test:create_account   (test accounts)
        │
        └── OAuth authorization grant  ← the advertiser consents, in a browser
               authorization_code  (expires in 5 minutes)
                    │
                    ▼
               access_token   Atza|…   60 minutes
               refresh_token  Atzr|…   365 days from consent, if issued on or
                                       after 2026-07-30
                    │
                    ▼
               GET /v2/profiles → profileId per marketplace
                    │
                    ▼
               every other call:
                 Amazon-Advertising-API-ClientId: <client_id>
                 Authorization: Bearer <access_token>
                 Amazon-Advertising-API-Scope:   <profileId>
```

Regional hosts [DOCUMENTED]:

| Host | Region | Marketplaces |
|---|---|---|
| `https://advertising-api.amazon.com` | NA | **US**, CA, MX, BR |
| `https://advertising-api-eu.amazon.com` | EU | UK, FR, IT, ES, DE, NL, AE, PL, **TR**, EG, SA, SE, BE, IN, ZA |
| `https://advertising-api-fe.amazon.com` | FE | JP, AU, SG |

**Valice Press uses NA.** Every one of the nineteen listings is on amazon.com; the Founder's residence in Turkey is irrelevant to the host, which follows the marketplace, not the person. An authorization code from any region works in any region, so the NA authorization URL (`https://www.amazon.com/ap/oa`) is the right one.

---

## 3. Does a KDP-only publisher qualify at all?

This is the question that decides whether §4 is worth forty minutes, so it is answered from Amazon's own pages rather than from forums.

| Question | Answer | Status |
|---|---|---|
| Can a KDP author run Sponsored Products? | Yes. Ads are started from **KDP → Marketing → Start Advertising**, which hands off to the campaign-creation workflow in the advertising console; all ongoing management happens at `advertising.amazon.com`, not in KDP. Available for KDP titles in US, CA, MX, UK, DE, IT, ES, FR, NL, IN, AU, JP. | DOCUMENTED |
| Is a Brand Registry needed? | No, not for Sponsored Products. **Sponsored Brands** needs a pen name in Author Central with **three unique titles** — Valice has eight, so this is reachable, but it is a separate step and not this phase's experiment. | DOCUMENTED |
| Can a direct advertiser apply for Ads API access? | Yes. "Direct advertisers, partners, and integrators are all eligible to apply." There is a Direct Advertiser application path distinct from the Partner Network path. | DOCUMENTED |
| Is a KDP advertising account a "direct advertiser" for that purpose? | Amazon does not say this in so many words on the onboarding pages. What Amazon **does** say, on the Attribution launch page, is that "Amazon Ads API integrators working with KDP authors/accounts can access this information using the existing Amazon Attribution reporting endpoint through the Amazon Ads API" — which is only meaningful if a KDP account can be reached through the API at all. | DOCUMENTED (inference flagged) |
| Are there known limits on what a KDP profile can do through the API? | Yes, and they are real. Reported repeatedly by API integrators: **a KDP profile cannot pull Sponsored Brands reports through the API**, and Sponsored Brands / Locked Screen data sets are not exposed for KDP accounts. Sponsored Products — the only campaign this phase plans — is not among the reported gaps. | UNVERIFIED against an Amazon page; treat as a risk, not a fact |

**The honest reading.** The Sponsored Products campaign in §7 does not need the API at all — it is created in the ad console by hand, and this phase's plan has always said so. The API buys three things and only three: automated daily reporting instead of a manual CSV export, programmatic bid and budget changes, and Attribution tag management. Apply for it because those are worth having, not because the first campaign is blocked on it. **The first campaign is blocked on nothing except a person opening the console.**

---

## 4. The exact Founder sequence

Forty minutes across three consoles, plus up to one business day of Amazon's own review sitting in the middle. Do them in this order; step 3 cannot be started before Amazon's approval email arrives.

### Step 0 · Before anything — decide the email address · 2 minutes · FOUNDER-ONLY

Amazon states this twice, in bold, on two different pages, and it is irreversible:

> the email address associated with your LwA developer registration will also be associated to your Amazon Ads API permissions once you have been approved … once you are approved for API access and accept the license agreement **you cannot change the LwA application associated with this email**

Use an address the business will keep and that more than one person can open. Not a personal address that might be abandoned.

Also note: **one client ID per company.** Amazon grants API access for exactly one LwA client per company; unlimited users can share it. And **only the original creator of the Amazon Developer account can complete the onboarding sequence** — so whoever does step 1 must also do steps 2 and 3.

### Step 1 · Create the Login with Amazon security profile · ~10 minutes · FOUNDER-ONLY

1. Go to **developer.amazon.com** → **Sign In**. Sign in with the address chosen in step 0, or create the account there. Complete the developer registration form and accept the Amazon Developer Services Agreement.
   *An existing LwA credential from another Amazon programme does not carry over — Amazon says explicitly that a new security profile must be created for the Ads API even if you already have one for the Selling Partner API.*
2. **Developer Console** → **Login with Amazon** in the menu bar → **Create a New Security Profile**.
3. Fill in three fields:
   - **Security Profile Name** — suggest `Valice Press Ads API`
   - **Security Profile Description** — suggest `Campaign reporting and Attribution for Valice Press book listings`
   - **Consent Privacy Notice URL** — `https://valicepress.com/privacy` (this page exists and answers 200). Amazon notes that for a direct advertiser reading its own data this field is not material, but a real URL costs nothing and this one is real.
4. **Save.** You are returned to the Login with Amazon page, which lists your profile. Click **Show Client ID and Client Secret**.
5. **Do not paste those two values into a chat window, a commit, or a file inside a repository.** They go straight into Vercel — see §6. They can be re-read from this panel at any time, so there is no need to store them anywhere else in the meantime.

### Step 2 · Apply for API access as a Direct Advertiser · ~10 minutes + up to 1 business day · REQUIRES AMAZON APPROVAL

1. Amazon Ads API page → **Request API Access** → **Direct Advertiser**. (The Partner Network path is for businesses building tools for *other* advertisers; that is not what this is.)
2. **Sign in with the same email address used in step 1.** Amazon warns that if you are already signed in to any Amazon account you will be dropped straight into the form — check the profile name in the top-right corner before typing anything, and sign out and back in if it is wrong.
3. Complete the form. It asks how the business intends to use the API, and covers the **Amazon Ads API License Agreement** and the **Data Protection Policy**. Answer it as what it is: a publisher automating reporting and Attribution measurement for its own eight titles. **Submit for review.**
4. A confirmation email arrives at that address. Review takes **up to 1 business day** [DOCUMENTED]. A second email carries the decision.

### Step 3 · Assign the API access to the LwA application · ~5 minutes · FOUNDER-ONLY

**Read this before clicking the link in the approval email.** Amazon's warning:

> Before clicking on the link, it is important that you log out of all Amazon user accounts (including your personal shopping account) except the Amazon account you used to apply for access in step 2. If anyone clicks on the link while logged into the wrong account, the link will be invalidated and will need to be reset by the Amazon API support team.

1. Sign out of every Amazon account, including the shopping one. Sign in only as the developer account.
2. Open the link in the approval email → **Continue** → pick the security profile created in step 1 → **Submit**.
3. The confirmation page shows the client ID and the granted scopes: `advertising::campaign_management` and `advertising::test:create_account`.

### Step 4 · Allow a return URL · ~3 minutes · FOUNDER-ONLY

Amazon Developer console → **Login with Amazon** → the profile → gear icon under **Manage** → **Web Settings** → **Edit** → add an **Allowed Return URL** → **Save**.

For a direct advertiser reading its own data, any valid URL works, because the authorization code is copied out of the browser's address bar by hand. Use **`https://valicepress.com/`** — it is ours, it is https, and the code lands somewhere harmless.

### Step 5 · Grant consent and capture the authorization code · ~5 minutes · FOUNDER-ONLY

1. Build the URL — substitute the client ID from step 1:

   ```
   https://www.amazon.com/ap/oa?client_id=YOUR_LWA_CLIENT_ID&scope=advertising::campaign_management&response_type=code&redirect_uri=https://valicepress.com/
   ```

   *(An LwA client approved before October 2020 would need `cpc_advertising:campaign_management` instead. A client created now does not.)*

2. Paste it into the browser and go. **Sign in with the Amazon account that owns the advertising console — the KDP/Ads account, which need not be the developer account.**
3. The consent screen lists exactly what is being granted. Select **Allow**.
4. You land on `https://valicepress.com/?code=XXXXXXXX&scope=advertising%3A%3Acampaign_management`. **Copy the whole address bar.**
5. **The code expires in five minutes.** Do step 6 immediately, or simply repeat step 5 later — the URL is reusable and generates a new code each time.

### Step 6 · Exchange the code and store the refresh token · ~5 minutes · FOUNDER-ONLY, then AGENT-DOABLE forever

Run this yourself — the client secret must not pass through the agent. In this session, typing `! <command>` runs it here and shows the output.

```bash
curl -s -X POST https://api.amazon.com/auth/o2/token \
  --data "grant_type=authorization_code" \
  --data "code=THE_CODE_FROM_STEP_5" \
  --data "redirect_uri=https://valicepress.com/" \
  --data "client_id=YOUR_LWA_CLIENT_ID" \
  --data "client_secret=YOUR_LWA_CLIENT_SECRET"
```

The response is JSON with `access_token` (60 minutes), `token_type: "bearer"`, `expires_in`, and `refresh_token`. **The refresh token is the durable credential** — keep it, discard the access token.

> **New in 2026, and it puts a date in the calendar:** refresh tokens **issued on or after 30 July 2026 expire 365 days from the date of advertiser consent**. Ones issued before that date have no fixed expiry. A token minted today therefore dies in **September 2027**, silently, and step 5 has to be repeated. Put it in the calendar the day it is created.

Then store the three values in Vercel production (§6) and tell the agent it is done. Everything after this point is AGENT-DOABLE.

---

## 5. What the agent can do the moment a credential exists

| Capability | Endpoint | Status |
|---|---|---|
| Refresh the access token | `POST /auth/o2/token` with `grant_type=refresh_token` | AGENT-DOABLE |
| List advertising profiles | `GET /v2/profiles` — returns `profileId`, `countryCode`, `currencyCode`, `accountInfo.type` | AGENT-DOABLE |
| Read campaigns, ad groups, ads, keywords | Sponsored Products resources, paginated batch reads | AGENT-DOABLE |
| Pull performance reports | reporting endpoints, keyed on the profile | AGENT-DOABLE |
| Compute ACOS against the stop rules and write `ADS_RESULTS.md` | this repository | AGENT-DOABLE |
| Read Amazon Attribution tags and reports | Attribution resources: Profiles, Publishers, Attribution tags, Reports | AGENT-DOABLE |
| **Create a campaign or change a bid or budget** | supported by the API | **AGENT-DOABLE but deliberately withheld** — see below |

**Spending is not automated, on purpose.** The API can create campaigns and move bids, and the agent will not do either without the Founder saying so for that specific change. The reason is not caution for its own sake: this catalogue has **zero recorded sales**, so there is no performance history against which an automated bid change could be judged, and the first fourteen days of Pilot B exist to *harvest search terms*, not to be optimised. Reading is safe and useful from day one; writing waits for a number to write against.

### The one thing the API does not remove

**Amazon unit sales still cannot be read by the agent.** The Ads API reports advertising performance — impressions, clicks, spend, attributed sales for *advertised* products. Total KDP units, royalties and pages read live in KDP's own reports, which have no public API. Handbook item **O3** (export `data/kdp/YYYY-MM.csv` monthly) stays, API or no API.

---

## 6. Environment variables

The agent has never seen these values and must not. Set them in Vercel production only:

```bash
npx vercel env add AMAZON_ADS_CLIENT_ID production
npx vercel env add AMAZON_ADS_CLIENT_SECRET production
npx vercel env add AMAZON_ADS_REFRESH_TOKEN production
npx vercel env add AMAZON_ADS_PROFILE_ID production        # after the first /v2/profiles call
npx vercel env add AMAZON_ADS_REGION production             # value: NA
```

`scripts/tmp/ads-probe.mjs` already looks for exactly this family of names (`/AMAZON|ADS|LWA|SP_API|SELLING_PARTNER|ATTRIBUTION/i`) and will report them the moment they exist. Nothing else in the repository reads them yet, which is correct — no code should be written against a credential nobody has proved works.

**Never** put any of these in `.env`, `.env.local`, a commit, a report, or a chat message. `AMAZON_ADS_CLIENT_SECRET` is only needed for the token exchange and the refresh call; if you would rather the agent never be able to mint a token at all, withhold the secret and hand over short-lived access tokens instead. That is a defensible choice and costs one manual step per hour of work.

---

## 7. The campaign, unchanged, and not waiting on any of this

```
Sponsored Products · AUTOMATIC targeting
Product    The Great Book of World Games, paperback   B0HG3KMK9L
Budget     $5.00 / day
Bid        $0.35 default
Duration   14 days · read on day 7 and day 14
Purpose    harvest real search terms. Not to be profitable.
Stop       ACOS above 43.8%  ·  $20 on one target with no order  ·  20 clicks, 0 orders
```

Net $10.07 a unit, break-even ACOS 43.8% — the arithmetic is in `phase-4/ADS_REPORT.md` and has not moved.

**Do U1 first.** The World Games paperback and hardcover interiors now end on a dedicated companion page — a code covering a quarter of the page and `valicepress.com/companion/world-games` printed under it. Until those files are at KDP, an ad buys a stranger who reaches the last page of the book and is told nothing. The ad is the expensive half of that pair; the upload is ten minutes.

---

## 8. Amazon Attribution

| | |
|---|---|
| Eligible? | **Yes.** Amazon's product page lists "Kindle Direct Publishing (KDP) authors" among eligible advertisers, and a launch announcement dated **30 September 2022** confirms it specifically. [DOCUMENTED] |
| Where | Attribution moved from DSP into the ordinary **advertising console**, alongside Sponsored Products. Legacy Attribution accounts have no web interface any more but still answer through the API. [DOCUMENTED] |
| Countries at launch | US, CA, DE, ES, FR, IT, UK. Valice sells on **US** — covered. [DOCUMENTED] |
| What a KDP account sees | Metrics for tagged non-Amazon traffic, **including pages read and royalty earned**, for both print and ebook. [DOCUMENTED] |
| Through the API? | The launch page says API integrators working with KDP accounts can read this through the existing Attribution reporting endpoint. The main product page's sentence about API access names "sellers and vendors" and not KDP authors — the two pages do not quite agree, and this is flagged rather than resolved. |
| Cost | Free. [DOCUMENTED] |
| **A 10% bonus on Attribution-driven sales?** | **Not claimed.** Third-party blogs assert it; it appears on neither the Amazon Attribution product page nor the KDP launch announcement, both read today. If it exists it is a different programme. **UNVERIFIED — do not plan around it.** |

**What this is worth to Valice specifically.** Attribution is the only mechanism that can answer the question this whole phase is built around: *does the companion page send anyone back to Amazon, and do they buy?* Tag the outbound Amazon links on `valicepress.com` and the loop closes — site → Amazon → sale, measured. Without it, that leg of the funnel is invisible in both directions.

**Founder action, 5 minutes, no API needed:** ad console → Attribution → create one tag for the World Games paperback → paste the complete tracking URL into `scripts/catalog/valice-catalog.mjs` → `amazonUrl` for that format, keeping the ASIN in it. The next catalogue load picks it up; no code change is required, and the loader has accepted a tracking URL there since Phase 4. **No tag exists today and none is claimed.**

---

## 9. Troubleshooting, by status code

| Code | What it means here | What to do |
|---|---|---|
| **400** on `/auth/o2/token` | *This is what this environment returns today* — the request carries no client id, so LWA rejects it before authentication. Also returned with `"The request has an invalid parameter : code"` when an authorization code is more than five minutes old. | Mint a fresh code by repeating §4 step 5. |
| **401** on `advertising-api.amazon.com` | *Also what this environment returns today.* No `Authorization` header, or an access token older than 60 minutes. | Refresh the access token. Tokens last exactly 60 minutes; refresh on 401, not on a timer. |
| **403** | Authenticated, but the profile is not permitted — usually a missing `Amazon-Advertising-API-Scope` header, a profile in another region, or view-only permission where edit is needed. | Confirm the `profileId` came from the same regional host you are calling. |
| **`[]` from `/v2/profiles`** | Authorization worked; the account has no View-and-Edit advertising account **in that region**. | Try another regional host. For Valice this should be NA. Optional parameters expose view-only profiles. |
| **Invalidated approval link** | Someone clicked the step-3 email link while signed in to the wrong Amazon account. | It cannot be re-used. Amazon API support has to reset it. This is why §4 step 3 opens with "sign out of everything". |
| Sponsored Brands reports empty on a KDP profile | A known limitation of KDP profiles, not a bug in the request. | Use the ad console for Sponsored Brands. Sponsored Products is the phase's campaign anyway. |

---

## 10. The split, stated plainly

**FOUNDER-ONLY — nobody else can do these**

1. Amazon Developer registration under a permanent, shared business address (irreversible)
2. Creating the LwA security profile and reading its client ID and secret
3. Submitting the Direct Advertiser application
4. Clicking the approval link while signed in to exactly one Amazon account
5. Granting OAuth consent
6. Exchanging the authorization code, and storing the three values in Vercel
7. Creating the first Sponsored Products campaign in the ad console
8. Creating the Attribution tag
9. Exporting the monthly KDP sales report

**REQUIRES AMAZON APPROVAL**

10. The Ads API application — up to 1 business day, Amazon's decision, no appeal path documented

**AGENT-DOABLE once (1)–(6) are done**

11. Refresh tokens; list profiles; read campaigns, ad groups, keywords; pull reports; compute ACOS against the stop rules; read Attribution tags and reports; write every results file in this directory

**AGENT-DOABLE but withheld until asked, per change**

12. Creating campaigns; changing bids and budgets — anything that spends money

**Still impossible for the agent, with or without the API**

13. Reading Amazon unit sales, royalties or pages read. There is no public KDP reports API. Handbook O3 stands.

---

## Sources — every one read in a browser on 2026-09-03

- [Amazon Ads API onboarding overview](https://advertising.amazon.com/API/docs/en-us/guides/onboarding/overview)
- [Step 1: Create a Login with Amazon application](https://advertising.amazon.com/API/docs/en-us/guides/onboarding/create-lwa-app)
- [Step 2: Apply for Amazon Ads API access](https://advertising.amazon.com/API/docs/en-us/guides/onboarding/apply-for-access)
- [Step 3: Assign API access to a Login with Amazon application](https://advertising.amazon.com/API/docs/en-us/guides/onboarding/assign-api-access)
- [Getting started step 1: Create an authorization grant](https://advertising.amazon.com/API/docs/en-us/guides/get-started/create-authorization-grant)
- [Getting started step 2: Generate access and refresh tokens](https://advertising.amazon.com/API/docs/en-us/guides/get-started/retrieve-access-token)
- [Getting started step 3: Retrieve a profile ID](https://advertising.amazon.com/API/docs/en-us/guides/get-started/retrieve-profiles)
- [Amazon Ads API overview and regional endpoints](https://advertising.amazon.com/API/docs/en-us/reference/api-overview)
- [Get started with the Amazon Attribution API](https://advertising.amazon.com/API/docs/en-us/guides/amazon-attribution/get-started)
- [Amazon Attribution product page and eligibility](https://advertising.amazon.com/solutions/products/amazon-attribution)
- [Amazon Attribution launches for KDP authors (30 Sep 2022)](https://advertising.amazon.com/resources/whats-new/amazon-attribution-kdp-authors)
- [Advertising for KDP books (KDP help G201499010)](https://kdp.amazon.com/en_US/help/topic/G201499010)

Local evidence: `node scripts/tmp/ads-probe.mjs`, run 2026-09-03 — no credential in the environment, LWA 400, Ads API 401.
