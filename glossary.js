// glossary.js — 中英钓鱼术语对照表 (data + view). Hash route #/glossary.
// 给在澳洲钓鱼的华人新手：钉鞋/子线/前导线/阿波/矶钓/沉底/打窝… 中英对照 + 解释。
// Depends on globals: escapeHtml (from app.js, available by the time the view renders).
(function () {
  "use strict";

  window.SF_GLOSSARY_CATEGORIES = {
    tackle:    { cn: "线组装备", en: "Tackle" },
    technique: { cn: "钓法",     en: "Technique" },
    rig:       { cn: "钓组",     en: "Rig" },
    safety:    { cn: "安全",     en: "Safety" },
    species:   { cn: "鱼种俗名", en: "Species slang" }
  };

  // term=中文术语, termEn=英文/通用叫法, explanation/explanationEn=双语解释, aka=别名(助搜索)
  window.SF_GLOSSARY = [
    { term: "阿波", termEn: "Awa float / waggler", category: "technique", aka: ["あば", "浮波"],
      explanation: "日式矶钓浮漂，半游动绑法可精准控制钓棚（饵的深度），是黑鱼/黑毛矶钓主力。",
      explanationEn: "Japanese-style rock float; with a sliding stopper it sets the exact depth — the go-to for luderick/drummer." },
    { term: "矶钓", termEn: "Rock (float) fishing", category: "technique", aka: ["矶钓法"],
      explanation: "在海边岩石平台用浮漂带饵随流，主攻黑鱼、黑毛、黑鲷等。澳洲岩钓有溺亡风险，安全第一。",
      explanationEn: "Float fishing from rock platforms for luderick, drummer, bream. High drowning risk in NSW — safety first." },
    { term: "沉底", termEn: "Bottom / ledger rig", category: "rig", aka: ["沉底钓", "底钓"],
      explanation: "铅坠把饵压到底层，主攻沙鳕、石首鱼、隆头鱼等底栖鱼。",
      explanationEn: "Sinker holds bait on the seabed — for flathead, mulloway, groper and other bottom feeders." },
    { term: "打窝", termEn: "Berley / chumming", category: "technique", aka: ["撒诱", "诱饵"],
      explanation: "撒碎面包/鱼浆/虾壳把鱼引到钓点并留住，矶钓黑鱼必备。",
      explanationEn: "Scatter bread/fish mix to draw and hold fish in your zone — essential for luderick." },
    { term: "钉鞋", termEn: "Cleated / rock boots", category: "safety", aka: ["防滑鞋", "毡底鞋"],
      explanation: "鞋底带金属钉或毛毡，湿滑岩面防滑，岩钓必穿。",
      explanationEn: "Boots with metal cleats or felt soles for grip on wet rock — mandatory kit for rock fishing." },
    { term: "救生衣", termEn: "Lifejacket / PFD", category: "safety", aka: ["浮力衣", "PFD"],
      explanation: "岩钓救命装备，NSW 部分地区强制穿着，落水时争取生还时间。",
      explanationEn: "Life-saving gear; mandatory in parts of NSW. Buys you time if washed in." },
    { term: "子线", termEn: "Tippet / dropper", category: "tackle", aka: ["脑线", "支线"],
      explanation: "连接主线/前导与钓钩的最细一段线，断了只损失钩不损失整组。",
      explanationEn: "The fine end section to the hook; if it breaks you lose only the hook, not the whole rig." },
    { term: "前导线", termEn: "Leader", category: "tackle", aka: ["导线", "前导", "碳线"],
      explanation: "主线末端接的一段耐磨/低可见线（多为碳氟），抗礁石磨损、降低警觉。",
      explanationEn: "Abrasion-resistant low-vis section (usually fluorocarbon) at the line's end." },
    { term: "主线", termEn: "Main line", category: "tackle", aka: ["母线"],
      explanation: "绕在渔轮上的主体线，PE 编织线或尼龙线。",
      explanationEn: "The bulk line on your reel — braid (PE) or mono." },
    { term: "PE 线", termEn: "Braid (PE)", category: "tackle", aka: ["编织线"],
      explanation: "多股编织线，同直径强度高、几乎无延展，灵敏度高。号数越大越粗。",
      explanationEn: "Braided line — high strength-to-diameter, near-zero stretch, very sensitive." },
    { term: "铁板", termEn: "Metal jig", category: "tackle", aka: ["铁板亮片", "jig"],
      explanation: "金属仿饵，快速抽动模仿小鱼，主攻黄尾鰤、鲣鱼、澳洲鲑等掠食鱼。",
      explanationEn: "Metal lure worked fast to mimic baitfish — for kingfish, bonito, salmon." },
    { term: "软虫", termEn: "Soft plastics", category: "tackle", aka: ["软饵", "SP"],
      explanation: "软塑仿饵配铅头钩，万能拟饵，黑鲷/沙鳕常用。",
      explanationEn: "Soft plastic lures on a jighead — versatile, great for bream and flathead." },
    { term: "铅头钩", termEn: "Jighead", category: "rig", aka: ["跳头"],
      explanation: "钩柄带铅的钩，用来挂软虫，配重决定下沉速度。",
      explanationEn: "Weighted hook for rigging soft plastics; the weight sets sink rate." },
    { term: "气球钓", termEn: "Balloon / float (LBG)", category: "rig", aka: ["浮钓", "吊钩"],
      explanation: "用气球或大浮标把活饵吊在水面下，岸基游钓黄尾鰤经典钓法。",
      explanationEn: "Suspends live bait under a balloon/float — classic land-based game (LBG) for kingfish." },
    { term: "活饵", termEn: "Live bait", category: "technique", aka: ["活饵钓"],
      explanation: "用活的小鱼（如 yakka、slimy）作饵，对大型掠食鱼效果远胜死饵。",
      explanationEn: "Using live baitfish (yakkas, slimies) — far outfishes dead bait for big predators." },
    { term: "海鞘", termEn: "Cunjevoi", category: "tackle", aka: ["cunjevoi", "海菠萝"],
      explanation: "岩石上的橙红色被囊动物，黑毛的顶级天然饵。",
      explanationEn: "Orange sea-squirt on the rocks — premium natural bait for drummer." },
    { term: "绿苔", termEn: "Green weed", category: "tackle", aka: ["青苔", "weed"],
      explanation: "岩石/河口的丝状绿藻，黑鱼（luderick）的主饵。",
      explanationEn: "Filamentous green algae — the staple bait for luderick (blackfish)." },
    { term: "走水", termEn: "Current / drift", category: "technique", aka: ["流水"],
      explanation: "水流方向与强度；矶钓让浮漂随流自然漂送是关键。",
      explanationEn: "Water flow; drifting your float naturally with the current is key in rock fishing." },
    { term: "钓棚", termEn: "Depth setting", category: "technique", aka: ["水深", "tana"],
      explanation: "饵在水中的深度，靠浮漂挡珠/太空豆调整，找对钓棚才有口。",
      explanationEn: "The depth your bait sits — adjust via the float stopper; the right depth = bites." },
    { term: "黑鱼", termEn: "Luderick / blackfish", category: "species", aka: ["黑毛(误)", "luderick"],
      explanation: "即 Luderick（学名 Girella tricuspidata），矶钓绿苔主攻对象。注意别和黑毛(drummer)混淆。",
      explanationEn: "Luderick — the green-weed float target. Don't confuse with drummer (黑毛)." },
    { term: "黑毛", termEn: "Drummer / rock blackfish", category: "species", aka: ["drummer", "鹭"],
      explanation: "即 Eastern Rock Blackfish（Drummer），冬季岩钓硬拉对象，海鞘/面包为饵。",
      explanationEn: "Eastern Rock Blackfish (drummer) — hard-pulling winter rock target on cunjevoi/bread." },
    { term: "黄尾", termEn: "Kingfish", category: "species", aka: ["king", "黄尾鰤", "kingie"],
      explanation: "Yellowtail Kingfish，岸基游钓(LBG)梦想鱼，活饵/铁板主攻。",
      explanationEn: "Yellowtail Kingfish — the LBG dream fish, on live bait or jigs." },
    { term: "石首", termEn: "Mulloway / jewfish", category: "species", aka: ["jewie", "mulloway", "石首鱼"],
      explanation: "Mulloway（Jewfish），夜钓大物，活饵/大软虫沉底。最小尺寸 70cm。",
      explanationEn: "Mulloway (jewfish) — big night target on live bait / large plastics. 70cm min size." },
    { term: "冲沟", termEn: "Gutter", category: "technique", aka: ["gutter", "沟"],
      explanation: "海滩上两道沙坝之间的深色深水带，是 Tailor/Salmon/Whiting 觅食的主战场，退潮时最易辨认。",
      explanationEn: "A deeper darker channel between sandbars on a beach — prime feeding lane; easiest to read at low tide." },
    { term: "白沫区", termEn: "Wash / suds", category: "technique", aka: ["wash", "白花", "泡沫区"],
      explanation: "礁石或海滩浪花翻搅出的白色泡沫水域，溶氧高、藏饵料，黑毛/黑鲷/鲷鱼常在此觅食。",
      explanationEn: "The aerated white-water zone off rocks/beach — oxygen-rich, holds food; drummer/bream feed here." },
    { term: "走铅", termEn: "Running sinker", category: "rig", aka: ["滑铅", "通心铅"],
      explanation: "铅坠穿在主线上可滑动，鱼咬饵时感觉不到铅重，河口底钓常用。",
      explanationEn: "Sinker runs free on the line so the fish feels no weight on the take — common estuary bottom rig." },
    { term: "钢丝前导", termEn: "Wire trace", category: "tackle", aka: ["wire", "钢丝", "trace"],
      explanation: "Tailor、狐鲣等利齿鱼用的钢丝前导，防止咬断子线。",
      explanationEn: "A short wire leader for toothy fish like tailor — stops bite-offs." },
    { term: "空军", termEn: "Donut / blanked", category: "technique", aka: ["donut", "剃光头", "放空"],
      explanation: "一条没钓到，空手而归。澳洲俚语 'donut'（零）或 'blanked'。",
      explanationEn: "Caught nothing — went home empty. Aussie slang: 'donut' (zero) or 'blanked'." },
    { term: "达标鱼", termEn: "Legal / keeper", category: "species", aka: ["legal", "keeper", "够尺寸"],
      explanation: "达到法定最小尺寸、可合法带走的鱼；不够尺寸叫 undersize，必须放流。",
      explanationEn: "A fish at/over the legal min size you may keep; under that is 'undersize' and must be released." }
  ];

  // ---------- view ----------
  const esc = (s) => (window.escapeHtml ? window.escapeHtml(s) : String(s || ""));
  const ic = (n) => `<svg class="ic" aria-hidden="true"><use href="#ic-${n}"></use></svg>`;
  const view = () => document.getElementById("glossaryView");
  const inner = () => document.getElementById("glossaryInner");

  let q = "";        // search query
  let cat = "all";   // active category

  function matches(e) {
    if (cat !== "all" && e.category !== cat) return false;
    if (!q) return true;
    const hay = [e.term, e.termEn, e.explanation, e.explanationEn, ...(e.aka || [])].join(" ").toLowerCase();
    return hay.includes(q.toLowerCase());
  }

  function entryCard(e) {
    const c = window.SF_GLOSSARY_CATEGORIES[e.category];
    const tag = c ? `<span class="gl-tag">${esc(c.cn)} · ${esc(c.en)}</span>` : "";
    const aka = (e.aka && e.aka.length) ? `<div class="gl-aka">又称 aka: ${esc(e.aka.join("、"))}</div>` : "";
    return `
      <div class="gl-card">
        <div class="gl-head"><span class="gl-term">${esc(e.term)}</span><span class="gl-term-en">${esc(e.termEn)}</span>${tag}</div>
        <div class="gl-exp">${esc(e.explanation)}</div>
        <div class="gl-exp en">${esc(e.explanationEn)}</div>
        ${aka}
      </div>`;
  }

  function renderList() {
    const list = inner().querySelector("#glList");
    if (!list) return;
    const items = (window.SF_GLOSSARY || []).filter(matches);
    list.innerHTML = items.length
      ? items.map(entryCard).join("")
      : `<div class="ins-empty">没有匹配的术语 · No matching terms</div>`;
  }

  function chips() {
    const cats = window.SF_GLOSSARY_CATEGORIES;
    const mk = (key, label) => `<button type="button" class="gl-chip${cat === key ? " active" : ""}" data-cat="${esc(key)}">${esc(label)}</button>`;
    return mk("all", "全部 All") + Object.keys(cats).map(k => mk(k, cats[k].cn)).join("");
  }

  function render() {
    view().classList.remove("hidden");
    inner().innerHTML = `
      <div class="forum-bar"><span class="forum-logo">${ic("spark")}</span><div class="forum-title">钓鱼术语 · Glossary</div><button class="forum-close" id="glClose">×</button></div>
      <div class="gl-body">
        <input id="glSearch" class="gl-search" type="search" placeholder="搜索术语 / Search (中文 or English)…" />
        <div class="gl-chips">${chips()}</div>
        <div id="glList" class="gl-list"></div>
      </div>`;
    inner().querySelector("#glClose").onclick = close;
    const search = inner().querySelector("#glSearch");
    search.value = q;
    search.addEventListener("input", () => { q = search.value.trim(); renderList(); });
    inner().querySelector(".gl-chips").addEventListener("click", (e) => {
      const b = e.target.closest(".gl-chip"); if (!b) return;
      cat = b.dataset.cat;
      inner().querySelectorAll(".gl-chip").forEach(x => x.classList.toggle("active", x === b));
      renderList();
    });
    renderList();
  }

  function close() { if ((location.hash || "").startsWith("#/glossary")) location.hash = ""; view().classList.add("hidden"); }

  function route() {
    if ((location.hash || "").startsWith("#/glossary")) render();
    else view().classList.add("hidden");
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("glossaryBtn")?.addEventListener("click", () => { location.hash = "#/glossary"; });
    if ((location.hash || "").startsWith("#/glossary")) route();
  });
})();
