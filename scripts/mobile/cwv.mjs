#!/usr/bin/env node
/**
 * Core Web Vitals + INP on the physical Redmi.
 *
 *   npm run mobile:cwv
 *   npm run mobile:cwv -- --url https://valicepress.com --out .../cwv.json
 *
 * Conditions (the roadmap's reference mobile connection):
 *   cache disabled · 1.6 Mbps down · 70 ms RTT · real Redmi Note 8 (2021)
 *
 * HONESTY NOTE — LCP and CLS here are lab measurements on one device over an
 * emulated link. They are NOT field data and NOT a 75th percentile. INP is a
 * *lab proxy*: the worst interaction latency across a fixed set of scripted
 * taps, which is the closest a lab run can get. Report them as such.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  BASE_URL, assertServerHealthy, connectDevice, navigateAndSettle,
  throttle, unthrottle, setCacheDisabled, sleep,
} from "./device.mjs";

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const TARGET = arg("url", BASE_URL);
const OUT = arg("out", "docs/execution/mobile/baseline/latest/cwv.json");
const PATHS = arg("paths", "/,/books,/books/meditations").split(",");
const REPEAT = Number(arg("repeat", 3));
/* Stacking CDP throttling on a live internet path produced 8–79 s LCP for the
 * same page. --no-throttle measures the real network instead of emulating one
 * on top of it, which is the only credible way to read a remote origin. */
const NO_THROTTLE = argv.includes("--no-throttle");
const SKIP_HEALTH = TARGET !== BASE_URL;   // remote origins aren't our dev server

/* Installed before any document script so buffered entries are never missed. */
const OBSERVERS = `
(() => {
  window.__cwv = { lcp: null, cls: 0, shifts: [], events: [], longTasks: 0, longTaskMs: 0 };
  const O = (type, fn, extra) => { try {
    new PerformanceObserver(fn).observe(Object.assign({ type, buffered: true }, extra || {}));
  } catch (e) {} };
  O("largest-contentful-paint", (l) => {
    const e = l.getEntries(); const last = e[e.length - 1];
    if (last) window.__cwv.lcp = {
      t: Math.round(last.startTime), size: last.size,
      el: last.element ? last.element.tagName + (last.element.className ? "." + String(last.element.className).slice(0,40) : "") : null,
      text: last.element ? String(last.element.textContent || "").trim().slice(0, 40) : null,
      url: last.url || null };
  });
  O("layout-shift", (l) => { for (const e of l.getEntries()) {
    if (e.hadRecentInput) continue;
    window.__cwv.cls += e.value;
    const n = e.sources && e.sources[0] && e.sources[0].node;
    if (n) window.__cwv.shifts.push({ v: +e.value.toFixed(4), node: n.tagName + "." + String(n.className || "").slice(0, 40) });
  }});
  O("event", (l) => { for (const e of l.getEntries()) {
    window.__cwv.events.push({ name: e.name, dur: Math.round(e.duration),
      target: e.target ? e.target.tagName + "." + String(e.target.className || "").slice(0,30) : null });
  }}, { durationThreshold: 16 });
  O("longtask", (l) => { for (const e of l.getEntries()) {
    window.__cwv.longTasks++; window.__cwv.longTaskMs += e.duration; }});
})()`;

/** Drive real touch interactions so `event` timings exist to read back. */
async function driveInteractions(cdp) {
  /* Suppress navigation for the duration of the tap pass, then include links
   * as candidates. Buttons alone are not enough: at scroll 0 the homepage has
   * no <button> in view, so INP came back null. A capture-phase preventDefault
   * lets us measure the interaction latency of any control without leaving the
   * page. Removed again immediately afterwards. */
  await cdp.eval(`(() => {
    window.__inpBlock = (e) => { e.preventDefault(); e.stopPropagation(); };
    document.addEventListener("click", window.__inpBlock, true);
    return true;
  })()`);

  const spots = await cdp.eval(`(() => {
    const vis = (e) => e.getClientRects().length > 0 &&
      getComputedStyle(e).visibility !== "hidden" && parseFloat(getComputedStyle(e).opacity) !== 0;
    const els = Array.prototype.slice.call(
        document.querySelectorAll("button,[role=button],select,input,a[href],summary"))
      .filter(vis)
      .map((e) => { const r = e.getBoundingClientRect(); return { e, r }; })
      .filter((o) => o.r.width > 8 && o.r.height > 8 && o.r.top >= 0 && o.r.bottom <= innerHeight);
    return els.slice(0, 8).map((o) => ({
      x: Math.round(o.r.left + o.r.width / 2), y: Math.round(o.r.top + o.r.height / 2),
      label: (o.e.getAttribute("aria-label") || o.e.textContent || o.e.tagName).trim().slice(0, 30) }));
  })()`);

  for (const s of spots) {
    const pt = [{ x: s.x, y: s.y, radiusX: 12, radiusY: 12, force: 1 }];
    try {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: pt });
      await sleep(60);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await sleep(500);
    } catch { /* element vanished mid-tap; keep going */ }
  }
  await sleep(800);
  await cdp.eval(`(() => {
    if (window.__inpBlock) document.removeEventListener("click", window.__inpBlock, true);
    delete window.__inpBlock; return true;
  })()`).catch(() => {});
  return spots;
}

async function measure(cdp, url) {
  await setCacheDisabled(cdp, true);
  if (!NO_THROTTLE) await throttle(cdp); else await unthrottle(cdp);
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: OBSERVERS });

  await navigateAndSettle(cdp, url, { timeoutMs: 60000, settleMs: 3000, hard: true });
  await sleep(4000);                       // let late LCP candidates land
  const interactions = await driveInteractions(cdp);

  const data = await cdp.eval(`(() => {
    const res = performance.getEntriesByType("resource");
    const kb = (a) => Math.round(a.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024);
    const js = res.filter((r) => /\\.js(\\?|$)/.test(r.name));
    const css = res.filter((r) => /\\.css/.test(r.name));
    const font = res.filter((r) => /\\.woff2?/.test(r.name));
    const img = res.filter((r) => r.initiatorType === "img" || /_next\\/image|\\.(webp|avif|png|jpe?g|svg)/.test(r.name));
    const nav = performance.getEntriesByType("navigation")[0] || {};
    const fcp = performance.getEntriesByName("first-contentful-paint")[0];
    const evs = window.__cwv.events.slice().sort((a, b) => b.dur - a.dur);
    return {
      url: location.href,
      ttfbMs: Math.round(nav.responseStart || 0),
      fcpMs: fcp ? Math.round(fcp.startTime) : null,
      lcp: window.__cwv.lcp,
      cls: +window.__cwv.cls.toFixed(4),
      topShifts: window.__cwv.shifts.slice(0, 3),
      inpProxyMs: evs.length ? evs[0].dur : null,
      slowestInteractions: evs.slice(0, 5),
      interactionCount: window.__cwv.events.length,
      longTasks: window.__cwv.longTasks, longTaskMs: Math.round(window.__cwv.longTaskMs),
      requests: res.length,
      jsKB: kb(js), jsCount: js.length,
      cssKB: kb(css), cssCount: css.length,
      fontKB: kb(font), fontCount: font.length,
      imgKB: kb(img), imgCount: img.length,
      totalKB: kb(res),
      domNodes: document.querySelectorAll("*").length,
    };
  })()`);

  data.interactionsDriven = interactions.length;
  await unthrottle(cdp);
  await setCacheDisabled(cdp, false);
  return data;
}

async function main() {
  console.log(`\n▸ Core Web Vitals — ${TARGET}`);
  console.log(`  conditions: cache off · ${NO_THROTTLE ? "unthrottled (real network)" : "1.6 Mbps · 70 ms RTT"} · physical Redmi`);

  const cdp = await connectDevice();
  console.log(`  device: ${cdp.meta.browser}\n`);

  const results = [];
  for (const p of PATHS) {
    const url = new URL(p, TARGET).href;
    if (!SKIP_HEALTH) await assertServerHealthy(TARGET, { path: p });

    /* Repeat and take the median.
     *
     * A single lab run is not a baseline. Measuring valicepress.com over the
     * real internet with CDP throttling stacked on top produced LCP values of
     * 1816 / 4076 / 5836 / 12976 ms for the same page — the emulator throttles
     * on top of live network jitter, and LCP == FCP on every run, so the whole
     * spread is "when did the first paint happen". Median of N is the least
     * misleading single number; the full spread is kept in `samples`. */
    const runs = [];
    for (let i = 0; i < REPEAT; i++) {
      runs.push(await measure(cdp, url));
      if (i < REPEAT - 1) await sleep(1500);
    }
    const median = (xs) => {
      const v = xs.filter((x) => typeof x === "number" && !Number.isNaN(x)).sort((a, b) => a - b);
      return v.length ? v[Math.floor((v.length - 1) / 2)] : null;
    };
    const pick = (f) => median(runs.map(f));
    const repLcp = pick((r) => r.lcp?.t);
    const rep = runs.find((r) => r.lcp?.t === repLcp) ?? runs[0];

    const d = {
      ...rep,
      lcp: rep.lcp,
      lcpMedianMs: repLcp,
      lcpSamples: runs.map((r) => r.lcp?.t ?? null),
      fcpMedianMs: pick((r) => r.fcpMs),
      clsMax: Math.max(...runs.map((r) => r.cls ?? 0)),
      inpProxyMedianMs: pick((r) => r.inpProxyMs),
      inpSamples: runs.map((r) => r.inpProxyMs ?? null),
      totalKBMedian: pick((r) => r.totalKB),
      samples: runs.length,
    };
    results.push({ path: p, ...d });
    const lcp = d.lcpMedianMs;
    const verdict = lcp == null ? "?" : lcp <= 2500 ? "GOOD" : lcp <= 4000 ? "NEEDS-WORK" : "POOR";
    console.log(
      `  ${p.padEnd(22)} LCP=${String(lcp).padStart(5)}ms ${verdict.padEnd(11)}` +
      `CLS=${String(d.clsMax).padEnd(6)} INP~${String(d.inpProxyMedianMs).padStart(4)}ms  ` +
      `total=${String(d.totalKBMedian).padStart(4)}KB (js ${d.jsKB} / img ${d.imgKB} / font ${d.fontKB})`,
    );
    console.log(`     samples LCP: [${d.lcpSamples.join(", ")}]  CLS max: ${d.clsMax}`);
    if (d.lcp?.el) console.log(`     LCP element: ${d.lcp.el}${d.lcp.text ? ` — "${d.lcp.text}"` : ""}`);
  }
  cdp.close();

  const report = {
    generatedAt: new Date().toISOString(),
    target: TARGET,
    device: cdp.meta,
    conditions: { cacheDisabled: true, throttled: !NO_THROTTLE,
                  downKbps: NO_THROTTLE ? null : 1600, latencyMs: NO_THROTTLE ? null : 70,
                  hardware: "Redmi Note 8 (2021)", repeats: REPEAT, statistic: "median" },
    caveat:
      "Lab measurements on one device over an emulated link. Not field data, not a 75th percentile. " +
      "inpProxyMs is the worst scripted-interaction latency across a fixed tap set, not true INP. " +
      "Values are the median of `repeats` runs; per-run spread is in lcpSamples/inpSamples. " +
      "Measuring a REMOTE origin stacks CDP throttling on live network jitter and is much noisier " +
      "than measuring the local server over adb — prefer local for phase-to-phase comparison.",
    thresholds: { lcpGoodMs: 2500, clsGood: 0.1, inpGoodMs: 200 },
    results,
  };
  const outPath = resolve(process.cwd(), OUT);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n  → ${OUT}`);
}

main().catch((e) => { console.error(`\n╳ cwv aborted: ${e.message}`); process.exit(1); });
