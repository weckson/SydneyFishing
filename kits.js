// kits.js — 场景化装备套装 (data + view). Hash routes #/kits and #/kits/:id.
// "我这周末去这个地方钓，应该带什么？" — 按场景给一份双语清单，而不是单卖一根竿。
// 非商业：links 仅信息参考，无购物车/无联盟返利。Depends on globals: escapeHtml, levelLabel.
(function () {
  "use strict";

  // 装备类别 → 双语标签（与 app.js renderRigCard 的标签一致）。
  const CAT_LABELS = {
    rod: "钓竿 Rod", reel: "渔轮 Reel", line: "主线 Line", leader: "前导 Leader",
    hook: "钓钩 Hook", bait: "饵料 Bait", lure: "拟饵 Lure", float: "浮漂 Float",
    sinker: "铅坠 Sinker", other: "其他 Other"
  };

  window.SF_KITS = [
    {
      id: "sydney-beginner-shore",
      name: "Sydney Beginner Shore Kit", nameCn: "悉尼岸钓新手套装",
      scenarioCn: "海港/河口岸钓入门 · 黑鲷/沙鳕/沙梭", scenarioEn: "Harbour & estuary shore — bream, flathead, whiting",
      level: "beginner", species: ["Bream", "Flathead", "Whiting"], relatedRigSpecies: "Bream",
      items: [
        { cat: "rod", cn: "软调路亚竿 2.1m (2-4kg)", en: "Light spin rod 2.1m (2-4kg)" },
        { cat: "reel", cn: "纺车轮 2500 型", en: "Spin reel size 2500" },
        { cat: "line", cn: "尼龙 6lb 或 PE 0.6", en: "Mono 6lb or braid PE 0.6" },
        { cat: "leader", cn: "碳前导 8lb", en: "Fluoro leader 8lb" },
        { cat: "hook", cn: "宽门钩 #4-6", en: "Baitholder hook #4-6" },
        { cat: "sinker", cn: "小号活动铅 (ball/bean)", en: "Small running sinker (ball/bean)" },
        { cat: "bait", cn: "去壳虾 / 青虫 / 鸡肉", en: "Peeled prawn / beachworm / chicken" }
      ],
      safety: [
        { cn: "帽子 + 防晒霜", en: "Hat + sunscreen" },
        { cn: "偏光镜（看水看脚下）", en: "Polarised sunnies" },
        { cn: "防波堤/礁石请穿救生衣", en: "Lifejacket on breakwalls/rocks" }
      ]
    },
    {
      id: "rock-safety",
      name: "Rock Fishing Safety Kit", nameCn: "岩钓安全套装",
      scenarioCn: "岩石平台必备安全装备（先保命，再钓鱼）", scenarioEn: "Rock platform safety essentials — survival first",
      level: "beginner", species: [], relatedRigSpecies: null,
      items: [
        { cat: "other", cn: "防水手机袋 + 哨子", en: "Waterproof phone pouch + whistle" },
        { cat: "other", cn: "头灯 + 备用电池", en: "Headlamp + spare batteries" }
      ],
      safety: [
        { cn: "救生衣 (PFD) — 部分地区强制", en: "Lifejacket (PFD) — mandatory in some areas" },
        { cn: "防滑钉鞋 / 毡底鞋", en: "Cleated / felt-sole rock boots" },
        { cn: "长裤防割伤 + 防滑手套", en: "Long pants + grippy gloves" },
        { cn: "结伴同行，告知家人行程", en: "Fish with a buddy; share your plan" },
        { cn: "记下最近的天使环 (Angel Ring) 位置", en: "Note the nearest Angel Ring" }
      ]
    },
    {
      id: "luderick-float",
      name: "Blackfish Float (Awa) Kit", nameCn: "黑鱼阿波矶钓套装",
      scenarioCn: "黑鱼 (Luderick) 绿苔浮钓 · 矶钓/河口", scenarioEn: "Luderick on green weed under a float — rock & estuary",
      level: "intermediate", species: ["Luderick"], relatedRigSpecies: "Luderick",
      items: [
        { cat: "rod", cn: "矶钓竿 3.6-4.5m", en: "Float/luderick rod 12-15ft" },
        { cat: "reel", cn: "矶钓轮或纺车 2500", en: "Alvey or spin reel 2500" },
        { cat: "line", cn: "尼龙主线 6-8lb", en: "Mono main line 6-8lb" },
        { cat: "float", cn: "阿波 / 筷子漂（半游动）", en: "Awa / stick float (sliding)" },
        { cat: "leader", cn: "子线 4-6lb", en: "Tippet 4-6lb" },
        { cat: "hook", cn: "黑鱼钩 #8-10", en: "Luderick hook #8-10" },
        { cat: "bait", cn: "绿苔（现场或前一天采）", en: "Green weed" }
      ],
      safety: [
        { cn: "钉鞋 + 救生衣", en: "Cleated boots + lifejacket" },
        { cn: "打窝勺（面包+沙诱鱼）", en: "Berley spoon (bread + sand)" }
      ]
    },
    {
      id: "tailor-night",
      name: "Tailor Night Kit", nameCn: "Tailor 夜钓套装",
      scenarioCn: "黄昏/夜间 海滩或岩石钓 Tailor", scenarioEn: "Dusk & night tailor — beach or rock",
      level: "intermediate", species: ["Tailor"], relatedRigSpecies: "Tailor",
      items: [
        { cat: "rod", cn: "沙滩竿 3.6-4.2m", en: "Surf rod 12-14ft" },
        { cat: "reel", cn: "纺车轮 5000-6000", en: "Spin reel 5000-6000" },
        { cat: "line", cn: "尼龙 15lb 或 PE 1.5", en: "Mono 15lb or braid PE 1.5" },
        { cat: "leader", cn: "重碳或钢丝前导（防咬断）", en: "Heavy fluoro or wire leader (bite-off)" },
        { cat: "hook", cn: "串钩 gang hooks 4/0", en: "Gang hooks 4/0" },
        { cat: "bait", cn: "整条 pilchard", en: "Whole pilchard" },
        { cat: "lure", cn: "金属亮片 (slug) 30-50g", en: "Metal slug 30-50g" }
      ],
      safety: [
        { cn: "头灯（红光护夜视）", en: "Headlamp (red mode)" },
        { cn: "救生衣 + 防滑鞋", en: "Lifejacket + grippy footwear" },
        { cn: "夜钓务必结伴", en: "Never night-fish alone" }
      ]
    }
  ];

  // ---------- view ----------
  const esc = (s) => (window.escapeHtml ? window.escapeHtml(s) : String(s || ""));
  const lvl = (l) => (window.levelLabel ? window.levelLabel(l) : l);
  const ic = (n) => `<svg class="ic" aria-hidden="true"><use href="#ic-${n}"></use></svg>`;
  const view = () => document.getElementById("kitsView");
  const inner = () => document.getElementById("kitsInner");

  function kitById(id) { return (window.SF_KITS || []).find(k => k.id === id) || null; }

  function kitCard(k) {
    return `
      <button type="button" class="kit-card" data-kit="${esc(k.id)}">
        <div class="kit-card-name">${esc(k.nameCn)}</div>
        <div class="kit-card-en">${esc(k.name)}</div>
        <div class="kit-card-sc">${esc(k.scenarioCn)}</div>
        <div class="kit-card-meta">${lvl(k.level)} · ${k.items.length + k.safety.length} 件 items</div>
      </button>`;
  }

  function itemRow(it) {
    return `<div class="kit-item"><b>${esc(CAT_LABELS[it.cat] || CAT_LABELS.other)}</b><span>${esc(it.cn)} · <span class="en">${esc(it.en)}</span></span></div>`;
  }
  function safetyRow(s) {
    return `<li>${esc(s.cn)} · <span class="en">${esc(s.en)}</span></li>`;
  }

  function renderList() {
    view().classList.remove("hidden");
    const cards = (window.SF_KITS || []).map(kitCard).join("");
    inner().innerHTML = `
      <div class="forum-bar"><span class="forum-logo">${ic("anchor")}</span><div class="forum-title">装备套装 · Gear Kits</div><button class="forum-close" id="kitClose">×</button></div>
      <div class="kit-body">
        <div class="kit-intro">按场景准备装备，不只是买一根竿 · Pack by scenario, not by single rod.</div>
        <div class="kit-grid">${cards}</div>
      </div>`;
    inner().querySelector("#kitClose").onclick = close;
    inner().querySelector(".kit-grid").addEventListener("click", (e) => {
      const b = e.target.closest("[data-kit]"); if (!b) return;
      location.hash = "#/kits/" + encodeURIComponent(b.dataset.kit);
    });
  }

  function renderDetail(id) {
    const k = kitById(id);
    view().classList.remove("hidden");
    if (!k) {
      inner().innerHTML = `<div class="forum-bar"><span class="forum-logo">${ic("anchor")}</span><div class="forum-title">装备套装 · Gear Kits</div><button class="forum-close" id="kitClose">×</button></div><div class="ins-empty">套装整理中 · Not available <button type="button" class="gl-chip" id="kitBack">← 返回</button></div>`;
      inner().querySelector("#kitClose").onclick = close;
      inner().querySelector("#kitBack")?.addEventListener("click", () => { location.hash = "#/kits"; });
      return;
    }
    const items = k.items.map(itemRow).join("");
    const safety = k.safety.length ? `<ul class="kit-safety">${k.safety.map(safetyRow).join("")}</ul>` : "";
    // Cross-link: jump to a representative scene page for this kit's species.
    let sceneLink = "";
    if (k.relatedRigSpecies && window.SYDNEY_SPOTS) {
      const spot = window.SYDNEY_SPOTS.find(s => (s.species || []).includes(k.relatedRigSpecies));
      if (spot) sceneLink = `<a class="kit-scene-link" href="#/scene/${esc(spot.id)}/${esc(k.relatedRigSpecies)}">看此鱼种场景页 · ${esc(k.relatedRigSpecies)} @ ${esc(spot.nameCn)} →</a>`;
    }
    inner().innerHTML = `
      <div class="forum-bar"><span class="forum-logo">${ic("anchor")}</span><div class="forum-title">${esc(k.nameCn)}</div><button class="forum-close" id="kitClose">×</button></div>
      <div class="kit-body">
        <button type="button" class="kit-back" id="kitBack">← 全部套装 All kits</button>
        <div class="kit-detail-head">
          <div class="kit-card-en">${esc(k.name)}</div>
          <div class="kit-card-sc">${esc(k.scenarioCn)} · <span class="en">${esc(k.scenarioEn)}</span></div>
          <div class="kit-card-meta">${lvl(k.level)}</div>
        </div>
        <h4 class="kit-h">🎒 装备清单 · Gear</h4>
        <div class="kit-items">${items}</div>
        ${safety ? `<h4 class="kit-h">🦺 安全 · Safety</h4>${safety}` : ""}
        ${sceneLink}
        <div class="reg-disclaimer">清单为通用建议，按目标鱼与钓点调整 · General guide; adjust to target &amp; spot.</div>
      </div>`;
    inner().querySelector("#kitClose").onclick = close;
    inner().querySelector("#kitBack").addEventListener("click", () => { location.hash = "#/kits"; });
  }

  function close() { if ((location.hash || "").startsWith("#/kits")) location.hash = ""; view().classList.add("hidden"); }

  function route() {
    const h = location.hash || "";
    if (!h.startsWith("#/kits")) { view().classList.add("hidden"); return; }
    const m = h.match(/^#\/kits\/([^/?]+)/);
    if (m) renderDetail(decodeURIComponent(m[1]));
    else renderList();
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("kitsBtn")?.addEventListener("click", () => { location.hash = "#/kits"; });
    if ((location.hash || "").startsWith("#/kits")) route();
  });
})();
