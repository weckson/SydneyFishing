// Sydney Fishing App — main logic
// - Leaflet map of Sydney
// - Geolocation to find nearest best spots
// - Open-Meteo free weather + marine + tide API (no key) for scoring
// - Score = baseScore × weatherMult × tideMult × timeMult × accessMult × distancePenalty
//   (factor weights vary by mode: fish / near / family)

const SYDNEY_CENTER = [-33.8688, 151.2093];
const COMPASS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];

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
let currentWeather = null;  // { weather, marine, tide }
let sortedSpots = [];
let currentMode = "fish";   // default: fish-first
let mapCenterLatLng = null;   // Updated on map moveend, used as reference point for scoring
let mapMoveTimer = null;      // Debounce timer for moveend
let conditionsCenterLatLng = null;  // Last center used to fetch weather/tide conditions

function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

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

  // Dynamic: on pan/zoom end, update reference point and re-render the list.
  // Debounced to avoid thrashing during rapid interactions.
  map.on("moveend", () => {
    const c = map.getCenter();
    mapCenterLatLng = [c.lat, c.lng];
    if (mapMoveTimer) clearTimeout(mapMoveTimer);
    mapMoveTimer = setTimeout(async () => {
      // If center has drifted far from where we last fetched conditions, re-fetch
      if (shouldRefetchConditions()) {
        await loadConditionsAt(mapCenterLatLng);
      }
      render();
      updateReferenceIndicator();
    }, 350);
  });
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

async function fetchWeather(lat, lng) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code&timezone=Australia%2FSydney`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("weather api failed");
    const data = await res.json();
    return data.current;
  } catch (e) {
    console.warn("weather fetch failed", e);
    return null;
  }
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

async function fetchTide(lat, lng) {
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=sea_level_height_msl&timezone=Australia%2FSydney&past_days=1&forecast_days=2`;
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

// Analyze sea_level_height_msl hourly series → current phase, trend, next high/low.
function analyzeTide(hourly) {
  const times = hourly.time.map(t => new Date(t));
  const levels = hourly.sea_level_height_msl;
  const now = Date.now();
  // Find the index closest to now
  let idx = 0;
  for (let i = 0; i < times.length; i++) {
    if (times[i].getTime() <= now) idx = i;
    else break;
  }
  const current = levels[idx];
  const prev = levels[Math.max(0, idx - 1)];
  const next = levels[Math.min(levels.length - 1, idx + 1)];

  // Trend: compare neighbors
  let trend;
  if (next > current + 0.02) trend = "rising";
  else if (next < current - 0.02) trend = "falling";
  else trend = "slack";

  // Find next high and low in next 12h (local extrema)
  let nextHigh = null, nextLow = null;
  for (let i = idx + 1; i < Math.min(levels.length - 1, idx + 14); i++) {
    const L = levels[i];
    if (!nextHigh && L > levels[i - 1] && L > levels[i + 1]) {
      nextHigh = { time: times[i], level: L };
    }
    if (!nextLow && L < levels[i - 1] && L < levels[i + 1]) {
      nextLow = { time: times[i], level: L };
    }
    if (nextHigh && nextLow) break;
  }

  const hoursToHigh = nextHigh ? (nextHigh.time.getTime() - now) / 3600000 : null;
  const hoursToLow = nextLow ? (nextLow.time.getTime() - now) / 3600000 : null;

  // Phase classification
  let phase;
  const minHours = Math.min(
    hoursToHigh != null ? hoursToHigh : Infinity,
    hoursToLow != null ? hoursToLow : Infinity
  );
  const isNearHigh = hoursToHigh != null && hoursToHigh < 1;
  const isNearLow = hoursToLow != null && hoursToLow < 1;
  if (isNearHigh) phase = "high-slack";
  else if (isNearLow) phase = "low-slack";
  else if (trend === "rising") phase = "rising";
  else if (trend === "falling") phase = "falling";
  else phase = "slack";

  return { current, trend, phase, nextHigh, nextLow, hoursToHigh, hoursToLow };
}

// Map spot's preferredTide (or default by type) + current tide data → factor + reason.
function tideFactorFor(spot, tide) {
  if (!tide) return { mult: 1.0, reason: null };
  const pref = spot.preferredTide || DEFAULT_TIDE_BY_TYPE[spot.type] || "any";
  if (pref === "any") return { mult: 1.0, reason: null };

  const phase = tide.phase;
  const trend = tide.trend;

  // Exact phase match
  if (pref === "rising" && (phase === "rising" || phase === "low-slack")) {
    return { mult: 1.18, reason: "涨潮匹配 Rising ↗ (+18%)" };
  }
  if (pref === "falling" && (phase === "falling" || phase === "high-slack")) {
    return { mult: 1.18, reason: "退潮匹配 Falling ↘ (+18%)" };
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
  if (pref === "rising" && trend === "rising") return { mult: 1.08, reason: "潮位上涨中 (+8%)" };
  if (pref === "falling" && trend === "falling") return { mult: 1.08, reason: "潮位下降中 (+8%)" };
  // Mismatch
  return { mult: 0.90, reason: "潮位不理想 (-10%)" };
}

function scoreSpot(spot, refLoc, weather, marine, tide, mode) {
  const modeCfg = SCORING_MODES[mode] || SCORING_MODES.fish;
  const reasons = [];

  // ----- Distance (mode-dependent). refLoc is the map-center or user location. -----
  const dist = refLoc ? haversineKm(refLoc, [spot.lat, spot.lng]) : 15;
  const distancePenalty = modeCfg.distancePenalty(dist);
  if (mode === "fish") {
    reasons.push("距离忽略 (鱼况优先)");
  } else if (mode === "near" && distancePenalty < 0.95) {
    reasons.push(`距离 ${dist.toFixed(1)}km (${((distancePenalty - 1) * 100).toFixed(0)}%)`);
  } else if (mode === "family" && distancePenalty < 1.0) {
    reasons.push(`距离 ${dist.toFixed(1)}km (轻微)`);
  }

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
    if (spot.prefers && spot.prefers.wind && !spot.prefers.wind.includes("any")) {
      const prefixMatch = spot.prefers.wind.some(w => dir.startsWith(w));
      if (prefixMatch) { weatherMult *= 1.1; reasons.push("风向 " + dir + " 适合此点"); }
      else { weatherMult *= 0.85; }
    }
    if (weather.precipitation && weather.precipitation > 2) {
      weatherMult *= 0.8;
      reasons.push("降雨 " + weather.precipitation.toFixed(1) + "mm");
    }
  }

  if (marine && marine.wave_height != null) {
    const wh = marine.wave_height;
    if (spot.type === "rock") {
      if (wh < 1.2) { weatherMult *= 1.1; reasons.push("涌浪小 " + wh.toFixed(1) + "m"); }
      else if (wh < 2) { weatherMult *= 0.9; reasons.push("涌浪中 " + wh.toFixed(1) + "m"); }
      else { weatherMult *= 0.45; reasons.push("⚠️ 涌浪大 " + wh.toFixed(1) + "m 岩钓危险"); }
    } else if (spot.type === "beach") {
      if (wh < 1.5) weatherMult *= 1.05;
      else if (wh > 2.5) { weatherMult *= 0.7; reasons.push("海滩浪大"); }
    }
  }

  // ----- Tide factor -----
  const tideInfo = tideFactorFor(spot, tide);
  const tideMult = tideInfo.mult;
  if (tideInfo.reason) reasons.push(tideInfo.reason);

  // ----- Time factor (dawn/dusk bonus) -----
  const now = new Date();
  const hr = now.getHours();
  let timeMult = 1.0;
  if ((hr >= 5 && hr <= 8) || (hr >= 17 && hr <= 20)) {
    timeMult = 1.15;
    reasons.push("晨昏黄金时段 Golden Hour");
  } else if (hr >= 22 || hr <= 4) {
    timeMult = 0.9;
  }

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

  const score = spot.baseScore * weatherMult * tideMult * timeMult * accessMult * distancePenalty;
  return { score, dist, reasons };
}

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
          <span class="access-icon">🚗</span>
          <div><b>自驾</b>${escapeHtml(a.drive)}</div>
        </div>
        <div class="access-row">
          <span class="access-icon">🚌</span>
          <div><b>公共交通</b>${escapeHtml(a.pt)}</div>
        </div>
        ${a.tips && a.tips.length ? `
        <div class="access-tips-header">💬 钓友社区整理 · Community Tips</div>
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
  const radius = parseFloat(document.getElementById("radiusSel").value);
  const speciesFilter = document.getElementById("speciesSel").value;
  const accessFilter = parseInt(document.getElementById("accessSel").value, 10) || 0;
  const listEl = document.getElementById("spotList");
  const refLoc = referencePoint();

  let spots = window.SYDNEY_SPOTS.slice();
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
    const r = scoreSpot(
      s, refLoc,
      currentWeather?.weather, currentWeather?.marine, currentWeather?.tide,
      currentMode
    );
    return { spot: s, ...r };
  });

  // All modes now apply radius filter from the reference point (map center or user loc).
  // Fish mode: larger effective radius (ignore the user-picked radius if it's < 40km) to
  //   give users wide-area best spots; but still keep 999 (ALL) and 50km+ working as-is.
  const effectiveRadius = (currentMode === "fish" && radius < 40) ? 40 : radius;

  scored.sort((a, b) => {
    if (a.dist > effectiveRadius && b.dist > effectiveRadius) return b.score - a.score;
    if (a.dist > effectiveRadius) return 1;
    if (b.dist > effectiveRadius) return -1;
    return b.score - a.score;
  });

  sortedSpots = scored;

  const visible = scored.filter(s => s.dist <= effectiveRadius);
  const toShow = visible.length ? visible : scored.slice(0, 6);

  listEl.innerHTML = "";
  if (!toShow.length) {
    listEl.innerHTML = `<div class="empty-state"><span class="emoji">🎣</span>该条件下暂无匹配的钓点<br><small>试试放大半径或更换鱼种</small></div>`;
    return;
  }
  toShow.slice(0, 20).forEach((entry, i) => {
    const s = entry.spot;
    const a = getAccess(s.id);
    const card = document.createElement("div");
    card.className = "spot-card" + (i === 0 ? " best" : "");
    card.innerHTML = `
      <div class="rank-badge">${i + 1}</div>
      <div class="spot-info">
        <div class="spot-name">${s.nameCn}${i === 0 ? '<span class="best-tag">首选</span>' : ''}</div>
        <div class="spot-name-en">${s.name}</div>
        <div class="spot-meta">
          ${userLatLng ? `<span>📍 ${entry.dist.toFixed(1)} km</span>` : ""}
          <span class="type-badge type-${s.type}">${typeIcon(s.type)} ${typeLabel(s.type)}</span>
          ${a ? `<span class="access-badge" title="交通便利 ${a.score}/5">🚗 ${"★".repeat(a.score)}${"☆".repeat(5-a.score)}</span>` : ""}
        </div>
        <div class="spot-species">${s.species.slice(0, 4).map(sp => `<span class="sp-chip">${sp}</span>`).join("")}</div>
      </div>
      <div class="score-box">
        <b>${Math.round(entry.score)}</b>
        <small>推荐分</small>
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
}

function typeLabel(t) {
  return ({ rock: "岩钓", harbour: "港内", estuary: "河口", beach: "沙滩" })[t] || t;
}
function typeIcon(t) {
  return ({ rock: "🪨", harbour: "⚓", estuary: "🏞️", beach: "🏖️" })[t] || "🌊";
}

function showDetail(id) {
  const entry = sortedSpots.find(e => e.spot.id === id);
  if (!entry) return;
  const s = entry.spot;
  const el = document.getElementById("detailContent");
  el.innerHTML = `
    <div class="detail-hero">
      <button class="close" id="closeDetail">×</button>
      <h2>${s.nameCn}</h2>
      <div class="sub">${s.name} · ${typeIcon(s.type)} ${typeLabel(s.type)}${userLatLng ? " · " + entry.dist.toFixed(1) + " km 外" : ""}</div>
      <div class="detail-chips">${s.species.map(sp => `<span class="chip">${sp}</span>`).join("")}</div>
      <div class="detail-score">
        <div class="detail-score-number">${Math.round(entry.score)}</div>
        <div style="flex:1">
          <div style="font-size:10px;opacity:.75;letter-spacing:.4px;margin-bottom:4px">综合推荐分 · Recommendation Score <a href="#" id="algoLink" style="color:#ffd166;text-decoration:underline">算法说明 ℹ️</a></div>
          <div class="score-bar"><div style="width:${Math.min(100, entry.score)}%"></div></div>
        </div>
      </div>
    </div>

    <div class="detail-body">
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

      ${entry.reasons.length ? `
      <section>
        <h4>当前评分依据 · Why Today</h4>
        <ul class="reason-list">${entry.reasons.map(r => `<li>${r}</li>`).join("")}</ul>
      </section>` : ""}

      ${renderAccessSection(s.id)}

      <section>
        <h4>导航 · Directions</h4>
        <a class="nav-btn" href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}" target="_blank">🧭 在 Google 地图打开路线</a>
      </section>

      <section>
        <h4>钓友评论 · Reviews</h4>
        ${renderReviewsSection(s.id)}
      </section>
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
  // bind review form
  bindReviewForm(s.id);
  // bind rig tabs
  bindRigTabs(s);
  document.getElementById("detail").classList.remove("hidden");
  map.flyTo([s.lat, s.lng], 14, { duration: 0.8 });
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
  if (tide.trend === "rising" && tide.hoursToHigh != null) {
    suffix = ` · ${tide.hoursToHigh.toFixed(1)}h 后高潮`;
  } else if (tide.trend === "falling" && tide.hoursToLow != null) {
    suffix = ` · ${tide.hoursToLow.toFixed(1)}h 后低潮`;
  }
  return `${arrow} ${phaseLabel}${suffix}`;
}

function showWeather() {
  const box = document.getElementById("weatherBox");
  if (!currentWeather || !currentWeather.weather) { box.classList.add("hidden"); return; }
  const w = currentWeather.weather;
  const m = currentWeather.marine;
  const t = currentWeather.tide;
  const content = document.getElementById("weatherContent");
  const tideText = tideDisplay(t);
  content.innerHTML = `
    <div class="row"><span>气温 Temp</span><span>${w.temperature_2m?.toFixed(1) ?? "-"} °C</span></div>
    <div class="row"><span>风 Wind</span><span>${degToCompass(w.wind_direction_10m)} ${w.wind_speed_10m?.toFixed(0) ?? "-"} km/h</span></div>
    <div class="row"><span>降雨 Rain</span><span>${w.precipitation?.toFixed(1) ?? 0} mm</span></div>
    ${m ? `<div class="row"><span>浪高 Wave</span><span>${m.wave_height?.toFixed(1) ?? "-"} m</span></div>` : ""}
    ${m ? `<div class="row"><span>周期 Period</span><span>${m.wave_period?.toFixed(0) ?? "-"} s</span></div>` : ""}
    ${tideText ? `<div class="row tide-row"><span>潮汐 Tide</span><span>${tideText}</span></div>` : ""}
  `;
  box.classList.remove("hidden");
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
  btn.textContent = "定位中…";
  status.classList.remove("error");
  status.textContent = "获取您的位置…";

  navigator.geolocation.getCurrentPosition(async pos => {
    userLatLng = [pos.coords.latitude, pos.coords.longitude];
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.marker(userLatLng, {
      icon: L.divIcon({
        html: '<div style="background:#ffb703;border:3px solid #fff;width:20px;height:20px;border-radius:50%;box-shadow:0 0 0 6px rgba(255,183,3,.25)"></div>',
        iconSize: [20,20], iconAnchor: [10,10], className: ""
      })
    }).addTo(map).bindPopup("您的位置 · You are here");
    map.flyTo(userLatLng, 12, { duration: 0.8 });
    status.textContent = "正在获取实时海况…";
    await loadConditions();
    render();
    const best = sortedSpots[0];
    if (best) {
      status.textContent = `✅ 推荐：${best.spot.nameCn}（${best.dist.toFixed(1)} km）· 评分 ${Math.round(best.score)}`;
    }
    btn.disabled = false;
    btn.textContent = "📍 刷新";
  }, err => {
    status.textContent = "无法获取定位（" + err.message + "），使用悉尼市中心。";
    status.classList.add("error");
    userLatLng = SYDNEY_CENTER;
    loadConditions().then(render);
    btn.disabled = false;
    btn.textContent = "📍 定位我";
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
      ? `📍 基于你的位置 · 推荐：<b>${escapeHtml(best.spot.nameCn)}</b> · 评分 ${Math.round(best.score)}`
      : `📍 基于你的位置`;
  } else {
    statusEl.classList.remove("error");
    const label = regionLabelForLatLng(mapCenterLatLng);
    const backBtn = userLatLng
      ? ` <a href="#" id="backToMe" style="color:#0077b6;text-decoration:underline">返回我的位置</a>`
      : "";
    statusEl.innerHTML = best
      ? `🗺️ 基于地图视野（${label}）· 推荐：<b>${escapeHtml(best.spot.nameCn)}</b>${backBtn}`
      : `🗺️ 基于地图视野（${label}）${backBtn}`;
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
  const sourceLink = r.sourceUrl ? `
    <a class="review-source" href="${escapeAttr(r.sourceUrl)}" target="_blank" rel="noopener noreferrer">
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

function renderReviewsSection(spotId) {
  const refs = getSeedRefs(spotId);
  const globalRefs = getSeedRefs("_global");
  const userReviews = getUserReviews(spotId);
  const allRatings = [...refs, ...userReviews];
  const avg = avgRating(allRatings);

  const summary = allRatings.length
    ? `<div class="reviews-summary">
         <div class="big-star">${avg.toFixed(1)}</div>
         <div>
           <div class="stars-line">${starString(avg)}</div>
           <div class="count">${refs.length} 条社区参考 · ${userReviews.length} 条用户评论</div>
         </div>
       </div>`
    : `<div class="no-reviews">暂无参考资料，成为第一位分享钓友</div>`;

  const refsBlock = refs.length ? `
    <div class="refs-block">
      <div class="refs-header">📚 社区参考资料 · External References</div>
      <div class="refs-list">${refs.map(renderRefItem).join("")}</div>
      <div class="refs-disclaimer">* 链接指向公开论坛搜索/讨论页面，点击可查看社区原始讨论</div>
    </div>
  ` : "";

  const userBlock = userReviews.length ? `
    <div class="user-reviews-block">
      <div class="refs-header">👥 用户评论 · User Reviews</div>
      <div class="review-list">${userReviews.map(renderUserReview).join("")}</div>
    </div>
  ` : "";

  const globalBlock = globalRefs.length ? `
    <div class="refs-block global">
      <div class="refs-header">⚠️ 出钓前必查 · Before You Go</div>
      <div class="refs-list">${globalRefs.map(renderRefItem).join("")}</div>
    </div>
  ` : "";

  return `
    ${summary}
    ${refsBlock}
    ${userBlock}
    ${globalBlock}
    <div class="review-form">
      <h5>分享你的钓获 · Leave a Review</h5>
      <input type="text" id="rv-user" maxlength="20" placeholder="昵称 Nickname" />
      <div class="star-picker" id="rv-stars" data-value="5">
        <span data-v="1">★</span><span data-v="2">★</span><span data-v="3">★</span>
        <span data-v="4">★</span><span data-v="5">★</span>
      </div>
      <textarea id="rv-text" maxlength="400" placeholder="分享一下你的鱼获、饵料或当天的海况… Share your catch, bait, or conditions..."></textarea>
      <div class="source-fields">
        <input type="text" id="rv-source-name" maxlength="40" placeholder="来源名称（可选）例：YouTube 某频道" />
        <input type="url" id="rv-source-url" maxlength="300" placeholder="来源链接（可选）https://..." />
      </div>
      <button class="review-submit" id="rv-submit" data-spot="${spotId}">发布评论</button>
    </div>
  `;
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
function bindReviewForm(spotId) {
  const picker = document.getElementById("rv-stars");
  if (!picker) return;
  const spans = picker.querySelectorAll("span");
  const paint = v => spans.forEach(s => s.classList.toggle("active", +s.dataset.v <= v));
  paint(5);
  spans.forEach(s => {
    s.addEventListener("click", () => {
      picker.dataset.value = s.dataset.v;
      paint(+s.dataset.v);
    });
  });
  document.getElementById("rv-submit").addEventListener("click", () => {
    const user = document.getElementById("rv-user").value.trim() || "匿名钓友";
    const text = document.getElementById("rv-text").value.trim();
    const rating = parseInt(picker.dataset.value, 10) || 5;
    const sourceName = document.getElementById("rv-source-name")?.value.trim() || "";
    let sourceUrl = document.getElementById("rv-source-url")?.value.trim() || "";
    // Basic URL validation
    if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) {
      sourceUrl = "https://" + sourceUrl;
    }
    if (sourceUrl) {
      try { new URL(sourceUrl); } catch (e) {
        alert("请检查来源链接格式，需要以 http:// 或 https:// 开头");
        return;
      }
    }
    if (!text) { alert("请输入评论内容"); return; }
    const all = loadUserReviews();
    const list = all[spotId] || [];
    list.unshift({
      user, rating, text,
      sourceName: sourceName || undefined,
      sourceUrl: sourceUrl || undefined,
      date: new Date().toISOString().slice(0, 10)
    });
    all[spotId] = list;
    saveUserReviews(all);
    // re-open detail to refresh
    showDetail(spotId);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  render();
  document.getElementById("locateBtn").addEventListener("click", locateUser);
  document.getElementById("radiusSel").addEventListener("change", render);
  document.getElementById("speciesSel").addEventListener("change", render);
  document.getElementById("accessSel").addEventListener("change", render);
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
});
