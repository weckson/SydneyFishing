import { config } from "../config.js";
import { query } from "../db.js";
import { runIngest } from "./run.js";

let timer = null;

// Start the periodic ingest. Non-blocking; never crashes the app. Boot run only in prod or when
// INGEST_ON_BOOT=true (keeps dev boots fast/offline-friendly — trigger via POST /api/intel/run).
export function startScheduler(app) {
  if (!config.ingestEnabled) { app.log.info("[ingest] disabled"); return; }
  const intervalMs = Math.max(1, config.ingestIntervalHours) * 3600 * 1000;
  const tick = async () => {
    try { await runIngest({ logger: app.log }); }
    catch (e) { app.log.error("[ingest] tick error " + (e.message || e)); }
  };

  timer = setInterval(tick, intervalMs);
  if (timer.unref) timer.unref();

  if (config.ingestOnBoot) {
    setTimeout(() => {
      query(`SELECT max(started_at) AS last FROM ingest_runs WHERE ok = true`)
        .then(r => {
          const last = r.rows[0] && r.rows[0].last ? new Date(r.rows[0].last).getTime() : 0;
          if (Date.now() - last > intervalMs) tick();
          else app.log.info("[ingest] recent successful run exists, skipping boot run");
        })
        .catch(() => tick());
    }, 8000);
  }
}

export function stopScheduler() { if (timer) clearInterval(timer); timer = null; }
