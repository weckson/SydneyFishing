// Notifications bell: unread badge + dropdown list. Reply notifications take the user to the
// thread. Depends on globals: SF_API, escapeHtml.
(function () {
  const esc = (s) => (window.escapeHtml ? window.escapeHtml(s) : String(s || ""));
  const el = (id) => document.getElementById(id);

  // Notifications ride on the forum feature; if it's disabled, the bell stays hidden.
  const forumOn = () => !(window.SF_API && window.SF_API.features && window.SF_API.features.forum === false);

  function setBadge(n) {
    const b = el("notifyBadge");
    const btn = el("notifyBtn");
    if (!b || !btn) return;
    btn.style.display = (forumOn() && window.SF_API && window.SF_API.user) ? "" : "none";
    if (n > 0 && forumOn()) { b.textContent = n > 99 ? "99+" : String(n); b.style.display = ""; }
    else { b.style.display = "none"; }
  }

  async function refreshBadge() {
    if (!forumOn() || !window.SF_API || !window.SF_API.user) { setBadge(0); return; }
    try { const r = await window.SF_API.getUnread(); setBadge(r.unread || 0); }
    catch (e) { /* ignore */ }
  }

  function fmt(s) {
    if (!s) return "";
    try { return new Intl.DateTimeFormat("zh-CN", { timeZone: "Australia/Sydney", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(s)); }
    catch (e) { return String(s).slice(0, 16); }
  }

  async function togglePanel() {
    const existing = el("notifyPanel");
    if (existing) { existing.remove(); return; }
    if (!window.SF_API?.user) { window.SF_AUTH_UI?.openModal("login"); return; }
    const panel = document.createElement("div");
    panel.id = "notifyPanel";
    panel.className = "notify-panel";
    panel.innerHTML = `<div class="notify-loading">加载中…</div>`;
    el("notifyBtn").parentElement.appendChild(panel);

    let data;
    try { data = await window.SF_API.getNotifications(); }
    catch (e) { panel.innerHTML = `<div class="notify-loading">加载失败</div>`; return; }

    const items = data.notifications.length
      ? data.notifications.map(n => `
          <button class="notify-item${n.read_at ? "" : " unread"}" data-tid="${n.thread_id}">
            <div class="notify-text"><b>${esc(n.actor_name || "钓友")}</b> 回复了你的帖子</div>
            <div class="notify-sub">${esc(n.title || "")} · ${fmt(n.created_at)}</div>
          </button>`).join("")
      : `<div class="notify-empty">暂无通知</div>`;

    panel.innerHTML = `
      <div class="notify-head">
        <span>通知 · Notifications</span>
        ${data.notifications.some(n => !n.read_at) ? `<button id="notifyReadAll">全部已读</button>` : ""}
      </div>
      <div class="notify-list">${items}</div>`;

    panel.querySelectorAll(".notify-item").forEach(b => b.onclick = async () => {
      const tid = b.dataset.tid;
      try { await window.SF_API.markNotificationsRead(); } catch (e) {}
      setBadge(0);
      panel.remove();
      if (tid && tid !== "null") location.hash = "#/forum/t/" + tid;
    });
    el("notifyReadAll")?.addEventListener("click", async () => {
      try { await window.SF_API.markNotificationsRead(); } catch (e) {}
      setBadge(0);
      panel.querySelectorAll(".notify-item.unread").forEach(i => i.classList.remove("unread"));
      el("notifyReadAll")?.remove();
    });

    // close on outside click
    setTimeout(() => document.addEventListener("click", function h(ev) {
      if (!panel.contains(ev.target) && !el("notifyBtn").contains(ev.target)) { panel.remove(); document.removeEventListener("click", h); }
    }), 0);
  }

  document.addEventListener("DOMContentLoaded", () => {
    el("notifyBtn")?.addEventListener("click", togglePanel);
    setBadge(0);
    if (window.SF_API) {
      window.SF_API.onAuthChange(() => refreshBadge());
      // initial (SF_API.init runs in app.js and emits onAuthChange → refreshBadge)
    }
  });
})();
