# Athletle

Daily athlete guessing game. Plain HTML/CSS/JS, no backend, no build step.

- `index.html` page, `style.css` look, `game.js` rules, `athletes.js` the athlete list.
- Open `index.html` in a browser to play locally.
- Everyone gets the same athlete each day (picked by date from a fixed shuffle, no repeats until the list runs out). Puzzle #1 is 2 Oct 2026, so the archive starts with 13 earlier days.
- Hint colours: green = match, yellow = close (same continent, age within 3, height within 2 inches, net worth within 25%), arrows point toward the answer. After 4 guesses players pick 1 of 3 hint cards from `hints.js`, and after 8 guesses one more.
- Stats and today's progress are saved in the player's browser.

## Adding athletes
Add a line to `athletes.js` with name, sport, nationality, continent, born (YYYY-MM-DD), height (cm), netWorth (millions USD). Also add 3 hints for them in `hints.js`. Adding athletes reshuffles the future order, so add them in batches rather than daily.

## Going live
Any free static host works: GitHub Pages, Netlify or Cloudflare Pages. Upload this folder and it runs as-is.
