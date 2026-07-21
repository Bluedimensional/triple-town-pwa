# Triple Town PWA

An installable **Progressive Web App** clone of *Triple Town* (Spry Fox) — classic
endless mode. Merge three connected tiles to grow the build chain, deal with bears,
and rack up the highest score. Runs full-screen from a phone home-screen icon,
works offline, installs straight from the browser. No App Store, no build step.

## What it is

- **6×6 board.** Each turn you're handed a piece to place on any empty tile.
- **Match 3+ connected** (orthogonally) of the same type and they merge into the
  next tier at the tile you placed. Merges cascade.
- **Build chain:** grass → bush → tree → hut → house → mansion → castle →
  floating castle → triple castle. *(Triple Castle needs **four** Floating Castles.)*
- **Bears** shuffle one space after every placement; trap one (no adjacent empty
  tile) and it becomes a tombstone. Tombstones chain: tombstone → church →
  cathedral → treasury.
- **Storehouse** (top-left) holds one piece in reserve — tap to swap.
- **Store** sells build-chain tiles for in-game **pretend coins only** (earned
  from merges). Prices rise with each purchase. No real money, ever.
- **Game over** when the board fills and nothing can free space.

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
- **Swappable asset map:** tiles render from `ASSETS` in `js/config.js`
  (emoji placeholders today). To move to image sprites, change `tileContent()`
  in `js/render.js` — no game logic changes.
- **Data-driven rules:** chains, scoring, spawn weights, and store prices all
  live in `js/config.js`. Tune there; logic never hard-codes a tile type.

## Tuning knobs (`js/config.js`)

`POINTS`, `COINS`, `SPAWN_WEIGHTS`, bear-chance ramp
(`BEAR_BASE_CHANCE` / `BEAR_CHANCE_PER_TURN` / `BEAR_MAX_CHANCE`), and store
prices (`STORE_BASE_PRICE`, `STORE_PRICE_GROWTH`). The scoring values are a
starting point to tune by feel — not Triple Town's real (unpublished) numbers.

## Status

Playable end to end: placement, cascading merges, full build chain, bears +
tombstone chain, storehouse, store + coins, score/best, game over, offline
caching, and localStorage persistence. See `CHANGELOG.md`.

**Deferred (backlog):** ninja bears, crystal (wildcard), imperial bot,
rock/mountain chain, custom image sprites, GitHub Pages deploy.
