import { query } from "../db.js";
import { requireAuth } from "../auth.js";
import { attachPhotos, photoFor } from "../photos.js";

// A catch report. The client sends conditions_snapshot = the exact factor decomposition
// the scoring engine produced at catch time (see app.js scoreSpot). We store it verbatim;
// it is the training signal for later scoring calibration and must not be reconstructed.
// Photos are attached as a `photos` array (up to 4) via the shared helper in photos.js.

export default async function catchRoutes(app) {
  // ---- list public catch reports for a spot ----
  app.get("/", {
    schema: { querystring: { type: "object", required: ["spotId"], properties: { spotId: { type: "string", maxLength: 80 } } } }
  }, async (req) => {
    const { rows } = await query(
      `SELECT c.id, c.spot_id, c.species, c.length_cm, c.weight_kg, c.kept, c.released,
              c.technique, c.bait, c.notes, c.body_lang, c.caught_at, c.engine_version,
              c.like_count, c.created_at, u.display_name AS user_name
         FROM catch_reports c JOIN users u ON u.id = c.user_id
        WHERE c.spot_id = $1 AND c.visibility = 'public' AND c.deleted_at IS NULL
        ORDER BY COALESCE(c.caught_at, c.created_at) DESC LIMIT 100`,
      [req.query.spotId]
    );
    return { catches: await attachPhotos(rows) };
  });

  // ---- my catch reports ----
  app.get("/mine", { preHandler: requireAuth }, async (req) => {
    const { rows } = await query(
      `SELECT c.id, c.spot_id, c.species, c.length_cm, c.weight_kg, c.kept, c.released,
              c.technique, c.bait, c.notes, c.body_lang, c.caught_at, c.engine_version,
              c.visibility, c.created_at
         FROM catch_reports c
        WHERE c.user_id = $1 AND c.deleted_at IS NULL
        ORDER BY COALESCE(c.caught_at, c.created_at) DESC LIMIT 200`,
      [req.user.id]
    );
    return { catches: await attachPhotos(rows) };
  });

  // ---- create a catch report (auth) ----
  app.post("/", {
    preHandler: requireAuth,
    schema: {
      body: {
        type: "object", required: ["spotId", "conditionsSnapshot"], additionalProperties: false,
        properties: {
          spotId: { type: "string", maxLength: 80 },
          species: { type: "string", maxLength: 60 },
          lengthCm: { type: "number", minimum: 0, maximum: 500 },
          weightKg: { type: "number", minimum: 0, maximum: 500 },
          kept: { type: "boolean" },
          released: { type: "boolean" },
          technique: { type: "string", maxLength: 120 },
          bait: { type: "string", maxLength: 120 },
          notes: { type: "string", maxLength: 2000 },
          bodyLang: { type: "string", enum: ["zh", "en"] },
          caughtAt: { type: "string", maxLength: 40 },
          visibility: { type: "string", enum: ["public", "private"] },
          conditionsSnapshot: { type: "object", additionalProperties: true },
          engineVersion: { type: "string", maxLength: 20 },
          mediaIds: { type: "array", maxItems: 4, items: { type: "integer" } }
        }
      }
    }
  }, async (req, reply) => {
    const b = req.body;
    const caughtAt = b.caughtAt && !isNaN(new Date(b.caughtAt)) ? new Date(b.caughtAt) : new Date();
    const engineVersion = b.engineVersion || b.conditionsSnapshot?.engineVersion || null;
    const { rows } = await query(
      `INSERT INTO catch_reports
         (user_id, spot_id, species, length_cm, weight_kg, kept, released, technique, bait,
          notes, body_lang, caught_at, conditions_snapshot, engine_version, visibility)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15)
       RETURNING id, spot_id, species, length_cm, weight_kg, kept, released, technique, bait,
                 notes, body_lang, caught_at, engine_version, visibility, created_at`,
      [req.user.id, b.spotId, b.species || null, b.lengthCm ?? null, b.weightKg ?? null,
       b.kept ?? null, b.released ?? null, b.technique || null, b.bait || null, b.notes || null,
       b.bodyLang || "zh", caughtAt, JSON.stringify(b.conditionsSnapshot), engineVersion,
       b.visibility || "public"]
    );
    const created = rows[0];

    // Link the user's just-uploaded media to this catch (ownership-checked, only if unlinked).
    if (Array.isArray(b.mediaIds)) {
      for (const mid of b.mediaIds.slice(0, 4)) {
        await query(
          `UPDATE media SET entity_type = 'catch_report', entity_id = $1
            WHERE id = $2 AND owner_id = $3 AND entity_id IS NULL AND deleted_at IS NULL`,
          [created.id, mid, req.user.id]
        );
      }
    }

    // Return the photos (if any) so the client can render them immediately.
    const { rows: pr } = await query(
      `SELECT storage_key FROM media
        WHERE entity_type = 'catch_report' AND entity_id = $1 AND deleted_at IS NULL
        ORDER BY id`, [created.id]
    );
    const out = { ...created, user_name: req.user.display_name, photos: pr.slice(0, 4).map(m => photoFor(m.storage_key)) };
    return reply.code(201).send({ catch: out });
  });

  // ---- report a catch report for moderation (auth) ----
  // Reuses the generic forum_reports table (target_type='catch_report'). One open report per
  // user per catch (idempotent). Admins triage these via /api/admin/reports. See DEPLOY.md §12.
  app.post("/:id/report", {
    preHandler: requireAuth,
    config: { rateLimit: { max: 10, timeWindow: "10 minutes" } },
    schema: {
      params: { type: "object", required: ["id"], properties: { id: { type: "integer" } } },
      body: {
        type: "object", required: ["reason"], additionalProperties: false,
        properties: { reason: { type: "string", minLength: 1, maxLength: 40 }, detail: { type: "string", maxLength: 500 } }
      }
    }
  }, async (req, reply) => {
    const c = await query(`SELECT id FROM catch_reports WHERE id = $1 AND deleted_at IS NULL`, [req.params.id]);
    if (!c.rowCount) return reply.code(404).send({ error: "not_found" });
    const dup = await query(
      `SELECT 1 FROM forum_reports WHERE reporter_id=$1 AND target_type='catch_report' AND target_id=$2 AND status='open' LIMIT 1`,
      [req.user.id, req.params.id]
    );
    if (dup.rowCount) return { ok: true, already: true };
    await query(
      `INSERT INTO forum_reports (reporter_id, target_type, target_id, reason, detail)
       VALUES ($1,'catch_report',$2,$3,$4)`,
      [req.user.id, req.params.id, req.body.reason, req.body.detail || null]
    );
    return { ok: true };
  });

  // ---- soft-delete own catch report (auth + ownership) ----
  app.delete("/:id", {
    preHandler: requireAuth,
    schema: { params: { type: "object", required: ["id"], properties: { id: { type: "integer" } } } }
  }, async (req, reply) => {
    const r = await query(
      `UPDATE catch_reports SET deleted_at = now()
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [req.params.id, req.user.id]
    );
    if (r.rowCount === 0) return reply.code(404).send({ error: "not_found" });
    return { ok: true };
  });
}
