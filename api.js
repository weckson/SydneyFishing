// API client for the Sydney Fishing backend.
// - All calls are credentialed (HttpOnly cookie session).
// - Degrades gracefully: if the backend is unreachable, the PWA keeps working as a pure
//   map/scoring tool and reviews fall back to localStorage (legacy behaviour).
// Override the API base by setting window.SF_CONFIG = { apiBase: "https://api.example" }
// BEFORE this script loads. Default: localhost:3000 during static-preview dev, else same-origin.
(function () {
  const cfg = window.SF_CONFIG || {};
  const API_BASE = cfg.apiBase != null
    ? cfg.apiBase
    : (location.port === "5500" || location.port === "5501" ? "http://localhost:3000" : "");

  const listeners = new Set();
  // Default features all-on; the real set comes from GET /api/meta on init (and the server
  // enforces them regardless, so a stale default can't expose a disabled feature).
  const DEFAULT_FEATURES = { photos: true, emailVerify: true, catches: true, reviews: true, forum: true, insights: true };
  const state = { user: null, available: false, ready: false, features: { ...DEFAULT_FEATURES } };

  async function req(path, { method = "GET", body } = {}) {
    const res = await fetch(API_BASE + path, {
      method,
      credentials: "include",
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON */ }
    if (!res.ok) {
      const err = new Error((data && data.message) || `HTTP ${res.status}`);
      err.status = res.status;
      err.code = data && data.error;
      throw err;
    }
    return data;
  }

  function emit() { listeners.forEach(cb => { try { cb(state.user); } catch (e) {} }); }

  const SF_API = {
    base: API_BASE,
    get user() { return state.user; },
    get available() { return state.available; },
    get ready() { return state.ready; },
    onAuthChange(cb) { listeners.add(cb); return () => listeners.delete(cb); },

    get features() { return state.features; },

    // Probe session + backend availability + feature flags. 401 on /me = backend up, logged out.
    async init() {
      try {
        const m = await req("/api/meta");
        if (m && m.features) state.features = { ...DEFAULT_FEATURES, ...m.features };
      } catch (e) { /* keep defaults */ }
      try {
        const r = await req("/api/auth/me");
        state.user = r.user; state.available = true;
      } catch (e) {
        state.available = e.status === 401;     // reachable but unauthenticated
        state.user = null;
      }
      state.ready = true;
      emit();
      return state;
    },

    async register(email, password, displayName, preferredLang) {
      const r = await req("/api/auth/register", { method: "POST", body: { email, password, displayName, preferredLang } });
      state.user = r.user; state.available = true; emit(); return r.user;
    },
    async login(email, password) {
      const r = await req("/api/auth/login", { method: "POST", body: { email, password } });
      state.user = r.user; state.available = true; emit(); return r.user;
    },
    async logout() {
      try { await req("/api/auth/logout", { method: "POST" }); } catch (e) {}
      state.user = null; emit();
    },
    resendVerify() { return req("/api/auth/verify/send", { method: "POST" }); },

    // reviews
    getReviews(spotId) { return req(`/api/reviews?spotId=${encodeURIComponent(spotId)}`); },
    addReview(payload) { return req("/api/reviews", { method: "POST", body: payload }); },
    importReviews(items) { return req("/api/reviews/import", { method: "POST", body: { items } }); },
    deleteReview(id) { return req(`/api/reviews/${encodeURIComponent(id)}`, { method: "DELETE" }); },

    // catch reports
    getCatches(spotId) { return req(`/api/catches?spotId=${encodeURIComponent(spotId)}`); },
    getMyCatches() { return req("/api/catches/mine"); },
    addCatch(payload) { return req("/api/catches", { method: "POST", body: payload }); },
    deleteCatch(id) { return req(`/api/catches/${id}`, { method: "DELETE" }); },

    // media (multipart upload; browser sets the multipart boundary, so no content-type header)
    async addMedia(file) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(API_BASE + "/api/media", { method: "POST", credentials: "include", body: fd });
      let data = null;
      try { data = await res.json(); } catch (e) {}
      if (!res.ok) {
        const err = new Error((data && data.message) || `HTTP ${res.status}`);
        err.status = res.status; throw err;
      }
      return data; // { id, thumb, full }  (paths relative to the API origin)
    },
    // Resolve a media path to a loadable URL. Absolute (R2/CDN) passes through; API-relative
    // (local-disk driver) gets the API origin prepended.
    mediaUrl(path) { return path ? (/^https?:\/\//.test(path) ? path : API_BASE + path) : ""; },

    // forum
    forumCategories() { return req("/api/forum/categories"); },
    forumThreads(categoryId) { return req(`/api/forum/threads?categoryId=${encodeURIComponent(categoryId)}`); },
    forumThread(id) { return req(`/api/forum/threads/${encodeURIComponent(id)}`); },
    forumCreateThread(payload) { return req("/api/forum/threads", { method: "POST", body: payload }); },
    forumReply(threadId, body, bodyLang) { return req(`/api/forum/threads/${encodeURIComponent(threadId)}/posts`, { method: "POST", body: { body, bodyLang } }); },
    forumReact(targetType, targetId) { return req("/api/forum/react", { method: "POST", body: { targetType, targetId } }); },
    forumReport(targetType, targetId, reason, detail) { return req("/api/forum/report", { method: "POST", body: { targetType, targetId, reason, detail } }); },
    forumDeleteThread(id) { return req(`/api/forum/threads/${encodeURIComponent(id)}`, { method: "DELETE" }); },
    forumDeletePost(id) { return req(`/api/forum/posts/${encodeURIComponent(id)}`, { method: "DELETE" }); },

    // notifications
    getNotifications() { return req("/api/notifications"); },
    getUnread() { return req("/api/notifications/unread"); },
    markNotificationsRead() { return req("/api/notifications/read", { method: "POST" }); },

    // insights ("what's biting")
    getInsights() { return req("/api/insights"); }
  };

  window.SF_API = SF_API;
})();
