import { query } from "../db.js";
import { optionalAuth } from "../auth.js";
import { attachPhotos } from "../photos.js";

// Online-only competitions (SCOPE.md): a competition is just a time window + species filter over
// PUBLIC catch_reports; the leaderboard is a query. There is NO submission flow (logging a public
// catch in-window IS entering), no events, no RSVPs, no location gathering. Read-only routes only.
export default async function competitionsRoutes(app) {
  const COMP_COLS = `id, slug, title, name_cn, descr_cn, species, metric, region_id, starts_at, ends_at`;

  // List competitions with a JS-computed status (active | upcoming | ended); active first.
  app.get("/", { preHandler: optionalAuth }, async () => {
    const { rows } = await query(`SELECT ${COMP_COLS} FROM competitions ORDER BY ends_at DESC`);
    const now = Date.now();
    const rank = { active: 0, upcoming: 1, ended: 2 };
    const competitions = rows
      .map(c => {
        const s = new Date(c.starts_at).getTime();
        const e = new Date(c.ends_at).getTime();
        return { ...c, status: now < s ? "upcoming" : now >= e ? "ended" : "active" };
      })
      .sort((a, b) => rank[a.status] - rank[b.status]);
    return { competitions };
  });

  // Leaderboard: best public catches in-window matching the competition's species + metric.
  app.get("/:id/leaderboard", {
    preHandler: optionalAuth,
    schema: { params: { type: "object", properties: { id: { type: "integer" } }, required: ["id"] } }
  }, async (req, reply) => {
    const compRes = await query(`SELECT ${COMP_COLS} FROM competitions WHERE id = $1`, [req.params.id]);
    const comp = compRes.rows[0];
    if (!comp) { reply.code(404); return { error: "not_found" }; }

    const metric = comp.metric === "weight" ? "weight" : "length";
    const metricCol = metric === "weight" ? "c.weight_kg" : "c.length_cm"; // fixed allowlist, not user input

    // Build params; add the species filter only when set (avoids NULL-cast issues on pg-mem).
    const params = [new Date(comp.starts_at), new Date(comp.ends_at)];
    let speciesClause = "";
    if (comp.species) { params.push(comp.species); speciesClause = `AND c.species = $${params.length}`; }

    const { rows } = await query(
      `SELECT c.id, c.spot_id, c.species, c.length_cm, c.weight_kg, c.caught_at, c.user_id,
              u.display_name AS user_name
         FROM catch_reports c JOIN users u ON u.id = c.user_id
        WHERE c.deleted_at IS NULL AND c.visibility = 'public'
          AND COALESCE(c.caught_at, c.created_at) >= $1
          AND COALESCE(c.caught_at, c.created_at) <  $2
          ${speciesClause}
          AND ${metricCol} IS NOT NULL
        ORDER BY ${metricCol} DESC
        LIMIT 100`,
      params
    );

    // One best entry per angler (fairness), preserving the metric-desc order.
    const seen = new Set();
    const top = [];
    for (const r of rows) {
      if (seen.has(r.user_id)) continue;
      seen.add(r.user_id);
      top.push(r);
      if (top.length >= 50) break;
    }
    const withPhotos = await attachPhotos(top);
    const entries = withPhotos.map(({ user_id, ...rest }) => rest); // strip internal id
    return { competition: { ...comp, metric }, entries };
  });
}
