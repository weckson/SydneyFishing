import { query } from "../db.js";
import { requireAuth, optionalAuth, isModerator } from "../auth.js";

const REACTABLE = { thread: "forum_threads", post: "forum_posts" };

// Which of (thread + its posts) the current user has liked. Avoids correlated subqueries
// (portable to the in-memory dev DB).
async function likedSet(userId, threadId, postIds) {
  const set = new Set();
  if (!userId) return set;
  const t = await query(
    `SELECT 1 FROM reactions WHERE user_id=$1 AND target_type='thread' AND target_id=$2 LIMIT 1`,
    [userId, threadId]
  );
  if (t.rowCount) set.add("thread:" + threadId);
  if (postIds.length) {
    const ph = postIds.map((_, i) => `$${i + 2}`).join(",");
    const r = await query(
      `SELECT target_id FROM reactions WHERE user_id=$1 AND target_type='post' AND target_id IN (${ph})`,
      [userId, ...postIds]
    );
    for (const row of r.rows) set.add("post:" + String(row.target_id));
  }
  return set;
}

export default async function forumRoutes(app) {
  // ---- list boards (with thread counts) ----
  app.get("/categories", async () => {
    const { rows: cats } = await query(
      `SELECT id, slug, name, name_cn, descr_cn, sort FROM forum_categories ORDER BY sort, id`
    );
    const { rows: counts } = await query(
      `SELECT category_id, COUNT(*)::int AS n FROM forum_threads WHERE deleted_at IS NULL GROUP BY category_id`
    );
    const byCat = new Map(counts.map(c => [String(c.category_id), c.n]));
    return { categories: cats.map(c => ({ ...c, threadCount: byCat.get(String(c.id)) || 0 })) };
  });

  // ---- list threads in a category ----
  app.get("/threads", {
    schema: { querystring: { type: "object", required: ["categoryId"], properties: { categoryId: { type: "integer" } } } }
  }, async (req) => {
    const { rows } = await query(
      `SELECT t.id, t.title, t.spot_id, t.is_pinned, t.is_locked, t.reply_count, t.like_count,
              t.last_post_at, t.created_at, u.display_name AS author_name
         FROM forum_threads t JOIN users u ON u.id = t.author_id
        WHERE t.category_id = $1 AND t.deleted_at IS NULL
        ORDER BY t.is_pinned DESC, t.last_post_at DESC LIMIT 100`,
      [req.query.categoryId]
    );
    return { threads: rows };
  });

  // ---- thread + posts ----
  app.get("/threads/:id", {
    preHandler: optionalAuth,
    schema: { params: { type: "object", required: ["id"], properties: { id: { type: "integer" } } } }
  }, async (req, reply) => {
    const { rows: tr } = await query(
      `SELECT t.id, t.category_id, t.title, t.spot_id, t.is_locked, t.reply_count, t.like_count,
              t.created_at, u.display_name AS author_name, t.author_id
         FROM forum_threads t JOIN users u ON u.id = t.author_id
        WHERE t.id = $1 AND t.deleted_at IS NULL`,
      [req.params.id]
    );
    const thread = tr[0];
    if (!thread) return reply.code(404).send({ error: "not_found" });
    const { rows: posts } = await query(
      `SELECT p.id, p.body, p.body_lang, p.is_op, p.like_count, p.created_at,
              u.display_name AS author_name, p.author_id
         FROM forum_posts p JOIN users u ON u.id = p.author_id
        WHERE p.thread_id = $1 AND p.deleted_at IS NULL
        ORDER BY p.is_op DESC, p.created_at ASC LIMIT 500`,
      [req.params.id]
    );
    const uid = req.user?.id;
    const mod = isModerator(req.user);
    const liked = await likedSet(uid, thread.id, posts.map(p => p.id));
    const canDel = authorId => mod || (uid && String(authorId) === String(uid));
    return {
      isModerator: mod,
      thread: {
        ...thread,
        liked: liked.has("thread:" + thread.id),
        canDelete: canDel(thread.author_id)
      },
      posts: posts.map(p => ({
        id: p.id, body: p.body, body_lang: p.body_lang, is_op: p.is_op,
        like_count: p.like_count, created_at: p.created_at, author_name: p.author_name,
        liked: liked.has("post:" + String(p.id)),
        canDelete: canDel(p.author_id)
      }))
    };
  });

  // ---- create thread (+ opening post) ----
  app.post("/threads", {
    preHandler: requireAuth,
    schema: {
      body: {
        type: "object", required: ["categoryId", "title", "body"], additionalProperties: false,
        properties: {
          categoryId: { type: "integer" },
          title: { type: "string", minLength: 2, maxLength: 140 },
          body: { type: "string", minLength: 1, maxLength: 8000 },
          spotId: { type: "string", maxLength: 80 },
          bodyLang: { type: "string", enum: ["zh", "en"] }
        }
      }
    }
  }, async (req, reply) => {
    const b = req.body;
    const cat = await query(`SELECT id FROM forum_categories WHERE id=$1`, [b.categoryId]);
    if (!cat.rowCount) return reply.code(400).send({ error: "bad_category" });
    const { rows } = await query(
      `INSERT INTO forum_threads (category_id, author_id, title, spot_id)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [b.categoryId, req.user.id, b.title, b.spotId || null]
    );
    const threadId = rows[0].id;
    await query(
      `INSERT INTO forum_posts (thread_id, author_id, body, body_lang, is_op)
       VALUES ($1,$2,$3,$4,true)`,
      [threadId, req.user.id, b.body, b.bodyLang || "zh"]
    );
    return reply.code(201).send({ id: threadId });
  });

  // ---- reply ----
  app.post("/threads/:id/posts", {
    preHandler: requireAuth,
    schema: {
      params: { type: "object", required: ["id"], properties: { id: { type: "integer" } } },
      body: { type: "object", required: ["body"], additionalProperties: false,
        properties: { body: { type: "string", minLength: 1, maxLength: 8000 }, bodyLang: { type: "string", enum: ["zh", "en"] } } }
    }
  }, async (req, reply) => {
    const t = await query(`SELECT id, is_locked, author_id, title FROM forum_threads WHERE id=$1 AND deleted_at IS NULL`, [req.params.id]);
    if (!t.rowCount) return reply.code(404).send({ error: "not_found" });
    if (t.rows[0].is_locked) return reply.code(403).send({ error: "locked", message: "该主题已锁定" });
    const { rows } = await query(
      `INSERT INTO forum_posts (thread_id, author_id, body, body_lang, is_op)
       VALUES ($1,$2,$3,$4,false) RETURNING id, body, body_lang, like_count, created_at`,
      [req.params.id, req.user.id, req.body.body, req.body.bodyLang || "zh"]
    );
    await query(`UPDATE forum_threads SET reply_count = reply_count + 1, last_post_at = now() WHERE id=$1`, [req.params.id]);

    // Notify the thread author of the reply (unless they replied to themselves).
    const threadAuthor = t.rows[0].author_id;
    if (String(threadAuthor) !== String(req.user.id)) {
      await query(
        `INSERT INTO notifications (user_id, type, actor_name, thread_id, post_id, title)
         VALUES ($1,'reply',$2,$3,$4,$5)`,
        [threadAuthor, req.user.display_name || "钓友", req.params.id, rows[0].id, t.rows[0].title]
      );
    }
    return reply.code(201).send({ post: { ...rows[0], is_op: false, author_name: req.user.display_name, liked: false, canDelete: true } });
  });

  // ---- toggle a like ----
  app.post("/react", {
    preHandler: requireAuth,
    schema: {
      body: { type: "object", required: ["targetType", "targetId"], additionalProperties: false,
        properties: { targetType: { type: "string", enum: ["thread", "post"] }, targetId: { type: "integer" } } }
    }
  }, async (req, reply) => {
    const { targetType, targetId } = req.body;
    const table = REACTABLE[targetType];
    const existing = await query(
      `SELECT id FROM reactions WHERE user_id=$1 AND target_type=$2 AND target_id=$3 AND kind='like'`,
      [req.user.id, targetType, targetId]
    );
    let liked;
    if (existing.rowCount) {
      await query(`DELETE FROM reactions WHERE id=$1`, [existing.rows[0].id]);
      await query(`UPDATE ${table} SET like_count = GREATEST(0, like_count - 1) WHERE id=$1`, [targetId]);
      liked = false;
    } else {
      await query(
        `INSERT INTO reactions (user_id, target_type, target_id, kind) VALUES ($1,$2,$3,'like')`,
        [req.user.id, targetType, targetId]
      );
      await query(`UPDATE ${table} SET like_count = like_count + 1 WHERE id=$1`, [targetId]);
      liked = true;
    }
    const { rows } = await query(`SELECT like_count FROM ${table} WHERE id=$1`, [targetId]);
    return { liked, count: rows[0]?.like_count ?? 0 };
  });

  // ---- report ----
  app.post("/report", {
    preHandler: requireAuth,
    schema: {
      body: { type: "object", required: ["targetType", "targetId", "reason"], additionalProperties: false,
        properties: {
          targetType: { type: "string", enum: ["thread", "post"] },
          targetId: { type: "integer" },
          reason: { type: "string", maxLength: 40 },
          detail: { type: "string", maxLength: 500 }
        } }
    }
  }, async (req) => {
    await query(
      `INSERT INTO forum_reports (reporter_id, target_type, target_id, reason, detail)
       VALUES ($1,$2,$3,$4,$5)`,
      [req.user.id, req.body.targetType, req.body.targetId, req.body.reason, req.body.detail || null]
    );
    return { ok: true };
  });

  // ---- soft-delete own thread / post ----
  app.delete("/threads/:id", {
    preHandler: requireAuth,
    schema: { params: { type: "object", required: ["id"], properties: { id: { type: "integer" } } } }
  }, async (req, reply) => {
    const r = isModerator(req.user)
      ? await query(`UPDATE forum_threads SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL`, [req.params.id])
      : await query(`UPDATE forum_threads SET deleted_at=now() WHERE id=$1 AND author_id=$2 AND deleted_at IS NULL`, [req.params.id, req.user.id]);
    if (!r.rowCount) return reply.code(404).send({ error: "not_found" });
    return { ok: true };
  });
  app.delete("/posts/:id", {
    preHandler: requireAuth,
    schema: { params: { type: "object", required: ["id"], properties: { id: { type: "integer" } } } }
  }, async (req, reply) => {
    const r = isModerator(req.user)
      ? await query(`UPDATE forum_posts SET deleted_at=now() WHERE id=$1 AND is_op=false AND deleted_at IS NULL`, [req.params.id])
      : await query(`UPDATE forum_posts SET deleted_at=now() WHERE id=$1 AND author_id=$2 AND is_op=false AND deleted_at IS NULL`, [req.params.id, req.user.id]);
    if (!r.rowCount) return reply.code(404).send({ error: "not_found", message: "无法删除（主楼请删整帖）" });
    return { ok: true };
  });
}
