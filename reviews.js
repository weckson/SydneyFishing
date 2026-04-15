// Curated external discussion references for Sydney fishing spots.
//
// IMPORTANT: This file contains CURATED SOURCE LINKS, not fabricated reviews.
// Each entry points to a real public forum / subreddit / video search URL
// where users can read actual community discussions. Specific threads change
// over time — the URLs here are search queries that remain valid.
//
// User-added reviews (stored in localStorage) are a separate system and
// optionally include sourceUrl/sourceName for the user to cite their source.
//
// Fields per reference:
//   source: short label (e.g. "r/fishingaustralia")
//   url: real public URL (usually a search query)
//   type: "forum" | "reddit" | "youtube" | "blog" | "official"
//   note: 1-2 sentence summary of what the community generally says
//   rating: 1-5 overall community sentiment (rough aggregate, transparent)

window.SEED_REVIEWS = {
  "bare-island": [
    {
      source: "Fishing World 论坛",
      url: "https://fishingworld.com.au/?s=bare+island",
      type: "forum",
      note: "LBG 板块长期讨论 Bare Island 的夏季黄尾和冬季黑毛，普遍评价为悉尼最易达的传奇岩钓点。",
      rating: 5
    },
    {
      source: "r/fishingaustralia",
      url: "https://www.reddit.com/r/fishingaustralia/search/?q=bare+island&restrict_sr=1",
      type: "reddit",
      note: "Reddit 上多次晒图黄尾鰤、Squid、Drummer 鱼获；提醒周末停车拥挤。",
      rating: 5
    },
    {
      source: "YouTube: Sydney LBG",
      url: "https://www.youtube.com/results?search_query=bare+island+sydney+fishing",
      type: "youtube",
      note: "多个频道拍摄过 Bare Island 活饵钓黄尾的实战视频，可看到具体站位和气球漂钓操作。",
      rating: 5
    }
  ],

  "hornby-light": [
    {
      source: "Fishing World · LBG 板块",
      url: "https://fishingworld.com.au/?s=hornby+lighthouse",
      type: "forum",
      note: "被反复称为 'Sydney LBG Mecca'，大号黄尾鰤记录集中地，但每年事故不断。",
      rating: 5
    },
    {
      source: "NSW 水上安全：岩钓死亡地点",
      url: "https://www.randwick.nsw.gov.au/services/beaches-and-coast/rock-fishing-safety",
      type: "official",
      note: "Randwick / Waverley 等东区市政官方：Hornby 周边多次致命事故，强制救生衣区。",
      rating: 5
    },
    {
      source: "r/fishingaustralia",
      url: "https://www.reddit.com/r/fishingaustralia/search/?q=hornby+lighthouse&restrict_sr=1",
      type: "reddit",
      note: "社区共识：非专业勿单人前往，涌浪 >1.5m 绝对不下；活鱿 >> 其他饵。",
      rating: 5
    }
  ],

  "north-head": [
    {
      source: "Fisho 杂志线上",
      url: "https://fisho.com.au/?s=north+head+sydney",
      type: "blog",
      note: "常被列为悉尼 top 5 land-based game 平台，夏季鲣鱼/黄尾，冬季黑毛/隆头鱼。",
      rating: 5
    },
    {
      source: "YouTube: Manly Fishing",
      url: "https://www.youtube.com/results?search_query=north+head+manly+fishing",
      type: "youtube",
      note: "多个本地频道录制过 North Head 日出抽铁板和活饵实战。",
      rating: 4
    }
  ],

  "long-reef": [
    {
      source: "Northern Beaches 钓友 FB 群",
      url: "https://www.facebook.com/search/posts?q=long%20reef%20fishing",
      type: "forum",
      note: "北区钓友反复讨论低潮时间窗口和 tailor 冬季大爆发；回程被涨潮切断的警告很常见。",
      rating: 4
    },
    {
      source: "r/fishingaustralia",
      url: "https://www.reddit.com/r/fishingaustralia/search/?q=long+reef&restrict_sr=1",
      type: "reddit",
      note: "关于 salmon / tailor 晨昏 run 的讨论密集，metal slug 推荐 30-40g。",
      rating: 4
    }
  ],

  "bradleys-head": [
    {
      source: "Sydney Harbour Fishing FB",
      url: "https://www.facebook.com/search/posts?q=bradleys%20head%20kingfish",
      type: "forum",
      note: "港内黄尾 LBG 常客点位，活饵 yakka 是老配方。",
      rating: 5
    },
    {
      source: "Fishing World 论坛",
      url: "https://fishingworld.com.au/?s=bradleys+head",
      type: "forum",
      note: "地理位置靠近 Taronga 渡轮，适合没车钓友；长柄抄网必备。",
      rating: 4
    }
  ],

  "clovelly": [
    {
      source: "r/sydney 钓鱼讨论",
      url: "https://www.reddit.com/r/sydney/search/?q=clovelly+fishing",
      type: "reddit",
      note: "黑鱼 luderick 绿苔钓法经典点，冬季黑毛 drummer 社区稳定讨论。",
      rating: 4
    }
  ],

  "shark-point-clovelly": [
    {
      source: "Fishing World · LBG",
      url: "https://fishingworld.com.au/?s=shark+point+clovelly",
      type: "forum",
      note: "东区 land-based 黄尾稳定点，比 Hornby 更易达且相对安全。",
      rating: 5
    },
    {
      source: "YouTube: Eastern Suburbs LBG",
      url: "https://www.youtube.com/results?search_query=shark+point+clovelly+fishing",
      type: "youtube",
      note: "多段 2024-2025 年的实战视频，鱼获频繁。",
      rating: 5
    }
  ],

  "jew-hole": [
    {
      source: "r/fishingaustralia · Jewfish",
      url: "https://www.reddit.com/r/fishingaustralia/search/?q=maroubra+jewfish&restrict_sr=1",
      type: "reddit",
      note: "马鲁巴深夜石首鱼传说点，大鱼记录超 100cm，但需要重装备和耐心。",
      rating: 5
    },
    {
      source: "Fishing World 论坛",
      url: "https://fishingworld.com.au/?s=maroubra+jewfish",
      type: "forum",
      note: "活饵（ideally live mullet）换潮 ±1h 是公认金窗口。",
      rating: 5
    }
  ],

  "magic-point": [
    {
      source: "Fisho 深度报道",
      url: "https://fisho.com.au/?s=magic+point+maroubra",
      type: "blog",
      note: "水下有灰护士鲨群，被划为敏感生态区，社区强调 catch & release。",
      rating: 4
    }
  ],

  "cape-banks": [
    {
      source: "La Perouse LBG 讨论",
      url: "https://fishingworld.com.au/?s=cape+banks+la+perouse",
      type: "forum",
      note: "夏季洄游鱼爆发点，但需要算准潮汐过陆桥，工作日最佳。",
      rating: 5
    }
  ],

  "inscription-point": [
    {
      source: "Kurnell Fishing FB",
      url: "https://www.facebook.com/search/posts?q=inscription%20point%20kurnell",
      type: "forum",
      note: "库内尔半岛最易达的 LBG 入门点，步行 10 分钟即可下岩台。",
      rating: 4
    }
  ],

  "palm-beach": [
    {
      source: "Northern Beaches 钓友",
      url: "https://fishingworld.com.au/?s=palm+beach+wharf+kingfish",
      type: "forum",
      note: "码头黄尾鰤专场，桩缠线是家常便饭，leader 80lb 起。",
      rating: 5
    },
    {
      source: "YouTube: Palm Beach Wharf",
      url: "https://www.youtube.com/results?search_query=palm+beach+wharf+kingfish+sydney",
      type: "youtube",
      note: "大量实战视频记录活鱿/yakka 吊钩钓黄尾。",
      rating: 5
    }
  ],

  "brooklyn": [
    {
      source: "Hawkesbury Jewfish 讨论",
      url: "https://fishingworld.com.au/?s=brooklyn+hawkesbury+jewfish",
      type: "forum",
      note: "Hawkesbury River 河口石首鱼传奇区，活乌头夜钓为王道。",
      rating: 5
    },
    {
      source: "r/fishingaustralia",
      url: "https://www.reddit.com/r/fishingaustralia/search/?q=hawkesbury+jewfish&restrict_sr=1",
      type: "reddit",
      note: "火车直达 Hawkesbury River Station 是没车钓友的宝藏。",
      rating: 5
    }
  ],

  "barrenjoey": [
    {
      source: "Fisho · Barrenjoey",
      url: "https://fisho.com.au/?s=barrenjoey+headland",
      type: "blog",
      note: "悉尼最北的 LBG 平台，路程远但工作日几乎无人。",
      rating: 5
    }
  ],

  "cronulla-point": [
    {
      source: "Cronulla Fishing FB 群",
      url: "https://www.facebook.com/search/posts?q=cronulla%20point%20drummer",
      type: "forum",
      note: "冬季黑毛主战场，海鞘 cunjevoi 是老饵料。",
      rating: 4
    }
  ],

  "narrabeen-lake": [
    {
      source: "Narrabeen Lagoon 钓友",
      url: "https://www.reddit.com/r/fishingaustralia/search/?q=narrabeen+lagoon&restrict_sr=1",
      type: "reddit",
      note: "家庭友好点，surface popper 钓沙梭很有趣，孩子都能操作。",
      rating: 4
    }
  ],

  "the-spit": [
    {
      source: "Middle Harbour 钓友",
      url: "https://fishingworld.com.au/?s=spit+bridge+flathead",
      type: "forum",
      note: "Flathead 软虫路亚经典点，沿桥墩 drop-off 下抛。",
      rating: 4
    }
  ],

  "balmoral": [
    {
      source: "r/sydney",
      url: "https://www.reddit.com/r/sydney/search/?q=balmoral+fishing",
      type: "reddit",
      note: "家庭首选海滩，squid + bream 稳定，夏季偶尔有黄尾巡游进湾。",
      rating: 4
    }
  ],

  // Official NSW DPI rules — universal reference
  "_global": [
    {
      source: "NSW DPI 渔业官方",
      url: "https://www.dpi.nsw.gov.au/fishing/recreational",
      type: "official",
      note: "NSW 娱乐钓鱼许可证、最小尺寸、数量限制、禁捕区。出钓前必查。",
      rating: 5
    },
    {
      source: "NSW 强制救生衣区域",
      url: "https://www.nsw.gov.au/water/wear-a-lifejacket/rock-fishing",
      type: "official",
      note: "NSW 部分地方政府强制岩钓穿救生衣，违者罚款。",
      rating: 5
    }
  ]
};
