import { query } from "../db.js";
import { requireAuth } from "../auth.js";

export default async function notificationRoutes(app) {
  // list recent notifications + unread count
  app.get("/", { preHandler: requireAuth }, async (req) => {
    const { rows } = await query(
      `SELECT id, type, actor_name, thread_id, post_id, title, read_at, created_at
         FROM notifications WHERE user_id = $1
        ORDER BY created_at DESC LIMIT 30`,
      [req.user.id]
    );
    const unread = rows.filter(n => !n.read_at).length;
    // unread may exceed the 30-row window; get an authoritative count too.
    const { rows: uc } = await query(
      `SELECT COUNT(*)::int AS n FROM notifications WHERE user_id=$1 AND read_at IS NULL`,
      [req.user.id]
    );
    return { notifications: rows, unread: uc[0]?.n ?? unread };
  });

  // unread count only (cheap, for the header badge)
  app.get("/unread", { preHandler: requireAuth }, async (req) => {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS n FROM notifications WHERE user_id=$1 AND read_at IS NULL`,
      [req.user.id]
    );
    return { unread: rows[0]?.n ?? 0 };
  });

  // mark all as read
  app.post("/read", { preHandler: requireAuth }, async (req) => {
    await query(`UPDATE notifications SET read_at = now() WHERE user_id=$1 AND read_at IS NULL`, [req.user.id]);
    return { ok: true };
  });
}
