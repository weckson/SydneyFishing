// Sydney Fishing PWA service worker
// Strategy:
// - App shell (HTML/CSS/JS/icons/data) → cache-first (offline capable)
// - Leaflet tiles (CartoDB) → stale-while-revalidate
// - Open-Meteo weather/marine API → network-first with 10min cache fallback
// - Leaflet library CDN → cache-first after first load

const CACHE_VERSION = "v1.2.0";
const SHELL_CACHE = `sf-shell-${CACHE_VERSION}`;
const TILE_CACHE = `sf-tiles-${CACHE_VERSION}`;
const API_CACHE = `sf-api-${CACHE_VERSION}`;

const SHELL_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./spots.js",
  "./reviews.js",
  "./access.js",
  "./rigs.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png",
  "./icons/icon-167.png",
  "./icons/icon-152.png",
  "./icons/icon-120.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

// --------- install ---------
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => {
      // Use addAll with {cache: 'reload'} to bypass HTTP cache during install
      return Promise.all(
        SHELL_FILES.map(url =>
          fetch(url, { cache: "reload" })
            .then(res => { if (res.ok) cache.put(url, res); })
            .catch(() => {}) // silent fail for offline install
        )
      );
    })
  );
  self.skipWaiting();
});

// --------- activate: clean old caches ---------
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => ![SHELL_CACHE, TILE_CACHE, API_CACHE].includes(k))
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// --------- fetch handler ---------
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // CartoDB tiles — stale-while-revalidate
  if (url.hostname.endsWith("basemaps.cartocdn.com")) {
    event.respondWith(swr(req, TILE_CACHE));
    return;
  }

  // Open-Meteo weather/marine — network-first with 10-min cache fallback
  if (url.hostname.endsWith("open-meteo.com")) {
    event.respondWith(networkFirst(req, API_CACHE, 10 * 60 * 1000));
    return;
  }

  // Everything else (shell, local assets, leaflet CDN) — cache-first
  event.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        // Cache successful GETs from our origin or known CDNs
        if (res.ok && (url.origin === location.origin || url.hostname.includes("unpkg.com"))) {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => {
        // Offline fallback: if HTML navigation, return cached index
        if (req.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});

// ---- helpers ----
function swr(req, cacheName) {
  return caches.open(cacheName).then(cache =>
    cache.match(req).then(cached => {
      const fetchPromise = fetch(req)
        .then(res => { if (res.ok) cache.put(req, res.clone()); return res; })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
}

function networkFirst(req, cacheName, maxAgeMs) {
  return caches.open(cacheName).then(cache =>
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          cache.put(req, new Response(copy.body, {
            status: copy.status,
            headers: new Headers({
              ...Object.fromEntries(copy.headers.entries()),
              "sw-cached-at": Date.now().toString()
            })
          }));
        }
        return res;
      })
      .catch(() =>
        cache.match(req).then(cached => {
          if (!cached) return new Response(JSON.stringify({ error: "offline" }), {
            status: 503, headers: { "Content-Type": "application/json" }
          });
          const cachedAt = parseInt(cached.headers.get("sw-cached-at") || "0", 10);
          if (maxAgeMs && Date.now() - cachedAt > maxAgeMs * 6) {
            // very old cache still better than nothing, but mark it
          }
          return cached;
        })
      )
  );
}
