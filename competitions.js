// competitions.js — 线上比赛 (view). Hash routes #/comp and #/comp/:id.
// SCOPE.md: 纯线上 — 排行榜由公开渔获派生，参赛=记录一条公开渔获。无线下聚会/约钓。
// Depends on globals: SF_API, escapeHtml, SYDNEY_SPOTS.
(function () {
  "use strict";
  const esc = (s) => (window.escapeHtml ? window.escapeHtml(s) : String(s || ""));
  const ic = (n) => `<svg class="ic" aria-hidden="true"><use href="#ic-${n}"></use></svg>`;
  const view = () => document.getElementById("compView");
  const inner = () => document.getElementById("compInner");

  function spotName(id) { const s = (window.SYDNEY_SPOTS || []).find(x => x.id === id); return s ? s.nameCn : id; }
  function mediaUrl(p) { return window.SF_API ? window.SF_API.mediaUrl(p) : p; }
  function fmtDate(s) { try { return new Intl.DateTimeFormat("zh-CN", { timeZone: "Australia/Sydney", month: "2-digit", day: "2-digit" }).format(new Date(s)); } catch (e) { return String(s || "").slice(0, 10); } }

  const STATUS = { active: { cn: "进行中", cls: "active" }, upcoming: { cn: "即将开始", cls: "upcoming" }, ended: { cn: "已结束", cls: "ended" } };

  function compCard(c) {
    const st = STATUS[c.status] || STATUS.ended;
    const metric = c.metric === "weight" ? "重量 weight" : "长度 length";
    const sp = c.species ? esc(c.species) : "任意鱼种 Any";
    return `
      <button type="button" class="comp-card" data-comp="${esc(String(c.id))}">
        <div class="comp-card-top"><span class="comp-name">${esc(c.name_cn)}</span><span class="comp-status comp-${st.cls}">${esc(st.cn)}</span></div>
        <div class="comp-card-en">${esc(c.title)}</div>
        <div class="comp-card-meta">${ic("fish")} ${sp} · ${metric} · ${fmtDate(c.starts_at)}–${fmtDate(c.ends_at)}</div>
      </button>`;
  }

  function entryRow(e, i, metric) {
    const val = metric === "weight" ? (e.weight_kg != null ? `${e.weight_kg} kg` : "—") : (e.length_cm != null ? `${e.length_cm} cm` : "—");
    const photo = (e.photos && e.photos[0]) ? `<img class="comp-img" loading="lazy" src="${esc(mediaUrl(e.photos[0].thumb))}" alt="渔获" />` : `<div class="comp-img comp-img-none">${ic("fish")}</div>`;
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
    return `
      <div class="comp-entry">
        <div class="comp-rank">${medal}</div>
        ${photo}
        <div class="comp-entry-body">
          <div class="comp-entry-top"><b>${esc(e.species || "")}</b> <span class="comp-val">${esc(val)}</span></div>
          <div class="comp-entry-sub">${esc(e.user_name || "钓友")} · ${esc(spotName(e.spot_id))} · ${fmtDate(e.caught_at)}</div>
        </div>
      </div>`;
  }

  async function renderList() {
    view().classList.remove("hidden");
    inner().innerHTML = `<div class="forum-bar"><span class="forum-logo">${ic("trophy")}</span><div class="forum-title">线上比赛 · Competitions</div><button class="forum-close" id="cpClose">×</button></div><div class="ins-loading">加载中…</div>`;
    inner().querySelector("#cpClose").onclick = close;
    if (!window.SF_API || !window.SF_API.available) {
      inner().insertAdjacentHTML("beforeend", `<div class="ins-empty">连接后端后查看比赛 · Competitions need the backend</div>`); return;
    }
    let d;
    try { d = await window.SF_API.getCompetitions(); }
    catch (e) { inner().insertAdjacentHTML("beforeend", `<div class="ins-loading">加载失败：${esc(e.message)}</div>`); return; }
    const cards = (d.competitions || []).length ? d.competitions.map(compCard).join("") : `<div class="ins-empty">暂无比赛 · No competitions yet</div>`;
    inner().innerHTML = `
      <div class="forum-bar"><span class="forum-logo">${ic("trophy")}</span><div class="forum-title">线上比赛 · Competitions</div><button class="forum-close" id="cpClose">×</button></div>
      <div class="comp-body">
        <div class="comp-intro">纯线上比赛：在比赛期内记录一条公开渔获即参赛。<span class="en">Log a public catch in-window to enter — online only.</span></div>
        <div class="comp-grid">${cards}</div>
      </div>`;
    inner().querySelector("#cpClose").onclick = close;
    inner().querySelector(".comp-grid").addEventListener("click", (e) => {
      const b = e.target.closest("[data-comp]"); if (!b) return;
      location.hash = "#/comp/" + encodeURIComponent(b.dataset.comp);
    });
  }

  async function renderDetail(id) {
    view().classList.remove("hidden");
    inner().innerHTML = `<div class="forum-bar"><span class="forum-logo">${ic("trophy")}</span><div class="forum-title">排行榜 · Leaderboard</div><button class="forum-close" id="cpClose">×</button></div><div class="ins-loading">加载中…</div>`;
    inner().querySelector("#cpClose").onclick = close;
    let d;
    try { d = await window.SF_API.getCompetitionLeaderboard(id); }
    catch (e) { inner().insertAdjacentHTML("beforeend", `<div class="ins-empty">加载失败：${esc(e.message)} <button type="button" class="gl-chip" id="cpBack">← 返回</button></div>`); inner().querySelector("#cpBack")?.addEventListener("click", () => { location.hash = "#/comp"; }); return; }
    const c = d.competition || {};
    const metric = c.metric === "weight" ? "weight" : "length";
    const rows = (d.entries || []).length ? d.entries.map((e, i) => entryRow(e, i, metric)).join("") : `<div class="ins-empty">还没有合格渔获，去记录第一条公开渔获参赛</div>`;
    inner().innerHTML = `
      <div class="forum-bar"><span class="forum-logo">${ic("trophy")}</span><div class="forum-title">${esc(c.name_cn || "排行榜")}</div><button class="forum-close" id="cpClose">×</button></div>
      <div class="comp-body">
        <button type="button" class="kit-back" id="cpBack">← 全部比赛 All</button>
        <div class="comp-detail-head">${esc(c.descr_cn || "")}<div class="en">${esc(c.title || "")}</div></div>
        <div class="comp-leader">${rows}</div>
        <div class="comp-cta">想参赛？在比赛期内去钓点详情记录一条<b>公开</b>渔获即可上榜。<span class="en">Log a public catch to enter.</span></div>
      </div>`;
    inner().querySelector("#cpClose").onclick = close;
    inner().querySelector("#cpBack").addEventListener("click", () => { location.hash = "#/comp"; });
  }

  function close() { if ((location.hash || "").startsWith("#/comp")) location.hash = ""; view().classList.add("hidden"); }

  function route() {
    const h = location.hash || "";
    if (!h.startsWith("#/comp")) { view().classList.add("hidden"); return; }
    const m = h.match(/^#\/comp\/([^/?]+)/);
    if (m) renderDetail(decodeURIComponent(m[1]));
    else renderList();
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("compBtn")?.addEventListener("click", () => { location.hash = "#/comp"; });
    if ((location.hash || "").startsWith("#/comp")) route();
  });
})();
