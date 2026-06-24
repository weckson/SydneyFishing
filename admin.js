// Moderation panel (hash route #/admin). Visible only to admin/moderator accounts. Lists open
// reports with a content preview and lets staff take down (soft-delete) or dismiss each one.
// Minimal by design — the legal floor for opening user photos publicly (see DEPLOY.md §12).
// Depends on globals: SF_API, escapeHtml.
(function () {
  const esc = (s) => (window.escapeHtml ? window.escapeHtml(s) : String(s || ""));
  const ic = (n) => `<svg class="ic" aria-hidden="true"><use href="#ic-${n}"></use></svg>`;
  const view = () => document.getElementById("adminView");
  const inner = () => document.getElementById("adminInner");
  const isAdmin = () => !!(window.SF_API && window.SF_API.isAdmin && window.SF_API.isAdmin());

  const TYPE_LABEL = { catch_report: "渔获 Catch", thread: "主题帖 Thread", post: "回帖 Post" };

  function fmt(s) {
    if (!s) return "";
    try { return new Intl.DateTimeFormat("zh-CN", { timeZone: "Australia/Sydney", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(s)); }
    catch (e) { return String(s).slice(0, 16); }
  }

  function reportCard(r) {
    const p = r.preview || {};
    const flags = `${p.removed ? `<span class="adm-flag adm-removed">已下架</span>` : ""}${p.gone ? `<span class="adm-flag adm-gone">内容已不存在</span>` : ""}`;
    const who = p.author ? `作者 ${esc(p.author)} · ` : "";
    const canTakedown = !p.gone && !p.removed && r.target_type !== "review";
    return `
      <div class="adm-report" data-id="${esc(String(r.id))}" data-tt="${esc(r.target_type)}" data-ti="${esc(String(r.target_id))}">
        <div class="adm-top">
          <span class="adm-type">${esc(TYPE_LABEL[r.target_type] || r.target_type)}</span>
          <span class="adm-reason">${ic("flag")} ${esc(r.reason || "")}</span>
          ${flags}
        </div>
        <div class="adm-preview">${esc(p.text || "（无预览 No preview）")}</div>
        ${r.detail ? `<div class="adm-detail">补充：${esc(r.detail)}</div>` : ""}
        <div class="adm-foot">
          <span class="adm-meta">${who}举报人 ${esc(r.reporter_name || "?")} · ${fmt(r.created_at)}</span>
          <span class="adm-actions">
            ${canTakedown ? `<button type="button" class="adm-btn adm-takedown" data-act="takedown">下架 Take down</button>` : ""}
            <button type="button" class="adm-btn adm-resolve" data-act="resolve">标记已处理 Dismiss</button>
          </span>
        </div>
      </div>`;
  }

  function header() {
    return `<div class="forum-bar"><span class="forum-logo">${ic("shield")}</span><div class="forum-title">审核后台 · Moderation</div><button class="forum-close" id="admClose">×</button></div>`;
  }

  async function render() {
    view().classList.remove("hidden");
    if (!isAdmin()) {
      inner().innerHTML = header() + `<div class="ins-loading">需要管理员权限 · Admins only</div>`;
      inner().querySelector("#admClose").onclick = close;
      return;
    }
    inner().innerHTML = header() + `<div class="ins-loading">加载中…</div>`;
    inner().querySelector("#admClose").onclick = close;

    let d;
    try { d = await window.SF_API.adminReports(); }
    catch (e) { inner().innerHTML = header() + `<div class="ins-loading">加载失败：${esc(e.message)}</div>`; inner().querySelector("#admClose").onclick = close; return; }

    const list = d.reports.length
      ? d.reports.map(reportCard).join("")
      : `<div class="ins-empty">🎉 没有待处理的举报 · No open reports</div>`;
    inner().innerHTML = header() + `<div class="adm-body"><div class="adm-stat">待处理举报 · Open reports：<b>${d.reports.length}</b></div>${list}</div>`;
    inner().querySelector("#admClose").onclick = close;
    inner().querySelectorAll(".adm-report").forEach(card =>
      card.querySelectorAll(".adm-btn").forEach(btn => btn.onclick = () => act(card, btn.dataset.act)));
  }

  async function act(card, action) {
    const id = card.dataset.id, tt = card.dataset.tt, ti = card.dataset.ti;
    try {
      if (action === "resolve") {
        await window.SF_API.adminResolveReport(id);
      } else if (action === "takedown") {
        if (!confirm("确认下架该内容？将从公开列表移除（软删除，保留以备审计）。")) return;
        if (tt === "catch_report") await window.SF_API.adminTakedownCatch(ti);
        else if (tt === "thread") await window.SF_API.adminTakedownThread(ti);
        else if (tt === "post") await window.SF_API.adminTakedownPost(ti);
        else await window.SF_API.adminResolveReport(id);
      }
      card.remove();
      const stat = inner().querySelector(".adm-stat b");
      if (stat) stat.textContent = Math.max(0, (parseInt(stat.textContent, 10) || 1) - 1);
    } catch (e) { alert("操作失败 · " + e.message); }
  }

  function close() { if ((location.hash || "").startsWith("#/admin")) location.hash = ""; view().classList.add("hidden"); }
  function route() { if ((location.hash || "").startsWith("#/admin")) render(); else view().classList.add("hidden"); }

  function syncBtn() {
    const btn = document.getElementById("adminBtn");
    if (btn) btn.style.display = isAdmin() ? "" : "none";
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("adminBtn")?.addEventListener("click", () => { location.hash = "#/admin"; });
    syncBtn();
    if (window.SF_API) window.SF_API.onAuthChange(syncBtn);
    if ((location.hash || "").startsWith("#/admin")) route();
  });
})();
