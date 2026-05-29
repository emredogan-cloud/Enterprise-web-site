/**
 * Unit tests for the cart cookie parser (SUB-PR 4.5).
 *
 * Targets `safeParseCart` — a pure string → Cart function that's the
 * trust boundary between an untrusted cookie value and our typed cart
 * model. Worth a dense battery of edge-case tests because the function
 * runs on every request that touches the cart and any throw here would
 * 500 the cart page.
 */

import { describe, expect, it } from "vitest";

import { safeParseCart } from "./cart";

describe("safeParseCart", () => {
  it("returns empty cart when cookie is undefined", () => {
    expect(safeParseCart(undefined)).toEqual({ items: [] });
  });

  it("returns empty cart when cookie is the empty string", () => {
    expect(safeParseCart("")).toEqual({ items: [] });
  });

  it("returns empty cart on malformed JSON (never throws)", () => {
    expect(safeParseCart("{not-valid")).toEqual({ items: [] });
    expect(safeParseCart("undefined")).toEqual({ items: [] });
  });

  it("returns empty cart when JSON parses to a non-object", () => {
    expect(safeParseCart("null")).toEqual({ items: [] });
    expect(safeParseCart('"a string"')).toEqual({ items: [] });
    expect(safeParseCart("42")).toEqual({ items: [] });
  });

  it("returns empty cart when items is missing or not an array", () => {
    expect(safeParseCart('{"items":null}')).toEqual({ items: [] });
    expect(safeParseCart('{"items":"not-an-array"}')).toEqual({ items: [] });
    expect(safeParseCart('{"items":{}}')).toEqual({ items: [] });
    expect(safeParseCart("{}")).toEqual({ items: [] });
  });

  it("filters out invalid items (drops them, keeps the valid)", () => {
    const cookie = JSON.stringify({
      items: [
        { bookId: "valid-uuid-1", addedAt: 1717000000 },
        { bookId: 123, addedAt: 1717000000 }, // bookId must be string
        { bookId: "valid-uuid-2", addedAt: "not-a-number" }, // addedAt must be number
        { bookId: "valid-uuid-3", addedAt: Number.NaN }, // addedAt must be finite
        { bookId: "valid-uuid-4", addedAt: 1717000001 },
        null,
        "garbage",
      ],
    });
    expect(safeParseCart(cookie)).toEqual({
      items: [
        { bookId: "valid-uuid-1", addedAt: 1717000000 },
        { bookId: "valid-uuid-4", addedAt: 1717000001 },
      ],
    });
  });

  it("returns the parsed cart unchanged on the happy path", () => {
    const cookie = JSON.stringify({
      items: [
        { bookId: "book-a", addedAt: 1717000000 },
        { bookId: "book-b", addedAt: 1717000100 },
      ],
    });
    expect(safeParseCart(cookie)).toEqual({
      items: [
        { bookId: "book-a", addedAt: 1717000000 },
        { bookId: "book-b", addedAt: 1717000100 },
      ],
    });
  });

  it("strips extraneous fields from items (defensive against tampering)", () => {
    const cookie = JSON.stringify({
      items: [
        { bookId: "book-a", addedAt: 1717000000, isAdmin: true, price: 0 },
      ],
    });
    const result = safeParseCart(cookie);
    expect(result.items[0]).toEqual({
      bookId: "book-a",
      addedAt: 1717000000,
    });
    // Confirm extra properties are NOT carried through:
    expect(result.items[0]).not.toHaveProperty("isAdmin");
    expect(result.items[0]).not.toHaveProperty("price");
  });
});
