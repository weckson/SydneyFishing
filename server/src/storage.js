import { mkdirSync } from "node:fs";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Pluggable image storage. Two drivers behind one interface (saveImage/publicUrl/deleteImage):
//   - "local" (default): writes to server/uploads and serves via /uploads (cheapest single box)
//   - "s3": S3-compatible object storage. Use Cloudflare R2 (zero egress fees) for the
//     image-heavy community feed — set STORAGE_DRIVER=s3 + the S3_* env vars below.
// The DB only ever stores the key base; publicUrl() decides the URL shape per driver, so
// switching drivers needs no schema or caller changes.
const DRIVER = process.env.STORAGE_DRIVER || "local";

// ---- local driver ----
const here = dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = join(here, "..", "uploads");
if (DRIVER === "local") mkdirSync(UPLOADS_DIR, { recursive: true });

// ---- s3 / R2 driver (lazy: SDK only loaded when actually used) ----
const S3 = {
  endpoint: process.env.S3_ENDPOINT,           // e.g. https://<accountid>.r2.cloudflarestorage.com
  bucket: process.env.S3_BUCKET,
  region: process.env.S3_REGION || "auto",     // R2 uses "auto"
  publicBase: (process.env.S3_PUBLIC_BASE || "").replace(/\/$/, ""), // e.g. https://media.yourdomain
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
};
let _client = null, _PutObjectCommand = null, _DeleteObjectCommand = null;
async function s3client() {
  if (_client) return _client;
  for (const k of ["endpoint", "bucket", "publicBase", "accessKeyId", "secretAccessKey"]) {
    if (!S3[k]) throw new Error(`STORAGE_DRIVER=s3 but S3 config is incomplete (missing ${k})`);
  }
  const { S3Client, PutObjectCommand, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  _PutObjectCommand = PutObjectCommand;
  _DeleteObjectCommand = DeleteObjectCommand;
  _client = new S3Client({
    region: S3.region,
    endpoint: S3.endpoint,
    credentials: { accessKeyId: S3.accessKeyId, secretAccessKey: S3.secretAccessKey }
  });
  return _client;
}

// Keys are server-generated (catch/<uuid>/<hex>_size.webp). Allowlist the safe charset and
// reject anything with traversal, leading slash, or unexpected characters.
function safe(key) {
  const k = String(key).replace(/\\/g, "/");
  if (!/^[A-Za-z0-9._/-]+$/.test(k) || k.includes("..") || k.startsWith("/")) {
    throw new Error("invalid storage key");
  }
  return k;
}

// Public URL the browser fetches. Local => API-relative (client prepends API origin);
// s3 => absolute CDN/public URL (client uses as-is).
export function publicUrl(key) {
  return DRIVER === "s3" ? `${S3.publicBase}/${safe(key)}` : `/uploads/${safe(key)}`;
}

export async function saveImage(key, buffer, contentType = "image/webp") {
  const k = safe(key);
  if (DRIVER === "s3") {
    const c = await s3client();
    await c.send(new _PutObjectCommand({
      Bucket: S3.bucket, Key: k, Body: buffer, ContentType: contentType,
      CacheControl: "public, max-age=604800, immutable"
    }));
  } else {
    const full = join(UPLOADS_DIR, k);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, buffer);
  }
  return publicUrl(k);
}

export async function deleteImage(key) {
  const k = safe(key);
  try {
    if (DRIVER === "s3") {
      const c = await s3client();
      await c.send(new _DeleteObjectCommand({ Bucket: S3.bucket, Key: k }));
    } else {
      await unlink(join(UPLOADS_DIR, k));
    }
  } catch (e) { /* best-effort */ }
}

export const storageDriver = DRIVER;
