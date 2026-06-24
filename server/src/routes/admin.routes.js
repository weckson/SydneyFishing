import { query } from "../db.js";
import { requireAdmin } from "../auth.js";

// Moderation backend (admin/moderator only). Lets staff triage user reports and take down
// user-generated content — catch reports (incl. their photos), forum threads and posts.
// Takedown = soft-delete (deleted_at); media rows are also soft-deleted so the public feed/API
// stops serving them. We never HARD-delete here: content is preserved for audit / legal-hold,
// and silently destroying reported material (esp. illegal imagery) is the wrong default.
// This is the minimum moderation surface required before opening photos publicly (DEPLOY.md §12).

const idParam = { type: "object", required: ["id"], properties: { id: { type: "integer" } } };

// Mark all open reports about a given target as resolved (called after a takedown).
async function resolveReportsFor(targetType, targetId) {
  await query(
    `UPDATE forum_reports SET status='resolved' WHERE target_type=$1 AND target_id=$2 AND status='open'`,
    [targetType, targetId]
  );
}

// A short, safe preview of the reported content so staff can judge without leaving the panel.
async function previewFor(type, id) {
  try {
    if (type === "catch_report") {
      const { rows } = await query(
        `SELECT c.species, c.notes, c.spot_id, c.deleted_at, u.display_name AS author
           FROM catch_reports c JOIN users u ON u.id = c.user_id WHERE c.id = $1`, [id]);
      if (!rows[0]) return { kind: "catch", gone: true };
      const c = rows[0];
      return {
        kind: "catch", author: c.author, spotId: c.spot_id,
        text: [c.species, c.notes].filter(Boolean).join(" · ").slice(0, 240),
        removed: !!c.deleted_at
      };
    }
    if (type === "thread") {
      const { rows } = await query(`SELECT title, deleted_at FROM forum_threads WHERE id = $1`, [id]);
      if (!rows[0]) return { kind: "thread", gone: true };
      return { kind: "thread", text: rows[0].title, removed: !!rows[0].deleted_at };
    }
    if (type === "post") {
      const { rows } = await query(`SELECT body, deleted_at FROM forum_posts WHERE id = $1`, [id]);
      if (!rows[0]) return { kind: "post", gone: true };
      return { kind: "post", text: (rows[0].body || "").slice(0, 240), removed: !!rows[0].deleted_at };
    }
  } catch (e) { /* fall through to a bare preview */ }
  return { kind: type, text: "" };
}

export default async function adminRoutes(app) {
  // Every route in this plugin is admin/moderator-gated.
  app.addHook("preHandler", requireAdmin);

  // ---- open reports, newest first, each with a content preview ----
  app.get("/reports", async () => {
    const { rows: reports } = await query(
      `SELECT r.id, r.target_type, r.target_id, r.reason, r.detail, r.status, r.created_at,
              u.display_name AS reporter_name
         FROM forum_reports r JOIN users u ON u.id = r.reporter_id
        WHERE r.status = 'open'
        ORDER BY r.created_at DESC LIMIT 200`
    );
    for (const r of reports) r.preview = await previewFor(r.target_type, r.target_id);
    return { reports };
  });

  // ---- dismiss a report without acting on the content ----
  app.post("/reports/:id/resolve", { schema: { params: idParam } }, async (req) => {
    await query(`UPDATE forum_reports SET status='resolved' WHERE id=$1`, [req.params.id]);
    return { ok: true };
  });

  // ---- take down a catch report (+ its photos) ----
  app.delete("/catches/:id", { schema: { params: idParam } }, async (req, reply) => {
    const r = await query(`UPDATE catch_reports SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL`, [req.params.id]);
    await query(`UPDATE media SET deleted_at=now() WHERE entity_type='catch_report' AND entity_id=$1 AND deleted_at IS NULL`, [req.params.id]);
    await resolveReportsFor("catch_report", req.params.id);
    if (!r.rowCount) return reply.code(404).send({ error: "not_found" });
    return { ok: true };
  });

  // ---- take down a forum thread ----
  app.delete("/threads/:id", { schema: { params: idParam } }, async (req, reply) => {
    const r = await query(`UPDATE forum_threads SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL`, [req.params.id]);
    await resolveReportsFor("thread", req.params.id);
    if (!r.rowCount) return reply.code(404).send({ error: "not_found" });
    return { ok: true };
  });

  // ---- take down a forum post ----
  app.delete("/posts/:id", { schema: { params: idParam } }, async (req, reply) => {
    const r = await query(`UPDATE forum_posts SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL`, [req.params.id]);
    await resolveReportsFor("post", req.params.id);
    if (!r.rowCount) return reply.code(404).send({ error: "not_found" });
    return { ok: true };
  });
}
