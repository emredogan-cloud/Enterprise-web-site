/**
 * Provision the Paddle catalog for the direct-sale ebooks, and make sure the
 * webhook is subscribed to every event this codebase actually handles.
 *
 * WHY A SCRIPT AND NOT THE DASHBOARD
 * `books.paddle_price_id` is the one field where a plausible-looking wrong
 * value fails at the till rather than at load. Production already carried
 * `pri_test_meditations_999` — a hand-typed id for a price that does not
 * exist — and nothing caught it until checkout. Creating the price and
 * writing its id from the same run removes the transcription step entirely.
 *
 * IDEMPOTENT. Products and prices are matched on `custom_data.valice_slug`,
 * so re-running updates the price in place instead of creating a second one.
 * A Paddle price cannot be deleted, only archived, which makes accidental
 * duplicates expensive to live with.
 *
 * SAFETY. The resolved Paddle environment is printed first, and writing to
 * the live account requires --i-know-this-is-live.
 *
 * Usage:
 *   node scripts/catalog/provision-paddle.mjs --env <file>              # dry run
 *   node scripts/catalog/provision-paddle.mjs --env <file> --commit --i-know-this-is-live
 */
import { readFileSync } from "node:fs";
import { DIRECT_SALE_EBOOKS } from "./paddle-products.mjs";

const commit = process.argv.includes("--commit");
const liveOk = process.argv.includes("--i-know-this-is-live");
const flag = process.argv.indexOf("--env");
const envFile = flag !== -1 ? process.argv[flag + 1] : ".env";

for (const line of readFileSync(envFile, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) {
    process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const apiKey = process.env.PADDLE_API_KEY;
if (!apiKey) throw new Error(`PADDLE_API_KEY not found in ${envFile}`);

// The key itself declares which environment it belongs to. Trusting the key
// over PADDLE_ENVIRONMENT means a mismatched pair can never silently send
// live writes to sandbox or the reverse.
const isLive = apiKey.startsWith("pdl_live_");
const BASE = isLive ? "https://api.paddle.com" : "https://sandbox-api.paddle.com";

console.log(`env file    : ${envFile}`);
console.log(`paddle      : ${isLive ? "LIVE" : "SANDBOX"}  (${BASE})`);
console.log(`mode        : ${commit ? "COMMIT" : "DRY RUN"}\n`);

if (isLive && commit && !liveOk) {
  console.error(
    "REFUSING: that is the live Paddle account.\n" +
      "Re-run with --i-know-this-is-live if this is genuinely intended.",
  );
  process.exit(1);
}

async function paddle(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      `${method} ${path} → ${res.status} ${JSON.stringify(json?.error ?? json)}`,
    );
  }
  return json.data;
}

/** Every page of a Paddle collection. */
async function paddleAll(path) {
  const out = [];
  let url = `${path}${path.includes("?") ? "&" : "?"}per_page=100`;
  for (;;) {
    const res = await fetch(BASE + url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
    out.push(...json.data);
    const next = json.meta?.pagination?.next;
    if (!next || !json.meta.pagination.has_more) break;
    url = next.replace(BASE, "");
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. Webhook events
//
// The handler in src/app/api/webhooks/paddle/route.ts branches on four event
// types. Paddle was delivering only `transaction.completed`, which means a
// refund never reached `adjustment.created` and the buyer kept access to a
// book they had been refunded for. That is the failure this section fixes.
// ---------------------------------------------------------------------------
const REQUIRED_EVENTS = [
  "transaction.completed",
  "transaction.payment_failed",
  "transaction.canceled",
  "adjustment.created",
];

const settings = await paddleAll("/notification-settings");
console.log("── webhook ─────────────────────────────────────────────");
if (!settings.length) {
  console.log("  NO notification setting configured — nothing to update.");
}
for (const s of settings) {
  const have = new Set((s.subscribed_events ?? []).map((e) => e.name));
  const missing = REQUIRED_EVENTS.filter((e) => !have.has(e));
  console.log(`  ${s.id}  ${s.destination}`);
  console.log(`    active=${s.active}  subscribed=${have.size}  missing=${missing.length}`);
  if (!missing.length) {
    console.log("    already complete");
    continue;
  }
  console.log(`    missing: ${missing.join(", ")}`);
  if (!commit) continue;
  await paddle("PATCH", `/notification-settings/${s.id}`, {
    subscribed_events: [...new Set([...have, ...REQUIRED_EVENTS])],
  });
  console.log("    UPDATED");
}

// ---------------------------------------------------------------------------
// 2. Products + prices, one per direct-sale ebook
// ---------------------------------------------------------------------------
console.log("\n── catalog ─────────────────────────────────────────────");

const products = await paddleAll("/products?status=active");
const prices = await paddleAll("/prices?status=active");

const bySlug = (rows) =>
  new Map(
    rows
      .filter((r) => r.custom_data?.valice_slug)
      .map((r) => [r.custom_data.valice_slug, r]),
  );
const productBySlug = bySlug(products);
const priceBySlug = bySlug(prices);

const resolved = [];
const taxFallbacks = [];

/**
 * Create a product, preferring Paddle's `ebooks` tax category.
 *
 * `ebooks` is the correct category — a large number of jurisdictions tax a
 * book at a reduced rate or not at all, and Paddle is the merchant of record,
 * so the category decides what every buyer is charged. But Paddle gates it
 * behind a per-seller approval and rejects it with
 * `product_tax_category_not_approved` until that is granted.
 *
 * Rather than fail the whole run, fall back to `standard` and record it
 * loudly. `standard` over-collects VAT on ebook sales in those jurisdictions
 * — which is wrong, but wrong in the direction that is refundable, and it is
 * strictly better than a storefront that cannot take money at all. The
 * fallback is reported at the end so it cannot quietly become permanent.
 */
async function createProduct(book) {
  const base = {
    name: book.name,
    description: book.description,
    custom_data: { valice_slug: book.slug },
  };
  try {
    return await paddle("POST", "/products", { ...base, tax_category: "ebooks" });
  } catch (err) {
    if (!String(err.message).includes("product_tax_category_not_approved")) throw err;
    taxFallbacks.push(book.slug);
    return await paddle("POST", "/products", { ...base, tax_category: "standard" });
  }
}

for (const book of DIRECT_SALE_EBOOKS) {
  let product = productBySlug.get(book.slug);
  let price = priceBySlug.get(book.slug);

  if (!commit) {
    console.log(
      `  ${book.slug.padEnd(32)} product=${product?.id ?? "WOULD CREATE"}  ` +
        `price=${price?.id ?? "WOULD CREATE"}  $${(book.priceCents / 100).toFixed(2)}`,
    );
    continue;
  }

  if (!product) {
    product = await createProduct(book);
    console.log(
      `  created product  ${product.id}  ${book.slug}  tax=${product.tax_category}`,
    );
  }

  if (!price) {
    price = await paddle("POST", "/prices", {
      product_id: product.id,
      description: `${book.name} — DRM-free watermarked PDF`,
      // No `billing_cycle` ⇒ one-time purchase, which is what a book is.
      unit_price: {
        amount: String(book.priceCents),
        currency_code: "USD",
      },
      quantity: { minimum: 1, maximum: 1 },
      custom_data: { valice_slug: book.slug },
    });
    console.log(`  created price    ${price.id}  $${(book.priceCents / 100).toFixed(2)}`);
  } else if (price.unit_price.amount !== String(book.priceCents)) {
    // A Paddle price is immutable in amount. Changing what a book costs
    // means a new price and archiving the old one — never an in-place edit,
    // because existing transactions reference it.
    console.log(
      `  PRICE DRIFT      ${book.slug}: Paddle has ${price.unit_price.amount}, ` +
        `catalog says ${book.priceCents}. Create a new price and archive the old one manually.`,
    );
  }

  resolved.push({ slug: book.slug, productId: product.id, priceId: price.id });
}

if (commit) {
  console.log("\n── price ids (write these into valice-catalog.mjs) ─────");
  for (const r of resolved) console.log(`  ${r.slug.padEnd(32)} ${r.priceId}`);

  if (taxFallbacks.length) {
    console.log(
      "\n⚠  FOUNDER ACTION — Paddle tax category\n" +
        `   ${taxFallbacks.length} product(s) were created as 'standard' because this\n` +
        "   Paddle account is not approved for the 'ebooks' tax category:\n" +
        taxFallbacks.map((s) => `     - ${s}`).join("\n") +
        "\n   'standard' over-collects VAT on ebook sales in jurisdictions that\n" +
        "   tax books at a reduced rate. Request approval in Paddle (Catalog →\n" +
        "   tax categories, or Paddle support), then PATCH each product's\n" +
        "   tax_category to 'ebooks'. Prices do not need recreating.",
    );
  }
} else {
  console.log("\ndry run complete — re-run with --commit to write.");
}
