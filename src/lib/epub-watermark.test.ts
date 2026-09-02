import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { describe, expect, it } from "vitest";

import { buildEpubLicenceLine, watermarkEpub } from "@/lib/epub-watermark";

/**
 * A minimal but structurally real EPUB 3: container, OPF with a manifest and a
 * spine, one chapter. Built here rather than committed as a fixture so the
 * tests state their own assumptions about the format.
 */
function makeEpub(opts: { rights?: string; opfDir?: string } = {}): Uint8Array {
  const dir = opts.opfDir ?? "OEBPS/";
  const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="pub-id">urn:uuid:test</dc:identifier>
<dc:title>A Test Book</dc:title>
${opts.rights === undefined ? "<dc:rights>Public domain.</dc:rights>" : opts.rights ? `<dc:rights>${opts.rights}</dc:rights>` : ""}
<meta property="dcterms:modified">2020-01-01T00:00:00Z</meta>
</metadata>
<manifest><item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/></manifest>
<spine><itemref idref="c1"/></spine>
</package>`;
  return zipSync({
    mimetype: [strToU8("application/epub+zip"), { level: 0 }],
    "META-INF/container.xml": strToU8(
      `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="${dir}content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
    ),
    [`${dir}content.opf`]: strToU8(opf),
    [`${dir}c1.xhtml`]: strToU8("<html><body><p>Chapter one.</p></body></html>"),
  } as unknown as Parameters<typeof zipSync>[0]);
}

const ARGS = {
  buyerName: "Ada Lovelace",
  orderId: "0a1b2c3d-4e5f-6789-abcd-ef0123456789",
  bookId: "book-123",
  bookTitle: "A Test Book",
};

const opfOf = (bytes: Uint8Array, dir = "OEBPS/") =>
  strFromU8(unzipSync(bytes)[`${dir}content.opf`]);

describe("EPUB watermarking", () => {
  it("uses the same licence wording as the PDF footer", () => {
    expect(buildEpubLicenceLine({ buyerName: "Ada Lovelace", orderId: "0a1b2c3d-rest" })).toBe(
      "Licensed to Ada Lovelace · Order 0a1b2c3d · Valice Press",
    );
  });

  it("falls back to 'reader' rather than printing an empty name", () => {
    expect(buildEpubLicenceLine({ buyerName: "   ", orderId: "abcdefgh" })).toContain(
      "Licensed to reader",
    );
    expect(buildEpubLicenceLine({ buyerName: null, orderId: "abcdefgh" })).toContain(
      "Licensed to reader",
    );
  });

  it("adds the licence page to the archive, the manifest and the spine", () => {
    const out = watermarkEpub(makeEpub(), ARGS);
    const files = unzipSync(out);
    expect(files["OEBPS/valice-licence.xhtml"]).toBeDefined();
    const page = strFromU8(files["OEBPS/valice-licence.xhtml"]);
    expect(page).toContain("Licensed to Ada Lovelace");
    const opf = opfOf(out);
    expect(opf).toContain('id="valice-licence"');
    expect(opf).toContain('idref="valice-licence"');
  });

  it("puts the licence LAST in the spine so it never interrupts the book", () => {
    const opf = opfOf(watermarkEpub(makeEpub(), ARGS));
    expect(opf.indexOf('idref="c1"')).toBeLessThan(opf.indexOf('idref="valice-licence"'));
  });

  it("keeps mimetype first and stored, which OCF requires", () => {
    const out = watermarkEpub(makeEpub(), ARGS);
    // Bytes 30.. of a zip local header are the file name of the first entry.
    expect(strFromU8(out.subarray(30, 38))).toBe("mimetype");
    expect(strFromU8(unzipSync(out)["mimetype"])).toBe("application/epub+zip");
  });

  it("appends to existing dc:rights instead of destroying it", () => {
    const opf = opfOf(watermarkEpub(makeEpub(), ARGS));
    expect(opf).toContain("Public domain.");
    expect(opf).toContain("Licensed to Ada Lovelace");
  });

  it("adds dc:rights when the source has none", () => {
    const opf = opfOf(watermarkEpub(makeEpub({ rights: "" }), ARGS));
    expect(opf).toContain("<dc:rights>Licensed to Ada Lovelace");
  });

  it("writes machine-readable order and book ids", () => {
    const opf = opfOf(watermarkEpub(makeEpub(), ARGS));
    expect(opf).toContain(`<meta name="valice:order" content="${ARGS.orderId}"/>`);
    expect(opf).toContain('<meta name="valice:book" content="book-123"/>');
  });

  it("refreshes dcterms:modified — an edited package must not claim to be older", () => {
    const opf = opfOf(watermarkEpub(makeEpub(), ARGS));
    expect(opf).not.toContain("2020-01-01T00:00:00Z");
    expect(opf).toMatch(/dcterms:modified">\d{4}-\d{2}-\d{2}T/);
  });

  it("is idempotent — re-stamping never duplicates the manifest entry or the metas", () => {
    const once = watermarkEpub(makeEpub(), ARGS);
    const twice = watermarkEpub(once, ARGS);
    const opf = opfOf(twice);
    expect(opf.match(/id="valice-licence"/g)).toHaveLength(1);
    expect(opf.match(/idref="valice-licence"/g)).toHaveLength(1);
    expect(opf.match(/valice:order/g)).toHaveLength(1);
  });

  it("re-stamps a different buyer over a previous licence rather than stacking them", () => {
    const first = watermarkEpub(makeEpub(), ARGS);
    const second = watermarkEpub(first, { ...ARGS, buyerName: "Grace Hopper" });
    const opf = opfOf(second);
    expect(opf).toContain("Licensed to Grace Hopper");
    expect(opf).not.toContain("Licensed to Ada Lovelace");
    expect(opf.match(/Licensed to/g)).toHaveLength(1);
  });

  it("follows container.xml to a non-standard OPF directory", () => {
    const out = watermarkEpub(makeEpub({ opfDir: "EPUB/" }), ARGS);
    expect(unzipSync(out)["EPUB/valice-licence.xhtml"]).toBeDefined();
    expect(opfOf(out, "EPUB/")).toContain('id="valice-licence"');
  });

  it("escapes a name that would otherwise break the XML", () => {
    const opf = opfOf(
      watermarkEpub(makeEpub(), { ...ARGS, buyerName: 'A <b>& "co"' }),
    );
    expect(opf).toContain("&lt;b&gt;&amp;");
    expect(opf).not.toContain("<b>&");
  });

  it("throws on a file that is not an EPUB rather than returning it unstamped", () => {
    const notAnEpub = zipSync({ "readme.txt": strToU8("hello") });
    expect(() => watermarkEpub(notAnEpub, ARGS)).toThrow(/container\.xml/);
  });

  it("leaves the book's own chapters untouched", () => {
    const out = watermarkEpub(makeEpub(), ARGS);
    expect(strFromU8(unzipSync(out)["OEBPS/c1.xhtml"])).toBe(
      "<html><body><p>Chapter one.</p></body></html>",
    );
  });
});
