import { query } from "../db.js";
import { optionalAuth, requireAdmin } from "../auth.js";
import { runIngest, isRunning } from "../ingest/run.js";

// Read-only fishing-intel feed produced by the server-side ingest harness, plus an admin trigger.
export default async function intelRoutes(app) {
  // Public feed. Filter by scopeType/scopeKey/kind; `species` is sugar for scopeType=species.
  app.get("/", {
    preHandler: optionalAuth,
    schema: { querystring: { type: "object", properties: {
      scopeType: { type: "string", maxLength: 20 },
      scopeKey: { type: "string", maxLength: 60 },
      species: { type: "string", maxLength: 60 },
      kind: { type: "string", maxLength: 20 },
      limit: { type: "integer", minimum: 1, maximum: 100 }
    } } }
  }, async (req) => {
    const q = req.query;
    let scopeType = q.scopeType, scopeKey = q.scopeKey;
    if (q.species) { scopeType = "species"; scopeKey = q.species; }
    const where = ["1=1"];
    const params = [];
    if (scopeType) { params.push(scopeType); where.push(`scope_type = $${params.length}`); }
    if (scopeKey) { params.push(scopeKey); where.push(`scope_key = $${params.length}`); }
    if (q.kind) { params.push(q.kind); where.push(`kind = $${params.length}`); }
    const limit = q.limit || 30; // schema-validated integer; safe to inline
    const { rows } = await query(
      `SELECT id, scope_type, scope_key, kind, title, title_cn, summary, summary_cn, source_url, source_name, fetched_at
         FROM fishing_intel WHERE ${where.join(" AND ")}
         ORDER BY fetched_at DESC LIMIT ${limit}`, params
    );
    return { items: rows };
  });

  app.get("/status", async () => {
    const [cnt, run] = await Promise.all([
      query(`SELECT COUNT(*)::int AS n FROM fishing_intel`),
      query(`SELECT started_at, finished_at, ok, items_added FROM ingest_runs ORDER BY id DESC LIMIT 1`)
    ]);
    return { total: cnt.rows[0] ? cnt.rows[0].n : 0, lastRun: run.rows[0] || null, running: isRunning() };
  });

  // Admin-only: trigger an ingest run on demand.
  app.post("/run", { preHandler: requireAdmin }, async () => runIngest({ logger: app.log }));
}
