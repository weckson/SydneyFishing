// Minimal HTML fetch + text extraction (no dependencies). Best-effort: returns "" on any failure
// so the ingest run never breaks on a dead/blocked source.
export async function fetchText(url, { timeoutMs = 10000, maxChars = 6000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": "SydneyFishingBot/1.0 (+https://sydneyfishing.au; contact: admin)" }
    });
    if (!res.ok) return "";
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxChars);
  } catch (e) {
    return "";
  } finally {
    clearTimeout(t);
  }
}
