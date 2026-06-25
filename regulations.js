// regulations.js — NSW 娱乐钓鱼法规 + 岩钓安全内容 (data module)
// NSW recreational fishing rules + rock-fishing safety content.
//
// 挂到 window.* (全局命名空间，无构建步骤)。在 app.js 之前加载。
// Keyed by the EXACT English species names used in rigs.js / spots.js species[] so it
// joins cleanly with the catch form, rig data and spot species chips.
//
// ⚠️ 重要 / IMPORTANT: 法规会变动，岩钓有致命风险。本数据仅供参考，一切以 NSW DPI 官方为准，
//    不构成法律或安全建议。Limits change; this is a convenience copy — always verify with NSW DPI.
//    每条带 lastUpdated；上线前请由专人逐条核对官方数据。

(function () {
  "use strict";

  // 全局元信息：统一的更新日期、免责声明、官方链接（复用 reviews.js _global 的 DPI URL）。
  window.NSW_REGULATIONS_META = {
    lastUpdated: "2026-06-25",
    dpiUrl: "https://www.dpi.nsw.gov.au/fishing/recreational/resources/saltwater-bag-and-size-limits",
    safetyUrl: "https://www.dpi.nsw.gov.au/fishing/recreational/fishing-safety/rock-fishing-safety",
    disclaimerCn: "数据仅供参考 · 法规以 NSW DPI 官方为准 · 本应用不构成法律建议",
    disclaimerEn: "Reference only · NSW DPI is authoritative · not legal advice"
  };

  // 字段说明 / fields:
  //   minSizeCm   最小合法尺寸 (null = 无 / 查官方)
  //   maxSizeCm   最大尺寸 / slot 上限 (null = 无)
  //   bagLimit    每日袋装上限 (null = 查官方)
  //   closedMonths 禁渔月份 1-12 ([] = 无)
  //   protected   true = 受保护 / 当前禁捕 (仅 C&R)
  //   noteCn/noteEn 备注 (双语)
  window.NSW_REGULATIONS = {
    Kingfish: {
      nameCn: "澳洲黄尾鰤", minSizeCm: 65, maxSizeCm: null, bagLimit: 5, closedMonths: [], protected: false,
      noteCn: "黄尾鰤 (Yellowtail Kingfish) 最小 65cm，每日 5 尾。", noteEn: "Yellowtail Kingfish — 65cm min, 5/day."
    },
    Bream: {
      nameCn: "黑鲷", minSizeCm: 25, maxSizeCm: null, bagLimit: 20, possessionLimit: 40, closedMonths: [], protected: false,
      noteCn: "黑鲷/黄鳍鲷与 Tarwhine 合计每日 20 尾；持有上限 40。", noteEn: "Bream & Tarwhine combined bag 20; possession 40."
    },
    Flathead: {
      nameCn: "沙鳕", minSizeCm: 36, maxSizeCm: 70, bagLimit: 10, possessionLimit: 20, closedMonths: [], protected: false,
      noteCn: "Dusky Flathead 36–70cm 为可留区间；>70cm 必须放流。每日合计 10 尾。",
      noteEn: "Dusky Flathead slot 36–70cm; release any over 70cm. Combined bag 10."
    },
    Whiting: {
      nameCn: "沙梭", minSizeCm: 27, maxSizeCm: null, bagLimit: 20, closedMonths: [], protected: false,
      noteCn: "Sand Whiting 最小 27cm，每日 20 尾。", noteEn: "Sand Whiting — 27cm min, 20/day."
    },
    Tailor: {
      nameCn: "乔鱼/曹白", minSizeCm: 30, maxSizeCm: null, bagLimit: 20, possessionLimit: 40, closedMonths: [], protected: false,
      noteCn: "Tailor 最小 30cm，每日 20 尾。", noteEn: "Tailor — 30cm min, 20/day."
    },
    Salmon: {
      nameCn: "澳洲鲑", minSizeCm: null, maxSizeCm: null, bagLimit: 5, closedMonths: [], protected: false,
      noteCn: "Australian Salmon 无最小尺寸限制，每日 5 尾。", noteEn: "Australian Salmon — no min length, 5/day."
    },
    Jewfish: {
      nameCn: "石首鱼", minSizeCm: 70, maxSizeCm: null, bagLimit: 2, closedMonths: [], protected: false,
      noteCn: "Mulloway (Jewfish) 最小 70cm，每日 2 尾。", noteEn: "Mulloway/Jewfish — 70cm min, 2/day."
    },
    Drummer: {
      nameCn: "黑毛", minSizeCm: 30, maxSizeCm: null, bagLimit: 10, closedMonths: [], protected: false,
      noteCn: "Eastern Rock Blackfish (Drummer) 最小 30cm，每日 10 尾。", noteEn: "Rock Blackfish/Drummer — 30cm min, 10/day."
    },
    Squid: {
      nameCn: "鱿鱼", minSizeCm: null, maxSizeCm: null, bagLimit: 20, closedMonths: [], protected: false,
      noteCn: "鱿鱼/墨鱼/章鱼合计每日 20 只，无尺寸限制。", noteEn: "Squid/cuttlefish/octopus — combined 20/day, no size limit."
    },
    Trevally: {
      nameCn: "鲹鱼", minSizeCm: null, maxSizeCm: null, bagLimit: 20, possessionLimit: 40, closedMonths: [], protected: false,
      noteCn: "Silver Trevally 无最小尺寸（建议查官方），每日 20 尾。", noteEn: "Silver Trevally — verify min length with DPI, 20/day."
    },
    Luderick: {
      nameCn: "黑鱼/矶鱼", minSizeCm: 27, maxSizeCm: null, bagLimit: 20, possessionLimit: 40, closedMonths: [], protected: false,
      noteCn: "Luderick (黑鱼) 最小 27cm，每日 20 尾。", noteEn: "Luderick (blackfish) — 27cm min, 20/day."
    },
    Groper: {
      nameCn: "蓝隆头鱼", minSizeCm: null, maxSizeCm: null, bagLimit: 0, closedMonths: [], protected: true,
      noteCn: "🚫 Eastern Blue Groper 是 NSW 州鱼；禁止矛枪捕捞；线钓禁捕已延长至 2028-03-01（2025-03 起 3 年）——仅可钓获放流 (C&R)，以官方为准。",
      noteEn: "🚫 Eastern Blue Groper (NSW state fish) — no spearfishing; line-fishing take closed until 1 Mar 2028 (3-yr extension from Mar 2025). Catch & release only."
    },
    Bonito: {
      nameCn: "鲣鱼", minSizeCm: null, maxSizeCm: null, bagLimit: 20, closedMonths: [], protected: false,
      noteCn: "Bonito 无最小尺寸（建议查官方），每日 20 尾。", noteEn: "Bonito — verify min length with DPI, 20/day."
    }
  };

  // 岩钓安全内容：静态提醒 + 新手安全教程。岩钓在澳洲每年都有溺亡，安全第一。
  // Rock-fishing safety: static reminders + a short beginner tutorial.
  window.SAFETY_CONTENT = {
    // 每个岩钓点都展示的固定提醒。
    rockReminders: [
      { cn: "穿救生衣 — NSW 多区岩钓法律强制，违者罚 $100", en: "Lifejacket — legally required rock fishing in declared NSW areas ($100 fine)" },
      { cn: "穿防滑钉鞋 / 毡底鞋", en: "Wear cleated / felt-sole rock boots" },
      { cn: "永远不要独自作钓，告知家人行程", en: "Never fish alone; tell someone your plan" },
      { cn: "下竿前查涌浪与天气，背对海面=危险", en: "Check swell & weather first; never turn your back to the sea" },
      { cn: "观察 10 分钟看最大浪能打到哪，预留逃生路线", en: "Watch 10 min for the biggest set; plan an escape route" }
    ],
    // 简短双语新手教程（弹窗展示）。
    tutorialTitleCn: "新手岩钓安全 5 步",
    tutorialTitleEn: "Rock Fishing Safety — 5 Steps for Beginners",
    tutorial: [
      { cn: "1. 出发前查浪高与周期：有效浪 >2m 或长周期涌 (≥13s) 直接改期。", en: "1. Check swell height & period before you go; >2m effective or long-period (≥13s) groundswell = stay home." },
      { cn: "2. 穿救生衣 + 防滑钉鞋，绝不赤脚或穿普通鞋上湿岩。", en: "2. Lifejacket + cleated boots; never bare feet or street shoes on wet rock." },
      { cn: "3. 到点先观察 10 分钟，看最大一组浪打到哪里，站在其上方。", en: "3. Watch 10 minutes; note where the biggest set reaches and stay above it." },
      { cn: "4. 结伴而行，手机防水袋，记下最近的天使环 (Angel Ring) 位置。", en: "4. Go with a buddy; waterproof your phone; note the nearest Angel Ring." },
      { cn: "5. 浪一变大立即收竿撤离——没有一条鱼值得用命换。", en: "5. If the swell builds, leave immediately — no fish is worth your life." }
    ],
    // NSW Rock Fishing Safety Act — lifejackets are LAW in these declared LGAs ($100 fine).
    lifejacketLGAs: ["Randwick", "Northern Beaches", "Sutherland", "Central Coast", "Lake Macquarie", "Port Stephens", "Ballina", "Richmond Valley"],
    lifejacketNoteCn: "以下分区岩钓法律强制穿救生衣（成人 AS 4758 50S 以上，12 岁以下需 100 级），违者罚 $100：Randwick、Northern Beaches、Sutherland、Central Coast、Lake Macquarie、Port Stephens、Ballina、Richmond Valley。",
    lifejacketNoteEn: "Lifejackets are legally mandatory when rock fishing in these LGAs (adult AS 4758 50S+, level 100 for under-12s), $100 fine: Randwick, Northern Beaches, Sutherland, Central Coast, Lake Macquarie, Port Stephens, Ballina, Richmond Valley.",
    disclaimerCn: "本应用不保证安全。岩钓有致命风险，请量力而行。",
    disclaimerEn: "This app is not a safety guarantee. Rock fishing can be fatal — know your limits."
  };
})();
