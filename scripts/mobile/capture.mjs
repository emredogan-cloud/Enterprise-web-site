#!/usr/bin/env node
/**
 * Scroll-and-capture screenshots — device or desktop.
 *
 *   npm run mobile:shots -- --dir docs/execution/mobile/baseline/phase-0
 *   npm run mobile:shots -- --desktop --dir .../phase-0/desktop --width 1440
 *
 * NEVER uses Page.captureScreenshot({captureBeyondViewport:true}); that tiles
 * the page and repaints sticky elements per tile, which silently corrupted the
 * first baseline (see MOBILE_CURRENT_STATE_AUDIT.md §1).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

import {
  BASE_URL, assertServerHealthy, connectDevice, launchDesktopChrome, closeDesktopChrome,
  navigateAndSettle, assertRendered, setViewport, sleep, resetCart,
} from "./device.mjs";
import { deviceRoutes, ROUTES, DESKTOP_BASELINE } from "./routes.mjs";

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const DESKTOP = argv.includes("--desktop");
const DIR = arg("dir", DESKTOP ? "docs/execution/mobile/baseline/latest/desktop"
                               : "docs/execution/mobile/baseline/latest");
const WIDTH = Number(arg("width", DESKTOP ? 1440 : 0));
const HEIGHT = Number(arg("height", DESKTOP ? 900 : 0));
const MAX_FOLDS = Number(arg("folds", 4));
const ONLY = arg("routes", "") ? arg("routes").split(",") : null;

/** Shrink to 1x WebP so the repo stays light. 31MB of PNG became 1.1MB. */
function optimise(pngPath, webpPath, targetWidth) {
  try {
    execFileSync("convert", [pngPath, "-resize", `${targetWidth}x`, "-strip", "-quality", "80", webpPath],
      { stdio: "ignore" });
    execFileSync("rm", ["-f", pngPath]);
    return true;
  } catch { return false; }   // ImageMagick missing — keep the PNG
}

/**
 * Wait until the fold is actually stable.
 *
 * Captures were NOT reproducible before this: diffing two runs of identical
 * code showed 11 of 26 desktop images differing, because RevealOnScroll fades
 * sections in over 800ms with per-child stagger and images decode at their own
 * pace. A regression gate that fails on its own noise is worse than no gate.
 *
 * `prefers-reduced-motion: reduce` is emulated for the whole capture run — the
 * app honours it (globals.css neutralises transitions, and reveal-on-scroll
 * skips its observer entirely), so every element lands in its final state
 * immediately.
 */
async function settleForCapture(cdp) {
  const deadline = Date.now() + 10000;
  let lastHeight = -1, stable = 0;
  while (Date.now() < deadline) {
    const ready = await cdp.eval(`(() => {
      const imgs = Array.from(document.images);
      return {
        pending: imgs.filter((i) => !i.complete).length,
        hidden: document.querySelectorAll('[data-reveal]:not([data-reveal="visible"])').length,
        h: document.documentElement.scrollHeight,
      };
    })()`).catch(() => null);
    if (!ready) { await sleep(250); continue; }
    // Height must also stop moving: a late image changes the document height,
    // which shifts every fold boundary and made the same page render a few
    // pixels apart between runs.
    if (ready.h === lastHeight) stable++; else { stable = 0; lastHeight = ready.h; }
    if (ready.pending === 0 && ready.hidden === 0 && stable >= 2) break;
    await sleep(250);
  }
  await sleep(300);
}

/** Scroll to an exact offset and confirm we landed there. */
async function scrollToExact(cdp, y) {
  for (let attempt = 0; attempt < 4; attempt++) {
    await cdp.eval(`(() => {
      const el = document.scrollingElement || document.documentElement;
      el.scrollTop = ${y};
      return el.scrollTop;
    })()`);
    await sleep(200);
    const at = await cdp.eval(`Math.round((document.scrollingElement || document.documentElement).scrollTop)`);
    if (Math.abs(at - y) <= 1) return at;
  }
  return null;
}

async function main() {
  const outDir = resolve(process.cwd(), DIR);
  mkdirSync(outDir, { recursive: true });

  let cdp;
  if (DESKTOP) {
    cdp = await launchDesktopChrome({ width: WIDTH, height: HEIGHT });
    await setViewport(cdp, { width: WIDTH, height: HEIGHT, dpr: 1, mobile: false });
    console.log(`\n▸ Desktop capture ${WIDTH}x${HEIGHT} — ${cdp.meta.browser}`);
  } else {
    cdp = await connectDevice();
    console.log(`\n▸ Device capture — ${cdp.meta.browser}`);
  }

  // Deterministic renders: no fades, no staggered reveals, no half-decoded art.
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  // Baselines are captured with an empty cart — see resetCart().
  const cartState = await resetCart(cdp);
  if (cartState === "empty") console.log("  (cart verified empty for a comparable baseline)");

  const routes = DESKTOP
    ? ROUTES.filter((r) => DESKTOP_BASELINE.includes(r.path))
    : deviceRoutes().filter((r) => !ONLY || ONLY.includes(r.name));

  let written = 0;
  const failures = [];

  for (const route of routes) {
    const url = new URL(route.path, BASE_URL).href;
    try {
      await assertServerHealthy(BASE_URL, { path: route.path });
      await navigateAndSettle(cdp, url);
      await assertRendered(cdp, route, url);

      /* Pre-warm: scroll the whole page once so every lazy image starts (and
       * finishes) loading, then return to the top. Without this, an image
       * straddling a fold boundary can still be decoding when that fold is
       * captured — the last source of nondeterminism after reduced motion,
       * worth ~9k differing pixels on one homepage fold. */
      const first = await cdp.eval(
        `({ h: document.documentElement.scrollHeight, vh: innerHeight })`);
      for (let y = 0; y < first.h; y += Math.round(first.vh * 0.8)) {
        await cdp.eval(`window.scrollTo(0, ${y}); 0`);
        await sleep(180);
      }
      await cdp.eval(`window.scrollTo(0, 0); 0`);
      await settleForCapture(cdp);

      const dims = await cdp.eval(
        `({ h: document.documentElement.scrollHeight, vh: innerHeight, vw: innerWidth })`,
      );
      const folds = Math.min(MAX_FOLDS, Math.max(1, Math.ceil(dims.h / dims.vh)));

      for (let i = 0; i < folds; i++) {
        await scrollToExact(cdp, i * dims.vh);
        await settleForCapture(cdp);
        const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
        if (!shot?.data) throw new Error(`empty screenshot at fold ${i + 1}`);
        const png = `${outDir}/${route.name}-fold${i + 1}.png`;
        writeFileSync(png, Buffer.from(shot.data, "base64"));
        optimise(png, `${outDir}/${route.name}-fold${i + 1}.webp`, dims.vw);
        written++;
      }
      await cdp.eval(`window.scrollTo(0,0); 0`);
      console.log(`  ✓ ${route.name.padEnd(20)} ${dims.h}px / ${folds} fold(s)`);
    } catch (err) {
      failures.push({ route: route.name, error: String(err.message).slice(0, 200) });
      console.error(`  ╳ ${route.name} — ${String(err.message).slice(0, 160)}`);
      if (/dev server (unreachable|returned)/.test(err.message)) break;
    }
  }

  if (DESKTOP) await closeDesktopChrome(cdp); else cdp.close();

  console.log(`\n▸ ${written} captures → ${DIR}`);
  if (failures.length) {
    console.error(`╳ ${failures.length} route(s) failed to capture.`);
    process.exit(1);
  }
}

main().catch((e) => { console.error(`\n╳ capture aborted: ${e.message}`); process.exit(1); });
