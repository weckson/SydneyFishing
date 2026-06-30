// cams.js — 实时浪况 / 直播摄像头 (live wave & surf monitoring). Data module, load before app.js.
// region ids align with regions.js (spotRegionId); region "all" shows on every spot.
//   kind: 'data' (official wave buoy) | 'index' (cam directory) | 'cam' (a specific live cam)
//   embed: an iframe-embeddable live URL (YouTube) when available; else null → launch the page link.
// NOTE: surf-cam providers (Swellnet/Surfline/Coastalwatch) block iframe embedding, so most beach
// cams open in a popup/new-tab; the Sydney Harbour cam (WebcamSydney) is a 24/7 YouTube live we embed.
(function () {
  "use strict";

  window.SF_CAMS = [
    // Official real-time wave data (authoritative significant wave height). Shown on every spot.
    { region: "all", kind: "data", source: "MHL NSW", nameCn: "悉尼外海实时浪高（MHL 浮标）", name: "Sydney offshore wave buoy — live Hs", url: "https://mhl.nsw.gov.au/Station-SYDDOW" },
    { region: "all", kind: "index", source: "MHL NSW", nameCn: "NSW 全部浪测浮标实时数据", name: "All NSW wave buoys (real-time)", url: "https://mhl.nsw.gov.au/Data" },
    { region: "all", kind: "index", source: "Swellnet", nameCn: "悉尼冲浪摄像头总览", name: "Sydney surf cams (browse all)", url: "https://www.swellnet.com/surfcams" },

    // Live cams (kind:'cam'). embed=YouTube → plays in-app; embed=null → opens the cam page.
    { region: "harbour", kind: "cam", source: "WebcamSydney", nameCn: "悉尼港 实时直播", name: "Sydney Harbour live", lat: -33.8450, lng: 151.2100,
      url: "https://webcamsydney.com/", embed: null },
    // Windy cams are embeddable INLINE (Windy provides the public embed player). Others link out.
    { region: "harbour", kind: "cam", source: "Windy", nameCn: "Bondi 邦迪", name: "Bondi (North Bondi)", lat: -33.8915, lng: 151.2767, url: "https://www.windy.com/webcams/1721795690", embed: "https://webcams.windy.com/webcams/public/embed/player/1721795690/live" },
    { region: "northern-beaches", kind: "cam", source: "Windy", nameCn: "Manly 曼利", name: "Manly", lat: -33.7969, lng: 151.2876, url: "https://www.windy.com/webcams/1234365712", embed: "https://webcams.windy.com/webcams/public/embed/player/1234365712/live" },
    { region: "northern-beaches", kind: "cam", source: "Swellnet", nameCn: "Narrabeen 纳拉滨", name: "Narrabeen", lat: -33.7126, lng: 151.2986, url: "https://www.swellnet.com/surfcams/narrabeen", embed: null },
    { region: "south", kind: "cam", source: "Windy", nameCn: "Maroubra 马鲁布拉", name: "Maroubra", lat: -33.9497, lng: 151.2575, url: "https://www.windy.com/webcams/1580184425", embed: "https://webcams.windy.com/webcams/public/embed/player/1580184425/live" },
    { region: "south", kind: "cam", source: "Swellnet", nameCn: "Cronulla 克罗努拉", name: "Cronulla", lat: -34.0577, lng: 151.1518, url: "https://www.swellnet.com/surfcams/cronulla", embed: null },
    // Wollongong region gets its own official buoy (Port Kembla).
    { region: "wollongong", kind: "data", source: "MHL NSW", nameCn: "Port Kembla 实时浪高", name: "Port Kembla wave buoy — live Hs", url: "https://mhl.nsw.gov.au/Station-PORKEM" }
  ];

  // Cams relevant to a region: the always-on official/index links + any cams in that region.
  window.camsForRegion = function (regionId) {
    return (window.SF_CAMS || []).filter(c => c.region === "all" || c.region === regionId);
  };

  // Nearest live cam (kind:'cam') to a spot within maxKm — or null. Powers the live-cam button + filter.
  window.liveCamForSpot = function (spot, maxKm) {
    maxKm = maxKm || 2;
    if (!spot || typeof window.haversineKm !== "function") return null;
    let best = null, bestD = Infinity;
    (window.SF_CAMS || []).forEach(c => {
      if (c.kind !== "cam" || c.lat == null) return;
      const d = window.haversineKm([spot.lat, spot.lng], [c.lat, c.lng]);
      if (d <= maxKm && d < bestD) { bestD = d; best = c; }
    });
    return best;
  };

  // Does this spot have a live cam nearby? (powers the "有摄像头" filter)
  window.spotHasCam = function (spot, maxKm) {
    return !!window.liveCamForSpot(spot, maxKm);
  };
})();
