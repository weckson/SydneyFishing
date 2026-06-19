// "鱼讯" insights view: top species, top spots, and a recent-catch feed (the catch reports,
// surfaced as a community stream). Hash route #/insights. Aggregate-only; no user GPS.
// Depends on globals: SF_API, escapeHtml, SYDNEY_SPOTS.
(function () {
  const esc = (s) => (window.escapeHtml ? window.escapeHtml(s) : String(s || ""));
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

  function catchCard(c) {
    const size = [];
    if (c.length_cm) size.push(`${c.length_cm}cm`);
    if (c.weight_kg) size.push(`${c.weight_kg}kg`);
    if (c.released) size.push("放流");
    const photo = (c.photos && c.photos[0]) ? `<img class="ins-catch-img" loading="lazy" src="${esc(mediaUrl(c.photos[0].thumb))}" alt="渔获" />` : "";
    return `
      <div class="ins-catch">
        ${photo}
        <div class="ins-catch-body">
          <div class="ins-catch-top"><b>🐟 ${esc(c.species || "未填鱼种")}</b>${size.length ? ` <span class="ins-catch-size">${esc(size.join(" · "))}</span>` : ""}</div>
          <div class="ins-catch-sub">${esc(spotName(c.spot_id))} · ${esc(c.user_name || "钓友")} · ${fmt(c.created_at)}</div>
        </div>
      </div>`;
  }

  async function render() {
    view().classList.remove("hidden");
    inner().innerHTML = `<div class="forum-bar"><span class="forum-logo">📊</span><div class="forum-title">本周鱼讯 · What's Biting</div><button class="forum-close" id="insClose">×</button></div><div class="ins-loading">加载中…</div>`;
    inner().querySelector("#insClose").onclick = close;
    let d;
    try { d = await window.SF_API.getInsights(); }
    catch (e) { inner().insertAdjacentHTML("beforeend", `<div class="ins-loading">加载失败：${esc(e.message)}</div>`); return; }

    const maxSp = d.topSpecies[0]?.n || 1;
    const maxSpot = d.topSpots[0]?.n || 1;
    const speciesHtml = d.topSpecies.length ? d.topSpecies.map(s => bar(s.species, s.n, maxSp)).join("") : `<div class="ins-empty">还没有渔获数据</div>`;
    const spotsHtml = d.topSpots.length ? d.topSpots.map(s => bar(spotName(s.spot_id), s.n, maxSpot)).join("") : `<div class="ins-empty">—</div>`;
    const recentHtml = d.recent.length ? d.recent.map(catchCard).join("") : `<div class="ins-empty">还没有渔获报告，去钓点详情记录第一条</div>`;

    inner().innerHTML = `
      <div class="forum-bar"><span class="forum-logo">📊</span><div class="forum-title">本周鱼讯 · What's Biting</div><button class="forum-close" id="insClose">×</button></div>
      <div class="ins-body">
        <div class="ins-stat">共 <b>${d.totalCatches}</b> 条社区渔获记录</div>
        <section class="ins-section"><h3>🔥 热门鱼种 · Top Species</h3>${speciesHtml}</section>
        <section class="ins-section"><h3>📍 热门钓点 · Top Spots</h3>${spotsHtml}</section>
        <section class="ins-section"><h3>🎣 最新钓获 · Recent Catches</h3><div class="ins-catch-list">${recentHtml}</div></section>
      </div>`;
    inner().querySelector("#insClose").onclick = close;
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
