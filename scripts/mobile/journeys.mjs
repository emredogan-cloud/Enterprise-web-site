#!/usr/bin/env node
/**
 * Interaction checks driven on the physical Redmi.
 *
 *   npm run mobile:journeys                 # every registered check
 *   npm run mobile:journeys -- --only nav   # one group
 *
 * The route audit measures geometry; this measures *behaviour* — taps, focus,
 * scroll locking, keyboard. Groups are added as the roadmap's phases land, and
 * the whole set becomes the Phase 9 regression suite.
 *
 * Every check returns { name, pass, detail }. The runner exits non-zero if any
 * check fails, so a phase cannot be signed off on a red suite.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  BASE_URL, assertServerHealthy, connectDevice, navigateAndSettle,
  assertRendered, sleep,
} from "./device.mjs";
import { byName } from "./routes.mjs";

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const ONLY = arg("only", null);
const OUT = arg("out", null);

/* ─────────────────────────── helpers ─────────────────────────── */

async function goto(cdp, routeName) {
  const route = byName(routeName);
  if (!route) throw new Error(`unknown route ${routeName}`);
  await assertServerHealthy(BASE_URL, { path: route.path });
  await navigateAndSettle(cdp, new URL(route.path, BASE_URL).href);
  await assertRendered(cdp, route, route.path);
  // Start from a known-closed state: a previous check may have left the drawer
  // open, and the trigger is a toggle.
  await cdp.eval(`(() => {
    const b = document.querySelector('button[aria-controls="mobile-nav-panel"]');
    if (b && b.getAttribute("aria-expanded") === "true") b.click();
    window.scrollTo(0, 0);
    return true;
  })()`).catch(() => {});
  await sleep(300);
}

/** Tap a real touch point, the way a finger does. */
async function tapAt(cdp, x, y) {
  const pt = [{ x: Math.round(x), y: Math.round(y), radiusX: 12, radiusY: 12, force: 1 }];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: pt });
  await sleep(60);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await sleep(500);
}

/** Tap the centre of the first element matching a selector. */
async function tapSelector(cdp, selector) {
  const box = await cdp.eval(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  })()`);
  if (!box) return null;
  await tapAt(cdp, box.x, box.y);
  return box;
}

/** Drag a finger from (x1,y1) to (x2,y2) — how a reader actually scrolls. */
async function touchDrag(cdp, x1, y1, x2, y2, steps = 8) {
  const at = (x, y) => [{ x: Math.round(x), y: Math.round(y), radiusX: 12, radiusY: 12, force: 1 }];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: at(x1, y1) });
  for (let i = 1; i <= steps; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: at(x1 + ((x2 - x1) * i) / steps, y1 + ((y2 - y1) * i) / steps),
    });
    await sleep(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await sleep(600);
}

async function pressKey(cdp, key, code, keyCode) {
  await cdp.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code, windowsVirtualKeyCode: keyCode });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: keyCode });
  await sleep(400);
}

/* ─────────────────────────── nav contract ─────────────────────────── */

const MENU = 'button[aria-controls="mobile-nav-panel"]';
const PANEL = "#mobile-nav-panel";

async function navChecks(cdp) {
  const out = [];
  const add = (name, pass, detail) => out.push({ name, pass, detail });

  for (const routeName of ["home", "catalog", "blog", "cart", "legal-terms"]) {
    await goto(cdp, routeName);

    const trigger = await cdp.eval(`(() => {
      const b = document.querySelector(${JSON.stringify(MENU)});
      if (!b) return null;
      const r = b.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height),
               label: b.getAttribute("aria-label"),
               expanded: b.getAttribute("aria-expanded"),
               controls: b.getAttribute("aria-controls") };
    })()`);
    add(`${routeName}: menu trigger present`, !!trigger, trigger);
    if (!trigger) continue;
    add(`${routeName}: trigger >= 44x44`, trigger.w >= 44 && trigger.h >= 44, `${trigger.w}x${trigger.h}`);
    add(`${routeName}: trigger labelled + aria wired`,
      trigger.label === "Menu" && trigger.expanded === "false" && trigger.controls === "mobile-nav-panel", trigger);

    // ── open ────────────────────────────────────────────────────────────
    await tapSelector(cdp, MENU);
    const opened = await cdp.eval(`(() => {
      const p = document.querySelector(${JSON.stringify(PANEL)});
      if (!p) return { open: false };
      const links = Array.from(p.querySelectorAll("a[href]"));
      const rows = links.map((a) => {
        const r = a.getBoundingClientRect();
        return { href: new URL(a.href, location.href).pathname, h: Math.round(r.height) };
      });
      const b = document.querySelector(${JSON.stringify(MENU)});
      return {
        open: true,
        role: p.getAttribute("role"), modal: p.getAttribute("aria-modal"),
        labelled: !!p.getAttribute("aria-labelledby"),
        expanded: b ? b.getAttribute("aria-expanded") : null,
        rows,
        current: links.filter((a) => a.getAttribute("aria-current") === "page")
                      .map((a) => new URL(a.href, location.href).pathname),
        focusInPanel: p.contains(document.activeElement),
        bodyOverflow: getComputedStyle(document.body).overflow,
        htmlOverflow: getComputedStyle(document.documentElement).overflow,
      };
    })()`);

    add(`${routeName}: panel opens`, opened.open === true, opened.open);
    if (!opened.open) continue;
    add(`${routeName}: aria-expanded flips to true`, opened.expanded === "true", opened.expanded);
    add(`${routeName}: dialog semantics`,
      opened.role === "dialog" && opened.modal === "true" && opened.labelled, opened);

    const DESTS = ["/books", "/ebooks", "/authors", "/categories", "/blog", "/account/library", "/about"];
    const hrefs = opened.rows.map((r) => r.href);
    const missing = DESTS.filter((d) => !hrefs.includes(d));
    add(`${routeName}: all 7 destinations present`, missing.length === 0,
      missing.length ? `missing ${missing.join(", ")}` : hrefs.join(", "));

    const short = opened.rows.filter((r) => r.h < 48);
    add(`${routeName}: every row >= 48px tall`, short.length === 0,
      short.length ? JSON.stringify(short) : `${opened.rows.length} rows`);

    add(`${routeName}: focus moved into panel`, opened.focusInPanel === true, opened.focusInPanel);
    add(`${routeName}: page scroll locked`,
      opened.bodyOverflow === "hidden" && opened.htmlOverflow === "hidden",
      `body=${opened.bodyOverflow} html=${opened.htmlOverflow}`);

    // Background must not scroll under the open panel — tested with a real
    // touch drag. `overflow: hidden` legitimately still allows programmatic
    // window.scrollBy, so scripted scrolling proves nothing here.
    const before = await cdp.eval(`window.scrollY`);
    await touchDrag(cdp, 30, 560, 30, 160);
    const after = await cdp.eval(`window.scrollY`);
    add(`${routeName}: background does not scroll on touch drag`, after === before,
      { before, after });

    // ── Escape closes, focus returns ────────────────────────────────────
    await pressKey(cdp, "Escape", "Escape", 27);
    const afterEsc = await cdp.eval(`(() => {
      const b = document.querySelector(${JSON.stringify(MENU)});
      return { panel: !!document.querySelector(${JSON.stringify(PANEL)}),
               expanded: b ? b.getAttribute("aria-expanded") : null,
               focusOnTrigger: document.activeElement === b,
               bodyOverflow: getComputedStyle(document.body).overflow,
               htmlOverflow: getComputedStyle(document.documentElement).overflow };
    })()`);
    add(`${routeName}: Escape closes`, afterEsc.panel === false, afterEsc);
    add(`${routeName}: focus returns to trigger`, afterEsc.focusOnTrigger === true, afterEsc.focusOnTrigger);
    add(`${routeName}: scroll lock released`,
      afterEsc.bodyOverflow !== "hidden" && afterEsc.htmlOverflow !== "hidden",
      `body=${afterEsc.bodyOverflow} html=${afterEsc.htmlOverflow}`);

    // ── backdrop tap closes ─────────────────────────────────────────────
    await tapSelector(cdp, MENU);
    await sleep(300);
    await tapAt(cdp, 20, 300);   // far left, over the backdrop not the panel
    const afterBackdrop = await cdp.eval(
      `({ panel: !!document.querySelector(${JSON.stringify(PANEL)}) })`);
    add(`${routeName}: backdrop tap closes`, afterBackdrop.panel === false, afterBackdrop);

    // ── aria-current on the active destination ──────────────────────────
    if (routeName === "catalog") {
      await tapSelector(cdp, MENU);
      await sleep(300);
      const cur = await cdp.eval(`(() => {
        const p = document.querySelector(${JSON.stringify(PANEL)});
        const a = p && p.querySelector('a[aria-current="page"]');
        return a ? new URL(a.href, location.href).pathname : null;
      })()`);
      add(`catalog: aria-current marks /books`, cur === "/books", cur);
      await pressKey(cdp, "Escape", "Escape", 27);
    }
  }

  // ── navigating from the drawer actually goes there and closes it ──────
  await goto(cdp, "home");
  await tapSelector(cdp, MENU);
  await sleep(300);
  const navBox = await cdp.eval(`(() => {
    const p = document.querySelector(${JSON.stringify(PANEL)});
    const a = p && Array.from(p.querySelectorAll("a[href]"))
      .find((x) => new URL(x.href, location.href).pathname === "/categories");
    if (!a) return null;
    const r = a.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (navBox) {
    await tapAt(cdp, navBox.x, navBox.y);
    await sleep(3500);
    const landed = await cdp.eval(
      `({ path: location.pathname, panel: !!document.querySelector(${JSON.stringify(PANEL)}),
          overflow: getComputedStyle(document.body).overflow })`);
    add("drawer link navigates to /categories", landed.path === "/categories", landed);
    add("drawer closes after navigating", landed.panel === false, landed.panel);
    add("scroll lock released after navigating", landed.overflow !== "hidden", landed.overflow);
  } else {
    add("drawer link navigates to /categories", false, "link not found in panel");
  }

  return out;
}

/* ─────────────────────── collapsed-input contract ─────────────────────── */

const INPUT_SITES = [
  { route: "home", selector: "#newsletter-email", min: 44, what: "homepage newsletter" },
  { route: "blog-article", selector: "#article-newsletter-email", min: 40, what: "article newsletter" },
  { route: "companion", selector: 'form input[type="email"]', min: 40, what: "companion signup" },
  // CategorySidebar lives on /blog/category/[slug], not /categories/[slug].
  { route: "blog-category", selector: "#category-newsletter-email", min: 36, what: "blog-category sidebar" },
];

async function inputChecks(cdp) {
  const out = [];
  for (const site of INPUT_SITES) {
    await goto(cdp, site.route);
    const box = await cdp.eval(`(() => {
      const el = document.querySelector(${JSON.stringify(site.selector)});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { w: Math.round(r.width), h: Math.round(r.height),
               flexBasis: cs.flexBasis, fontSize: cs.fontSize };
    })()`);
    out.push({
      name: `${site.what}: input >= ${site.min}px tall`,
      pass: !!box && box.h >= site.min,
      detail: box ? `${box.w}x${box.h} (basis ${box.flexBasis})` : "input not found",
    });
  }
  return out;
}

/* ─────────────────────────────── runner ─────────────────────────────── */

const GROUPS = { nav: navChecks, inputs: inputChecks };

async function main() {
  const names = ONLY ? [ONLY] : Object.keys(GROUPS);
  const cdp = await connectDevice();
  console.log(`\n▸ Interaction checks on ${cdp.meta.browser}\n`);

  const all = [];
  for (const g of names) {
    if (!GROUPS[g]) { console.error(`  unknown group: ${g}`); process.exit(2); }
    console.log(`  ── ${g} ──`);
    const results = await GROUPS[g](cdp);
    for (const r of results) {
      console.log(`  ${r.pass ? "✓" : "╳"} ${r.name}${r.pass ? "" : `  → ${JSON.stringify(r.detail)}`}`);
    }
    all.push(...results.map((r) => ({ group: g, ...r })));
  }
  cdp.close();

  const failed = all.filter((r) => !r.pass);
  console.log(`\n▸ ${all.length - failed.length}/${all.length} passed`);

  if (OUT) {
    const p = resolve(process.cwd(), OUT);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, JSON.stringify({ generatedAt: new Date().toISOString(), results: all }, null, 2));
    console.log(`  → ${OUT}`);
  }
  if (failed.length) process.exit(1);
}

main().catch((e) => { console.error(`\n╳ journeys aborted: ${e.message}`); process.exit(1); });
