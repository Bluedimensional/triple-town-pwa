# Triple Town PWA

**▶ Play / install:** https://bluedimensional.github.io/triple-town-pwa/

An installable **Progressive Web App** clone of *Triple Town* (Spry Fox) — classic
endless play plus timed modes. Merge three connected tiles to grow the build chain,
deal with bears, and rack up the highest score. Runs full-screen from a phone home-screen icon,
works offline, installs straight from the browser. No App Store, no build step.

## What it is

- **Board opens pre-filled** with a random layout, different every game. Pick
  **6×6** (default), **7×7**, **8×8** or **7×8** — every size and mode keeps its
  own best score.
- **Each turn** a piece appears on the board (pulsing, white border) next to your
  last move — tap any tile to place it.
- **Match 3+ connected** (orthogonally) of the same type and they merge into the
  next tier at the tile you placed. **Every** merge needs three — no tier asks for
  more. Merges cascade.
- **Build chain:** grass → bush → tree → hut → house → mansion → castle →
  floating castle → triple castle → mega castle → kingdom → metropolis →
  sky utopia → **rocket town → mothership → world turtle** (it gets silly at the top).
- **Bears** shuffle one space after every placement; trap one (no adjacent empty
  tile) and it becomes a tombstone. Tombstones chain too: tombstone → church →
  cathedral → treasury → royal vault → treasure hoard → golden pyramid → phoenix →
  divine sun.
- **Storage:** up to **four reserve slots below the board** — tap one to swap it
  with the piece in hand (tapping an empty slot stashes the piece and deals a fresh
  one). You start with two; a third unlocks at level 2 and a fourth at level 3
  (Deep Pockets opens all four at once). Stored pieces never merge on their own.
- **Crystals** (🔷) are wildcards: a crystal becomes whichever type completes the
  highest-value merge it can reach, and hardens into a **rock** if nothing merges.
  A 💎 **1× / 2× / 3×** toggle scales how often they spawn (base rate ~6%).
- **Bombs** (💣) are earned whenever a merge creates a Castle- or Cathedral-tier
  piece or better (worth 2,000+ points), up to 9 banked. Long-press the held piece
  or tap 💣 to arm one, then tap a **rock or bear** to destroy it — a free action
  that neither uses up the piece in your hand nor ends your turn.
- **Levels** are score milestones you pass while playing, never a stop: 20,000
  points for level 2, then 45,000 · 80,000 · 125,000 and up. Each level banks an
  **undo** and can unlock a storage slot.
- **Timed modes:** ⏱ **Endless** (classic — runs until the board fills) or a
  **5 / 10 / 15-minute** game. Timed runs deal a denser opening board weighted
  toward mid-tier pieces so there's time to build, and each mode is ranked on its
  own leaderboard.
- **Store** sells starter tiles (grass, bush, tree, hut) and crystals for in-game
  **pretend coins only** (earned from merges). Prices rise with each purchase. No real money, ever.
- **Roguelike Charms:** every new run opens by offering **3 perks** — Green Thumb
  is always one, **🎲 Shuffle** re-rolls the other two, and **Show all charms**
  lists the whole roster. Charms **stack**: tap as many as you want, then Start. Each genuinely bends a
  rule for the whole game: merge diagonally, merge with only two of a kind, freeze
  the bears, make rocks wild, survive one full board, unlock all storage, duplicate
  every piece you place, undo without limit, or **Turbo** (every merge leaps two
  tiers). Board is dealt after you choose. A 🍀 On/Off toggle in the toolbar turns
  the whole charm system off if you want a plain game.
- **Combo multiplier:** merge on consecutive placements to build a chain; the
  longer the chain, the bigger the score multiplier on that turn's merge (up to
  ×3). A 🔥 badge shows the live multiplier. Breaks when a placement merges nothing.
- **Green Thumb / Verdant Surge:** the Green Thumb charm (always offered) makes
  grass merge straight to Tree; every merge charges a Surge meter (bigger merges
  fill it faster) that briefly also turns bush merges into a random house.
- **Game over** when the board fills and nothing can free space — or when the
  clock runs out in a timed game.

## Run locally

Service workers and ES modules require HTTP (not `file://`), so serve the folder:

```sh
cd "Triple Town PWA"
python3 -m http.server 8177
# open http://localhost:8177 in a browser
```

## Install on a phone

Host over HTTPS (e.g. GitHub Pages) and open the URL on your phone:

- **iPhone:** open in the real **Safari** app → Share → *Add to Home Screen*
  (must be Safari, not an in-app browser — iOS has no auto-install prompt).
- **Android:** Chrome offers an install prompt, or menu → *Install app*.

Game state lives in `localStorage`, so it survives refresh, backgrounding, and
cache eviction.

## Project structure

```
index.html            entry point + PWA meta
manifest.json         PWA manifest (name, icons, standalone display)
sw.js                 service worker (offline cache of shell + assets)
css/styles.css        mobile-first, safe-area-aware layout
js/
  main.js             bootstrap, input wiring, service-worker registration
  config.js           tunable constants: chains, scoring, spawn, asset map
  state.js            the mutable game state + reset
  match.js            flood-fill match detection + cascading merges
  bears.js            bear movement, trapping → tombstone
  storehouse.js       reserve swap
  store.js            coins + buy at rising prices
  game.js             turn orchestration (spawn, place, bears, game over)
  render.js           draw board/HUD/store from state
  persistence.js      localStorage save/load
assets/
  icons/              PWA home-screen icons (180/192/512 + maskable)
  sprites/            (reserved for future image tiles)
```

## Conventions

- **Vanilla HTML + CSS + JS, ES modules, no framework, no build step.**
- **Swappable asset map:** tiles render from hand-drawn SVG sprites in
  `js/sprites.js` (one string per tile). Reskin by editing that file — no game
  logic changes. (`ASSETS` in `js/config.js` keeps emoji as an alt/fallback.)
- **Data-driven rules:** chains, scoring, spawn weights, and store prices all
  live in `js/config.js`. Tune there; logic never hard-codes a tile type.

## Tuning knobs (`js/config.js`)

`POINTS`, `COINS`, `SPAWN_WEIGHTS`, bear-chance ramp
(`BEAR_BASE_CHANCE` / `BEAR_CHANCE_PER_TURN` / `BEAR_MAX_CHANCE`), and store
prices (`STORE_BASE_PRICE`, `STORE_PRICE_GROWTH`). The scoring values are a
starting point to tune by feel — not Triple Town's real (unpublished) numbers.

## Status

Playable end to end: placement, cascading merges, full build chain, bears +
tombstone chain, storage slots, crystals, bombs, charms, levels, timed modes,
store + coins, score/best, game over, offline caching, and localStorage
persistence. See `CHANGELOG.md`.

Deployed to GitHub Pages (HTTPS) — see the play link at the top.

**Deferred (backlog):** ninja bears, imperial bot, rock/mountain chain,
custom image sprites.
