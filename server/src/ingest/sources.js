// Curated ingest sources for the fishing-intel harness.
// - Official pages are authoritative (regs/closures/safety/beginner guide).
// - Community/tutorial entries are LINK-ONLY: a search/landing URL, never republished content
//   (ToS/copyright safe). Diversified across 小红书 (Chinese), Reddit, YouTube, bilibili,
//   Fishraider/Deckee — so the feed isn't Reddit-only and is friendlier to (Chinese) beginners.
// kind: 'regulation' | 'closure' | 'safety' | 'report' | 'news' | 'tutorial'
const enc = encodeURIComponent;

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
  { kind: "safety", name: "悉尼水生保护区", scopeKey: "safety", fetch: false,
    url: "https://www.dpi.nsw.gov.au/fishing/marine-protected-areas/aquatic-reserves",
    title: "Sydney aquatic reserves (no-take zones)", titleCn: "悉尼水生保护区（禁渔区）" },
  { kind: "tutorial", name: "NSW DPI 钓鱼官方指南", scopeKey: "beginner", fetch: true,
    url: "https://www.dpird.nsw.gov.au/fishing/recreational/fishing-rules-and-regs/saltwater-recreational-fishing-guide",
    title: "NSW saltwater fishing guide (knots/rigs/safety)", titleCn: "NSW 海水钓鱼官方指南（绑钩/钓组/安全）" }
];

// Global community + beginner tutorials (diverse platforms; LINK-only).
export const COMMUNITY_GLOBAL = [
  { kind: "report", scopeType: "global", scopeKey: "", name: "Fishraider / Deckee", fetch: false,
    url: "https://community.deckee.com/forum/9-saltwater-fishing-reports/",
    title: "Fishraider saltwater fishing reports", titleCn: "Fishraider 海钓鱼情报告（NSW 老牌论坛）" },
  { kind: "report", scopeType: "global", scopeKey: "", name: "小红书", fetch: false,
    url: "https://www.xiaohongshu.com/search_result?keyword=" + enc("悉尼 钓鱼"),
    title: "Sydney fishing notes (RED)", titleCn: "悉尼钓鱼笔记（小红书）" },
  { kind: "tutorial", scopeType: "global", scopeKey: "beginner", name: "YouTube", fetch: false,
    url: "https://www.youtube.com/results?search_query=" + enc("land based fishing Sydney for beginners"),
    title: "Land-based fishing Sydney — beginner videos", titleCn: "悉尼岸钓新手视频（YouTube）" },
  { kind: "tutorial", scopeType: "global", scopeKey: "beginner", name: "YouTube", fetch: false,
    url: "https://www.youtube.com/results?search_query=" + enc("fishing knots for beginners"),
    title: "Beginner fishing knots", titleCn: "新手必学钓鱼绳结（YouTube）" },
  { kind: "tutorial", scopeType: "global", scopeKey: "beginner", name: "哔哩哔哩 bilibili", fetch: false,
    url: "https://search.bilibili.com/all?keyword=" + enc("悉尼 钓鱼 新手 教程"),
    title: "Sydney fishing tutorials (Chinese)", titleCn: "悉尼钓鱼新手教程（B 站中文）" }
];

// LINK-only per-region + per-species sources — diversified (Chinese RED + Reddit + YouTube how-to).
export function communitySources() {
  const items = [];
  for (const r of REGIONS) {
    items.push({ kind: "report", scopeType: "region", scopeKey: r.key, name: "小红书", fetch: false,
      url: "https://www.xiaohongshu.com/search_result?keyword=" + enc("悉尼 " + r.cn + " 钓鱼"),
      title: `${r.en} fishing notes (RED)`, titleCn: `${r.cn} 钓鱼笔记（小红书）` });
    items.push({ kind: "report", scopeType: "region", scopeKey: r.key, name: "Reddit r/fishingaustralia", fetch: false,
      url: "https://www.reddit.com/r/fishingaustralia/search/?q=" + enc(r.q + " fishing") + "&sort=new",
      title: `${r.en} — latest reports (Reddit)`, titleCn: `${r.cn} — 最新鱼情（Reddit）` });
  }
  for (const sp of SPECIES) {
    items.push({ kind: "tutorial", scopeType: "species", scopeKey: sp, name: "YouTube", fetch: false,
      url: "https://www.youtube.com/results?search_query=" + enc("how to catch " + sp + " Sydney"),
      title: `How to catch ${sp} (Sydney)`, titleCn: `怎么钓 ${sp}（悉尼·视频教程）` });
    items.push({ kind: "report", scopeType: "species", scopeKey: sp, name: "小红书", fetch: false,
      url: "https://www.xiaohongshu.com/search_result?keyword=" + enc("悉尼 " + sp + " 钓鱼"),
      title: `${sp} around Sydney (RED)`, titleCn: `悉尼 ${sp} 钓获（小红书）` });
  }
  return items;
}

export function allSources() {
  return OFFICIAL_SOURCES.map(s => ({ scopeType: "global", ...s }))
    .concat(COMMUNITY_GLOBAL)
    .concat(communitySources());
}
