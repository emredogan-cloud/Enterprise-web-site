import { describe, expect, it } from "vitest";

import { canonicalRedirectTarget } from "./canonical-host";

const prod = {
  vercelEnv: "production",
  canonicalOrigin: "https://valicepress.com",
};

describe("canonicalRedirectTarget", () => {
  it("redirects the old production alias to the canonical origin, keeping path and query", () => {
    expect(
      canonicalRedirectTarget(
        "https://enterprise-web-site.vercel.app/books/codex-bestiarium?utm_source=x",
        prod,
      ),
    ).toBe("https://valicepress.com/books/codex-bestiarium?utm_source=x");
  });

  it("redirects the project's own production alias", () => {
    expect(
      canonicalRedirectTarget(
        "https://valicepress-book-site-emre30283-4955s-projects.vercel.app/",
        prod,
      ),
    ).toBe("https://valicepress.com/");
  });

  it("leaves the canonical host alone", () => {
    expect(
      canonicalRedirectTarget("https://valicepress.com/books", prod),
    ).toBeNull();
  });

  it("never touches www — that is the platform's redirect, not ours (loop guard)", () => {
    expect(
      canonicalRedirectTarget("https://www.valicepress.com/books", prod),
    ).toBeNull();
  });

  it("does nothing on preview deployments", () => {
    expect(
      canonicalRedirectTarget("https://valicepress-book-site-git-feat.vercel.app/", {
        vercelEnv: "preview",
        canonicalOrigin: "https://valicepress.com",
      }),
    ).toBeNull();
  });

  it("does nothing when the canonical origin is unset or is localhost", () => {
    expect(
      canonicalRedirectTarget("https://x.vercel.app/", {
        vercelEnv: "production",
        canonicalOrigin: undefined,
      }),
    ).toBeNull();
    expect(
      canonicalRedirectTarget("https://x.vercel.app/", {
        vercelEnv: "production",
        canonicalOrigin: "http://localhost:3000",
      }),
    ).toBeNull();
  });

  it("does nothing for unparseable input", () => {
    expect(
      canonicalRedirectTarget("not a url", prod),
    ).toBeNull();
  });
});
