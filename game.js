(() => {
  const { MAX_GUESSES, dayNumber, athleteForDay, load, save, avatar } = Athletle;
  const HINT_AFTER = 5;

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

  // ---------- state ----------
  // ?day=N replays an earlier puzzle from the archive (N = puzzle number - 1).
  const today = dayNumber();
  const asked = parseInt(new URLSearchParams(location.search).get("day"), 10);
  const day = Number.isInteger(asked) && asked >= 0 && asked < today ? asked : today;
  const replay = day !== today;
  const answer = athleteForDay(day);
  const store = load();
  const game = (store.days[day] ||= { guesses: [], done: false });
  let guesses = game.guesses.map((n) => ATHLETES.find((a) => a.name === n)).filter(Boolean);

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
    nameCell.appendChild(avatar(g));
    const nm = document.createElement("span");
    nm.textContent = g.name;
    nameCell.appendChild(nm);
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
    $("guessCount").textContent = game.done ? `${n} of ${MAX_GUESSES} used` : `Guess ${n + 1} of ${MAX_GUESSES}`;
    $("hint").textContent = !game.done && n >= HINT_AFTER ? `Initials: ${initials(answer.name)}` : "";
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
      <div>${replay ? `Puzzle #${day + 1}'s` : "Today's"} athlete was</div>
      <div class="answer-row" id="answerRow"><div class="answer">${answer.name}</div></div>
      <div class="small">${answer.sport} · ${answer.nationality}</div>
      <button class="btn" id="shareBtn">Share result</button>`;
    $("answerRow").prepend(avatar(answer, "big"));
    $("shareBtn").onclick = share;
    $("guessInput").disabled = true;
    $("guessInput").placeholder = replay ? "Pick another day from the archive" : "Come back tomorrow for a new athlete";
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
    game.done = true;
    if (replay) { save(store); setTimeout(showResult, 900); return; } // archive games don't count toward stats
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
      li.innerHTML = `<span class="who"><span>${a.name}</span></span><small>${a.sport}</small>`;
      li.firstChild.prepend(avatar(a, "small"));
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
  if (replay) {
    $("replayBar").hidden = false;
    $("whichDay").textContent = "this day's";
    $("replayDate").textContent = Athletle.dateForDay(day).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }
  $("helpBtn").onclick = () => $("helpDlg").showModal();
  $("statsBtn").onclick = () => { renderStats(); $("statsDlg").showModal(); };
  guesses.forEach((g) => addRow(g, false));
  updateMeta();
  if (game.done) showResult();
  else if (!store.seenHelp) { store.seenHelp = true; save(store); $("helpDlg").showModal(); }
  else $("guessInput").focus();
  tickCountdown(); setInterval(tickCountdown, 1000);
})();
