/**
 * Unit tests for the blog content helpers (SUB-PR 4.5).
 *
 * Currently targets `slugifyCategory` — pure deterministic string
 * transform that authors implicitly depend on every time they pick a
 * category name in frontmatter (the URL slug is derived, not stored).
 * Worth tests because a regression would silently 404 every category
 * hub page that used the affected name.
 */

import { describe, expect, it } from "vitest";

import { slugifyCategory } from "./blog";

describe("slugifyCategory", () => {
  it("lowercases and joins multiple words with single dashes", () => {
    expect(slugifyCategory("Behind the Scenes")).toBe("behind-the-scenes");
    expect(slugifyCategory("Reading Guides")).toBe("reading-guides");
  });

  it("trims leading and trailing whitespace", () => {
    expect(slugifyCategory("  Spaced Out  ")).toBe("spaced-out");
  });

  it("collapses consecutive whitespace into one dash", () => {
    expect(slugifyCategory("Foo   Bar")).toBe("foo-bar");
  });

  it("strips non-alphanumeric characters (punctuation, symbols)", () => {
    expect(slugifyCategory("Reading Guides!!!")).toBe("reading-guides");
    expect(slugifyCategory("Q&A — Reader Mail")).toBe("q-a-reader-mail");
  });

  it("does not emit leading or trailing dashes", () => {
    expect(slugifyCategory("---Foo---")).toBe("foo");
    expect(slugifyCategory(" ! Bar ! ")).toBe("bar");
  });

  it("handles single-word names without modification beyond lowercase", () => {
    expect(slugifyCategory("UPPER")).toBe("upper");
    expect(slugifyCategory("essay")).toBe("essay");
  });

  it("handles numbers correctly (keeps digits, treats them as alphanumeric)", () => {
    expect(slugifyCategory("Top 10 Picks")).toBe("top-10-picks");
  });
});
