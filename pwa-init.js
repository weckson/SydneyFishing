// PWA bootstrap: service-worker registration + iOS "Add to Home Screen" hint.
// Externalized from index.html so the page can run under a strict CSP (script-src 'self',
// no 'unsafe-inline').

// --- Service Worker ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js")
      .then(reg => console.log("[PWA] SW registered:", reg.scope))
      .catch(err => console.warn("[PWA] SW registration failed:", err));
  });
}

// --- iOS "Add to Home Screen" hint (once, first-time Safari visitors) ---
(function () {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone === true ||
                       window.matchMedia("(display-mode: standalone)").matches;
  if (isIOS && !isStandalone && !localStorage.getItem("sf_a2hs_dismissed")) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const banner = document.createElement("div");
        banner.className = "a2hs-banner";
        banner.innerHTML = `
          <div class="a2hs-icon">🎣</div>
          <div class="a2hs-text">
            <b>加入主屏幕</b>
            <small>点击 Safari 分享按钮 <span style="font-size:16px">⎋</span> → 添加到主屏幕</small>
          </div>
          <button class="a2hs-close">×</button>
        `;
        document.body.appendChild(banner);
        banner.querySelector(".a2hs-close").onclick = () => {
          banner.remove();
          localStorage.setItem("sf_a2hs_dismissed", "1");
        };
      }, 2500);
    });
  }
})();
