# Athletle

Daily athlete guessing game. Plain HTML/CSS/JS, no backend, no build step.

- `index.html` page, `style.css` look, `game.js` rules, `athletes.js` the athlete list.
- Open `index.html` in a browser to play locally.
- Everyone gets the same athlete each day (picked by date from a fixed shuffle, no repeats until the list runs out). Puzzle #1 is 15 Oct 2026.
- Hint colours: green = match, yellow = close (same continent, age within 3, height within 2 inches, net worth within 25%), arrows point toward the answer. Initials appear after 5 guesses.
- Stats and today's progress are saved in the player's browser.

## Adding athletes
Add a line to `athletes.js` with name, sport, nationality, continent, born (YYYY-MM-DD), height (cm), netWorth (millions USD). Adding athletes reshuffles the future order, so add them in batches rather than daily.

## Going live
Any free static host works: GitHub Pages, Netlify or Cloudflare Pages. Upload this folder and it runs as-is.
