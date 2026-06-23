import crypto from "node:crypto";
import { query } from "../db.js";
import { requireAuth, optionalAuth, isModerator } from "../auth.js";

const importHash = (userId, spotId, date, text) =>
  crypto.createHash("sha256").update([userId, spotId, date, text].join("")).digest("hex");

export default async function reviewRoutes(app) {
  // ---- list reviews for a spot (public; canDelete computed for the current user) ----
  app.get("/", {
    preHandler: optionalAuth,
    schema: { querystring: { type: "object", required: ["spotId"], properties: { spotId: { type: "string", maxLength: 80 } } } }
  }, async (req) => {
    const { rows } = await query(
      `SELECT r.id, r.spot_id, r.user_id, r.rating, r.body, r.body_lang, r.source_url, r.source_name,
              r.source, r.created_at, u.display_name AS user_name
         FROM reviews r LEFT JOIN users u ON u.id = r.user_id
        WHERE r.spot_id = $1 AND r.deleted_at IS NULL
        ORDER BY r.created_at DESC LIMIT 200`,
      [req.query.spotId]
    );
    const uid = req.user?.id;
    const mod = isModerator(req.user);
    const reviews = rows.map(({ user_id, ...r }) => ({
      ...r, canDelete: mod || (uid && String(user_id) === String(uid))
    }));
    return { reviews };
  });

  // ---- soft-delete a review (owner or moderator) ----
  app.delete("/:id", {
    preHandler: requireAuth,
    schema: { params: { type: "object", required: ["id"], properties: { id: { type: "integer" } } } }
  }, async (req, reply) => {
    const r = isModerator(req.user)
      ? await query(`UPDATE reviews SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL`, [req.params.id])
      : await query(`UPDATE reviews SET deleted_at=now() WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL`, [req.params.id, req.user.id]);
    if (!r.rowCount) return reply.code(404).send({ error: "not_found" });
    return { ok: true };
  });

  // ---- create a review (auth) ----
  app.post("/", {
    preHandler: requireAuth,
    schema: {
      body: {
        type: "object", required: ["spotId", "rating", "body"], additionalProperties: false,
        properties: {
          spotId: { type: "string", maxLength: 80 },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          body: { type: "string", minLength: 1, maxLength: 2000 },
          bodyLang: { type: "string", enum: ["zh", "en"] },
          sourceUrl: { type: "string", maxLength: 500 },
          sourceName: { type: "string", maxLength: 80 }
        }
      }
    }
  }, async (req, reply) => {
    const b = req.body;
    const { rows } = await query(
      `INSERT INTO reviews (spot_id, user_id, rating, body, body_lang, source_url, source_name, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'user')
       RETURNING id, spot_id, rating, body, body_lang, source_url, source_name, source, created_at`,
      [b.spotId, req.user.id, b.rating, b.body, b.bodyLang || "zh", b.sourceUrl || null, b.sourceName || null]
    );
    return reply.code(201).send({ review: { ...rows[0], user_name: req.user.display_name } });
  });

  // ---- import localStorage reviews (auth, idempotent, non-destructive) ----
  // Accepts the existing sf_reviews_v1 shape flattened to a list. Server forces user_id
  // from the session, clamps fields, and dedupes by a server-computed hash.
  app.post("/import", {
    preHandler: requireAuth,
    schema: {
      body: {
        type: "object", required: ["items"], additionalProperties: false,
        properties: {
          items: {
            type: "array", maxItems: 500,
            items: {
              type: "object", required: ["spotId", "rating", "text"], additionalProperties: true,
              properties: {
                spotId: { type: "string", maxLength: 80 },
                rating: { type: "integer", minimum: 1, maximum: 5 },
                text: { type: "string", minLength: 1, maxLength: 2000 },
                date: { type: "string", maxLength: 40 },
                lang: { type: "string", enum: ["zh", "en"] },
                sourceUrl: { type: "string", maxLength: 500 },
                sourceName: { type: "string", maxLength: 80 }
              }
            }
          }
        }
      }
    }
  }, async (req) => {
    let imported = 0, skipped = 0;
    for (const it of req.body.items) {
      const date = (it.date || "").slice(0, 40);
      const hash = importHash(req.user.id, it.spotId, date, it.text);
      const createdAt = /^\d{4}-\d{2}-\d{2}/.test(date) ? new Date(date) : new Date();
      const r = await query(
        `INSERT INTO reviews (spot_id, user_id, rating, body, body_lang, source_url, source_name, source, import_hash, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'local_import',$8,$9)
         ON CONFLICT (import_hash) DO NOTHING
         RETURNING id`,
        [it.spotId, req.user.id, it.rating, it.text, it.lang || "zh",
         it.sourceUrl || null, it.sourceName || null, hash, isNaN(createdAt) ? new Date() : createdAt]
      );
      if (r.rowCount > 0) imported++; else skipped++;
    }
    return { imported, skipped };
  });
}
