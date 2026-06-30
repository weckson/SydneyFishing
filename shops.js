// shops.js — 本地渔具店 (Sydney tackle shops). Data module, load before app.js.
// Toggleable map layer + shown as "nearest shop" in spot detail. Coords are APPROXIMATE
// (suburb-level); `url` is a Google Maps name search so it always resolves to the live business.
// `hours` is a TYPICAL guide only — Google Maps shows authoritative live hours. region ↔ spotRegionId.
(function () {
  "use strict";
  const maps = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

  window.SF_SHOPS = [
    { name: "Otto's Tackle World", nameCn: "Otto's 渔具世界", suburb: "Drummoyne", region: "harbour",
      lat: -33.8506, lng: 151.1543, hours: "周一–六 8:30–17:30 · 周日 9:00–16:00", url: maps("Otto's Tackle World Drummoyne") },
    { name: "Fergo's Tackle World", nameCn: "Fergo's 渔具", suburb: "Taren Point", region: "south",
      lat: -34.0175, lng: 151.1185, hours: "周一–六 7:00–17:00 · 周日 7:00–14:00", url: maps("Fergo's Tackle World Taren Point") },
    { name: "Hunts Marine", nameCn: "Hunts 船钓渔具", suburb: "Sylvania", region: "south",
      lat: -33.9985, lng: 151.0975, hours: "周一–五 8:30–17:00 · 周六 8:30–15:00", url: maps("Hunts Marine Sylvania") },
    { name: "Amazon Tackle", nameCn: "Amazon 渔具", suburb: "Wetherill Park", region: "hawkesbury",
      lat: -33.8505, lng: 150.9045, hours: "周一–六 8:00–17:30 · 周日 9:00–16:00", url: maps("Amazon Tackle Wetherill Park") },
    { name: "Compleat Angler", nameCn: "Compleat Angler 渔具", suburb: "Villawood", region: "hawkesbury",
      lat: -33.8762, lng: 150.9748, hours: "周一–六 9:00–17:30 · 周日 9:00–15:00", url: maps("Compleat Angler Villawood Sydney") },
    { name: "Narrabeen Bait & Tackle", nameCn: "Narrabeen 鱼饵渔具", suburb: "Narrabeen", region: "northern-beaches",
      lat: -33.7130, lng: 151.2975, hours: "每日 约 6:00–18:00", url: maps("Narrabeen Bait and Tackle") },
    { name: "BCF Belrose", nameCn: "BCF 户外渔具 (连锁)", suburb: "Belrose", region: "northern-beaches",
      lat: -33.7370, lng: 151.2090, hours: "周一–六 8:00–18:00 · 周日 8:30–17:00", url: maps("BCF Belrose") },
    { name: "Anaconda Auburn", nameCn: "Anaconda 户外渔具 (连锁)", suburb: "Auburn", region: "hawkesbury",
      lat: -33.8490, lng: 151.0330, hours: "每日 9:00–18:00", url: maps("Anaconda Auburn") }
  ];

  // Nearest N shops to a point (great-circle distance via the app's haversineKm helper).
  window.nearestShops = function (lat, lng, n = 2) {
    if (typeof window.haversineKm !== "function") return [];
    return (window.SF_SHOPS || [])
      .map(s => ({ ...s, distKm: window.haversineKm([lat, lng], [s.lat, s.lng]) }))
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, n);
  };
})();
