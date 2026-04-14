// Transport & access data for Sydney fishing spots.
// SOURCE: community knowledge distilled from public transport data, OSM, and common
// discussion on Sydney fishing forums. NOT real user reviews — shown as "社区整理".
//
// Fields:
//   score: 1-5 stars (overall ease of access)
//   drive: string — parking & walk from car
//   pt: string — nearest public transport
//   terrain: "easy" | "moderate" | "hard" | "extreme"
//   tips: array of short access tips (community-distilled, clearly labeled)
//
// Spots without an entry fall back to "未收录 / Data not yet available".

window.ACCESS_DATA = {
  // ========== Top-tier LBG platforms (typically harder access) ==========
  "hornby-light": {
    score: 2,
    drive: "Camp Cove 停车场出发，需徒步约 20-25 分钟沿步道上下坡",
    pt: "325 路公交到 Watsons Bay 终点，或渡轮 F9 到 Watsons Bay 码头",
    terrain: "hard",
    tips: [
      "重装备负重徒步不轻松，双肩背包比手提桶舒服",
      "最后一段是陡峭的岩石小径，天黑前必须离开",
      "涌浪 >1.5m 绝对不要下平台，每年都有事故"
    ]
  },
  "north-head": {
    score: 2,
    drive: "North Head Scenic Drive 停车后步行 10-15 分钟至 Fairfax Walk 分叉",
    pt: "135 路公交 + 步行约 25 分钟",
    terrain: "hard",
    tips: [
      "国家公园内，停车免费但开放时间受限",
      "重竿+活饵桶建议用手推车或渔具推车",
      "涌浪大时步道会湿滑，穿钉鞋"
    ]
  },
  "bare-island": {
    score: 5,
    drive: "La Perouse 停车场就在岛旁，步行 1-2 分钟过桥",
    pt: "394 路公交直达 La Perouse Loop 终点站，步行 3 分钟",
    terrain: "easy",
    tips: [
      "悉尼最易达的 LBG 点之一，几乎开车即到",
      "周末和假期停车拥挤，建议清晨前或下午",
      "有公共厕所和咖啡车，家人陪同很合适"
    ]
  },
  "cape-banks": {
    score: 2,
    drive: "Henry Head 停车场出发，徒步约 30-40 分钟，最后需低潮通过陆桥",
    pt: "394 路到 La Perouse，再步行约 1 小时",
    terrain: "hard",
    tips: [
      "必须掌握潮汐时间，涨潮时陆桥被淹无法返回",
      "全程公园步道+沙地+岩礁，路程远但鱼况好",
      "建议两人以上同行，带充足的水"
    ]
  },
  "henry-head": {
    score: 3,
    drive: "Henry Head 停车场步行 10 分钟",
    pt: "394 路 La Perouse 终点 + 步行 20 分钟",
    terrain: "moderate",
    tips: [
      "停车场免费，步道平整",
      "最后一段下到岩台需要注意脚下",
      "比 Cape Banks 近很多，适合第一次来这一带"
    ]
  },
  "inscription-point": {
    score: 4,
    drive: "Captain Cook's Landing 停车场步行 10-12 分钟沿海岸步道",
    pt: "987 路公交到 Kurnell，步行约 25 分钟",
    terrain: "moderate",
    tips: [
      "步道维护良好，拖着渔具推车可行",
      "停车场免费，有洗手间和水",
      "有历史解说牌，顺便了解库克登陆点"
    ]
  },
  "cape-solander": {
    score: 5,
    drive: "Cape Solander 专用停车场就在岩台上方，1 分钟下到钓点",
    pt: "987 路 Kurnell + 步行 35 分钟（公共交通极不便）",
    terrain: "easy",
    tips: [
      "开车几乎直达岩台，懒人友好",
      "冬季观鲸高峰期停车拥挤",
      "暴露平台，下去前查涌浪"
    ]
  },
  "potter-point": {
    score: 2,
    drive: "Kurnell 南端小路尽头停车，沿海岸步道约 20 分钟",
    pt: "无实际公共交通可达",
    terrain: "hard",
    tips: [
      "Google Maps 上可能显示不准，跟随 OSM 步道",
      "最后一段岩石跳跃，不适合初学者",
      "必须开车前来，没有公交选项"
    ]
  },
  "boat-harbour-kurnell": {
    score: 1,
    drive: "需要 4WD 越野车通过沙地，普通车无法进入",
    pt: "无",
    terrain: "extreme",
    tips: [
      "没有 4WD 就别考虑，沙地会陷车",
      "Kurnell 沙地需要进入许可证",
      "鱼况很好但代价高"
    ]
  },
  "cape-baily": {
    score: 2,
    drive: "Cape Solander 停车场出发，沿 Cape Baily Track 徒步 25-30 分钟",
    pt: "无",
    terrain: "hard",
    tips: [
      "步道是悉尼最美海岸徒步之一",
      "带足水，沿途无补给",
      "冬天观鲸同时可钓"
    ]
  },
  "barrenjoey": {
    score: 2,
    drive: "Palm Beach 停车场（收费）步行 25-30 分钟上陡坡至灯塔",
    pt: "L90 路从 CBD 或 Wynyard 直达 Palm Beach 终点",
    terrain: "hard",
    tips: [
      "L90 从 CBD 到 Palm Beach 约 90 分钟，可作一日游",
      "上灯塔的路坡度大，背重装备会累",
      "Palm Beach 停车位难找，周末早到"
    ]
  },
  "palm-beach": {
    score: 5,
    drive: "Palm Beach Wharf 旁即有停车，步行 30 秒到码头",
    pt: "L90 路 + 598 路直达",
    terrain: "easy",
    tips: [
      "悉尼最远但 L90 公交直达，没车也能来",
      "码头本身就是钓点，不需徒步",
      "Barrenjoey 和 Palm Beach 可以一趟两钓"
    ]
  },
  "long-reef": {
    score: 3,
    drive: "Long Reef 高尔夫球场停车场，步行 15-20 分钟绕过球场",
    pt: "B1 / 139 路到 Collaroy，步行 25 分钟",
    terrain: "moderate",
    tips: [
      "涨潮无法走过去，必须算准低潮",
      "回程时涨潮会切断退路，严重！",
      "步道平坦但有沙地段"
    ]
  },

  // ========== Sydney Harbour spots (generally easy) ==========
  "bradleys-head": {
    score: 5,
    drive: "Bradleys Head Rd 停车场步行 3-5 分钟",
    pt: "238 路公交到 Taronga Zoo + 步行 10 分钟，或渡轮 F2 到 Taronga + 步行 15 分钟",
    terrain: "easy",
    tips: [
      "渡轮路线最浪漫，直接从 Circular Quay 出发",
      "公园内步道维护很好",
      "免费停车但周末拥挤"
    ]
  },
  "middle-head": {
    score: 4,
    drive: "Middle Head Rd 尽头停车 + 步行 5-10 分钟",
    pt: "244 路公交到 Middle Head + 步行 10 分钟",
    terrain: "easy",
    tips: [
      "国家公园内，免费停车",
      "有废弃军事遗迹可看，顺便遛娃",
      "步道平整"
    ]
  },
  "chowder-bay": {
    score: 4,
    drive: "Chowder Bay Rd 停车（收费）步行 2-3 分钟",
    pt: "244 路到 Clifton Gardens + 步行 5 分钟",
    terrain: "easy",
    tips: [
      "海军基地改造的公园，有咖啡餐厅",
      "周末停车收费且位紧张",
      "码头本身就是钓点"
    ]
  },
  "balmoral": {
    score: 5,
    drive: "路边停车即到，0 步行",
    pt: "233 / 238 路公交直达 Balmoral",
    terrain: "easy",
    tips: [
      "家庭首选，停车和鱼点之间就是一条路",
      "有餐厅、厕所、儿童游乐场",
      "轮椅可达"
    ]
  },
  "manly-wharf": {
    score: 5,
    drive: "Manly Council 停车场（按小时收费），步行 2 分钟",
    pt: "F1 渡轮从 Circular Quay 直达 Manly，下船即是钓点",
    terrain: "easy",
    tips: [
      "渡轮体验本身就值回票价，海景绝佳",
      "开车停车贵且难，推荐渡轮",
      "码头夜晚灯下钓鱿鱼"
    ]
  },
  "watsons-bay-dupe": {}, // placeholder
  "camp-cove": {
    score: 5,
    drive: "Watsons Bay Cliff St 旁停车（收费），步行 2-3 分钟下台阶",
    pt: "F9 渡轮到 Watsons Bay 或 325 路公交",
    terrain: "easy",
    tips: [
      "渡轮+Doyles 鱼餐厅组合，一天游玩",
      "Watsons Bay 停车极紧张，公交最优",
      "平台小但鱼况稳定"
    ]
  },
  "rose-bay": {
    score: 5,
    drive: "New South Head Rd 旁有路边停车，步行 1-2 分钟",
    pt: "F4 渡轮 Rose Bay 或 324/325 路公交",
    terrain: "easy",
    tips: [
      "渡轮码头本身是钓点，直接夜钓鱿鱼",
      "有公共厕所和小店",
      "步行距离极短"
    ]
  },
  "nielsen-park": {
    score: 4,
    drive: "Greycliffe House 停车场（收费），步行 5 分钟",
    pt: "325 路到 Nielsen Park",
    terrain: "easy",
    tips: [
      "海滩旁家庭公园，有咖啡亭",
      "停车场夏天周末很早就满",
      "孩子可以游泳同时大人钓鱼"
    ]
  },
  "blues-point": {
    score: 5,
    drive: "Blues Point Reserve 停车（有限），步行 1 分钟",
    pt: "North Sydney 火车站步行 15 分钟，或 230 路公交",
    terrain: "easy",
    tips: [
      "地铁+步行完全可行",
      "正对歌剧院景色无敌",
      "停车位很少，建议公交"
    ]
  },
  "cremorne-point": {
    score: 4,
    drive: "Milson Rd 路边停车（2 小时限时），步行 5 分钟",
    pt: "F6 渡轮 Cremorne Point 或 225 路公交",
    terrain: "easy",
    tips: [
      "渡轮最佳选择，码头离钓点极近",
      "停车限时 2 小时不适合长钓",
      "步道环境非常好"
    ]
  },
  "mosman-bay": {
    score: 5,
    drive: "Avenue Rd 停车场旁即是码头",
    pt: "F6 渡轮 Mosman Bay，下船即是钓点",
    terrain: "easy",
    tips: [
      "渡轮直达钓点，零步行",
      "周围有咖啡店",
      "家庭友好"
    ]
  },
  "dawes-point": {
    score: 5,
    drive: "Rocks 地区付费停车，步行 3-5 分钟",
    pt: "Circular Quay 火车/渡轮 + 步行 8 分钟",
    terrain: "easy",
    tips: [
      "CBD 完全公共交通可达",
      "悉尼大桥下方，游客会很多",
      "夜钓安静一些"
    ]
  },
  "woolloomooloo": {
    score: 5,
    drive: "Cowper Wharf Rd 路边停车",
    pt: "St James 火车站步行 15 分钟，或 311 路公交",
    terrain: "easy",
    tips: [
      "CBD 步行可达",
      "Harry's 肉馅饼 + 钓鱼的经典组合",
      "夜间码头灯下鱿鱼"
    ]
  },
  "farm-cove": {
    score: 5,
    drive: "Royal Botanic Garden 旁路边停车",
    pt: "Circular Quay 或 Martin Place 火车站步行 10-15 分钟",
    terrain: "easy",
    tips: [
      "CBD 心脏地带，绝对便利",
      "植物园风景无敌",
      "部分区域禁止钓鱼，注意标识"
    ]
  },

  // ========== Eastern rock platforms ==========
  "shark-point-clovelly": {
    score: 4,
    drive: "Clovelly Rd 停车场步行 5-8 分钟沿小径",
    pt: "339 路公交到 Clovelly",
    terrain: "moderate",
    tips: [
      "比 Hornby 近很多，公交可达",
      "最后下岩台需要注意",
      "停车场周末爆满"
    ]
  },
  "clovelly": {
    score: 5,
    drive: "Clovelly Beach 停车场旁，步行 2 分钟",
    pt: "339 路直达 Clovelly Beach",
    terrain: "easy",
    tips: [
      "极易达，家庭友好",
      "有游泳池和咖啡店",
      "公交 339 从 Bondi 直达"
    ]
  },
  "gordons-bay": {
    score: 4,
    drive: "Victory St 路边停车，步行 5 分钟下台阶",
    pt: "339 路 + 步行 10 分钟",
    terrain: "moderate",
    tips: [
      "下到海湾的台阶陡",
      "避风湾很稳定",
      "停车位有限"
    ]
  },
  "bondi-rocks": {
    score: 4,
    drive: "Ramsgate Ave 路边停车（收费），步行 5 分钟",
    pt: "333 / 380 路巴士直达 Bondi Beach",
    terrain: "moderate",
    tips: [
      "周末停车极贵且难找",
      "333 路是悉尼最繁忙的公交线",
      "建议非高峰时段前往"
    ]
  },
  "mackenzies-point": {
    score: 4,
    drive: "Bondi to Bronte Coastal Walk 中段，步行 10 分钟",
    pt: "333/380 到 Bondi + 步行 15 分钟",
    terrain: "moderate",
    tips: [
      "走海岸步道前往，风景优美",
      "顺便游览 Bondi-Bronte 步道",
      "没有直接停车场"
    ]
  },
  "bronte-baths": {
    score: 5,
    drive: "Bronte Park 停车场，步行 2 分钟",
    pt: "378 路直达 Bronte Beach",
    terrain: "easy",
    tips: [
      "家庭公园旁，极易达",
      "有餐厅和洗手间",
      "孩子可以玩水同时钓鱼"
    ]
  },
  "coogee-rocks": {
    score: 5,
    drive: "Coogee Beach 停车场，步行 3-5 分钟",
    pt: "372 / 373 / 374 路直达 Coogee",
    terrain: "easy",
    tips: [
      "东区交通最方便的鱼点之一",
      "Dolphin Point 就在海滩南端",
      "公共交通很便捷"
    ]
  },
  "maroubra-rocks": {
    score: 4,
    drive: "Mistral Cres 尽头停车，步行 3 分钟",
    pt: "M50 / 395 / 396 路巴士到 Maroubra Beach",
    terrain: "moderate",
    tips: [
      "Mistral Point 是本地知名 LBG 点",
      "停车免费但位少",
      "岩石有点滑，注意"
    ]
  },
  "magic-point": {
    score: 3,
    drive: "Maroubra 南端 Malabar Rd，路边停车 + 步行 10-15 分钟",
    pt: "M50 / 395 + 步行 20 分钟",
    terrain: "moderate",
    tips: [
      "沿海岸步道前往，景色好",
      "带基本的装备，不要过重",
      "冬季风大注意保暖"
    ]
  },
  "malabar": {
    score: 5,
    drive: "Malabar Beach 停车场，步行 5 分钟到岬角",
    pt: "M50 / 353 / X96 公交直达",
    terrain: "easy",
    tips: [
      "公交极方便",
      "注意 EPA 禁捕区边界",
      "有洗手间和咖啡店"
    ]
  },
  "little-bay": {
    score: 4,
    drive: "Little Bay Beach 停车场，步行 5-8 分钟",
    pt: "M50 / 395 到终点 + 步行",
    terrain: "easy",
    tips: [
      "The Coast 医院附近，安静",
      "小而精的海湾",
      "免费停车"
    ]
  },
  "diamond-bay": {
    score: 2,
    drive: "Diamond Bay Reserve 停车，需要绳索辅助下到岩台",
    pt: "325 / 324 + 步行 15 分钟",
    terrain: "hard",
    tips: [
      "非新手点位，必须有经验和装备",
      "下岩台的陡峭小路需要绳索",
      "不平静日禁止前往"
    ]
  },
  "dover-heights": {
    score: 3,
    drive: "Rodney Reserve 停车，步行 10-15 分钟下至岩台",
    pt: "387 / 380 + 步行 20 分钟",
    terrain: "hard",
    tips: [
      "下崖的步道陡峭",
      "建议两人同行",
      "查涌浪预报"
    ]
  },

  // ========== Beaches & estuaries (generally easy) ==========
  "silver-beach": {
    score: 5,
    drive: "Prince Charles Parade 路边停车，0 步行",
    pt: "987 路 Kurnell 下车即达",
    terrain: "easy",
    tips: [
      "车停哪里就在哪里钓",
      "长海滩多个接入点",
      "家庭友好"
    ]
  },
  "narrabeen-lake": {
    score: 5,
    drive: "Narrabeen Lagoon 多个停车场",
    pt: "B1 / 199 直达 Narrabeen",
    terrain: "easy",
    tips: [
      "环湖步道有很多接入点",
      "租独木舟也很方便",
      "适合带孩子"
    ]
  },
  "the-spit": {
    score: 5,
    drive: "Spit Reserve 免费停车，步行 2 分钟",
    pt: "E75 / 180 / 175 公交直达 Spit Bridge",
    terrain: "easy",
    tips: [
      "免费停车！稀有",
      "Middle Harbour 起点",
      "适合软虫钓 Flathead"
    ]
  },
  "clontarf": {
    score: 5,
    drive: "Clontarf Reserve 免费停车",
    pt: "E75 + 180 公交",
    terrain: "easy",
    tips: [
      "免费停车，家庭公园",
      "海滩有烧烤区",
      "沙滩很浅适合孩子"
    ]
  },
  "brooklyn": {
    score: 5,
    drive: "Brooklyn 小镇中心停车 + 步行 5 分钟",
    pt: "火车 T1 线到 Hawkesbury River Station，步行 5 分钟",
    terrain: "easy",
    tips: [
      "悉尼唯一火车直达的河流钓点！",
      "从 Central 约 1 小时",
      "镇上有鱼具店和餐厅"
    ]
  },
  "como": {
    score: 5,
    drive: "Como Pleasure Ground 停车",
    pt: "火车 T4 线到 Como Station，步行 5 分钟",
    terrain: "easy",
    tips: [
      "火车直达，对没车的钓友绝对友好",
      "乔治河河畔公园",
      "有烧烤区"
    ]
  },
  "cronulla-point": {
    score: 4,
    drive: "Cronulla Point 停车场（收费），步行 5 分钟",
    pt: "火车 T4 线到 Cronulla Station + 步行 15 分钟",
    terrain: "moderate",
    tips: [
      "火车直达 Cronulla 是最远的悉尼火车线",
      "下到岩台需小心",
      "冬季风大"
    ]
  },
  "bundeena": {
    score: 4,
    drive: "开车走 Royal NP（收费公园通行证）",
    pt: "Cronulla 渡轮 → Bundeena，约 30 分钟",
    terrain: "easy",
    tips: [
      "Cronulla 渡轮是唯一的真正悉尼过港渡轮",
      "渡轮 + 步行就能到码头钓点",
      "国家公园收费"
    ]
  },
  "gunnamatta": {
    score: 5,
    drive: "Gunnamatta Park 免费停车",
    pt: "火车 T4 到 Cronulla + 550 公交",
    terrain: "easy",
    tips: [
      "家庭公园，码头家庭友好",
      "免费停车",
      "Port Hacking 平静的避风湾"
    ]
  },

  // ========== Northern beaches ==========
  "dee-why-point": {
    score: 4,
    drive: "Dee Why Beach 停车场 + 步行 10 分钟",
    pt: "B1 / L90 直达 Dee Why",
    terrain: "moderate",
    tips: [
      "B1 快速公交从 CBD 直达",
      "停车场收费但有位",
      "可以先游泳再钓鱼"
    ]
  },
  "avalon-rocks": {
    score: 3,
    drive: "Avalon Beach 停车 + 步行 10 分钟到岬角",
    pt: "L90 直达 Avalon",
    terrain: "moderate",
    tips: [
      "北海滩 L90 公交线终点前几站",
      "停车位有限",
      "下岩台需要注意"
    ]
  },
  "whale-beach": {
    score: 3,
    drive: "Whale Beach 停车 + 步行 10-15 分钟到岬角",
    pt: "L90 终点附近",
    terrain: "moderate",
    tips: [
      "相对人少",
      "免费停车但位少",
      "海滩极美，值得一游"
    ]
  },
  "freshwater-head": {
    score: 4,
    drive: "Freshwater Beach 停车 + 步行 5 分钟",
    pt: "139 路到 Freshwater",
    terrain: "easy",
    tips: [
      "从 Manly 走过去也只要 20 分钟",
      "Freshwater 海滩历史悠久",
      "停车限时 4 小时"
    ]
  },
  "north-curl-curl": {
    score: 4,
    drive: "North Curl Curl Beach 停车 + 步行 5-8 分钟",
    pt: "139 / B1 到 Curl Curl",
    terrain: "moderate",
    tips: [
      "免费停车",
      "岩台适合中级钓友",
      "有公共厕所"
    ]
  },

  // ========== Georges River / Parramatta River ==========
  "sans-souci": {
    score: 5,
    drive: "Sans Souci 码头旁停车",
    pt: "476 路公交到 Sans Souci + 步行 5 分钟",
    terrain: "easy",
    tips: [
      "乔治河口码头，家庭友好",
      "免费停车",
      "邻近 Cook Park"
    ]
  },
  "taren-point": {
    score: 4,
    drive: "Taren Point Rd 路边停车",
    pt: "973 公交到 Taren Point",
    terrain: "easy",
    tips: [
      "乔治河沙滩",
      "低潮时沙滩步行空间大",
      "公交可达"
    ]
  },
  "kissing-point": {
    score: 5,
    drive: "Kissing Point Park 免费停车",
    pt: "F3 Parramatta River 渡轮到 Kissing Point 码头",
    terrain: "easy",
    tips: [
      "渡轮直达钓点！",
      "免费停车",
      "家庭公园环境"
    ]
  }
};
