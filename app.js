// Sydney Fishing App — main logic (scoring v1.4)
// - Leaflet map of Sydney
// - Geolocation to find nearest best spots
// - Open-Meteo free weather + marine + tide API (no key) for scoring
// - Score = baseScore × weather × tide × time × moon × season × access  (= 钓况分, shown to user)
//   Ranking additionally applies the mode's distance penalty (distance never changes the shown score)
// - Conditions are fetched per coastal region (batched multi-coordinate Open-Meteo calls),
//   so a Newcastle spot is scored with Newcastle swell/tide, not the map center's.
// - All time math uses epoch ms (timeformat=unixtime); display formats in Australia/Sydney,
//   so the app stays correct even when the device timezone isn't Sydney.

const SYDNEY_CENTER = [-33.8688, 151.2093];
const COMPASS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
// Scoring engine version. Stamped into every catch_report's conditions_snapshot so that, as
// the multipliers evolve, past snapshots stay comparable within their own version cohort.
const ENGINE_VERSION = "1.5";

// ---------- Scoring Modes ----------
// Each mode adjusts how much each factor influences the final score.
const SCORING_MODES = {
  fish: {
    label: "🏆 鱼况优先",
    description: "忽略距离，baseScore 主导；最适合计划一次钓鱼远征",
    distancePenalty: () => 1.0,
    accessRange: [0.95, 1.05],   // very gentle
    terrainFilter: null
  },
  near: {
    label: "📍 就近钓点",
    description: "按距离惩罚排序；适合下班顺路/时间紧",
    distancePenalty: d => Math.max(0.3, 1 - d / 50),
    accessRange: [0.90, 1.10],
    terrainFilter: null
  },
  family: {
    label: "👨‍👩‍👧 家庭友好",
    description: "强化交通权重，自动隐藏危险岩钓点",
    distancePenalty: d => Math.max(0.75, 1 - d / 80),
    accessRange: [0.50, 1.25],   // strong
    terrainFilter: ["hard", "extreme"]
  }
};

const DEFAULT_TIDE_BY_TYPE = {
  rock: "rising",
  beach: "rising",
  estuary: "falling",
  harbour: "any"
};

let map, userMarker, userLatLng = null;
let spotMarkers = [];
let shopMarkers = [];
let shopsVisible = false;
let currentWeather = null;  // { weather, marine, tide, sun }
let sortedSpots = [];
let currentMode = "fish";   // default: fish-first
let mapCenterLatLng = null;   // Updated on map moveend, used as reference point for scoring
let mapMoveTimer = null;      // Debounce timer for moveend
let conditionsCenterLatLng = null;  // Last center used to fetch weather/tide conditions
let radiusCircle = null;      // Leaflet circle visualizing current search radius around map center
let sheetState = "collapsed"; // "collapsed" | "half" | "full" — mobile bottom sheet state

function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

// ---- Display normalization (v1.4.1: reputation anchor + conditions swing) ----
// The raw multiplicative score is upward-inflated by asymmetric factor floors (weather ≥1.15,
// tide +18%/−10%, moon flat 1.05), so the old "raw ÷ 2" both inflated neutral days AND
// compressed the top — everything crammed into ~32–88. Instead we map a spot's REPUTATION
// (baseScore 62..94) onto a neutral-day band, then let the live multiplier product swing it
// toward 100 (great day) or 0 (storm). All six knobs are named constants — retune freely.
const DISPLAY_NEUTRAL_BASE_LO = 62;   // empirical baseScore floor (measured min)
const DISPLAY_NEUTRAL_BASE_HI = 94;   // empirical baseScore ceiling (measured max)
const DISPLAY_NEUTRAL_LO      = 55;   // a 62-rep spot reads ~55 on a neutral day
const DISPLAY_NEUTRAL_HI      = 84;   // a 94-rep spot reads ~84 on a neutral day
const DISPLAY_NEUTRAL_PRODUCT = 1.20; // "average day" multiplier baseline (weather-floor 1.15 × moon 1.05);
                                      // a spot at this product reads ≈ its reputation band
const DISPLAY_SWING_GAIN      = 0.9;  // log2 sensitivity: how hard conditions move the score
const DISPLAY_MAX_DOWN        = 0.92; // worst-day floor keeps ~8% of neutral (no dead 0)

// Map reputation + live multiplier product onto the full 0-100 scale. Neutral day
// (product ≈ DISPLAY_NEUTRAL_PRODUCT) reads ≈ the spot's reputation band; great day → ~100;
// storm → near 0.
// NOTE: this is NOT a pure function of the raw condScore — two spots with the same condScore
// but different baseScore display differently. Ranking is unaffected because every sort/compare
// uses `.score` (= condScore × distancePenalty); `.displayScore` is render-only.
// ⚠️ DO NOT sort or compare on `.displayScore` or you will reorder the board.
function displayScoreFor(baseScore, product) {
  const t = Math.max(0, Math.min(1,
    (baseScore - DISPLAY_NEUTRAL_BASE_LO) / (DISPLAY_NEUTRAL_BASE_HI - DISPLAY_NEUTRAL_BASE_LO)));
  const neutral = DISPLAY_NEUTRAL_LO + (DISPLAY_NEUTRAL_HI - DISPLAY_NEUTRAL_LO) * t;
  let s = DISPLAY_SWING_GAIN * Math.log(product / DISPLAY_NEUTRAL_PRODUCT) / Math.LN2; // log2 ratio
  s = Math.max(-DISPLAY_MAX_DOWN, Math.min(1, s));
  const score = s >= 0 ? neutral + s * (100 - neutral) : neutral * (1 + s);
  return Math.max(0, Math.min(100, Math.round(score)));
}

// scoreSpot now returns an ALREADY-finished 0-100 displayScore, so render call sites use it
// directly. toDisplayScore is kept ONLY as a safe clamp+round for the one external caller
// (scene.js, via window.toDisplayScore) which passes a finished displayScore. It is a pure
// clamp — NOT the old "halve raw" shim — so it can never silently mis-scale a value.
function toDisplayScore(value) {
  if (value == null) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

// ---------- Time & timezone helpers ----------
// All comparisons use epoch ms; display always formats in Sydney time so the app
// shows correct windows/tides even if the device timezone is not Australia/Sydney.
const SYDNEY_TZ = "Australia/Sydney";

// Formatters are cached: constructing Intl.DateTimeFormat is expensive and render()
// calls these for all ~200 spots.
const SYDNEY_PARTS_FMT = new Intl.DateTimeFormat("en-AU", {
  timeZone: SYDNEY_TZ, hour12: false,
  year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric"
});
const SYDNEY_TIME_FMT = new Intl.DateTimeFormat("en-AU", {
  timeZone: SYDNEY_TZ, hour: "2-digit", minute: "2-digit", hour12: false
});

function sydneyParts(ms = Date.now()) {
  const parts = {};
  SYDNEY_PARTS_FMT.formatToParts(new Date(ms)).forEach(p => {
    if (p.type !== "literal") parts[p.type] = parseInt(p.value, 10);
  });
  if (parts.hour === 24) parts.hour = 0;
  return parts; // { year, month (1-12), day, hour, minute }
}

// Moon phase fraction: 0 = new, 0.5 = full. Synodic approximation, good to ~1-2h.
function moonPhaseFraction(ms = Date.now()) {
  const SYNODIC = 29.53058867;
  const ref = Date.UTC(2000, 0, 6, 18, 14); // reference new moon
  const days = (ms - ref) / 86400000;
  return (((days % SYNODIC) + SYNODIC) % SYNODIC) / SYNODIC;
}

// New/full moon → spring tides (stronger flow, better predator bite): small bonus.
function moonInfo(ms = Date.now()) {
  const f = moonPhaseFraction(ms);
  if (f < 0.07 || f > 0.93) return { label: "🌑 新月", mult: 1.05, springy: true };
  if (Math.abs(f - 0.5) < 0.07) return { label: "🌕 满月", mult: 1.05, springy: true };
  if (Math.abs(f - 0.25) < 0.07) return { label: "🌓 上弦月", mult: 0.97, springy: false };
  if (Math.abs(f - 0.75) < 0.07) return { label: "🌗 下弦月", mult: 0.97, springy: false };
  return { label: f < 0.5 ? "🌒 盈月" : "🌘 亏月", mult: 1.0, springy: false };
}

// Pressure change over the last ~3h in hPa (negative = falling barometer).
function pressureTrend(pressure, nowMs = Date.now()) {
  if (!pressure || !pressure.time || pressure.time.length < 4) return null;
  const nowSec = nowMs / 1000;
  let idx = 0;
  for (let i = 0; i < pressure.time.length; i++) {
    if (pressure.time[i] <= nowSec) idx = i; else break;
  }
  const back = Math.max(0, idx - 3);
  if (idx === back) return null;
  return pressure.values[idx] - pressure.values[back];
}

// Season factor: how active are this spot's target species in the current Sydney month?
// Species earlier in the spot's list (primary targets) weigh more.
function seasonFactorFor(spot, nowMs = Date.now()) {
  const table = window.SPECIES_SEASONS;
  if (!table || !spot.species || !spot.species.length) {
    return { mult: 1.0, reason: null, inSeason: [], offSeason: [] };
  }
  const month = sydneyParts(nowMs).month - 1;
  // Strength-weighting (v1.5): weight each species by how IN-SEASON it is this month, NOT by its
  // position in spot.species. The old order-weighting assumed species were listed by importance —
  // they aren't (33% of spots' species[0] disagreed with their prose lead species), so winter
  // spots were dragged down by a summer species that happened to be listed first. Now whatever is
  // genuinely biting this month dominates, regardless of list order. Species missing from the
  // table are SKIPPED (not counted as a neutral 1.0) so data gaps don't silently anchor the score.
  const SEASON_STRENGTH_FLOOR = 0.5; // clamp before squaring so off-season species still count a little
  let acc = 0, wSum = 0;
  const inSeason = [], offSeason = [];
  spot.species.forEach((sp) => {
    if (!table[sp]) { if (window.SF_DEBUG) console.warn("season: no table for", sp); return; }
    const m = table[sp][month];
    const w = Math.pow(Math.max(m, SEASON_STRENGTH_FLOOR), 2); // in-season species weigh most
    acc += m * w; wSum += w;
    if (m >= 1.1) inSeason.push(sp);
    else if (m <= 0.75) offSeason.push(sp);
  });
  const mult = wSum > 0 ? acc / wSum : 1.0;
  const pct = ((mult - 1) * 100).toFixed(0);
  let reason = null;
  if (mult >= 1.05 && inSeason.length) reason = `当季鱼种 ${inSeason.slice(0, 3).join("/")} (+${pct}%)`;
  else if (mult <= 0.92 && offSeason.length) reason = `主力鱼种非当季 ${offSeason.slice(0, 2).join("/")} (${pct}%)`;
  return { mult, reason, inSeason, offSeason };
}

// Returns the reference point for scoring: map center if map has been moved, else user location, else Sydney CBD.
function referencePoint() {
  return mapCenterLatLng || userLatLng || SYDNEY_CENTER;
}

function degToCompass(deg) {
  if (deg == null) return "-";
  return COMPASS[Math.round(deg / 22.5) % 16];
}

function haversineKm(a, b) {
  const R = 6371;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const x = Math.sin(dLat/2)**2 + Math.sin(dLng/2)**2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

function initMap() {
  // Extended initial view covers Sydney (center) with enough zoom-out capability for Newcastle/Wollongong
  map = L.map("map", {
    zoomControl: true,
    minZoom: 7,            // zoom 7 shows from Newcastle to Kiama easily
    maxZoom: 20,
    worldCopyJump: false
  }).setView(SYDNEY_CENTER, 10);
  // CartoDB Voyager — free, no API key, no referer requirement, clean look
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    subdomains: "abcd",
    attribution: '© OpenStreetMap · © CARTO'
  }).addTo(map);
  // Initial reference point = initial map center
  const c0 = map.getCenter();
  mapCenterLatLng = [c0.lat, c0.lng];
  drawSpotMarkers();
  drawRadiusCircle();
  addShopsControl();

  // Dynamic: on move (live) keep circle centered; on moveend update scoring.
  map.on("move", () => {
    // keep circle pinned to map center during pan
    if (radiusCircle) {
      const c = map.getCenter();
      radiusCircle.setLatLng(c);
    }
  });

  map.on("moveend", () => {
    const c = map.getCenter();
    mapCenterLatLng = [c.lat, c.lng];
    drawRadiusCircle(); // refresh in case zoom changed
    if (mapMoveTimer) clearTimeout(mapMoveTimer);
    mapMoveTimer = setTimeout(async () => {
      // Instant: reflect the nearest preloaded zone's conditions at the new center (no network),
      // so the weather pill updates as the pin moves across Sydney instead of feeling stuck.
      const near = nearestRegionConditions(mapCenterLatLng);
      if (near) { currentWeather = near; conditionsCenterLatLng = mapCenterLatLng; showWeather(); }
      // Only hit the network when we have no cached conditions near the new center, or drifted far.
      if (!near || shouldRefetchConditions()) {
        await loadConditionsAt(mapCenterLatLng);
      }
      ensureRegionalFresh(); // refresh all zones in the background if the cache is stale (>10 min)
      render();
      updateReferenceIndicator();
    }, 350);
  });
}

// Draws (or updates) the Leaflet circle visualizing the current search radius around the map center.
function drawRadiusCircle() {
  if (!map) return;
  const radiusEl = document.getElementById("radiusSel");
  const radiusKm = radiusEl ? parseFloat(radiusEl.value) : 20;
  // Skip rendering circle for "unlimited" (999)
  if (radiusKm >= 999) {
    if (radiusCircle) { map.removeLayer(radiusCircle); radiusCircle = null; }
    return;
  }
  const center = map.getCenter();
  if (radiusCircle) {
    radiusCircle.setLatLng(center);
    radiusCircle.setRadius(radiusKm * 1000);
  } else {
    radiusCircle = L.circle(center, {
      radius: radiusKm * 1000,
      color: "#fb8500",
      weight: 2,
      opacity: 0.6,
      fillColor: "#fb8500",
      fillOpacity: 0.06,
      interactive: false,
      dashArray: "6 4"
    }).addTo(map);
  }
}

// Returns true if the map center is >20km away from the point we last fetched weather/tide for.
function shouldRefetchConditions() {
  if (!conditionsCenterLatLng) return true;
  return haversineKm(mapCenterLatLng, conditionsCenterLatLng) > 20;
}

function spotIcon(type, isBest, isTop) {
  const color = isBest ? "#ffb703" : isTop ? "#fb8500" : ({
    rock: "#0077b6", harbour: "#00b4d8", estuary: "#06a77d", beach: "#f4a261"
  }[type] || "#0077b6");
  const size = isBest ? 24 : isTop ? 20 : 16;
  const ring = isBest ? "box-shadow:0 0 0 4px rgba(255,183,3,.3),0 1px 4px rgba(0,0,0,.4);" :
               isTop ? "box-shadow:0 0 0 3px rgba(251,133,0,.25),0 1px 4px rgba(0,0,0,.4);" :
               "box-shadow:0 1px 4px rgba(0,0,0,.4);";
  const html = `<div style="background:${color};border:2px solid #fff;width:${size}px;height:${size}px;border-radius:50%;${ring}"></div>`;
  return L.divIcon({ html, className: "", iconSize: [size, size], iconAnchor: [size/2, size/2] });
}

function drawSpotMarkers(bestId = null, topIds = new Set()) {
  spotMarkers.forEach(m => map.removeLayer(m));
  spotMarkers = [];
  window.SYDNEY_SPOTS.forEach(s => {
    const isTop = topIds.has(s.id);
    const marker = L.marker([s.lat, s.lng], { icon: spotIcon(s.type, s.id === bestId, isTop) })
      .addTo(map)
      .bindPopup(`<b>${s.nameCn}</b><br><span style="color:#6b8299;font-size:11px">${s.name}</span><br>🐟 ${s.species.slice(0,3).join(" · ")}<br><a href="#" data-id="${s.id}" class="popup-link">查看详情 View →</a>`);
    marker.on("popupopen", () => {
      setTimeout(() => {
        document.querySelectorAll(".popup-link").forEach(el => {
          el.onclick = e => { e.preventDefault(); showDetail(s.id); };
        });
      }, 10);
    });
    spotMarkers.push(marker);
  });
}

// ---------- Tackle shops layer (toggleable; 本地渔具店) ----------
function shopIcon() {
  const html = `<div style="background:#7c3aed;border:2px solid #fff;width:14px;height:14px;border-radius:3px;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`;
  return L.divIcon({ html, className: "", iconSize: [14, 14], iconAnchor: [7, 7] });
}
function drawShopMarkers() {
  shopMarkers.forEach(m => map.removeLayer(m));
  shopMarkers = [];
  if (!shopsVisible) return;
  (window.SF_SHOPS || []).forEach(sh => {
    const url = safeUrl(sh.url);
    const link = url ? `<br><a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">📍 地图/导航 Map →</a>` : "";
    const m = L.marker([sh.lat, sh.lng], { icon: shopIcon() }).addTo(map)
      .bindPopup(`<b>${escapeHtml(sh.nameCn || sh.name)}</b><br><span style="color:#6b8299;font-size:11px">${escapeHtml(sh.name)} · ${escapeHtml(sh.suburb || "")}</span>${link}`);
    shopMarkers.push(m);
  });
}
function toggleShops() {
  shopsVisible = !shopsVisible;
  drawShopMarkers();
  const btn = document.getElementById("shopsToggle");
  if (btn) btn.classList.toggle("active", shopsVisible);
}
// Custom Leaflet control: a toggle to show/hide the tackle-shop layer.
function addShopsControl() {
  if (!map || !L.control) return;
  const ctl = L.control({ position: "topleft" });
  ctl.onAdd = function () {
    const d = L.DomUtil.create("div", "leaflet-bar shops-ctl");
    d.innerHTML = `<button id="shopsToggle" type="button" title="显示/隐藏渔具店 · Tackle shops">${svgIcon("anchor")}<span>渔具店</span></button>`;
    L.DomEvent.disableClickPropagation(d);
    d.querySelector("button").addEventListener("click", toggleShops);
    return d;
  };
  ctl.addTo(map);
}

const FORECAST_PARAMS = "current=temperature_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code&daily=sunrise,sunset&hourly=pressure_msl&past_days=1&forecast_days=2&timezone=Australia%2FSydney&timeformat=unixtime";

// Shape one Open-Meteo forecast response (single or batch entry) into our weather object.
function parseForecastEntry(data) {
  if (!data || !data.current) return null;
  return {
    ...data.current,
    _daily: data.daily || null,
    _pressure: data.hourly && data.hourly.pressure_msl
      ? { time: data.hourly.time, values: data.hourly.pressure_msl }
      : null
  };
}

async function fetchWeather(lat, lng) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&${FORECAST_PARAMS}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("weather api failed");
    return parseForecastEntry(await res.json());
  } catch (e) {
    console.warn("weather fetch failed", e);
    return null;
  }
}

// Compute today's "prime fishing windows" from REAL sunrise/sunset (epoch seconds).
// Dawn window: sunrise - 30min to sunrise + 2h30min
// Dusk window: sunset - 2h to sunset + 30min
// daily may contain yesterday/today/tomorrow rows (past_days=1&forecast_days=2):
// pick the row whose local day covers `now`.
function computePrimeWindows(daily, nowMs = Date.now()) {
  if (!daily || !daily.sunrise || !daily.sunset || !daily.time || !daily.time.length) {
    return null;
  }
  let i = daily.time.findIndex(t => nowMs >= t * 1000 && nowMs < t * 1000 + 86400000);
  if (i < 0 || daily.sunrise[i] == null || daily.sunset[i] == null) i = daily.time.length - 1;
  if (daily.sunrise[i] == null || daily.sunset[i] == null) return null;
  const sunrise = new Date(daily.sunrise[i] * 1000);
  const sunset = new Date(daily.sunset[i] * 1000);
  const dawnStart = new Date(sunrise.getTime() - 30 * 60 * 1000);
  const dawnEnd = new Date(sunrise.getTime() + 150 * 60 * 1000);
  const duskStart = new Date(sunset.getTime() - 120 * 60 * 1000);
  const duskEnd = new Date(sunset.getTime() + 30 * 60 * 1000);
  return {
    sunrise, sunset,
    dawn: { start: dawnStart, end: dawnEnd },
    dusk: { start: duskStart, end: duskEnd }
  };
}

// Format a Date as HH:MM in Sydney time regardless of device timezone.
function formatTime(date) {
  if (!date) return "-";
  return SYDNEY_TIME_FMT.format(date).replace(/^24/, "00");
}

function currentWindowStatus(windows) {
  if (!windows) return null;
  const now = new Date();
  if (now >= windows.dawn.start && now <= windows.dawn.end) return "dawn";
  if (now >= windows.dusk.start && now <= windows.dusk.end) return "dusk";
  return null;
}

async function fetchMarine(lat, lng) {
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_period,wind_wave_height&timezone=Australia%2FSydney`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("marine api failed");
    const data = await res.json();
    return data.current;
  } catch (e) {
    console.warn("marine fetch failed", e);
    return null;
  }
}

const TIDE_PARAMS = "hourly=sea_level_height_msl&past_days=1&forecast_days=2&timezone=Australia%2FSydney&timeformat=unixtime";

async function fetchTide(lat, lng) {
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&${TIDE_PARAMS}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("tide api failed");
    const data = await res.json();
    if (!data.hourly || !data.hourly.time || !data.hourly.sea_level_height_msl) return null;
    return analyzeTide(data.hourly);
  } catch (e) {
    console.warn("tide fetch failed", e);
    return null;
  }
}

// NSW phase calibration: Open-Meteo's modelled sea level at Sydney coastal grid cells
// runs systematically EARLY versus official Fort Denison tide predictions.
// Measured 2026-06-09 → 06-11 against the published tide tables: 32–40 min early on
// 7 consecutive highs/lows. Shifting the series +35 min lands within ±5 min of official.
const TIDE_PHASE_CORRECTION_MS = 35 * 60 * 1000;

// Analyze hourly sea level series → current phase/trend + minute-precision next high/low.
// Times arrive as epoch seconds (timeformat=unixtime).
function analyzeTide(hourly) {
  if (!hourly || !hourly.time || !hourly.sea_level_height_msl) return null;
  const times = hourly.time.map(t => t * 1000 + TIDE_PHASE_CORRECTION_MS);
  const levels = hourly.sea_level_height_msl;
  const n = levels.length;
  const now = Date.now();
  if (n < 4) return null;

  // --- All extremes, refined to minute level with a parabola through 3 points.
  // ">=" on the left side keeps flat-topped peaks (e.g. [0.56, 0.56]) detectable;
  // the de-dup below collapses plateau twins.
  const extremes = [];
  for (let i = 1; i < n - 1; i++) {
    const isMax = levels[i] >= levels[i - 1] && levels[i] > levels[i + 1];
    const isMin = levels[i] <= levels[i - 1] && levels[i] < levels[i + 1];
    if (!isMax && !isMin) continue;
    const y1 = levels[i - 1], y2 = levels[i], y3 = levels[i + 1];
    const denom = y1 - 2 * y2 + y3;
    const offset = denom !== 0 ? Math.max(-1, Math.min(1, 0.5 * (y1 - y3) / denom)) : 0;
    const time = times[i] + offset * 3600000;
    const level = y2 - 0.25 * (y1 - y3) * offset;
    const kind = isMax ? "high" : "low";
    const prev = extremes[extremes.length - 1];
    if (prev && prev.kind === kind && Math.abs(prev.time - time) < 2 * 3600000) continue;
    extremes.push({ kind, time, level });
  }

  // --- Current level & rate of change: parabola around the hour nearest `now`
  // (the old code used the last whole hour's value, up to 59 min stale).
  let idx = 0;
  for (let i = 0; i < n; i++) { if (times[i] <= now) idx = i; else break; }
  const c = Math.max(1, Math.min(n - 2, idx));
  const y1 = levels[c - 1], y2 = levels[c], y3 = levels[c + 1];
  const dt = (now - times[c]) / 3600000;
  const a = (y1 - 2 * y2 + y3) / 2, b = (y3 - y1) / 2;
  const current = y2 + b * dt + a * dt * dt;
  const slope = b + 2 * a * dt; // metres per hour at `now`

  const nextHighE = extremes.find(e => e.kind === "high" && e.time > now) || null;
  const nextLowE = extremes.find(e => e.kind === "low" && e.time > now) || null;
  const nearest = extremes.reduce((best, e) =>
    (!best || Math.abs(e.time - now) < Math.abs(best.time - now)) ? e : best, null);

  const trend = slope > 0.03 ? "rising" : slope < -0.03 ? "falling" : "slack";
  // Slack window: within ±40 min of an extreme (past or upcoming — the old code only
  // looked forward, so a high that peaked 20 min ago was misread as mid-falling).
  let phase;
  if (nearest && Math.abs(nearest.time - now) < 40 * 60 * 1000) {
    phase = nearest.kind === "high" ? "high-slack" : "low-slack";
  } else {
    phase = trend;
  }

  return {
    current, trend, phase,
    nextHigh: nextHighE ? { time: new Date(nextHighE.time), level: nextHighE.level } : null,
    nextLow: nextLowE ? { time: new Date(nextLowE.time), level: nextLowE.level } : null,
    hoursToHigh: nextHighE ? (nextHighE.time - now) / 3600000 : null,
    hoursToLow: nextLowE ? (nextLowE.time - now) / 3600000 : null
  };
}

// Map spot's preferredTide (or default by type) + current tide data → factor + reason.
function tideFactorFor(spot, tide) {
  if (!tide) return { mult: 1.0, reason: null };
  const pref = spot.preferredTide || DEFAULT_TIDE_BY_TYPE[spot.type] || "any";
  if (pref === "any") return { mult: 1.0, reason: null };

  const phase = tide.phase;
  const trend = tide.trend;
  const highAt = tide.nextHigh ? ` · 高潮 ${formatTime(tide.nextHigh.time)}` : "";
  const lowAt = tide.nextLow ? ` · 低潮 ${formatTime(tide.nextLow.time)}` : "";

  // Exact phase match
  if (pref === "rising" && (phase === "rising" || phase === "low-slack")) {
    return { mult: 1.18, reason: `涨潮匹配 ↗ (+18%)${highAt}` };
  }
  if (pref === "falling" && (phase === "falling" || phase === "high-slack")) {
    return { mult: 1.18, reason: `退潮匹配 ↘ (+18%)${lowAt}` };
  }
  if (pref === "high" && phase === "high-slack") {
    return { mult: 1.20, reason: "高潮匹配 High Tide (+20%)" };
  }
  if (pref === "low" && phase === "low-slack") {
    return { mult: 1.20, reason: "低潮匹配 Low Tide (+20%)" };
  }
  if (pref === "change" && (phase === "high-slack" || phase === "low-slack")) {
    return { mult: 1.22, reason: "换潮期 Tide Change (+22%)" };
  }
  // Partial match: close to preferred direction
  if (pref === "rising" && trend === "rising") return { mult: 1.08, reason: `潮位上涨中 (+8%)${highAt}` };
  if (pref === "falling" && trend === "falling") return { mult: 1.08, reason: `潮位下降中 (+8%)${lowAt}` };
  // Mismatch
  return { mult: 0.90, reason: `潮位不理想 (-10%)${pref === "rising" ? highAt : pref === "falling" ? lowAt : ""}` };
}

// ---------- Regional conditions ----------
// Spots are clustered into ~0.2° coastal buckets (~22 km). One batched multi-coordinate
// Open-Meteo request per API fetches conditions for ALL buckets at once (3 HTTP calls
// total), so every spot is scored with its own area's weather/swell/tide instead of
// whatever happens to be at the map center.
const REGION_GRID_DEG = 0.2;
const REGION_TTL_MS = 10 * 60 * 1000;
let regions = [];                 // [{ key, lat, lng }]
let spotRegionKey = new Map();    // spot id → region key
let regionConditions = new Map(); // region key → { weather, marine, tide }
let regionFetchedAt = 0;
let regionLoading = null;

function buildRegions() {
  const buckets = new Map();
  window.SYDNEY_SPOTS.forEach(s => {
    const key = Math.round(s.lat / REGION_GRID_DEG) + "," + Math.round(s.lng / REGION_GRID_DEG);
    let b = buckets.get(key);
    if (!b) { b = { key, latSum: 0, lngSum: 0, count: 0 }; buckets.set(key, b); }
    b.latSum += s.lat; b.lngSum += s.lng; b.count++;
    spotRegionKey.set(s.id, key);
  });
  regions = [...buckets.values()].map(b => ({
    key: b.key, lat: b.latSum / b.count, lng: b.lngSum / b.count
  }));
}

async function loadRegionalConditions() {
  if (regionLoading) return regionLoading;
  regionLoading = (async () => {
    try {
      if (!regions.length) buildRegions();
      const lats = regions.map(r => r.lat.toFixed(3)).join(",");
      const lngs = regions.map(r => r.lng.toFixed(3)).join(",");
      const asArray = d => (Array.isArray(d) ? d : [d]);
      const grab = url => fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null);
      const [wRes, mRes, tRes] = await Promise.all([
        grab(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&${FORECAST_PARAMS}`),
        grab(`https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lngs}&current=wave_height,wave_period,wind_wave_height&timezone=Australia%2FSydney`),
        grab(`https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lngs}&${TIDE_PARAMS}`)
      ]);
      const wArr = wRes ? asArray(wRes) : [];
      const mArr = mRes ? asArray(mRes) : [];
      const tArr = tRes ? asArray(tRes) : [];
      regions.forEach((r, i) => {
        regionConditions.set(r.key, {
          weather: wArr[i] ? parseForecastEntry(wArr[i]) : null,
          marine: mArr[i] && mArr[i].current ? mArr[i].current : null,
          tide: tArr[i] && tArr[i].hourly ? analyzeTide(tArr[i].hourly) : null
        });
      });
      if (wArr.length || mArr.length || tArr.length) regionFetchedAt = Date.now();
    } catch (e) {
      console.warn("regional conditions failed", e);
    } finally {
      regionLoading = null;
    }
  })();
  return regionLoading;
}

// Nearest already-loaded zone's conditions to a point — instant, no network. Lets the center
// weather pill track the search pin even on small drags (all Sydney zones are preloaded).
function nearestRegionConditions(latLng) {
  if (!latLng || !regionConditions.size) return null;
  let best = null, bestD = Infinity;
  for (const r of regions) {
    const rc = regionConditions.get(r.key);
    if (!rc || (!rc.weather && !rc.marine && !rc.tide)) continue;
    const d = haversineKm(latLng, [r.lat, r.lng]);
    if (d < bestD) { bestD = d; best = rc; }
  }
  return best;
}

// Conditions used to SCORE a spot: its own region's data, falling back to map-center data.
function conditionsForSpot(spot) {
  const rc = regionConditions.get(spotRegionKey.get(spot.id));
  if (rc && (rc.weather || rc.marine || rc.tide)) return rc;
  return currentWeather || { weather: null, marine: null, tide: null };
}

// Kick off a background refresh of regional conditions when stale, then re-render.
function ensureRegionalFresh() {
  if (Date.now() - regionFetchedAt > REGION_TTL_MS && !regionLoading) {
    loadRegionalConditions().then(() => {
      render();
    });
  }
}

function scoreSpot(spot, refLoc, cond, mode) {
  const modeCfg = SCORING_MODES[mode] || SCORING_MODES.fish;
  const weather = cond ? cond.weather : null;
  const marine = cond ? cond.marine : null;
  const tide = cond ? cond.tide : null;
  const reasons = [];
  const now = Date.now();

  // ----- Distance: affects RANKING only (sortScore below), never the displayed score -----
  const dist = refLoc ? haversineKm(refLoc, [spot.lat, spot.lng]) : 15;
  const distancePenalty = modeCfg.distancePenalty(dist);

  // ----- Weather factor -----
  let weatherMult = 1.0;
  if (weather) {
    const wind = weather.wind_speed_10m;
    const dir = degToCompass(weather.wind_direction_10m);
    if (wind != null) {
      if (wind < 15) { weatherMult *= 1.15; reasons.push("风力温和 " + wind.toFixed(0) + "km/h"); }
      else if (wind < 25) { weatherMult *= 1.0; }
      else if (wind < 35) { weatherMult *= 0.75; reasons.push("风力偏大 " + wind.toFixed(0) + "km/h"); }
      else { weatherMult *= 0.45; reasons.push("大风 " + wind.toFixed(0) + "km/h 慎钓"); }
    }
    // Wind direction only matters once there is real wind; scale the effect by speed.
    if (wind != null && wind >= 12 && spot.prefers && spot.prefers.wind && !spot.prefers.wind.includes("any")) {
      const prefixMatch = spot.prefers.wind.some(w => dir.startsWith(w));
      const strong = wind >= 20;
      if (prefixMatch) { weatherMult *= strong ? 1.10 : 1.05; reasons.push("风向 " + dir + " 适合此点"); }
      else { weatherMult *= strong ? 0.85 : 0.93; }
    }
    if (weather.precipitation && weather.precipitation > 2) {
      weatherMult *= 0.8;
      reasons.push("降雨 " + weather.precipitation.toFixed(1) + "mm");
    }
    // Severe weather codes: thunderstorms / violent rain are a hard no-go.
    const code = weather.weather_code;
    if (code != null) {
      if (code >= 95) { weatherMult *= 0.35; reasons.push("⛈️ 雷暴天气 建议改期"); }
      else if (code === 65 || code === 67 || code === 82) { weatherMult *= 0.7; reasons.push("暴雨"); }
    }
    // Falling barometer before a front often switches fish on; sharp rise = post-front lull.
    const dp = pressureTrend(weather._pressure, now);
    if (dp != null) {
      if (dp <= -1.5) { weatherMult *= 1.06; reasons.push(`气压下降 ${dp.toFixed(1)}hPa/3h 鱼口活跃 (+6%)`); }
      else if (dp >= 2.5) { weatherMult *= 0.94; reasons.push(`气压骤升 +${dp.toFixed(1)}hPa/3h (-6%)`); }
    }
  } else {
    reasons.push("⚠️ 实时气象不可用 按中性计");
  }

  if (marine && marine.wave_height != null) {
    const wh = marine.wave_height;
    const period = marine.wave_period;
    // Long-period groundswell hits rock platforms much harder than short wind chop of
    // the same height — weight the height by period before applying safety thresholds.
    const periodFactor = period == null ? 1.0 : period >= 13 ? 1.3 : period >= 11 ? 1.15 : period <= 7 ? 0.85 : 1.0;
    const eff = wh * periodFactor;
    const pTxt = period != null ? ` @${period.toFixed(0)}s` : "";
    if (spot.type === "rock") {
      if (eff < 1.2) { weatherMult *= 1.1; reasons.push(`涌浪小 ${wh.toFixed(1)}m${pTxt}`); }
      else if (eff < 2) { weatherMult *= 0.9; reasons.push(`涌浪中 ${wh.toFixed(1)}m${pTxt}`); }
      else { weatherMult *= 0.45; reasons.push(`⚠️ 涌浪大 ${wh.toFixed(1)}m${pTxt} 岩钓危险`); }
    } else if (spot.type === "beach") {
      if (eff < 1.5) weatherMult *= 1.05;
      else if (eff > 2.5) { weatherMult *= 0.7; reasons.push(`海滩浪大 ${wh.toFixed(1)}m${pTxt}`); }
    }
  }

  // ----- Tide factor -----
  const tideInfo = tideFactorFor(spot, tide);
  const tideMult = tideInfo.mult;
  if (tideInfo.reason) reasons.push(tideInfo.reason);

  // ----- Time factor: REAL sunrise/sunset windows (was hardcoded 5-8/17-20, which in
  // winter awarded "golden hour" two hours after dark and missed the actual one) -----
  let timeMult = 1.0;
  const windows = weather ? computePrimeWindows(weather._daily, now) : null;
  if (windows) {
    const winStatus = currentWindowStatus(windows);
    if (winStatus === "dawn") {
      timeMult = 1.15;
      reasons.push(`晨钓黄金时段 (日出 ${formatTime(windows.sunrise)})`);
    } else if (winStatus === "dusk") {
      timeMult = 1.15;
      reasons.push(`昏钓黄金时段 (日落 ${formatTime(windows.sunset)})`);
    } else if (now < windows.dawn.start.getTime() || now > windows.dusk.end.getTime()) {
      // Night: most species slow down — but jewfish spots are a legit night fishery.
      if (spot.species.includes("Jewfish")) {
        reasons.push("夜间时段 · 石首鱼夜钓点不扣分");
      } else {
        timeMult = 0.9;
      }
    }
  } else {
    // Offline fallback: fixed Sydney-typical hours
    const hr = sydneyParts(now).hour;
    if ((hr >= 5 && hr <= 8) || (hr >= 16 && hr <= 19)) timeMult = 1.15;
    else if (hr >= 22 || hr <= 4) timeMult = 0.9;
  }

  // ----- Moon factor: new/full moon = spring tides, stronger flow (small bonus) -----
  const moon = moonInfo(now);
  const moonMult = moon.mult;
  if (moon.springy) reasons.push(`${moon.label} 大潮期 (+5%)`);

  // ----- Season factor: is this spot's target species actually biting this month? -----
  const season = seasonFactorFor(spot, now);
  if (season.reason) reasons.push(season.reason);

  // ----- Access factor (mode-dependent) -----
  const access = (window.ACCESS_DATA && window.ACCESS_DATA[spot.id]) || null;
  let accessMult = 1.0;
  if (access && access.score) {
    const [lo, hi] = modeCfg.accessRange;
    accessMult = lerp(lo, hi, (access.score - 1) / 4);
    if (mode === "family") {
      reasons.push(`交通便利 ${"★".repeat(access.score)}${"☆".repeat(5 - access.score)}`);
    }
  } else if (mode === "family") {
    // Unknown access in family mode: neutral
    accessMult = 0.95;
  }

  // 钓况分 (displayed): purely "how good is fishing at this spot right now".
  const condScore = spot.baseScore * weatherMult * tideMult * timeMult * moonMult * season.mult * accessMult;
  const product = condScore / spot.baseScore;                 // the multiplier product (centred ~1.0)
  const display = displayScoreFor(spot.baseScore, product);   // finished 0-100, computed HERE

  // Frozen, immutable record of EXACTLY how this score was produced + the raw inputs behind
  // it. Persisted with every catch report so real outcomes can later calibrate the weights.
  const snapshot = {
    engineVersion: ENGINE_VERSION,
    scoringMode: mode,
    baseScore: spot.baseScore,
    rawScore: condScore,
    displayScore: display,
    factors: {
      weather: round3(weatherMult), tide: round3(tideMult), time: round3(timeMult),
      moon: round3(moonMult), season: round3(season.mult), access: round3(accessMult)
    },
    weather: weather ? {
      tempC: weather.temperature_2m ?? null,
      windKmh: weather.wind_speed_10m ?? null,
      windDir: degToCompass(weather.wind_direction_10m),
      precipMm: weather.precipitation ?? null,
      weatherCode: weather.weather_code ?? null,
      pressureTrend3h: round3(pressureTrend(weather._pressure, now))
    } : null,
    marine: marine ? { waveHeightM: marine.wave_height ?? null, wavePeriodS: marine.wave_period ?? null } : null,
    tide: tide ? {
      phase: tide.phase, trend: tide.trend,
      heightM: round3(tide.current),
      hoursToHigh: round3(tide.hoursToHigh), hoursToLow: round3(tide.hoursToLow)
    } : null,
    moon: { label: moon.label, fraction: round3(moonPhaseFraction(now)), springy: moon.springy },
    season: { mult: round3(season.mult), inSeason: season.inSeason, offSeason: season.offSeason },
    ref: refLoc ? { lat: refLoc[0], lng: refLoc[1], distKm: round3(dist) } : null,
    capturedAtMs: now
  };

  return {
    score: condScore * distancePenalty,  // ranking only
    displayScore: display,               // finished 0-100 int (was raw condScore)
    dist, reasons,
    inSeason: season.inSeason,
    snapshot
  };
}

// Round to 3 decimals, passing through null/undefined.
function round3(v) { return v == null ? null : Math.round(v * 1000) / 1000; }

// Returns true if spot should be excluded under current mode's terrain filter.
function isSpotFiltered(spot, mode) {
  const modeCfg = SCORING_MODES[mode] || SCORING_MODES.fish;
  if (!modeCfg.terrainFilter) return false;
  const access = (window.ACCESS_DATA && window.ACCESS_DATA[spot.id]) || null;
  if (!access) return false;  // unknown terrain: let through
  return modeCfg.terrainFilter.includes(access.terrain);
}

function getAccess(spotId) {
  const d = (window.ACCESS_DATA && window.ACCESS_DATA[spotId]) || null;
  if (!d || !d.score) return null;
  return d;
}

function terrainLabel(t) {
  return ({
    easy: "🟢 轻松 · Easy",
    moderate: "🟡 中等 · Moderate",
    hard: "🟠 困难 · Hard",
    extreme: "🔴 极难 · Extreme"
  })[t] || "— 未评估";
}

// ---------- Rig recommendations ----------
function levelLabel(l) {
  return ({ beginner: "🟢 入门", intermediate: "🟡 进阶", advanced: "🔴 高级" })[l] || l;
}

function renderRigCard(rig) {
  return `
    <div class="rig-card">
      <div class="rig-card-head">
        <div>
          <div class="rig-name">${escapeHtml(rig.name)}</div>
          <div class="rig-name-en">${escapeHtml(rig.nameEn || "")}</div>
        </div>
        <div class="rig-level">${levelLabel(rig.level)}</div>
      </div>
      <div class="rig-grid">
        <div><b>钓竿 Rod</b>${escapeHtml(rig.rod)}</div>
        <div><b>渔轮 Reel</b>${escapeHtml(rig.reel)}</div>
        <div><b>主线 Line</b>${escapeHtml(rig.line)}</div>
        <div><b>前导 Leader</b>${escapeHtml(rig.leader)}</div>
        <div><b>钓钩 Hook</b>${escapeHtml(rig.hook)}</div>
        <div><b>饵料 Bait</b>${escapeHtml(rig.bait)}</div>
      </div>
      <div class="rig-technique">
        <b>钓法 Technique</b>
        <p>${escapeHtml(rig.technique)}</p>
      </div>
      <div class="rig-tip">💡 ${escapeHtml(rig.tip)}</div>
    </div>
  `;
}

function renderRigsForSpecies(spot, species) {
  const db = window.RIGS_BY_SPECIES && window.RIGS_BY_SPECIES[species];
  if (!db) {
    return `<div class="rig-empty">该鱼种钓组数据整理中 · Rig data not yet available</div>`;
  }
  const cards = db.rigs.map(renderRigCard).join("");
  const note = spot.rigNotes && spot.rigNotes[species];
  const noteHtml = note ? `
    <div class="rig-note">
      <div class="rig-note-title">📌 本钓点经验补充 · Spot-specific Tip</div>
      <div>${escapeHtml(note)}</div>
    </div>
  ` : "";
  return cards + noteHtml;
}

// ---------- NSW regulations + rock-fishing safety (workstream 1) ----------
// Look up a species' NSW limits (keyed by the same English names as rigs.js / spot.species).
function regsForSpecies(species) {
  return (window.NSW_REGULATIONS && window.NSW_REGULATIONS[species]) || null;
}

// Compact one-line summary of a species' NSW limits (plain text — caller escapes).
function regSummaryText(reg) {
  if (!reg) return "";
  const parts = [];
  if (reg.protected) parts.push("🚫 受保护/禁捕 Protected");
  if (reg.minSizeCm != null) parts.push(`最小 ${reg.minSizeCm}cm`);
  else if (!reg.protected) parts.push("无最小尺寸 No min size");
  if (reg.maxSizeCm != null) parts.push(`最大 ${reg.maxSizeCm}cm`);
  if (reg.bagLimit != null && !reg.protected) parts.push(`每日 ${reg.bagLimit} 尾`);
  if (reg.possessionLimit != null && !reg.protected) parts.push(`持有 ${reg.possessionLimit}`);
  if (reg.closedMonths && reg.closedMonths.length) parts.push("有禁渔期 Closed season");
  return parts.join(" · ");
}

// Regulations block for a spot: one row per target species that has reg data, plus any
// marine-sanctuary warning and the global "verify with DPI / not legal advice" disclaimer.
function renderRegulationsSection(spot) {
  if (!window.NSW_REGULATIONS) return "";
  const meta = window.NSW_REGULATIONS_META || {};
  const species = (spot.species || []).filter(sp => regsForSpecies(sp));
  if (!species.length && !(spot.marineZone && spot.marineZone.sanctuary)) return "";
  const rows = species.map(sp => {
    const reg = regsForSpecies(sp);
    return `<div class="reg-row${reg.protected ? " reg-protected" : ""}">
      <span class="reg-sp">${escapeHtml(reg.nameCn)} <span class="reg-sp-en">${escapeHtml(sp)}</span></span>
      <span class="reg-vals">${escapeHtml(regSummaryText(reg))}</span>
    </div>`;
  }).join("");
  const mz = (spot.marineZone && spot.marineZone.sanctuary) ? `
    <div class="reg-sanctuary">🚫 ${escapeHtml(spot.marineZone.noteCn || "禁渔保护区 — 全面禁止采捕")}
      <span class="en">${escapeHtml(spot.marineZone.noteEn || "Sanctuary (no-take) zone")}</span></div>` : "";
  const dpi = meta.dpiUrl ? `<a href="${escapeAttr(safeUrl(meta.dpiUrl))}" target="_blank" rel="noopener noreferrer">NSW DPI ↗</a>` : "";
  return `
    <section>
      <h4>NSW 法规 · Rules &amp; Limits</h4>
      ${mz}
      <div class="reg-table">${rows}</div>
      <div class="reg-disclaimer">⚠️ ${escapeHtml(meta.disclaimerCn || "")} · <span class="en">${escapeHtml(meta.disclaimerEn || "")}</span> ${dpi} <span class="reg-updated">更新 ${escapeHtml(meta.lastUpdated || "")}</span></div>
    </section>`;
}

// Effective swell the scoring engine uses for rock safety (height weighted by period) —
// recomputed from the SAME numbers the snapshot froze, so the verdict matches scoreSpot.
function effectiveWaveM(marine) {
  if (!marine || marine.waveHeightM == null) return null;
  const wh = marine.waveHeightM, p = marine.wavePeriodS;
  const pf = p == null ? 1.0 : p >= 13 ? 1.3 : p >= 11 ? 1.15 : p <= 7 ? 0.85 : 1.0;
  return wh * pf;
}

// Rock-fishing go/no-go verdict, derived from the frozen scoring snapshot (no re-fetch).
// Only meaningful for rock platforms — returns null for other spot types.
function safetyVerdict(spot, snapshot) {
  if (!spot || spot.type !== "rock") return null;
  const w = snapshot && snapshot.weather;
  const m = snapshot && snapshot.marine;
  const reasonsCn = [];
  const order = { green: 0, amber: 1, red: 2 };
  let level = "green";
  const bump = (lv) => { if (order[lv] > order[level]) level = lv; };

  if (!w) { bump("amber"); reasonsCn.push("实时气象不可用"); }
  if (w && w.weatherCode != null && w.weatherCode >= 95) { bump("red"); reasonsCn.push("⛈️ 雷暴"); }
  if (w && w.windKmh != null) {
    if (w.windKmh > 35) { bump("red"); reasonsCn.push(`大风 ${Math.round(w.windKmh)}km/h`); }
    else if (w.windKmh >= 25) { bump("amber"); reasonsCn.push(`风偏大 ${Math.round(w.windKmh)}km/h`); }
  }
  if (w && w.precipMm != null && w.precipMm > 2) { bump("amber"); reasonsCn.push("降雨湿滑"); }
  const eff = effectiveWaveM(m);
  if (eff != null) {
    if (eff >= 2) { bump("red"); reasonsCn.push(`涌浪大 ${m.waveHeightM.toFixed(1)}m`); }
    else if (eff >= 1.2) { bump("amber"); reasonsCn.push(`涌浪中 ${m.waveHeightM.toFixed(1)}m`); }
  } else if (!m) { bump("amber"); reasonsCn.push("无涌浪数据"); }

  const labels = {
    green: { cn: "🟢 适宜岩钓", en: "Conditions look OK — stay alert" },
    amber: { cn: "🟡 谨慎 · 注意安全", en: "Caution — assess carefully" },
    red:   { cn: "🔴 今天不建议岩钓", en: "Rock fishing not recommended today" }
  };
  return { level, labelCn: labels[level].cn, labelEn: labels[level].en, reasonsCn };
}

// The prominent verdict banner shown on rock-spot detail pages (escaped throughout).
function renderSafetyVerdict(spot, verdict) {
  if (!verdict) return "";
  const sc = window.SAFETY_CONTENT || {};
  const meta = window.NSW_REGULATIONS_META || {};
  // Show only the 2 most critical reminders inline to keep the banner compact; the full
  // 5-step checklist lives one tap away in the "新手安全教程" tutorial modal below.
  const reminders = (sc.rockReminders || []).slice(0, 2).map(r =>
    `<li>${escapeHtml(r.cn)} · <span class="en">${escapeHtml(r.en)}</span></li>`).join("");
  const reasons = verdict.reasonsCn.length
    ? `<div class="sv-reasons">${escapeHtml(verdict.reasonsCn.join(" · "))}</div>` : "";
  const safetyLink = meta.safetyUrl
    ? `<a href="${escapeAttr(safeUrl(meta.safetyUrl))}" target="_blank" rel="noopener noreferrer">岩钓安全 ↗</a>` : "";
  return `
    <div class="safety-verdict sv-${verdict.level}">
      <div class="sv-head">
        <span class="sv-label">${escapeHtml(verdict.labelCn)}</span>
        <span class="sv-label-en">${escapeHtml(verdict.labelEn)}</span>
      </div>
      ${reasons}
      <ul class="sv-reminders">${reminders}</ul>
      <div class="sv-foot">
        <button type="button" class="sv-tutorial-btn" id="safetyTutorialBtn">📖 ${escapeHtml(sc.tutorialTitleCn || "新手安全教程")}</button>
        ${safetyLink}
      </div>
    </div>`;
}

// (Re)bind the "新手安全教程" button inside the verdict banner — called after each render.
function bindSafetyVerdict() {
  const btn = document.getElementById("safetyTutorialBtn");
  if (btn) btn.addEventListener("click", openSafetyTutorial);
}

// Fill + open the beginner rock-safety tutorial modal (reuses the modal-overlay pattern).
function openSafetyTutorial() {
  const modal = document.getElementById("safetyModal");
  const content = document.getElementById("safetyModalContent");
  const sc = window.SAFETY_CONTENT || {};
  if (!modal || !content) return;
  const steps = (sc.tutorial || []).map(s =>
    `<li>${escapeHtml(s.cn)}<br><span class="en">${escapeHtml(s.en)}</span></li>`).join("");
  content.innerHTML = `
    <div class="detail-hero">
      <button class="close" id="closeSafety">×</button>
      <h2>${escapeHtml(sc.tutorialTitleCn || "新手岩钓安全")}</h2>
      <div class="sub">${escapeHtml(sc.tutorialTitleEn || "")}</div>
    </div>
    <div class="detail-body">
      <ul class="safety-steps">${steps}</ul>
      ${sc.lifejacketNoteCn ? `<div class="reg-sanctuary">🦺 ${escapeHtml(sc.lifejacketNoteCn)}<span class="en">${escapeHtml(sc.lifejacketNoteEn || "")}</span></div>` : ""}
      <div class="reg-disclaimer">⚠️ ${escapeHtml(sc.disclaimerCn || "")} · <span class="en">${escapeHtml(sc.disclaimerEn || "")}</span></div>
    </div>`;
  modal.classList.remove("hidden");
  const close = document.getElementById("closeSafety");
  if (close) close.onclick = () => modal.classList.add("hidden");
  modal.onclick = (e) => { if (e.target === modal) modal.classList.add("hidden"); };
}

function renderRigsSection(spot) {
  const availableSpecies = spot.species.filter(sp => window.RIGS_BY_SPECIES && window.RIGS_BY_SPECIES[sp]);
  if (!availableSpecies.length) {
    return `
      <section>
        <h4>推荐钓组 · Recommended Rigs</h4>
        <div class="rig-empty">该钓点的目标鱼钓组数据整理中</div>
      </section>`;
  }
  const firstSpecies = availableSpecies[0];
  const tabs = availableSpecies.map((sp, i) => {
    const db = window.RIGS_BY_SPECIES[sp];
    return `<button class="rig-tab${i === 0 ? ' active' : ''}" data-species="${sp}">
      ${db.icon || "🐟"} ${escapeHtml(db.nameCn)} <span class="rig-tab-en">${sp}</span>
    </button>`;
  }).join("");
  return `
    <section>
      <h4>推荐钓组 · Recommended Rigs</h4>
      <div class="rig-tabs">${tabs}</div>
      <div class="rig-container" id="rigContainer">
        ${renderRigsForSpecies(spot, firstSpecies)}
      </div>
    </section>
  `;
}

function bindRigTabs(spot) {
  const tabs = document.querySelectorAll(".rig-tab");
  const container = document.getElementById("rigContainer");
  if (!tabs.length || !container) return;
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      container.innerHTML = renderRigsForSpecies(spot, tab.dataset.species);
    });
  });
}

function renderAccessSection(spotId) {
  const a = getAccess(spotId);
  if (!a) {
    return `
      <section>
        <h4>交通便利 · Access</h4>
        <div class="access-empty">此钓点的交通数据整理中 · Access data not yet available</div>
      </section>`;
  }
  const stars = "★".repeat(a.score) + "☆".repeat(5 - a.score);
  const scoreColor = a.score >= 4 ? "#06a77d" : a.score >= 3 ? "#ffb703" : "#ef476f";
  return `
    <section>
      <h4>交通便利 · Access</h4>
      <div class="access-card">
        <div class="access-header">
          <div class="access-stars" style="color:${scoreColor}">${stars}</div>
          <div class="access-label">${a.score}/5 · ${terrainLabel(a.terrain)}</div>
        </div>
        <div class="access-row">
          <span class="access-icon">${svgIcon('car')}</span>
          <div><b>自驾</b>${escapeHtml(a.drive)}</div>
        </div>
        <div class="access-row">
          <span class="access-icon">${svgIcon('bus')}</span>
          <div><b>公共交通</b>${escapeHtml(a.pt)}</div>
        </div>
        ${a.tips && a.tips.length ? `
        <div class="access-tips-header">${svgIcon('chat')} 钓友社区整理 · Community Tips</div>
        <ul class="access-tips">
          ${a.tips.map(t => `<li>${escapeHtml(t)}</li>`).join("")}
        </ul>
        <div class="access-disclaimer">* 以上为社区公开信息整理，非真实用户评论</div>
        ` : ""}
      </div>
    </section>
  `;
}

function render() {
  ensureRegionalFresh();
  const radius = parseFloat(document.getElementById("radiusSel").value);
  const speciesFilter = document.getElementById("speciesSel").value;
  const accessFilter = parseInt(document.getElementById("accessSel").value, 10) || 0;
  const searchEl = document.getElementById("spotSearch");
  const searchTerm = (searchEl ? searchEl.value : "").trim().toLowerCase();
  const listEl = document.getElementById("spotList");
  const refLoc = referencePoint();

  let spots = window.SYDNEY_SPOTS.slice();
  // Name search (zh + en + suburb): matches anywhere in the name; bypasses the radius gate below
  // so a searched spot always surfaces even if it's far from the map center.
  if (searchTerm) {
    spots = spots.filter(s =>
      (s.nameCn && s.nameCn.toLowerCase().includes(searchTerm)) ||
      (s.name && s.name.toLowerCase().includes(searchTerm)) ||
      (s.area && s.area.toLowerCase().includes(searchTerm)));
  }
  if (speciesFilter) spots = spots.filter(s => s.species.includes(speciesFilter));
  if (accessFilter) {
    spots = spots.filter(s => {
      const a = getAccess(s.id);
      return a && a.score >= accessFilter;
    });
  }
  // Mode-based terrain filter (family mode hides hard/extreme)
  spots = spots.filter(s => !isSpotFiltered(s, currentMode));

  const scored = spots.map(s => {
    const r = scoreSpot(s, refLoc, conditionsForSpot(s), currentMode);
    return { spot: s, ...r };
  });

  // All modes respect the exact user-picked radius from the map center.
  scored.sort((a, b) => {
    if (a.dist > radius && b.dist > radius) return b.score - a.score;
    if (a.dist > radius) return 1;
    if (b.dist > radius) return -1;
    return b.score - a.score;
  });

  sortedSpots = scored;

  // While searching by name, show every match regardless of distance; otherwise gate by radius.
  const visible = searchTerm ? scored : scored.filter(s => s.dist <= radius);
  const toShow = visible.length ? visible : scored.slice(0, 6);

  listEl.innerHTML = "";
  if (!toShow.length) {
    const emptyMsg = searchTerm
      ? `没有匹配「${escapeHtml(searchTerm)}」的钓点<br><small>换个关键词试试</small>`
      : `该条件下暂无匹配的钓点<br><small>试试放大半径或更换鱼种</small>`;
    listEl.innerHTML = `<div class="empty-state"><svg class="empty-fish" aria-hidden="true"><use href="#ic-fish"></use></svg>${emptyMsg}</div>`;
    return;
  }
  // Distance label semantics: "离我" only when the reference point IS the user.
  const refIsUser = userLatLng && mapCenterLatLng && haversineKm(mapCenterLatLng, userLatLng) < 3;
  const distLabel = `<svg class="ic" aria-hidden="true"><use href="#ic-${refIsUser ? "target" : "near"}"></use></svg>`;
  const distTitle = refIsUser ? "离我" : "距搜索中心";

  toShow.slice(0, 20).forEach((entry, i) => {
    const s = entry.spot;
    const a = getAccess(s.id);
    const inSeason = entry.inSeason || [];
    const card = document.createElement("div");
    card.className = "spot-card" + (i === 0 ? " best" : "");
    card.innerHTML = `
      <div class="rank-badge">${i + 1}</div>
      <div class="spot-info">
        <div class="spot-name">${s.nameCn}${i === 0 ? '<span class="best-tag">首选</span>' : ''}</div>
        <div class="spot-name-en">${s.name}</div>
        <div class="spot-meta">
          <span title="${distTitle}">${distLabel} ${entry.dist.toFixed(1)} km</span>
          <span class="type-badge type-${s.type}">${typeIcon(s.type)} ${typeLabel(s.type)}</span>
          ${a ? `<span class="access-badge" title="交通便利 ${a.score}/5">${"★".repeat(a.score)}<span class="acc-empty">${"☆".repeat(5-a.score)}</span></span>` : ""}
        </div>
        <div class="spot-species">${s.species.slice(0, 4).map(sp =>
          `<span class="sp-chip${inSeason.includes(sp) ? " in-season" : ""}"${inSeason.includes(sp) ? ' title="当季鱼种 · 正在咬钩"' : ""}>${sp}</span>`).join("")}</div>
      </div>
      <div class="score-box">
        <b>${toDisplayScore(entry.displayScore)}</b>
        <small>钓况 / 100</small>
      </div>
    `;
    card.onclick = () => showDetail(s.id);
    listEl.appendChild(card);
  });

  if (toShow[0]) {
    // Highlight top 5 on the map (orange ring) and the #1 in gold
    const topIds = new Set(toShow.slice(0, 5).map(e => e.spot.id));
    drawSpotMarkers(toShow[0].spot.id, topIds);
  }

  updateReferenceIndicator();
  updateSheetPeek();
}

function typeLabel(t) {
  return ({ rock: "岩钓", harbour: "港内", estuary: "河口", beach: "沙滩" })[t] || t;
}
function typeIcon(t) {
  const name = ({ rock: "rock", harbour: "anchor", estuary: "estuary", beach: "beach" })[t] || "wave";
  return svgIcon(name);
}
// Inline SVG icon helper — references the sprite in index.html. `name` is always a fixed
// literal here (never user input), so the markup is static and safe under the strict CSP.
function svgIcon(name, cls) {
  return `<svg class="ic${cls ? " " + cls : ""}" aria-hidden="true"><use href="#ic-${name}"></use></svg>`;
}
// Update only the locate button's label span, preserving its SVG icon (textContent would wipe it).
function setLocateLabel(text) {
  const l = document.getElementById("locateLabel");
  if (l) l.textContent = text;
}

// Tracks the currently-open detail sheet so we can (a) hand the live scoring snapshot to the
// catch-report form and (b) re-render it when auth state changes.
let currentDetail = { spotId: null, snapshot: null };

function showDetail(id) {
  const entry = sortedSpots.find(e => e.spot.id === id);
  if (!entry) return;
  const s = entry.spot;
  const inSeason = entry.inSeason || [];
  const el = document.getElementById("detailContent");
  // Seed the Live Conditions panel with this spot's ALREADY-LOADED regional data so weather/
  // tide show instantly (no "loading…" wait). The per-spot fetch below then refines it to the
  // exact coordinate. Same data shape (both go through parseForecastEntry), so it just works.
  const seedRegional = conditionsForSpot(s);
  const seedCond = (seedRegional && seedRegional.weather)
    ? { ...seedRegional, fetchedAt: regionFetchedAt || Date.now(), _seed: true }
    : null;
  el.innerHTML = `
    <div class="detail-hero">
      <button class="close" id="closeDetail">×</button>
      <h2>${s.nameCn}</h2>
      <div class="sub">${s.name} · ${typeIcon(s.type)} ${typeLabel(s.type)} · 距搜索中心 ${entry.dist.toFixed(1)} km</div>
      <div class="detail-chips">${s.species.map(sp => {
        const cls = "chip" + (inSeason.includes(sp) ? " in-season" : "");
        return (window.RIGS_BY_SPECIES && window.RIGS_BY_SPECIES[sp])
          ? `<button type="button" class="${cls} chip-btn" data-scene-species="${escapeAttr(sp)}" title="查看 ${escapeAttr(sp)} 场景页 · Scene page">${sp}</button>`
          : `<span class="${cls}">${sp}</span>`;
      }).join("")}</div>
      <div class="detail-score">
        <div class="detail-score-number" id="detailScoreNum">${toDisplayScore(entry.displayScore)}</div>
        <div style="flex:1">
          <div style="font-size:10px;opacity:.75;letter-spacing:.4px;margin-bottom:4px">钓况分 · 满分 100 · 距离不计入 · <a href="#" id="algoLink" style="color:#ffd166;text-decoration:underline">算法 ${svgIcon('info')}</a></div>
          <div class="score-bar"><div id="detailScoreBar" style="width:${toDisplayScore(entry.displayScore)}%"></div></div>
        </div>
      </div>
      ${renderPrimeWindowBadge()}
    </div>

    <div class="detail-body">
      <div id="safetyVerdict">${renderSafetyVerdict(s, safetyVerdict(s, entry.snapshot || null))}</div>

      <section>
        <h4>当前海况 · Live Conditions</h4>
        <div class="spot-conditions" id="spotConditions">${renderSpotConditionsHTML(seedCond)}</div>
      </section>

      ${renderCamsSection(s)}

      <section>
        <h4>最佳时段 · Best Time</h4>
        <p>${s.bestCn}</p>
        <p class="en">${s.best}</p>
      </section>

      <section>
        <h4>推荐钓法 · Techniques</h4>
        <ul>${s.techniques.map(t => `<li>${t}</li>`).join("")}</ul>
      </section>

      ${renderRigsSection(s)}

      <section>
        <h4>现场提示 · Local Tips</h4>
        <p>${s.tipsCn}</p>
        <p class="en">${s.tips}</p>
      </section>

      <section>
        <h4>当前评分依据 · Why Today</h4>
        <div class="why-note" id="whyNote">基于本区域海况 · 正在按本点坐标精算…</div>
        <ul class="reason-list" id="whyList">${entry.reasons.map(r => `<li>${r}</li>`).join("") || "<li>当前无特别加减分因素</li>"}</ul>
      </section>

      ${renderAccessSection(s.id)}

      <section>
        <h4>导航 · Directions</h4>
        <a class="nav-btn" href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}" target="_blank">🧭 在 Google 地图打开路线</a>
      </section>

      <section>
        <h4>钓获记录 · Catch Reports</h4>
        <div class="catch-list" id="catchList"><div class="catch-loading">加载中…</div></div>
        <div id="catchFormArea">${renderCatchFormArea(s)}</div>
      </section>

      <section>
        <h4>钓友评论 · Reviews</h4>
        ${renderReviewsSection(s.id)}
      </section>

      ${renderRegulationsSection(s)}
    </div>
  `;
  // re-bind close button (it's now inside dynamic content)
  document.getElementById("closeDetail").onclick = () => document.getElementById("detail").classList.add("hidden");
  // algo link inside detail
  const algoLink = document.getElementById("algoLink");
  if (algoLink) algoLink.onclick = (e) => {
    e.preventDefault();
    document.getElementById("algoModal").classList.remove("hidden");
  };
  currentDetail = { spotId: s.id, snapshot: entry.snapshot || null };
  // bind review form + load server reviews
  bindReviewForm(s.id);
  loadAndRenderReviews(s.id);
  // bind catch-report form + load this spot's catches
  bindCatchForm(s);
  loadSpotCatches(s.id);
  // bind rig tabs
  bindRigTabs(s);
  // bind rock-fishing safety tutorial button (verdict banner)
  bindSafetyVerdict();
  // species chips → spot×species scene page (#/scene/:spotId/:species)
  const chipsEl = el.querySelector(".detail-chips");
  if (chipsEl) chipsEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-scene-species]");
    if (b) location.hash = `#/scene/${encodeURIComponent(s.id)}/${encodeURIComponent(b.dataset.sceneSpecies)}`;
  });
  document.getElementById("detail").classList.remove("hidden");

  // Load per-spot live conditions (cached 10 min). Async — updates the section when done,
  // then RE-SCORES the spot with its own conditions so the score, the bar and "Why Today"
  // exactly match the Live Conditions panel (they used to come from different data).
  // Kicked off BEFORE flyTo so a map hiccup can never block the data refresh.
  fetchSpotConditions(s).then(data => {
    // Race guard: if the user has since opened a DIFFERENT spot, this resolved fetch belongs to
    // an old detail view — drop it so it can't clobber the spot now on screen.
    if (currentDetail.spotId !== s.id) return;
    const box = document.getElementById("spotConditions");
    if (box) box.innerHTML = renderSpotConditionsHTML(data);
    const refined = scoreSpot(s, referencePoint(), data, currentMode);
    const num = document.getElementById("detailScoreNum");
    const bar = document.getElementById("detailScoreBar");
    const why = document.getElementById("whyList");
    const note = document.getElementById("whyNote");
    if (num) num.textContent = toDisplayScore(refined.displayScore);
    if (bar) bar.style.width = toDisplayScore(refined.displayScore) + "%";
    if (why) why.innerHTML = refined.reasons.map(r => `<li>${r}</li>`).join("") || "<li>当前无特别加减分因素</li>";
    if (note) note.textContent = `✓ 已按本点实时海况精算 · ${formatTime(new Date(data.fetchedAt))}`;
    // Refresh the rock-fishing go/no-go banner to match the refined per-spot snapshot.
    const sv = document.getElementById("safetyVerdict");
    if (sv) { sv.innerHTML = renderSafetyVerdict(s, safetyVerdict(s, refined.snapshot)); bindSafetyVerdict(); }
    // Catch reports logged from now on freeze THIS refined (per-spot) snapshot.
    currentDetail.snapshot = refined.snapshot;
  }).catch(err => {
    if (currentDetail.spotId !== s.id) return;
    // Per-spot refine failed. If we had seeded regional data, keep it on screen (don't blank it).
    // Only when there was no seed at all do we show the unavailable message.
    if (!seedCond) {
      const box = document.getElementById("spotConditions");
      if (box) box.innerHTML = `<div class="spot-conditions-loading">海况数据暂不可用 · Conditions unavailable</div>`;
    }
    console.warn("spot conditions fetch failed", err);
  });

  try {
    map.flyTo([s.lat, s.lng], 14, { duration: 0.8 });
  } catch (e) {
    console.warn("flyTo failed", e);
  }
}

function tideDisplay(tide) {
  if (!tide) return null;
  const arrow = tide.trend === "rising" ? "↗" : tide.trend === "falling" ? "↘" : "⏸";
  const phaseLabel = ({
    "rising": "涨潮中",
    "falling": "退潮中",
    "high-slack": "高潮平潮",
    "low-slack": "低潮平潮",
    "slack": "平潮"
  })[tide.phase] || tide.phase;
  let suffix = "";
  if (tide.trend === "rising" && tide.nextHigh) {
    suffix = ` · 高潮 ${formatTime(tide.nextHigh.time)} (${tide.hoursToHigh.toFixed(1)}h)`;
  } else if (tide.trend === "falling" && tide.nextLow) {
    suffix = ` · 低潮 ${formatTime(tide.nextLow.time)} (${tide.hoursToLow.toFixed(1)}h)`;
  }
  return `${arrow} ${phaseLabel}${suffix}`;
}

// Update the collapsed pill label with the most relevant one-line summary.
function updateWeatherPillLabel() {
  const label = document.getElementById("weatherPillLabel");
  if (!label) return;
  if (!currentWeather || !currentWeather.weather) {
    label.textContent = "加载中";
    return;
  }
  const w = currentWeather.weather;
  const m = currentWeather.marine;
  const parts = [];
  if (w.temperature_2m != null) parts.push(`${w.temperature_2m.toFixed(0)}°`);
  if (m && m.wave_height != null) parts.push(`浪 ${m.wave_height.toFixed(1)}m`);
  label.textContent = parts.length ? parts.join(" · ") : "海况";
}

function openWeatherBox() {
  const box = document.getElementById("weatherBox");
  const pill = document.getElementById("weatherPill");
  if (!box || !pill) return;
  box.classList.remove("hidden");
  pill.classList.add("hidden");
}

function closeWeatherBox() {
  const box = document.getElementById("weatherBox");
  const pill = document.getElementById("weatherPill");
  if (!box || !pill) return;
  box.classList.add("hidden");
  pill.classList.remove("hidden");
}

function showWeather() {
  // Always render content into the expanded box. Whether box is visible is controlled
  // by the pill/close button. Also keep the pill label up-to-date.
  updateWeatherPillLabel();
  const box = document.getElementById("weatherBox");
  if (!currentWeather || !currentWeather.weather) { return; }
  const w = currentWeather.weather;
  const m = currentWeather.marine;
  const t = currentWeather.tide;
  const windows = computePrimeWindows(w._daily);
  const winStatus = currentWindowStatus(windows);
  const content = document.getElementById("weatherContent");
  const tideText = tideDisplay(t);

  const primeTimeBlock = windows ? `
    <div class="prime-windows">
      <div class="prime-header">${svgIcon('clock')} 今日最佳时段 · Prime Time</div>
      <div class="prime-row ${winStatus === 'dawn' ? 'active' : ''}">
        <span class="prime-icon">${svgIcon('sunrise')}</span>
        <span class="prime-label">晨 Dawn</span>
        <span class="prime-range">${formatTime(windows.dawn.start)} – ${formatTime(windows.dawn.end)}</span>
      </div>
      <div class="prime-row ${winStatus === 'dusk' ? 'active' : ''}">
        <span class="prime-icon">${svgIcon('sunset')}</span>
        <span class="prime-label">昏 Dusk</span>
        <span class="prime-range">${formatTime(windows.dusk.start)} – ${formatTime(windows.dusk.end)}</span>
      </div>
      ${winStatus ? `<div class="prime-now">${svgIcon('spark')} 当前正值${winStatus === 'dawn' ? '晨钓' : '昏钓'}黄金窗口</div>` : ""}
    </div>
  ` : "";

  const dp = pressureTrend(w._pressure);
  const dpText = dp == null ? null
    : dp <= -1.5 ? `↓ ${dp.toFixed(1)} hPa/3h · 鱼口转好`
    : dp >= 2.5 ? `↑ +${dp.toFixed(1)} hPa/3h`
    : `平稳 (${dp >= 0 ? "+" : ""}${dp.toFixed(1)})`;
  const moon = moonInfo();

  content.innerHTML = `
    <div class="row"><span>气温 Temp</span><span>${w.temperature_2m?.toFixed(1) ?? "-"} °C</span></div>
    <div class="row"><span>风 Wind</span><span>${degToCompass(w.wind_direction_10m)} ${w.wind_speed_10m?.toFixed(0) ?? "-"} km/h</span></div>
    <div class="row"><span>降雨 Rain</span><span>${w.precipitation?.toFixed(1) ?? 0} mm</span></div>
    ${m ? `<div class="row"><span>浪高 Wave</span><span>${m.wave_height?.toFixed(1) ?? "-"} m</span></div>` : ""}
    ${m ? `<div class="row"><span>周期 Period</span><span>${m.wave_period?.toFixed(0) ?? "-"} s</span></div>` : ""}
    ${dpText ? `<div class="row"><span>气压 Pressure</span><span>${dpText}</span></div>` : ""}
    <div class="row"><span>月相 Moon</span><span>${moon.label}${moon.springy ? " · 大潮" : ""}</span></div>
    ${tideText ? `<div class="row tide-row"><span>潮汐 Tide</span><span>${tideText}</span></div>` : ""}
    ${primeTimeBlock}
  `;
  // Pill visibility is now governed by openWeatherBox / closeWeatherBox, not showWeather itself.
}

// Small badge shown in the detail hero with today's prime windows.
function renderPrimeWindowBadge() {
  if (!currentWeather || !currentWeather.weather) return "";
  const windows = computePrimeWindows(currentWeather.weather._daily);
  if (!windows) return "";
  const winStatus = currentWindowStatus(windows);
  const nowActive = winStatus ? `<span class="prime-badge-now">${svgIcon('spark')} 正值黄金时段</span>` : "";
  return `
    <div class="prime-badge">
      ${nowActive}
      <div class="prime-badge-row">
        <span>${svgIcon('sunrise')} 晨钓 ${formatTime(windows.dawn.start)}-${formatTime(windows.dawn.end)}</span>
        <span>${svgIcon('sunset')} 昏钓 ${formatTime(windows.dusk.start)}-${formatTime(windows.dusk.end)}</span>
      </div>
    </div>
  `;
}

async function locateUser() {
  const btn = document.getElementById("locateBtn");
  const status = document.getElementById("status");
  if (!navigator.geolocation) {
    status.textContent = "浏览器不支持定位，使用悉尼市中心作默认位置。";
    status.classList.add("error");
    userLatLng = SYDNEY_CENTER;
    await loadConditions();
    render();
    return;
  }
  btn.disabled = true;
  setLocateLabel("定位中…");
  status.classList.remove("error");
  status.textContent = "获取您的位置…";

  navigator.geolocation.getCurrentPosition(async pos => {
    userLatLng = [pos.coords.latitude, pos.coords.longitude];
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.marker(userLatLng, {
      icon: L.divIcon({
        html: '<div style="background:#11b9c6;border:3px solid #fff;width:20px;height:20px;border-radius:50%;box-shadow:0 0 0 6px rgba(17,185,198,.28)"></div>',
        iconSize: [20,20], iconAnchor: [10,10], className: ""
      })
    }).addTo(map).bindPopup("您的位置 · You are here");
    map.flyTo(userLatLng, 12, { duration: 0.8 });
    status.textContent = "正在获取实时海况…";
    await loadConditions();
    render();
    const best = sortedSpots[0];
    if (best) {
      status.textContent = `✅ 推荐：${best.spot.nameCn}（${best.dist.toFixed(1)} km）· 钓况 ${toDisplayScore(best.displayScore)}/100`;
    }
    btn.disabled = false;
    setLocateLabel("刷新");
  }, err => {
    status.textContent = "无法获取定位（" + err.message + "），使用悉尼市中心。";
    status.classList.add("error");
    userLatLng = SYDNEY_CENTER;
    loadConditions().then(render);
    btn.disabled = false;
    setLocateLabel("定位我");
  }, { enableHighAccuracy: true, timeout: 10000 });
}

async function loadConditions() {
  const ref = referencePoint();
  await loadConditionsAt(ref);
}

async function loadConditionsAt(latLng) {
  if (!latLng) return;
  const [weather, marine, tide] = await Promise.all([
    fetchWeather(latLng[0], latLng[1]),
    fetchMarine(latLng[0], latLng[1]),
    fetchTide(latLng[0], latLng[1])
  ]);
  currentWeather = { weather, marine, tide };
  conditionsCenterLatLng = latLng;
  showWeather();
}

// ---------- Per-spot conditions cache (10 min TTL) ----------
// Keyed by spot id → { weather, marine, tide, fetchedAt }
const spotConditionsCache = new Map();
const SPOT_CACHE_TTL_MS = 10 * 60 * 1000;

async function fetchSpotConditions(spot) {
  const cached = spotConditionsCache.get(spot.id);
  if (cached && (Date.now() - cached.fetchedAt) < SPOT_CACHE_TTL_MS) {
    return cached;
  }
  const [weather, marine, tide] = await Promise.all([
    fetchWeather(spot.lat, spot.lng),
    fetchMarine(spot.lat, spot.lng),
    fetchTide(spot.lat, spot.lng)
  ]);
  const result = { weather, marine, tide, fetchedAt: Date.now() };
  spotConditionsCache.set(spot.id, result);
  return result;
}

// Render the conditions panel for a specific spot (used in the detail modal).
function renderSpotConditionsHTML(data) {
  if (!data || !data.weather) {
    return `<div class="spot-conditions-loading">海况加载中… · Loading conditions</div>`;
  }
  const w = data.weather;
  const m = data.marine;
  const t = data.tide;
  const windows = computePrimeWindows(w._daily);
  const winStatus = currentWindowStatus(windows);
  const tideText = tideDisplay(t);

  const primeBlock = windows ? `
    <div class="spot-cond-prime">
      <div class="spot-cond-prime-header">${svgIcon('clock')} 今日最佳时段 · Prime Time</div>
      <div class="spot-cond-prime-rows">
        <div class="${winStatus === 'dawn' ? 'active' : ''}">${svgIcon('sunrise')} 晨 ${formatTime(windows.dawn.start)}–${formatTime(windows.dawn.end)}</div>
        <div class="${winStatus === 'dusk' ? 'active' : ''}">${svgIcon('sunset')} 昏 ${formatTime(windows.dusk.start)}–${formatTime(windows.dusk.end)}</div>
      </div>
      ${winStatus ? `<div class="spot-cond-now">${svgIcon('spark')} 当前正值${winStatus === 'dawn' ? '晨钓' : '昏钓'}黄金窗口</div>` : ""}
    </div>
  ` : "";

  const moon = moonInfo();
  return `
    <div class="spot-cond-grid">
      <div><span>${svgIcon('temp')} 气温</span><b>${w.temperature_2m?.toFixed(1) ?? "-"} °C</b></div>
      <div><span>${svgIcon('wind')} 风</span><b>${degToCompass(w.wind_direction_10m)} ${w.wind_speed_10m?.toFixed(0) ?? "-"} km/h</b></div>
      <div><span>${svgIcon('rain')} 降雨</span><b>${w.precipitation?.toFixed(1) ?? 0} mm</b></div>
      ${m ? `<div><span>${svgIcon('wave')} 浪高</span><b>${m.wave_height?.toFixed(1) ?? "-"} m</b></div>` : ""}
      ${m ? `<div><span>${svgIcon('clock')} 周期</span><b>${m.wave_period?.toFixed(0) ?? "-"} s</b></div>` : ""}
      <div><span>${svgIcon('moon')} 月相</span><b>${moon.label.replace(/^\S+ /, "")}</b></div>
      ${t && t.nextHigh ? `<div><span>${svgIcon('arrow-up')} 下个高潮</span><b>${formatTime(t.nextHigh.time)}</b></div>` : ""}
      ${t && t.nextLow ? `<div><span>${svgIcon('arrow-down')} 下个低潮</span><b>${formatTime(t.nextLow.time)}</b></div>` : ""}
      ${tideText ? `<div class="wide"><span>${svgIcon('tide')} 潮汐</span><b>${tideText}</b></div>` : ""}
    </div>
    ${primeBlock}
    <div class="spot-cond-footnote">${data._seed
      ? `区域实时数据 · 正在按本点坐标精算…`
      : `数据时间 ${formatTime(new Date(data.fetchedAt))} · 基于钓点坐标实时计算 · 潮汐时间已按悉尼官方潮表校准`}</div>
  `;
}

// Update the status bar to reflect whether recommendations are based on user location or map center.
function updateReferenceIndicator() {
  const statusEl = document.getElementById("status");
  if (!statusEl) return;
  if (!mapCenterLatLng) return;
  const useUser = userLatLng && haversineKm(mapCenterLatLng, userLatLng) < 3;
  const best = sortedSpots[0];
  if (useUser && userLatLng) {
    statusEl.classList.remove("error");
    statusEl.innerHTML = best
      ? `${svgIcon('pin')} 基于你的位置 · 推荐：<b>${escapeHtml(best.spot.nameCn)}</b> · ${toDisplayScore(best.displayScore)}/100`
      : `${svgIcon('pin')} 基于你的位置`;
  } else {
    statusEl.classList.remove("error");
    const label = regionLabelForLatLng(mapCenterLatLng);
    const backBtn = userLatLng
      ? ` <a href="#" id="backToMe" style="color:#0077b6;text-decoration:underline">返回我的位置</a>`
      : "";
    statusEl.innerHTML = best
      ? `${svgIcon('map')} 基于地图视野（${label}）· 推荐：<b>${escapeHtml(best.spot.nameCn)}</b> · ${toDisplayScore(best.displayScore)}/100${backBtn}`
      : `${svgIcon('map')} 基于地图视野（${label}）${backBtn}`;
    const back = document.getElementById("backToMe");
    if (back) back.onclick = (e) => {
      e.preventDefault();
      if (userLatLng) {
        map.flyTo(userLatLng, 12, { duration: 0.8 });
      }
    };
  }
}

// Rough region label by lat for the status bar.
function regionLabelForLatLng(p) {
  const lat = p[0];
  if (lat < -34.3) return "Illawarra / Kiama";
  if (lat < -34.1) return "Wollongong / Illawarra";
  if (lat < -33.7) return "悉尼 Sydney";
  if (lat < -33.2) return "悉尼北 / Central Coast";
  if (lat < -32.85) return "Central Coast";
  return "Newcastle / Hunter";
}

// ---------- Reviews & Community References ----------
const REVIEW_KEY = "sf_reviews_v1";

function loadUserReviews() {
  try { return JSON.parse(localStorage.getItem(REVIEW_KEY) || "{}"); }
  catch (e) { return {}; }
}
function saveUserReviews(obj) {
  try { localStorage.setItem(REVIEW_KEY, JSON.stringify(obj)); } catch (e) {}
}
function getSeedRefs(spotId) {
  return (window.SEED_REVIEWS && window.SEED_REVIEWS[spotId]) || [];
}
function getUserReviews(spotId) {
  return (loadUserReviews()[spotId] || []);
}
function avgRating(items) {
  if (!items.length) return 0;
  return items.reduce((s, r) => s + (r.rating || 0), 0) / items.length;
}
function starString(n) {
  const full = Math.round(n);
  return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
}

function sourceTypeIcon(t) {
  return ({
    "forum": "💬",
    "reddit": "🟠",
    "youtube": "📺",
    "blog": "📝",
    "official": "🏛️"
  })[t] || "🔗";
}

function renderRefItem(ref) {
  const stars = starString(ref.rating || 0);
  const icon = sourceTypeIcon(ref.type);
  return `
    <a class="ref-item" href="${escapeAttr(ref.url)}" target="_blank" rel="noopener noreferrer">
      <div class="ref-icon">${icon}</div>
      <div class="ref-body">
        <div class="ref-head">
          <span class="ref-source">${escapeHtml(ref.source)}</span>
          <span class="ref-stars">${stars}</span>
        </div>
        <div class="ref-note">${escapeHtml(ref.note)}</div>
        <div class="ref-url">${escapeHtml(ref.url.replace(/^https?:\/\//, "").slice(0, 60))}${ref.url.length > 67 ? "…" : ""} ↗</div>
      </div>
    </a>
  `;
}

function renderUserReview(r) {
  const avatar = (r.user || "?").slice(0, 1).toUpperCase();
  const safe = safeUrl(r.sourceUrl);
  const sourceLink = safe ? `
    <a class="review-source" href="${escapeAttr(safe)}" target="_blank" rel="noopener noreferrer ugc">
      🔗 ${escapeHtml(r.sourceName || "来源")} ↗
    </a>
  ` : "";
  return `
    <div class="review-item">
      <div class="review-head">
        <div class="review-user">
          <div class="review-avatar">${escapeHtml(avatar)}</div>
          <div>
            ${escapeHtml(r.user)}
            <div class="review-date">${escapeHtml(r.date || "")}</div>
          </div>
        </div>
        <div class="review-stars">${starString(r.rating || 0)}</div>
      </div>
      <div class="review-text">${escapeHtml(r.text)}</div>
      ${sourceLink}
    </div>
  `;
}

// Renders the reviews shell synchronously. The community review list + summary are filled
// asynchronously by loadAndRenderReviews() (server when available, localStorage as fallback).
function renderReviewsSection(spotId) {
  const refs = getSeedRefs(spotId);
  const globalRefs = getSeedRefs("_global");

  const refsBlock = refs.length ? `
    <div class="refs-block">
      <div class="refs-header">📚 社区参考资料 · External References</div>
      <div class="refs-list">${refs.map(renderRefItem).join("")}</div>
      <div class="refs-disclaimer">* 链接指向公开论坛搜索/讨论页面，点击可查看社区原始讨论</div>
    </div>
  ` : "";

  const globalBlock = globalRefs.length ? `
    <div class="refs-block global">
      <div class="refs-header">${svgIcon('alert')} 出钓前必查 · Before You Go</div>
      <div class="refs-list">${globalRefs.map(renderRefItem).join("")}</div>
    </div>
  ` : "";

  return `
    <div id="reviewsSummary"></div>
    ${refsBlock}
    <div class="user-reviews-block">
      <div class="refs-header">👥 钓友评论 · Community Reviews</div>
      <div class="review-list" id="serverReviewList"><div class="reviews-loading">加载中…</div></div>
    </div>
    ${globalBlock}
    ${renderReviewFormArea(spotId)}
  `;
}

// The review form adapts to backend availability + auth state.
function renderReviewFormArea(spotId) {
  const api = window.SF_API;
  const stars = `
    <div class="star-picker" id="rv-stars" data-value="5">
      <span data-v="1">★</span><span data-v="2">★</span><span data-v="3">★</span>
      <span data-v="4">★</span><span data-v="5">★</span>
    </div>`;
  const sourceFields = `
    <div class="source-fields">
      <input type="text" id="rv-source-name" maxlength="40" placeholder="来源名称（可选）例：YouTube 某频道" />
      <input type="url" id="rv-source-url" maxlength="300" placeholder="来源链接（可选）https://..." />
    </div>`;

  // Backend down → legacy localStorage form (offline-friendly, unchanged behaviour).
  if (!api || !api.available) {
    return `
      <div class="review-form">
        <h5>分享你的钓获 · Leave a Review</h5>
        <input type="text" id="rv-user" maxlength="20" placeholder="昵称 Nickname" />
        ${stars}
        <textarea id="rv-text" maxlength="400" placeholder="分享你的鱼获、饵料或当天的海况…"></textarea>
        ${sourceFields}
        <button class="review-submit" id="rv-submit" data-spot="${spotId}">发布评论（仅存本机）</button>
      </div>`;
  }
  // Backend up, logged out → prompt to sign in.
  if (!api.user) {
    return `
      <div class="review-form">
        <h5>分享你的钓获 · Leave a Review</h5>
        <p class="auth-needed">登录后即可发表评论，并跨设备保存 · Sign in to post & sync.</p>
        <button class="auth-cta" id="rv-login">登录 / 注册</button>
      </div>`;
  }
  // Backend up, logged in.
  const localCount = localStorage.getItem("sf_reviews_migrated") ? 0 : flattenLocalReviews().length;
  const importBtn = localCount
    ? `<button class="import-cta" id="rv-import">📥 导入本机 ${localCount} 条旧评论</button>` : "";
  return `
    <div class="review-form">
      <h5>分享你的钓获 · ${escapeHtml(api.user.displayName || api.user.email)}</h5>
      ${stars}
      <textarea id="rv-text" maxlength="2000" placeholder="分享你的鱼获、饵料或当天的海况…"></textarea>
      ${sourceFields}
      <button class="review-submit" id="rv-submit" data-spot="${spotId}">发布评论</button>
      ${importBtn}
    </div>`;
}

function escapeAttr(s) {
  return (s || "").replace(/["'<>&]/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
// Only allow http(s) URLs into hrefs (blocks javascript:/data: from user-supplied links).
function safeUrl(u) {
  if (!u) return "";
  try {
    const x = new URL(u, location.href);
    return (x.protocol === "http:" || x.protocol === "https:") ? u : "";
  } catch (e) { return ""; }
}
function bindReviewForm(spotId) {
  document.getElementById("rv-login")?.addEventListener("click", () => window.SF_AUTH_UI?.openModal("login"));
  document.getElementById("rv-import")?.addEventListener("click", () => importLocalReviews(spotId));

  const picker = document.getElementById("rv-stars");
  if (!picker) return; // logged-out CTA: nothing else to wire
  const spans = picker.querySelectorAll("span");
  const paint = v => spans.forEach(s => s.classList.toggle("active", +s.dataset.v <= v));
  paint(5);
  spans.forEach(s => s.addEventListener("click", () => { picker.dataset.value = s.dataset.v; paint(+s.dataset.v); }));

  document.getElementById("rv-submit")?.addEventListener("click", async () => {
    const textEl = document.getElementById("rv-text");
    const text = textEl ? textEl.value.trim() : "";
    const rating = parseInt(picker.dataset.value, 10) || 5;
    const sourceName = document.getElementById("rv-source-name")?.value.trim() || "";
    let sourceUrl = document.getElementById("rv-source-url")?.value.trim() || "";
    if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) sourceUrl = "https://" + sourceUrl;
    if (sourceUrl) { try { new URL(sourceUrl); } catch (e) { alert("请检查来源链接格式，需以 http:// 或 https:// 开头"); return; } }
    if (!text) { alert("请输入评论内容"); return; }

    const api = window.SF_API;
    const btn = document.getElementById("rv-submit");
    if (api && api.available && api.user) {
      btn.disabled = true;
      try {
        await api.addReview({ spotId, rating, body: text, bodyLang: "zh",
          sourceName: sourceName || undefined, sourceUrl: sourceUrl || undefined });
        textEl.value = "";
        await loadAndRenderReviews(spotId);
      } catch (e) { alert(e.message || "发布失败"); }
      finally { btn.disabled = false; }
    } else {
      // Legacy localStorage path (backend unavailable).
      const user = document.getElementById("rv-user")?.value.trim() || "匿名钓友";
      const all = loadUserReviews();
      const list = all[spotId] || [];
      list.unshift({ user, rating, text, sourceName: sourceName || undefined,
        sourceUrl: sourceUrl || undefined, date: new Date().toISOString().slice(0, 10) });
      all[spotId] = list;
      saveUserReviews(all);
      showDetail(spotId);
    }
  });
}

// Fill the community review list + summary: server when available, else localStorage.
async function loadAndRenderReviews(spotId) {
  const listEl = document.getElementById("serverReviewList");
  const sumEl = document.getElementById("reviewsSummary");
  const seedRefs = getSeedRefs(spotId);
  const api = window.SF_API;
  let reviews = null;
  if (api && api.available) {
    try { reviews = (await api.getReviews(spotId)).reviews; }
    catch (e) { reviews = null; }
  }
  if (reviews == null) {
    // Fallback: legacy localStorage reviews so the app still shows content offline.
    reviews = getUserReviews(spotId).map(r => ({
      rating: r.rating, body: r.text, source_url: r.sourceUrl, source_name: r.sourceName,
      created_at: r.date, user_name: r.user, source: "local"
    }));
  }
  if (listEl) {
    listEl.innerHTML = reviews.length
      ? reviews.map(serverReviewHTML).join("")
      : `<div class="no-reviews">还没有评论，来做第一个分享的钓友</div>`;
  }
  if (sumEl) {
    const all = [...seedRefs, ...reviews];
    sumEl.innerHTML = all.length
      ? `<div class="reviews-summary">
           <div class="big-star">${avgRating(all).toFixed(1)}</div>
           <div>
             <div class="stars-line">${starString(avgRating(all))}</div>
             <div class="count">${seedRefs.length} 条社区参考 · ${reviews.length} 条钓友评论</div>
           </div>
         </div>`
      : `<div class="no-reviews">暂无参考资料，成为第一位分享钓友</div>`;
  }
}

function serverReviewHTML(r) {
  return renderUserReview({
    user: r.user_name || (r.source === "local_import" ? "我（已迁移）" : "钓友"),
    rating: r.rating, text: r.body,
    date: (r.created_at || "").slice(0, 10),
    sourceName: r.source_name, sourceUrl: r.source_url
  });
}

// Flatten localStorage reviews (sf_reviews_v1) into the import payload shape.
function flattenLocalReviews() {
  const all = loadUserReviews();
  const out = [];
  for (const spotId of Object.keys(all)) {
    for (const r of (all[spotId] || [])) {
      if (!r || !r.text) continue;
      out.push({ spotId, rating: r.rating || 5, text: r.text, date: r.date,
        lang: "zh", sourceUrl: r.sourceUrl, sourceName: r.sourceName });
    }
  }
  return out;
}

async function importLocalReviews(spotId) {
  const items = flattenLocalReviews();
  if (!items.length) { alert("本机没有可导入的评论"); return; }
  try {
    const r = await window.SF_API.importReviews(items);
    localStorage.setItem("sf_reviews_migrated", "1"); // keep the local copy; just stop re-prompting
    alert(`已导入 ${r.imported} 条，跳过 ${r.skipped} 条重复 · Imported ${r.imported}, skipped ${r.skipped}`);
    showDetail(spotId); // re-render to drop the import button + reload list
  } catch (e) { alert(e.message || "导入失败"); }
}

// Live wave/surf monitoring links for a spot's region (CSP-safe outbound links — no iframes).
// 让用户出发前直接"看到浪"：官方实时浪高浮标 + 海滩冲浪摄像头。
function renderCamsSection(spot) {
  if (!window.camsForRegion || !window.spotRegionId) return "";
  const cams = window.camsForRegion(window.spotRegionId(spot));
  if (!cams.length) return "";
  const ico = (k) => k === "data" ? "📈" : k === "cam" ? "📹" : "🌐";
  const rows = cams.map(c =>
    `<a class="cam-link" href="${escapeAttr(safeUrl(c.url))}" target="_blank" rel="noopener noreferrer">
      <span class="cam-ico">${ico(c.kind)}</span>
      <span class="cam-name">${escapeHtml(c.nameCn)} <span class="en">${escapeHtml(c.name)}</span></span>
      <span class="cam-src">${escapeHtml(c.source)} ↗</span>
    </a>`).join("");
  return `
    <section>
      <h4>📹 实时浪况 · Live Cams &amp; Wave Data</h4>
      <div class="cam-list">${rows}</div>
      <div class="reg-disclaimer">外部链接，新窗口打开 · External links open in a new tab</div>
    </section>`;
}

// ---------- Catch reports ----------
// One-line NSW reminder for the catch form when a species is picked (escaped throughout).
function catchRegReminderHTML(spot, species) {
  const reg = regsForSpecies(species);
  const meta = window.NSW_REGULATIONS_META || {};
  if (!reg && !(spot.marineZone && spot.marineZone.sanctuary)) return "";
  const bits = [];
  if (spot.marineZone && spot.marineZone.sanctuary) bits.push(`🚫 ${escapeHtml(spot.marineZone.noteCn || "禁渔保护区")}`);
  if (reg) {
    if (reg.protected) bits.push(`🚫 ${escapeHtml(reg.nameCn)} 受保护，请放流 · protected, release`);
    else bits.push(escapeHtml(regSummaryText(reg)));
  }
  return `${bits.join(" · ")} <span class="reg-updated">以官方为准 · ${escapeHtml(meta.lastUpdated || "")}</span>`;
}

function renderCatchFormArea(spot) {
  const api = window.SF_API;
  if (!api || !api.available) {
    return `<div class="catch-note">连接后端服务后即可记录渔获，并参与评分校准。</div>`;
  }
  if (!api.user) {
    return `<button class="auth-cta" id="catch-login">${svgIcon('fish')} 登录后记录渔获 · Sign in to log a catch</button>`;
  }
  const opts = (spot.species || []).map(sp => `<option value="${escapeAttr(sp)}">${escapeHtml(sp)}</option>`).join("");
  return `
    <div class="catch-form">
      <h5>记录这次渔获 · Log a Catch</h5>
      <div class="catch-row">
        <select id="ct-species"><option value="">选择鱼种…</option>${opts}<option value="__other">其他 Other</option></select>
        <input id="ct-species-other" placeholder="其他鱼种" maxlength="40" style="display:none" />
      </div>
      <div id="ct-reg-reminder" class="catch-reg-reminder" aria-live="polite"></div>
      <div class="catch-row">
        <input id="ct-length" type="number" min="0" max="500" step="0.1" placeholder="长度 cm" />
        <input id="ct-weight" type="number" min="0" max="500" step="0.01" placeholder="重量 kg" />
        <select id="ct-keep"><option value="">留/放…</option><option value="kept">留 Kept</option><option value="released">放流 Released</option></select>
      </div>
      <div class="catch-row">
        <input id="ct-technique" placeholder="钓法 Technique" maxlength="120" />
        <input id="ct-bait" placeholder="饵料 Bait" maxlength="120" />
      </div>
      <textarea id="ct-notes" maxlength="2000" placeholder="备注 · 当天海况、咬口、心得…"></textarea>
      <label class="ct-photo-label">
        📷 添加照片（可选，最多 4 张）
        <input id="ct-photo" type="file" accept="image/jpeg,image/png,image/webp" multiple />
      </label>
      <div id="ct-photo-preview" class="ct-photo-preview"></div>
      <button class="catch-submit" id="ct-submit">记录渔获（含当前评分快照）</button>
      <div class="catch-hint">照片上传时会自动去除 GPS/EXIF 信息以保护隐私。提交会附上此刻的天气/潮汐/评分快照，用于让推荐越来越准。</div>
    </div>`;
}

async function loadSpotCatches(spotId) {
  const el = document.getElementById("catchList");
  if (!el) return;
  const api = window.SF_API;
  if (!api || !api.available) { el.innerHTML = ""; return; }
  try {
    const { catches } = await api.getCatches(spotId);
    el.innerHTML = catches.length
      ? catches.map(catchItemHTML).join("")
      : `<div class="no-reviews">还没有渔获记录，记录你的第一条</div>`;
    // Delegated handler for the per-catch 🚩 report buttons.
    el.onclick = (e) => {
      const b = e.target.closest("[data-report-catch]");
      if (b) { e.preventDefault(); reportCatchFlow(b.getAttribute("data-report-catch")); }
    };
  } catch (e) { el.innerHTML = ""; }
}

function catchItemHTML(c) {
  const bits = [];
  if (c.length_cm) bits.push(`${c.length_cm}cm`);
  if (c.weight_kg) bits.push(`${c.weight_kg}kg`);
  if (c.kept === true) bits.push("留 kept");
  if (c.released === true) bits.push("放流 released");
  const meta = [c.technique, c.bait].filter(Boolean).map(escapeHtml).join(" · ");
  const date = (c.caught_at || c.created_at || "").slice(0, 10);
  return `
    <div class="catch-item">
      <div class="catch-head">
        <span class="catch-species">🐟 ${escapeHtml(c.species || "未填鱼种")}</span>
        ${bits.length ? `<span class="catch-size">${escapeHtml(bits.join(" · "))}</span>` : ""}
      </div>
      ${(c.photos && c.photos.length) ? `<div class="catch-photos">${c.photos.map(p =>
        `<a class="catch-photo" href="${escapeAttr(window.SF_API.mediaUrl(p.full))}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${escapeAttr(window.SF_API.mediaUrl(p.thumb))}" alt="渔获照片" /></a>`).join("")}</div>` : ""}
      ${c.notes ? `<div class="catch-notes">${escapeHtml(c.notes)}</div>` : ""}
      ${meta ? `<div class="catch-meta">${meta}</div>` : ""}
      <div class="catch-foot">
        <span>${escapeHtml(c.user_name || "钓友")}</span>
        <span class="catch-foot-meta">${escapeHtml(date)}${c.engine_version ? ` · 评分快照 v${escapeHtml(c.engine_version)}` : ""}${window.SF_API?.user ? ` · <button type="button" class="link-report" data-report-catch="${escapeAttr(String(c.id))}" title="举报 Report">🚩</button>` : ""}</span>
      </div>
    </div>`;
}

// Lightweight moderation report modal. Resolves to {reason, detail} or null (cancelled).
// Shared by the spot-detail catch list and the insights feed. CSP-safe (no inline handlers).
function openReportModal() {
  return new Promise(resolve => {
    const modal = document.getElementById("reportModal");
    if (!modal) { // graceful fallback if markup is absent
      const r = prompt("举报原因 Reason:");
      resolve(r ? { reason: r.slice(0, 40), detail: "" } : null);
      return;
    }
    const reasons = modal.querySelector("#reportReasons");
    const detail = modal.querySelector("#reportDetail");
    const err = modal.querySelector("#reportErr");
    let chosen = "";
    detail.value = ""; err.textContent = "";
    reasons.querySelectorAll(".report-reason").forEach(b => {
      b.classList.remove("active");
      b.onclick = () => { chosen = b.dataset.r; reasons.querySelectorAll(".report-reason").forEach(x => x.classList.toggle("active", x === b)); };
    });
    const finish = (val) => { modal.classList.add("hidden"); modal.querySelector("#reportSubmit").onclick = null; modal.querySelector("#reportClose").onclick = null; modal.onclick = null; resolve(val); };
    modal.classList.remove("hidden");
    modal.querySelector("#reportClose").onclick = () => finish(null);
    modal.onclick = (e) => { if (e.target === modal) finish(null); };
    modal.querySelector("#reportSubmit").onclick = () => {
      if (!chosen) { err.textContent = "请选择一个原因 · Pick a reason"; return; }
      finish({ reason: chosen, detail: (detail.value || "").trim().slice(0, 500) });
    };
  });
}

async function reportCatchFlow(id) {
  if (!window.SF_API?.user) { window.SF_AUTH_UI?.openModal("login"); return; }
  const r = await openReportModal();
  if (!r) return;
  try { await window.SF_API.reportCatch(id, r.reason, r.detail); alert("已提交举报，感谢反馈 · Reported. Thank you."); }
  catch (e) { alert("举报失败 · " + e.message); }
}
window.reportCatchFlow = reportCatchFlow;

function bindCatchForm(spot) {
  document.getElementById("catch-login")?.addEventListener("click", () => window.SF_AUTH_UI?.openModal("login"));
  const sp = document.getElementById("ct-species");
  const other = document.getElementById("ct-species-other");
  const regReminder = document.getElementById("ct-reg-reminder");
  const updateRegReminder = () => {
    if (!regReminder) return;
    const v = sp ? sp.value : "";
    regReminder.innerHTML = (v && v !== "__other") ? catchRegReminderHTML(spot, v) : "";
  };
  if (sp) sp.addEventListener("change", () => {
    if (other) other.style.display = sp.value === "__other" ? "" : "none";
    updateRegReminder();
  });

  // Local previews for up to 4 photos (object URLs revoked on re-pick to avoid leaks).
  const photoInput = document.getElementById("ct-photo");
  const preview = document.getElementById("ct-photo-preview");
  let previewUrls = [];
  const clearPreviews = () => { previewUrls.forEach(u => URL.revokeObjectURL(u)); previewUrls = []; if (preview) preview.innerHTML = ""; };
  photoInput?.addEventListener("change", () => {
    clearPreviews();
    const files = [...(photoInput.files || [])].slice(0, 4);
    if (files.some(f => f.size > 12 * 1024 * 1024)) { alert("单张图片需 ≤12MB"); photoInput.value = ""; return; }
    preview.innerHTML = files.map(f => { const u = URL.createObjectURL(f); previewUrls.push(u); return `<img src="${u}" alt="预览" />`; }).join("");
  });

  const submit = document.getElementById("ct-submit");
  if (!submit) return;
  const label = submit.textContent;
  submit.addEventListener("click", async () => {
    let species = sp ? sp.value : "";
    if (species === "__other") species = (other?.value.trim() || "");
    const lengthCm = parseFloat(document.getElementById("ct-length")?.value);
    const weightKg = parseFloat(document.getElementById("ct-weight")?.value);
    const keep = document.getElementById("ct-keep")?.value;
    const technique = document.getElementById("ct-technique")?.value.trim();
    const bait = document.getElementById("ct-bait")?.value.trim();
    const notes = document.getElementById("ct-notes")?.value.trim();
    const files = [...(photoInput?.files || [])].slice(0, 4);
    if (!species && !notes && !files.length) { alert("请至少选择鱼种、填写备注或添加照片"); return; }

    // Non-blocking NSW compliance nudge — never hard-blocks (logging a release is legit).
    const reg = regsForSpecies(species);
    if (reg) {
      if (reg.protected) {
        if (!confirm(`⚠️ ${reg.nameCn} (${species}) 在 NSW 受保护/限制捕捞。\n请确认已放流 (C&R)。仍要记录吗？`)) return;
      } else if (reg.minSizeCm != null && !isNaN(lengthCm) && lengthCm < reg.minSizeCm) {
        if (!confirm(`⚠️ 你填写的长度 ${lengthCm}cm 小于 NSW 最小尺寸 ${reg.minSizeCm}cm。\n请确认已放流。仍要记录吗？`)) return;
      }
    }

    submit.disabled = true;
    try {
      // Upload each photo first (server strips EXIF/GPS), then create the catch linking them.
      let mediaIds;
      if (files.length) {
        mediaIds = [];
        for (let i = 0; i < files.length; i++) {
          submit.textContent = `上传照片 ${i + 1}/${files.length}…`;
          const m = await window.SF_API.addMedia(files[i]);
          mediaIds.push(m.id);
        }
      }
      submit.textContent = "保存中…";
      await window.SF_API.addCatch({
        spotId: spot.id,
        species: species || undefined,
        lengthCm: isNaN(lengthCm) ? undefined : lengthCm,
        weightKg: isNaN(weightKg) ? undefined : weightKg,
        kept: keep === "kept" ? true : undefined,
        released: keep === "released" ? true : undefined,
        technique: technique || undefined,
        bait: bait || undefined,
        notes: notes || undefined,
        bodyLang: "zh",
        caughtAt: new Date().toISOString(),
        conditionsSnapshot: currentDetail.snapshot || { engineVersion: ENGINE_VERSION },
        engineVersion: ENGINE_VERSION,
        mediaIds
      });
      await loadSpotCatches(spot.id);
      ["ct-length", "ct-weight", "ct-technique", "ct-bait", "ct-notes"].forEach(id => {
        const e = document.getElementById(id); if (e) e.value = "";
      });
      if (photoInput) photoInput.value = "";
      clearPreviews();
    } catch (e) {
      alert(e.message || "记录失败");
    } finally {
      submit.disabled = false;
      submit.textContent = label;
    }
  });
}

// ---------- Mobile bottom sheet ----------
function setSheetState(state) {
  sheetState = state;
  const panel = document.getElementById("panel");
  if (!panel) return;
  panel.classList.remove("sheet-collapsed", "sheet-half", "sheet-full");
  panel.classList.add("sheet-" + state);
  // Reset any inline transform that touch drag may have set
  panel.style.transform = "";
  panel.style.transition = "";
}

// Update the collapsed peek content with the current top spot.
function updateSheetPeek() {
  const peek = document.getElementById("sheetPeek");
  if (!peek) return;
  const best = sortedSpots[0];
  if (best) {
    peek.innerHTML = `<span class="peek-badge">首选 ${toDisplayScore(best.displayScore)}</span>${escapeHtml(best.spot.nameCn)}`;
  } else {
    peek.textContent = "上滑查看推荐钓点 · Swipe up";
  }
}

// Bind tap + swipe handlers to the sheet handle. Used on mobile only.
function bindSheetHandle() {
  const handle = document.getElementById("sheetHandle");
  const panel = document.getElementById("panel");
  if (!handle || !panel) return;

  let startY = 0;
  let startX = 0;
  let dragging = false;
  let sheetStartPx = 0;

  function currentTranslatePx() {
    const h = window.innerHeight;
    if (sheetState === "collapsed") return h - 78;
    if (sheetState === "half") return h - h * 0.5;
    if (sheetState === "full") return h * 0.08;
    return h * 0.5;
  }

  function snapToNearest(finalPx) {
    const h = window.innerHeight;
    const options = {
      collapsed: h - 78,
      half: h - h * 0.5,
      full: h * 0.08
    };
    let best = "half";
    let minDiff = Infinity;
    for (const [s, y] of Object.entries(options)) {
      const d = Math.abs(y - finalPx);
      if (d < minDiff) { minDiff = d; best = s; }
    }
    setSheetState(best);
  }

  handle.addEventListener("touchstart", e => {
    if (e.touches.length !== 1) return;
    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
    dragging = true;
    sheetStartPx = currentTranslatePx();
    panel.style.transition = "none";
  }, { passive: true });

  handle.addEventListener("touchmove", e => {
    if (!dragging) return;
    const dy = e.touches[0].clientY - startY;
    const newTrans = Math.max(window.innerHeight * 0.08, Math.min(window.innerHeight - 60, sheetStartPx + dy));
    panel.style.transform = `translateY(${newTrans}px)`;
  }, { passive: true });

  handle.addEventListener("touchend", e => {
    if (!dragging) return;
    dragging = false;
    const endY = e.changedTouches[0].clientY;
    const endX = e.changedTouches[0].clientX;
    const dy = endY - startY;
    const dx = endX - startX;
    // Tap detection: minimal movement
    if (Math.abs(dy) < 8 && Math.abs(dx) < 8) {
      const order = { collapsed: "half", half: "full", full: "collapsed" };
      setSheetState(order[sheetState] || "half");
      return;
    }
    // Drag release: snap to nearest state based on release position
    const finalPx = sheetStartPx + dy;
    snapToNearest(finalPx);
  });

  // Click fallback (for non-touch)
  handle.addEventListener("click", (e) => {
    // Only fire if touchend didn't already handle it
    if (e.detail === 0) return;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  render();
  bindSheetHandle();
  // Initialize sheet state based on viewport. On desktop the class is inert; on mobile default to collapsed.
  if (window.innerWidth <= 860) {
    setSheetState("collapsed");
  }
  // Kick off regional conditions (used for scoring every spot) and a map-center fetch
  // (used for the weather pill) so Prime Windows and tide are available before the user
  // even presses "locate me".
  buildRegions();
  loadRegionalConditions().then(() => {
    render();
  });
  loadConditionsAt(mapCenterLatLng).then(() => {
    render();
  });
  // Weather pill ↔ expanded box toggle
  document.getElementById("weatherPill")?.addEventListener("click", () => {
    openWeatherBox();
  });
  document.getElementById("weatherBoxClose")?.addEventListener("click", () => {
    closeWeatherBox();
  });

  document.getElementById("locateBtn").addEventListener("click", locateUser);
  document.getElementById("radiusSel").addEventListener("change", () => {
    drawRadiusCircle();
    render();
  });
  document.getElementById("speciesSel").addEventListener("change", render);
  document.getElementById("accessSel").addEventListener("change", render);
  // Spot name search — live filter as you type; the × button clears it.
  const spotSearchEl = document.getElementById("spotSearch");
  const spotSearchClear = document.getElementById("spotSearchClear");
  if (spotSearchEl) {
    spotSearchEl.addEventListener("input", () => {
      if (spotSearchClear) spotSearchClear.hidden = !spotSearchEl.value;
      render();
    });
  }
  if (spotSearchClear) {
    spotSearchClear.addEventListener("click", () => {
      spotSearchEl.value = "";
      spotSearchClear.hidden = true;
      spotSearchEl.focus();
      render();
    });
  }
  // Mode selector
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentMode = btn.dataset.mode;
      document.querySelectorAll(".mode-btn").forEach(b => b.classList.toggle("active", b === btn));
      // Hide radius selector in fish mode since distance is ignored
      const radiusLabel = document.getElementById("radiusSel")?.closest("label");
      if (radiusLabel) radiusLabel.style.opacity = currentMode === "fish" ? "0.4" : "1";
      render();
    });
  });
  document.getElementById("detail").addEventListener("click", e => {
    if (e.target.id === "detail") document.getElementById("detail").classList.add("hidden");
  });
  // Algorithm modal
  document.getElementById("algoBtn").addEventListener("click", () => {
    document.getElementById("algoModal").classList.remove("hidden");
  });
  document.getElementById("closeAlgo").addEventListener("click", () => {
    document.getElementById("algoModal").classList.add("hidden");
  });
  document.getElementById("algoModal").addEventListener("click", e => {
    if (e.target.id === "algoModal") document.getElementById("algoModal").classList.add("hidden");
  });

  // Backend: probe session/availability, then re-render any open detail when auth changes
  // (so the review/catch forms switch between logged-out and logged-in states live).
  if (window.SF_API) {
    window.SF_API.init();
    window.SF_API.onAuthChange(() => {
      const detail = document.getElementById("detail");
      if (currentDetail.spotId && detail && !detail.classList.contains("hidden")) {
        showDetail(currentDetail.spotId);
      }
    });
  }
});
