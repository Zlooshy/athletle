// Athlete list loader. Each sport file calls add(sport, rows).
// Row: [name, country code, born YYYY-MM-DD, height cm, est. net worth $M, team, league, position, daily (1 = mainstream, can be a daily answer), wiki title]
// Team/league reflect the 2025/26 season as best known; check after each transfer window.
// Net worth figures are rough public estimates.
const ATHLETES = [];
function add(sport, rows) {
  for (const r of rows) {
    ATHLETES.push({ name: r[0], nat: r[1], born: r[2], height: r[3], netWorth: r[4], team: r[5] || "", league: r[6] || "",
      pos: r[7] || "", daily: !!r[8], wiki: r[9] || "", sport });
  }
}
