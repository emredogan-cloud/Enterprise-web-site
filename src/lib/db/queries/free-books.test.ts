import { describe, expect, it } from "vitest";

import { selectAmazonEditions } from "./free-books";

/**
 * Which Amazon editions a delivery email is allowed to offer.
 *
 * The temptation this guards against is `https://www.amazon.com/dp/${asin}` —
 * trivially constructible, and wrong for every edition that is announced but
 * not yet listed. A dead link inside a gift is worse than no link.
 */
const row = (over: Partial<Parameters<typeof selectAmazonEditions>[0][number]> = {}) => ({
  format: "paperback",
  availability: "available",
  asin: "B0HDTL5V2H",
  url: "https://www.amazon.com/dp/B0HDTL5V2H",
  ...over,
});

describe("selectAmazonEditions", () => {
  it("offers a live edition", () => {
    expect(selectAmazonEditions([row()])).toEqual([
      {
        format: "paperback",
        label: "Paperback",
        url: "https://www.amazon.com/dp/B0HDTL5V2H",
        asin: "B0HDTL5V2H",
      },
    ]);
  });

  it("never offers an edition that is only announced", () => {
    expect(selectAmazonEditions([row({ availability: "coming_soon" })])).toEqual([]);
    expect(selectAmazonEditions([row({ availability: "unavailable" })])).toEqual([]);
  });

  it("never offers an edition with no recorded URL, however real the ASIN", () => {
    expect(selectAmazonEditions([row({ url: null })])).toEqual([]);
  });

  it("never offers an edition with no ASIN, however real the URL", () => {
    expect(selectAmazonEditions([row({ asin: null })])).toEqual([]);
  });

  it("passes the catalog's URL through untouched — it does not build one", () => {
    const odd = "https://www.amazon.co.uk/dp/B0XYZ?tag=valice-21";
    const [e] = selectAmazonEditions([row({ url: odd, asin: "B0XYZ" })]);
    expect(e!.url).toBe(odd);
  });

  it("names the formats the way a reader does", () => {
    const labels = selectAmazonEditions([
      row({ format: "ebook", asin: "a", url: "u1" }),
      row({ format: "hardcover", asin: "b", url: "u2" }),
      row({ format: "large_print", asin: "c", url: "u3" }),
    ]).map((e) => e.label);
    expect(labels).toContain("Kindle");
    expect(labels).toContain("Hardcover");
    expect(labels).toContain("Large Print");
  });

  it("orders print first and Kindle last, whatever order the rows arrive in", () => {
    const order = selectAmazonEditions([
      row({ format: "ebook", asin: "a", url: "u1" }),
      row({ format: "large_print", asin: "b", url: "u2" }),
      row({ format: "hardcover", asin: "c", url: "u3" }),
      row({ format: "paperback", asin: "d", url: "u4" }),
    ]).map((e) => e.format);
    expect(order).toEqual(["paperback", "hardcover", "large_print", "ebook"]);
  });

  it("says nothing at all when a book has no live Amazon edition", () => {
    expect(
      selectAmazonEditions([
        row({ format: "ebook", availability: "available", asin: null, url: null }),
        row({ format: "paperback", availability: "coming_soon", asin: null, url: null }),
      ]),
    ).toEqual([]);
  });
});
