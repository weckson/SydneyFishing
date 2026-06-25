import { config } from "../config.js";

// Optional LLM enrichment ("harness"). Returns { summaryCn, summary } or null when no API key
// is configured or on any error — so ingest works with zero LLM cost by default.
// Calls the Anthropic Messages API directly (no SDK dependency).
export async function summarize(text, ctx = {}) {
  if (!config.anthropicApiKey || !text) return null;
  const prompt = `You summarise Australian (NSW / Sydney) fishing information for a bilingual (zh/en) app.
Source: ${ctx.name || ""} — ${ctx.title || ""}
Content (may be messy HTML-stripped text):
"""${text.slice(0, 5000)}"""

Extract only concrete, current, useful facts (dates, limits, closures, safety rules). Ignore nav/boilerplate.
Return STRICT JSON only, no preamble:
{"summary_cn":"<=2 sentences Simplified Chinese, key facts/dates only","summary_en":"<=2 sentences English"}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": config.anthropicApiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: config.anthropicModel,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const txt = (data.content && data.content[0] && data.content[0].text) || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const j = JSON.parse(m[0]);
    return { summaryCn: j.summary_cn || null, summary: j.summary_en || null };
  } catch (e) {
    return null;
  } finally {
    clearTimeout(t);
  }
}
