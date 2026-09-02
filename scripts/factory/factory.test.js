import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { HOUSE_ROOT, loadHouse, loadProject, saveGates, saveState } from "./lib/project.mjs";
import { Report, parseCSV } from "./lib/lint.mjs";
import { setGate } from "./gate.mjs";
import { transition } from "./state.mjs";
import { createProject, planProject, slugToDirName } from "./new-project.mjs";
import { lintLedger, lintProjectRights } from "./rights-lint.mjs";
import { lintClaims } from "./claim-lint.mjs";
import { lintDraft } from "./draft-lint.mjs";
import { lintStyle } from "./style-lint.mjs";
import { lintMetadata } from "./metadata-lint.mjs";
import { lintCompliance } from "./compliance-lint.mjs";
import { containment, shingles } from "./similarity.mjs";
import { checkPath, pngInfo } from "./cover-check.mjs";
import { budgetAllows, estimateUsd } from "../covers/generate-cover.mjs";
import { addEntry, readLedger, summarize } from "./cost-ledger.mjs";

/**
 * These tests instantiate a throwaway project from the real template in a
 * temp directory and drive it through gates and states. Nothing touches the
 * book repositories or the house ledgers.
 */

let tmp;
let projectDir;
const house = loadHouse();

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "valice-factory-"));
  const plan = planProject({
    slug: "test-workbook",
    title: "Test Workbook",
    series: "valice-script",
    lane: "A",
    dest: tmp,
    templateRoot: join(HOUSE_ROOT, "templates", "project-template"),
  });
  createProject(plan, house, { dryRun: false, today: "2026-09-02" });
  projectDir = plan.target;
});

afterAll(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe("template instantiation", () => {
  it("creates the directory from the slug and fills placeholders", () => {
    expect(slugToDirName("greek-alphabet-handwriting-workbook")).toBe("GREEK-ALPHABET-HANDWRITING-WORKBOOK");
    expect(existsSync(join(projectDir, "project_config.json"))).toBe(true);
    const cfg = JSON.parse(readFileSync(join(projectDir, "project_config.json"), "utf8"));
    expect(cfg.project.slug).toBe("test-workbook");
    expect(cfg.project.series).toBe("valice-script");
    expect(readFileSync(join(projectDir, "DECISIONS.md"), "utf8")).not.toContain("{{");
    expect(readFileSync(join(projectDir, ".gate"), "utf8").trim()).toBe("idea");
  });

  it("starts with twelve not_started gates and state IDEA", () => {
    const p = loadProject(projectDir);
    expect(Object.keys(p.gates.gates)).toHaveLength(12);
    expect(Object.values(p.gates.gates).every((g) => g.status === "not_started")).toBe(true);
    expect(p.state.state).toBe("IDEA");
  });

  it("refuses to overwrite an existing project", () => {
    expect(() =>
      planProject({ slug: "test-workbook", title: "x", series: "codex", lane: "A", dest: tmp, templateRoot: join(HOUSE_ROOT, "templates", "project-template") }),
    ).toThrow(/refusing to overwrite/);
  });

  it("dry run writes nothing", () => {
    const plan = planProject({ slug: "dry-run-book", title: "Dry", series: "codex", lane: "B", dest: tmp, templateRoot: join(HOUSE_ROOT, "templates", "project-template") });
    const r = createProject(plan, house, { dryRun: true });
    expect(r.written).toBe(false);
    expect(existsSync(plan.target)).toBe(false);
  });

  it("selftest.py and kill_gate.py run against the fresh project", () => {
    const self = execFileSync("python3", [join(projectDir, "selftest.py")], { encoding: "utf8" });
    expect(self).toContain("selftest: ok");
    let killed = "";
    try {
      execFileSync("python3", [join(projectDir, "kill_gate.py")], { encoding: "utf8" });
    } catch (e) {
      killed = e.stdout;
    }
    expect(killed).toContain("KILL GATE — BLOCKED");
  });
});

describe("gates", () => {
  it("refuses passed without evidence and founder gates without founder approval", () => {
    const p = loadProject(projectDir);
    expect(() => setGate(p, house, 1, "passed", { owner: "R1" })).toThrow(/without evidence/);
    expect(() => setGate(p, house, 1, "passed", { owner: "R1", evidence: ["https://example.com/nope"] })).not.toThrow();
    expect(() => setGate(p, house, 2, "passed", { owner: "R6", evidence: ["RIGHTS.md"] })).toThrow(/founder sign-off/);
    expect(() => setGate(p, house, 2, "passed", { owner: "R6", evidence: ["RIGHTS.md"], approvedBy: "founder" })).not.toThrow();
  });

  it("rejects evidence that does not exist", () => {
    const p = loadProject(projectDir);
    expect(() => setGate(p, house, 3, "passed", { owner: "R8", evidence: ["QA/does-not-exist.json"] })).toThrow(/not acceptable/);
  });

  it("requires a reason for failed and waived, and only the founder may waive", () => {
    const p = loadProject(projectDir);
    expect(() => setGate(p, house, 4, "failed", { owner: "R3" })).toThrow(/needs --reason/);
    expect(() => setGate(p, house, 4, "waived", { reason: "x" })).toThrow(/only the founder/);
    const rec = setGate(p, house, 4, "waived", { reason: "pilot deferred", approvedBy: "founder" });
    expect(rec.status).toBe("waived");
  });
});

describe("state machine", () => {
  it("walks IDEA → RESEARCH → MARKET_VALIDATED only after gate 1 has evidence", () => {
    const p = loadProject(projectDir);
    transition(p, house, "RESEARCH", { by: "R1" });
    expect(() => transition(p, house, "MARKET_VALIDATED", { by: "R1" })).toThrow(/requires gate/);
    setGate(p, house, 1, "passed", { owner: "R1", evidence: ["MARKET.md"] });
    saveGates(p);
    transition(p, house, "MARKET_VALIDATED", { by: "R1" });
    transition(p, house, "RIGHTS_PENDING", { by: "R6" });
    saveState(p);
    expect(loadProject(projectDir).state.state).toBe("RIGHTS_PENDING");
    expect(readFileSync(join(projectDir, ".gate"), "utf8").trim()).toBe("rights_pending");
  });

  it("never lets a waived never-skip gate satisfy a founder-only transition", () => {
    const p = loadProject(projectDir);
    setGate(p, house, 2, "waived", { reason: "trying to skip rights", approvedBy: "founder" });
    expect(() => transition(p, house, "RIGHTS_APPROVED", { by: "founder" })).toThrow(/never-skip/);
    setGate(p, house, 2, "passed", { owner: "R6", evidence: ["RIGHTS.md"], approvedBy: "founder" });
    expect(() => transition(p, house, "RIGHTS_APPROVED", { by: "R6" })).toThrow(/founder-only/);
    transition(p, house, "RIGHTS_APPROVED", { by: "founder" });
    expect(p.state.state).toBe("RIGHTS_APPROVED");
  });

  it("BLOCKED needs a reason and returns to the previous state", () => {
    const p = loadProject(projectDir);
    p.state = { version: 1, state: "DRAFTING", previous: "SPEC_READY", updatedAt: "", history: [] };
    expect(() => transition(p, house, "BLOCKED", { by: "R3" })).toThrow(/requires --reason/);
    transition(p, house, "BLOCKED", { by: "R3", reason: "source scan unreadable" });
    expect(p.state.previous).toBe("DRAFTING");
    expect(() => transition(p, house, "QA", { by: "R3", reason: "x" })).toThrow(/only return to DRAFTING/);
    transition(p, house, "DRAFTING", { by: "R3", reason: "scan replaced" });
    expect(p.state.state).toBe("DRAFTING");
  });

  it("KILLED is founder-only", () => {
    const p = loadProject(projectDir);
    p.state = { version: 1, state: "DRAFTING", previous: null, updatedAt: "", history: [] };
    expect(() => transition(p, house, "KILLED", { by: "R1", reason: "no market" })).toThrow(/founder-only/);
  });
});

describe("rights-lint", () => {
  it("accepts the house ledger and rejects a GREEN CC-BY-NC row", () => {
    const rows = parseCSV(readFileSync(join(HOUSE_ROOT, "rights", "ledger.csv"), "utf8"));
    const ok = lintLedger(rows, new Report("rights-lint", "ledger"));
    expect(ok.ok).toBe(true);
    const bad = lintLedger([{ ...rows[0], row_id: "RL-9999", license: "CC-BY-NC", status: "GREEN" }], new Report("rights-lint", "x"));
    expect(bad.errors.map((e) => e.check)).toContain("license");
    const noEvidence = lintLedger([{ ...rows[0], row_id: "RL-9998", evidence_url: "" }], new Report("rights-lint", "x"));
    expect(noEvidence.errors.map((e) => e.check)).toContain("green-evidence");
  });

  it("flags a project whose source references a YELLOW or missing row", () => {
    const rows = parseCSV(readFileSync(join(HOUSE_ROOT, "rights", "ledger.csv"), "utf8"));
    const p = loadProject(projectDir);
    p.config.rights.sources = [{ id: "S-1", ledgerRow: "RL-0012" }, { id: "S-2", ledgerRow: "RL-4242" }];
    const r = lintProjectRights(p, rows, new Report("rights-lint", "p"));
    expect(r.errors.some((e) => e.check === "red-source")).toBe(true);
    expect(r.errors.some((e) => e.check === "ledger-row")).toBe(true);
  });
});

describe("claim-lint", () => {
  it("rejects self-verification and unknown fact references; accepts a clean ledger", () => {
    const facts = [{ fact_id: "F-2026-0001" }];
    const bad = lintClaims(
      [{ id: "C-1", text: "x", location: "CONTENT/a.md#L1", author: "R3", verdict: "VERIFIED", verifier: "R3", evidence: ["facts.jsonl#F-2026-0001"] },
       { id: "C-2", text: "y", location: "CONTENT/a.md#L2", author: "R3", verdict: "VERIFIED", verifier: "R4", evidence: ["valice-house/verified-facts/facts.jsonl#F-2099-0001"] }],
      { facts },
    );
    expect(bad.errors.map((e) => e.check)).toEqual(expect.arrayContaining(["verifier-is-author", "evidence"]));
    const good = lintClaims([{ id: "C-1", text: "x", location: "CONTENT/a.md#L1", author: "R3", verdict: "VERIFIED", verifier: "R4", evidence: ["facts.jsonl#F-2026-0001"] }], { facts });
    expect(good.ok).toBe(true);
    expect(good.findings.some((f) => f.check === "gate-5-ready" && f.level === "pass")).toBe(true);
  });

  it("flags a claim that matches a rejected fact", () => {
    const r = lintClaims([{ id: "C-1", text: "Codex Bestiarium contains 120 legendary creatures.", location: "x", author: "R3", verdict: "PENDING" }], { rejected: [{ statement: "Codex Bestiarium contains 120 legendary creatures." }] });
    expect(r.errors.map((e) => e.check)).toContain("rejected-fact");
  });
});

describe("draft-lint and style-lint", () => {
  const style = { bannedPhrases: ["ultimate guide", "as an ai"], headingLevels: { max: 3, requireSingleH1: true }, readingLevel: { adult: { maxSentenceWords: 45 } } };

  it("finds placeholders, budget violations and missing sections", () => {
    const { report } = lintDraft({
      files: [{ name: "CONTENT/a.md", text: "# Lesson 1\n\nSome text [TBD] here.\n" }],
      spec: { wordBudget: { min: 100, max: 200 }, requiredSections: ["Lesson 1", "Lesson 2"] },
      style,
    });
    const checks = report.errors.map((e) => e.check);
    expect(checks).toContain("placeholder");
    expect(checks).toContain("word-budget");
    expect(checks).toContain("required-section");
  });

  it("style-lint catches banned phrases, heading skips and double H1", () => {
    const r = lintStyle([{ name: "a.md", text: "# One\n\nThe ultimate guide.\n\n### Deep\n\n# Two\n" }], style);
    expect(r.errors.map((e) => e.check)).toEqual(expect.arrayContaining(["banned-phrase", "heading-skip", "single-h1"]));
    expect(lintStyle([{ name: "b.md", text: "# One\n\n## Two\n\nClean.\n" }], style).ok).toBe(true);
  });
});

describe("metadata-lint and compliance-lint", () => {
  const base = () => JSON.parse(readFileSync(join(projectDir, "project_config.json"), "utf8"));

  it("rejects an unmeasured count in the subtitle and too many keywords; accepts a measured one", () => {
    const cfg = base();
    cfg.metadata.subtitle = "120 Legendary Creatures";
    cfg.metadata.description = "x".repeat(250);
    cfg.founder.authorBio = "A real bio.";
    cfg.metadata.keywords = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const r = lintMetadata(cfg, null);
    expect(r.errors.map((e) => e.check)).toEqual(expect.arrayContaining(["measured-count", "keywords"]));
    cfg.measured.unitCount = 120;
    cfg.metadata.keywords = ["hangul practice", "korean handwriting"];
    expect(lintMetadata(cfg, null).ok).toBe(true);
  });

  it("requires the public-domain title tag and bans Amazon program keywords", () => {
    const cfg = base();
    cfg.metadata.description = "x".repeat(250);
    cfg.founder.authorBio = "bio";
    cfg.rights.publicDomain = true;
    cfg.rights.differentiation = "annotated";
    cfg.metadata.keywords = ["kindle unlimited stoicism"];
    const r = lintMetadata(cfg, { bannedKeywordTerms: ["kindle unlimited"] });
    expect(r.errors.map((e) => e.check)).toEqual(expect.arrayContaining(["pd-title-tag", "keywords"]));
  });

  it("compliance: undecided AI disclosure, Select conflict, form links and hardcover colour are errors", () => {
    const cfg = base();
    let r = lintCompliance(cfg);
    expect(r.errors.some((e) => e.check === "ai-disclosure")).toBe(true);
    cfg.compliance.aiDisclosure = { text: "assisted", images: "generated", translation: "none", decidedBy: "founder", decidedAt: "2026-09-02" };
    cfg.compliance.kdpSelect = true;
    cfg.compliance.directSale = true;
    cfg.compliance.backMatterLinks = [{ url: "https://valicepress.com/newsletter", purpose: "newsletter signup form" }];
    cfg.production.ink = "standard-color";
    cfg.formats[1].status = "planned";
    r = lintCompliance(cfg);
    expect(r.errors.map((e) => e.check)).toEqual(expect.arrayContaining(["select", "hyperlink", "ink"]));
    expect(r.findings.some((f) => f.check === "ai-disclosure" && f.level === "warn")).toBe(true);
  });
});

describe("similarity", () => {
  it("measures 8-gram containment", () => {
    const a = "one two three four five six seven eight nine ten eleven twelve";
    const b = "zero one two three four five six seven eight nine ten eleven twelve thirteen";
    expect(containment(shingles(a), shingles(b))).toBe(1);
    expect(containment(shingles(a), shingles("completely different words that do not overlap at all with the draft text here"))).toBe(0);
  });
});

describe("cover-check", () => {
  it("reads PNG headers and enforces slot rules", () => {
    const dir = join(tmp, "covers");
    mkdirSync(dir, { recursive: true });
    // Minimal PNG: signature + IHDR (2400x3600) + sRGB chunk + IEND. Chunk CRCs are not validated by the header reader.
    const ihdr = Buffer.alloc(25);
    ihdr.writeUInt32BE(13, 0);
    ihdr.write("IHDR", 4);
    ihdr.writeUInt32BE(2400, 8);
    ihdr.writeUInt32BE(3600, 12);
    ihdr[16] = 8; ihdr[17] = 6;
    const srgb = Buffer.concat([Buffer.from([0, 0, 0, 1]), Buffer.from("sRGB"), Buffer.from([0]), Buffer.alloc(4)]);
    const iend = Buffer.concat([Buffer.alloc(4), Buffer.from("IEND"), Buffer.alloc(4)]);
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), ihdr, srgb, iend]);
    writeFileSync(join(dir, "front-v1.png"), png);
    writeFileSync(join(dir, "front.png"), png);
    expect(pngInfo(png)).toMatchObject({ width: 2400, height: 3600, hasColorProfile: true });
    const r = checkPath(dir, new Report("cover-check", dir));
    expect(r.findings.some((f) => f.check === "front" && f.level === "pass")).toBe(true);
    expect(r.errors.some((e) => e.check === "version" && e.where === "front.png")).toBe(true);
  });
});

describe("image budget guard", () => {
  it("refuses a call that would exceed the cap and never exceeds $4 by default", () => {
    const est = estimateUsd({ model: "gpt-image-1", size: "1024x1536", quality: "medium", n: 1 });
    expect(est.usd).toBeGreaterThan(0);
    expect(budgetAllows({ entries: [] }, est.usd, 4)).toBe(true);
    expect(budgetAllows({ entries: [{ actualUsd: 3.99 }] }, est.usd, 4)).toBe(false);
    expect(budgetAllows({ entries: [{ estimatedUsd: 4.0 }] }, 0.01, 4)).toBe(false);
  });
});

describe("cost ledger", () => {
  it("appends and summarises entries in a temp ledger", () => {
    const ledger = join(tmp, "ledger.jsonl");
    addEntry({ project: "test-workbook", kind: "tokens", usd: 1.25, units: 1000000 }, ledger);
    addEntry({ project: "test-workbook", kind: "image", usd: 0.05 }, ledger);
    expect(() => addEntry({ project: "x", kind: "magic", usd: 1 }, ledger)).toThrow(/kind/);
    const rows = summarize(readLedger(ledger));
    expect(rows[0]).toMatchObject({ project: "test-workbook", entries: 2, usd: 1.3, tokens: 1.25, image: 0.05 });
  });
});
