// regions.js — 客户端钓点分区 (shared helper). 后端不持有 spots 数据，分区在浏览器侧完成。
// window.SF_REGIONS + window.spotRegionId(spotOrId). Used by insights.js (weekly report)
// and competitions.js. Depends on window.SYDNEY_SPOTS.
//
// 注意 / NOTE: 经纬度阈值是合理默认值、可调（属内容/配置，不是精确边界）。多数钓点能正确归区，
// 个别边缘点可能偏差；后续可改为给 spots.js 每个点加显式 region 字段。
(function () {
  "use strict";

  window.SF_REGIONS = [
    { id: "central-coast",    nameCn: "中央海岸",   name: "Central Coast" },
    { id: "northern-beaches", nameCn: "北部海滩",   name: "Northern Beaches" },
    { id: "harbour",          nameCn: "悉尼港",     name: "Sydney Harbour" },
    { id: "south",            nameCn: "南区",       name: "South (Botany–Cronulla)" },
    { id: "wollongong",       nameCn: "卧龙岗",     name: "Wollongong / Illawarra" },
    { id: "hawkesbury",       nameCn: "霍克斯伯里", name: "Hawkesbury / West" },
    { id: "other",            nameCn: "其他",       name: "Other" }
  ];

  function spotById(id) { return (window.SYDNEY_SPOTS || []).find(s => s.id === id) || null; }

  // Resolve a spot (object or id string) to a region id from its lat/lng.
  window.spotRegionId = function (spotOrId) {
    const s = (typeof spotOrId === "string") ? spotById(spotOrId) : spotOrId;
    if (!s || typeof s.lat !== "number") return "other";
    const lat = s.lat, lng = s.lng;
    if (lng != null && lng < 151.10 && lat > -33.95) return "hawkesbury"; // inland western rivers
    if (lat < -34.10) return "wollongong";
    if (lat > -33.55) return "central-coast";
    if (lat > -33.83) return "northern-beaches";
    if (lat > -33.92) return "harbour";
    return "south";
  };

  window.regionName = function (id, lang) {
    const r = window.SF_REGIONS.find(x => x.id === id);
    if (!r) return id;
    return lang === "en" ? r.name : r.nameCn;
  };
})();
