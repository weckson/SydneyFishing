// scene.js — 鱼种×钓点「场景页」. Hash route #/scene/:spotId/:species  (e.g. #/scene/bare-island/Tailor)
// "看完鱼情，直接知道怎么买装备、怎么绑钓组、几点去、用什么饵。"
// 冷链接安全：自行用 app.js 暴露的全局 building blocks 组页，不依赖 showDetail 的私有 sortedSpots。
// Reuses (from app.js): fetchSpotConditions, renderSpotConditionsHTML, scoreSpot, toDisplayScore,
//   safetyVerdict, renderSafetyVerdict, bindSafetyVerdict, renderRigsForSpecies, regsForSpecies,
//   regSummaryText, renderAccessSection, catchItemHTML, typeIcon, typeLabel, escapeHtml/Attr, reportCatchFlow.
(function () {
  "use strict";
  const esc = (s) => (window.escapeHtml ? window.escapeHtml(s) : String(s || ""));
  const escA = (s) => (window.escapeAttr ? window.escapeAttr(s) : String(s || ""));
  const ic = (n) => `<svg class="ic" aria-hidden="true"><use href="#ic-${n}"></use></svg>`;
  const view = () => document.getElementById("sceneView");
  const inner = () => document.getElementById("sceneInner");

  function spotById(id) { return (window.SYDNEY_SPOTS || []).find(s => s.id === id) || null; }

  function sydneyMonthIndex() {
    try { return parseInt(new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Sydney", month: "numeric" }).format(new Date()), 10) - 1; }
    catch (e) { return new Date().getMonth(); }
  }

  // Single-species in-season badge from the 12-month activity curve.
  function seasonBadge(species) {
    const curve = window.SPECIES_SEASONS && window.SPECIES_SEASONS[species];
    if (!curve) return "";
    const f = curve[sydneyMonthIndex()];
    if (f >= 1.1) return `<span class="scene-season hot">🔥 当季 In season</span>`;
    if (f <= 0.75) return `<span class="scene-season off">❄️ 淡季 Off-season</span>`;
    return `<span class="scene-season ok">尚可 Fair</span>`;
  }

  // Single-species NSW reg line (reuses app.js helpers).
  function regLine(spot, species) {
    const reg = window.regsForSpecies && window.regsForSpecies(species);
    const meta = window.NSW_REGULATIONS_META || {};
    if (!reg) return "";
    const txt = reg.protected ? `🚫 受保护/禁捕 Protected` : esc(window.regSummaryText(reg));
    const dpi = meta.dpiUrl ? `<a href="${escA(window.safeUrl(meta.dpiUrl))}" target="_blank" rel="noopener noreferrer">DPI ↗</a>` : "";
    return `<section><h4>NSW 法规 · Rules</h4>
      <div class="reg-table"><div class="reg-row${reg.protected ? " reg-protected" : ""}"><span class="reg-sp">${esc(reg.nameCn)} <span class="reg-sp-en">${esc(species)}</span></span><span class="reg-vals">${txt}</span></div></div>
      <div class="reg-disclaimer">⚠️ ${esc(meta.disclaimerCn || "")} ${dpi} <span class="reg-updated">更新 ${esc(meta.lastUpdated || "")}</span></div></section>`;
  }

  function kitForScene(spot, species) {
    const kits = window.SF_KITS || [];
    return kits.find(x => (x.species || []).includes(species))
      || (spot.type === "rock" ? kits.find(x => x.id === "rock-safety") : null)
      || kits.find(x => x.id === "sydney-beginner-shore") || null;
  }

  function render(spotId, species) {
    view().classList.remove("hidden");
    const spot = spotById(spotId);
    const hasRig = window.RIGS_BY_SPECIES && window.RIGS_BY_SPECIES[species];
    if (!spot || !hasRig) {
      inner().innerHTML = `<div class="forum-bar"><span class="forum-logo">${ic("fish")}</span><div class="forum-title">场景页 · Scene</div><button class="forum-close" id="scClose">×</button></div><div class="ins-empty">该场景整理中 · Not available</div>`;
      inner().querySelector("#scClose").onclick = close;
      return;
    }
    const spNameCn = (window.RIGS_BY_SPECIES[species] && window.RIGS_BY_SPECIES[species].nameCn) || species;
    const kit = kitForScene(spot, species);
    const kitLink = kit ? `<a class="kit-scene-link" href="#/kits/${escA(kit.id)}">🎒 推荐套装 · ${esc(kit.nameCn)} →</a>` : "";

    inner().innerHTML = `
      <div class="forum-bar"><span class="forum-logo">${ic("fish")}</span><div class="forum-title">${esc(spNameCn)} @ ${esc(spot.nameCn)}</div><button class="forum-close" id="scClose">×</button></div>
      <div class="scene-body">
        <div class="scene-hero">
          <div class="scene-title">${esc(spNameCn)} <span class="scene-title-en">${esc(species)}</span></div>
          <div class="scene-sub">${window.typeIcon ? window.typeIcon(spot.type) : ""} ${esc(window.typeLabel ? window.typeLabel(spot.type) : spot.type)} · ${esc(spot.name)} ${seasonBadge(species)}</div>
        </div>

        <div id="sceneSafety"></div>

        <section>
          <h4>当前海况 + 评分 · Conditions &amp; Score</h4>
          <div class="spot-conditions" id="sceneConditions"><div class="spot-conditions-loading">海况加载中… Loading…</div></div>
        </section>

        ${window.renderCamsSection ? window.renderCamsSection(spot) : ""}

        <section>
          <h4>最佳时段/潮汐 · Best Time &amp; Tide</h4>
          <p>${esc(spot.bestCn)}</p>
          <p class="en">${esc(spot.best)}</p>
          ${spot.preferredTide ? `<p class="scene-tide">偏好潮水 Preferred tide: ${esc(spot.preferredTide)}</p>` : ""}
        </section>

        <section>
          <h4>${ic("fish")} 钓组 · Rig (${esc(species)})</h4>
          <div class="rig-container">${window.renderRigsForSpecies ? window.renderRigsForSpecies(spot, species) : ""}</div>
        </section>

        ${regLine(spot, species)}

        ${kitLink ? `<section><h4>🦺 装备/安全 · Gear &amp; Safety</h4>${kitLink}</section>` : ""}

        <section>
          <h4>本鱼种近况 · Recent ${esc(species)} here</h4>
          <div class="catch-list" id="sceneCatches"><div class="catch-loading">加载中…</div></div>
        </section>

        <section>
          <h4>📰 ${esc(species)} 动态 · Latest</h4>
          <div id="sceneIntel" class="ins-intel"><div class="catch-loading">加载中…</div></div>
        </section>

        <section>
          <h4>现场提示 · Local Tips</h4>
          <p>${esc(spot.tipsCn)}</p>
          <p class="en">${esc(spot.tips)}</p>
        </section>

        ${window.renderAccessSection ? window.renderAccessSection(spot.id) : ""}

        <section>
          <h4>导航 · Directions</h4>
          <a class="nav-btn" href="https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}" target="_blank" rel="noopener noreferrer">🧭 Google 地图路线</a>
        </section>
      </div>`;
    inner().querySelector("#scClose").onclick = close;

    // Live conditions + score + rock safety verdict (async; same engine as showDetail).
    if (window.fetchSpotConditions) {
      window.fetchSpotConditions(spot).then(data => {
        const box = document.getElementById("sceneConditions");
        if (box && window.renderSpotConditionsHTML) {
          let scoreHtml = "";
          if (window.scoreSpot && window.toDisplayScore) {
            const refined = window.scoreSpot(spot, (window.referencePoint ? window.referencePoint() : null), data, window.currentMode || "fish");
            scoreHtml = `<div class="scene-score">钓况分 Score: <b>${window.toDisplayScore(refined.displayScore)}</b> / 100</div>`;
            const sv = document.getElementById("sceneSafety");
            if (sv && window.renderSafetyVerdict && window.safetyVerdict) {
              sv.innerHTML = window.renderSafetyVerdict(spot, window.safetyVerdict(spot, refined.snapshot));
              if (window.bindSafetyVerdict) window.bindSafetyVerdict();
            }
          }
          box.innerHTML = scoreHtml + window.renderSpotConditionsHTML(data);
        }
      }).catch(() => {});
    }

    loadSceneCatches(spot.id, species);
    loadSceneIntel(species);
  }

  // Per-species fishing-intel (curated report links + any official summaries) from the ingest harness.
  async function loadSceneIntel(species) {
    const el = document.getElementById("sceneIntel");
    if (!el) return;
    const api = window.SF_API;
    if (!api || !api.available) { el.innerHTML = `<div class="no-reviews">连接后端后显示动态 · needs the backend</div>`; return; }
    try {
      const d = await api.getIntel({ species, limit: 6 });
      el.innerHTML = (d.items && d.items.length) ? d.items.map(it => {
        const href = it.source_url && window.safeUrl ? window.safeUrl(it.source_url) : "";
        const link = href ? `<a href="${escA(href)}" target="_blank" rel="noopener noreferrer">${esc(it.source_name || "来源")} ↗</a>` : esc(it.source_name || "");
        const sum = (it.summary_cn || it.summary) ? `<div class="ins-intel-sum">${esc(it.summary_cn || it.summary)}</div>` : "";
        const kindLabel = ({ regulation: "法规", closure: "禁渔", safety: "安全", report: "鱼情", news: "新闻", tutorial: "教程" })[it.kind] || it.kind;
        return `<div class="ins-intel-item"><div class="ins-intel-top"><span class="ins-intel-kind k-${esc(it.kind)}">${esc(kindLabel)}</span> <b>${esc(it.title_cn || it.title || "")}</b></div>${sum}<div class="ins-intel-src">${link}</div></div>`;
      }).join("") : `<div class="no-reviews">暂无动态</div>`;
    } catch (e) { el.innerHTML = ""; }
  }

  // Species-filtered recent intel (reuses the per-spot catches API + app.js catch renderer).
  async function loadSceneCatches(spotId, species) {
    const el = document.getElementById("sceneCatches");
    if (!el) return;
    const api = window.SF_API;
    if (!api || !api.available) { el.innerHTML = `<div class="no-reviews">连接后端后显示社区钓获 · Catch feed needs the backend</div>`; return; }
    try {
      const { catches } = await api.getCatches(spotId);
      const mine = (catches || []).filter(c => (c.species || "") === species);
      el.innerHTML = mine.length
        ? mine.map(window.catchItemHTML).join("")
        : `<div class="no-reviews">还没有 ${esc(species)} 的钓获记录，去钓点详情记录第一条</div>`;
      el.onclick = (e) => {
        const b = e.target.closest("[data-report-catch]");
        if (b && window.reportCatchFlow) { e.preventDefault(); window.reportCatchFlow(b.getAttribute("data-report-catch")); }
      };
    } catch (e) { el.innerHTML = ""; }
  }

  function close() { if ((location.hash || "").startsWith("#/scene")) location.hash = ""; view().classList.add("hidden"); }

  function route() {
    const m = (location.hash || "").match(/^#\/scene\/([^/]+)\/([^/?]+)/);
    if (m) render(decodeURIComponent(m[1]), decodeURIComponent(m[2]));
    else view().classList.add("hidden");
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => {
    if ((location.hash || "").startsWith("#/scene")) route();
  });
})();
