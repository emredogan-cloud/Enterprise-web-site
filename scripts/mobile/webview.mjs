#!/usr/bin/env node
/**
 * Android System WebView audit — the in-app-browser check.
 *
 *   npm run mobile:webview
 *   npm run mobile:webview -- --routes home,book-detail --out <path>.json
 *
 * WHY THIS EXISTS AND WHY IT IS NOT CHROME
 * A large share of mobile traffic never touches a browser: links opened from
 * Instagram, X, Gmail, WhatsApp and the rest render inside the host app's
 * WebView. That is a different binary from Chrome — on the reference device
 * Chrome is 152.0.7977.75 while Android System WebView is 151.0.7922.199 —
 * and, more importantly, it is a different *configuration*. A WebView has no
 * browser chrome (so the viewport is taller), and until the host app opts in
 * it reports `prefers-color-scheme: light`, which for a dark-only site is the
 * single highest-risk difference.
 *
 * WHY WE HAD TO BUILD A HOST APP
 * CDP can only attach to a WebView whose host called
 * `WebView.setWebContentsDebuggingEnabled(true)`. Nothing on the device does:
 * `/proc/net/unix` lists exactly one Chrome socket and two Stetho sockets
 * belonging to Google Messages, none of which will load an arbitrary URL. So
 * this harness ships `scripts/mobile/wvhost/` — ~40 lines of Java that put one
 * full-bleed WebView on screen, turn debugging on, and load the intent's URL.
 * It sets nothing else: no forced dark mode, no user-agent override, no zoom
 * controls. The point is to observe the DEFAULTS an ordinary in-app browser
 * hands the site, not a tuned best case.
 *
 * The APK is debug-signed and installed only for the duration of a QA run;
 * `--uninstall` removes it. See MOBILE_REGRESSION_SUITE.md for the build.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { assertServerHealthy, BASE_URL, CDP, navigateAndSettle, assertRendered, sleep } from "./device.mjs";
import { PROBE_SOURCE } from "./probe.mjs";
import { byName } from "./routes.mjs";

const ADB = process.env.ADB_BIN ?? "/home/emre/Android/Sdk/platform-tools/adb";
const PKG = "press.valice.wvhost";
const ACTIVITY = `${PKG}/.HostActivity`;

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const OUT = arg("out", "docs/execution/mobile/baseline/phase-9/webview.json");
const ROUTE_NAMES = arg("routes", "home,book-detail,catalog,cart").split(",");
const PORT = Number(arg("port", 9444));
const UNINSTALL = argv.includes("--uninstall");

const adb = (...a) => execFileSync(ADB, a, { encoding: "utf8", timeout: 30000 }).trim();

function installed() {
  try { return adb("shell", "pm", "list", "packages", PKG).includes(PKG); } catch { return false; }
}

/** The WebView's devtools socket, named after the host process id. */
function webviewSocket() {
  const unix = adb("shell", "cat", "/proc/net/unix");
  const m = [...unix.matchAll(/@(webview_devtools_remote_\d+)/g)].map((x) => x[1]);
  return [...new Set(m)][0] ?? null;
}

/** Attach CDP to the single page target inside the host WebView. */
async function attachWebView(cdpUrl) {
  const version = await (await fetch(`${cdpUrl}/json/version`, { signal: AbortSignal.timeout(8000) })).json();
  if (version["Android-Package"] !== PKG) {
    throw new Error(`socket belongs to ${version["Android-Package"] ?? "an unknown package"}, not ${PKG}`);
  }
  const list = await (await fetch(`${cdpUrl}/json/list`, { signal: AbortSignal.timeout(8000) })).json();
  const target = list.find((t) => t.type === "page");
  if (!target) throw new Error("no page target in the WebView");
  const cdp = await CDP.attach(target.webSocketDebuggerUrl, {
    kind: "webview", browser: version.Browser, androidPackage: version["Android-Package"],
  });
  await cdp.enableDomains();
  return cdp;
}

async function main() {
  if (UNINSTALL) {
    if (installed()) { adb("uninstall", PKG); console.log(`  removed ${PKG}`); }
    else console.log(`  ${PKG} was not installed`);
    return;
  }

  console.log(`\n▸ Android System WebView audit`);
  if (!installed()) {
    console.error(
      `╳ ${PKG} is not installed. Build and install it first:\n` +
      `  see docs/execution/mobile/MOBILE_REGRESSION_SUITE.md § "WebView host".`,
    );
    process.exit(2);
  }

  await assertServerHealthy();

  const results = [];
  let failures = 0;

  for (const name of ROUTE_NAMES) {
    const route = byName(name);
    if (!route) { console.log(`  ? ${name.padEnd(18)} unknown route, skipped`); continue; }

    // One activity per route: the host recreates on a new intent, which gives
    // every route a cold WebView rather than a soft transition. That is what an
    // in-app browser actually does — it opens a fresh WebView per link.
    adb("shell", "am", "start", "-a", "android.intent.action.VIEW",
        "-d", new URL(route.path, BASE_URL).href, "-n", ACTIVITY);
    await sleep(2500);

    const socket = webviewSocket();
    if (!socket) { console.log(`  ╳ ${name.padEnd(18)} no webview devtools socket`); failures++; continue; }
    try { adb("forward", `tcp:${PORT}`, `localabstract:${socket}`); } catch { /* already bound */ }

    let cdp;
    try {
      cdp = await attachWebView(`http://127.0.0.1:${PORT}`);
    } catch (err) {
      console.log(`  ╳ ${name.padEnd(18)} attach failed: ${err.message}`);
      failures++; continue;
    }

    await sleep(1200);
    try {
      // The activity already loaded the URL; settle and, if the WebView landed
      // somewhere else, navigate hard (a WebView has no Next router history to
      // soft-navigate through on a cold open).
      const here = await cdp.eval(`location.pathname + location.search`);
      if (here !== route.path) await navigateAndSettle(cdp, new URL(route.path, BASE_URL).href, { hard: true });
      else { await sleep(1500); try { await cdp.eval(`document.fonts.ready.then(()=>0)`, { awaitPromise: true }); } catch {} }

      const state = await cdp.eval(`({ rs: document.readyState, nodes: document.querySelectorAll('*').length,
        h: document.documentElement.scrollHeight, vh: innerHeight, href: location.href, title: document.title })`);
      await assertRendered(cdp, route, state.href);

      const probe = await cdp.eval(PROBE_SOURCE);
      const env = await cdp.eval(`({
        ua: navigator.userAgent,
        isWebView: / wv\\)/.test(navigator.userAgent),
        vw: innerWidth, vh: innerHeight, dpr: devicePixelRatio,
        visualVW: visualViewport ? Math.round(visualViewport.width) : null,
        visualVH: visualViewport ? Math.round(visualViewport.height) : null,
        prefersDark: matchMedia("(prefers-color-scheme: dark)").matches,
        prefersLight: matchMedia("(prefers-color-scheme: light)").matches,
        forcedColors: matchMedia("(forced-colors: active)").matches,
        hoverHover: matchMedia("(hover: hover)").matches,
        pointerCoarse: matchMedia("(pointer: coarse)").matches,
        cookiesEnabled: navigator.cookieEnabled,
        localStorage: (() => { try { localStorage.setItem("__wv","1"); localStorage.removeItem("__wv"); return true; } catch (e) { return false; } })()
      })`);

      const row = {
        route: name, path: route.path, env,
        docScrollW: probe.docScrollW, viewportW: probe.viewportW ?? env.vw,
        overflowCount: probe.overflowCount, overflowers: probe.overflowers,
        tapFailsWcag: probe.tapFailsWcag, tapFailsWcagList: probe.tapFailsWcagList,
        textBelow12: probe.textBelow12,
        contrast: probe.contrast,
        theme: probe.theme, nav: probe.nav, a11y: probe.a11y,
        docScrollH: probe.docScrollH, nodes: state.nodes,
        consoleErrors: cdp.consoleErrors.slice(0, 5),
        pageErrors: cdp.pageErrors.slice(0, 5),
      };
      results.push(row);

      const bad = row.overflowCount > 0 || row.tapFailsWcag > 0 ||
                  (row.contrast && row.contrast.failures > 0) ||
                  row.consoleErrors.length > 0 || row.pageErrors.length > 0;
      if (bad) failures++;
      console.log(
        `  ${bad ? "╳" : "✓"} ${name.padEnd(18)} ${env.vw}x${env.vh} @${env.dpr}  ` +
        `overflow ${row.overflowCount}  tap ${row.tapFailsWcag}  contrast ${row.contrast?.failures ?? "?"}  ` +
        `scheme ${env.prefersDark ? "dark" : env.prefersLight ? "LIGHT" : "no-preference"}  ` +
        `bg ${row.theme?.htmlBg}`,
      );
    } catch (err) {
      console.log(`  ╳ ${name.padEnd(18)} ${err.message}`);
      failures++;
    } finally {
      cdp?.close();
      try { adb("forward", "--remove", `tcp:${PORT}`); } catch {}
    }
  }

  adb("shell", "am", "force-stop", PKG);
  /* Hand the foreground back to Chrome. Every other harness script attaches to
     Chrome's socket, and a backgrounded Chrome stops answering CDP. */
  try { adb("shell", "monkey", "-p", "com.android.chrome", "-c", "android.intent.category.LAUNCHER", "1"); } catch {}

  mkdirSync(dirname(resolve(process.cwd(), OUT)), { recursive: true });
  writeFileSync(resolve(process.cwd(), OUT), JSON.stringify({
    generatedAt: new Date().toISOString(),
    webViewPackage: (() => { try { return adb("shell", "dumpsys", "package", "com.google.android.webview")
      .split("\n").find((l) => l.includes("versionName")); } catch { return null; } })(),
    results,
  }, null, 2));

  console.log(`\n▸ ${results.length - failures}/${ROUTE_NAMES.length} clean → ${OUT}`);
  if (failures) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
