// "鱼讯" insights view: top species, top spots, and a recent-catch feed (the catch reports,
// surfaced as a community stream). Hash route #/insights. Aggregate-only; no user GPS.
// Depends on globals: SF_API, escapeHtml, SYDNEY_SPOTS.
(function () {
  const esc = (s) => (window.escapeHtml ? window.escapeHtml(s) : String(s || ""));
  const ic = (n) => `<svg class="ic" aria-hidden="true"><use href="#ic-${n}"></use></svg>`;
  const view = () => document.getElementById("insightsView");
  const inner = () => document.getElementById("insightsInner");

  // spot id -> Chinese name (the 205-spot dataset stays client-side).
  function spotName(id) {
    const s = (window.SYDNEY_SPOTS || []).find(x => x.id === id);
    return s ? s.nameCn : id;
  }
  function fmt(s) {
    if (!s) return "";
    try { return new Intl.DateTimeFormat("zh-CN", { timeZone: "Australia/Sydney", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(s)); }
    catch (e) { return String(s).slice(0, 16); }
  }
  function mediaUrl(p) { return window.SF_API ? window.SF_API.mediaUrl(p) : p; }

  function bar(label, n, max) {
    const pct = max ? Math.round((n / max) * 100) : 0;
    return `<div class="ins-bar-row"><div class="ins-bar-label">${esc(label)}</div>
      <div class="ins-bar-track"><div class="ins-bar-fill" style="width:${pct}%"></div></div>
      <div class="ins-bar-n">${n}</div></div>`;
  }

  let windowDays = 7;  // 真·周报: default to last 7 days; user can widen to 14/30.

  function winChips() {
    return [7, 14, 30].map(d => `<button type="button" class="gl-chip${d === windowDays ? " active" : ""}" data-win="${d}">近 ${d} 天</button>`).join("");
  }

  // Fold per-spot counts into regions client-side (server doesn't hold the spots dataset).
  function regionBreakdown(topSpots) {
    if (!window.spotRegionId || !window.SF_REGIONS) return `<div class="ins-empty">—</div>`;
    const sums = {};
    (topSpots || []).forEach(s => { const r = window.spotRegionId(s.spot_id); sums[r] = (sums[r] || 0) + s.n; });
    const rows = window.SF_REGIONS.map(r => ({ r, n: sums[r.id] || 0 })).filter(x => x.n > 0).sort((a, b) => b.n - a.n);
    if (!rows.length) return `<div class="ins-empty">—</div>`;
    const max = rows[0].n;
    return rows.map(x => bar(`${x.r.nameCn} ${x.r.name}`, x.n, max)).join("");
  }

  function catchCard(c) {
    const size = [];
    if (c.length_cm) size.push(`${c.length_cm}cm`);
    if (c.weight_kg) size.push(`${c.weight_kg}kg`);
    if (c.released) size.push("放流");
    const photo = (c.photos && c.photos[0]) ? `<img class="ins-catch-img" loading="lazy" src="${esc(mediaUrl(c.photos[0].thumb))}" alt="渔获" />` : "";
    const report = (window.SF_API && window.SF_API.user && c.id)
      ? `<button type="button" class="link-report" data-report-catch="${esc(String(c.id))}" title="举报 Report">🚩</button>` : "";
    // Link the species to its spot×species scene page when we have rig data for it.
    const sceneHref = (c.spot_id && c.species && window.RIGS_BY_SPECIES && window.RIGS_BY_SPECIES[c.species])
      ? `#/scene/${encodeURIComponent(c.spot_id)}/${encodeURIComponent(c.species)}` : "";
    const spName = sceneHref ? `<a href="${esc(sceneHref)}">${esc(c.species)}</a>` : esc(c.species || "未填鱼种");
    return `
      <div class="ins-catch">
        ${photo}
        <div class="ins-catch-body">
          <div class="ins-catch-top"><b>${ic("fish")} ${spName}</b>${size.length ? ` <span class="ins-catch-size">${esc(size.join(" · "))}</span>` : ""}${report}</div>
          <div class="ins-catch-sub">${esc(spotName(c.spot_id))} · ${esc(c.user_name || "钓友")} · ${fmt(c.created_at)}</div>
        </div>
      </div>`;
  }

  function intelItem(it) {
    const title = esc(it.title_cn || it.title || "");
    const sum = (it.summary_cn || it.summary) ? `<div class="ins-intel-sum">${esc(it.summary_cn || it.summary)}</div>` : "";
    const href = it.source_url ? (window.safeUrl ? window.safeUrl(it.source_url) : "") : "";
    const link = href ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(it.source_name || "来源")} ↗</a>` : esc(it.source_name || "");
    const kindLabel = ({ regulation: "法规", closure: "禁渔", safety: "安全", report: "鱼情", news: "新闻", tutorial: "教程" })[it.kind] || it.kind;
    return `<div class="ins-intel-item"><div class="ins-intel-top"><span class="ins-intel-kind k-${esc(it.kind)}">${esc(kindLabel)}</span> <b>${title}</b></div>${sum}<div class="ins-intel-src">${link}</div></div>`;
  }
  async function loadInto(elId, params, emptyMsg) {
    const el = document.getElementById(elId);
    if (!el) return;
    if (!window.SF_API || !window.SF_API.available) { el.innerHTML = `<div class="ins-empty">连接后端后显示 · needs the backend</div>`; return; }
    try {
      const d = await window.SF_API.getIntel(params);
      el.innerHTML = (d.items && d.items.length) ? d.items.map(intelItem).join("") : `<div class="ins-empty">${emptyMsg}</div>`;
    } catch (e) { el.innerHTML = `<div class="ins-empty">加载失败</div>`; }
  }
  const loadBeginner = () => loadInto("insBeginner", { kind: "tutorial", limit: 6 }, "教程整理中");
  const loadIntel = () => loadInto("insIntel", { limit: 12 }, "暂无动态，更新引擎稍后会抓取");

  async function render() {
    view().classList.remove("hidden");
    inner().innerHTML = `<div class="forum-bar"><span class="forum-logo">${ic("chart")}</span><div class="forum-title">本周鱼讯 · What's Biting</div><button class="forum-close" id="insClose">×</button></div><div class="ins-loading">加载中…</div>`;
    inner().querySelector("#insClose").onclick = close;
    let d;
    try { d = await window.SF_API.getInsights(windowDays); }
    catch (e) { inner().insertAdjacentHTML("beforeend", `<div class="ins-loading">加载失败：${esc(e.message)}</div>`); return; }

    const days = d.windowDays || windowDays;
    const maxSp = d.topSpecies[0]?.n || 1;
    const maxSpot = d.topSpots[0]?.n || 1;
    const speciesHtml = d.topSpecies.length ? d.topSpecies.map(s => bar(s.species, s.n, maxSp)).join("") : `<div class="ins-empty">近 ${days} 天还没有渔获数据</div>`;
    const spotsHtml = d.topSpots.length ? d.topSpots.slice(0, 8).map(s => bar(spotName(s.spot_id), s.n, maxSpot)).join("") : `<div class="ins-empty">—</div>`;
    const recentHtml = d.recent.length ? d.recent.map(catchCard).join("") : `<div class="ins-empty">近 ${days} 天还没有渔获，放宽到 14/30 天看看，或去钓点详情记录第一条</div>`;

    inner().innerHTML = `
      <div class="forum-bar"><span class="forum-logo">${ic("chart")}</span><div class="forum-title">本周鱼讯 · What's Biting</div><button class="forum-close" id="insClose">×</button></div>
      <div class="ins-body">
        <div class="ins-win">${winChips()}</div>
        <div class="ins-stat">近 <b>${days}</b> 天 · last ${days} days · 共 <b>${d.totalCatches}</b> 条社区渔获</div>
        <section class="ins-section"><h3>${ic("trophy")} 热门鱼种 · Top Species</h3>${speciesHtml}</section>
        <section class="ins-section"><h3>📍 热门钓点 · Top Spots</h3>${spotsHtml}</section>
        <section class="ins-section"><h3>${ic("map")} 分区 · By Region</h3>${regionBreakdown(d.topSpots)}</section>
        <section class="ins-section"><h3>🎓 新手必看 · Start here</h3><div id="insBeginner" class="ins-intel"><div class="ins-empty">加载中…</div></div></section>
        <section class="ins-section"><h3>📰 钓鱼动态 · Latest</h3><div id="insIntel" class="ins-intel"><div class="ins-empty">加载中…</div></div></section>
        <section class="ins-section"><h3>${ic("fish")} 最新钓获 · Recent Catches</h3><div class="ins-catch-list">${recentHtml}</div></section>
      </div>`;
    inner().querySelector("#insClose").onclick = close;
    // Window selector (7/14/30) → re-render.
    const winEl = inner().querySelector(".ins-win");
    if (winEl) winEl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-win]"); if (!b) return;
      windowDays = parseInt(b.dataset.win, 10); render();
    });
    // Delegated 🚩 report buttons in the recent-catch feed (reuses app.js reportCatchFlow).
    const cl = inner().querySelector(".ins-catch-list");
    if (cl) cl.onclick = (e) => {
      const b = e.target.closest("[data-report-catch]");
      if (b && window.reportCatchFlow) { e.preventDefault(); window.reportCatchFlow(b.getAttribute("data-report-catch")); }
    };
    loadBeginner();
    loadIntel();
  }

  function close() { if (location.hash.startsWith("#/insights")) location.hash = ""; view().classList.add("hidden"); }

  function route() {
    if ((location.hash || "").startsWith("#/insights")) render();
    else view().classList.add("hidden");
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("insightsBtn")?.addEventListener("click", () => { location.hash = "#/insights"; });
    if ((location.hash || "").startsWith("#/insights")) route();
  });
})();
