import { query } from "../db.js";
import { optionalAuth } from "../auth.js";
import { attachPhotos } from "../photos.js";

// Public "what's biting" insights aggregated from catch reports. Aggregate-only + a recent
// catch feed (public-visibility catches). No exact user GPS is ever exposed — catches are
// tied to named spots, not coordinates.
export default async function insightsRoutes(app) {
  app.get("/", { preHandler: optionalAuth }, async () => {
    const base = `FROM catch_reports c WHERE c.deleted_at IS NULL AND c.visibility = 'public'`;

    const [total, species, spots, recentRows] = await Promise.all([
      query(`SELECT COUNT(*)::int AS n ${base}`),
      query(`SELECT c.species, COUNT(*)::int AS n ${base} AND c.species IS NOT NULL
               GROUP BY c.species ORDER BY n DESC LIMIT 10`),
      query(`SELECT c.spot_id, COUNT(*)::int AS n ${base}
               GROUP BY c.spot_id ORDER BY n DESC LIMIT 8`),
      query(`SELECT c.id, c.spot_id, c.species, c.length_cm, c.weight_kg, c.released,
                     c.created_at, u.display_name AS user_name
                FROM catch_reports c JOIN users u ON u.id = c.user_id
               WHERE c.deleted_at IS NULL AND c.visibility = 'public'
               ORDER BY COALESCE(c.caught_at, c.created_at) DESC LIMIT 24`)
    ]);

    const recent = await attachPhotos(recentRows.rows);
    return {
      totalCatches: total.rows[0]?.n ?? 0,
      topSpecies: species.rows,        // [{ species, n }]
      topSpots: spots.rows,            // [{ spot_id, n }]
      recent                            // [{ ..., photos: [] }]
    };
  });
}
