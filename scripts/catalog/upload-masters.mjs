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
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  DIGITAL_EDITION_SOURCES,
  epubMasterKey,
  masterKey,
} from "./digital-edition-sources.mjs";

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

/**
 * Upload one file, skipping it when an object of the same size is already
 * there. Same-size-means-same is a deliberate approximation: it is cheap, it
 * catches every real re-cut (a rebuilt PDF is never byte-identical in size),
 * and the alternative — overwriting a master a buyer may already have been
 * served from — is the failure worth avoiding.
 */
async function upload({ file, key, contentType, missingHint }) {
  let size;
  try {
    size = statSync(file).size;
  } catch {
    console.error(`MISSING  ${file} — ${missingHint}`);
    process.exitCode = 1;
    return;
  }

  let existing = null;
  let remoteEtag = null;
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    existing = head.ContentLength;
    remoteEtag = (head.ETag ?? "").replace(/"/g, "");
  } catch {
    /* not present — first upload */
  }

  // Same size is NOT the same file. A re-cut edition can come out byte-different
  // at an identical length — both Epictetus masters did on 2026-09-04 — and a
  // size-only check silently left the stale object in the bucket under buyers who
  // would then be watermarked a superseded text. Compare content, not length.
  // R2 returns a plain MD5 ETag for single-part uploads, which is what these are.
  if (existing === size && remoteEtag && !remoteEtag.includes("-")) {
    const localMd5 = createHash("md5").update(readFileSync(file)).digest("hex");
    if (localMd5 === remoteEtag) {
      console.log(`SAME  ${key.padEnd(52)} ${mb(size).padStart(9)}  (already present, content identical — skipped)`);
      return;
    }
    console.log(`DIFFERS  ${key.padEnd(49)} ${mb(size).padStart(9)}  (same size, different content — will replace)`);
  } else if (existing === size) {
    console.log(`SAME  ${key.padEnd(52)} ${mb(size).padStart(9)}  (already present, same size — skipped)`);
    return;
  }

  if (!commit) {
    console.log(
      `WOULD PUT  ${key.padEnd(52)} ${mb(size).padStart(9)}` +
        (existing !== null ? `  (overwrites ${mb(existing)})` : "  (new)"),
    );
    return;
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: readFileSync(file),
      ContentType: contentType,
      // Belt and braces: the bucket is private, and nothing should ever cache
      // a master anywhere it could be reached without a signature.
      CacheControl: "private, no-store",
    }),
  );
  console.log(`PUT  ${key.padEnd(52)} ${mb(size).padStart(9)}`);
}

for (const src of DIGITAL_EDITION_SOURCES) {
  if (only.size && !only.has(src.slug)) continue;

  await upload({
    file: `scripts/tmp/digital-editions/${src.slug}.pdf`,
    key: masterKey(src.slug),
    contentType: "application/pdf",
    missingHint: "run build-digital-editions.mjs first",
  });

  // The EPUB is uploaded straight from the book project, not from the
  // digital-editions staging folder: there is nothing to re-typeset, and the
  // file the reader gets should be the one epubcheck validated.
  if (src.epub) {
    await upload({
      file: src.epub,
      key: epubMasterKey(src.slug),
      contentType: "application/epub+zip",
      missingHint: "the book project has not built its EPUB",
    });
  }
}

if (!commit) console.log("\ndry run complete — re-run with --commit to upload.");
