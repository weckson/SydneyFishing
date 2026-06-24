import { query } from "../db.js";
import { optionalAuth } from "../auth.js";
import { attachPhotos } from "../photos.js";

// Public "what's biting" insights aggregated from catch reports. Aggregate-only + a recent
// catch feed (public-visibility catches). No exact user GPS is ever exposed — catches are
// tied to named spots, not coordinates.
//
// 真·周报 / weekly report: windowDays (7|14|30, default 7) windows on caught_at/created_at so
// "本周鱼讯" actually means the last 7 days. Region grouping is done client-side (the server
// deliberately does not hold the 205-spot dataset), so topSpots returns enough rows to fold.
const WINDOW_SCHEMA = {
  querystring: {
    type: "object",
    properties: { windowDays: { type: "integer", enum: [7, 14, 30] } }
  }
};

export default async function insightsRoutes(app) {
  app.get("/", { preHandler: optionalAuth, schema: WINDOW_SCHEMA }, async (req) => {
    const windowDays = req.query.windowDays || 7;
    // pg-mem-safe: compute the cutoff in JS rather than SQL interval arithmetic.
    const cutoff = new Date(Date.now() - windowDays * 86400000);
    const base = `FROM catch_reports c
      WHERE c.deleted_at IS NULL AND c.visibility = 'public'
        AND COALESCE(c.caught_at, c.created_at) >= $1`;

    const [total, species, spots, recentRows] = await Promise.all([
      query(`SELECT COUNT(*)::int AS n ${base}`, [cutoff]),
      query(`SELECT c.species, COUNT(*)::int AS n ${base} AND c.species IS NOT NULL
               GROUP BY c.species ORDER BY n DESC LIMIT 10`, [cutoff]),
      // Higher LIMIT so the client can fold per-spot counts into regions for the weekly report.
      query(`SELECT c.spot_id, COUNT(*)::int AS n ${base}
               GROUP BY c.spot_id ORDER BY n DESC LIMIT 50`, [cutoff]),
      query(`SELECT c.id, c.spot_id, c.species, c.length_cm, c.weight_kg, c.released,
                     c.created_at, u.display_name AS user_name
                FROM catch_reports c JOIN users u ON u.id = c.user_id
               WHERE c.deleted_at IS NULL AND c.visibility = 'public'
                 AND COALESCE(c.caught_at, c.created_at) >= $1
               ORDER BY COALESCE(c.caught_at, c.created_at) DESC LIMIT 24`, [cutoff])
    ]);

    const recent = await attachPhotos(recentRows.rows);
    return {
      windowDays,
      totalCatches: total.rows[0]?.n ?? 0,
      topSpecies: species.rows,        // [{ species, n }]
      topSpots: spots.rows,            // [{ spot_id, n }]
      recent                            // [{ ..., photos: [] }]
    };
  });
}
