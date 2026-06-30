// cams.js — 实时浪况/海况监控链接 (live wave & surf monitoring). Data module, load before app.js.
// CSP forbids cross-origin iframes, so these are LINKS (open in a new tab), not embeds.
// region ids align with regions.js (spotRegionId); region "all" shows on every spot.
//   kind: 'data' (official wave buoy) | 'index' (cam directory) | 'cam' (single beach cam)
(function () {
  "use strict";

  window.SF_CAMS = [
    // Official real-time wave data (authoritative significant wave height — ties into the
    // rock-safety verdict's swell logic). Shown on every spot.
    { region: "all", kind: "data", source: "MHL NSW",
      nameCn: "悉尼外海实时浪高（MHL 浮标）", name: "Sydney offshore wave buoy — live Hs",
      url: "https://mhl.nsw.gov.au/Station-SYDDOW" },
    { region: "all", kind: "index", source: "MHL NSW",
      nameCn: "NSW 全部浪测浮标实时数据", name: "All NSW wave buoys (real-time)",
      url: "https://mhl.nsw.gov.au/Data" },
    { region: "all", kind: "index", source: "Swellnet",
      nameCn: "悉尼冲浪摄像头总览", name: "Sydney surf cams (browse all)",
      url: "https://www.swellnet.com/surfcams" },
    { region: "all", kind: "index", source: "Coastalwatch",
      nameCn: "Coastalwatch 悉尼海况", name: "Coastalwatch Sydney",
      url: "https://www.coastalwatch.com/surf-forecasts/nsw/sydney" },

    // Per-beach live surf cams (Swellnet). region tags match spotRegionId() buckets.
    { region: "northern-beaches", kind: "cam", source: "Swellnet", nameCn: "Manly 曼利", name: "Manly", url: "https://www.swellnet.com/surfcams/manly" },
    { region: "northern-beaches", kind: "cam", source: "Swellnet", nameCn: "Narrabeen 纳拉滨", name: "Narrabeen", url: "https://www.swellnet.com/surfcams/narrabeen" },
    { region: "harbour", kind: "cam", source: "Swellnet", nameCn: "Bondi 邦迪", name: "Bondi", url: "https://www.swellnet.com/surfcams/bondi" },
    { region: "south", kind: "cam", source: "Swellnet", nameCn: "Maroubra 马鲁布拉", name: "Maroubra", url: "https://www.swellnet.com/surfcams/maroubra" },
    { region: "south", kind: "cam", source: "Swellnet", nameCn: "Cronulla 克罗努拉", name: "Cronulla", url: "https://www.swellnet.com/surfcams/cronulla" },
    // Wollongong region gets its own official buoy (Port Kembla).
    { region: "wollongong", kind: "data", source: "MHL NSW", nameCn: "Port Kembla 实时浪高", name: "Port Kembla wave buoy — live Hs", url: "https://mhl.nsw.gov.au/Station-PORKEM" }
  ];

  // Cams relevant to a region: the always-on official/index links + any beach cams in that region.
  window.camsForRegion = function (regionId) {
    return (window.SF_CAMS || []).filter(c => c.region === "all" || c.region === regionId);
  };
})();
