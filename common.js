// Shared by the game, archive and check pages.
const Athletle = (() => {
  const LAUNCH = new Date(2026, 9, 2); // puzzle #1 = 2 Oct 2026 (local time)
  const STORE_KEY = "athletle-v3"; // v3: one save per sport game
  const MAX_GUESSES = 10;

  // ---------- game modes ----------
  // cols: which clue columns the board shows. labels: per-mode column names.
  const MODES = {
    all: { label: "All sports", icon: "🏆", sports: null, cols: ["sport", "nation", "age", "height", "worth"] },
    soccer: { label: "Soccer", icon: "⚽", sports: ["Soccer"], cols: ["team", "league", "pos", "nation", "age", "height"],
      labels: { team: "Club" } },
    basketball: { label: "Basketball", icon: "🏀", sports: ["Basketball"], cols: ["team", "league", "pos", "nation", "age", "height"],
      labels: { league: "Conf." } },
    football: { label: "NFL", icon: "🏈", sports: ["American Football"], cols: ["team", "league", "pos", "nation", "age", "height"],
      labels: { league: "Conf." } },
    baseball: { label: "Baseball", icon: "⚾", sports: ["Baseball"], cols: ["team", "league", "pos", "nation", "age", "height"] },
    hockey: { label: "Hockey", icon: "🏒", sports: ["Ice Hockey"], cols: ["team", "league", "pos", "nation", "age", "height"],
      labels: { league: "Conf." } },
    tennis: { label: "Tennis", icon: "🎾", sports: ["Tennis"], cols: ["league", "pos", "nation", "age", "height", "worth"],
      labels: { league: "Tour", pos: "Plays" } },
    golf: { label: "Golf", icon: "⛳", sports: ["Golf"], cols: ["league", "nation", "age", "height", "worth"], labels: { league: "Tour" } },
    f1: { label: "F1", icon: "🏎️", sports: ["Formula 1"], cols: ["team", "nation", "age", "height", "worth"] },
    athletics: { label: "Athletics", icon: "🏃", sports: ["Athletics"], cols: ["pos", "nation", "age", "height", "worth"],
      labels: { pos: "Event" } },
    fighting: { label: "MMA & Boxing", icon: "🥊", sports: ["MMA", "Boxing"], cols: ["sport", "league", "pos", "nation", "age", "height"],
      labels: { league: "Promotion", pos: "Weight" } },
    cricket: { label: "Cricket", icon: "🏏", sports: ["Cricket"], cols: ["team", "pos", "nation", "age", "height"],
      labels: { team: "IPL team", pos: "Role" } },
    rugby: { label: "Rugby", icon: "🏉", sports: ["Rugby"], cols: ["team", "league", "pos", "nation", "age", "height"],
      labels: { team: "Club" } },
    olympic: { label: "Olympic & more", icon: "🏅", sports: ["Swimming", "Gymnastics", "Winter Sports", "Skateboarding"],
      cols: ["sport", "pos", "nation", "age", "height", "worth"], labels: { pos: "Event" } },
  };
  const COL_LABELS = { sport: "Sport", team: "Team", league: "League", pos: "Position", nation: "Nation", age: "Age",
    height: "Height", worth: "Net worth" };
  function modeFromURL() {
    const m = new URLSearchParams(location.search).get("mode");
    return MODES[m] ? m : "all";
  }
  const inMode = (mode, a) => !MODES[mode].sports || MODES[mode].sports.includes(a.sport);
  const poolCache = {};
  function pool(mode) { return (poolCache[mode] ||= ATHLETES.filter((a) => inMode(mode, a))); }
  function dailyPool(mode) { return (poolCache["daily:" + mode] ||= pool(mode).filter((a) => a.daily)); }

  // ---------- days ----------
  function dayNumber(d = new Date()) {
    const today = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.round((today - LAUNCH) / 86400000);
  }
  function dateForDay(n) { return new Date(LAUNCH.getFullYear(), LAUNCH.getMonth(), LAUNCH.getDate() + n); }

  // Seeded shuffle per game mode, so everyone gets the same athlete on the same day
  // and nobody repeats until that mode's daily list has been used up.
  function mulberry32(a) {
    return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function hashStr(s) { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }
  function athleteForDay(mode, n) {
    const list = dailyPool(mode);
    const cycle = Math.floor(n / list.length);
    const rand = mulberry32(hashStr(mode) + 20261002 + cycle * 7919);
    const order = list.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    return list[order[((n % list.length) + list.length) % list.length]];
  }

  // ---------- storage (safe if blocked) ----------
  function load() {
    let s;
    try { s = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { s = {}; }
    s.modes ||= {};
    return s;
  }
  function modeState(s, mode) {
    return (s.modes[mode] ||= { stats: { played: 0, wins: 0, streak: 0, best: 0, lastWinDay: null }, days: {} });
  }
  function save(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {} }

  // ---------- small cache for looked-up images ----------
  const CACHE_KEY = "athletle-media-v1";
  let media;
  try { media = JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch { media = {}; }
  let saveTimer;
  function remember(key, val) {
    media[key] = val;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { try { localStorage.setItem(CACHE_KEY, JSON.stringify(media)); } catch {} }, 500);
  }

  // ---------- TheSportsDB (logos, backup photos). Free key, ~30 requests a minute. ----------
  const SDB = "https://www.thesportsdb.com/api/v1/json/123/";
  const sdbQueue = [];
  let sdbBusy = false;
  function sdb(path) {
    return new Promise((resolve) => { sdbQueue.push({ path, resolve }); pumpSdb(); });
  }
  async function pumpSdb() {
    if (sdbBusy || !sdbQueue.length) return;
    sdbBusy = true;
    const job = sdbQueue.shift();
    let wait = 2100; // stay under the free rate limit
    try {
      const r = await fetch(SDB + job.path);
      if (r.status === 429) { sdbQueue.unshift(job); wait = 61000; }
      else job.resolve(r.ok ? await r.json() : null);
    } catch { job.resolve(undefined); } // network/CORS failure: don't cache
    setTimeout(() => { sdbBusy = false; pumpSdb(); }, wait);
  }
  const SDB_SPORT = { Soccer: "Soccer", Basketball: "Basketball", "American Football": "American Football", Baseball: "Baseball",
    "Ice Hockey": "Ice Hockey", Rugby: "Rugby", Cricket: "Cricket", "Formula 1": "Motorsport" };
  const inflight = {};
  function once(key, fn) {
    if (key in media) return Promise.resolve(media[key]);
    return (inflight[key] ||= fn().then((v) => { if (v !== undefined) remember(key, v); return v ?? null; }));
  }
  function teamInfo(sport, team) {
    return once(`team|${sport}|${team}`, async () => {
      const j = await sdb(`searchteams.php?t=${encodeURIComponent(team)}`);
      if (j === undefined) return undefined;
      const list = (j && j.teams) || [];
      const t = list.find((x) => x.strSport === SDB_SPORT[sport]) || list[0];
      return t ? { badge: t.strBadge || t.strLogo || null, idLeague: t.idLeague || null } : null;
    });
  }
  // Leagues with a known TheSportsDB id; others are found through one of their teams.
  const LEAGUE_IDS = { "Premier League": 4328, "La Liga": 4335, "Serie A": 4332, Bundesliga: 4331, "Ligue 1": 4334, MLS: 4346,
    "NBA East": 4387, "NBA West": 4387, AFC: 4391, NFC: 4391, "American League": 4424, "National League": 4424,
    "NHL East": 4380, "NHL West": 4380, "Formula 1": 4370 };
  function leagueBadge(sport, league) {
    if (!league || league === "Retired") return Promise.resolve(null);
    return once(`league|${sport}|${league}`, async () => {
      let id = LEAGUE_IDS[league];
      if (!id) {
        const member = ATHLETES.find((a) => a.sport === sport && a.league === league && a.team);
        if (!member) return null;
        const t = await teamInfo(sport, member.team);
        id = t && t.idLeague;
        if (!id) return t === undefined ? undefined : null;
      }
      const j = await sdb(`lookupleague.php?id=${id}`);
      if (j === undefined) return undefined;
      const l = j && j.leagues && j.leagues[0];
      return l ? l.strBadge || l.strLogo || null : null;
    });
  }
  function teamBadge(sport, team) { return team ? teamInfo(sport, team).then((t) => t && t.badge) : Promise.resolve(null); }

  // ---------- photos: Wikipedia first (batched), TheSportsDB as backup ----------
  const WIKI = "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages|pageprops&ppprop=disambiguation&piprop=thumbnail&pithumbsize=240";
  const SEARCH_WORD = { Soccer: "footballer", Basketball: "basketball", "American Football": "American football", Baseball: "baseball",
    "Ice Hockey": "ice hockey", Tennis: "tennis", Golf: "golfer", "Formula 1": "racing driver", Athletics: "athlete",
    Swimming: "swimmer", Gymnastics: "gymnast", "Winter Sports": "skier snowboarder", Skateboarding: "skateboarder",
    MMA: "mixed martial artist", Boxing: "boxer", Cricket: "cricketer", Rugby: "rugby union" };
  let batch = [], batchTimer;
  function wikiBatch(a) {
    return new Promise((resolve) => {
      batch.push({ a, resolve });
      clearTimeout(batchTimer);
      batchTimer = setTimeout(runBatch, batch.length >= 40 ? 0 : 60);
    });
  }
  async function runBatch() {
    const jobs = batch.splice(0, 40);
    if (batch.length) batchTimer = setTimeout(runBatch, 0);
    const titles = jobs.map((j) => j.a.wiki || j.a.name);
    try {
      const r = await fetch(`${WIKI}&titles=${encodeURIComponent(titles.join("|"))}`);
      const q = (await r.json()).query || {};
      const map = {};
      for (const n of q.normalized || []) map[n.from] = n.to;
      for (const n of q.redirects || []) map[n.from] = n.to;
      const pages = {};
      for (const p of Object.values(q.pages || {})) pages[p.title] = p;
      jobs.forEach((j, i) => {
        let t = titles[i];
        for (let k = 0; k < 3 && map[t]; k++) t = map[t];
        const p = pages[t];
        const ok = p && !p.missing && !(p.pageprops && "disambiguation" in p.pageprops);
        j.resolve(ok ? (p.thumbnail && p.thumbnail.source) || null : false); // false = wrong page, try a search
      });
    } catch { jobs.forEach((j) => j.resolve(undefined)); }
  }
  async function wikiSearch(a) {
    try {
      const r = await fetch(`${WIKI}&generator=search&gsrlimit=1&gsrsearch=${encodeURIComponent(a.name + " " + (SEARCH_WORD[a.sport] || ""))}`);
      const pages = Object.values(((await r.json()).query || {}).pages || {});
      return (pages[0] && pages[0].thumbnail && pages[0].thumbnail.source) || null;
    } catch { return undefined; }
  }
  async function sdbPlayer(a) {
    const j = await sdb(`searchplayers.php?p=${encodeURIComponent(a.name)}`);
    if (j === undefined) return undefined;
    const p = ((j && (j.player || j.players)) || [])[0];
    return p ? p.strCutout || p.strThumb || p.strRender || null : null;
  }
  function photoUrl(a) {
    return once(`photo|${a.name}`, async () => {
      let url = await wikiBatch(a);
      if (url === false) url = await wikiSearch(a);
      if (url) return url;
      const backup = await sdbPlayer(a);
      if (backup) return backup;
      return url === undefined || backup === undefined ? undefined : null;
    });
  }

  // ---------- small UI helpers ----------
  const initials = (name) => name.split(/[\s-]+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 3);
  function swapIn(el, url, alt) {
    if (!url) return;
    const img = new Image();
    img.alt = alt;
    img.onload = () => { el.textContent = ""; el.classList.add("has-img"); el.appendChild(img); };
    img.src = url;
  }
  // Round photo: initials first, swapped for the photo once it loads.
  function avatar(a, size = "") {
    const el = document.createElement("span");
    el.className = "avatar " + size;
    el.textContent = initials(a.name);
    photoUrl(a).then((url) => swapIn(el, url, a.name));
    return el;
  }
  // Team or league logo, with the name as text until (or unless) the logo loads.
  function logo(kind, sport, name) {
    const el = document.createElement("span");
    el.className = "logo";
    el.textContent = initials(name || "—");
    if (name) (kind === "team" ? teamBadge(sport, name) : leagueBadge(sport, name)).then((url) => swapIn(el, url, name));
    return el;
  }
  function flag(a) {
    const img = new Image();
    img.className = "flag";
    img.alt = "";
    img.onerror = () => img.remove();
    if (a.flag) img.src = `https://flagcdn.com/h24/${a.flag}.png`;
    return img;
  }

  return { MAX_GUESSES, MODES, COL_LABELS, modeFromURL, pool, dailyPool, dayNumber, dateForDay, athleteForDay,
    load, save, modeState, avatar, logo, flag, photoUrl, teamBadge, leagueBadge, initials };
})();
