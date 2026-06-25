// Community forum — an in-app view layered over the map, driven by hash routes so threads
// are shareable by URL:
//   #/forum            -> board list
//   #/forum/c/<id>     -> threads in a board
//   #/forum/t/<id>     -> a thread + replies
// Depends on globals: SF_API, escapeHtml, safeUrl, SF_AUTH_UI (all loaded before this file).
(function () {
  const esc = (s) => (window.escapeHtml ? window.escapeHtml(s) : String(s || ""));
  // Inline SVG icon from the sprite in index.html (name is always a fixed literal — CSP-safe).
  const ic = (n) => `<svg class="ic" aria-hidden="true"><use href="#ic-${n}"></use></svg>`;
  const view = () => document.getElementById("forumView");
  const inner = () => document.getElementById("forumInner");

  function open() { view()?.classList.remove("hidden"); }
  function close() { view()?.classList.add("hidden"); }
  function go(hash) { location.hash = hash; }

  function fmtDate(s) {
    if (!s) return "";
    try {
      return new Intl.DateTimeFormat("zh-CN", { timeZone: "Australia/Sydney", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(s));
    } catch (e) { return String(s).slice(0, 16); }
  }
  function needLogin() {
    if (window.SF_API && window.SF_API.user) return false;
    window.SF_AUTH_UI?.openModal("login");
    return true;
  }
  // Preserve paragraph breaks in user text without allowing any HTML.
  function bodyHtml(text) { return esc(text).replace(/\n/g, "<br>"); }

  function loading() { inner().innerHTML = `<div class="forum-loading">加载中…</div>`; }
  function errorBox(msg) { inner().innerHTML = `<div class="forum-error">${esc(msg || "出错了")}</div><div class="forum-bar"><button class="forum-back" id="fbBack">← 返回</button></div>`; document.getElementById("fbBack").onclick = () => go("#/forum"); }

  const topBar = (title, backHash) => `
    <div class="forum-bar">
      ${backHash != null ? `<button class="forum-back" data-back="${esc(backHash)}">←</button>` : `<span class="forum-logo">${ic("chat")}</span>`}
      <div class="forum-title">${esc(title)}</div>
      <button class="forum-close" id="forumCloseBtn">×</button>
    </div>`;

  function wireBar() {
    inner().querySelectorAll("[data-back]").forEach(b => b.onclick = () => go(b.dataset.back));
    const c = document.getElementById("forumCloseBtn");
    // Deterministic close → home (map). history.back() could leave the app if the previous
    // entry was an external page, so clear the hash and hide the overlay directly.
    if (c) c.onclick = () => { close(); if ((location.hash || "").startsWith("#/forum")) go(""); };
  }

  // ---------- board list ----------
  async function renderBoards() {
    open(); loading();
    let data;
    try { data = await window.SF_API.forumCategories(); }
    catch (e) { return errorBox(e.message); }
    const card = (c) => `
      <button class="board-card" data-cat="${c.id}">
        <div class="board-name">${esc(c.name_cn)} <span class="board-en">${esc(c.name)}</span></div>
        <div class="board-desc">${esc(c.descr_cn || "")}</div>
        <div class="board-count">${c.threadCount} 帖</div>
      </button>`;
    // Split topic boards from regional boards (r- slug prefix) for a clearer two-group layout.
    const topics = data.categories.filter(c => !(c.slug || "").startsWith("r-"));
    const regions = data.categories.filter(c => (c.slug || "").startsWith("r-"));
    let body = `<div class="board-list">${topics.map(card).join("")}</div>`;
    if (regions.length) body += `<div class="board-group-title">区域版块 · Regions</div><div class="board-list">${regions.map(card).join("")}</div>`;
    inner().innerHTML = topBar("社区 · Community", null) + body;
    wireBar();
    inner().querySelectorAll(".board-card").forEach(b => b.onclick = () => go("#/forum/c/" + b.dataset.cat));
  }

  // ---------- thread list ----------
  async function renderThreads(catId) {
    open(); loading();
    let data;
    try { data = await window.SF_API.forumThreads(catId); }
    catch (e) { return errorBox(e.message); }
    const rows = data.threads.map(t => `
      <button class="thread-row" data-tid="${t.id}">
        <div class="thread-row-main">
          <div class="thread-row-title">${t.is_pinned ? `<span class="thread-pin">${ic("pinned")}</span>` : ""}${esc(t.title)}</div>
          <div class="thread-row-meta">${esc(t.author_name || "钓友")} · ${fmtDate(t.last_post_at)}</div>
        </div>
        <div class="thread-row-stats"><span>${ic("chat")} ${t.reply_count}</span><span>${ic("thumb")} ${t.like_count}</span></div>
      </button>`).join("") || `<div class="forum-empty">还没有帖子，来发第一帖</div>`;
    inner().innerHTML = topBar("板块 · Board", "#/forum") +
      `<div class="thread-list">${rows}</div>
       <button class="forum-fab" id="newThreadBtn">＋ 发帖</button>`;
    wireBar();
    inner().querySelectorAll(".thread-row").forEach(r => r.onclick = () => go("#/forum/t/" + r.dataset.tid));
    document.getElementById("newThreadBtn").onclick = () => { if (!needLogin()) openComposer(catId); };
  }

  function openComposer(catId) {
    inner().insertAdjacentHTML("beforeend", `
      <div class="forum-modal" id="composerModal">
        <div class="forum-compose">
          <h3>发新帖 · New Thread</h3>
          <input id="nt-title" maxlength="140" placeholder="标题 Title" />
          <textarea id="nt-body" maxlength="8000" placeholder="正文 · 分享你的经验、问题或钓获…"></textarea>
          <div class="forum-compose-actions">
            <button id="nt-cancel" class="btn-ghost">取消</button>
            <button id="nt-submit" class="btn-primary">发布</button>
          </div>
        </div>
      </div>`);
    const modal = document.getElementById("composerModal");
    const closeC = () => modal.remove();
    document.getElementById("nt-cancel").onclick = closeC;
    modal.onclick = (e) => { if (e.target === modal) closeC(); };
    document.getElementById("nt-submit").onclick = async () => {
      const title = document.getElementById("nt-title").value.trim();
      const body = document.getElementById("nt-body").value.trim();
      if (title.length < 2) { alert("标题太短"); return; }
      if (!body) { alert("请输入正文"); return; }
      const btn = document.getElementById("nt-submit"); btn.disabled = true;
      try {
        const r = await window.SF_API.forumCreateThread({ categoryId: Number(catId), title, body, bodyLang: "zh" });
        closeC();
        go("#/forum/t/" + r.id);
      } catch (e) { alert(e.message || "发布失败"); btn.disabled = false; }
    };
  }

  // ---------- thread detail ----------
  async function renderThread(threadId) {
    open(); loading();
    let data;
    try { data = await window.SF_API.forumThread(threadId); }
    catch (e) { return errorBox(e.status === 404 ? "帖子不存在或已删除" : e.message); }
    const t = data.thread;
    const posts = data.posts.map(p => postHtml(p)).join("");
    const replyArea = (window.SF_API && window.SF_API.user)
      ? `<div class="reply-box">
           <textarea id="reply-body" maxlength="8000" placeholder="回复… Reply"></textarea>
           <button id="reply-submit" class="btn-primary">回复</button>
         </div>`
      : `<div class="reply-box"><button class="btn-primary" id="reply-login">登录后回复</button></div>`;
    inner().innerHTML = topBar(t.title, "#/forum/c/" + t.category_id) + `
      <div class="thread-detail">
        <div class="thread-head">
          <h2>${esc(t.title)}</h2>
          <div class="thread-head-meta">${esc(t.author_name)} · ${fmtDate(t.created_at)} · ${ic("chat")} ${t.reply_count}</div>
          <div class="thread-actions">
            ${likeBtn("thread", t.id, t.liked, t.like_count)}
            <button class="act-share" data-share="${esc("#/forum/t/" + t.id)}">${ic("share")} 分享</button>
            ${t.canDelete ? `<button class="act-del" data-del-thread="${t.id}">删除</button>` : `<button class="act-report" data-report-type="thread" data-report-id="${t.id}">${ic("flag")} 举报</button>`}
          </div>
        </div>
        <div class="post-list">${posts}</div>
        ${t.is_locked ? `<div class="thread-locked">${ic("lock")} 该主题已锁定</div>` : replyArea}
      </div>`;
    wireBar();
    wireThread(threadId);
  }

  function postHtml(p) {
    return `
      <div class="post-item${p.is_op ? " op" : ""}" data-pid="${p.id}">
        <div class="post-meta"><span class="post-author">${esc(p.author_name || "钓友")}</span>${p.is_op ? ' <span class="op-badge">楼主</span>' : ""}<span class="post-date">${fmtDate(p.created_at)}</span></div>
        <div class="post-body">${bodyHtml(p.body)}</div>
        <div class="post-actions">
          ${likeBtn("post", p.id, p.liked, p.like_count)}
          ${p.canDelete && !p.is_op ? `<button class="act-del" data-del-post="${p.id}">删除</button>` : (!p.is_op ? `<button class="act-report" data-report-type="post" data-report-id="${p.id}">${ic("flag")} 举报</button>` : "")}
        </div>
      </div>`;
  }

  function likeBtn(type, id, liked, count) {
    return `<button class="act-like${liked ? " liked" : ""}" data-like-type="${type}" data-like-id="${id}">${ic("thumb")} <span class="like-n">${count}</span></button>`;
  }

  function wireThread(threadId) {
    // likes
    inner().querySelectorAll(".act-like").forEach(b => b.onclick = async () => {
      if (needLogin()) return;
      try {
        const r = await window.SF_API.forumReact(b.dataset.likeType, Number(b.dataset.likeId));
        b.classList.toggle("liked", r.liked);
        b.querySelector(".like-n").textContent = r.count;
      } catch (e) { alert(e.message); }
    });
    // share
    inner().querySelectorAll(".act-share").forEach(b => b.onclick = async () => {
      const url = location.origin + location.pathname + b.dataset.share;
      try { await navigator.clipboard.writeText(url); b.innerHTML = `${ic("check")} 链接已复制`; setTimeout(() => b.innerHTML = `${ic("share")} 分享`, 1500); }
      catch (e) { prompt("复制此链接分享：", url); }
    });
    // report
    inner().querySelectorAll(".act-report").forEach(b => b.onclick = async () => {
      if (needLogin()) return;
      const reason = prompt("举报原因（垃圾广告 / 辱骂 / 不实信息 / 其他）：");
      if (!reason) return;
      try { await window.SF_API.forumReport(b.dataset.reportType, Number(b.dataset.reportId), reason.slice(0, 40)); alert("已提交举报，感谢"); }
      catch (e) { alert(e.message); }
    });
    // delete
    inner().querySelectorAll("[data-del-thread]").forEach(b => b.onclick = async () => {
      if (!confirm("确认删除整个帖子？")) return;
      try { await window.SF_API.forumDeleteThread(Number(b.dataset.delThread)); go("#/forum"); }
      catch (e) { alert(e.message); }
    });
    inner().querySelectorAll("[data-del-post]").forEach(b => b.onclick = async () => {
      if (!confirm("确认删除此回复？")) return;
      try { await window.SF_API.forumDeletePost(Number(b.dataset.delPost)); renderThread(threadId); }
      catch (e) { alert(e.message); }
    });
    // reply
    document.getElementById("reply-login")?.addEventListener("click", () => window.SF_AUTH_UI?.openModal("login"));
    const submit = document.getElementById("reply-submit");
    if (submit) submit.onclick = async () => {
      const body = document.getElementById("reply-body").value.trim();
      if (!body) { alert("请输入回复内容"); return; }
      submit.disabled = true;
      try { await window.SF_API.forumReply(Number(threadId), body, "zh"); renderThread(threadId); }
      catch (e) { alert(e.message || "回复失败"); submit.disabled = false; }
    };
  }

  // ---------- router ----------
  function route() {
    const h = location.hash || "";
    const m = h.match(/^#\/forum(?:\/(c|t)\/(\d+))?/);
    if (!m) { close(); return; }
    if (m[1] === "c") renderThreads(m[2]);
    else if (m[1] === "t") renderThread(m[2]);
    else renderBoards();
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("communityBtn")?.addEventListener("click", () => go("#/forum"));
    // Re-render the open forum view when auth changes (so reply/compose gates update).
    window.SF_API?.onAuthChange(() => { if (location.hash.startsWith("#/forum")) route(); });
    // Deep-link on first load.
    if (location.hash.startsWith("#/forum")) route();
  });
})();
