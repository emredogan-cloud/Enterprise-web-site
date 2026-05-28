/**
 * Cloudflare R2 storage client — S3-compatible (Roadmap ADR-6, §9, §11).
 *
 * Two private buckets per environment:
 *   - MASTERS   : source PDFs (uploaded by admin in SUB-PR 0.6).
 *   - ARTIFACTS : per-order watermarked PDFs (written by the watermark
 *                 worker in SUB-PR 1.6; served via signed URLs in 1.7+).
 *
 * Security (Roadmap §11):
 *   - Both buckets are PRIVATE; access only via short-lived signed URLs.
 *   - Signed-URL TTL is clamped: 10 minutes default, 15 minutes maximum.
 *   - The S3 client is constructed LAZILY so build / tsc do not require R2
 *     credentials in scope; the first real call throws a clear, actionable
 *     error if the env is unset.
 */

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// -----------------------------------------------------------------------------
// Bucket identifiers — *logical* names. The real bucket name comes from env
// per environment (Preview / Staging / Production), per Roadmap §12.
// -----------------------------------------------------------------------------
export const MASTERS_BUCKET = "MASTERS" as const;
export const ARTIFACTS_BUCKET = "ARTIFACTS" as const;
export type BucketKey = typeof MASTERS_BUCKET | typeof ARTIFACTS_BUCKET;

const BUCKET_ENV: Record<BucketKey, string> = {
  MASTERS: "R2_BUCKET_MASTERS",
  ARTIFACTS: "R2_BUCKET_ARTIFACTS",
};

// -----------------------------------------------------------------------------
// Signed-URL TTL policy (Roadmap §11 — short-TTL, signed-URL-only delivery)
// -----------------------------------------------------------------------------
export const DEFAULT_DOWNLOAD_TTL_SECONDS = 600; // 10 minutes
export const MAX_DOWNLOAD_TTL_SECONDS = 900; // 15 minutes — hard ceiling

// -----------------------------------------------------------------------------
// Lazy S3Client — never constructed at module load. Build, tsc, and any code
// path that does not touch storage will not trip over missing credentials.
// -----------------------------------------------------------------------------
let _client: S3Client | undefined;

function getClient(): S3Client {
  if (_client) return _client;

  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 storage is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.",
    );
  }

  _client = new S3Client({
    region: "auto", // R2 expects the literal string "auto".
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true, // R2 requires path-style addressing.
  });

  return _client;
}

function resolveBucketName(bucket: BucketKey): string {
  const envKey = BUCKET_ENV[bucket];
  const name = process.env[envKey];
  if (!name) {
    throw new Error(`Bucket env var ${envKey} is not set.`);
  }
  return name;
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export interface GenerateSignedDownloadUrlArgs {
  bucket: BucketKey;
  key: string;
  /** TTL in seconds. Default 600 (10 min). Hard ceiling 900 (15 min). */
  ttlSeconds?: number;
}

/**
 * Returns a short-lived presigned URL for downloading the object.
 * TTL is validated against MAX_DOWNLOAD_TTL_SECONDS (Roadmap §11).
 */
export async function generateSignedDownloadUrl({
  bucket,
  key,
  ttlSeconds = DEFAULT_DOWNLOAD_TTL_SECONDS,
}: GenerateSignedDownloadUrlArgs): Promise<string> {
  if (!Number.isFinite(ttlSeconds) || ttlSeconds < 1) {
    throw new Error("ttlSeconds must be a positive number.");
  }
  if (ttlSeconds > MAX_DOWNLOAD_TTL_SECONDS) {
    throw new Error(
      `ttlSeconds ${ttlSeconds} exceeds the security ceiling of ${MAX_DOWNLOAD_TTL_SECONDS}s (Roadmap §11).`,
    );
  }

  const command = new GetObjectCommand({
    Bucket: resolveBucketName(bucket),
    Key: key,
  });

  return getSignedUrl(getClient(), command, { expiresIn: ttlSeconds });
}

export interface PutObjectArgs {
  bucket: BucketKey;
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
}

/** Server-side upload to a private R2 bucket. */
export async function putObject({
  bucket,
  key,
  body,
  contentType,
  cacheControl,
  metadata,
}: PutObjectArgs): Promise<void> {
  const input: PutObjectCommandInput = {
    Bucket: resolveBucketName(bucket),
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: cacheControl,
    Metadata: metadata,
  };
  await getClient().send(new PutObjectCommand(input));
}

export interface GetObjectArgs {
  bucket: BucketKey;
  key: string;
}

export interface GetObjectResult {
  body: Uint8Array;
  contentType?: string;
  contentLength?: number;
}

/**
 * Server-side fetch from a private R2 bucket. The body is fully materialized;
 * for very large files prefer streaming via signed URLs + HTTP range requests.
 */
export async function getObject({
  bucket,
  key,
}: GetObjectArgs): Promise<GetObjectResult> {
  const response = await getClient().send(
    new GetObjectCommand({
      Bucket: resolveBucketName(bucket),
      Key: key,
    }),
  );
  const body = response.Body
    ? await response.Body.transformToByteArray()
    : new Uint8Array();
  return {
    body,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
  };
}
