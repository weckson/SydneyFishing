// Auth UI: header button + login/register modal + logged-in dropdown.
// Wires the static markup in index.html (#authBtn, #authModal). No inline data interpolation
// (user data is set via textContent), so it stays safe under a future strict CSP.
(function () {
  let mode = "login";
  const el = id => document.getElementById(id);

  function refreshHeader(user) {
    const label = el("authBtnLabel");
    const btn = el("authBtn");
    if (!label || !btn) return;
    label.textContent = user ? (user.displayName || user.email.split("@")[0]) : "登录";
    btn.classList.toggle("authed", !!user);
  }

  function syncTabs() {
    document.querySelectorAll(".auth-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === mode));
    const name = el("authName");
    if (name) name.style.display = mode === "register" ? "" : "none";
    const sub = el("authSubmit");
    if (sub) sub.textContent = mode === "register" ? "注册 Sign up" : "登录 Sign in";
    const pass = el("authPass");
    if (pass) pass.setAttribute("autocomplete", mode === "register" ? "new-password" : "current-password");
  }

  function openModal(which) {
    mode = which || "login";
    syncTabs();
    if (el("authErr")) el("authErr").textContent = "";
    el("authModal")?.classList.remove("hidden");
    setTimeout(() => el("authEmail")?.focus(), 30);
  }
  function closeModal() { el("authModal")?.classList.add("hidden"); }

  async function submit() {
    const email = el("authEmail").value.trim();
    const pass = el("authPass").value;
    const name = el("authName").value.trim();
    const err = el("authErr");
    err.textContent = "";
    if (!email || !pass) { err.textContent = "请输入邮箱和密码"; return; }
    if (mode === "register" && pass.length < 8) { err.textContent = "密码至少 8 位 · Password ≥ 8 chars"; return; }
    const btn = el("authSubmit");
    btn.disabled = true;
    try {
      if (mode === "register") await window.SF_API.register(email, pass, name || undefined);
      else await window.SF_API.login(email, pass);
      closeModal();
    } catch (e) {
      err.textContent = e.message || "操作失败 · Failed";
    } finally {
      btn.disabled = false;
    }
  }

  // Logged-in dropdown (built with textContent — no HTML injection of user data).
  function toggleMenu() {
    const existing = el("authMenu");
    if (existing) { existing.remove(); return; }
    const user = window.SF_API.user;
    if (!user) return;
    const menu = document.createElement("div");
    menu.id = "authMenu";
    menu.className = "auth-menu";
    const emailVerifyOn = !(window.SF_API.features && window.SF_API.features.emailVerify === false);
    const who = document.createElement("div");
    who.className = "auth-menu-user";
    who.textContent = user.email + (!emailVerifyOn ? "" : (user.emailVerified ? " ✓" : " · 未验证"));
    menu.append(who);

    if (emailVerifyOn && !user.emailVerified) {
      const verify = document.createElement("button");
      verify.className = "auth-menu-item";
      verify.textContent = "✉️ 验证邮箱 · Verify email";
      verify.onclick = async () => {
        verify.disabled = true; verify.textContent = "发送中…";
        try {
          const r = await window.SF_API.resendVerify();
          if (r.alreadyVerified) { alert("邮箱已验证"); }
          else if (r.devUrl) {
            // Dev convenience: open the verification link directly.
            if (confirm("开发模式：点击确定打开验证链接完成验证")) window.open(r.devUrl, "_blank");
          } else { alert("验证邮件已发送，请查收邮箱"); }
        } catch (e) { alert(e.message || "发送失败"); }
        menu.remove();
      };
      menu.append(verify);
    }

    const out = document.createElement("button");
    out.className = "auth-menu-item";
    out.textContent = "退出登录 · Sign out";
    out.onclick = async () => { await window.SF_API.logout(); menu.remove(); };
    menu.append(out);
    const btn = el("authBtn");
    btn.parentElement.appendChild(menu);
    setTimeout(() => document.addEventListener("click", function h(ev) {
      if (!menu.contains(ev.target) && !btn.contains(ev.target)) { menu.remove(); document.removeEventListener("click", h); }
    }), 0);
  }

  window.SF_AUTH_UI = { openModal, closeModal };

  document.addEventListener("DOMContentLoaded", () => {
    el("authBtn")?.addEventListener("click", () => {
      if (window.SF_API && window.SF_API.user) toggleMenu();
      else openModal("login");
    });
    el("authClose")?.addEventListener("click", closeModal);
    el("authModal")?.addEventListener("click", e => { if (e.target.id === "authModal") closeModal(); });
    document.querySelectorAll(".auth-tab").forEach(t =>
      t.addEventListener("click", () => { mode = t.dataset.tab; if (el("authErr")) el("authErr").textContent = ""; syncTabs(); }));
    el("authSubmit")?.addEventListener("click", submit);
    el("authPass")?.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
    syncTabs();
    if (window.SF_API) window.SF_API.onAuthChange(refreshHeader);
  });
})();
