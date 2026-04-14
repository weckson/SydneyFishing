// Seeded sample reviews for popular Sydney fishing spots.
// User-added reviews are stored in localStorage under key "sf_reviews".
// Each review: { user, rating (1-5), date (YYYY-MM-DD), text }
window.SEED_REVIEWS = {
  "bare-island": [
    { user: "Kingfish_Hunter", rating: 5, date: "2026-02-14", text: "夏天清晨来这里从没空军过。上周用活鱿钓到 78cm 黄尾，当天走了 3 条。涨潮前 1 小时是黄金时间。" },
    { user: "Sam_Sydney", rating: 4, date: "2026-01-22", text: "Land-based king heaven, but gets very crowded on weekends. Get there before sunrise or forget it." },
    { user: "老陈钓鱼", rating: 5, date: "2025-12-30", text: "岩石真的很滑，第一次去差点滑倒。一定要穿防滑钉鞋，戴救生背心。鱼况确实顶级。" }
  ],
  "hornby-light": [
    { user: "Mitch_LBG", rating: 5, date: "2026-03-02", text: "Best land-based kingfish platform in Sydney, hands down. Got a 95cm hoodlum on live squid last summer. Deep water right off the rocks." },
    { user: "FishNerd", rating: 5, date: "2026-02-10", text: "传奇点位。涌浪大于 1.5m 千万别去，真的会出事。平静日清晨涨潮是天堂。" },
    { user: "CharlieW", rating: 4, date: "2025-11-18", text: "Long walk from the carpark with a lot of gear but 100% worth it. Bring a friend." }
  ],
  "north-head": [
    { user: "Pelagic_Pete", rating: 5, date: "2026-03-10", text: "夏季鲣鱼和黄尾，冬季黑毛，全年都有货。最大的问题是涌浪 —— 务必查预报。" },
    { user: "JennyR", rating: 4, date: "2026-01-05", text: "Stunning views, solid tailor runs at dawn. Heavy gear needed — kings run straight into the reef." }
  ],
  "long-reef": [
    { user: "NorthyLocal", rating: 5, date: "2026-02-28", text: "早潮一定要退潮的时候走过去，不然就回不来了。salmon 冬天爆发，metal 铁板就行。" },
    { user: "Dave_M", rating: 4, date: "2026-01-15", text: "Great spot but it's a walk. Southerly swell makes it unfishable, check the BOM first." }
  ],
  "bradleys-head": [
    { user: "HarbourLife", rating: 5, date: "2026-02-20", text: "港内钓黄尾首选。用活饵 yakka 效果最好，周末人多点但位置够。" },
    { user: "Emma_T", rating: 4, date: "2026-01-28", text: "Easy walk in, deep water. Got a 65cm king on a live slimy. Bring a long-handled net!" }
  ],
  "bare-island-dupe": [], // placeholder unused
  "clovelly": [
    { user: "LuderickKing", rating: 5, date: "2026-03-05", text: "绿苔钓黑鱼的经典点，几乎每次都有货。涨潮两小时最佳。" },
    { user: "BreamBuster", rating: 4, date: "2026-01-10", text: "Reliable winter drummer. Bring plenty of cunje and a steady berley trail." }
  ],
  "shark-point-clovelly": [
    { user: "Leon_Fishing", rating: 5, date: "2026-02-25", text: "东区最稳定的 LBG 点位。上个月连续三个早上都有黄尾咬口。活饵 > 铁板。" },
    { user: "CoogeeGuy", rating: 5, date: "2026-02-02", text: "Don't sleep on this spot. Less crowded than Hornby and equally productive on its day." }
  ],
  "jew-hole": [
    { user: "NightFisho", rating: 5, date: "2026-03-08", text: "夜钓换潮，活鱿下杆，石首鱼真的会出来。钓了一条 105cm 的，一辈子难忘。" },
    { user: "Marco_P", rating: 4, date: "2026-01-30", text: "Heavy tackle essential, big rocks, big fish. Headlamp and a mate recommended." }
  ],
  "magic-point": [
    { user: "MaroubraLocal", rating: 5, date: "2026-02-18", text: "夏季清晨鲣鱼群来袭，小铁板一甩一个准。水下有护士鲨，钓到请放流。" }
  ],
  "cape-banks": [
    { user: "LaPerouseMate", rating: 5, date: "2026-03-01", text: "Long walk across the land bridge but the rocks out there are untouched on weekdays. Summer pelagics go off." }
  ],
  "inscription-point": [
    { user: "KurnellKing", rating: 5, date: "2026-02-12", text: "距离停车场只要 10 分钟，下去就是深水。清晨涨潮活饵基本必中。" },
    { user: "AussieAngler", rating: 4, date: "2026-01-18", text: "Historic spot with great fishing. Watch the wash — a few good dunkings here over the years." }
  ],
  "palm-beach": [
    { user: "PittwaterJo", rating: 5, date: "2026-03-12", text: "码头钓王 —— 活鱿吊钩是标配。鱼会往桩子里钻，用 40lb leader 起步。" },
    { user: "NorthernBeachesDad", rating: 4, date: "2026-02-05", text: "Great family spot plus serious fish. Kids catch squid while dad waits for the king bite." }
  ],
  "brooklyn": [
    { user: "HawkesburyHermit", rating: 5, date: "2026-02-22", text: "夜钓换潮下活乌头，耐心等待大石首鱼。上个月一条 112cm，纪录。" }
  ],
  "bare-island-2": [], // unused
  "cronulla-point": [
    { user: "TheShire", rating: 4, date: "2026-02-08", text: "Winter drummer paradise. Get there early, best spots fill up fast." }
  ],
  "bondi-rocks": [
    { user: "BondiBob", rating: 4, date: "2026-01-25", text: "东区最容易到达的 LBG 点位。平静的夏季清晨黄尾会进来打食。" }
  ],
  "maroubra-rocks": [
    { user: "MaroubraMick", rating: 5, date: "2026-02-28", text: "Consistent land-based kingfish when the water's clean. Don't cast into the wash — drop it in." }
  ],
  "diamond-bay": [
    { user: "VaucluseV", rating: 5, date: "2026-03-03", text: "很多本地高手的秘密点，需要绳索下去。只在平静日来，涌浪大绝对致命。" }
  ],
  "bare-island-3": [], // unused
  "narrabeen-lake": [
    { user: "LagoonLife", rating: 4, date: "2026-02-15", text: "清晨 surface popper 钓沙梭非常好玩，全家都能来。潮口退潮两小时鱼最多。" }
  ],
  "the-spit": [
    { user: "SoftPlasticSam", rating: 4, date: "2026-01-12", text: "Flathead machine on soft plastics along the drop-off. Watch boat wakes." }
  ],
  "balmoral": [
    { user: "LowerNorthie", rating: 4, date: "2026-02-10", text: "家庭点位，鱿鱼和黑鲷稳定。夏天黄尾偶尔进来追饵群。" }
  ]
};
