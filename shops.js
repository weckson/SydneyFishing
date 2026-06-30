// shops.js — 本地渔具店 (Sydney & NSW tackle shops). Data module, load before app.js.
// Toggleable map layer + "nearest shop" in spot detail. Coords are APPROXIMATE (suburb-level);
// `url` is a Google Maps name search so it always resolves to the live business + authoritative
// hours. `hours` is a TYPICAL guide only. region ↔ spotRegionId (informational).
(function () {
  "use strict";
  const maps = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  const CHAIN = "每日 约 8:00–18:00";

  window.SF_SHOPS = [
    // ---- Harbour / inner ----
    { name: "Otto's Tackle World", nameCn: "Otto's 渔具世界", suburb: "Drummoyne", region: "harbour",
      lat: -33.8506, lng: 151.1543, hours: "周一–六 8:30–17:30 · 周日 9:00–16:00", url: maps("Otto's Tackle World Drummoyne") },

    // ---- East / South (Sutherland) ----
    { name: "Fergo's Tackle World", nameCn: "Fergo's 渔具", suburb: "Taren Point", region: "south",
      lat: -34.0175, lng: 151.1185, hours: "周一–六 7:00–17:00 · 周日 7:00–14:00", url: maps("Fergo's Tackle World Taren Point") },
    { name: "Hunts Marine", nameCn: "Hunts 船钓渔具", suburb: "Sylvania", region: "south",
      lat: -33.9985, lng: 151.0975, hours: "周一–五 8:30–17:00 · 周六 8:30–15:00", url: maps("Hunts Marine Sylvania") },
    { name: "Cronulla Bait & Tackle", nameCn: "克罗努拉 鱼饵渔具", suburb: "Cronulla", region: "south",
      lat: -34.0565, lng: 151.1520, hours: "每日 约 6:00–18:00", url: maps("Cronulla Bait and Tackle") },
    { name: "Anglerpower Fishing Tackle", nameCn: "Anglerpower 渔具", suburb: "Caringbah", region: "south",
      lat: -34.0440, lng: 151.1230, hours: "周一–六 8:30–17:30 · 周日 8:00–14:00", url: maps("Anglerpower Fishing Tackle Caringbah") },

    // ---- Northern Beaches ----
    { name: "Narrabeen Bait & Tackle", nameCn: "Narrabeen 鱼饵渔具", suburb: "North Narrabeen", region: "northern-beaches",
      lat: -33.7100, lng: 151.2990, hours: "每日 约 6:00–18:00", url: maps("Narrabeen Bait and Tackle") },
    { name: "Fishing Station", nameCn: "Fishing Station 渔具", suburb: "Mona Vale", region: "northern-beaches",
      lat: -33.6790, lng: 151.3060, hours: "周一–六 8:00–17:30 · 周日 8:00–15:00", url: maps("Fishing Station Mona Vale") },
    { name: "Sneakyfisho Fishing Tackle", nameCn: "Sneakyfisho 渔具", suburb: "Brookvale", region: "northern-beaches",
      lat: -33.7650, lng: 151.2720, hours: "周一–六 9:00–17:30", url: maps("Sneakyfisho Fishing Tackle Brookvale") },
    { name: "BCF Belrose", nameCn: "BCF 户外渔具 (连锁)", suburb: "Belrose", region: "northern-beaches",
      lat: -33.7370, lng: 151.2090, hours: CHAIN, url: maps("BCF Belrose") },

    // ---- West / Hawkesbury ----
    { name: "Amazon Tackle", nameCn: "Amazon 渔具", suburb: "Wetherill Park", region: "hawkesbury",
      lat: -33.8505, lng: 150.9045, hours: "周一–六 8:00–17:30 · 周日 9:00–16:00", url: maps("Amazon Tackle Wetherill Park") },
    { name: "Compleat Angler", nameCn: "Compleat Angler 渔具", suburb: "Villawood", region: "hawkesbury",
      lat: -33.8762, lng: 150.9748, hours: "周一–六 9:00–17:30 · 周日 9:00–15:00", url: maps("Compleat Angler Villawood Sydney") },
    { name: "Anaconda Auburn", nameCn: "Anaconda 户外渔具 (连锁)", suburb: "Auburn", region: "hawkesbury",
      lat: -33.8490, lng: 151.0330, hours: "每日 9:00–18:00", url: maps("Anaconda Auburn") },
    { name: "Penrith Fishing Tackle", nameCn: "Penrith 渔具", suburb: "Penrith", region: "hawkesbury",
      lat: -33.7510, lng: 150.6940, hours: "周一–六 8:30–17:00 · 周日 8:00–13:00", url: maps("Penrith Fishing Tackle") },
    { name: "The Bass Angler", nameCn: "The Bass Angler 渔具", suburb: "Penrith", region: "hawkesbury",
      lat: -33.7600, lng: 150.6900, hours: "周一–六 9:00–17:00", url: maps("The Bass Angler Penrith") },
    { name: "Windsor Bait & Tackle", nameCn: "Windsor 鱼饵渔具", suburb: "Windsor", region: "hawkesbury",
      lat: -33.6120, lng: 150.8230, hours: "每日 约 6:00–18:00", url: maps("Windsor Bait and Tackle NSW") },
    { name: "Gordon's Bait & Tackle (OZTackle)", nameCn: "Gordon's / OZTackle 渔具", suburb: "Narellan", region: "hawkesbury",
      lat: -34.0430, lng: 150.7380, hours: "周一–六 8:00–17:30", url: maps("Gordons Bait Tackle OZTackle Narellan") },
    { name: "Mid West Bait & Tackle", nameCn: "Mid West 鱼饵渔具", suburb: "Campbelltown", region: "hawkesbury",
      lat: -34.0710, lng: 150.8130, hours: "每日 约 7:00–18:00", url: maps("Mid West Bait and Tackle Campbelltown") },

    // ---- Central Coast ----
    { name: "BCF Tuggerah", nameCn: "BCF 户外渔具 (连锁)", suburb: "Tuggerah", region: "central-coast",
      lat: -33.3040, lng: 151.4280, hours: CHAIN, url: maps("BCF Tuggerah") },
    { name: "BCF West Gosford", nameCn: "BCF 户外渔具 (连锁)", suburb: "West Gosford", region: "central-coast",
      lat: -33.4200, lng: 151.3200, hours: CHAIN, url: maps("BCF West Gosford") },
    { name: "Empire Fishing Shop", nameCn: "Empire 渔具", suburb: "Woy Woy", region: "central-coast",
      lat: -33.4870, lng: 151.3250, hours: "周一–六 7:00–17:00 · 周日 7:00–13:00", url: maps("Empire Fishing Shop Woy Woy") },

    // ---- Wollongong / Illawarra ----
    { name: "Fergo's Tackle World Wollongong", nameCn: "Fergo's 渔具 (卧龙岗)", suburb: "Warrawong", region: "wollongong",
      lat: -34.4840, lng: 150.8900, hours: "周一–六 8:30–17:30 · 周日 9:00–15:00", url: maps("Fergo's Tackle World Warrawong Wollongong") },
    { name: "Anaconda Wollongong", nameCn: "Anaconda 户外渔具 (连锁)", suburb: "Wollongong", region: "wollongong",
      lat: -34.4250, lng: 150.8930, hours: "每日 9:00–18:00", url: maps("Anaconda Wollongong") }
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
