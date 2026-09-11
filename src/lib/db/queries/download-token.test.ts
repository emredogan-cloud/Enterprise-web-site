import { describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";

import { isWellFormedDownloadToken } from "./free-books";

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
