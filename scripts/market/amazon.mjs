/**
 * Amazon.com reader — the one place this repository is allowed to learn what
 * a listing actually says.
 *
 * WHY THIS EXISTS
 * Every ASIN, price, page count and "is it live" claim in the catalogue has
 * to be checkable against the listing itself, because the alternative is the
 * failure this project has already had once: a number that looked right,
 * lived in a file, and was wrong on the shelf. `verify-amazon.mjs` uses this
 * module to compare the catalogue against the live pages; `market-sample.mjs`
 * uses it to take a Gate 1 competitor sample.
 *
 * LOCALE. The request originates in Turkey, so amazon.com answers in TRY
 * unless told otherwise. `i18n-prefs=USD` + `lc-main=en_US` + `?language=en_US`
 * make it answer in the currency the catalogue is denominated in. Without
 * them every price read here is wrong by an exchange rate.
 *
 * POLITENESS. One request at a time, with a delay between them. This reads
 * public product pages at human speed; it is not a crawler.
 */

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export const DEFAULT_DELAY_MS = 2500;

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const strip = (s) =>
  s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");

const entities = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&nbsp;|&#8206;|&#8207;|&lrm;|&rlm;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/g, " ");

const clean = (s) => entities(strip(s)).replace(/\s+/g, " ").trim();

/** Raw HTML for an amazon.com URL, in en_US/USD. Throws on a non-200. */
export async function fetchAmazon(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      "accept-language": "en-US,en;q=0.9",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      cookie: "i18n-prefs=USD; lc-main=en_US",
    },
    redirect: "follow",
  });
  const html = await res.text();
  if (!res.ok) {
    const err = new Error(`GET ${url} → ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (/Enter the characters you see below|Type the characters you see/i.test(html)) {
    const err = new Error("Amazon returned a CAPTCHA page — no data read.");
    err.captcha = true;
    throw err;
  }
  return html;
}

const first = (html, re, group = 1) => {
  const m = html.match(re);
  return m ? clean(m[group]) : null;
};

/**
 * One product page, reduced to the fields the catalogue actually asserts.
 * Every field is `null` when the page does not carry it — never guessed.
 */
export async function readProduct(asin) {
  const html = await fetchAmazon(
    `https://www.amazon.com/dp/${encodeURIComponent(asin)}?language=en_US`,
  );

  const title = first(html, /id="productTitle"[^>]*>([\s\S]*?)<\/span>/);

  // The format swatch strip ("Kindle $0.00 or $4.99 to buy · Paperback
  // $21.99 · Hardcover $32.99") is the only place the page states a price
  // per edition. The buy box below it belongs to whichever edition is
  // selected AND can be an Amazon discount rather than the list price, and
  // on a Kindle page the nearest `.a-offscreen` is the print list price —
  // so reading a Kindle price from anywhere but this strip returns another
  // edition's number. This reader made both mistakes once.
  const swatchBlock = html.match(/id="tmmSwatchesList"[\s\S]{0,8000}/)?.[0] ?? "";
  const swatchText = clean(swatchBlock);
  const editions = {};
  for (const [key, word] of [
    ["kindle", "Kindle"],
    ["paperback", "Paperback"],
    ["hardcover", "Hardcover"],
  ]) {
    // "$0.00 or $4.99 to buy" is the Kindle Unlimited display: the $0.00 is
    // the KU price, the second number is what a non-subscriber pays, and the
    // presence of the pattern at all means the title is still inside a KDP
    // Select exclusivity term.
    const ku = swatchText.match(
      new RegExp(`${word}\\s+\\$0\\.00\\s+or\\s+\\$([\\d,]+\\.\\d{2})\\s+to buy`),
    );
    const plain = swatchText.match(
      new RegExp(`${word}\\s+(?:from\\s+)?\\$([\\d,]+\\.\\d{2})`),
    );
    if (!ku && !plain) continue;
    editions[key] = {
      kindleUnlimited: Boolean(ku),
      priceCents: parseUsdCents(`$${(ku ?? plain)[1]}`),
    };
  }
  const swatches = swatchText.slice(0, 300);

  // Amazon renders the buy-box price twice: once split across
  // whole/fraction spans for sighted readers and once complete inside
  // `.a-offscreen` for screen readers. The screen-reader copy is the only
  // one that is a single, parseable string, so that is the one to read.
  const priceText =
    [...html.matchAll(/class="a-offscreen">\s*(\$[\d,]+\.\d{2})\s*</g)][0]?.[1] ?? null;

  const detailBlock =
    html.match(/id="detailBullets_feature_div"[\s\S]{0,6000}/)?.[0] ??
    html.match(/id="productDetails_detailBullets_sections1"[\s\S]{0,6000}/)?.[0] ??
    "";
  const details = clean(detailBlock);

  const bsrBlock = clean(
    html.match(/Best Sellers Rank[\s\S]{0,900}/)?.[0] ?? "",
  );
  const ranks = [...bsrBlock.matchAll(/#([\d,]+)\s+in\s+([A-Za-z'&,\- ]{3,60})/g)].map(
    (m) => ({ rank: Number(m[1].replace(/,/g, "")), category: m[2].trim() }),
  );

  // Scoped to the reviews widget on purpose: `a-icon-alt` also appears in
  // the "customers also bought" carousels, and reading a rating from there
  // would attribute another book's stars to this one.
  const reviewBlock =
    html.match(/id="averageCustomerReviews_feature_div"[\s\S]{0,4000}/)?.[0] ?? "";
  const ratingText =
    first(reviewBlock, /id="acrPopover"[^>]*title="([^"]+)"/) ??
    first(reviewBlock, /class="a-icon-alt">([^<]*out of 5[^<]*)</);
  const reviewsText = first(reviewBlock, /id="acrCustomerReviewText"[^>]*>([^<]+)</);

  return {
    asin,
    fetchedAt: new Date().toISOString(),
    title,
    priceText,
    priceCents: priceText ? parseUsdCents(priceText) : null,
    pageCount: numberAfter(details, /Print length\s*:?\s*([\d,]+)\s*pages/i),
    publisher: first(detailBlock, /Publisher\s*:?\s*(?:‏|‎|\s)*([^<]{2,60})</i),
    publicationDate:
      details.match(/Publication date\s*:?\s*([A-Z][a-z]+ \d{1,2}, \d{4})/)?.[1] ?? null,
    isbn13: details.match(/ISBN-13\s*:?\s*([\d-]{13,20})/)?.[1] ?? null,
    dimensions: details.match(/Dimensions\s*:?\s*([\d.]+ x [\d.]+ x [\d.]+ inches)/)?.[1] ?? null,
    asinOnPage: details.match(/ASIN\s*:?\s*([A-Z0-9]{10})/)?.[1] ?? null,
    rating: ratingText ? Number(ratingText.match(/([\d.]+)\s+out of/)?.[1] ?? NaN) || null : null,
    reviewCount: reviewsText ? Number(reviewsText.replace(/[^\d]/g, "")) || null : null,
    ranks,
    editions,
    formatSwatches: swatches,
    /** A listing that answers 200 with a product title is on the shelf. */
    live: Boolean(title),
  };
}

function numberAfter(text, re) {
  const m = text.match(re);
  return m ? Number(m[1].replace(/,/g, "")) : null;
}

export function parseUsdCents(text) {
  const m = String(text).match(/\$\s*([\d,]+)\.(\d{2})/);
  if (!m) return null;
  return Number(m[1].replace(/,/g, "")) * 100 + Number(m[2]);
}

/**
 * A page of search results, as {asin, title, priceCents, rating, reviews}.
 * Used for the Gate 1 market sample and for finding a newly-live edition
 * whose ASIN nobody has told us yet.
 */
export async function search(query, { page = 1, index = "stripbooks" } = {}) {
  const url =
    `https://www.amazon.com/s?k=${encodeURIComponent(query)}` +
    `&i=${index}&page=${page}&language=en_US`;
  const html = await fetchAmazon(url);

  // Each organic result is one `data-component-type="s-search-result"`
  // container. Splitting on the container start is more reliable than
  // trying to match its close: Amazon's result markup nests differently
  // for sponsored rows, video rows and "more results" rows.
  const blocks = html
    .split(/(?=data-asin="[A-Z0-9]{10}"[^>]*data-component-type="s-search-result")/)
    .slice(1);

  const out = [];
  for (const block of blocks) {
    const asin = block.match(/^data-asin="([A-Z0-9]{10})"/)?.[1];
    if (!asin || out.some((r) => r.asin === asin)) continue;
    const title = first(block, /<h2[^>]*>([\s\S]{0,800}?)<\/h2>/);
    if (!title || title === "More results") continue;
    // The visible price of the row's own format, then the other formats it
    // offers, in the order Amazon lists them.
    const prices = [...block.matchAll(/class="a-offscreen">\s*(\$[\d,]+\.\d{2})\s*</g)].map(
      (m) => parseUsdCents(m[1]),
    );
    const ratingMatch = block.match(/([\d.]+)\s+out of 5 stars/);
    const reviewsMatch = block.match(/s-underline-text[^>]*>\(?([\d,]+)\)?</);
    out.push({
      asin,
      title,
      priceCents: prices[0] ?? null,
      otherFormatPricesCents: prices.slice(1),
      rating: ratingMatch ? Number(ratingMatch[1]) : null,
      reviewCount: reviewsMatch ? Number(reviewsMatch[1].replace(/,/g, "")) : null,
      format: /\bKindle\b/.test(block)
        ? "kindle"
        : /\bHardcover\b/.test(block)
          ? "hardcover"
          : /\bPaperback\b/.test(block)
            ? "paperback"
            : null,
      sponsored: /Sponsored/.test(block.slice(0, 4000)),
    });
  }
  return out;
}
