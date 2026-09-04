#!/usr/bin/env node
/**
 * Mobile route audit — runs the in-page probe against every device-measurable
 * route on the physical Redmi and writes a JSON report.
 *
 *   npm run mobile:audit
 *   npm run mobile:audit -- --out docs/execution/mobile/baseline/phase-0/audit.json
 *   npm run mobile:audit -- --routes home,catalog --widths 320,392,768
 *
 * Exits non-zero if any route fails to render or the server goes down, so a
 * phase can never be signed off on a silently broken sweep.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  BASE_URL, assertServerHealthy, connectDevice, navigateAndSettle,
  assertRendered, setViewport, clearViewport, sleep,
} from "./device.mjs";
import { PROBE_SOURCE } from "./probe.mjs";
import { deviceRoutes, ROUTES } from "./routes.mjs";

const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const OUT = arg("out", "docs/execution/mobile/baseline/latest/audit.json");
const WIDTHS = arg("widths", "") ? arg("widths").split(",").map(Number) : [null];
const ONLY = arg("routes", "") ? arg("routes").split(",") : null;
const INCLUDE_SOURCE_ONLY = argv.includes("--include-source-only");

/** Resolve the font families actually used to paint a node (authoritative). */
async function platformFonts(cdp, selector) {
  try {
    const doc = await cdp.send("DOM.getDocument", { depth: 1 });
    const q = await cdp.send("DOM.querySelector", { nodeId: doc.root.nodeId, selector });
    if (!q.nodeId) return null;
    const pf = await cdp.send("CSS.getPlatformFontsForNode", { nodeId: q.nodeId });
    return pf.fonts.map((f) => `${f.familyName}${f.isCustomFont ? " (webfont)" : " (system)"} x${f.glyphCount}`);
  } catch { return null; }
}

async function main() {
  const routes = (INCLUDE_SOURCE_ONLY ? ROUTES : deviceRoutes())
    .filter((r) => !ONLY || ONLY.includes(r.name));

  console.log(`\n▸ Mobile audit — ${routes.length} routes × ${WIDTHS.length} width(s)`);
  console.log(`  base: ${BASE_URL}`);

  const cdp = await connectDevice();
  console.log(`  device: ${cdp.meta.browser} (${cdp.meta.androidPackage})`);

  const results = [];
  const failures = [];

  for (const width of WIDTHS) {
    if (width) {
      // Emulate the width while keeping the device's real DPR and mobile flag.
      await setViewport(cdp, { width, height: 800, dpr: 2.75, mobile: true });
      console.log(`\n  ── emulated width ${width}px ──`);
    } else {
      await clearViewport(cdp);
    }

    for (const route of routes) {
      const url = new URL(route.path, BASE_URL).href;
      try {
        await assertServerHealthy(BASE_URL, { path: route.path });
        try {
          await navigateAndSettle(cdp, url);
          await assertRendered(cdp, route, url);
        } catch {
          // One retry: a client-side transition can drop a click, and a dev
          // compile on first hit can outrun the settle. A route that fails
          // twice is a real failure — the retry's own error propagates.
          console.log(`    ↻ retrying ${route.name}`);
          await sleep(1500);
          await navigateAndSettle(cdp, url, { hard: true });
          await assertRendered(cdp, route, url);
        }

        /* Probe from a known scroll position. RevealOnScroll gates sections
         * with opacity:0 until they intersect, so a probe taken at an
         * arbitrary scroll offset counts a different number of interactive
         * elements run to run. Scroll to top, let the observers settle, then
         * measure. */
        await cdp.eval(`window.scrollTo(0, 0); 0`);
        await sleep(700);
        const probe = await cdp.eval(PROBE_SOURCE);
        probe.fonts = {
          body: await platformFonts(cdp, "p"),
          heading: await platformFonts(cdp, "h1, h2"),
        };
        probe.consoleErrors = cdp.consoleErrors.slice(0, 10);
        probe.pageErrors = cdp.pageErrors.slice(0, 5);
        results.push({ route: route.name, path: route.path, width: width ?? "device", ...probe });

        const flag =
          probe.hOverflowPx > 1 ? " ⚠ OVERFLOW" :
          probe.consoleErrors.length ? " ⚠ console" : "";
        console.log(
          `  ✓ ${route.name.padEnd(20)} ovf=${String(probe.hOverflowPx).padStart(3)} ` +
          `tap<24=${String(probe.tapUnder24).padStart(3)} wcagFail=${String(probe.tapFailsWcag).padStart(3)} ` +
          `tiny=${String(probe.tinyTextTotal).padStart(3)} nodes=${String(probe.domNodes).padStart(4)}${flag}`,
        );
      } catch (err) {
        failures.push({ route: route.name, width: width ?? "device", error: String(err.message).slice(0, 300) });
        console.error(`  ╳ ${route.name} — ${String(err.message).slice(0, 160)}`);
        // A dead server must abort the whole run, not just this route.
        if (/dev server (unreachable|returned)/.test(err.message)) throw err;
      }
      await sleep(120);
    }
  }

  await clearViewport(cdp);
  cdp.close();

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    device: cdp.meta,
    widths: WIDTHS,
    routeCount: routes.length,
    results,
    failures,
    summary: {
      routesMeasured: results.length,
      routesFailed: failures.length,
      totalOverflow: results.filter((r) => r.hOverflowPx > 1).length,
      totalWcagTapFailures: results.reduce((s, r) => s + (r.tapFailsWcag ?? 0), 0),
      totalUnder24: results.reduce((s, r) => s + (r.tapUnder24 ?? 0), 0),
      totalTinyText: results.reduce((s, r) => s + (r.tinyTextTotal ?? 0), 0),
      routesWithConsoleErrors: results.filter((r) => (r.consoleErrors ?? []).length).length,
    },
  };

  const outPath = resolve(process.cwd(), OUT);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(`\n▸ Summary`);
  for (const [k, v] of Object.entries(report.summary)) console.log(`   ${k.padEnd(26)} ${v}`);
  console.log(`\n  → ${OUT}`);

  if (failures.length) {
    console.error(`\n╳ ${failures.length} route(s) failed. Audit is NOT valid.`);
    process.exit(1);
  }
}

main().catch((e) => { console.error(`\n╳ audit aborted: ${e.message}`); process.exit(1); });
