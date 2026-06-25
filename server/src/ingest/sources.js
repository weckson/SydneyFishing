// Curated ingest sources for the fishing-intel harness.
// - Official pages are authoritative (regs/closures/safety).
// - Community entries are LINK-ONLY: we surface a search/landing URL, never republish forum
//   content (ToS/copyright safe). The app shows them as "latest report sources" per region/species.
// kind: 'regulation' | 'closure' | 'safety' | 'report' | 'news'

export const REGIONS = [
  { key: "harbour", cn: "悉尼港", en: "Sydney Harbour", q: "Sydney Harbour" },
  { key: "northern-beaches", cn: "北部海滩", en: "Northern Beaches", q: "Northern Beaches Sydney" },
  { key: "south", cn: "南区", en: "South Botany Cronulla", q: "Botany Bay Cronulla" },
  { key: "central-coast", cn: "中央海岸", en: "Central Coast", q: "Central Coast NSW" },
  { key: "wollongong", cn: "卧龙岗", en: "Wollongong", q: "Wollongong Illawarra" },
  { key: "hawkesbury", cn: "霍克斯伯里", en: "Hawkesbury", q: "Hawkesbury River NSW" }
];

export const SPECIES = ["Kingfish", "Bream", "Flathead", "Tailor", "Luderick", "Drummer", "Salmon", "Jewfish"];

// Official / authoritative (global scope). fetch:true → fetch + summarise when an LLM key is set.
export const OFFICIAL_SOURCES = [
  { kind: "regulation", name: "NSW DPI 海水尺寸/数量限制", scopeKey: "regulation", fetch: true,
    url: "https://www.dpird.nsw.gov.au/fishing/recreational/fishing-rules-and-regs/saltwater-bag-and-size-limits",
    title: "NSW saltwater bag & size limits (official)", titleCn: "NSW 海水鱼尺寸与数量限制（官方）" },
  { kind: "closure", name: "NSW DPI 禁渔/限制", scopeKey: "closure", fetch: true,
    url: "https://www.dpi.nsw.gov.au/fishing/closures",
    title: "NSW current fishing closures & restrictions", titleCn: "NSW 当前禁渔与限制（官方）" },
  { kind: "safety", name: "NSW 岩钓救生衣法", scopeKey: "safety", fetch: true,
    url: "https://www.nsw.gov.au/environment-land-and-water/coasts-waterways-and-marine/rock-fishing-lifejacket-law",
    title: "NSW rock-fishing lifejacket law & declared areas", titleCn: "NSW 岩钓救生衣法与强制分区（官方）" },
  { kind: "safety", name: "悉尼水生保护区指南", scopeKey: "safety", fetch: false,
    url: "https://www.dpi.nsw.gov.au/fishing/marine-protected-areas/aquatic-reserves",
    title: "Sydney aquatic reserves (no-take zones)", titleCn: "悉尼水生保护区（禁渔区）" }
];

// LINK-only community report sources per region + per species (search/landing URLs).
export function communitySources() {
  const items = [];
  for (const r of REGIONS) {
    const q = encodeURIComponent(r.q + " fishing");
    items.push({ kind: "report", scopeType: "region", scopeKey: r.key, name: "Reddit r/fishingaustralia", fetch: false,
      url: `https://www.reddit.com/r/fishingaustralia/search/?q=${q}&sort=new`,
      title: `${r.en} — latest reports (Reddit)`, titleCn: `${r.cn} — 最新鱼情（Reddit）` });
    items.push({ kind: "report", scopeType: "region", scopeKey: r.key, name: "YouTube", fetch: false,
      url: `https://www.youtube.com/results?search_query=${q}`,
      title: `${r.en} — recent videos (YouTube)`, titleCn: `${r.cn} — 最新视频（YouTube）` });
  }
  for (const sp of SPECIES) {
    const q = encodeURIComponent(`Sydney ${sp} fishing`);
    items.push({ kind: "report", scopeType: "species", scopeKey: sp, name: "Reddit r/fishingaustralia", fetch: false,
      url: `https://www.reddit.com/r/fishingaustralia/search/?q=${q}&sort=new`,
      title: `${sp} around Sydney — latest reports`, titleCn: `悉尼 ${sp} — 最新鱼情（Reddit）` });
  }
  return items;
}

export function allSources() {
  return OFFICIAL_SOURCES.map(s => ({ scopeType: "global", ...s })).concat(communitySources());
}
