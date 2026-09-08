/**
 * Submit the live sitemap's URLs to IndexNow (Bing, Yandex, Seznam, Naver…).
 *
 * Google does not participate in IndexNow; this is for the engines that do.
 * The key file must already be live at https://valicepress.com/<key>.txt —
 * the engine fetches it to prove we own the host. Dry-run by default.
 *
 *   node scripts/seo/indexnow-submit.mjs            # list what would be sent
 *   node scripts/seo/indexnow-submit.mjs --commit   # send
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const HOST = "valicepress.com";
const commit = process.argv.includes("--commit");
const pub = path.join(process.cwd(), "public");
const keyFile = readdirSync(pub).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error("no IndexNow key file in public/");
const key = readFileSync(path.join(pub, keyFile), "utf8").trim();

const xml = await fetch(`https://${HOST}/sitemap.xml`).then((r) => r.text());
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`${urls.length} URLs in sitemap · key ${keyFile}`);

const live = await fetch(`https://${HOST}/${keyFile}`);
if (!live.ok || (await live.text()).trim() !== key) {
  throw new Error(`key file is not live at https://${HOST}/${keyFile} (HTTP ${live.status}) — deploy first`);
}
if (!commit) { console.log(urls.join("\n")); console.log("\ndry run — pass --commit to submit"); process.exit(0); }

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList: urls }),
});
console.log(`IndexNow HTTP ${res.status} ${res.statusText}`);
