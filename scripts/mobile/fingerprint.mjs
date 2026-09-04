#!/usr/bin/env node
/**
 * Layout fingerprint — the desktop (and mobile) regression gate.
 *
 *   npm run mobile:fingerprint -- --desktop --width 1440 \
 *          --out docs/execution/mobile/baseline/phase-0/fingerprint-1440.json
 *   npm run mobile:fingerprint -- --compare a.json b.json
 *
 * WHY NOT PIXEL DIFFS
 * A pixel gate was tried first and could not be made trustworthy: two captures
 * of *identical* code differed on 11 of 26 desktop images. Emulating
 * prefers-reduced-motion, waiting for every image to decode, waiting for the
 * document height to stop moving and pinning the scroll offset each got it
 * down but never to zero — a late reflow shifts a fold boundary and the whole
 * image moves a few pixels. A gate that fails on its own noise trains everyone
 * to ignore it.
 *
 * This records geometry and computed style instead: element boxes rounded to
 * whole pixels, plus the properties a layout regression would actually move.
 * It is deterministic, it says *what* changed rather than *that something did*,
 * and it ignores antialiasing. Screenshots are still captured every phase — as
 * evidence for a human, not as the gate.
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  BASE_URL, assertServerHealthy, connectDevice, launchDesktopChrome, closeDesktopChrome,
  navigateAndSettle, assertRendered, setViewport, sleep,
} from "./device.mjs";
import { ROUTES, DESKTOP_BASELINE, deviceRoutes } from "./routes.mjs";

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const DESKTOP = argv.includes("--desktop");
const COMPARE = argv.indexOf("--compare");

/* ───────────────────────────── comparison ───────────────────────────── */

if (COMPARE >= 0) {
  const a = JSON.parse(readFileSync(resolve(process.cwd(), argv[COMPARE + 1]), "utf8"));
  const b = JSON.parse(readFileSync(resolve(process.cwd(), argv[COMPARE + 2]), "utf8"));
  const byRoute = (f) => Object.fromEntries(f.routes.map((r) => [r.route, r]));
  const A = byRoute(a), B = byRoute(b);
  let changed = 0, checked = 0;

  console.log(`\n▸ Layout fingerprint diff`);
  console.log(`  before: ${argv[COMPARE + 1]}`);
  console.log(`  after:  ${argv[COMPARE + 2]}\n`);

  for (const route of Object.keys(A)) {
    const x = A[route], y = B[route];
    if (!y) { console.log(`  ⚠ ${route}: missing in after`); changed++; continue; }
    checked++;
    const diffs = [];
    if (x.doc.scrollWidth !== y.doc.scrollWidth) diffs.push(`scrollWidth ${x.doc.scrollWidth}→${y.doc.scrollWidth}`);
    if (x.doc.scrollHeight !== y.doc.scrollHeight) diffs.push(`scrollHeight ${x.doc.scrollHeight}→${y.doc.scrollHeight}`);
    if (x.nodes.length !== y.nodes.length) diffs.push(`node count ${x.nodes.length}→${y.nodes.length}`);

    const key = (n) => `${n.path}`;
    const XA = new Map(x.nodes.map((n) => [key(n), n]));
    const YB = new Map(y.nodes.map((n) => [key(n), n]));
    let moved = 0;
    const samples = [];
    for (const [k, n] of XA) {
      const m = YB.get(k);
      if (!m) { moved++; if (samples.length < 5) samples.push(`gone: ${k}`); continue; }
      if (n.sig !== m.sig) {
        moved++;
        if (samples.length < 5) samples.push(`${k}\n        before ${n.sig}\n        after  ${m.sig}`);
      }
    }
    if (moved) diffs.push(`${moved} element(s) changed`);

    if (diffs.length) {
      changed++;
      console.log(`  ╳ ${route}`);
      for (const d of diffs) console.log(`      ${d}`);
      for (const s of samples) console.log(`      ${s}`);
    } else {
      console.log(`  ✓ ${route}`);
    }
  }
  console.log(`\n▸ ${checked - changed}/${checked} routes identical`);
  process.exit(changed ? 1 : 0);
}

/* ───────────────────────────── collection ───────────────────────────── */

const WIDTH = Number(arg("width", DESKTOP ? 1440 : 0));
const HEIGHT = Number(arg("height", DESKTOP ? 900 : 0));
const OUT = arg("out", `docs/execution/mobile/baseline/latest/fingerprint-${DESKTOP ? WIDTH : "device"}.json`);
const ONLY = arg("routes", "") ? arg("routes").split(",") : null;

/**
 * Collected per element: a stable path, its box, and the computed properties a
 * layout regression moves. Deliberately NOT colour-exhaustive — this is a
 * layout gate; colour changes show up in `color`/`backgroundColor` only.
 */
const FINGERPRINT = String.raw`(() => {
  const out = { nodes: [] };
  const de = document.documentElement;
  out.doc = {
    scrollWidth: de.scrollWidth, scrollHeight: de.scrollHeight,
    clientWidth: de.clientWidth, clientHeight: de.clientHeight,
  };
  const path = (el) => {
    const parts = [];
    let n = el, depth = 0;
    while (n && n !== document.body && depth < 12) {
      const parent = n.parentElement;
      const idx = parent ? Array.prototype.indexOf.call(parent.children, n) : 0;
      parts.unshift(n.tagName.toLowerCase() + "[" + idx + "]");
      n = parent; depth++;
    }
    return parts.join(">");
  };
  const all = document.querySelectorAll("body *");
  for (const el of all) {
    if (el.getClientRects().length === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    const sig = [
      Math.round(r.left), Math.round(r.top + (document.scrollingElement || de).scrollTop),
      Math.round(r.width), Math.round(r.height),
      cs.display, cs.position, cs.flexDirection,
      cs.fontSize, cs.lineHeight, cs.fontFamily.split(",")[0],
      cs.color, cs.backgroundColor,
      cs.paddingTop + "/" + cs.paddingRight + "/" + cs.paddingBottom + "/" + cs.paddingLeft,
      cs.marginTop + "/" + cs.marginBottom,
      cs.gridTemplateColumns,
    ].join("|");
    out.nodes.push({ path: path(el), sig });
  }
  return out;
})()`;

async function main() {
  const routes = DESKTOP
    ? ROUTES.filter((r) => DESKTOP_BASELINE.includes(r.path))
    : deviceRoutes().filter((r) => !ONLY || ONLY.includes(r.name));

  let cdp;
  if (DESKTOP) {
    cdp = await launchDesktopChrome({ width: WIDTH, height: HEIGHT });
    await setViewport(cdp, { width: WIDTH, height: HEIGHT, dpr: 1, mobile: false });
    console.log(`\n▸ Layout fingerprint — desktop ${WIDTH}x${HEIGHT} — ${cdp.meta.browser}`);
  } else {
    cdp = await connectDevice();
    console.log(`\n▸ Layout fingerprint — device — ${cdp.meta.browser}`);
  }
  // Freeze animation so transitional transforms never enter the signature.
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });

  const collected = [];
  const failures = [];
  for (const route of routes) {
    const url = new URL(route.path, BASE_URL).href;
    try {
      await assertServerHealthy(BASE_URL, { path: route.path });
      await navigateAndSettle(cdp, url);
      await assertRendered(cdp, route, url);
      // Scroll through to trigger lazy content, return to top, let height settle.
      const h = await cdp.eval(`document.documentElement.scrollHeight`);
      const vh = await cdp.eval(`innerHeight`);
      for (let y = 0; y < h; y += Math.round(vh * 0.8)) {
        await cdp.eval(`window.scrollTo(0, ${y}); 0`);
        await sleep(150);
      }
      await cdp.eval(`window.scrollTo(0, 0); 0`);
      await sleep(900);
      const fp = await cdp.eval(FINGERPRINT);
      collected.push({ route: route.name, path: route.path, ...fp });
      console.log(`  ✓ ${route.name.padEnd(20)} ${fp.nodes.length} elements, ${fp.doc.scrollHeight}px tall`);
    } catch (err) {
      failures.push({ route: route.name, error: String(err.message).slice(0, 200) });
      console.error(`  ╳ ${route.name} — ${String(err.message).slice(0, 140)}`);
    }
  }

  if (DESKTOP) await closeDesktopChrome(cdp); else cdp.close();

  const p = resolve(process.cwd(), OUT);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify({
    generatedAt: new Date().toISOString(),
    surface: DESKTOP ? `desktop-${WIDTH}x${HEIGHT}` : "device",
    baseUrl: BASE_URL, routes: collected, failures,
  }, null, 2));
  console.log(`\n  → ${OUT}`);
  if (failures.length) process.exit(1);
}

main().catch((e) => { console.error(`\n╳ fingerprint aborted: ${e.message}`); process.exit(1); });
