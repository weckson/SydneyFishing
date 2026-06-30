import crypto from "node:crypto";
import { query } from "../db.js";
import { config } from "../config.js";
import { allSources } from "./sources.js";
import { fetchText } from "./fetcher.js";
import { summarize } from "./summarize.js";

const hash = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 40);

let running = false;
export function isRunning() { return running; }

// One ingest pass: upsert every source as an intel item; fetch + AI-summarise the official
// pages when an LLM key is configured. Idempotent via dedup_hash. Never throws to the caller.
export async function runIngest({ logger } = {}) {
  if (running) return { skipped: true };
  running = true;
  const log = (m) => { try { (logger ? logger.info.bind(logger) : console.log)("[ingest] " + m); } catch (e) {} };
  const runRes = await query(`INSERT INTO ingest_runs (started_at) VALUES (now()) RETURNING id`);
  const runId = runRes.rows[0].id;
  let processed = 0, summarized = 0;
  try {
    const sources = allSources();
    const useLLM = !!config.anthropicApiKey;
    log(`${sources.length} sources, LLM ${useLLM ? "on" : "off"}`);
    for (const s of sources) {
      let summaryCn = null, summary = null;
      if (s.fetch && useLLM) {
        const text = await fetchText(s.url);
        if (text) { const sum = await summarize(text, s); if (sum) { summaryCn = sum.summaryCn; summary = sum.summary; } }
      }
      const scopeType = s.scopeType || "global";
      const scopeKey = s.scopeKey || "";
      const title = s.title || s.name;
      const dedup = hash([s.url, title, scopeType, scopeKey].join("|"));
      // ON CONFLICT DO NOTHING keeps this portable (pg + pg-mem); refresh summary separately.
      await query(
        `INSERT INTO fishing_intel (dedup_hash, scope_type, scope_key, kind, title, title_cn, summary, summary_cn, source_url, source_name, lang)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (dedup_hash) DO NOTHING`,
        [dedup, scopeType, scopeKey, s.kind, title, s.titleCn || null, summary, summaryCn, s.url, s.name, "zh"]
      );
      if (summary || summaryCn) {
        await query(`UPDATE fishing_intel SET summary = $2, summary_cn = $3, fetched_at = now() WHERE dedup_hash = $1`,
          [dedup, summary, summaryCn]);
        summarized++;
      }
      processed++;
    }
    await query(`UPDATE ingest_runs SET finished_at = now(), ok = true, items_added = $2 WHERE id = $1`, [runId, processed]);
    log(`done: ${processed} items, ${summarized} AI-summarised`);
    return { ok: true, processed, summarized };
  } catch (e) {
    await query(`UPDATE ingest_runs SET finished_at = now(), ok = false, note = $2 WHERE id = $1`,
      [runId, String(e.message || e).slice(0, 300)]).catch(() => {});
    log("failed: " + (e.message || e));
    return { ok: false, error: String(e.message || e) };
  } finally {
    running = false;
  }
}
