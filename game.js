(() => {
  const { MAX_GUESSES, MODES, COL_LABELS, modeFromURL, pool, dayNumber, dateForDay, athleteForDay,
    load, save, modeState, avatar, logo, flag } = Athletle;
  const HINT_UNLOCKS = [4, 8]; // after this many guesses you may pick another hint card

  // ---------- helpers ----------
  const $ = (id) => document.getElementById(id);
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, "");
  function ageOf(born, now = new Date()) {
    const b = new Date(born + "T00:00:00");
    let a = now.getFullYear() - b.getFullYear();
    if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--;
    return a;
  }
  const fmtMoney = (m) => m >= 1000 ? `$${(m / 1000).toFixed(m % 1000 ? 1 : 0)}B` : `$${m}M`;
  const toInches = (cm) => Math.round(cm / 2.54);
  const fmtHeight = (cm) => { const i = toInches(cm); return `${Math.floor(i / 12)}'${i % 12}"`; };
  const POS_NAMES = { GK: "Goalkeeper", DF: "Defender", MF: "Midfielder", FW: "Forward", G: "Guard", F: "Forward", C: "Center",
    QB: "Quarterback", RB: "Running back", WR: "Wide receiver", TE: "Tight end", OL: "Offensive line", DL: "Defensive line",
    LB: "Linebacker", DB: "Defensive back", P: "Pitcher", IF: "Infielder", OF: "Outfielder", DH: "Designated hitter", W: "Winger", D: "Defense" };
  const POS_GROUP = { QB: "off", RB: "off", WR: "off", TE: "off", OL: "off", DL: "def", LB: "def", DB: "def" };
  const posText = (a) => (a.sport === "Ice Hockey" && a.pos === "G" ? "Goalie" : a.sport === "Baseball" && a.pos === "C" ? "Catcher" :
    POS_NAMES[a.pos] || a.pos || "—");

  // ---------- which game ----------
  const mode = modeFromURL();
  const M = MODES[mode];
  const today = dayNumber();
  const asked = parseInt(new URLSearchParams(location.search).get("day"), 10);
  const day = Number.isInteger(asked) && asked >= 0 && asked < today ? asked : today;
  const replay = day !== today;
  const answer = athleteForDay(mode, day);
  const store = load();
  const ms = modeState(store, mode);
  const game = (ms.days[day] ||= { guesses: [], done: false });
  const players = pool(mode);
  let guesses = game.guesses.map((n) => players.find((a) => a.name === n)).filter(Boolean);
  const link = (extra = {}) => { const q = new URLSearchParams({ ...(mode !== "all" && { mode }), ...extra }).toString(); return q ? "?" + q : ""; };

  // ---------- compare ----------
  function numeric(g, a, closeFn) {
    if (g === a) return { cls: "green", arrow: "" };
    return { cls: closeFn(g, a) ? "yellow" : "", arrow: a > g ? "↑" : "↓" };
  }
  function clue(col, g) {
    const A = answer;
    switch (col) {
      case "sport": return { text: g.sport, cls: g.sport === A.sport ? "green" : "" };
      case "team": return { node: () => logoCell("team", g.sport, g.team), cls: g.team === A.team ? "green" : "" };
      case "league": return { node: () => logoCell("league", g.sport, g.league), cls: g.league === A.league ? "green" : "" };
      case "pos": return { text: posText(g), cls: g.pos === A.pos ? "green" :
        POS_GROUP[g.pos] && POS_GROUP[g.pos] === POS_GROUP[A.pos] ? "yellow" : "" };
      case "nation": return { node: () => nationCell(g), cls: g.nat === A.nat ? "green" : g.continent === A.continent ? "yellow" : "" };
      case "age": { const x = ageOf(g.born), y = ageOf(A.born); return { text: x, ...numeric(x, y, (p, q) => Math.abs(p - q) <= 3) }; }
      case "height": return { text: fmtHeight(g.height), ...numeric(toInches(g.height), toInches(A.height), (p, q) => Math.abs(p - q) <= 2) };
      case "worth": return { text: fmtMoney(g.netWorth), ...numeric(g.netWorth, A.netWorth, (p, q) => Math.abs(p - q) / q <= 0.25) };
    }
  }
  const span = (props) => Object.assign(document.createElement("span"), props);
  function nationCell(g) {
    const box = span({ className: "nation" });
    box.append(flag(g), span({ textContent: g.nationality }));
    return box;
  }
  function logoCell(kind, sport, name) {
    const box = span({ className: "logo-cell" });
    if (!name) { box.textContent = "None"; return box; }
    if (name !== "Retired") box.appendChild(logo(kind, sport, name));
    box.appendChild(Object.assign(document.createElement("small"), { textContent: name }));
    return box;
  }

  // ---------- board ----------
  const gridCols = `minmax(0,1.4fr) repeat(${M.cols.length}, minmax(0,1fr))`;
  function renderHead() {
    const head = $("boardHead");
    head.style.gridTemplateColumns = gridCols;
    head.innerHTML = "";
    ["Athlete", ...M.cols.map((c) => (M.labels && M.labels[c]) || COL_LABELS[c])].forEach((t) => {
      head.appendChild(Object.assign(document.createElement("div"), { textContent: t }));
    });
  }
  function addRow(g, animate) {
    const row = document.createElement("div");
    row.className = "row";
    row.style.gridTemplateColumns = gridCols;
    const nameCell = document.createElement("div");
    nameCell.className = "cell name" + (g === answer ? " green" : "");
    nameCell.append(avatar(g), span({ textContent: g.name }));
    row.appendChild(nameCell);
    M.cols.forEach((col, i) => {
      const c = clue(col, g);
      const d = document.createElement("div");
      d.className = "cell " + (c.cls || "");
      d.dataset.col = col;
      d.appendChild(c.node ? c.node() : span({ textContent: c.text }));
      if (c.arrow) d.appendChild(span({ className: "arrow", textContent: c.arrow }));
      d.style.animationDelay = animate ? `${(i + 1) * 0.1}s` : "0s";
      row.appendChild(d);
    });
    $("rows").prepend(row);
  }
  function updateMeta() {
    const n = guesses.length;
    $("guessCount").textContent = game.done ? `${n} of ${MAX_GUESSES} used` : `Guess ${n + 1} of ${MAX_GUESSES}`;
    renderHints();
  }

  // ---------- pick-a-hint cards ----------
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function hintCards() {
    const A = answer, shown = new Set(M.cols);
    const curated = (HINTS[A.name] || []).filter(([label]) => !(shown.has("team") && /^(Team|IPL team)$/.test(label)));
    const extra = [];
    if (!shown.has("team") && A.team) extra.push([A.league === "Retired" ? "Famous team" : "Team", A.team]);
    if (!shown.has("pos") && A.pos) extra.push([A.sport === "Tennis" ? "Plays" : "Position", posText(A)]);
    if (!shown.has("league") && A.league && A.league !== "Retired") extra.push(["League", A.league]);
    const mate = A.team && A.league !== "Retired" && ATHLETES.find((x) => x !== A && x.sport === A.sport && x.team === A.team && x.league !== "Retired");
    if (mate) extra.push(["Teammate", mate.name]);
    extra.push(["Initials", A.name.split(/\s+/).map((w) => w[0] + ".").join(" ")]);
    const b = new Date(A.born + "T00:00:00");
    extra.push(["Born", `${MONTHS[b.getMonth()]} ${b.getFullYear()}`]);
    extra.push(["Name length", A.name.split(/\s+/).map((w) => w.replace(/[^\p{L}]/gu, "").length).join(" + ") + " letters"]);
    return [...curated, ...extra].slice(0, 3);
  }
  function renderHints() {
    const cards = hintCards();
    const picked = (game.hints ||= []);
    const allowed = HINT_UNLOCKS.filter((n) => guesses.length >= n).length;
    const canPick = !game.done && picked.length < allowed;
    const next = HINT_UNLOCKS[picked.length];
    $("hintTitle").textContent = game.done ? "Hints" : canPick ? "Pick a hint" :
      next ? `Next hint unlocks after guess ${next}` : "No hints left";
    const box = $("hintCards");
    box.innerHTML = "";
    cards.forEach(([label, text], i) => {
      const open = game.done || picked.includes(i);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "hint-card" + (open ? " open" : canPick ? " pickable" : " locked");
      b.disabled = open || !canPick;
      b.append(span({ className: "hint-label", textContent: label }),
        span({ className: "hint-text", textContent: open ? text : canPick ? "Tap to reveal" : "🔒" }));
      b.onclick = () => { picked.push(i); save(store); renderHints(); };
      box.appendChild(b);
    });
  }

  // ---------- results ----------
  function emojiGrid() {
    return guesses.map((g) => M.cols.map((c) => {
      const cls = clue(c, g).cls;
      return cls === "green" ? "🟩" : cls === "yellow" ? "🟨" : "⬜";
    }).join("")).join("\n");
  }
  function showResult() {
    const won = guesses.includes(answer);
    const box = $("result");
    box.classList.remove("hidden");
    box.innerHTML = `<h2>${won ? "You got it! 🎉" : "Out of guesses"}</h2>
      <div>${replay ? `Puzzle #${day + 1}'s` : "Today's"} athlete was</div>
      <div class="answer-row" id="answerRow"><div class="answer"></div></div>
      <div class="small"></div>
      <div class="result-actions"><button class="btn" id="shareBtn">Share result</button>
      <a class="btn ghost" href="archive.html${link()}">Play the archive</a></div>`;
    box.querySelector(".answer").textContent = answer.name;
    box.querySelector(".small").textContent = [answer.sport, answer.team, answer.nationality].filter(Boolean).join(" · ");
    $("answerRow").prepend(avatar(answer, "big"));
    $("shareBtn").onclick = share;
    $("guessInput").disabled = true;
    $("guessInput").placeholder = replay ? "Pick another day from the archive" : "Come back tomorrow for a new athlete";
  }
  function share() {
    const won = guesses.includes(answer);
    const name = mode === "all" ? "Athletle" : `Athletle ${M.label}`;
    const text = `${name} #${day + 1} ${won ? guesses.length : "X"}/${MAX_GUESSES}\n${emojiGrid()}\n${location.origin}${location.pathname}${link()}`;
    const viaShare = () => navigator.share ? navigator.share({ text }).catch(() => toast("Couldn't share")) : toast("Couldn't copy");
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast("Copied! Paste it to your friends"), viaShare);
    else viaShare();
  }
  function toast(msg) {
    const t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 1600);
  }
  function renderStats() {
    const s = ms.stats;
    $("statsTitle").textContent = `${M.icon} ${M.label} statistics`;
    $("statsBody").innerHTML = [
      [s.played, "Played"], [s.played ? Math.round((s.wins / s.played) * 100) : 0, "Win %"],
      [s.streak, "Streak"], [s.best, "Best"],
    ].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join("");
  }
  function tickCountdown() {
    const now = new Date(), next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const s = Math.floor((next - now) / 1000);
    $("countdown").textContent = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((x) => String(x).padStart(2, "0")).join(":");
  }

  // ---------- guessing ----------
  function finish(won) {
    game.done = true;
    if (replay) { save(store); setTimeout(showResult, 900); return; } // archive games don't count toward stats
    const s = ms.stats;
    s.played++;
    if (won) { s.wins++; s.streak = s.lastWinDay === day - 1 ? s.streak + 1 : 1; s.best = Math.max(s.best, s.streak); s.lastWinDay = day; }
    else s.streak = 0;
    save(store);
    setTimeout(() => { showResult(); renderStats(); $("statsDlg").showModal(); }, 900);
  }
  function submit(athlete) {
    if (game.done) return;
    if (guesses.includes(athlete)) { toast("Already guessed"); return; }
    guesses.push(athlete);
    game.guesses = guesses.map((g) => g.name);
    save(store);
    addRow(athlete, true);
    $("guessInput").value = ""; renderSuggestions();
    if (athlete === answer) finish(true);
    else if (guesses.length >= MAX_GUESSES) finish(false);
    updateMeta();
  }

  // ---------- autocomplete ----------
  let active = 0, matches = [];
  const searchIndex = players.map((a) => ({ a, n: norm(a.name) }));
  function renderSuggestions() {
    const q = norm($("guessInput").value.trim());
    const ul = $("suggestions");
    ul.innerHTML = "";
    if (!q) { matches = []; return; }
    matches = searchIndex.filter(({ a, n }) => !guesses.includes(a) && (n.startsWith(q) || n.split(" ").some((w) => w.startsWith(q))))
      .sort((x, y) => (y.a.daily - x.a.daily) || x.n.localeCompare(y.n)).slice(0, 8).map((x) => x.a);
    active = 0;
    matches.forEach((a, i) => {
      const li = document.createElement("li");
      const who = span({ className: "who" });
      who.append(avatar(a, "small"), span({ textContent: a.name }));
      li.append(who, Object.assign(document.createElement("small"), { textContent: mode === "all" ? a.sport : a.team || a.sport }));
      if (i === active) li.classList.add("active");
      li.onmousedown = (e) => { e.preventDefault(); submit(a); };
      ul.appendChild(li);
    });
  }
  $("guessInput").addEventListener("input", renderSuggestions);
  $("guessInput").addEventListener("keydown", (e) => {
    const lis = $("suggestions").children;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!matches.length) return;
      lis[active]?.classList.remove("active");
      active = (active + (e.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length;
      lis[active].classList.add("active"); lis[active].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (matches[active]) submit(matches[active]);
      else if ($("guessInput").value.trim()) toast("Pick a name from the list");
    } else if (e.key === "Escape") { $("suggestions").innerHTML = ""; matches = []; }
  });
  $("guessInput").addEventListener("blur", () => setTimeout(() => { $("suggestions").innerHTML = ""; }, 100));

  // ---------- mode picker ----------
  function renderModes() {
    const bar = $("modeBar");
    for (const [key, m] of Object.entries(MODES)) {
      const a = document.createElement("a");
      a.className = "mode-chip" + (key === mode ? " current" : "");
      a.href = key === "all" ? "./" : `./?mode=${key}`;
      const st = store.modes[key];
      const doneToday = st && st.days[today] && st.days[today].done;
      a.textContent = `${m.icon} ${m.label}${doneToday ? " ✓" : ""}`;
      if (key === mode) a.setAttribute("aria-current", "page");
      bar.appendChild(a);
    }
    const cur = bar.querySelector(".current");
    if (cur) bar.scrollLeft = cur.offsetLeft - bar.clientWidth / 2 + cur.clientWidth / 2;
  }

  // ---------- boot ----------
  renderModes();
  document.title = mode === "all" ? "Athletle" : `Athletle ${M.label}`;
  $("whichGame").textContent = mode === "all" ? "athlete" : `${M.label} athlete`;
  $("puzzleNo").textContent = `#${day + 1}`;
  $("guessInput").placeholder = mode === "all" ? "Type any athlete's name…" : `Type a ${M.label} athlete's name…`;
  $("archiveLink").href = "archive.html" + link();
  $("todayLink").href = "./" + link();
  if (replay) {
    $("replayBar").hidden = false;
    $("whichDay").textContent = "this day's";
    $("replayDate").textContent = dateForDay(day).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }
  $("helpBtn").onclick = () => $("helpDlg").showModal();
  $("statsBtn").onclick = () => { renderStats(); $("statsDlg").showModal(); };
  renderHead();
  guesses.forEach((g) => addRow(g, false));
  updateMeta();
  if (game.done) showResult();
  else if (!store.seenHelp) { store.seenHelp = true; save(store); $("helpDlg").showModal(); }
  tickCountdown(); setInterval(tickCountdown, 1000);
})();
