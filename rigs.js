// Recommended rigs by species — Sydney fishing.
// Chinese primary + key English terminology (rod classes, line tests, hook sizes).
// Curated from commonly-accepted community knowledge. Not prescriptive — adjust to conditions.
//
// Each rig: rod / reel / line / leader / hook / bait / technique / tip (7 fields)
// level: beginner | intermediate | advanced

window.RIGS_BY_SPECIES = {
  "Kingfish": {
    nameCn: "澳洲黄尾鰤",
    icon: "🐟",
    rigs: [
      {
        name: "活饵吊钩",
        nameEn: "Live Bait Float (LBG)",
        level: "advanced",
        rod: "重型岩钓竿 Heavy LBG Rod 4-5m (PE 4-8)",
        reel: "纺车轮 Spin Reel 6000-8000 型",
        line: "编织主线 Braid PE 4-6 (40-60lb)",
        leader: "碳前导 Fluoro Leader 60-80lb · 长 2-3m",
        hook: "Gamakatsu 章鱼钩 Octopus 6/0-8/0 或 Circle 7/0",
        bait: "活 Yakka / Slimy Mackerel / Squid (最优)",
        technique: "气球 (Balloon) 吊钩漂钓；鱼咬饵后让其游 3 秒再大力扬竿，第一时间拉离礁石",
        tip: "经验 · 夏季 6-9AM 黄金窗口；活饵鲜度决定一切；线要松弛，张紧让鱼起疑"
      },
      {
        name: "铁板抽竿",
        nameEn: "Metal Jig Spin",
        level: "intermediate",
        rod: "中重路亚竿 Spin Rod 2.4-3m (PE 2-4)",
        reel: "Spin 4000-6000",
        line: "Braid PE 2-3 (30lb)",
        leader: "Fluoro 30-40lb · 长 1-1.5m",
        hook: "铁板自带助钩 Assist Hook (前后都装)",
        bait: "20-60g 长条形铁板 Metal Slug (银色/蓝银)",
        technique: "全力远投，落底后快速扬竿，快收慢收交替；接近海面时小停顿",
        tip: "经验 · 看到鲣鱼 (Bonito) 炸水就换铁板，黄尾常在下层跟随"
      },
      {
        name: "深水沉底 (船钓)",
        nameEn: "Deep Drop Weighted",
        level: "intermediate",
        rod: "船竿 Boat Rod 1.8-2.1m (24kg)",
        reel: "Overhead Reel 30W",
        line: "Braid 50-60lb",
        leader: "Mono 60-80lb",
        hook: "Circle Hook 8/0",
        bait: "整条 Squid 或 Slimy",
        technique: "沉底找结构 (沉船/暗礁)，主动抖竿让饵有动作",
        tip: "冬季大黄尾多在 30-60m 深度"
      }
    ]
  },

  "Bream": {
    nameCn: "黑鲷",
    icon: "🐟",
    rigs: [
      {
        name: "轻口无铅",
        nameEn: "Unweighted Bait",
        level: "beginner",
        rod: "软调路亚竿 Light Rod 2.1m 或岩矶竿 3.6m",
        reel: "Spin 2500",
        line: "尼龙 Mono 6-8lb 或 Braid PE 0.6",
        leader: "Fluoro 6-10lb · 长 1m",
        hook: "宽门钩 Baitholder #4-6",
        bait: "去壳虾 Prawn / 面包 Bread / 小螃蟹 Crab",
        technique: "撒面包做 berley 诱鱼，无铅让饵自然下沉到 berley 柱中",
        tip: "经验 · 涨潮 2 小时最稳；港内岩石缝和码头桩柱是黑鲷食堂"
      },
      {
        name: "软虫路亚",
        nameEn: "Soft Plastics",
        level: "intermediate",
        rod: "路亚竿 Light Rod 1.98-2.1m (1-3kg)",
        reel: "Spin 2000-2500",
        line: "Braid PE 0.4-0.6 (6-10lb)",
        leader: "Fluoro 6-8lb",
        hook: "轻铅头钩 Jighead 1/20-1/8 oz",
        bait: "2-3 寸 Grub / Paddle Tail (透明/粉/棕)",
        technique: "抛向结构物边缘，让软虫慢沉，小幅抽动引诱",
        tip: "牡蛎堆和码头桩柱是金点"
      }
    ]
  },

  "Flathead": {
    nameCn: "扁头鱼 (沙鳕)",
    icon: "🐟",
    rigs: [
      {
        name: "软虫路亚",
        nameEn: "Soft Plastics",
        level: "beginner",
        rod: "路亚竿 Light-Medium Rod 2.1m (2-5kg)",
        reel: "Spin 2500",
        line: "Braid PE 0.8-1.0 (10-15lb)",
        leader: "Fluoro 12-15lb",
        hook: "铅头钩 Jighead 1/8-1/4 oz",
        bait: "3-4 寸 Shad / Paddle Tail (粉/白/银/南瓜色)",
        technique: "抛出让软虫沉底，3 次抽竿一次停顿 —— 鱼通常在停顿时吃口",
        tip: "经验 · 沙底河口最佳；颜色不行就换，不要迷信一种色"
      },
      {
        name: "活饵沉底",
        nameEn: "Live Bait Bottom",
        level: "beginner",
        rod: "中型竿 Medium Rod 2.4m",
        reel: "Spin 3000-4000",
        line: "Mono 10-15lb",
        leader: "Fluoro 20-25lb",
        hook: "长柄钩 Longshank #2/0",
        bait: "活 Poddy Mullet / Prawn / 虾仁",
        technique: "小走铅 (Running Sinker) 沉底，缓慢移动",
        tip: "大扁头专吃活饵，死饵的鱼往往在 40cm 以下"
      }
    ]
  },

  "Whiting": {
    nameCn: "沙梭 (Sand Whiting)",
    icon: "🐟",
    rigs: [
      {
        name: "海虫沙底",
        nameEn: "Beach Worm Rig",
        level: "beginner",
        rod: "沙滩竿 Surf Rod 3-4m",
        reel: "Spin 4000",
        line: "Mono 6-10lb",
        leader: "Fluoro 8-10lb",
        hook: "长柄钩 Long Shank #4-6",
        bait: "海虫 Beach Worms (活的最好) / 钳虾 Nippers",
        technique: "轻走铅沙底等咬，竿铃或看竿尖",
        tip: "经验 · 涨潮前 1 小时进沙滩找冲沟 (Gutter)"
      },
      {
        name: "水面拟饵",
        nameEn: "Surface Popper",
        level: "intermediate",
        rod: "路亚竿 Light Rod 2.1m",
        reel: "Spin 2500",
        line: "Braid PE 0.4-0.6",
        leader: "Fluoro 6-8lb",
        hook: "拟饵自带 Treble Hook",
        bait: "70mm 水面铅笔 Surface Walker / Popper",
        technique: "Walk-the-dog 左右摆动，沙梭会追着抢咬",
        tip: "夏季早晨浅滩最有趣，视觉攻击"
      }
    ]
  },

  "Tailor": {
    nameCn: "竹荚鱼 (狗牙鲈)",
    icon: "🐟",
    rigs: [
      {
        name: "沙丁组合钩",
        nameEn: "Pilchard Gang Hooks",
        level: "beginner",
        rod: "沙滩/岩钓竿 3.6-4m",
        reel: "Spin 5000",
        line: "Mono 15-20lb",
        leader: "直连无 leader 或 30lb Mono",
        hook: "三连组合钩 Gang Hook 4/0×3",
        bait: "整条冷冻沙丁 Pilchard",
        technique: "远投到冲沟外沿，让饵在流中漂动",
        tip: "经验 · 晨昏炸水时最旺；咬口猛烈注意手指"
      },
      {
        name: "铁板快收",
        nameEn: "Fast Retrieve Metal",
        level: "intermediate",
        rod: "路亚竿 Spin 2.4-3m",
        reel: "Spin 4000",
        line: "Braid PE 1.5-2",
        leader: "Fluoro 20-25lb (牙齿利害)",
        hook: "Assist Hook",
        bait: "20-40g 银色铁板",
        technique: "全速快收，越快越好",
        tip: "记得换 leader，被咬断是常态"
      }
    ]
  },

  "Salmon": {
    nameCn: "澳洲鲑 (Aussie Salmon)",
    icon: "🐟",
    rigs: [
      {
        name: "铁板抛投",
        nameEn: "Metal Slug",
        level: "beginner",
        rod: "路亚/沙滩竿 2.7-3.3m",
        reel: "Spin 4000",
        line: "Braid PE 1.5-2",
        leader: "Fluoro 20lb",
        hook: "Assist Hook",
        bait: "20-40g 银/蓝银铁板 (细长型)",
        technique: "看到鲑鱼群炸水立即抛入群中快收",
        tip: "经验 · 冬季海滩最疯狂，一次出动可以走一群"
      },
      {
        name: "活虾漂钓",
        nameEn: "Live Prawn Float",
        level: "beginner",
        rod: "岩矶竿 3.6m",
        reel: "Spin 4000",
        line: "Mono 10-12lb",
        leader: "Fluoro 15lb",
        hook: "Suicide #2/0",
        bait: "活虾或冷冻白饵",
        technique: "浮漂钓在冲沟外",
        tip: "肉比黄尾粗糙，多数人 Catch & Release"
      }
    ]
  },

  "Jewfish": {
    nameCn: "石首鱼 (Mulloway)",
    icon: "🐟",
    rigs: [
      {
        name: "夜钓活饵",
        nameEn: "Live Bait Night Rig",
        level: "advanced",
        rod: "岩钓/沙滩重竿 Heavy Rod 3.6-4.2m (10-15kg)",
        reel: "Spin 8000-10000 或 Overhead",
        line: "Braid PE 4-6 (50-60lb)",
        leader: "Fluoro 60-80lb · 长 2m",
        hook: "Circle Hook 8/0-10/0 或 Gamakatsu Octopus 9/0",
        bait: "活 Mullet / Squid / Tailor 头部",
        technique: "大走铅沉底，头灯蓝光不要照水面；竿铃+夹子",
        tip: "经验 · 换潮前后 1 小时是金窗口；设好拖曳让鱼起竿后再收线"
      },
      {
        name: "Vibes 深沟",
        nameEn: "Vibe Lure Deep",
        level: "intermediate",
        rod: "路亚 Baitcast 或 Spin 2.1m (6-12kg)",
        reel: "Baitcast 200 或 Spin 4000",
        line: "Braid PE 2-3",
        leader: "Fluoro 30lb",
        hook: "拟饵自带",
        bait: "70-100mm Vibe / Blade",
        technique: "沉底后小幅抖竿 (lift-and-drop)，让 vibe 在底部跳动",
        tip: "Hawkesbury / Georges River 深沟常用"
      }
    ]
  },

  "Drummer": {
    nameCn: "黑毛 (Rock Blackfish)",
    icon: "🐟",
    rigs: [
      {
        name: "海鞘漂钓",
        nameEn: "Cunjevoi Float",
        level: "intermediate",
        rod: "岩矶竿 Heavy Rock Rod 4.5-5m",
        reel: "Spin 4000-5000",
        line: "Mono 15-20lb",
        leader: "Mono 20lb",
        hook: "Suicide #2/0-4/0",
        bait: "海鞘 Cunjevoi (最佳) / 卷心菜 Cabbage / 面包",
        technique: "浮漂调到让饵离底 30cm，涌浪推动时自然漂动",
        tip: "经验 · 冬季高潮最旺；咬口猛烈，鱼会第一时间冲礁，拉稳"
      }
    ]
  },

  "Squid": {
    nameCn: "鱿鱼 (Southern Calamari)",
    icon: "🦑",
    rigs: [
      {
        name: "鱿鱼布钩",
        nameEn: "Squid Jig (Egi)",
        level: "beginner",
        rod: "Egi 专用竿 2.4-2.7m 或软调路亚竿",
        reel: "Spin 2500",
        line: "Braid PE 0.6-0.8",
        leader: "Fluoro 10-12lb",
        hook: "内置 Egi 钓布钩 #2.5-3.5",
        bait: "布钩本身 (颜色：粉/橙/夜光)",
        technique: "抛到海草床让布钩沉到底，2-3 次大幅抽竿抬升，停顿 3-5 秒",
        tip: "经验 · 傍晚黄金 1 小时；墨汁上衣是你的荣誉勋章"
      }
    ]
  },

  "Trevally": {
    nameCn: "鲹鱼 (Silver Trevally)",
    icon: "🐟",
    rigs: [
      {
        name: "小饵漂钓",
        nameEn: "Berley Float",
        level: "beginner",
        rod: "岩矶竿 3.6m",
        reel: "Spin 3000",
        line: "Mono 8-10lb",
        leader: "Fluoro 10-12lb",
        hook: "Long Shank #1",
        bait: "小虾 / 磷虾 Krill",
        technique: "berley 诱集，小饵无铅漂进 berley 柱",
        tip: "经验 · 常和黑鲷一起来；冬季港内最稳"
      }
    ]
  },

  "Luderick": {
    nameCn: "黑鱼 (Blackfish)",
    icon: "🐟",
    rigs: [
      {
        name: "绿苔浮漂",
        nameEn: "Green Weed Float",
        level: "intermediate",
        rod: "专用黑鱼竿 Luderick Rod 3.6-4.2m (软调)",
        reel: "侧拨轮 Centerpin 或 Spin 3000",
        line: "Mono 6-8lb",
        leader: "Fluoro 6lb",
        hook: "细身 Luderick Hook #8-10",
        bait: "绿苔 Green Weed (最佳) / 海虫",
        technique: "浮漂钓在涌浪流中，饵要卷得紧",
        tip: "经验 · 克洛夫利、Gordons Bay 冬季爆护；浮漂下沉就立即扬竿"
      }
    ]
  },

  "Groper": {
    nameCn: "隆头鱼 (Blue Groper)",
    icon: "🐟",
    rigs: [
      {
        name: "红蟹重沉底",
        nameEn: "Red Crab Bottom",
        level: "advanced",
        rod: "岩钓重竿 Heavy Rock Rod 4m (PE 6-10)",
        reel: "Spin 6000 或 Overhead",
        line: "Braid PE 5-6 (60lb)",
        leader: "Mono 80-100lb · 长 1.5m",
        hook: "Heavy Suicide 6/0-8/0",
        bait: "红蟹 Red Crab (整只) 或 海胆 Sea Urchin",
        technique: "沉底等口，咬后立即大力起杆拉离礁石",
        tip: "⚠️ 注意 · 蓝色雄性隆头鱼在 NSW 受保护，禁止捕捞；只可 Catch & Release"
      }
    ]
  },

  "Bonito": {
    nameCn: "鲣鱼 (Australian Bonito)",
    icon: "🐟",
    rigs: [
      {
        name: "快速铁板",
        nameEn: "High Speed Metal",
        level: "intermediate",
        rod: "路亚竿 Spin 2.4-2.7m (PE 2-3)",
        reel: "Spin 4000-5000 高速型",
        line: "Braid PE 2",
        leader: "Fluoro 25-30lb",
        hook: "Assist Hook",
        bait: "30-60g 银色细长铁板",
        technique: "清晨炸水时抛入群中，最快速度收线",
        tip: "经验 · 夏季 5-8AM，一旦看到即停手中的其他线组；鱼群来去很快"
      }
    ]
  }
};
