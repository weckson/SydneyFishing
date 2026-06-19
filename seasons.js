// Species seasonality for Sydney (NSW) — monthly activity multipliers.
// Index 0 = January … 11 = December. Range ~0.6 (well off-season) to 1.2 (prime).
// Sources (checked 2026-06): Sydney Premium Charters seasonal guide, Wahoo Charters
// species calendar, Fishing World "Top winter rock fishing species", Fishabout
// Sydney Harbour winter fishing notes. Southern-hemisphere seasons:
// summer = Dec–Feb, autumn = Mar–May, winter = Jun–Aug, spring = Sep–Nov.
window.SPECIES_SEASONS = {
  //            1月    2月    3月    4月    5月    6月    7月    8月    9月    10月   11月   12月
  // Yellowtail kingfish: inshore Dec–Apr, builds from spring; deep/offshore in winter.
  Kingfish:  [1.20,  1.20,  1.15,  1.05,  0.85,  0.65,  0.60,  0.65,  0.85,  0.95,  1.10,  1.20],
  // Yellowfin bream: year-round; big winter fish school near river mouths to spawn.
  Bream:     [1.00,  1.00,  1.05,  1.10,  1.10,  1.10,  1.10,  1.05,  1.00,  1.00,  1.00,  1.00],
  // Dusky flathead: warm-month estuary staple; slows markedly mid-winter.
  Flathead:  [1.15,  1.15,  1.10,  1.05,  0.90,  0.75,  0.70,  0.75,  0.95,  1.10,  1.15,  1.15],
  // Sand whiting: peak on summer flats/beaches; quiet in winter.
  Whiting:   [1.20,  1.20,  1.10,  0.95,  0.80,  0.65,  0.60,  0.65,  0.80,  0.95,  1.10,  1.20],
  // Tailor: cooler-month run, autumn–winter beaches/rocks.
  Tailor:    [0.85,  0.85,  1.00,  1.10,  1.15,  1.15,  1.15,  1.10,  1.00,  0.90,  0.85,  0.85],
  // Australian salmon: classic winter pelagic on beaches and headlands.
  Salmon:    [0.70,  0.70,  0.80,  0.95,  1.10,  1.20,  1.20,  1.20,  1.10,  0.95,  0.80,  0.70],
  // Mulloway/jewfish: year-round; best late autumn–winter in estuaries, summer beach nights ok.
  Jewfish:   [1.00,  1.00,  1.05,  1.10,  1.15,  1.15,  1.10,  1.05,  0.95,  0.95,  0.95,  1.00],
  // Rock blackfish (drummer): prime winter rock species.
  Drummer:   [0.65,  0.65,  0.80,  1.00,  1.15,  1.20,  1.20,  1.20,  1.05,  0.90,  0.75,  0.65],
  // Calamari/arrow squid: year-round with winter–spring peak.
  Squid:     [0.90,  0.90,  0.95,  1.00,  1.05,  1.10,  1.10,  1.10,  1.10,  1.05,  1.00,  0.90],
  // Silver trevally: deeper ledges and harbour in numbers through winter.
  Trevally:  [0.85,  0.85,  0.90,  1.00,  1.10,  1.15,  1.15,  1.15,  1.05,  0.95,  0.90,  0.85],
  // Luderick: year-round but winter spawning run is prime time.
  Luderick:  [0.85,  0.85,  0.90,  1.00,  1.15,  1.20,  1.20,  1.15,  1.05,  0.95,  0.90,  0.85],
  // Blue groper: year-round when seas allow; winter often calmest windows + crab baits.
  Groper:    [0.95,  0.95,  0.95,  1.00,  1.05,  1.10,  1.10,  1.10,  1.05,  1.00,  0.95,  0.95]
};

// Weight of each species position in a spot's species list (primary target weighs most).
window.SEASON_SPECIES_WEIGHTS = [0.45, 0.25, 0.15, 0.10, 0.05];
