import { describe, expect, it } from "vitest";

import { formatCatalogPrice, formatPrice } from "./format";

describe("formatCatalogPrice", () => {
  it("formats a real price normally", () => {
    expect(formatCatalogPrice(1299, "USD")).toBe("$12.99");
    expect(formatCatalogPrice(499, "USD")).toBe("$4.99");
  });

  it("never renders a zero price as free", () => {
    // `books.price_cents` is 0 for a title this store does not sell — Codex
    // Mythologica (Kindle edition in KDP Select) and The Myth Hunter's Field
    // Book (no digital edition exists). Both are published, both were
    // rendering "$0.00" beside an add-to-cart button.
    expect(formatCatalogPrice(0, "USD")).toBe("On Amazon");
    expect(formatCatalogPrice(0, "USD")).not.toContain("0.00");
  });

  it("differs from formatPrice precisely at zero", () => {
    expect(formatPrice(0, "USD")).toBe("$0.00");
    expect(formatCatalogPrice(0, "USD")).not.toBe(formatPrice(0, "USD"));
    for (const cents of [1, 99, 500, 3799]) {
      expect(formatCatalogPrice(cents, "USD")).toBe(formatPrice(cents, "USD"));
    }
  });
});
