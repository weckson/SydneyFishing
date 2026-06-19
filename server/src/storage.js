import { mkdirSync } from "node:fs";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Pluggable storage. MVP driver = local disk (cheapest, single-box). To move to S3/R2 later,
// implement the same saveImage()/publicPath surface and switch on an env flag — callers and
// the DB schema (storage_key) don't change.
const here = dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = join(here, "..", "uploads");
mkdirSync(UPLOADS_DIR, { recursive: true });

// Save a processed image buffer under `key` (e.g. "catch/<user>/<id>_lg.webp").
// Returns the public path the PWA can fetch (prefixed with the API origin client-side).
export async function saveImage(key, buffer) {
  const safeKey = key.replace(/\\/g, "/").replace(/\.\.+/g, ""); // no path traversal
  const full = join(UPLOADS_DIR, safeKey);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, buffer);
  return "/uploads/" + safeKey;
}

export async function deleteImage(key) {
  try { await unlink(join(UPLOADS_DIR, key.replace(/\\/g, "/"))); } catch (e) {}
}
