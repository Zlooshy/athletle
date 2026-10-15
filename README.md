# Athletle

A daily athlete guessing game. Live at https://zlooshy.github.io/athletle/

- **Games:** one main game (all sports) plus a daily game per sport: Soccer, Basketball, NFL, Baseball, Hockey, Tennis, Golf, F1, Athletics, MMA & Boxing, Cricket, Rugby and Olympic sports. Pick one with `?mode=soccer` etc.
- **Clues:** each sport has its own columns. Team sports show club/team and league (or conference) with logos; everything shows nation (flag), age and height.
- **Hints:** 10 guesses. After guess 4 you pick one of 3 hint cards, after guess 8 one of the other 2.
- **Archive:** `archive.html?mode=X` lists every day since launch (2 Oct 2026). Replays use `?mode=X&day=N`.
- **Check page:** `check.html` loads every athlete photo and every team/league logo and lists anything missing.

## Data
`data/*.js` holds about 1,140 athletes. Row format:
`[name, country, "YYYY-MM-DD", heightCm, netWorth$M, team, league, position, daily(1), wikipediaTitle]`.
Only rows marked daily (mainstream names) can be a day's answer; every athlete can be guessed.
`data/finalize.js` fills in US conferences, country names and continents and removes duplicates.
Curated hint cards live in `hints.js`; other athletes get hints built from their data.

## Media
Photos come from Wikipedia (fallback: TheSportsDB), logos from TheSportsDB, flags from flagcdn.com. All load in the visitor's browser and are cached in localStorage.
