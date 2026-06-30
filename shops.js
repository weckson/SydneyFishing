// shops.js — 本地渔具店 (Sydney tackle shops). Data module, load before app.js.
// Shown as a toggleable layer on the map. Coords are APPROXIMATE (suburb-level); each `url` is a
// Google Maps name search so it always resolves to the current business. region matches spotRegionId.
(function () {
  "use strict";
  const maps = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

  window.SF_SHOPS = [
    { name: "Otto's Tackle World", nameCn: "Otto's 渔具世界", suburb: "Drummoyne", region: "harbour",
      lat: -33.8506, lng: 151.1543, url: maps("Otto's Tackle World Drummoyne") },
    { name: "Fergo's Tackle World", nameCn: "Fergo's 渔具", suburb: "Taren Point", region: "south",
      lat: -34.0175, lng: 151.1185, url: maps("Fergo's Tackle World Taren Point") },
    { name: "Hunts Marine", nameCn: "Hunts 船钓渔具", suburb: "Sylvania", region: "south",
      lat: -33.9985, lng: 151.0975, url: maps("Hunts Marine Sylvania") },
    { name: "Amazon Tackle", nameCn: "Amazon 渔具", suburb: "Wetherill Park", region: "hawkesbury",
      lat: -33.8505, lng: 150.9045, url: maps("Amazon Tackle Wetherill Park") },
    { name: "Compleat Angler", nameCn: "Compleat Angler 渔具", suburb: "Villawood", region: "hawkesbury",
      lat: -33.8762, lng: 150.9748, url: maps("Compleat Angler Villawood Sydney") },
    { name: "Narrabeen Bait & Tackle", nameCn: "Narrabeen 鱼饵渔具", suburb: "Narrabeen", region: "northern-beaches",
      lat: -33.7130, lng: 151.2975, url: maps("Narrabeen Bait and Tackle") },
    { name: "BCF Belrose", nameCn: "BCF 户外渔具 (连锁)", suburb: "Belrose", region: "northern-beaches",
      lat: -33.7370, lng: 151.2090, url: maps("BCF Belrose") },
    { name: "Anaconda Auburn", nameCn: "Anaconda 户外渔具 (连锁)", suburb: "Auburn", region: "hawkesbury",
      lat: -33.8490, lng: 151.0330, url: maps("Anaconda Auburn") }
  ];
})();
