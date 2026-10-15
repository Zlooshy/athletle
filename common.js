// Shared by the game page and the archive page.
const Athletle = (() => {
  const LAUNCH = new Date(2026, 9, 2); // puzzle #1 = 2 Oct 2026 (local time)
  const STORE_KEY = "athletle-v2"; // v2: launch date moved, so day numbers changed
  const PHOTO_KEY = "athletle-photos-v1";
  const MAX_GUESSES = 10;

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
  function dateForDay(n) { return new Date(LAUNCH.getFullYear(), LAUNCH.getMonth(), LAUNCH.getDate() + n); }
  function athleteForDay(n) {
    const cycle = Math.floor(n / ATHLETES.length);
    const rand = mulberry32(20261015 + cycle);
    const order = ATHLETES.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const idx = ((n % ATHLETES.length) + ATHLETES.length) % ATHLETES.length;
    return ATHLETES[order[idx]];
  }

  // ---------- storage (safe if blocked) ----------
  function load() {
    let s;
    try { s = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { s = {}; }
    s.stats ||= { played: 0, wins: 0, streak: 0, best: 0, dist: Array(MAX_GUESSES).fill(0), lastWinDay: null };
    s.days ||= {};
    // Older saves kept only one day's game; move it into the per-day list.
    if (s.day !== undefined) { s.days[s.day] = { guesses: s.guesses || [], done: !!s.done }; delete s.day; delete s.guesses; delete s.done; }
    return s;
  }
  function save(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {} }

  // ---------- photos (from Wikipedia, cached in the browser) ----------
  let photoCache;
  try { photoCache = JSON.parse(localStorage.getItem(PHOTO_KEY)) || {}; } catch { photoCache = {}; }
  const pending = {};
  function photoUrl(a) {
    if (a.name in photoCache) return Promise.resolve(photoCache[a.name]);
    if (pending[a.name]) return pending[a.name];
    const title = encodeURIComponent((a.wiki || a.name).replace(/ /g, "_"));
    pending[a.name] = fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const url = j?.thumbnail?.source || null;
        photoCache[a.name] = url;
        try { localStorage.setItem(PHOTO_KEY, JSON.stringify(photoCache)); } catch {}
        return url;
      })
      .catch(() => null);
    return pending[a.name];
  }
  const initials = (name) => name.split(/\s+/).map((w) => w[0]).join("");
  // Returns a round avatar element: initials straight away, swapped for the photo once it loads.
  function avatar(a, size = "") {
    const el = document.createElement("span");
    el.className = "avatar " + size;
    el.textContent = initials(a.name);
    photoUrl(a).then((url) => {
      if (!url) return;
      const img = new Image();
      img.alt = a.name;
      img.onload = () => { el.textContent = ""; el.appendChild(img); };
      img.src = url;
    });
    return el;
  }

  return { MAX_GUESSES, dayNumber, dateForDay, athleteForDay, load, save, avatar };
})();
