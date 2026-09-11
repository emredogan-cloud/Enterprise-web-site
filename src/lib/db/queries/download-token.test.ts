import { describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";

import {
  DOWNLOAD_MAX_OPENS,
  isFreshDownloadStart,
  isWellFormedDownloadToken,
} from "./free-books";

/**
 * The shape guard on a download token.
 *
 * It is not what makes the link secure - 256 bits of entropy and a row lookup
 * are - but it is the reason a URL can never be read as a path, and that is
 * worth pinning.
 */
describe("isWellFormedDownloadToken", () => {
  it("accepts a real minted token", () => {
    for (let i = 0; i < 20; i++) {
      const t = randomBytes(32).toString("base64url");
      expect(isWellFormedDownloadToken(t), t).toBe(true);
    }
  });

  it("refuses anything that could be read as a path", () => {
    for (const t of [
      "../../etc/passwd",
      "..%2F..%2Fetc%2Fpasswd",
      "books/the-great-book-of-world-myths/master/v1/master.pdf",
      "a/b",
      "a.b",
      "a%2Fb",
    ]) {
      expect(isWellFormedDownloadToken(t), t).toBe(false);
    }
  });

  it("refuses tokens too short to be unguessable", () => {
    expect(isWellFormedDownloadToken("")).toBe(false);
    expect(isWellFormedDownloadToken("x")).toBe(false);
    expect(isWellFormedDownloadToken("a".repeat(31))).toBe(false);
    expect(isWellFormedDownloadToken("a".repeat(32))).toBe(true);
  });

  it("refuses absurdly long input rather than querying on it", () => {
    expect(isWellFormedDownloadToken("a".repeat(65))).toBe(false);
    expect(isWellFormedDownloadToken("a".repeat(100000))).toBe(false);
  });

  it("refuses SQL-ish and markup-ish shapes", () => {
    for (const t of [
      "x OR 1=1--",
      "a union select master_file_key from books",
      "<script>alert(1)</script>",
      "token null",
    ]) {
      expect(isWellFormedDownloadToken(t), t).toBe(false);
    }
  });

  it("accepts base64url but not base64 with plus and slash", () => {
    expect(isWellFormedDownloadToken("A".repeat(20) + "-_" + "B".repeat(20))).toBe(true);
    expect(isWellFormedDownloadToken("A".repeat(20) + "+/" + "B".repeat(20))).toBe(false);
  });
});

/**
 * The open counter is what stops a 72-hour link becoming a public mirror, and
 * the range test is what stops it closing on the reader it was sent to. Both
 * halves matter: count too eagerly and a resumed 104 MB download burns the
 * budget; count too shyly and a leaked link pays out forever.
 */
describe("isFreshDownloadStart", () => {
  it("counts a plain request with no Range header", () => {
    expect(isFreshDownloadStart(null)).toBe(true);
    expect(isFreshDownloadStart(undefined)).toBe(true);
    expect(isFreshDownloadStart("")).toBe(true);
  });

  it("counts a Range that starts at the beginning of the file", () => {
    expect(isFreshDownloadStart("bytes=0-")).toBe(true);
    expect(isFreshDownloadStart("bytes=0-1023")).toBe(true);
    expect(isFreshDownloadStart(" bytes = 0-1023 ")).toBe(true);
  });

  it("does not count a resumed download", () => {
    expect(isFreshDownloadStart("bytes=1048576-")).toBe(false);
    expect(isFreshDownloadStart("bytes=54480538-108961075")).toBe(false);
  });

  it("does not count the later legs of a parallel fetch", () => {
    // What a download manager splitting a 104 MB file eight ways sends: one
    // leg from 0 (counted once) and seven from further in (not counted).
    const legs = Array.from({ length: 8 }, (_, i) => `bytes=${i * 13620134}-`);
    expect(legs.filter(isFreshDownloadStart)).toEqual(["bytes=0-"]);
  });

  it("treats a malformed Range as a fresh start rather than a free pass", () => {
    expect(isFreshDownloadStart("bytes=abc-")).toBe(true);
    expect(isFreshDownloadStart("items=0-10")).toBe(true);
    expect(isFreshDownloadStart("bytes=-500")).toBe(true); // a suffix range
  });

  it("keeps a ceiling that a real reader cannot reach but a link post does", () => {
    expect(DOWNLOAD_MAX_OPENS).toBeGreaterThan(8); // one parallel fetch, retried
    expect(DOWNLOAD_MAX_OPENS).toBeLessThan(100);
  });
});
