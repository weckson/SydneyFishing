// Dry-run preview for the fishing-intel AI summariser — NO database, NO writes.
// Validates your ANTHROPIC_API_KEY and shows what the harness would summarise.
//   cd server && npm run ingest:preview
// Without a key: reports "link-only" (zero LLM cost). With a key: prints bilingual summaries.
import "dotenv/config";
import { config } from "../config.js";
import { OFFICIAL_SOURCES } from "./sources.js";
import { fetchText } from "./fetcher.js";
import { summarize } from "./summarize.js";

const hasKey = !!config.anthropicApiKey;
console.log("──────────────────────────────────────────────");
console.log("Fishing-intel AI summariser — preview (no DB)");
console.log(`ANTHROPIC_API_KEY: ${hasKey ? `set ✓  model=${config.anthropicModel}` : "NOT set — items would be stored link-only (free)"}`);
console.log("──────────────────────────────────────────────");

const fetchable = OFFICIAL_SOURCES.filter(s => s.fetch);
for (const s of fetchable) {
  console.log(`\n• ${s.titleCn}\n  ${s.url}`);
  const text = await fetchText(s.url);
  if (!text) { console.log("  fetch: FAILED or empty (network/blocked) → would store as a link"); continue; }
  console.log(`  fetch: ${text.length} chars`);
  if (!hasKey) { console.log("  summary: (skipped — no API key)"); continue; }
  const sum = await summarize(text, s);
  if (!sum) { console.log("  summary: null (API error / unparseable) → would store as a link"); continue; }
  console.log(`  CN: ${sum.summaryCn}`);
  console.log(`  EN: ${sum.summary}`);
}
console.log("\nDone. (No data was written.)");
process.exit(0);
