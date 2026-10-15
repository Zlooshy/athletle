(() => {
  const MAX_GUESSES = 10;
  const HINT_AFTER = 5;
  const LAUNCH = new Date(2026, 9, 15); // puzzle #1 = 15 Oct 2026 (local time)
  const STORE_KEY = "athletle-v1";

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

  // Seeded shuffle so every player gets the same athlete on the same day,
  // and no athlete repeats until the whole list has been used.
  function mulberry32(a) {
    return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function dayNumber(d = new Date()) {
    const today = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.round((today - LAUNCH) / 86400000);
  }
  function athleteForDay(n) {
    const cycle = Math.floor(n / ATHLETES.length);
    const rand = mulberry32(20261015 + cycle);
    const order = ATHLETES.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const idx = ((n % ATHLETES.length) + ATHLETES.length) % ATHLETES.length;
    return ATHLETES[order[idx]];
  }

  // ---------- storage (safe if blocked) ----------
  function load() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } }
  function save(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {} }

  // ---------- state ----------
  const day = dayNumber();
  const answer = athleteForDay(day);
  const store = load();
  store.stats ||= { played: 0, wins: 0, streak: 0, best: 0, dist: Array(MAX_GUESSES).fill(0), lastWinDay: null };
  if (store.day !== day) { store.day = day; store.guesses = []; store.done = false; }
  let guesses = store.guesses.map((n) => ATHLETES.find((a) => a.name === n)).filter(Boolean);

  // ---------- compare ----------
  function numeric(guessVal, ansVal, closeFn) {
    if (guessVal === ansVal) return { cls: "green", arrow: "" };
    return { cls: closeFn(guessVal, ansVal) ? "yellow" : "", arrow: ansVal > guessVal ? "↑" : "↓" };
  }
  function compare(g) {
    const ga = ageOf(g.born), aa = ageOf(answer.born);
    return {
      sport: { text: g.sport, cls: g.sport === answer.sport ? "green" : "" },
      nation: { text: g.nationality, cls: g.nationality === answer.nationality ? "green" : g.continent === answer.continent ? "yellow" : "" },
      age: { text: ga, ...numeric(ga, aa, (x, y) => Math.abs(x - y) <= 3) },
      height: { text: fmtHeight(g.height), ...numeric(toInches(g.height), toInches(answer.height), (x, y) => Math.abs(x - y) <= 2) },
      worth: { text: fmtMoney(g.netWorth), ...numeric(g.netWorth, answer.netWorth, (x, y) => Math.abs(x - y) / y <= 0.25) },
    };
  }

  // ---------- render ----------
  function cell(c) {
    const d = document.createElement("div");
    d.className = "cell " + (c.cls || "");
    d.innerHTML = `<span>${c.text}</span>${c.arrow ? `<span class="arrow">${c.arrow}</span>` : ""}`;
    return d;
  }
  function addRow(g, animate) {
    const row = document.createElement("div");
    row.className = "row";
    const nameCell = document.createElement("div");
    nameCell.className = "cell name" + (g === answer ? " green" : "");
    nameCell.textContent = g.name;
    row.appendChild(nameCell);
    const r = compare(g);
    [r.sport, r.nation, r.age, r.height, r.worth].forEach((c, i) => {
      const el = cell(c);
      el.style.animationDelay = animate ? `${(i + 1) * 0.12}s` : "0s";
      row.appendChild(el);
    });
    $("rows").prepend(row);
  }
  function initials(name) { return name.split(/\s+/).map((w) => w[0]).join(". ") + "."; }
  function updateMeta() {
    const n = guesses.length;
    $("guessCount").textContent = store.done ? `${n} of ${MAX_GUESSES} used` : `Guess ${n + 1} of ${MAX_GUESSES}`;
    $("hint").textContent = !store.done && n >= HINT_AFTER ? `Initials: ${initials(answer.name)}` : "";
  }
  function emojiGrid() {
    return guesses.slice().map((g) => {
      const r = compare(g);
      return [r.sport, r.nation, r.age, r.height, r.worth].map((c) => c.cls === "green" ? "🟩" : c.cls === "yellow" ? "🟨" : "⬜").join("");
    }).join("\n");
  }
  function showResult() {
    const won = guesses.some((g) => g === answer);
    const box = $("result");
    box.classList.remove("hidden");
    box.innerHTML = `<h2>${won ? "You got it! 🎉" : "Out of guesses"}</h2>
      <div>Today's athlete was</div>
      <div class="answer">${answer.name}</div>
      <div class="small">${answer.sport} · ${answer.nationality}</div>
      <button class="btn" id="shareBtn">Share result</button>`;
    $("shareBtn").onclick = share;
    $("guessInput").disabled = true;
    $("guessInput").placeholder = "Come back tomorrow for a new athlete";
  }
  function share() {
    const won = guesses.some((g) => g === answer);
    const text = `Athletle #${day + 1} ${won ? guesses.length : "X"}/${MAX_GUESSES}\n${emojiGrid()}`;
    const viaShare = () => navigator.share ? navigator.share({ text }).catch(() => toast("Couldn't share")) : toast("Couldn't copy");
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast("Copied! Paste it to your friends"), viaShare);
    else viaShare();
  }
  function toast(msg) {
    const t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 1600);
  }
  function renderStats() {
    const s = store.stats;
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
    store.done = true;
    const s = store.stats;
    s.played++;
    if (won) {
      s.wins++; s.dist[guesses.length - 1]++;
      s.streak = s.lastWinDay === day - 1 ? s.streak + 1 : 1;
      s.best = Math.max(s.best, s.streak); s.lastWinDay = day;
    } else s.streak = 0;
    save(store);
    setTimeout(() => { showResult(); renderStats(); $("statsDlg").showModal(); }, 900);
  }
  function submit(athlete) {
    if (store.done) return;
    if (guesses.includes(athlete)) { toast("Already guessed"); return; }
    guesses.push(athlete);
    store.guesses = guesses.map((g) => g.name);
    save(store);
    addRow(athlete, true);
    $("guessInput").value = ""; renderSuggestions();
    if (athlete === answer) finish(true);
    else if (guesses.length >= MAX_GUESSES) finish(false);
    updateMeta();
  }

  // ---------- autocomplete ----------
  let active = 0, matches = [];
  function renderSuggestions() {
    const q = norm($("guessInput").value.trim());
    const ul = $("suggestions");
    ul.innerHTML = "";
    if (!q) { matches = []; return; }
    matches = ATHLETES.filter((a) => !guesses.includes(a) &&
      (norm(a.name).startsWith(q) || norm(a.name).split(" ").some((w) => w.startsWith(q)))).slice(0, 8);
    active = 0;
    matches.forEach((a, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${a.name}</span><small>${a.sport}</small>`;
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

  // ---------- boot ----------
  $("puzzleNo").textContent = `#${day + 1}`;
  $("helpBtn").onclick = () => $("helpDlg").showModal();
  $("statsBtn").onclick = () => { renderStats(); $("statsDlg").showModal(); };
  guesses.forEach((g) => addRow(g, false));
  updateMeta();
  if (store.done) showResult();
  else if (!store.seenHelp) { store.seenHelp = true; save(store); $("helpDlg").showModal(); }
  else $("guessInput").focus();
  tickCountdown(); setInterval(tickCountdown, 1000);
})();
