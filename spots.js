// Curated Sydney fishing spots database.
// Coordinates are real, targets and tips are based on commonly-known local knowledge.
// baseScore: spot reputation (0-100). Used as a starting point before condition scoring.
window.SYDNEY_SPOTS = [
  {
    id: "bare-island",
    name: "Bare Island, La Perouse",
    nameCn: "贝尔岛 · 拉佩鲁兹",
    lat: -33.9920, lng: 151.2340,
    type: "rock",
    baseScore: 92,
    species: ["Kingfish", "Bream", "Trevally", "Squid", "Drummer"],
    best: "Dawn & dusk. Run-in tide. Calm to light NE winds.",
    bestCn: "清晨与黄昏最佳；涨潮最佳；微东北风为宜。",
    techniques: ["Live yakkas for kingfish", "Berley + bread for bream", "Squid jigs along kelp edges"],
    tips: "Popular land-based game spot — kingfish in summer, drummer in winter. Slippery rocks: wear cleated boots and watch the swell.",
    tipsCn: "著名岸钓游钓点：夏季黄尾鰤，冬季黑毛。岩石湿滑，请穿防滑钉鞋并留意浪涌。",
    prefers: { calm: true, wind: ["NE", "N", "W", "SW"] },
    preferredTide: "rising",
    rigNotes: {
      "Kingfish": "本点活饵效果 >> 铁板。早晨 6-7 点涨潮前 1 小时最旺。气球建议 15cm 大号抗风。",
      "Drummer": "冬季用面包+海鞘 berley 效果显著，北侧岩缝 30cm 离底最佳。"
    }
  },
  {
    id: "clovelly",
    name: "Clovelly Rocks",
    nameCn: "克洛夫利岩石区",
    lat: -33.9145, lng: 151.2633,
    type: "rock",
    baseScore: 80,
    species: ["Luderick", "Bream", "Drummer", "Trevally"],
    best: "Incoming tide, morning. Green weed for luderick.",
    bestCn: "涨潮与早晨最佳，用绿苔钓黑鱼。",
    techniques: ["Float fishing with green weed", "Cunjevoi for drummer", "Light unweighted pilchard for bream"],
    tips: "Sheltered bay — good winter drummer and year-round luderick.",
    tipsCn: "海湾较避风，冬季黑毛、全年黑鱼均佳。",
    prefers: { calm: false, wind: ["W", "NW", "SW"] }
  },
  {
    id: "long-reef",
    name: "Long Reef Point",
    nameCn: "长礁角",
    lat: -33.7440, lng: 151.3125,
    type: "rock",
    baseScore: 85,
    species: ["Tailor", "Salmon", "Jewfish", "Kingfish"],
    best: "Dawn, dusk, run-out tide. Light westerlies.",
    bestCn: "清晨黄昏与退潮最佳，轻西风为宜。",
    techniques: ["Pilchards on gang hooks for tailor", "Metal slugs for salmon", "Live bait for jewfish after dark"],
    tips: "Walk out on low tide only. Exposed to southerly swell — do NOT fish in big seas.",
    tipsCn: "仅可在低潮步行前往；受南涌影响大，涌浪大时严禁下竿。",
    prefers: { calm: false, wind: ["W", "NW"] },
    preferredTide: "falling",
    rigNotes: {
      "Jewfish": "夜钓换潮期 ±1h 是金窗口。活乌头 (live mullet) 效果压倒性，leader 用 80lb 防砂石磨损。",
      "Tailor": "晨昏炸水用 Gang Hook + 整条 pilchard 远投沟外。"
    }
  },
  {
    id: "bradleys-head",
    name: "Bradleys Head",
    nameCn: "布拉德利角",
    lat: -33.8475, lng: 151.2440,
    type: "harbour",
    baseScore: 82,
    species: ["Kingfish", "Bream", "Trevally", "Squid"],
    best: "Early morning. Run-in tide. Light winds.",
    bestCn: "清晨最佳，涨潮与微风最宜。",
    techniques: ["Live squid or yakkas for kingfish", "Berley for bream and trevally", "Squid jigs over weed"],
    tips: "Classic harbour kingfish spot. Deep water right off the rocks.",
    tipsCn: "经典港内钓黄尾点，岸边即深水区。",
    prefers: { calm: true, wind: ["N", "NW", "W", "SW"] },
    preferredTide: "rising",
    rigNotes: {
      "Kingfish": "港内活饵走流钓法为主，leader 50-60lb 足够。用小号 yakka 比大号更有效。"
    }
  },
  {
    id: "the-spit",
    name: "The Spit Bridge",
    nameCn: "斯皮特大桥",
    lat: -33.8030, lng: 151.2480,
    type: "estuary",
    baseScore: 76,
    species: ["Flathead", "Bream", "Whiting", "Trevally"],
    best: "Run-out tide. Soft plastics along the drop-off.",
    bestCn: "退潮最佳，沿深沟抛软虫。",
    techniques: ["Soft plastics for flathead", "Prawn baits for bream", "Beach worms for whiting on sand flats"],
    tips: "Fishable in most weather. Watch for boat traffic.",
    tipsCn: "几乎任何天气都能钓；小心过往船只。",
    prefers: { calm: true, wind: ["N", "NW", "W", "SW", "S"] }
  },
  {
    id: "narrabeen-lake",
    name: "Narrabeen Lagoon",
    nameCn: "纳拉宾湖",
    lat: -33.7080, lng: 151.2870,
    type: "estuary",
    baseScore: 78,
    species: ["Flathead", "Whiting", "Bream", "Luderick"],
    best: "Last of the run-out tide at the entrance.",
    bestCn: "湖口退潮末最佳。",
    techniques: ["Surface poppers for whiting at dawn", "Soft plastics for flathead", "Live nippers for bream"],
    tips: "Family-friendly, shallow flats — great land-based lure spot.",
    tipsCn: "适合家庭；浅滩平坦，是非常好的岸钓拟饵点。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "silver-beach",
    name: "Silver Beach, Kurnell",
    nameCn: "银滩 · 库内尔",
    lat: -34.0140, lng: 151.2100,
    type: "beach",
    baseScore: 77,
    species: ["Whiting", "Flathead", "Bream", "Salmon"],
    best: "Run-in tide, early morning. Beach worms or nippers.",
    bestCn: "涨潮与清晨最佳，用海虫或钳虾。",
    techniques: ["Light running sinker rigs", "Beach worms for whiting", "Pilchards for salmon schools"],
    tips: "Sheltered from southerlies — fishable when ocean beaches are blown out.",
    tipsCn: "避南风，南风天海滩刮不下竿时此处仍可作钓。",
    prefers: { calm: true, wind: ["S", "SW", "SE"] },
    preferredTide: "rising",
    rigNotes: {
      "Whiting": "涨潮前 2h 开始，走铅沙底，海虫或钳虾饵。沙梭在沙坝背后的深沟。",
      "Flathead": "低潮时找沟，涨潮时进沟，软虫 1/8oz 配 3 寸 shad 最稳。"
    }
  },
  {
    id: "balmoral",
    name: "Balmoral Beach",
    nameCn: "巴尔莫勒尔海滩",
    lat: -33.8260, lng: 151.2530,
    type: "harbour",
    baseScore: 74,
    species: ["Kingfish", "Bream", "Squid", "Whiting"],
    best: "Early/late. Live bait or squid jigs off the baths.",
    bestCn: "早晚最佳，泳池旁抛活饵或鱿鱼钩。",
    techniques: ["Squid jigs around moorings", "Unweighted prawns for bream"],
    tips: "Family spot with easy access. Kings chase bait schools in summer.",
    tipsCn: "家庭友好易达；夏季黄尾随饵群进湾。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "como",
    name: "Como, Georges River",
    nameCn: "柯摩 · 乔治河",
    lat: -33.9880, lng: 151.0640,
    type: "estuary",
    baseScore: 75,
    species: ["Flathead", "Bream", "Tailor", "Trevally"],
    best: "Run-out tide at dawn and dusk.",
    bestCn: "晨昏退潮最佳。",
    techniques: ["Soft plastics along drop-offs", "Live poddy mullet for big flathead"],
    tips: "Watch EPA fish-consumption advice for dioxin in some species upstream of Como.",
    tipsCn: "科摩以上河段有二噁英警示，请参照 EPA 食用建议。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "cronulla-point",
    name: "Cronulla Point",
    nameCn: "克罗努拉角",
    lat: -34.0580, lng: 151.1580,
    type: "rock",
    baseScore: 83,
    species: ["Drummer", "Bream", "Tailor", "Salmon", "Groper"],
    best: "Winter drummer on cunjevoi; summer pelagics at dawn.",
    bestCn: "冬季用海鞘钓黑毛，夏季清晨钓洄游鱼。",
    techniques: ["Cunjevoi float rigs", "Metal slugs for salmon", "Red crab for groper"],
    tips: "Exposed to southerly swell — check wave forecast before fishing.",
    tipsCn: "暴露南涌，下竿前务必查看浪高预报。",
    prefers: { calm: false, wind: ["W", "NW", "N"] },
    preferredTide: "high",
    rigNotes: {
      "Drummer": "冬季绝佳黑毛点。海鞘浮漂钓离底 20-30cm；涌浪大的日子鱼最活跃但要严查安全。",
      "Groper": "红蟹沉底最有效；注意蓝色雄性隆头鱼受保护必须放流。"
    }
  },
  {
    id: "manly-wharf",
    name: "Manly Wharf",
    nameCn: "曼利码头",
    lat: -33.8010, lng: 151.2850,
    type: "harbour",
    baseScore: 73,
    species: ["Squid", "Tailor", "Kingfish", "Yellowtail"],
    best: "Night fishing under lights for squid and tailor.",
    bestCn: "夜间码头灯下钓鱿鱼和竹荚鱼最佳。",
    techniques: ["Squid jigs", "Small metals for tailor schools"],
    tips: "Easy access, great for beginners. Avoid casting across ferry lanes.",
    tipsCn: "接近便利，适合新手；避免跨越渡轮航道抛竿。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "palm-beach",
    name: "Palm Beach Wharf, Pittwater",
    nameCn: "棕榈海滩码头 · 皮特沃特",
    lat: -33.5990, lng: 151.3240,
    type: "harbour",
    baseScore: 81,
    species: ["Kingfish", "Squid", "Bream", "Tailor"],
    best: "Dawn and dusk with live squid or yakkas.",
    bestCn: "晨昏用活鱿或小鲹最佳。",
    techniques: ["Live bait drift", "Squid jigs over weed beds"],
    tips: "Famous land-based kingfish haunt. Fights rods into pylons — use heavy leader.",
    tipsCn: "著名岸钓黄尾点；鱼易缠桩，使用粗碳线。",
    prefers: { calm: true, wind: ["N", "NW", "W", "SW"] },
    preferredTide: "rising",
    rigNotes: {
      "Kingfish": "码头桩缠线专业户，leader 必须 80-100lb。活饵建议吊在桩间 1-2m 深，距离桩 0.5m 外。",
      "Squid": "晚上灯下用 3.5# Egi 粉色/夜光效果最稳。"
    }
  },
  {
    id: "clontarf",
    name: "Clontarf, Middle Harbour",
    nameCn: "克朗塔夫 · 中港",
    lat: -33.8060, lng: 151.2525,
    type: "estuary",
    baseScore: 72,
    species: ["Flathead", "Whiting", "Bream"],
    best: "High tide for whiting on sand flats.",
    bestCn: "高潮在沙滩平台钓沙梭最佳。",
    techniques: ["Surface poppers", "Nippers under a float"],
    tips: "Shallow, protected bay — ideal in bad weather.",
    tipsCn: "浅水避风湾，恶劣天气首选。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "parsley-bay",
    name: "Parsley Bay",
    nameCn: "帕斯利湾",
    lat: -33.8560, lng: 151.2730,
    type: "harbour",
    baseScore: 70,
    species: ["Squid", "Bream", "Trevally"],
    best: "Squid jigs in the evening over weed.",
    bestCn: "傍晚在海草床抛鱿鱼钩最佳。",
    techniques: ["Light spin, squid jigs"],
    tips: "Small, scenic bay. Beach swimming area — fish outside netted zone.",
    tipsCn: "小而美的海湾；注意避开游泳防鲨网区作钓。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "north-head",
    name: "North Head, Manly",
    nameCn: "北角 · 曼利",
    lat: -33.8200, lng: 151.2930,
    type: "rock",
    baseScore: 88,
    species: ["Kingfish", "Bonito", "Tailor", "Drummer"],
    best: "Dawn with live bait. Run-in tide.",
    bestCn: "清晨涨潮用活饵最佳。",
    techniques: ["Live squid/yakkas for kings", "Metal slugs at sunrise for bonito"],
    tips: "Serious land-based game platform. Heavy gear, cleats, and a buddy — never solo in swell.",
    tipsCn: "岸钓大物平台；重装备+钉鞋+同伴，严禁独自在涌浪中作钓。",
    prefers: { calm: true, wind: ["W", "NW", "N"] },
    preferredTide: "rising",
    rigNotes: {
      "Kingfish": "北角需要真正重竿，leader 80lb 起步。鱼咬后必须立即起竿拉离礁缝，任何犹豫都会缠线断线。",
      "Bonito": "夏季 5-7AM 铁板专场，看到鲣鱼群炸水立刻抛进去，收线越快越好。"
    }
  },
  {
    id: "camp-cove",
    name: "Camp Cove / Watsons Bay",
    nameCn: "营地湾 · 华生湾",
    lat: -33.8400, lng: 151.2790,
    type: "harbour",
    baseScore: 76,
    species: ["Kingfish", "Trevally", "Squid", "Bream"],
    best: "Early morning incoming tide.",
    bestCn: "清晨涨潮最佳。",
    techniques: ["Live bait for kings", "Bread berley for bream"],
    tips: "Easy access near ferry wharf. Protected from southerlies.",
    tipsCn: "靠近渡轮码头，避南风。",
    prefers: { calm: true, wind: ["S", "SW", "SE"] }
  },
  {
    id: "malabar",
    name: "Malabar (Magic Point)",
    nameCn: "马拉巴 · 魔法角",
    lat: -33.9650, lng: 151.2500,
    type: "rock",
    baseScore: 84,
    species: ["Drummer", "Bream", "Groper", "Kingfish"],
    best: "Winter drummer; summer pelagics at change of light.",
    bestCn: "冬季黑毛；夏季晨昏洄游鱼最佳。",
    techniques: ["Cunjevoi for drummer", "Red crab for groper", "Live slimies for kings"],
    tips: "NOTE: EPA fishing ban on recreational harvest zones near Malabar — check current rules before keeping fish.",
    tipsCn: "注意：马拉巴附近有 EPA 禁捕区，食用前请查询最新规定。",
    prefers: { calm: false, wind: ["W", "NW"] },
    preferredTide: "rising",
    rigNotes: {
      "Drummer": "北侧岩缝用海鞘+面包 berley，冬季高潮段最旺。",
      "Groper": "红蟹 + 重沉底；蓝色雄性必须放流。"
    }
  },
  {
    id: "gunnamatta",
    name: "Gunnamatta Bay, Port Hacking",
    nameCn: "冈那玛塔湾 · 霍金港",
    lat: -34.0720, lng: 151.1480,
    type: "estuary",
    baseScore: 74,
    species: ["Flathead", "Whiting", "Bream", "Tailor"],
    best: "Run-out tide over sand flats.",
    bestCn: "退潮沙滩平台最佳。",
    techniques: ["Soft plastics", "Live nippers under float"],
    tips: "Protected bay, kid-friendly jetty.",
    tipsCn: "避风湾，码头适合家庭。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "brooklyn",
    name: "Brooklyn, Hawkesbury River",
    nameCn: "布鲁克林 · 霍克斯伯里河",
    lat: -33.5460, lng: 151.2300,
    type: "estuary",
    baseScore: 86,
    species: ["Jewfish", "Flathead", "Bream", "Tailor"],
    best: "Night session around tide change for jewfish.",
    bestCn: "夜钓换潮期钓石首鱼最佳。",
    techniques: ["Live mullet for jewfish", "Soft plastics on deep edges"],
    tips: "Famous for big jewfish. Bring heavy tackle and patience.",
    tipsCn: "以大石首鱼闻名；粗线大钩，耐心等候。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "change",
    rigNotes: {
      "Jewfish": "换潮 ±2h 是 Brooklyn 的金时段。活乌头必须是钓点附近捞的，买的冷冻货差远了。头灯务必蓝/红光。"
    }
  },
  {
    id: "cape-solander",
    name: "Cape Solander",
    nameCn: "索兰德角",
    lat: -34.0130, lng: 151.2270,
    type: "rock",
    baseScore: 87,
    species: ["Tailor", "Salmon", "Kingfish", "Bonito"],
    best: "Dawn with metals. Run-in tide.",
    bestCn: "清晨涨潮用铁板最佳。",
    techniques: ["Metal slugs", "Live bait for kings"],
    tips: "High rock platform — excellent whale watching in winter too.",
    tipsCn: "高岩平台；冬季也可观鲸。",
    prefers: { calm: false, wind: ["W", "NW"] }
  },
  // ================== Northern Beaches ==================
  {
    id: "dee-why-point", name: "Dee Why Point", nameCn: "迪威角",
    lat: -33.7530, lng: 151.3020, type: "rock", baseScore: 78,
    species: ["Tailor", "Salmon", "Bream", "Drummer"],
    best: "Dawn/dusk, run-in tide.", bestCn: "晨昏涨潮最佳。",
    techniques: ["Metal slugs for pelagics", "Pilchards on gangs"],
    tips: "Accessible rock platform, watch for southerly swells.",
    tipsCn: "易达岩钓平台，注意南向涌浪。",
    prefers: { calm: false, wind: ["W", "NW"] }
  },
  {
    id: "curl-curl", name: "South Curl Curl Rocks", nameCn: "南卷卷岩",
    lat: -33.7720, lng: 151.3000, type: "rock", baseScore: 75,
    species: ["Drummer", "Bream", "Groper", "Luderick"],
    best: "Winter incoming tide on cunjevoi.", bestCn: "冬季涨潮用海鞘最佳。",
    techniques: ["Float rigs", "Cunjevoi baits"],
    tips: "Good winter drummer spot, slippery when wet.",
    tipsCn: "冬季黑毛良点，湿滑注意。",
    prefers: { calm: false, wind: ["W", "NW"] }
  },
  {
    id: "avalon-rocks", name: "Avalon Headland", nameCn: "阿瓦隆岬角",
    lat: -33.6340, lng: 151.3380, type: "rock", baseScore: 79,
    species: ["Kingfish", "Tailor", "Drummer", "Bream"],
    best: "Summer dawn for kings.", bestCn: "夏季清晨钓黄尾。",
    techniques: ["Live yakkas", "Metals"],
    tips: "Exposed platform on big days — check swell.",
    tipsCn: "暴露平台，大涌日严禁下竿。",
    prefers: { calm: false, wind: ["W", "SW"] }
  },
  {
    id: "whale-beach", name: "Whale Beach Headland", nameCn: "鲸鱼海滩岬",
    lat: -33.6100, lng: 151.3310, type: "rock", baseScore: 76,
    species: ["Tailor", "Salmon", "Bream", "Groper"],
    best: "Dawn with metals.", bestCn: "清晨用铁板最佳。",
    techniques: ["Metal slugs", "Gang-hook pilchards"],
    tips: "Beautiful northern platform, exposed to east swell.",
    tipsCn: "北岸秀丽岩台，受东涌影响。",
    prefers: { calm: false, wind: ["W", "NW"] }
  },
  {
    id: "mona-vale-basin", name: "Mona Vale Rock Pool", nameCn: "莫纳谷岩池",
    lat: -33.6820, lng: 151.3120, type: "rock", baseScore: 70,
    species: ["Bream", "Luderick", "Drummer"],
    best: "High tide morning.", bestCn: "高潮清晨最佳。",
    techniques: ["Light float rig", "Unweighted prawns"],
    tips: "Family-friendly rocks near pool.",
    tipsCn: "岩池旁适合家庭。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "bungan-head", name: "Bungan Head", nameCn: "邦甘角",
    lat: -33.6580, lng: 151.3180, type: "rock", baseScore: 77,
    species: ["Drummer", "Bream", "Tailor", "Groper"],
    best: "Winter drummer on cabbage/cunje.", bestCn: "冬季黑毛最佳。",
    techniques: ["Float rig", "Heavy berley"],
    tips: "Quieter headland, good for escape from crowds.",
    tipsCn: "人少的岬角，避人流。",
    prefers: { calm: false, wind: ["W", "NW"] }
  },
  {
    id: "turimetta", name: "Turimetta Head", nameCn: "图瑞梅塔角",
    lat: -33.6930, lng: 151.3050, type: "rock", baseScore: 74,
    species: ["Tailor", "Salmon", "Bream"],
    best: "Dawn/dusk run-in tide.", bestCn: "晨昏涨潮最佳。",
    techniques: ["Metals", "Pilchard gangs"],
    tips: "Walk in from Narrabeen Beach end.",
    tipsCn: "由纳拉宾海滩北端步入。",
    prefers: { calm: false, wind: ["W"] }
  },
  {
    id: "narrabeen-beach", name: "North Narrabeen Beach", nameCn: "北纳拉宾海滩",
    lat: -33.7050, lng: 151.3020, type: "beach", baseScore: 76,
    species: ["Salmon", "Tailor", "Whiting", "Bream"],
    best: "Dawn gutters on run-in tide.", bestCn: "清晨涨潮冲沟钓最佳。",
    techniques: ["Pilchards on gangs", "Beach worms for whiting"],
    tips: "Read the gutters — deep holes next to sand bars.",
    tipsCn: "找冲沟深槽；沙坝旁的深窝是关键。",
    prefers: { calm: true, wind: ["W", "NW"] }
  },
  {
    id: "collaroy", name: "Collaroy Beach", nameCn: "科拉罗伊海滩",
    lat: -33.7290, lng: 151.3020, type: "beach", baseScore: 72,
    species: ["Salmon", "Tailor", "Whiting"],
    best: "Dawn/dusk in gutters.", bestCn: "晨昏冲沟最佳。",
    techniques: ["Pilchards", "Beach worms"],
    tips: "Easy parking, fishable most tides.",
    tipsCn: "停车方便，多数潮位可钓。",
    prefers: { calm: true, wind: ["W"] }
  },
  {
    id: "palm-beach-front", name: "Palm Beach (ocean side)", nameCn: "棕榈海滩 · 外海侧",
    lat: -33.5920, lng: 151.3280, type: "beach", baseScore: 78,
    species: ["Salmon", "Tailor", "Jewfish", "Whiting"],
    best: "Night tide change for jewfish.", bestCn: "夜间换潮钓石首鱼最佳。",
    techniques: ["Live squid for jewfish", "Beach worms for whiting"],
    tips: "Long beach with shifting gutters — walk and read.",
    tipsCn: "长沙滩冲沟变化大，多走多看。",
    prefers: { calm: true, wind: ["W", "NW"] }
  },
  // ================== Eastern Beaches ==================
  {
    id: "bondi-rocks", name: "Ben Buckler (North Bondi)", nameCn: "本巴克勒 · 北邦迪",
    lat: -33.8880, lng: 151.2820, type: "rock", baseScore: 79,
    species: ["Kingfish", "Drummer", "Bream", "Tailor"],
    best: "Dawn, calm days.", bestCn: "清晨平静天最佳。",
    techniques: ["Live bait for kings", "Cunjevoi for drummer"],
    tips: "Famous eastern suburbs rock hop — wear cleats.",
    tipsCn: "东区著名岩钓点，请穿钉鞋。",
    prefers: { calm: false, wind: ["W", "NW"] }
  },
  {
    id: "bronte-baths", name: "Bronte Baths Rocks", nameCn: "布朗特泳池岩",
    lat: -33.9035, lng: 151.2680, type: "rock", baseScore: 72,
    species: ["Bream", "Luderick", "Drummer"],
    best: "Incoming tide, early.", bestCn: "涨潮清晨最佳。",
    techniques: ["Light float", "Berley bread"],
    tips: "Easy access, gentler platform.",
    tipsCn: "易达平缓平台。",
    prefers: { calm: true, wind: ["W", "SW"] }
  },
  {
    id: "tamarama-rocks", name: "Tamarama Point", nameCn: "塔玛拉玛角",
    lat: -33.8995, lng: 151.2700, type: "rock", baseScore: 71,
    species: ["Bream", "Luderick", "Drummer"],
    best: "Run-in morning tide.", bestCn: "涨潮清晨最佳。",
    techniques: ["Light spin", "Float rig"],
    tips: "Small but productive when calm.",
    tipsCn: "小而精；平静日较佳。",
    prefers: { calm: true, wind: ["W", "NW"] }
  },
  {
    id: "maroubra-rocks", name: "Mistral Point, Maroubra", nameCn: "米斯特拉尔角 · 马鲁巴",
    lat: -33.9500, lng: 151.2600, type: "rock", baseScore: 82,
    species: ["Kingfish", "Drummer", "Bream", "Tailor", "Groper"],
    best: "Dawn on calm days.", bestCn: "平静日清晨最佳。",
    techniques: ["Live bait", "Red crab for groper"],
    tips: "One of the best land-based king spots in the east.",
    tipsCn: "东区岸钓黄尾首选之一。",
    prefers: { calm: true, wind: ["W", "NW"] }
  },
  {
    id: "little-bay", name: "Little Bay", nameCn: "小湾",
    lat: -33.9820, lng: 151.2510, type: "rock", baseScore: 75,
    species: ["Drummer", "Bream", "Luderick", "Tailor"],
    best: "Winter drummer; summer tailor at dusk.", bestCn: "冬黑毛，夏黄昏竹荚。",
    techniques: ["Cunjevoi", "Metal slugs"],
    tips: "Protected small bay, popular with locals.",
    tipsCn: "避风小湾，当地人爱去。",
    prefers: { calm: false, wind: ["W"] }
  },
  {
    id: "coogee-rocks", name: "Dolphin Point, Coogee", nameCn: "海豚角 · 库吉",
    lat: -33.9190, lng: 151.2610, type: "rock", baseScore: 73,
    species: ["Bream", "Drummer", "Luderick"],
    best: "Incoming tide morning.", bestCn: "涨潮清晨最佳。",
    techniques: ["Float rig", "Berley"],
    tips: "Accessible rocks next to Coogee Beach.",
    tipsCn: "紧邻库吉海滩，方便易达。",
    prefers: { calm: true, wind: ["W"] }
  },
  {
    id: "bondi-beach", name: "Bondi Beach (south corner)", nameCn: "邦迪海滩 · 南角",
    lat: -33.8940, lng: 151.2770, type: "beach", baseScore: 70,
    species: ["Salmon", "Tailor", "Whiting", "Bream"],
    best: "Dawn gutters.", bestCn: "清晨冲沟最佳。",
    techniques: ["Pilchards", "Beach worms"],
    tips: "Fishable outside swim zones early morning.",
    tipsCn: "清晨在非泳区作钓。",
    prefers: { calm: true, wind: ["W"] }
  },
  {
    id: "maroubra-beach", name: "Maroubra Beach", nameCn: "马鲁巴海滩",
    lat: -33.9510, lng: 151.2570, type: "beach", baseScore: 74,
    species: ["Salmon", "Tailor", "Whiting", "Jewfish"],
    best: "Dawn/dusk gutters; night for jewfish.", bestCn: "晨昏冲沟；夜钓石首。",
    techniques: ["Gang hooks", "Beach worms", "Live squid"],
    tips: "Long beach with many productive holes.",
    tipsCn: "长滩深窝众多，多走多试。",
    prefers: { calm: true, wind: ["W"] }
  },
  // ================== Sydney Harbour ==================
  {
    id: "chowder-bay", name: "Chowder Bay", nameCn: "周德湾",
    lat: -33.8350, lng: 151.2520, type: "harbour", baseScore: 80,
    species: ["Kingfish", "Bream", "Squid", "Trevally"],
    best: "Early morning, run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Squid jigs", "Live bait drifts"],
    tips: "Deep water close to shore, historic jetty area.",
    tipsCn: "岸边即深水，历史码头区。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "taronga", name: "Taronga Zoo Wharf", nameCn: "塔隆加动物园码头",
    lat: -33.8430, lng: 151.2410, type: "harbour", baseScore: 72,
    species: ["Bream", "Squid", "Trevally"],
    best: "Evening squid jigging.", bestCn: "傍晚钓鱿鱼最佳。",
    techniques: ["Squid jigs", "Prawn baits"],
    tips: "Ferry wharf — avoid casting across lanes.",
    tipsCn: "渡轮码头，避开航道。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "nielsen-park", name: "Nielsen Park", nameCn: "尼尔森公园",
    lat: -33.8540, lng: 151.2680, type: "harbour", baseScore: 73,
    species: ["Squid", "Bream", "Trevally", "Whiting"],
    best: "Dawn run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Squid jigs", "Nippers under float"],
    tips: "Gentle shoreline, great family spot.",
    tipsCn: "平缓海岸，家庭友好。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "rose-bay", name: "Rose Bay Wharf", nameCn: "玫瑰湾码头",
    lat: -33.8720, lng: 151.2690, type: "harbour", baseScore: 71,
    species: ["Squid", "Bream", "Tailor"],
    best: "Night under lights for squid.", bestCn: "夜间灯下钓鱿。",
    techniques: ["Squid jigs", "Small metals"],
    tips: "Ferry wharf access, easy parking.",
    tipsCn: "渡轮码头，停车方便。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "rushcutters", name: "Rushcutters Bay", nameCn: "拉什卡特斯湾",
    lat: -33.8740, lng: 151.2300, type: "harbour", baseScore: 68,
    species: ["Bream", "Squid", "Flathead"],
    best: "Run-in tide early.", bestCn: "清晨涨潮最佳。",
    techniques: ["Unweighted prawns", "Squid jigs"],
    tips: "Sheltered inner harbour bay, CBD access.",
    tipsCn: "内港避风湾，近市中心。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "blues-point", name: "Blues Point", nameCn: "布鲁斯角",
    lat: -33.8490, lng: 151.2040, type: "harbour", baseScore: 74,
    species: ["Kingfish", "Squid", "Bream"],
    best: "Run-in tide with live bait.", bestCn: "涨潮用活饵最佳。",
    techniques: ["Live yakkas", "Squid jigs"],
    tips: "Iconic harbour spot right opposite Opera House.",
    tipsCn: "标志性点位，正对歌剧院。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "mosman-bay", name: "Mosman Bay Wharf", nameCn: "莫斯曼湾码头",
    lat: -33.8330, lng: 151.2310, type: "harbour", baseScore: 70,
    species: ["Bream", "Squid", "Trevally"],
    best: "Dawn or evening.", bestCn: "晨昏最佳。",
    techniques: ["Squid jigs", "Berley bream"],
    tips: "Quiet ferry wharf area.", tipsCn: "安静的渡轮区。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "cremorne-point", name: "Cremorne Point", nameCn: "克雷莫恩角",
    lat: -33.8420, lng: 151.2280, type: "harbour", baseScore: 75,
    species: ["Kingfish", "Bream", "Squid", "Trevally"],
    best: "Run-in tide early.", bestCn: "清晨涨潮最佳。",
    techniques: ["Live bait", "Squid jigs"],
    tips: "Deep water off point, kings patrol here.",
    tipsCn: "角尖即深水，黄尾巡游。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "middle-head", name: "Middle Head", nameCn: "中头",
    lat: -33.8270, lng: 151.2610, type: "harbour", baseScore: 83,
    species: ["Kingfish", "Bream", "Drummer", "Trevally"],
    best: "Dawn run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Live squid/yakkas", "Berley for bream"],
    tips: "Classic harbour mouth kingfish spot.",
    tipsCn: "经典港口岸钓黄尾点。",
    prefers: { calm: true, wind: ["W", "NW", "SW"] }
  },
  {
    id: "georges-heights", name: "Georges Heights", nameCn: "乔治高地",
    lat: -33.8320, lng: 151.2620, type: "harbour", baseScore: 77,
    species: ["Kingfish", "Squid", "Bream"],
    best: "Early morning.", bestCn: "清晨最佳。",
    techniques: ["Live bait", "Squid jigs"],
    tips: "Steep access but productive.",
    tipsCn: "下坡陡，但鱼情好。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "obelisk", name: "Obelisk Bay", nameCn: "方尖碑湾",
    lat: -33.8370, lng: 151.2590, type: "harbour", baseScore: 76,
    species: ["Squid", "Bream", "Flathead"],
    best: "Evening squid.", bestCn: "傍晚钓鱿。",
    techniques: ["Squid jigs over weed"],
    tips: "Clothing-optional beach — mind other users.",
    tipsCn: "该湾为天体海滩，请注意礼仪。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "farm-cove", name: "Farm Cove / Mrs Macquarie", nameCn: "农场湾 · 麦考瑞夫人座椅",
    lat: -33.8610, lng: 151.2220, type: "harbour", baseScore: 69,
    species: ["Bream", "Flathead", "Squid"],
    best: "Run-in tide, low light.", bestCn: "涨潮弱光最佳。",
    techniques: ["Prawns", "Small soft plastics"],
    tips: "Right next to Botanic Gardens — scenic session.",
    tipsCn: "紧邻植物园，风景绝佳。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "shark-island-side", name: "Shark Beach, Nielsen", nameCn: "鲨鱼海滩 · 尼尔森",
    lat: -33.8550, lng: 151.2670, type: "harbour", baseScore: 70,
    species: ["Whiting", "Bream", "Squid"],
    best: "High tide over sand.", bestCn: "高潮沙底最佳。",
    techniques: ["Nippers for whiting", "Squid jigs"],
    tips: "Shark net in summer; fish outside net.",
    tipsCn: "夏季有防鲨网，钓在网外。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "dawes-point", name: "Dawes Point / Hickson Rd", nameCn: "道斯角 · 希克森路",
    lat: -33.8560, lng: 151.2060, type: "harbour", baseScore: 71,
    species: ["Bream", "Kingfish", "Squid"],
    best: "Dawn run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Live bait", "Prawn baits"],
    tips: "Right under the Harbour Bridge.",
    tipsCn: "悉尼大桥正下方。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "woolloomooloo", name: "Woolloomooloo Wharf", nameCn: "伍鲁姆鲁码头",
    lat: -33.8700, lng: 151.2200, type: "harbour", baseScore: 66,
    species: ["Bream", "Squid", "Flathead"],
    best: "Night under lights.", bestCn: "夜间灯下最佳。",
    techniques: ["Squid jigs", "Prawn baits"],
    tips: "Walk-up city spot, steady bream.",
    tipsCn: "市区步行可达，黑鲷稳定。",
    prefers: { calm: true, wind: ["any"] }
  },
  // ================== Middle & Lane Cove ==================
  {
    id: "tunks-park", name: "Tunks Park", nameCn: "坦克斯公园",
    lat: -33.8170, lng: 151.2180, type: "estuary", baseScore: 68,
    species: ["Flathead", "Bream", "Whiting"],
    best: "Run-out tide.", bestCn: "退潮最佳。",
    techniques: ["Soft plastics", "Nippers"],
    tips: "Quiet creek mouth, family park.",
    tipsCn: "安静溪口，家庭公园。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "sailors-bay", name: "Sailors Bay, Castlecrag", nameCn: "水手湾 · 城堡崖",
    lat: -33.8060, lng: 151.2240, type: "estuary", baseScore: 73,
    species: ["Flathead", "Bream", "Whiting", "Luderick"],
    best: "Last of run-out tide.", bestCn: "退潮末段最佳。",
    techniques: ["Soft plastics", "Light float rigs"],
    tips: "Deep drop-offs close to shore.",
    tipsCn: "岸边即深沟。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "burns-bay", name: "Burns Bay, Lane Cove River", nameCn: "伯恩斯湾 · 莱恩湾河",
    lat: -33.8230, lng: 151.1600, type: "estuary", baseScore: 70,
    species: ["Flathead", "Bream", "Jewfish"],
    best: "Tide change at dawn/dusk.", bestCn: "晨昏换潮最佳。",
    techniques: ["Live mullet", "Deep soft plastics"],
    tips: "Lane Cove River holds surprise jewfish.",
    tipsCn: "河段有意外石首鱼。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "longueville", name: "Longueville Wharf", nameCn: "朗格维尔码头",
    lat: -33.8280, lng: 151.1700, type: "estuary", baseScore: 67,
    species: ["Bream", "Flathead", "Squid"],
    best: "Run-in tide.", bestCn: "涨潮最佳。",
    techniques: ["Prawns", "Squid jigs"],
    tips: "Small wharf, easy access.", tipsCn: "小码头，易达。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "kissing-point", name: "Kissing Point, Putney", nameCn: "吻角 · 普特尼",
    lat: -33.8330, lng: 151.1090, type: "estuary", baseScore: 69,
    species: ["Flathead", "Bream", "Jewfish"],
    best: "Run-out tide.", bestCn: "退潮最佳。",
    techniques: ["Soft plastics", "Live bait"],
    tips: "Parramatta River — jewfish on live bait at night.",
    tipsCn: "帕拉玛塔河；夜钓活饵有石首鱼。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "cabarita", name: "Cabarita Wharf", nameCn: "卡巴里塔码头",
    lat: -33.8490, lng: 151.1120, type: "estuary", baseScore: 65,
    species: ["Bream", "Flathead"],
    best: "Run-in tide morning.", bestCn: "清晨涨潮最佳。",
    techniques: ["Prawn baits", "Plastics"],
    tips: "Follow EPA advisory for Parramatta River fish consumption.",
    tipsCn: "请遵循 EPA 帕拉玛塔河食用建议。",
    prefers: { calm: true, wind: ["any"] }
  },
  // ================== Southern / Botany / Cronulla ==================
  {
    id: "yarra-bay", name: "Yarra Bay", nameCn: "雅拉湾",
    lat: -33.9810, lng: 151.2310, type: "harbour", baseScore: 71,
    species: ["Whiting", "Flathead", "Bream"],
    best: "High tide over flats.", bestCn: "高潮沙滩最佳。",
    techniques: ["Nippers", "Soft plastics"],
    tips: "Sheltered Botany Bay side.",
    tipsCn: "植物湾避风一侧。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "foreshores-botany", name: "Botany Bay Foreshores", nameCn: "植物湾海岸公园",
    lat: -33.9980, lng: 151.1950, type: "estuary", baseScore: 68,
    species: ["Flathead", "Whiting", "Bream", "Tailor"],
    best: "Dawn/dusk.", bestCn: "晨昏最佳。",
    techniques: ["Beach worms", "Soft plastics"],
    tips: "Long shoreline, many access points.",
    tipsCn: "海岸线长，入口多。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "sans-souci", name: "Sans Souci Wharf", nameCn: "桑苏西码头",
    lat: -33.9900, lng: 151.1340, type: "estuary", baseScore: 72,
    species: ["Bream", "Flathead", "Tailor", "Whiting"],
    best: "Run-in tide.", bestCn: "涨潮最佳。",
    techniques: ["Prawns", "Squid strips"],
    tips: "Georges River mouth wharf, reliable bream.",
    tipsCn: "乔治河口码头，黑鲷稳定。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "dolls-point", name: "Dolls Point", nameCn: "洋娃娃角",
    lat: -33.9930, lng: 151.1490, type: "beach", baseScore: 67,
    species: ["Whiting", "Flathead"],
    best: "High tide sand flats.", bestCn: "高潮沙滩最佳。",
    techniques: ["Beach worms", "Nippers"],
    tips: "Family flats inside Botany Bay.",
    tipsCn: "植物湾内家庭沙滩。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "cooks-river", name: "Cooks River Mouth", nameCn: "库克河口",
    lat: -33.9520, lng: 151.1660, type: "estuary", baseScore: 66,
    species: ["Flathead", "Bream"],
    best: "Run-out tide.", bestCn: "退潮最佳。",
    techniques: ["Soft plastics"],
    tips: "Catch & release preferred due to historic contamination.",
    tipsCn: "历史污染，建议钓后放流。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "taren-point", name: "Taren Point", nameCn: "塔伦角",
    lat: -34.0200, lng: 151.1200, type: "estuary", baseScore: 74,
    species: ["Flathead", "Bream", "Whiting"],
    best: "Run-out tide on sand flats.", bestCn: "退潮沙滩最佳。",
    techniques: ["Surface poppers", "Soft plastics"],
    tips: "Georges River flats — surface whiting in summer.",
    tipsCn: "乔治河沙滩，夏季水面钓沙梭。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "bundeena", name: "Bundeena Wharf", nameCn: "邦德纳码头",
    lat: -34.0820, lng: 151.1510, type: "estuary", baseScore: 76,
    species: ["Flathead", "Bream", "Whiting", "Tailor"],
    best: "Run-out tide from Port Hacking.", bestCn: "霍金港退潮最佳。",
    techniques: ["Soft plastics", "Nippers"],
    tips: "Gateway to Royal NP — scenic session.",
    tipsCn: "皇家国家公园门口，风景秀丽。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "wanda-beach", name: "Wanda Beach", nameCn: "万达海滩",
    lat: -34.0430, lng: 151.1720, type: "beach", baseScore: 75,
    species: ["Salmon", "Tailor", "Whiting", "Jewfish"],
    best: "Dawn gutters, night jewfish.", bestCn: "晨冲沟、夜石首。",
    techniques: ["Pilchards", "Live squid"],
    tips: "Long beach, drive north from Cronulla.",
    tipsCn: "长滩，从克罗努拉北行可达。",
    prefers: { calm: true, wind: ["W"] }
  },
  {
    id: "greenhills", name: "Greenhills Beach", nameCn: "绿山海滩",
    lat: -34.0320, lng: 151.1810, type: "beach", baseScore: 72,
    species: ["Salmon", "Tailor", "Whiting"],
    best: "Dawn/dusk gutters.", bestCn: "晨昏冲沟最佳。",
    techniques: ["Metals", "Beach worms"],
    tips: "Less crowded than Wanda.",
    tipsCn: "人比万达少。",
    prefers: { calm: true, wind: ["W"] }
  },
  {
    id: "burraneer", name: "Burraneer Bay", nameCn: "布拉尼尔湾",
    lat: -34.0510, lng: 151.1370, type: "estuary", baseScore: 72,
    species: ["Flathead", "Bream", "Whiting"],
    best: "Run-in tide morning.", bestCn: "清晨涨潮最佳。",
    techniques: ["Soft plastics", "Live nippers"],
    tips: "Protected bay in Port Hacking.",
    tipsCn: "霍金港内避风湾。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "yowie-bay", name: "Yowie Bay", nameCn: "尤维湾",
    lat: -34.0540, lng: 151.1220, type: "estuary", baseScore: 70,
    species: ["Flathead", "Bream"],
    best: "Run-out tide.", bestCn: "退潮最佳。",
    techniques: ["Plastics", "Prawn baits"],
    tips: "Quiet Port Hacking arm, boat-friendly.",
    tipsCn: "霍金港安静支湾，适合小船。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "gymea-bay", name: "Gymea Bay", nameCn: "吉米亚湾",
    lat: -34.0420, lng: 151.0900, type: "estuary", baseScore: 68,
    species: ["Flathead", "Bream", "Whiting"],
    best: "Morning run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Nippers", "Soft plastics"],
    tips: "Inner Port Hacking, very sheltered.",
    tipsCn: "霍金港深处，极避风。",
    prefers: { calm: true, wind: ["any"] }
  },
  // ================== Hawkesbury / Pittwater ==================
  {
    id: "patonga", name: "Patonga Beach", nameCn: "帕通加海滩",
    lat: -33.5470, lng: 151.2720, type: "estuary", baseScore: 76,
    species: ["Flathead", "Bream", "Jewfish", "Tailor"],
    best: "Tide change at dawn.", bestCn: "清晨换潮最佳。",
    techniques: ["Live prawns", "Soft plastics"],
    tips: "Hawkesbury entrance — big flatties and jewfish.",
    tipsCn: "霍克斯伯里入口，大扁头与石首。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "bobbin-head", name: "Bobbin Head", nameCn: "波宾头",
    lat: -33.6570, lng: 151.1550, type: "estuary", baseScore: 73,
    species: ["Flathead", "Bream", "Jewfish"],
    best: "Run-out tide in deep channels.", bestCn: "深沟退潮最佳。",
    techniques: ["Live bait", "Soft plastics"],
    tips: "Ku-ring-gai Chase NP — pay park fee.",
    tipsCn: "库灵盖国家公园，需停车费。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "berowra-waters", name: "Berowra Waters", nameCn: "贝罗拉水域",
    lat: -33.6220, lng: 151.1450, type: "estuary", baseScore: 74,
    species: ["Flathead", "Bream", "Jewfish", "Tailor"],
    best: "Run-out tide.", bestCn: "退潮最佳。",
    techniques: ["Vibes", "Live mullet"],
    tips: "Deep river bends hold big jewfish.",
    tipsCn: "深弯有大石首鱼。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "flint-steel", name: "Flint & Steel Beach", nameCn: "火石与钢海滩",
    lat: -33.5620, lng: 151.2440, type: "estuary", baseScore: 75,
    species: ["Jewfish", "Flathead", "Bream"],
    best: "Night tide change.", bestCn: "夜间换潮最佳。",
    techniques: ["Live mullet", "Squid baits"],
    tips: "Boat access only — classic Hawkesbury jewfish hole.",
    tipsCn: "仅船可达，经典霍克斯伯里石首窝。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "church-point", name: "Church Point, Pittwater", nameCn: "教堂角 · 皮特沃特",
    lat: -33.6520, lng: 151.2830, type: "harbour", baseScore: 72,
    species: ["Squid", "Bream", "Flathead"],
    best: "Evening squid over weed.", bestCn: "傍晚海草床钓鱿最佳。",
    techniques: ["Squid jigs", "Plastics"],
    tips: "Ferry wharf — steady squid.",
    tipsCn: "渡轮码头，鱿鱼稳定。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "clareville", name: "Clareville Beach", nameCn: "克莱尔维尔海滩",
    lat: -33.6280, lng: 151.3090, type: "harbour", baseScore: 70,
    species: ["Whiting", "Flathead", "Bream"],
    best: "High tide sand flats.", bestCn: "高潮沙滩最佳。",
    techniques: ["Nippers", "Beach worms"],
    tips: "Pittwater sheltered beach, family-friendly.",
    tipsCn: "皮特沃特避风海滩，家庭友好。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "bayview", name: "Bayview Baths, Pittwater", nameCn: "海景泳池 · 皮特沃特",
    lat: -33.6600, lng: 151.3020, type: "harbour", baseScore: 69,
    species: ["Squid", "Bream"],
    best: "Evening squid.", bestCn: "傍晚钓鱿最佳。",
    techniques: ["Squid jigs"],
    tips: "Small jetty with seagrass beds.",
    tipsCn: "小码头，周边海草床。",
    prefers: { calm: true, wind: ["any"] }
  },

  // ================== East Coast · 热门高分岩钓平台 ==================
  {
    id: "hornby-light", name: "Hornby Lighthouse, South Head", nameCn: "霍恩比灯塔 · 南角",
    lat: -33.8330, lng: 151.2820, type: "rock", baseScore: 94,
    species: ["Kingfish", "Tailor", "Bonito", "Trevally", "Drummer"],
    best: "Dawn run-in tide. Live squid or yakkas.",
    bestCn: "清晨涨潮，用活鱿/小鲹最佳。",
    techniques: ["Live bait on balloon/float", "Metal slugs at sunrise", "Ganged pilchards for tailor"],
    tips: "Legendary land-based king platform. Deep water straight off the rocks. NEVER fish solo or in swell over 2m.",
    tipsCn: "传奇岸钓黄尾平台，岸边直接深水。涌浪 >2m 严禁，切勿单人作钓。",
    prefers: { calm: true, wind: ["W", "NW", "SW"] },
    preferredTide: "rising",
    rigNotes: {
      "Kingfish": "Hornby 传奇点要求顶配：PE6+80lb leader，章鱼钩 8/0。鱼咬后 3 秒内必须把头拉离礁石，慢半秒就缠线断掉。活鱿 >> 活 yakka。",
      "Bonito": "夏季清晨只有 30 分钟黄金窗口，炸水开始就全力抛铁板，动作越快越好。"
    }
  },
  {
    id: "the-gap-safe", name: "Dunbar Head (南角安全段)", nameCn: "邓巴角",
    lat: -33.8470, lng: 151.2830, type: "rock", baseScore: 82,
    species: ["Drummer", "Bream", "Groper", "Luderick"],
    best: "Winter drummer on cunjevoi.", bestCn: "冬季海鞘钓黑毛最佳。",
    techniques: ["Float rig", "Heavy cunjevoi bait"],
    tips: "Stay well back from the cliff edge. Fish only the lower safe ledges.",
    tipsCn: "远离悬崖边，仅在低位安全台作钓。",
    prefers: { calm: false, wind: ["W"] }
  },
  {
    id: "macquarie-light", name: "Macquarie Lighthouse", nameCn: "麦考瑞灯塔",
    lat: -33.8520, lng: 151.2830, type: "rock", baseScore: 83,
    species: ["Kingfish", "Tailor", "Drummer", "Bonito"],
    best: "Dawn; run-in tide; calm seas.", bestCn: "平静日清晨涨潮。",
    techniques: ["Live bait", "Metal slugs"],
    tips: "High platform; only access in calm conditions.",
    tipsCn: "高岩台，仅平静海况下前往。",
    prefers: { calm: true, wind: ["W", "NW"] }
  },
  {
    id: "diamond-bay", name: "Diamond Bay Rocks", nameCn: "钻石湾岩台",
    lat: -33.8680, lng: 151.2820, type: "rock", baseScore: 85,
    species: ["Kingfish", "Drummer", "Groper", "Bream"],
    best: "Dawn live bait. Calm only.", bestCn: "清晨活饵，仅平静日。",
    techniques: ["Live yakkas/slimies", "Red crab for groper"],
    tips: "Vaucluse cliff spot. Very popular with locals — take cleats and rope.",
    tipsCn: "沃克鲁斯悬崖点，本地热门；钉鞋+绳索必备。",
    prefers: { calm: true, wind: ["W", "NW"] }
  },
  {
    id: "dover-heights", name: "Dover Heights Cliffs", nameCn: "多佛高地岩礁",
    lat: -33.8790, lng: 151.2810, type: "rock", baseScore: 80,
    species: ["Drummer", "Bream", "Kingfish", "Groper"],
    best: "Winter drummer.", bestCn: "冬季黑毛最佳。",
    techniques: ["Cunjevoi", "Heavy float rig"],
    tips: "Access via Rodney Reserve. Long walk in.",
    tipsCn: "由罗德尼保留地步入，路程较远。",
    prefers: { calm: false, wind: ["W"] }
  },
  {
    id: "mackenzies-point", name: "Mackenzies Point, Bondi", nameCn: "麦肯齐角 · 邦迪",
    lat: -33.8970, lng: 151.2760, type: "rock", baseScore: 81,
    species: ["Kingfish", "Bream", "Drummer", "Tailor"],
    best: "Dawn on the run-in.", bestCn: "清晨涨潮最佳。",
    techniques: ["Live bait", "Pilchards"],
    tips: "Between Bondi & Tamarama — great kings on calm summer mornings.",
    tipsCn: "邦迪—塔玛拉玛间；夏季平静清晨多黄尾。",
    prefers: { calm: true, wind: ["W", "NW"] }
  },
  {
    id: "gordons-bay", name: "Gordons Bay", nameCn: "戈登湾",
    lat: -33.9110, lng: 151.2640, type: "rock", baseScore: 76,
    species: ["Bream", "Luderick", "Drummer", "Trevally"],
    best: "Incoming tide morning.", bestCn: "清晨涨潮最佳。",
    techniques: ["Float rig with weed", "Berley bread"],
    tips: "Protected bay between Clovelly & Coogee — very steady bream.",
    tipsCn: "克洛夫利与库吉间避风湾，黑鲷非常稳定。",
    prefers: { calm: true, wind: ["W", "SW"] }
  },
  {
    id: "shark-point-clovelly", name: "Shark Point, Clovelly", nameCn: "鲨角 · 克洛夫利",
    lat: -33.9160, lng: 151.2680, type: "rock", baseScore: 84,
    species: ["Kingfish", "Drummer", "Bream", "Groper"],
    best: "Dawn live bait; winter drummer.", bestCn: "清晨活饵；冬钓黑毛。",
    techniques: ["Live yakkas", "Cunjevoi for drummer", "Red crab for groper"],
    tips: "One of the most reliable east-coast land-based king spots.",
    tipsCn: "东海岸最稳定岸钓黄尾点之一。",
    prefers: { calm: true, wind: ["W", "NW", "SW"] },
    preferredTide: "rising",
    rigNotes: {
      "Kingfish": "比 Hornby 平缓，但仍需 PE4-5 + 60-80lb leader。清晨活饵+气球漂钓最稳，连续 3 个早上都可能开口。",
      "Drummer": "冬季高潮用海鞘，右侧岩缝是金窝。"
    }
  },
  {
    id: "lurline-bay", name: "Lurline Bay", nameCn: "卢尔琳湾",
    lat: -33.9350, lng: 151.2620, type: "rock", baseScore: 75,
    species: ["Bream", "Drummer", "Luderick"],
    best: "Morning run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Float rig", "Light bream setups"],
    tips: "Small protected bay, reliable winter session.",
    tipsCn: "小而避风，冬季稳定。",
    prefers: { calm: true, wind: ["W", "SW"] }
  },
  {
    id: "jew-hole", name: "Maroubra Jew Hole", nameCn: "马鲁巴石首鱼窝",
    lat: -33.9530, lng: 151.2610, type: "rock", baseScore: 86,
    species: ["Jewfish", "Drummer", "Bream", "Kingfish"],
    best: "Night tide change for jewfish.", bestCn: "夜间换潮钓石首鱼最佳。",
    techniques: ["Live squid/mullet", "Heavy running sinker rigs"],
    tips: "Legendary deep ledge at Maroubra. Heavy tackle and a headlamp.",
    tipsCn: "马鲁巴著名深岩台，粗线重钩+头灯。",
    prefers: { calm: false, wind: ["W"] },
    preferredTide: "change",
    rigNotes: {
      "Jewfish": "夜钓专场。活乌头或活 tailor 头部最优。走铅 8-10oz，leader 80lb+ 抗石缝磨损。设好拖曳、竿铃+夹子。"
    }
  },
  {
    id: "magic-point", name: "Magic Point, Maroubra", nameCn: "魔法角 · 马鲁巴",
    lat: -33.9570, lng: 151.2620, type: "rock", baseScore: 85,
    species: ["Kingfish", "Bonito", "Tailor", "Drummer"],
    best: "Dawn pelagics in summer.", bestCn: "夏季清晨钓洄游鱼。",
    techniques: ["Metal slugs", "Live bait"],
    tips: "Iconic headland with grey nurse sharks below — catch & release encouraged.",
    tipsCn: "标志性岬角，水下有灰护士鲨，鼓励放流。",
    prefers: { calm: true, wind: ["W", "NW"] },
    preferredTide: "rising",
    rigNotes: {
      "Bonito": "夏季 5-8AM 鲣鱼专场；铁板 40g 银蓝色最有效。",
      "Kingfish": "活饵+气球漂钓，leader 60lb；水下有灰护士鲨，尽量快收避免压力"
    }
  },
  {
    id: "boora-point", name: "Boora Point, Malabar", nameCn: "布拉角 · 马拉巴",
    lat: -33.9720, lng: 151.2540, type: "rock", baseScore: 82,
    species: ["Drummer", "Bream", "Groper", "Tailor"],
    best: "Winter drummer high tide.", bestCn: "冬季高潮钓黑毛。",
    techniques: ["Cunjevoi", "Bread for bream"],
    tips: "Walk-in platform, south of Malabar headland.",
    tipsCn: "马拉巴岬角南侧步入平台。",
    prefers: { calm: false, wind: ["W"] }
  },
  {
    id: "cape-banks", name: "Cape Banks, La Perouse", nameCn: "班克斯角 · 拉佩鲁兹",
    lat: -34.0000, lng: 151.2450, type: "rock", baseScore: 88,
    species: ["Kingfish", "Drummer", "Bonito", "Groper", "Tailor"],
    best: "Dawn live bait, run-in tide.", bestCn: "清晨活饵涨潮最佳。",
    techniques: ["Live yakkas/squid", "Metal slugs", "Red crab"],
    tips: "Walk across the land bridge at low tide. Long walk but worth it.",
    tipsCn: "低潮通过陆桥进入，路程长但值得。",
    prefers: { calm: true, wind: ["W", "NW", "SW"] },
    preferredTide: "rising",
    rigNotes: {
      "Kingfish": "一趟路程负重大，建议只带精简的 PE5 + 80lb leader 一套。活饵在途中用硬桶+氧气泵保活。",
      "Drummer": "冬季工作日人少，海鞘浮漂在北侧平台最稳。"
    }
  },
  {
    id: "henry-head", name: "Henry Head", nameCn: "亨利角",
    lat: -33.9990, lng: 151.2410, type: "rock", baseScore: 86,
    species: ["Kingfish", "Bonito", "Tailor", "Drummer", "Salmon"],
    best: "Dawn run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Metal slugs", "Live bait"],
    tips: "Famous for summer bonito blitzes on metals at sunrise.",
    tipsCn: "夏季清晨炮鱼群冲饵著名。",
    prefers: { calm: true, wind: ["W", "NW"] }
  },
  {
    id: "congwong", name: "Congwong Beach", nameCn: "孔旺海滩",
    lat: -33.9940, lng: 151.2310, type: "beach", baseScore: 72,
    species: ["Whiting", "Flathead", "Bream"],
    best: "High tide flats.", bestCn: "高潮沙滩最佳。",
    techniques: ["Nippers", "Beach worms"],
    tips: "Sheltered Botany Bay beach, family spot.",
    tipsCn: "植物湾内避风海滩，家庭友好。",
    prefers: { calm: true, wind: ["any"] }
  },
  {
    id: "frenchmans-bay", name: "Frenchmans Bay", nameCn: "法国人湾",
    lat: -33.9880, lng: 151.2330, type: "harbour", baseScore: 74,
    species: ["Bream", "Whiting", "Squid", "Flathead"],
    best: "Run-in tide morning.", bestCn: "清晨涨潮最佳。",
    techniques: ["Squid jigs", "Prawn baits"],
    tips: "Protected beach, good squid over weed beds.",
    tipsCn: "避风海滩，海草床鱿鱼良好。",
    prefers: { calm: true, wind: ["any"] }
  },

  // ================== Kurnell Peninsula · 顶级 land-based ==================
  {
    id: "inscription-point", name: "Inscription Point, Kurnell", nameCn: "铭文角 · 库内尔",
    lat: -34.0050, lng: 151.2270, type: "rock", baseScore: 88,
    species: ["Kingfish", "Bonito", "Tailor", "Drummer", "Salmon"],
    best: "Dawn live bait on run-in tide.", bestCn: "清晨涨潮活饵最佳。",
    techniques: ["Live yakkas", "Metal slugs", "Ganged pilchards"],
    tips: "Near Cook's landing place. Short walk, deep water close in.",
    tipsCn: "库克登陆地附近，步程短岸边即深水。",
    prefers: { calm: true, wind: ["W", "NW"] },
    preferredTide: "rising",
    rigNotes: {
      "Kingfish": "Kurnell 半岛最易达的 LBG 点，适合 LBG 初级玩家练手。活饵 + 气球漂钓最稳；leader 60lb 足够。"
    }
  },
  {
    id: "cape-baily", name: "Cape Baily", nameCn: "贝利角",
    lat: -34.0380, lng: 151.2290, type: "rock", baseScore: 85,
    species: ["Tailor", "Salmon", "Drummer", "Kingfish"],
    best: "Dawn metals.", bestCn: "清晨铁板最佳。",
    techniques: ["Metal slugs", "Gang-hook pilchards"],
    tips: "Walk from Cape Solander car park along coastal track.",
    tipsCn: "从索兰德角停车场沿海岸步道前往。",
    prefers: { calm: false, wind: ["W", "NW"] }
  },
  {
    id: "tabbagai", name: "Tabbagai Gap", nameCn: "塔巴盖峡",
    lat: -34.0460, lng: 151.2250, type: "rock", baseScore: 80,
    species: ["Drummer", "Bream", "Groper"],
    best: "Winter high tide with cunjevoi.", bestCn: "冬季高潮海鞘钓。",
    techniques: ["Float rig", "Red crab"],
    tips: "Kurnell back-beach ledge, exposed — check swell.",
    tipsCn: "库内尔后滩岩台，暴露，查涌浪。",
    prefers: { calm: false, wind: ["W"] }
  },
  {
    id: "potter-point", name: "Potter Point", nameCn: "波特角",
    lat: -34.0550, lng: 151.2030, type: "rock", baseScore: 84,
    species: ["Tailor", "Salmon", "Kingfish", "Bonito", "Drummer"],
    best: "Dawn metals; run-in tide.", bestCn: "清晨铁板涨潮最佳。",
    techniques: ["Metal slugs", "Live bait"],
    tips: "South Kurnell — classic pelagic platform, follow the coastal trail.",
    tipsCn: "南库内尔经典洄游鱼岩台，沿海岸小径前往。",
    prefers: { calm: false, wind: ["W", "NW"] }
  },
  {
    id: "boat-harbour-kurnell", name: "Boat Harbour, Kurnell", nameCn: "船湾 · 库内尔",
    lat: -34.0620, lng: 151.1960, type: "rock", baseScore: 83,
    species: ["Kingfish", "Tailor", "Drummer", "Salmon"],
    best: "Dawn with live bait.", bestCn: "清晨活饵最佳。",
    techniques: ["Live yakkas", "Metals"],
    tips: "Short 4WD access. Protected landing area.",
    tipsCn: "需越野车进入，登船平台避风。",
    prefers: { calm: true, wind: ["W", "NW"] }
  },
  {
    id: "voodoo-point", name: "Voodoo Point, Cronulla", nameCn: "伏都角 · 克罗努拉",
    lat: -34.0700, lng: 151.1700, type: "rock", baseScore: 82,
    species: ["Drummer", "Bream", "Tailor", "Groper"],
    best: "Winter high tide.", bestCn: "冬季高潮最佳。",
    techniques: ["Cunjevoi", "Float rigs"],
    tips: "Short walk from Bass & Flinders Point.",
    tipsCn: "由巴斯与弗林德斯角步入较近。",
    prefers: { calm: false, wind: ["W"] }
  },
  {
    id: "bass-flinders", name: "Bass & Flinders Point", nameCn: "巴斯与弗林德斯角",
    lat: -34.0720, lng: 151.1730, type: "rock", baseScore: 81,
    species: ["Kingfish", "Tailor", "Salmon", "Drummer"],
    best: "Dawn on incoming tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Live bait", "Metal slugs"],
    tips: "Cronulla south point, easy parking at lookout.",
    tipsCn: "克罗努拉南角，观景台停车方便。",
    prefers: { calm: true, wind: ["W", "NW"] }
  },
  {
    id: "shelly-headland", name: "Shelly Headland, Cronulla", nameCn: "谢利岬 · 克罗努拉",
    lat: -34.0680, lng: 151.1620, type: "rock", baseScore: 78,
    species: ["Drummer", "Bream", "Luderick"],
    best: "Winter drummer on cunje.", bestCn: "冬季黑毛最佳。",
    techniques: ["Float rig", "Cunjevoi baits"],
    tips: "Easy walk-in from Cronulla Esplanade.",
    tipsCn: "由克罗努拉海滨路步行可达。",
    prefers: { calm: false, wind: ["W"] }
  },
  {
    id: "jibbon-head", name: "Jibbon Head, Bundeena", nameCn: "吉本角 · 邦德纳",
    lat: -34.0820, lng: 151.1680, type: "rock", baseScore: 83,
    species: ["Drummer", "Kingfish", "Tailor", "Groper"],
    best: "Dawn and winter high tide.", bestCn: "清晨与冬季高潮最佳。",
    techniques: ["Live bait", "Cunjevoi"],
    tips: "Enter via Bundeena, walk the Jibbon loop. Royal NP park pass.",
    tipsCn: "由邦德纳进入，需皇家国家公园通行证。",
    prefers: { calm: true, wind: ["W", "NW"] }
  },

  // ================== Northern Beaches 补充 ==================
  {
    id: "barrenjoey", name: "Barrenjoey Headland", nameCn: "巴伦乔伊岬",
    lat: -33.5800, lng: 151.3340, type: "rock", baseScore: 86,
    species: ["Kingfish", "Tailor", "Bonito", "Drummer", "Salmon"],
    best: "Dawn run-in tide, calm seas.", bestCn: "平静日清晨涨潮最佳。",
    techniques: ["Live squid/yakkas", "Metal slugs"],
    tips: "Most northern Sydney headland. Long walk to lighthouse platforms.",
    tipsCn: "悉尼最北岬角，到灯塔平台路程较长。",
    prefers: { calm: true, wind: ["W", "NW"] },
    preferredTide: "rising",
    rigNotes: {
      "Kingfish": "走路远，装备精简为王：一根 PE5 + 80lb leader 一套，活饵桶。气球漂钓优先，因为位置高。"
    }
  },
  {
    id: "north-avalon", name: "North Avalon Headland", nameCn: "北阿瓦隆岬角",
    lat: -33.6250, lng: 151.3380, type: "rock", baseScore: 80,
    species: ["Kingfish", "Drummer", "Tailor", "Bream"],
    best: "Dawn with live bait.", bestCn: "清晨活饵最佳。",
    techniques: ["Live yakkas", "Metal slugs"],
    tips: "Summer kings chase bait along the wash.",
    tipsCn: "夏季黄尾沿浪花追饵。",
    prefers: { calm: true, wind: ["W", "NW"] }
  },
  {
    id: "bilgola-head", name: "Bilgola Head", nameCn: "比尔戈拉岬",
    lat: -33.6430, lng: 151.3290, type: "rock", baseScore: 76,
    species: ["Drummer", "Bream", "Groper", "Luderick"],
    best: "Winter drummer.", bestCn: "冬季黑毛最佳。",
    techniques: ["Cunjevoi", "Float rig"],
    tips: "Access from Bilgola Beach north end.",
    tipsCn: "由比尔戈拉海滩北端进入。",
    prefers: { calm: false, wind: ["W"] }
  },
  {
    id: "newport-reef", name: "Newport Reef", nameCn: "纽波特礁",
    lat: -33.6580, lng: 151.3260, type: "rock", baseScore: 78,
    species: ["Tailor", "Salmon", "Drummer", "Bream"],
    best: "Dawn with metals.", bestCn: "清晨用铁板最佳。",
    techniques: ["Metals", "Pilchards"],
    tips: "Access via Newport Beach south end at low tide.",
    tipsCn: "低潮由纽波特海滩南端进入。",
    prefers: { calm: false, wind: ["W"] }
  },
  {
    id: "warriewood-head", name: "Warriewood Headland", nameCn: "瓦里伍德岬",
    lat: -33.6900, lng: 151.3080, type: "rock", baseScore: 74,
    species: ["Drummer", "Bream", "Tailor"],
    best: "Winter high tide.", bestCn: "冬季高潮最佳。",
    techniques: ["Cunjevoi", "Float rig"],
    tips: "Walk-in from Warriewood Beach.",
    tipsCn: "由瓦里伍德海滩步入。",
    prefers: { calm: false, wind: ["W"] }
  },
  {
    id: "queenscliff-bombora", name: "Queenscliff Bombora", nameCn: "昆斯克利夫暗礁",
    lat: -33.7780, lng: 151.2930, type: "rock", baseScore: 79,
    species: ["Tailor", "Salmon", "Kingfish", "Drummer"],
    best: "Dawn on calm days.", bestCn: "平静日清晨最佳。",
    techniques: ["Metal slugs", "Live bait"],
    tips: "Between Freshwater & Queenscliff. Watch sets — washy spot.",
    tipsCn: "淡水湾与昆斯克利夫间，浪涌明显。",
    prefers: { calm: true, wind: ["W"] }
  },
  {
    id: "freshwater-head", name: "Freshwater Headland", nameCn: "淡水湾岬",
    lat: -33.7820, lng: 151.2940, type: "rock", baseScore: 77,
    species: ["Drummer", "Bream", "Tailor", "Luderick"],
    best: "Winter drummer on the high tide.", bestCn: "冬季高潮钓黑毛。",
    techniques: ["Cunjevoi", "Light float rig"],
    tips: "Easy access from pool end of Freshwater Beach.",
    tipsCn: "从淡水湾泳池端易达。",
    prefers: { calm: false, wind: ["W"] }
  },
  {
    id: "north-curl-curl", name: "North Curl Curl Headland", nameCn: "北卷卷岬",
    lat: -33.7690, lng: 151.3030, type: "rock", baseScore: 78,
    species: ["Drummer", "Bream", "Tailor", "Groper"],
    best: "Winter cunjevoi session.", bestCn: "冬季海鞘作钓。",
    techniques: ["Float rig with cunje", "Red crab"],
    tips: "Good mix of drummer and groper in winter.",
    tipsCn: "冬季黑毛与隆头鱼兼得。",
    prefers: { calm: false, wind: ["W"] }
  },
  {
    id: "long-reef-west", name: "Long Reef Aquatic Reserve (west)", nameCn: "长礁水生保护区 · 西侧",
    lat: -33.7470, lng: 151.3100, type: "rock", baseScore: 80,
    species: ["Drummer", "Bream", "Luderick", "Trevally"],
    best: "Run-in tide morning.", bestCn: "清晨涨潮最佳。",
    techniques: ["Float rigs", "Berley"],
    tips: "NOTE: Parts are no-take aquatic reserve. Check current zoning before keeping fish.",
    tipsCn: "部分为禁捕区，请查询最新分区规定。",
    prefers: { calm: true, wind: ["W"] }
  },
  {
    id: "dee-why-headland", name: "Dee Why Headland", nameCn: "迪威岬",
    lat: -33.7560, lng: 151.3030, type: "rock", baseScore: 75,
    species: ["Drummer", "Bream", "Tailor"],
    best: "Winter high tide.", bestCn: "冬季高潮最佳。",
    techniques: ["Cunjevoi", "Pilchards"],
    tips: "Walk from Dee Why Point south.",
    tipsCn: "由迪威角南行步入。",
    prefers: { calm: false, wind: ["W"] }
  },

  // ==================== Sydney 补充名点 ====================
  {
    id: "cockatoo-island", name: "Cockatoo Island", nameCn: "凤头鹦鹉岛",
    lat: -33.8475, lng: 151.1710, type: "harbour", baseScore: 72,
    species: ["Bream", "Flathead", "Squid", "Trevally"],
    best: "Run-in tide.", bestCn: "涨潮最佳。",
    techniques: ["Prawn baits", "Squid jigs"],
    tips: "World Heritage site, reach by ferry F3/F8.",
    tipsCn: "世界遗产岛，F3/F8 渡轮可达。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "mcmahons-point", name: "McMahons Point", nameCn: "麦克马洪角",
    lat: -33.8460, lng: 151.2040, type: "harbour", baseScore: 71,
    species: ["Bream", "Kingfish", "Squid"],
    best: "Early morning.", bestCn: "清晨最佳。",
    techniques: ["Squid jigs", "Unweighted prawns"],
    tips: "Ferry wharf under the Harbour Bridge.",
    tipsCn: "大桥下方的渡轮码头。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "darling-harbour", name: "Darling Harbour", nameCn: "达令港",
    lat: -33.8730, lng: 151.2010, type: "harbour", baseScore: 66,
    species: ["Bream", "Squid"],
    best: "Night under lights.", bestCn: "夜间灯下最佳。",
    techniques: ["Squid jigs", "Prawn baits"],
    tips: "CBD waterfront, tourist area. Fish at specific allowed zones only.",
    tipsCn: "CBD 水岸旅游区，只能在允许区域作钓。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "any"
  },
  {
    id: "fort-denison-area", name: "Mrs Macquarie Point (around Fort Denison)", nameCn: "麦考瑞夫人角 · 观 Fort Denison",
    lat: -33.8610, lng: 151.2230, type: "harbour", baseScore: 70,
    species: ["Bream", "Flathead", "Squid", "Trevally"],
    best: "Dawn/dusk.", bestCn: "晨昏最佳。",
    techniques: ["Soft plastics", "Prawn baits"],
    tips: "Scenic, easy walk from city.",
    tipsCn: "风景优美，市区步行可达。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "rodd-point", name: "Rodd Point", nameCn: "罗德角",
    lat: -33.8650, lng: 151.1450, type: "estuary", baseScore: 68,
    species: ["Flathead", "Bream", "Whiting"],
    best: "Run-out tide on flats.", bestCn: "退潮沙滩最佳。",
    techniques: ["Soft plastics", "Nippers"],
    tips: "Parramatta River sheltered bay.",
    tipsCn: "帕拉玛塔河避风湾。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "falling"
  },
  {
    id: "iron-cove-bridge", name: "Iron Cove Bridge", nameCn: "铁湾桥",
    lat: -33.8640, lng: 151.1530, type: "estuary", baseScore: 67,
    species: ["Bream", "Flathead", "Tailor"],
    best: "Run-in tide dawn.", bestCn: "清晨涨潮最佳。",
    techniques: ["Soft plastics along pylons", "Prawn baits"],
    tips: "Bridge pylons are bream magnets.",
    tipsCn: "桥墩是黑鲷磁铁。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "gladesville-bridge", name: "Gladesville Bridge", nameCn: "格拉德斯维尔桥",
    lat: -33.8380, lng: 151.1470, type: "estuary", baseScore: 69,
    species: ["Bream", "Flathead", "Jewfish"],
    best: "Run-out tide night.", bestCn: "夜间退潮最佳。",
    techniques: ["Soft plastics", "Live bait"],
    tips: "Parramatta River deepest section under the bridge.",
    tipsCn: "帕拉玛塔河桥下最深段。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "change"
  },
  {
    id: "parramatta-wharf", name: "Parramatta Wharf", nameCn: "帕拉玛塔码头",
    lat: -33.8185, lng: 151.0040, type: "estuary", baseScore: 64,
    species: ["Bream", "Flathead"],
    best: "Run-out tide.", bestCn: "退潮最佳。",
    techniques: ["Prawn baits", "Plastics"],
    tips: "Follow EPA fish consumption advisory for upstream Parramatta.",
    tipsCn: "遵循帕拉玛塔上游 EPA 食用警告。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "falling"
  },
  {
    id: "homebush-bay", name: "Homebush Bay", nameCn: "家园湾",
    lat: -33.8370, lng: 151.0780, type: "estuary", baseScore: 62,
    species: ["Flathead", "Bream"],
    best: "Run-out tide.", bestCn: "退潮最佳。",
    techniques: ["Soft plastics"],
    tips: "NOTE: EPA fishing ban/warning for dioxin in this area — check rules before keeping.",
    tipsCn: "⚠️ 此区有二噁英污染警示，禁止留鱼，请查询最新法规。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "falling"
  },
  {
    id: "forty-baskets", name: "Forty Baskets Beach", nameCn: "四十篮海滩",
    lat: -33.8010, lng: 151.2650, type: "harbour", baseScore: 70,
    species: ["Bream", "Whiting", "Squid", "Flathead"],
    best: "High tide on flats.", bestCn: "高潮沙滩最佳。",
    techniques: ["Nippers", "Squid jigs"],
    tips: "Protected Manly-side beach, family-friendly.",
    tipsCn: "曼利一侧避风滩，家庭友好。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "high"
  },
  {
    id: "castle-rock", name: "Castle Rock, Middle Head", nameCn: "城堡岩 · 中头",
    lat: -33.8220, lng: 151.2610, type: "harbour", baseScore: 74,
    species: ["Kingfish", "Squid", "Bream"],
    best: "Dawn run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Live bait", "Squid jigs"],
    tips: "Short walk from road, quieter than Middle Head proper.",
    tipsCn: "路边短步行可达，比 Middle Head 更安静。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "fairlight-beach", name: "Fairlight Beach", nameCn: "费尔莱特海滩",
    lat: -33.8020, lng: 151.2750, type: "harbour", baseScore: 68,
    species: ["Bream", "Whiting", "Squid"],
    best: "High tide.", bestCn: "高潮最佳。",
    techniques: ["Nippers", "Prawn baits"],
    tips: "Very sheltered, tide pool nearby.",
    tipsCn: "避风极佳，附近有潮汐池。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "high"
  },
  {
    id: "wylies-baths", name: "Wylie's Baths, Coogee", nameCn: "怀利浴场 · 库吉",
    lat: -33.9240, lng: 151.2620, type: "rock", baseScore: 74,
    species: ["Bream", "Drummer", "Luderick", "Groper"],
    best: "Incoming tide morning.", bestCn: "清晨涨潮最佳。",
    techniques: ["Float rig", "Cunjevoi"],
    tips: "Historic ocean pool nearby; rocks are gentle platform.",
    tipsCn: "旁边是历史海水泳池；岩台平缓易钓。",
    prefers: { calm: true, wind: ["W", "SW"] },
    preferredTide: "rising"
  },
  {
    id: "bondi-icebergs", name: "Bondi Icebergs Rocks", nameCn: "邦迪冰山岩台",
    lat: -33.8935, lng: 151.2760, type: "rock", baseScore: 75,
    species: ["Drummer", "Bream", "Luderick"],
    best: "Winter drummer.", bestCn: "冬季黑毛最佳。",
    techniques: ["Cunjevoi float", "Light bream rigs"],
    tips: "Next to the iconic Icebergs Pool; gentle platform.",
    tipsCn: "邻近标志性的冰山泳池，岩台平缓。",
    prefers: { calm: false, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "south-curl-curl-pool", name: "South Curl Curl Pool Rocks", nameCn: "南卷卷泳池岩区",
    lat: -33.7760, lng: 151.2990, type: "rock", baseScore: 72,
    species: ["Bream", "Drummer", "Luderick"],
    best: "Morning high tide.", bestCn: "清晨高潮最佳。",
    techniques: ["Light float rigs"],
    tips: "Adjacent to ocean pool, family accessible.",
    tipsCn: "邻海水泳池，家庭友好易达。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "high"
  },

  // ==================== Central Coast 中海岸（桥接 Sydney-Newcastle）====================
  {
    id: "terrigal-haven", name: "Terrigal Haven, Central Coast", nameCn: "特里哥港湾 · 中海岸",
    lat: -33.4430, lng: 151.4530, type: "rock", baseScore: 82,
    species: ["Kingfish", "Tailor", "Drummer", "Bream"],
    best: "Dawn live bait.", bestCn: "清晨活饵最佳。",
    techniques: ["Live yakkas", "Metal slugs"],
    tips: "Famous Central Coast LBG platform.",
    tipsCn: "中海岸知名 LBG 平台。",
    prefers: { calm: true, wind: ["W", "NW"] },
    preferredTide: "rising"
  },
  {
    id: "the-entrance", name: "The Entrance, Tuggerah Lake", nameCn: "入口 · 塔格拉湖",
    lat: -33.3400, lng: 151.5020, type: "estuary", baseScore: 78,
    species: ["Flathead", "Bream", "Whiting", "Jewfish"],
    best: "Run-out tide at the channel.", bestCn: "水道退潮最佳。",
    techniques: ["Soft plastics", "Live nippers"],
    tips: "Lake-ocean channel, famous for jewfish at night.",
    tipsCn: "湖海相连的水道，夜钓石首鱼著名。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "falling"
  },
  {
    id: "avoca-rocks", name: "Avoca Beach Rocks", nameCn: "阿沃卡海滩岩台",
    lat: -33.4670, lng: 151.4370, type: "rock", baseScore: 76,
    species: ["Tailor", "Salmon", "Drummer", "Bream"],
    best: "Dawn/dusk.", bestCn: "晨昏最佳。",
    techniques: ["Pilchards gang hooks", "Metal slugs"],
    tips: "Walk from Avoca Beach south end.",
    tipsCn: "由阿沃卡海滩南端步入。",
    prefers: { calm: false, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "norah-head", name: "Norah Head Lighthouse", nameCn: "诺拉角灯塔",
    lat: -33.2820, lng: 151.5780, type: "rock", baseScore: 85,
    species: ["Kingfish", "Tailor", "Drummer", "Salmon", "Bonito"],
    best: "Dawn run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Live bait", "Metal slugs", "Float rigs"],
    tips: "Legendary Central Coast LBG headland. Exposed — check swell.",
    tipsCn: "中海岸传奇 LBG 岬角。平台暴露，下竿前查涌浪。",
    prefers: { calm: true, wind: ["W", "NW"] },
    preferredTide: "rising"
  },

  // ==================== Newcastle & Hunter Region ====================
  {
    id: "nobbys-head", name: "Nobbys Head, Newcastle", nameCn: "诺比角 · 纽卡斯尔",
    lat: -32.9180, lng: 151.8000, type: "rock", baseScore: 88,
    species: ["Kingfish", "Tailor", "Salmon", "Bream", "Drummer"],
    best: "Dawn run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Live yakkas", "Metal slugs", "Ganged pilchards"],
    tips: "Newcastle's most famous land-based spot. Long breakwater + headland combo.",
    tipsCn: "纽卡斯尔最著名岸钓点，长防波堤 + 岬角组合。",
    prefers: { calm: true, wind: ["W", "NW", "SW"] },
    preferredTide: "rising"
  },
  {
    id: "newcastle-breakwater", name: "Newcastle Harbour Breakwater", nameCn: "纽卡斯尔港防波堤",
    lat: -32.9270, lng: 151.7900, type: "rock", baseScore: 84,
    species: ["Tailor", "Salmon", "Bream", "Jewfish", "Kingfish"],
    best: "Dawn/dusk run-in tide.", bestCn: "晨昏涨潮最佳。",
    techniques: ["Live bait", "Soft plastics along blocks"],
    tips: "Long walkable breakwater, reliable jewfish at night.",
    tipsCn: "可步行长防波堤，夜钓石首鱼稳定。",
    prefers: { calm: true, wind: ["W", "NW"] },
    preferredTide: "change"
  },
  {
    id: "stockton-beach", name: "Stockton Beach", nameCn: "斯托克顿海滩",
    lat: -32.9090, lng: 151.7870, type: "beach", baseScore: 82,
    species: ["Salmon", "Tailor", "Whiting", "Jewfish", "Flathead"],
    best: "Dawn in gutters.", bestCn: "清晨冲沟最佳。",
    techniques: ["Gang hooks pilchards", "Beach worms"],
    tips: "32km long beach — Australia's longest ocean beach. Endless gutters.",
    tipsCn: "澳洲最长海岸沙滩，绵延 32 公里冲沟众多。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "merewether-baths", name: "Merewether Ocean Baths", nameCn: "梅雷维瑟海水泳池岩区",
    lat: -32.9470, lng: 151.7630, type: "rock", baseScore: 76,
    species: ["Drummer", "Bream", "Tailor", "Luderick"],
    best: "Winter high tide.", bestCn: "冬季高潮最佳。",
    techniques: ["Cunjevoi float", "Light bream rigs"],
    tips: "Next to historic ocean baths, gentle platform.",
    tipsCn: "紧邻历史海水泳池，岩台平缓。",
    prefers: { calm: false, wind: ["W"] },
    preferredTide: "high"
  },
  {
    id: "bar-beach-newcastle", name: "Bar Beach, Newcastle", nameCn: "巴尔海滩 · 纽卡斯尔",
    lat: -32.9420, lng: 151.7680, type: "beach", baseScore: 75,
    species: ["Salmon", "Tailor", "Whiting"],
    best: "Dawn gutters.", bestCn: "清晨冲沟最佳。",
    techniques: ["Pilchards gangs", "Beach worms"],
    tips: "City beach with easy access.",
    tipsCn: "市区海滩，交通便利。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "redhead-beach", name: "Redhead Beach", nameCn: "红头海滩",
    lat: -33.0130, lng: 151.7180, type: "beach", baseScore: 77,
    species: ["Salmon", "Tailor", "Jewfish", "Whiting"],
    best: "Night for jewfish.", bestCn: "夜钓石首鱼最佳。",
    techniques: ["Live squid", "Beach worms"],
    tips: "Wild beach south of Newcastle, famous for big jewfish at night.",
    tipsCn: "纽卡斯尔南端野海滩，夜钓大石首鱼著名。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "change"
  },
  {
    id: "catherine-hill-bay", name: "Catherine Hill Bay", nameCn: "凯瑟琳山湾",
    lat: -33.1590, lng: 151.6340, type: "beach", baseScore: 76,
    species: ["Salmon", "Tailor", "Jewfish", "Bream"],
    best: "Dawn/dusk gutters.", bestCn: "晨昏冲沟最佳。",
    techniques: ["Pilchards", "Live squid"],
    tips: "Historic mining jetty area, sheltered bay.",
    tipsCn: "历史采矿码头区，避风湾。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "swansea-channel", name: "Swansea Channel", nameCn: "斯旺西水道",
    lat: -33.0840, lng: 151.6470, type: "estuary", baseScore: 84,
    species: ["Flathead", "Bream", "Whiting", "Jewfish", "Tailor"],
    best: "Run-out tide.", bestCn: "退潮最佳。",
    techniques: ["Soft plastics", "Live bait"],
    tips: "Lake Macquarie's only ocean outlet — flow funnels baitfish and predators.",
    tipsCn: "麦考瑞湖通海唯一出口，饵鱼和掠食鱼集中通道。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "falling"
  },
  {
    id: "lake-macquarie-marmong", name: "Marmong Point, Lake Macquarie", nameCn: "马蒙角 · 麦考瑞湖",
    lat: -32.9610, lng: 151.6500, type: "estuary", baseScore: 74,
    species: ["Flathead", "Bream", "Whiting"],
    best: "Dawn/dusk.", bestCn: "晨昏最佳。",
    techniques: ["Soft plastics", "Nippers"],
    tips: "Largest coastal saltwater lake in Australia, boat or shore.",
    tipsCn: "澳洲最大的沿海咸水湖，船钓/岸钓皆宜。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "falling"
  },
  {
    id: "soldiers-point", name: "Soldiers Point, Port Stephens", nameCn: "士兵角 · 史蒂芬港",
    lat: -32.7120, lng: 152.0700, type: "estuary", baseScore: 82,
    species: ["Flathead", "Bream", "Whiting", "Kingfish", "Squid"],
    best: "Run-in tide morning.", bestCn: "清晨涨潮最佳。",
    techniques: ["Soft plastics", "Squid jigs", "Live bait for kings"],
    tips: "Port Stephens deep water close to shore, summer kingfish.",
    tipsCn: "史蒂芬港深水近岸，夏季黄尾鰤。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "shoal-bay", name: "Shoal Bay, Port Stephens", nameCn: "浅湾 · 史蒂芬港",
    lat: -32.7170, lng: 152.1760, type: "beach", baseScore: 76,
    species: ["Whiting", "Flathead", "Bream"],
    best: "High tide.", bestCn: "高潮最佳。",
    techniques: ["Beach worms", "Nippers"],
    tips: "Calm Port Stephens beach, family-friendly.",
    tipsCn: "史蒂芬港平静沙滩，家庭友好。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "high"
  },
  {
    id: "fingal-spit", name: "Fingal Spit", nameCn: "芬高沙嘴",
    lat: -32.7450, lng: 152.1830, type: "beach", baseScore: 80,
    species: ["Salmon", "Tailor", "Whiting", "Jewfish"],
    best: "Dawn run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Live bait", "Pilchards"],
    tips: "Unique sand spit separating ocean and bay — walk-in only at low tide.",
    tipsCn: "隔开海湾的独特沙嘴，低潮步行可达。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "boat-harbour-pt-stephens", name: "Boat Harbour, Port Stephens", nameCn: "船湾 · 史蒂芬港",
    lat: -32.7620, lng: 152.1330, type: "rock", baseScore: 85,
    species: ["Kingfish", "Drummer", "Snapper", "Tailor"],
    best: "Dawn live bait.", bestCn: "清晨活饵最佳。",
    techniques: ["Live bait", "Soft plastics on the ledges"],
    tips: "Famous Port Stephens LBG platform. 4WD or long walk-in.",
    tipsCn: "史蒂芬港著名 LBG 平台，需要 4WD 或长步行进入。",
    prefers: { calm: true, wind: ["W", "NW"] },
    preferredTide: "rising"
  },

  // ==================== Wollongong & Illawarra Region ====================
  {
    id: "sandon-point", name: "Sandon Point, Bulli", nameCn: "桑顿角 · 布利",
    lat: -34.3360, lng: 150.9230, type: "rock", baseScore: 84,
    species: ["Kingfish", "Tailor", "Drummer", "Salmon", "Bonito"],
    best: "Dawn run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Live bait", "Metal slugs"],
    tips: "Illawarra's most famous LBG platform. Exposed — check swell.",
    tipsCn: "伊拉瓦拉最著名 LBG 岬角；暴露，务必查涌浪。",
    prefers: { calm: true, wind: ["W", "NW"] },
    preferredTide: "rising"
  },
  {
    id: "hill-60", name: "Hill 60 / Red Point", nameCn: "60 号山 · 红角",
    lat: -34.4790, lng: 150.9080, type: "rock", baseScore: 82,
    species: ["Drummer", "Bream", "Groper", "Kingfish"],
    best: "Winter high tide for drummer.", bestCn: "冬季高潮钓黑毛最佳。",
    techniques: ["Cunjevoi float", "Red crab for groper"],
    tips: "Port Kembla headland, WWII history site.",
    tipsCn: "肯布拉港岬角，二战历史遗址。",
    prefers: { calm: false, wind: ["W"] },
    preferredTide: "high"
  },
  {
    id: "port-kembla-breakwater", name: "Port Kembla Breakwater", nameCn: "肯布拉港防波堤",
    lat: -34.4650, lng: 150.9130, type: "rock", baseScore: 79,
    species: ["Tailor", "Salmon", "Bream", "Jewfish", "Kingfish"],
    best: "Dawn/dusk.", bestCn: "晨昏最佳。",
    techniques: ["Metals", "Live bait"],
    tips: "Long walkable breakwater in industrial harbour.",
    tipsCn: "工业港内的长防波堤。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "windang-island", name: "Windang Island", nameCn: "温丹岛",
    lat: -34.5300, lng: 150.8830, type: "rock", baseScore: 78,
    species: ["Kingfish", "Tailor", "Drummer", "Bream"],
    best: "Dawn live bait.", bestCn: "清晨活饵最佳。",
    techniques: ["Live yakkas", "Cunjevoi"],
    tips: "Walk across at low tide to the island, then fish the ocean side.",
    tipsCn: "低潮步行上岛，然后钓外海一侧。",
    prefers: { calm: true, wind: ["W", "NW"] },
    preferredTide: "rising"
  },
  {
    id: "bass-point", name: "Bass Point, Shellharbour", nameCn: "巴斯角 · 贝壳港",
    lat: -34.5960, lng: 150.8960, type: "rock", baseScore: 85,
    species: ["Kingfish", "Tailor", "Drummer", "Groper", "Bonito"],
    best: "Dawn live bait run-in.", bestCn: "清晨活饵涨潮最佳。",
    techniques: ["Live bait", "Metals", "Red crab for groper"],
    tips: "Illawarra top LBG headland, aquatic reserve — some zones are no-take.",
    tipsCn: "伊拉瓦拉顶级 LBG 岬角；水生保护区，部分区域禁捕。",
    prefers: { calm: true, wind: ["W", "NW"] },
    preferredTide: "rising"
  },
  {
    id: "bellambi-reef", name: "Bellambi Reef", nameCn: "贝兰比礁",
    lat: -34.3730, lng: 150.9210, type: "rock", baseScore: 76,
    species: ["Drummer", "Bream", "Tailor", "Luderick"],
    best: "Morning run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Cunjevoi float", "Light bream rig"],
    tips: "Rock reef accessible at low tide.",
    tipsCn: "低潮时可步行的礁石区。",
    prefers: { calm: false, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "austinmer-rocks", name: "Austinmer Rocks", nameCn: "奥斯汀米尔岩台",
    lat: -34.3040, lng: 150.9380, type: "rock", baseScore: 75,
    species: ["Drummer", "Bream", "Tailor"],
    best: "Winter high tide.", bestCn: "冬季高潮最佳。",
    techniques: ["Cunjevoi", "Light float rigs"],
    tips: "Quiet Illawarra platform.",
    tipsCn: "伊拉瓦拉安静平台。",
    prefers: { calm: false, wind: ["W"] },
    preferredTide: "high"
  },
  {
    id: "thirroul-rocks", name: "Thirroul Beach Rocks", nameCn: "瑟罗海滩岩区",
    lat: -34.3150, lng: 150.9280, type: "rock", baseScore: 73,
    species: ["Bream", "Drummer", "Luderick"],
    best: "Morning run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Light float rigs"],
    tips: "Accessible from Thirroul beach south end.",
    tipsCn: "由瑟罗海滩南端进入。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "minnamurra-river", name: "Minnamurra River Mouth", nameCn: "米娜穆拉河口",
    lat: -34.6370, lng: 150.8570, type: "estuary", baseScore: 78,
    species: ["Flathead", "Bream", "Whiting", "Jewfish"],
    best: "Run-out tide.", bestCn: "退潮最佳。",
    techniques: ["Soft plastics", "Live nippers"],
    tips: "Pristine Illawarra estuary, famous for flathead and jewfish.",
    tipsCn: "伊拉瓦拉纯净河口，扁头和石首鱼著名。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "falling"
  },
  {
    id: "kiama-blowhole", name: "Kiama Blowhole Point", nameCn: "基亚马喷水洞角",
    lat: -34.6720, lng: 150.8620, type: "rock", baseScore: 79,
    species: ["Drummer", "Bream", "Kingfish", "Tailor"],
    best: "Calm days dawn.", bestCn: "平静日清晨最佳。",
    techniques: ["Live bait", "Cunjevoi"],
    tips: "Tourist area, stay clear of blowhole spray zone.",
    tipsCn: "旅游景区，远离喷水洞危险区。",
    prefers: { calm: true, wind: ["W", "NW"] },
    preferredTide: "rising"
  },
  {
    id: "werri-beach", name: "Werri Beach / Gerringong", nameCn: "威里海滩 · 吉灵贡",
    lat: -34.7450, lng: 150.8370, type: "beach", baseScore: 74,
    species: ["Salmon", "Tailor", "Whiting", "Bream"],
    best: "Dawn/dusk gutters.", bestCn: "晨昏冲沟最佳。",
    techniques: ["Pilchards", "Beach worms"],
    tips: "Quiet Illawarra beach south of Kiama.",
    tipsCn: "基亚马南侧安静海滩。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },

  // ==================== Sydney Harbour 港内补充 ====================
  {
    id: "lady-martins-beach", name: "Lady Martins Beach, Point Piper", nameCn: "马丁女士海滩 · 派珀角",
    lat: -33.8700, lng: 151.2630, type: "harbour", baseScore: 68,
    species: ["Bream", "Whiting", "Flathead", "Squid"],
    best: "High tide flats.", bestCn: "高潮沙滩最佳。",
    techniques: ["Nippers", "Unweighted prawns"],
    tips: "Exclusive harbour pocket beach, quiet on weekdays.",
    tipsCn: "高档住宅区内的小海滩，工作日极安静。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "high"
  },
  {
    id: "milk-beach", name: "Milk Beach, Hermitage Foreshore", nameCn: "牛奶海滩 · 艾米特基岸线",
    lat: -33.8680, lng: 151.2690, type: "harbour", baseScore: 71,
    species: ["Bream", "Flathead", "Squid", "Trevally"],
    best: "Dawn run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Squid jigs", "Prawn baits"],
    tips: "Scenic spot on Hermitage Foreshore Walk, rocks and small beach.",
    tipsCn: "艾米特基步道上风景极美的岩礁+小海滩组合。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "hermitage-rocks", name: "Hermitage Foreshore Rocks", nameCn: "艾米特基岸线岩区",
    lat: -33.8660, lng: 151.2720, type: "harbour", baseScore: 72,
    species: ["Bream", "Squid", "Luderick"],
    best: "Morning run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Float rig", "Squid jigs"],
    tips: "Walk-in only, no road access — reward is solitude.",
    tipsCn: "仅步行可达，换来的是无人的安静。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "bottle-glass", name: "Bottle & Glass Rocks, Vaucluse", nameCn: "瓶与杯岩 · 沃克鲁斯",
    lat: -33.8430, lng: 151.2790, type: "harbour", baseScore: 80,
    species: ["Kingfish", "Squid", "Bream", "Trevally"],
    best: "Dawn run-in with live bait.", bestCn: "清晨涨潮活饵最佳。",
    techniques: ["Live yakkas", "Squid jigs over weed"],
    tips: "Harbour kingfish haunt, near Watsons Bay.",
    tipsCn: "华生湾附近的港内黄尾常客点。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "lady-bay", name: "Lady Bay Beach, South Head", nameCn: "女士湾 · 南角",
    lat: -33.8360, lng: 151.2810, type: "harbour", baseScore: 74,
    species: ["Bream", "Squid", "Trevally", "Whiting"],
    best: "Run-in tide morning.", bestCn: "清晨涨潮最佳。",
    techniques: ["Prawns", "Squid jigs"],
    tips: "Small harbour beach below South Head cliffs (clothing-optional).",
    tipsCn: "南角悬崖下的小海滩（天体海滩），请注意礼仪。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "clifton-gardens", name: "Clifton Gardens Wharf", nameCn: "克利夫顿花园码头",
    lat: -33.8360, lng: 151.2530, type: "harbour", baseScore: 74,
    species: ["Bream", "Squid", "Flathead", "Whiting"],
    best: "Evening squid + night bream.", bestCn: "傍晚鱿鱼 + 夜钓黑鲷最佳。",
    techniques: ["Squid jigs", "Prawn baits"],
    tips: "Historic wharf with shark net, very family-friendly.",
    tipsCn: "历史码头 + 防鲨网家庭海滩，极友好。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "athol-bay", name: "Athol Bay / Taronga Foreshore", nameCn: "阿托尔湾 · 塔隆加岸线",
    lat: -33.8430, lng: 151.2470, type: "harbour", baseScore: 73,
    species: ["Kingfish", "Squid", "Bream"],
    best: "Dawn live bait.", bestCn: "清晨活饵最佳。",
    techniques: ["Live yakkas", "Squid jigs"],
    tips: "Short walk from Taronga ferry, less crowded than Bradleys.",
    tipsCn: "塔隆加渡轮短步行可达，比 Bradleys 更少人。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "lavender-bay", name: "Lavender Bay", nameCn: "薰衣草湾",
    lat: -33.8510, lng: 151.2040, type: "harbour", baseScore: 68,
    species: ["Bream", "Squid", "Flathead"],
    best: "Evening squid.", bestCn: "傍晚鱿鱼最佳。",
    techniques: ["Squid jigs", "Prawn baits"],
    tips: "North Sydney harbour pocket under Harbour Bridge view.",
    tipsCn: "北悉尼港湾，正对悉尼大桥的景色。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "neutral-bay", name: "Kurraba Point, Neutral Bay", nameCn: "库拉巴角 · 中立湾",
    lat: -33.8400, lng: 151.2210, type: "harbour", baseScore: 70,
    species: ["Bream", "Kingfish", "Squid"],
    best: "Run-in tide morning.", bestCn: "清晨涨潮最佳。",
    techniques: ["Live bait", "Squid jigs"],
    tips: "Ferry-accessible via Kurraba Wharf F6, deep water close in.",
    tipsCn: "F6 库拉巴渡轮可达，岸边深水。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "reef-beach", name: "Reef Beach, Dobroyd Head", nameCn: "礁石海滩 · 多布罗伊角",
    lat: -33.8130, lng: 151.2640, type: "harbour", baseScore: 72,
    species: ["Bream", "Squid", "Trevally", "Flathead"],
    best: "Run-in tide dawn.", bestCn: "清晨涨潮最佳。",
    techniques: ["Squid jigs", "Prawn baits"],
    tips: "Walk-in via Dobroyd Head track, beautiful small harbour beach.",
    tipsCn: "由多布罗伊头步道步入，美丽的小港湾海滩。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "grotto-point", name: "Grotto Point", nameCn: "洞穴角",
    lat: -33.8060, lng: 151.2700, type: "harbour", baseScore: 78,
    species: ["Kingfish", "Squid", "Bream", "Trevally"],
    best: "Dawn live bait.", bestCn: "清晨活饵最佳。",
    techniques: ["Live yakkas", "Squid jigs"],
    tips: "Historic lighthouse point, quiet harbour kingfish spot.",
    tipsCn: "历史灯塔角，安静的港内黄尾点。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "store-beach", name: "Store Beach, Manly", nameCn: "商店海滩 · 曼利",
    lat: -33.8170, lng: 151.2930, type: "harbour", baseScore: 72,
    species: ["Bream", "Squid", "Whiting", "Flathead"],
    best: "Run-in tide high.", bestCn: "高涨潮最佳。",
    techniques: ["Nippers", "Squid jigs"],
    tips: "Boat-only access (kayak works). Pristine harbour beach.",
    tipsCn: "仅船 / 皮划艇可达，未受污染的港内海滩。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "high"
  },
  {
    id: "spring-cove", name: "Spring Cove, Manly", nameCn: "泉湾 · 曼利",
    lat: -33.8180, lng: 151.2950, type: "harbour", baseScore: 71,
    species: ["Bream", "Squid", "Flathead"],
    best: "Dawn run-in.", bestCn: "清晨涨潮最佳。",
    techniques: ["Squid jigs", "Prawn baits"],
    tips: "Next to Store Beach, similar boat-in access.",
    tipsCn: "紧邻 Store Beach，同样船入。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },

  // ==================== Eastern Suburbs 补充 ====================
  {
    id: "marks-park", name: "Mark's Park, Tamarama", nameCn: "马克斯公园 · 塔玛拉玛",
    lat: -33.9010, lng: 151.2710, type: "rock", baseScore: 73,
    species: ["Bream", "Drummer", "Luderick"],
    best: "Incoming tide morning.", bestCn: "清晨涨潮最佳。",
    techniques: ["Float rig", "Light bream setups"],
    tips: "On the Bondi-Bronte coastal walk, quieter ledges.",
    tipsCn: "邦迪-布朗特海岸步道中段，较安静的岩台。",
    prefers: { calm: true, wind: ["W", "SW"] },
    preferredTide: "rising"
  },
  {
    id: "mackenzies-bay", name: "MacKenzies Bay (disappearing beach)", nameCn: "麦肯齐湾 · 隐现海滩",
    lat: -33.8980, lng: 151.2750, type: "rock", baseScore: 70,
    species: ["Bream", "Luderick", "Drummer"],
    best: "Morning high tide.", bestCn: "清晨高潮最佳。",
    techniques: ["Float rig", "Light bait"],
    tips: "Sandy beach appears only some years — rocks always fishable.",
    tipsCn: "沙滩只在某些年份出现，岩礁全年可钓。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "high"
  },
  {
    id: "coogee-bullnose", name: "Bullnose, North Coogee", nameCn: "牛鼻岩 · 库吉北",
    lat: -33.9160, lng: 151.2615, type: "rock", baseScore: 78,
    species: ["Kingfish", "Drummer", "Bream", "Groper"],
    best: "Dawn live bait.", bestCn: "清晨活饵最佳。",
    techniques: ["Live yakkas", "Red crab for groper"],
    tips: "The prominent rock nose north of Coogee Beach, serious LBG.",
    tipsCn: "库吉海滩北端的岩鼻，严肃 LBG 点位。",
    prefers: { calm: true, wind: ["W", "NW"] },
    preferredTide: "rising"
  },
  {
    id: "waverley-cliff", name: "Waverley Cliff (lower ledges)", nameCn: "韦弗利悬崖 · 下岩台",
    lat: -33.9080, lng: 151.2670, type: "rock", baseScore: 74,
    species: ["Drummer", "Bream", "Groper", "Luderick"],
    best: "Winter drummer high tide.", bestCn: "冬季高潮钓黑毛最佳。",
    techniques: ["Cunjevoi float", "Red crab"],
    tips: "Access only the safe lower ledges. NSW mandatory lifejacket zone.",
    tipsCn: "仅下部安全岩台可钓，NSW 强制救生衣区。",
    prefers: { calm: false, wind: ["W"] },
    preferredTide: "high"
  },

  // ==================== Royal National Park ====================
  {
    id: "marley-beach", name: "Marley Beach, Royal NP", nameCn: "马利海滩 · 皇家国家公园",
    lat: -34.1130, lng: 151.1530, type: "beach", baseScore: 77,
    species: ["Salmon", "Tailor", "Jewfish", "Bream"],
    best: "Dawn gutters.", bestCn: "清晨冲沟最佳。",
    techniques: ["Pilchards gang hooks", "Beach worms"],
    tips: "Wild isolated beach, 1h walk from Bundeena. Often you're alone.",
    tipsCn: "邦德纳出发步行 1 小时的野滩，常常整片海滩只有你。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "wattamolla", name: "Wattamolla, Royal NP", nameCn: "瓦塔莫拉 · 皇家国家公园",
    lat: -34.1380, lng: 151.1210, type: "beach", baseScore: 76,
    species: ["Salmon", "Tailor", "Bream", "Drummer"],
    best: "Dawn ocean side.", bestCn: "清晨外海侧最佳。",
    techniques: ["Metals", "Pilchards"],
    tips: "Car-accessible RoyalNP spot with lagoon + beach + rocks.",
    tipsCn: "车可达的皇家国家公园点，有潟湖+海滩+岩礁组合。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "garie-beach", name: "Garie Beach, Royal NP", nameCn: "加里海滩 · 皇家国家公园",
    lat: -34.1750, lng: 151.0630, type: "beach", baseScore: 78,
    species: ["Salmon", "Tailor", "Jewfish", "Bream"],
    best: "Dawn/dusk gutters.", bestCn: "晨昏冲沟最佳。",
    techniques: ["Pilchards", "Live bait"],
    tips: "Car access + long sandy beach. One of Royal NP's best-known beaches.",
    tipsCn: "车可达 + 长沙滩，皇家国家公园最知名海滩之一。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "horderns-beach", name: "Horderns Beach, Bundeena", nameCn: "霍尔顿斯海滩 · 邦德纳",
    lat: -34.0840, lng: 151.1560, type: "harbour", baseScore: 70,
    species: ["Flathead", "Whiting", "Bream"],
    best: "High tide flats.", bestCn: "高潮沙滩最佳。",
    techniques: ["Nippers", "Beach worms"],
    tips: "Port Hacking calm bay, family friendly.",
    tipsCn: "霍金港内平静湾，家庭友好。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "high"
  },

  // ==================== Cronulla 补充 ====================
  {
    id: "oak-park", name: "Oak Park, Cronulla", nameCn: "橡树公园 · 克罗努拉",
    lat: -34.0680, lng: 151.1700, type: "rock", baseScore: 76,
    species: ["Bream", "Drummer", "Luderick", "Tailor"],
    best: "Morning run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Float rig", "Cunjevoi"],
    tips: "Park + ocean pool + gentle rock platform combo.",
    tipsCn: "公园+海水泳池+平缓岩台组合。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "shelly-beach-cronulla", name: "Shelly Beach, Cronulla", nameCn: "贝壳海滩 · 克罗努拉",
    lat: -34.0620, lng: 151.1680, type: "beach", baseScore: 69,
    species: ["Whiting", "Bream", "Flathead"],
    best: "High tide.", bestCn: "高潮最佳。",
    techniques: ["Nippers", "Beach worms"],
    tips: "Small sheltered beach, family-friendly.",
    tipsCn: "小而避风的家庭海滩。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "high"
  },
  {
    id: "salmon-haul", name: "Salmon Haul Reserve, Cronulla", nameCn: "捕鲑保留地 · 克罗努拉",
    lat: -34.0790, lng: 151.1590, type: "estuary",
    baseScore: 76,
    species: ["Tailor", "Flathead", "Bream", "Jewfish"],
    best: "Run-out tide evening.", bestCn: "傍晚退潮最佳。",
    techniques: ["Soft plastics", "Live bait"],
    tips: "Port Hacking southern shore, historic salmon netting grounds.",
    tipsCn: "霍金港南岸，历史上是捕鲑场。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "falling"
  },
  {
    id: "elouera-beach", name: "Elouera Beach", nameCn: "艾露拉海滩",
    lat: -34.0510, lng: 151.1690, type: "beach", baseScore: 75,
    species: ["Salmon", "Tailor", "Whiting", "Jewfish"],
    best: "Dawn/dusk gutters.", bestCn: "晨昏冲沟最佳。",
    techniques: ["Pilchards gangs", "Beach worms"],
    tips: "Part of Bate Bay, between Wanda and North Cronulla.",
    tipsCn: "Bate Bay 一部分，在 Wanda 和 North Cronulla 之间。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },

  // ==================== Northern Beaches 补充 ====================
  {
    id: "shelly-beach-manly", name: "Shelly Beach, Manly", nameCn: "贝壳海滩 · 曼利",
    lat: -33.8020, lng: 151.2940, type: "harbour", baseScore: 75,
    species: ["Bream", "Whiting", "Squid", "Groper"],
    best: "Morning high tide.", bestCn: "清晨高潮最佳。",
    techniques: ["Squid jigs", "Light bream rigs"],
    tips: "Cabbage Tree Bay Aquatic Reserve — no-take zone. Catch & release only.",
    tipsCn: "Cabbage Tree Bay 水生保护区，禁捕区，仅可钓放。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "high"
  },
  {
    id: "fairy-bower", name: "Fairy Bower, Manly", nameCn: "仙女亭 · 曼利",
    lat: -33.8010, lng: 151.2920, type: "rock", baseScore: 72,
    species: ["Bream", "Drummer", "Luderick"],
    best: "Morning run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Light float rigs"],
    tips: "Historic ocean pool rocks. NOTE: part of Cabbage Tree Bay aquatic reserve — check no-take zones.",
    tipsCn: "历史海水泳池旁；注意 Cabbage Tree Bay 保护区禁捕范围。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "south-narrabeen", name: "South Narrabeen Beach", nameCn: "南纳拉宾海滩",
    lat: -33.7150, lng: 151.3010, type: "beach", baseScore: 74,
    species: ["Salmon", "Tailor", "Whiting", "Bream"],
    best: "Dawn gutters.", bestCn: "清晨冲沟最佳。",
    techniques: ["Pilchards", "Beach worms"],
    tips: "Quieter southern end of Narrabeen Beach.",
    tipsCn: "纳拉宾海滩南端，较安静。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "mona-vale-beach", name: "Mona Vale Beach", nameCn: "莫纳谷海滩",
    lat: -33.6780, lng: 151.3120, type: "beach", baseScore: 73,
    species: ["Salmon", "Tailor", "Whiting"],
    best: "Dawn gutters.", bestCn: "清晨冲沟最佳。",
    techniques: ["Pilchards", "Beach worms"],
    tips: "Long family-friendly beach, easy access.",
    tipsCn: "长沙滩家庭友好，易达。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "newport-beach", name: "Newport Beach", nameCn: "纽波特海滩",
    lat: -33.6540, lng: 151.3220, type: "beach", baseScore: 72,
    species: ["Salmon", "Tailor", "Whiting", "Jewfish"],
    best: "Dawn/dusk, night for jewfish.", bestCn: "晨昏/夜钓石首鱼。",
    techniques: ["Pilchards", "Live squid"],
    tips: "Good gutter formation after storms.",
    tipsCn: "风暴后冲沟形态良好。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },
  {
    id: "careel-bay", name: "Careel Bay, Pittwater", nameCn: "卡里尔湾 · 皮特沃特",
    lat: -33.6260, lng: 151.3180, type: "estuary", baseScore: 71,
    species: ["Flathead", "Bream", "Whiting", "Squid"],
    best: "Run-in tide early.", bestCn: "清晨涨潮最佳。",
    techniques: ["Nippers", "Soft plastics", "Squid jigs"],
    tips: "Sheltered Pittwater inlet, mangroves + sand flats.",
    tipsCn: "皮特沃特避风湾，红树林+沙滩。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "basin-beach-pittwater", name: "The Basin, Pittwater", nameCn: "水盆海滩 · 皮特沃特",
    lat: -33.6150, lng: 151.2820, type: "harbour", baseScore: 74,
    species: ["Bream", "Whiting", "Flathead", "Squid"],
    best: "Run-in tide.", bestCn: "涨潮最佳。",
    techniques: ["Nippers", "Soft plastics"],
    tips: "Boat or ferry access only, Ku-ring-gai NP camping spot.",
    tipsCn: "仅船或渡轮可达，库灵盖国家公园营地。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "mackerel-beach", name: "Great Mackerel Beach", nameCn: "大马鲛海滩",
    lat: -33.5950, lng: 151.2760, type: "harbour", baseScore: 75,
    species: ["Flathead", "Whiting", "Bream", "Kingfish"],
    best: "High tide.", bestCn: "高潮最佳。",
    techniques: ["Soft plastics", "Live bait"],
    tips: "Ferry from Palm Beach to this remote Pittwater village.",
    tipsCn: "从棕榈海滩乘渡轮到这个偏远的皮特沃特村庄。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "high"
  },
  {
    id: "dee-why-lagoon", name: "Dee Why Lagoon Entrance", nameCn: "迪威湖入口",
    lat: -33.7520, lng: 151.2990, type: "estuary", baseScore: 69,
    species: ["Flathead", "Bream", "Whiting"],
    best: "Run-out tide.", bestCn: "退潮最佳。",
    techniques: ["Soft plastics", "Nippers"],
    tips: "Small lagoon mouth, opens to sea after storms.",
    tipsCn: "小型湖口，风暴后开口入海。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "falling"
  },
  {
    id: "fishermans-beach", name: "Fishermans Beach, Collaroy", nameCn: "渔夫海滩 · 科拉罗伊",
    lat: -33.7390, lng: 151.3060, type: "rock", baseScore: 73,
    species: ["Bream", "Drummer", "Luderick", "Tailor"],
    best: "Morning run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Float rig", "Pilchards"],
    tips: "Small rock + sand pocket at Collaroy north end. Appropriate name.",
    tipsCn: "科拉罗伊北端的小岩礁+沙滩组合，名字贴切。",
    prefers: { calm: true, wind: ["W"] },
    preferredTide: "rising"
  },

  // ==================== Georges River / Botany Bay 补充 ====================
  {
    id: "tom-uglys", name: "Tom Uglys Bridge", nameCn: "汤姆丑陋桥",
    lat: -33.9870, lng: 151.1030, type: "estuary", baseScore: 73,
    species: ["Bream", "Flathead", "Jewfish", "Tailor"],
    best: "Run-out tide night.", bestCn: "夜间退潮最佳。",
    techniques: ["Soft plastics around pylons", "Live bait"],
    tips: "Georges River bridge pylons are reliable bream + surprise jewfish.",
    tipsCn: "乔治河桥墩，黑鲷稳定 + 意外石首鱼。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "change"
  },
  {
    id: "oatley-park", name: "Oatley Park", nameCn: "奥特利公园",
    lat: -33.9910, lng: 151.0830, type: "estuary", baseScore: 70,
    species: ["Bream", "Flathead", "Whiting"],
    best: "Morning run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Prawn baits", "Plastics"],
    tips: "Georges River bushland park, quieter than Como.",
    tipsCn: "乔治河林地公园，比 Como 更安静。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "sandringham", name: "Sandringham Bay", nameCn: "桑德林汉姆湾",
    lat: -33.9930, lng: 151.1380, type: "estuary", baseScore: 69,
    species: ["Bream", "Flathead", "Whiting"],
    best: "Run-out tide.", bestCn: "退潮最佳。",
    techniques: ["Nippers", "Soft plastics"],
    tips: "Georges River mouth sheltered bay.",
    tipsCn: "乔治河口避风湾。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "falling"
  },
  {
    id: "ramsgate-beach", name: "Ramsgate Beach", nameCn: "拉姆斯盖特海滩",
    lat: -33.9830, lng: 151.1420, type: "beach", baseScore: 66,
    species: ["Whiting", "Flathead", "Bream"],
    best: "High tide.", bestCn: "高潮最佳。",
    techniques: ["Nippers", "Beach worms"],
    tips: "Botany Bay inner beach, sheltered from southerlies.",
    tipsCn: "植物湾内海滩，避南风。",
    prefers: { calm: true, wind: ["S", "SW"] },
    preferredTide: "high"
  },
  {
    id: "lady-robinsons", name: "Lady Robinsons Beach, Brighton-le-Sands", nameCn: "罗宾逊女士海滩 · 布莱顿",
    lat: -33.9660, lng: 151.1490, type: "beach", baseScore: 65,
    species: ["Whiting", "Flathead", "Bream"],
    best: "High tide, dawn.", bestCn: "清晨高潮最佳。",
    techniques: ["Nippers", "Beach worms"],
    tips: "Long Botany Bay beach, near Sydney Airport — expect aircraft noise.",
    tipsCn: "长植物湾海滩，靠近悉尼机场（噪音明显）。",
    prefers: { calm: true, wind: ["S"] },
    preferredTide: "high"
  },

  // ==================== Hawkesbury / Pittwater 补充 ====================
  {
    id: "cottage-point", name: "Cottage Point", nameCn: "小屋角",
    lat: -33.6400, lng: 151.1790, type: "estuary", baseScore: 77,
    species: ["Flathead", "Bream", "Jewfish", "Tailor"],
    best: "Run-out tide dawn.", bestCn: "清晨退潮最佳。",
    techniques: ["Soft plastics", "Live bait"],
    tips: "Cowan Creek deep water bend, historic inn + fuel stop.",
    tipsCn: "科万溪深水湾，历史酒馆+加油站。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "falling"
  },
  {
    id: "apple-tree-bay", name: "Apple Tree Bay, Cowan Creek", nameCn: "苹果树湾 · 科万溪",
    lat: -33.6500, lng: 151.1680, type: "estuary", baseScore: 74,
    species: ["Flathead", "Bream", "Jewfish"],
    best: "Run-out tide.", bestCn: "退潮最佳。",
    techniques: ["Soft plastics", "Vibes"],
    tips: "Ku-ring-gai NP boat ramp area, deep bay.",
    tipsCn: "库灵盖国家公园船坡道区，深水湾。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "falling"
  },
  {
    id: "akuna-bay", name: "Akuna Bay", nameCn: "阿库那湾",
    lat: -33.6530, lng: 151.2290, type: "estuary", baseScore: 73,
    species: ["Flathead", "Bream", "Kingfish"],
    best: "Morning run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Live bait", "Soft plastics"],
    tips: "Marina + boat hire. Summer kings sometimes venture deep into Cowan Creek.",
    tipsCn: "码头 + 船只出租；夏季黄尾偶尔深入科万溪。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "dangar-island", name: "Dangar Island", nameCn: "丹加岛",
    lat: -33.5450, lng: 151.2420, type: "estuary", baseScore: 75,
    species: ["Flathead", "Bream", "Jewfish", "Tailor"],
    best: "Tide change night.", bestCn: "夜间换潮最佳。",
    techniques: ["Live bait", "Soft plastics"],
    tips: "Tiny Hawkesbury island village, ferry from Brooklyn Wharf.",
    tipsCn: "霍克斯伯里河中的小岛村，Brooklyn 码头有渡轮。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "change"
  },
  {
    id: "juno-point-hawkesbury", name: "Juno Point", nameCn: "朱诺角",
    lat: -33.5500, lng: 151.2560, type: "estuary", baseScore: 72,
    species: ["Flathead", "Jewfish", "Bream"],
    best: "Tide change.", bestCn: "换潮最佳。",
    techniques: ["Live bait", "Vibes"],
    tips: "Hawkesbury River point near Brooklyn, deep water.",
    tipsCn: "Brooklyn 附近霍克斯伯里河点，深水。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "change"
  },

  // ==================== Inner West / Parramatta River ====================
  {
    id: "drummoyne", name: "Drummoyne Wharf", nameCn: "德鲁莫因码头",
    lat: -33.8510, lng: 151.1550, type: "estuary", baseScore: 66,
    species: ["Bream", "Flathead", "Squid"],
    best: "Run-in tide.", bestCn: "涨潮最佳。",
    techniques: ["Squid jigs", "Prawn baits"],
    tips: "Parramatta River wharf, ferry access.",
    tipsCn: "帕拉玛塔河码头，渡轮可达。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "greenwich-point", name: "Greenwich Point", nameCn: "格林威治角",
    lat: -33.8400, lng: 151.1840, type: "estuary", baseScore: 70,
    species: ["Bream", "Flathead", "Squid", "Trevally"],
    best: "Dawn run-in tide.", bestCn: "清晨涨潮最佳。",
    techniques: ["Light plastics", "Squid jigs"],
    tips: "Lane Cove River meets Parramatta River — deep junction.",
    tipsCn: "莱恩湾河与帕拉玛塔河交汇深水区。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "woolwich-dock", name: "Woolwich Dock", nameCn: "伍尔维奇码头",
    lat: -33.8410, lng: 151.1780, type: "estuary", baseScore: 68,
    species: ["Bream", "Squid", "Flathead"],
    best: "Evening squid.", bestCn: "傍晚鱿鱼最佳。",
    techniques: ["Squid jigs", "Prawn baits"],
    tips: "Historic dock area, deep water at the walls.",
    tipsCn: "历史码头区，壁旁深水。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  },
  {
    id: "abbotsford-point", name: "Abbotsford Point", nameCn: "阿博茨福德角",
    lat: -33.8480, lng: 151.1340, type: "estuary", baseScore: 65,
    species: ["Bream", "Flathead"],
    best: "Run-in tide.", bestCn: "涨潮最佳。",
    techniques: ["Prawn baits", "Plastics"],
    tips: "Parramatta River ferry wharf, inner west access.",
    tipsCn: "帕拉玛塔河渡轮码头，内西区可达。",
    prefers: { calm: true, wind: ["any"] },
    preferredTide: "rising"
  }
];
