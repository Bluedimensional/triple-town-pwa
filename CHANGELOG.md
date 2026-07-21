# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); newest first.

## [0.3.0] - 2026-07-21

### Added
- **Custom SVG sprites** (`js/sprites.js`) replacing emoji for every tile —
  round spotted bush, geometric angry bear, skull tombstone, grass tufts, brick
  hut, and building/tomb-chain art. Still a swappable asset map: edit one file
  to reskin, no logic changes.

### Changed
- **Continuous path:** empty "path" tiles now fuse into one shape with rounded
  end-caps (corners rounded per-neighbour), instead of separate rounded blocks.
- **Merge-preview border:** the white border now appears on the *new piece only*.
  Other tiles in the pending merge still pulse in sync, but never get a border.

### Migration
- Service-worker cache bumped to `tripletown-v4` (adds `js/sprites.js`).

## [0.2.1] - 2026-07-21

### Added
- **Merge preview:** when the waiting piece would complete a group of 3+
  (orthogonally connected, same type), every tile in that group pulses together
  with the white border — showing the merge before you place. If placing
  wouldn't combo, only the waiting piece pulses.

### Migration
- Service-worker cache bumped to `tripletown-v3` so devices fetch the new build.

## [0.2.0] - 2026-07-21

Reworked look and feel and the placement interaction to match the real game
(from play-testing feedback on iPhone Safari).

### Added
- **Pre-filled boards:** a new game now scatters a random starting layout
  (grass/bush/tree, a bear, sometimes a tombstone), different every time —
  no more blank opening board.
- **On-board active piece:** the piece to place now appears *on the board* in a
  tile adjacent to your last placement, pulsing (scale 1→1.3, 0.8s) with a white
  border. Tap any tile to place it. Replaces the old "Next" tray slot.
- **Storehouse is the top-left board square** (a brown ring when empty): tap to
  store the active piece / swap it back. It never matches and bears can't enter it.

### Changed
- **Field visuals:** dark dotted-grass background; empty tiles render as light
  "path" tiles and turn into plain field when filled — like the real game.
- **Sprites:** grass is now a leafy tuft (🌿), bush a round shrub (🌳), tree
  taller (🌲) — a clearer size progression. HUD/store restyled for the dark field.

### Fixed
- Blank-board opening on first launch (now pre-filled).

### Migration
- Save format bumped to `v2` and service-worker cache to `tripletown-v2`, so
  installed devices pick up the new build and start a fresh (pre-filled) game.

## [0.1.0] - 2026-07-21

Initial playable build — the full v1 scope in one pass.

### Deployed
- Published to GitHub Pages over HTTPS:
  https://bluedimensional.github.io/triple-town-pwa/ (source: `main` / root).
  Verified live: service worker registers and controls the page (offline-ready),
  manifest loads as `standalone`, all shell assets return 200.

### Added
- **PWA scaffold:** `manifest.json` (standalone display, theme colors), `sw.js`
  service worker (cache-first offline shell), generated home-screen icons
  (180/192/512 + maskable), iOS `apple-touch-icon` and standalone meta.
- **Board & rendering:** 6×6 DOM grid, HUD (score / best / coins), next-piece
  and storehouse slots, store row, game-over overlay, merge "pop" animation.
  Tiles drawn from a swappable emoji asset map.
- **Match engine:** flood-fill detection of connected same-type groups and
  cascading merges. Full build chain grass → … → triple castle, with the
  Floating Castle → Triple Castle merge requiring four (not three).
- **Bears:** spawn on a chance that ramps with turns, shuffle one tile per
  placement, and turn into tombstones when trapped. Tombstone chain
  (tombstone → church → cathedral → treasury).
- **Storehouse:** reserve slot; tap to swap the held piece (empty slot stashes
  and draws a fresh piece).
- **Store + coins:** earn coins from merges, buy build-chain tiles at prices
  that rise with each purchase. In-game pretend coins only.
- **Scoring & game over:** per-tier placement/merge points, best-score tracking,
  game over when the board fills.
- **Persistence:** full game state saved to `localStorage` after every action;
  restored on load. Best score persisted separately.
- **Docs:** `README.md` (run/install/structure/tuning) and this changelog.

### Notes
- Scoring, spawn weights, and bear-chance ramp are starting values in
  `js/config.js`, meant to be tuned by feel.
- Verified: 10/10 pure-logic tests (merges, 4-castle rule, cascade, tombstone
  chain) plus in-browser play-through of placement, cascade, storehouse, store
  purchase, and reload-persistence.
