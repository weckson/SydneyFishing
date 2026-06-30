// One-shot fishing-intel ingest against DATABASE_URL, then exit. For manual refresh / cron
// (an alternative to the in-process scheduler or the admin POST /api/intel/run).
//   cd server && npm run ingest
// Honours ANTHROPIC_API_KEY (summarise) and all INGEST_*/DATABASE_URL env from .env.
import "dotenv/config";
import { runIngest } from "./run.js";
import { pool } from "../db.js";

try {
  const r = await runIngest({});
  console.log("[ingest] result:", JSON.stringify(r));
  await pool.end();
  process.exit(r && r.ok === false ? 1 : 0);
} catch (e) {
  console.error("[ingest] fatal:", e.message || e);
  try { await pool.end(); } catch (_) {}
  process.exit(1);
}
