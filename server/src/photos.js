import { query } from "./db.js";
import { publicUrl } from "./storage.js";

// Build a public photo object from a media storage_key (URL shape depends on the storage driver).
export function photoFor(key) {
  return key ? { thumb: publicUrl(`${key}_thumb.webp`), full: publicUrl(`${key}_lg.webp`) } : null;
}

// Attach a `photos` array to each catch row via one follow-up query (portable: no correlated
// subquery, so it runs on Postgres and the in-memory dev DB alike).
export async function attachPhotos(rows) {
  if (!rows.length) return rows.map(r => ({ ...r, photos: [] }));
  const ids = rows.map(r => r.id);
  const ph = ids.map((_, i) => `$${i + 1}`).join(",");
  const { rows: media } = await query(
    `SELECT entity_id, storage_key FROM media
      WHERE entity_type = 'catch_report' AND deleted_at IS NULL AND entity_id IN (${ph})
      ORDER BY id`, ids
  );
  const byId = new Map();
  for (const m of media) {
    const k = String(m.entity_id);
    if (!byId.has(k)) byId.set(k, []);
    byId.get(k).push(m.storage_key);
  }
  return rows.map(r => ({ ...r, photos: (byId.get(String(r.id)) || []).slice(0, 4).map(photoFor) }));
}
