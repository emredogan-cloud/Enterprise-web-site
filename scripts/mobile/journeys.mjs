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
  assertRendered, setViewport, clearViewport, sleep,
} from "./device.mjs";
import { byName, ROUTES } from "./routes.mjs";

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

/**
 * Tap, then wait for the page to actually reach `condition`; retry a bounded
 * number of times.
 *
 * The trigger lives in a client component, so a tap that lands before React has
 * hydrated does nothing at all. That is invisible when a route is warm and
 * showed up as "panel opens: false" on exactly the routes `next dev` was
 * compiling for the first time. Retrying is what a reader would do, and it
 * keeps the check honest — three failed taps is still a failure.
 */
async function tapUntil(cdp, selector, conditionExpr, { attempts = 3 } = {}) {
  for (let i = 0; i < attempts; i++) {
    await tapSelector(cdp, selector);
    for (let poll = 0; poll < 8; poll++) {
      const ok = await cdp.eval(conditionExpr).catch(() => false);
      if (ok) return { ok: true, attempts: i + 1 };
      await sleep(250);
    }
  }
  return { ok: false, attempts };
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
    await tapUntil(cdp, MENU, `!!document.querySelector(${JSON.stringify(PANEL)})`);
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
    await tapUntil(cdp, MENU, `!!document.querySelector(${JSON.stringify(PANEL)})`);
    await sleep(300);
    await tapAt(cdp, 20, 300);   // far left, over the backdrop not the panel
    const afterBackdrop = await cdp.eval(
      `({ panel: !!document.querySelector(${JSON.stringify(PANEL)}) })`);
    add(`${routeName}: backdrop tap closes`, afterBackdrop.panel === false, afterBackdrop);

    // ── aria-current on the active destination ──────────────────────────
    if (routeName === "catalog") {
      await tapUntil(cdp, MENU, `!!document.querySelector(${JSON.stringify(PANEL)})`);
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
  await tapUntil(cdp, MENU, `!!document.querySelector(${JSON.stringify(PANEL)})`);
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

/* ────────────────────── theme / browser-chrome contract ────────────────── */

async function themeChecks(cdp) {
  const out = [];
  const add = (name, pass, detail) => out.push({ name, pass, detail });

  for (const routeName of ["home", "catalog", "legal-terms"]) {
    await goto(cdp, routeName);
    const t = await cdp.eval(`(() => {
      const de = document.documentElement;
      const h = getComputedStyle(de), b = getComputedStyle(document.body);
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:fixed;top:0;left:0;visibility:hidden;padding-top:env(safe-area-inset-top);" +
        "padding-bottom:env(safe-area-inset-bottom);padding-left:env(safe-area-inset-left);" +
        "padding-right:env(safe-area-inset-right)";
      document.body.appendChild(probe);
      const p = getComputedStyle(probe);
      const safe = { top: p.paddingTop, bottom: p.paddingBottom, left: p.paddingLeft, right: p.paddingRight };
      probe.remove();
      // Does env() actually resolve, i.e. is the mechanism live? A page without
      // viewport-fit=cover leaves the vars undefined and max() falls back.
      const live = document.createElement("div");
      live.style.cssText = "position:fixed;visibility:hidden;width:max(10px,env(safe-area-inset-left,0px))";
      document.body.appendChild(live);
      const liveW = getComputedStyle(live).width;
      live.remove();
      return {
        themeColor: (document.querySelector('meta[name="theme-color"]') || {}).content || null,
        viewportMeta: (document.querySelector('meta[name="viewport"]') || {}).content || null,
        colorScheme: h.colorScheme,
        htmlBg: h.backgroundColor,
        bodyBg: b.backgroundColor,
        safe, liveW,
        headerPadL: (() => {
          const hdr = Array.from(document.querySelectorAll("header")).find((e) => e.getClientRects().length);
          const inner = hdr && hdr.firstElementChild;
          return inner ? getComputedStyle(inner).paddingLeft : null;
        })(),
      };
    })()`);

    add(`${routeName}: theme-color is the cinematic ground`, t.themeColor === "#050705", t.themeColor);
    add(`${routeName}: viewport-fit=cover`, /viewport-fit=cover/.test(t.viewportMeta || ""), t.viewportMeta);
    add(`${routeName}: no zoom suppression (WCAG 1.4.4)`,
      !/maximum-scale|user-scalable\s*=\s*no/.test(t.viewportMeta || ""), t.viewportMeta);
    add(`${routeName}: color-scheme is dark`, t.colorScheme === "dark", t.colorScheme);
    add(`${routeName}: document canvas is dark (no white overscroll)`,
      t.htmlBg === "rgb(5, 7, 5)", t.htmlBg);
    add(`${routeName}: safe-area gutter applied to header`,
      t.headerPadL === "24px" || parseFloat(t.headerPadL) >= 24, t.headerPadL);
    // Recorded, not asserted: this device reports 0 insets in portrait.
    add(`${routeName}: safe-area insets readable`, typeof t.safe.top === "string",
      JSON.stringify(t.safe));
  }
  return out;
}

/* ────────────────────────── cards + shelves ────────────────────────── */

async function cardChecks(cdp) {
  const out = [];
  const add = (name, pass, detail) => out.push({ name, pass, detail });

  /* Category tiles: no title may paint outside its box, at any card width.
     The card is a container query, so what matters is the card's own width —
     the grid is 2-up / 3-up / 5-up and card width is not monotonic in viewport
     width. Six of six collided at 1024px before Phase 4, the worst case. */
  for (const w of [320, 360, 392, 430, 600, 768]) {
    await setViewport(cdp, { width: w, height: 800, dpr: 2.75, mobile: true });
    await goto(cdp, "categories");
    const rows = await cdp.eval(`(() => {
      const out = [];
      document.querySelectorAll("article h3").forEach((h3) => {
        const r = h3.getBoundingClientRect();
        const card = h3.closest("article").getBoundingClientRect();
        out.push({
          title: h3.textContent.trim(),
          ink: Math.max(0, h3.scrollWidth - h3.clientWidth),
          inside: r.right <= card.right + 0.5 && r.left >= card.left - 0.5,
        });
      });
      return out;
    })()`);
    const bad = rows.filter((r) => r.ink > 0 || !r.inside);
    add(`categories @${w}px: no title ink overflow`, rows.length > 0 && bad.length === 0,
      bad.length ? JSON.stringify(bad.slice(0, 3)) : `${rows.length} cards clean`);
    // the covers must still be there
    const art = await cdp.eval(
      `Array.from(document.querySelectorAll("article img")).filter((i) => i.complete && i.naturalWidth > 0).length`);
    add(`categories @${w}px: card artwork renders`, art > 0, `${art} images loaded`);
  }
  await clearViewport(cdp);

  /* Horizontal shelves: the partial next card IS the scroll affordance on
     touch — the scrollbar is hidden (cart-shelf-track) and the arrows are
     sm:flex. If a change ever makes cards exactly fill the track, the shelf
     stops looking scrollable. */
  const SHELVES = [
    { route: "cart", label: "cart recommendation shelf" },
    { route: "library", label: "library shelf" },
    { route: "book-detail", label: "related books shelf" },
  ];
  for (const sh of SHELVES) {
    await goto(cdp, sh.route);
    /* Auth-gated routes render UnprovisionedNotice locally (no Clerk key in
       this environment), so there is nothing to measure. Record that rather
       than reporting a failure for something that was never rendered. */
    const gated = await cdp.eval(
      `/Configuration required/i.test((document.querySelector("h1") || {}).textContent || "")`);
    if (gated) {
      out.push({ name: `${sh.label}: present`, pass: true, skipped: true,
                 detail: "route renders UnprovisionedNotice — Clerk not configured in this environment" });
      continue;
    }
    const info = await cdp.eval(`(() => {
      const tracks = Array.from(document.querySelectorAll('[class*="shelf-track"], ul[class*="overflow-x-auto"], div[class*="overflow-x-auto"]'))
        .filter((t) => t.getClientRects().length > 0 && t.scrollWidth > t.clientWidth + 4);
      if (tracks.length === 0) return { tracks: 0 };
      const t = tracks[0];
      const kids = Array.from(t.children).filter((k) => k.getClientRects().length > 0);
      const first = kids[0] ? kids[0].getBoundingClientRect() : null;
      // is a following card partially visible at the right edge?
      const trackBox = t.getBoundingClientRect();
      const peeking = kids.some((k) => {
        const b = k.getBoundingClientRect();
        return b.left < trackBox.right - 4 && b.right > trackBox.right + 4;
      });
      return { tracks: tracks.length, cards: kids.length,
               cardW: first ? Math.round(first.width) : null,
               trackW: Math.round(trackBox.width),
               scrollable: t.scrollWidth > t.clientWidth + 4, peeking };
    })()`);
    if (info.tracks === 0) { add(`${sh.label}: present`, false, "no scrollable track found"); continue; }
    add(`${sh.label}: scrollable`, info.scrollable === true, info);
    add(`${sh.label}: next card peeks (touch affordance)`, info.peeking === true, info);
  }

  return out;
}

/* ──────────────────── discovery: catalog, filters, search ──────────────── */

const FILTER_BTN = 'button[aria-controls="catalog-filters"]';
const FILTER_PANEL = "#catalog-filters";

async function filterChecks(cdp) {
  const out = [];
  const add = (name, pass, detail) => out.push({ name, pass, detail });

  for (const route of ["catalog", "ebooks"]) {
    await goto(cdp, route);

    const shut = await cdp.eval(`(() => {
      const vis = (e) => e.getClientRects().length > 0;
      const imgs = Array.from(document.querySelectorAll("img")).filter(vis)
        .map((i) => Math.round(i.getBoundingClientRect().top + scrollY)).sort((a, b) => a - b);
      const b = document.querySelector(${JSON.stringify(FILTER_BTN)});
      const r = b ? b.getBoundingClientRect() : null;
      return { firstCoverTop: imgs[0] ?? null,
               asideInFlow: Array.from(document.querySelectorAll("aside")).filter(vis).length,
               btn: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null };
    })()`);

    /* The reason the phase exists: the sidebar used to sit above the results,
       putting the first product 1053px down for a 15-book catalogue. */
    add(`${route}: first cover within the first 720px`,
      shut.firstCoverTop !== null && shut.firstCoverTop <= 720, `${shut.firstCoverTop}px`);
    add(`${route}: filter panel not in flow when closed`, shut.asideInFlow === 0, shut.asideInFlow);
    add(`${route}: filters button >= 44px tall`, !!shut.btn && shut.btn.h >= 44,
      shut.btn ? `${shut.btn.w}x${shut.btn.h}` : "missing");

    const opened = await tapUntil(cdp, FILTER_BTN,
      `(() => { const p = document.querySelector(${JSON.stringify(FILTER_PANEL)});
                return !!p && getComputedStyle(p).position === "fixed"; })()`);
    add(`${route}: filter sheet opens`, opened.ok, opened);
    if (!opened.ok) continue;

    const open = await cdp.eval(`(() => {
      const vis = (e) => e.getClientRects().length > 0;
      const p = document.querySelector(${JSON.stringify(FILTER_PANEL)});
      const range = document.querySelector("input[type=range]");
      let hit = null;
      if (range && vis(range)) {
        const r = range.getBoundingClientRect();
        const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2);
        if (cy > 30 && cy < innerHeight - 30) {
          hit = 0;
          for (let dy = -30; dy <= 30; dy++) if (document.elementFromPoint(cx, cy + dy) === range) hit++;
        }
      }
      const rr = range ? range.getBoundingClientRect() : null;
      return { role: p.getAttribute("role"), modal: p.getAttribute("aria-modal"),
               htmlLocked: getComputedStyle(document.documentElement).overflow === "hidden",
               bodyLocked: getComputedStyle(document.body).overflow === "hidden",
               sliderH: rr ? Math.round(rr.height) : null, sliderHit: hit,
               priceLabels: Array.from(document.querySelectorAll("span")).filter(vis)
                 .map((x) => x.textContent.trim()).filter((t) => /^\\$/.test(t)).slice(0, 3) };
    })()`);

    add(`${route}: sheet has dialog semantics`, open.role === "dialog" && open.modal === "true", open);
    add(`${route}: page scroll locked behind sheet`, open.htmlLocked && open.bodyLocked, open);
    add(`${route}: price slider hit area >= 44px`, open.sliderHit !== null && open.sliderHit >= 44,
      `box ${open.sliderH}px, hit ${open.sliderHit}px`);
    add(`${route}: numeric price readout visible`, open.priceLabels.length >= 2, open.priceLabels);

    // filtering actually filters, and the count badge follows
    const filtered = await cdp.eval(`(() => {
      const b = document.querySelector('#catalog-filters button[class*="w-full"]');
      const cats = Array.from(document.querySelectorAll('#catalog-filters li button'));
      if (!cats.length) return { ok: false, reason: "no category buttons" };
      const before = document.querySelectorAll('a[href^="/books/"]').length;
      cats[0].click();
      return { ok: true, before };
    })()`);
    if (filtered.ok) {
      await sleep(900);
      const after = await cdp.eval(`(() => {
        const badge = document.querySelector(${JSON.stringify(FILTER_BTN)});
        return { badge: badge ? (badge.textContent || "").replace(/\\s+/g, " ").trim() : null };
      })()`);
      add(`${route}: active-filter count appears on the trigger`,
        /\d/.test(after.badge || ""), after.badge);
    }

    await pressKey(cdp, "Escape", "Escape", 27);
    const closed = await cdp.eval(`(() => {
      const p = document.querySelector(${JSON.stringify(FILTER_PANEL)});
      return { hidden: p ? getComputedStyle(p).display === "none" : true,
               unlocked: getComputedStyle(document.documentElement).overflow !== "hidden" };
    })()`);
    add(`${route}: Escape closes the sheet`, closed.hidden === true, closed);
    add(`${route}: scroll lock released`, closed.unlocked === true, closed);
  }

  /* Search: the field must stay reachable and the results must not hide behind
     the sticky header when the on-screen keyboard is up. */
  await goto(cdp, "search");
  const search = await cdp.eval(`(() => {
    const vis = (e) => e.getClientRects().length > 0;
    const input = Array.from(document.querySelectorAll('input[type="search"], input[type="text"], input:not([type])'))
      .filter(vis)[0];
    if (!input) return { found: false };
    input.focus();
    const r = input.getBoundingClientRect();
    const hdr = Array.from(document.querySelectorAll("header")).filter(vis)[0];
    const hr = hdr ? hdr.getBoundingClientRect() : null;
    return { found: true, focused: document.activeElement === input,
             top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height),
             headerBottom: hr ? Math.round(hr.bottom) : 0,
             fontSize: getComputedStyle(input).fontSize,
             visualH: visualViewport ? Math.round(visualViewport.height) : null };
  })()`);
  add("search: field present and focusable", search.found && search.focused, search);
  if (search.found) {
    add("search: field clear of the sticky header", search.top >= search.headerBottom - 1,
      `field top ${search.top}, header bottom ${search.headerBottom}`);
    add("search: field >= 44px tall", search.h >= 44, `${search.h}px`);
  }

  /* The real on-screen keyboard, not a simulation. Tapping the field on the
     Redmi raises a 255px IME and the visual viewport drops 719px -> 464px.
     Before the focus-scroll the first result sat at 477px, below the fold, so
     a reader typing could not see a single result. */
  await goto(cdp, "search-results");
  const kbBefore = await cdp.eval(`(visualViewport ? Math.round(visualViewport.height) : innerHeight)`);
  const field = await cdp.eval(`(() => {
    const vis = (e) => e.getClientRects().length > 0;
    const i = Array.from(document.querySelectorAll("input")).filter(vis)[0];
    if (!i) return null;
    const r = i.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (!field) {
    add("search: on-screen keyboard leaves results visible", false, "no input found");
  } else {
    await tapAt(cdp, field.x, field.y);
    await sleep(2200);
    const kb = await cdp.eval(`(() => {
      const vis = (e) => e.getClientRects().length > 0;
      const i = Array.from(document.querySelectorAll("input")).filter(vis)[0];
      const r = i.getBoundingClientRect();
      const res = Array.from(document.querySelectorAll('a[href^="/books/"]')).filter(vis);
      const fr = res[0] ? res[0].getBoundingClientRect() : null;
      const vh = visualViewport ? visualViewport.height : innerHeight;
      return { vvH: Math.round(vh), focused: document.activeElement === i,
               inputTop: Math.round(r.top),
               inputVisible: r.top >= -1 && r.bottom <= vh + 1,
               results: res.length,
               firstResultTop: fr ? Math.round(fr.top) : null,
               firstResultVisible: fr ? (fr.top < vh && fr.bottom > 0) : null };
    })()`);
    const raised = kbBefore - kb.vvH > 50;
    add("search: on-screen keyboard actually raised", raised, `${kbBefore} -> ${kb.vvH}`);
    add("search: field stays visible with the keyboard up", kb.inputVisible === true, kb);
    add("search: first result stays visible with the keyboard up",
      kb.results === 0 || kb.firstResultVisible === true, kb);
  }

  return out;
}

/* ───────────────────── the money path: detail → cart ──────────────────── */

async function commerceChecks(cdp) {
  const out = [];
  const add = (name, pass, detail) => out.push({ name, pass, detail });

  /* Price and the primary CTA must be reachable without scrolling. Measured
     before Phase 6: price 695px, "Add to cart" 743px, on a 718px viewport —
     the buy control was below the fold on every book type. */
  const BOOKS = [
    ["book-detail", "direct-sale"],
    ["book-detail-2", "mixed (direct + Amazon)"],
    ["book-detail-3", "mixed (direct + Amazon)"],
  ];
  for (const [route, kind] of BOOKS) {
    await goto(cdp, route);
    const m = await cdp.eval(`(() => {
      const vis = (e) => e.getClientRects().length > 0;
      const abs = (r) => Math.round(r.top + scrollY);
      const t = (e) => (e.textContent || "").replace(/\\s+/g, " ").trim();
      const price = Array.from(document.querySelectorAll("span,p,strong")).filter(vis)
        .filter((e) => /^(\\$|£|€)\\d/.test(t(e)) && t(e).length < 14 && e.children.length === 0)[0];
      const cta = Array.from(document.querySelectorAll("button,a[href]")).filter(vis)
        .filter((e) => /add to cart|see editions/i.test(t(e)))[0];
      const cr = cta ? cta.getBoundingClientRect() : null;
      const amazon = Array.from(document.querySelectorAll("a[href]")).filter(vis)
        .filter((e) => /buy on amazon/i.test(t(e)))
        .map((e) => Math.round(e.getBoundingClientRect().height));
      return { vh: innerHeight,
               priceTop: price ? abs(price.getBoundingClientRect()) : null,
               priceText: price ? t(price) : null,
               ctaTop: cr ? abs(cr) : null, ctaH: cr ? Math.round(cr.height) : null,
               ctaLabel: cta ? t(cta).slice(0, 24) : null,
               amazonHeights: amazon };
    })()`);
    add(`${route} (${kind}): price above the fold`,
      m.priceTop !== null && m.priceTop < m.vh, `${m.priceText} at ${m.priceTop}px of ${m.vh}`);
    add(`${route} (${kind}): primary CTA above the fold`,
      m.ctaTop !== null && m.ctaTop < m.vh, `"${m.ctaLabel}" at ${m.ctaTop}px`);
    add(`${route} (${kind}): primary CTA >= 44px tall`, (m.ctaH ?? 0) >= 44, `${m.ctaH}px`);
    if (m.amazonHeights.length) {
      add(`${route}: Amazon CTAs >= 44px tall`, m.amazonHeights.every((h) => h >= 44),
        m.amazonHeights.join(", "));
    }
  }

  /* Cart: every control a finger has to hit. */
  await goto(cdp, "cart");
  const cart = await cdp.eval(`(() => {
    const vis = (e) => e.getClientRects().length > 0;
    const t = (e) => (e.textContent || e.getAttribute("aria-label") || "").replace(/\\s+/g, " ").trim();
    const small = Array.from(document.querySelectorAll("button,a[href]")).filter(vis)
      .map((e) => ({ e, r: e.getBoundingClientRect() }))
      .filter((o) => o.r.width > 0 && o.r.height > 0)
      // Cart controls only. The header cluster is Phase 8's scope and the
      // footer link list is site-wide chrome that passes SC 2.5.8 by spacing.
      .filter((o) => !o.e.closest("header") && !o.e.closest("footer"))
      .filter((o) => Math.min(o.r.width, o.r.height) < 44)
      // SC 2.5.8 equivalent exception: a small text link is carried by a larger
      // control with the same destination. The cart line links the book from
      // both its 96x64 cover and its 179x20 title.
      .filter((o) => {
        const href = o.e.getAttribute("href");
        if (!href) return true;
        return !Array.from(document.querySelectorAll('a[href="' + href + '"]'))
          .some((other) => {
            if (other === o.e || other.getClientRects().length === 0) return false;
            const r = other.getBoundingClientRect();
            return Math.min(r.width, r.height) >= 44;
          });
      })
      .map((o) => ({ label: t(o.e).slice(0, 30), w: Math.round(o.r.width), h: Math.round(o.r.height) }));
    const checkout = Array.from(document.querySelectorAll("button,a[href]")).filter(vis)
      .filter((e) => /checkout|proceed|pay/i.test(t(e)))[0];
    const chr = checkout ? checkout.getBoundingClientRect() : null;
    return { smallControls: small,
             checkout: chr ? { h: Math.round(chr.height), w: Math.round(chr.width),
                               label: t(checkout).slice(0, 30) } : null };
  })()`);
  add("cart: no body control under 44px",
    cart.smallControls.length === 0, cart.smallControls.slice(0, 5));
  if (cart.checkout) {
    add("cart: checkout CTA >= 44px", cart.checkout.h >= 44, cart.checkout);
  } else {
    out.push({ name: "cart: checkout CTA >= 44px", pass: true, skipped: true,
               detail: "cart is empty in this environment — no checkout control rendered" });
  }

  /* Routes that could not be reached before. Recorded, not claimed. */
  for (const [path, label] of [["/read/meditations", "reader"], ["/order/1", "order detail"],
                               ["/admin", "admin"]]) {
    await navigateAndSettle(cdp, new URL(path, BASE_URL).href, { hard: true });
    await sleep(900);
    const g = await cdp.eval(`(() => {
      const de = document.documentElement;
      return { h1: ((document.querySelector("h1") || {}).textContent || "").slice(0, 40),
               overflow: Math.max(0, de.scrollWidth - de.clientWidth),
               menu: !!document.querySelector('button[aria-controls="mobile-nav-panel"]') };
    })()`);
    const gated = /Configuration required/i.test(g.h1);
    out.push({ name: `${label}: renders on device without overflow`,
      pass: g.overflow <= 1 && g.menu, skipped: gated,
      detail: gated
        ? `shell only — "${g.h1}" (Clerk/DB not configured); no overflow, menu present`
        : g });
  }

  return out;
}

/* ─────────────────────────────── runner ─────────────────────────────── */

const GROUPS = { nav: navChecks, inputs: inputChecks, theme: themeChecks, cards: cardChecks,
                 filters: filterChecks, commerce: commerceChecks };

async function main() {
  const names = ONLY ? [ONLY] : Object.keys(GROUPS);

  // `next dev` compiles a route on first request; a tap that lands during that
  // window hits an unhydrated page. Warm everything first.
  for (const r of ROUTES.filter((x) => x.device)) {
    try { await fetch(new URL(r.path, BASE_URL).href, { signal: AbortSignal.timeout(60000) }); }
    catch { /* the health assertion will catch a genuinely dead server */ }
  }

  const cdp = await connectDevice();
  console.log(`\n▸ Interaction checks on ${cdp.meta.browser}\n`);

  const all = [];
  for (const g of names) {
    if (!GROUPS[g]) { console.error(`  unknown group: ${g}`); process.exit(2); }
    console.log(`  ── ${g} ──`);
    const results = await GROUPS[g](cdp);
    for (const r of results) {
      const mark = r.skipped ? "–" : r.pass ? "✓" : "╳";
      const note = r.skipped ? `  (skipped: ${r.detail})` : r.pass ? "" : `  → ${JSON.stringify(r.detail)}`;
      console.log(`  ${mark} ${r.name}${note}`);
    }
    all.push(...results.map((r) => ({ group: g, ...r })));
  }
  cdp.close();

  const failed = all.filter((r) => !r.pass);
  const skipped = all.filter((r) => r.skipped);
  console.log(`\n▸ ${all.length - failed.length - skipped.length}/${all.length - skipped.length} passed` +
              (skipped.length ? `, ${skipped.length} skipped (not testable here)` : ""));

  if (OUT) {
    const p = resolve(process.cwd(), OUT);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, JSON.stringify({ generatedAt: new Date().toISOString(), results: all }, null, 2));
    console.log(`  → ${OUT}`);
  }
  if (failed.length) process.exit(1);
}

main().catch((e) => { console.error(`\n╳ journeys aborted: ${e.message}`); process.exit(1); });
