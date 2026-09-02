/**
 * Upload the built digital editions to the private R2 masters bucket.
 *
 * These are the files the fulfillment worker watermarks per order. They are
 * never served directly: the bucket is private and delivery is by short-TTL
 * signed URL only (ADR-6). Nothing here is made public.
 *
 * Keys are versioned (`books/<slug>/master/v1/master.pdf`) so re-cutting an
 * edition is a new version rather than a silent overwrite under buyers who
 * already own the old one.
 *
 * Credentials come from an env file, never from arguments, and the target
 * bucket is printed before anything is written.
 *
 * Usage:
 *   node scripts/catalog/upload-masters.mjs             # dry run
 *   node scripts/catalog/upload-masters.mjs --commit
 */
import { readFileSync, statSync } from "node:fs";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DIGITAL_EDITION_SOURCES, masterKey } from "./digital-edition-sources.mjs";

const commit = process.argv.includes("--commit");
const flag = process.argv.indexOf("--env");
const envFile = flag !== -1 ? process.argv[flag + 1] : ".env";
// Optional slug filter: `upload-masters.mjs --env f --commit the-puzzles-of-henry-dudeney`.
// Without it every source is considered — but an object that already exists
// with the same byte size is left alone, so a re-run never silently
// overwrites a master a buyer may already have been served from.
const only = new Set(process.argv.slice(2).filter((a) => !a.startsWith("--") && a !== envFile));

for (const line of readFileSync(envFile, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) {
    process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const bucket = process.env.R2_BUCKET_MASTERS;
if (!bucket) throw new Error(`R2_BUCKET_MASTERS not found in ${envFile}`);

console.log(`env file : ${envFile}`);
console.log(`bucket   : ${bucket}`);
console.log(`mode     : ${commit ? "COMMIT" : "DRY RUN"}\n`);

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const mb = (n) => (n / 1024 / 1024).toFixed(2) + " MB";

for (const src of DIGITAL_EDITION_SOURCES) {
  if (only.size && !only.has(src.slug)) continue;
  const file = `scripts/tmp/digital-editions/${src.slug}.pdf`;
  const key = masterKey(src.slug);

  let size;
  try {
    size = statSync(file).size;
  } catch {
    console.error(`MISSING  ${file} — run build-digital-editions.mjs first`);
    process.exitCode = 1;
    continue;
  }

  let existing = null;
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    existing = head.ContentLength;
  } catch {
    /* not present — first upload */
  }

  if (existing === size) {
    console.log(`SAME  ${key.padEnd(48)} ${mb(size).padStart(9)}  (already present, same size — skipped)`);
    continue;
  }

  if (!commit) {
    console.log(
      `WOULD PUT  ${key.padEnd(48)} ${mb(size).padStart(9)}` +
        (existing !== null ? `  (overwrites ${mb(existing)})` : "  (new)"),
    );
    continue;
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: readFileSync(file),
      ContentType: "application/pdf",
      // Belt and braces: the bucket is private, and nothing should ever cache
      // a master anywhere it could be reached without a signature.
      CacheControl: "private, no-store",
    }),
  );
  console.log(`PUT  ${key.padEnd(48)} ${mb(size).padStart(9)}`);
}

if (!commit) console.log("\ndry run complete — re-run with --commit to upload.");
