import { describe, expect, it } from "vitest";
import { relatedBooks } from "./related-books";
import type { BookCardData } from "@/components/book-card";

const EDITOR = { slug: "emre-dogan", name: "Emre Dogan" };

function book(slug: string, ...authors: Array<{ slug: string; name: string }>): BookCardData {
  return {
    id: slug,
    slug,
    title: slug,
    subtitle: null,
    coverKey: null,
    priceCents: 0,
    currency: "USD",
    authors: [...authors, EDITOR],
  };
}

const KEIGHTLEY = { slug: "thomas-keightley", name: "Thomas Keightley" };
const SIKES = { slug: "wirt-sikes", name: "Wirt Sikes" };
const HEARN = { slug: "lafcadio-hearn", name: "Lafcadio Hearn" };

describe("relatedBooks", () => {
  // The reason this function exists: a two-volume work is two catalogue rows,
  // and a reader on Volume I had no route to Volume II.
  it("puts the other volume of the same work first", () => {
    const all = [
      book("kwaidan", HEARN),
      book("british-goblins", SIKES),
      book("fairy-mythology-vol-1", KEIGHTLEY),
      book("fairy-mythology-vol-2", KEIGHTLEY),
    ];
    const got = relatedBooks(all[2], all);
    expect(got[0].slug).toBe("fairy-mythology-vol-2");
  });

  it("finds volume I from volume II as well", () => {
    const all = [
      book("kwaidan", HEARN),
      book("fairy-mythology-vol-1", KEIGHTLEY),
      book("fairy-mythology-vol-2", KEIGHTLEY),
    ];
    expect(relatedBooks(all[2], all)[0].slug).toBe("fairy-mythology-vol-1");
  });

  // The defect that made the naive version useless: the house editor is on
  // every row, so a plain shared-author count is 1 for every pair.
  it("ignores an author credited on the whole catalogue", () => {
    const all = [book("a"), book("b"), book("c"), book("d")];
    expect(relatedBooks(all[0], all).map((b) => b.slug)).toEqual(["b", "c", "d"]);
  });

  it("does not let the house editor outrank a real shared author", () => {
    const all = [
      book("recent-1"),
      book("recent-2"),
      book("recent-3"),
      book("recent-4"),
      book("recent-5"),
      book("recent-6"),
      book("old-keightley", KEIGHTLEY),
      book("current", KEIGHTLEY),
    ];
    const got = relatedBooks(all[7], all);
    expect(got[0].slug).toBe("old-keightley");
    expect(got).toHaveLength(6);
  });

  it("keeps recency order when nothing is shared", () => {
    const all = [book("first", HEARN), book("second", SIKES), book("third")];
    expect(relatedBooks(all[2], all).map((b) => b.slug)).toEqual(["first", "second"]);
  });

  it("never includes the book itself", () => {
    const all = [book("x", KEIGHTLEY), book("y", KEIGHTLEY)];
    expect(relatedBooks(all[0], all).map((b) => b.slug)).toEqual(["y"]);
  });

  it("respects the limit", () => {
    const all = Array.from({ length: 20 }, (_, i) => book(`b${i}`));
    expect(relatedBooks(all[0], all)).toHaveLength(6);
  });

  it("handles a catalogue of one", () => {
    const all = [book("only", KEIGHTLEY)];
    expect(relatedBooks(all[0], all)).toEqual([]);
  });
});
