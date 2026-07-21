# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); newest first.

## [0.11.0] - 2026-07-21 (v26)

### Added
- **Super (enhanced) pieces:** matching MORE than the minimum (4+ for the usual
  3-chains, 5+ for Floating Castle) now yields a **super** version of the result,
  worth **double points**. Super pieces group and merge with regular ones (a
  super bush combines with two regular bushes). Super bush/tree show red berries;
  other supers get a gold-star badge (placeholder until real art). Regular pieces
  are unchanged. Verified with 7 super tests + all regressions.

### Notes
- Super-piece art beyond the berry-plants is a placeholder — needs the real
  enhanced-piece images to match each one exactly.

### Migration
- Service-worker cache bumped to `tripletown-v26`.

## [0.10.0] - 2026-07-21 (v25)

### Added
- **Crystal (wildcard):** a rare spawn (~2.5%, tunable) and a store item (250
  coins). Placed next to a group, it becomes whichever type completes the
  **highest-value** merge (and cascades). Placed where it can't complete any
  match, it turns into a **Rock** — an immovable, unplaceable obstacle (as in the
  original). New crystal + rock sprites. Verified: completes best merge, picks
  higher value, works with the tombstone chain, and fizzles to rock; all
  regression tests pass.

### Migration
- Service-worker cache bumped to `tripletown-v25`.

## [0.9.1] - 2026-07-21 (v24)

### Changed
- **Stored piece sits on the plate:** the storehouse now shows the plate *and*
  the held piece resting on it (both visible), instead of hiding the plate.

### Migration
- Service-worker cache bumped to `tripletown-v24`.

## [0.9.0] - 2026-07-21 (v23)

### Added
- **Board size choice:** start a new game as **6×6 or 8×8** via size buttons in
  the toolbar (and on the game-over screen). The chosen size persists across
  reloads; prefill scatter and bears scale with the board area. Verified: switch
  both directions rebuilds the grid + path layer, merges work on 8×8, and reload
  restores the size.

### Migration
- Service-worker cache bumped to `tripletown-v23`.

## [0.8.4] - 2026-07-21 (v22)

### Fixed
- **Leftover grave when bears merge into a church:** trapped bears were turned to
  tombstones one at a time with a merge resolved after each, so a group of 4+
  merged 3 into a church and left the extra as a stray grave. Now all trapped
  bears become tombstones first, then merges resolve — the whole group collapses
  into one church (verified for 2/3/4/5 enclosed bears).

### Migration
- Service-worker cache bumped to `tripletown-v22`.

## [0.8.3] - 2026-07-21 (v21)

### Changed
- **Merge preview animation reworked:** ready-to-merge neighbours no longer
  scale toward the new piece — they now **thrust/slide** toward it (~20% of a
  tile, same size) at their current rate. The **new piece still pulses (scales)
  but at half speed** (560ms → 1120ms), so neighbours slide faster than it pulses.
- **Merge slide-in** (absorbed tiles flying into the merge point) **50% slower**
  (170ms → 340ms).

### Migration
- Service-worker cache bumped to `tripletown-v21`.

## [0.8.2] - 2026-07-21 (v20)

### Changed
- **Updates apply on refresh:** the service worker is now **network-first**
  (fetch the latest when online; fall back to cache only when offline), instead
  of cache-first (which served stale files until a second refresh). Added an
  auto-reload when a new worker takes control, so a new build loads promptly.

### Migration
- Service-worker cache bumped to `tripletown-v20`. (This is the last update that
  may need the old two-refresh / re-add dance; after landing on v20, online
  refreshes should show the newest build.)

## [0.8.1] - 2026-07-21 (v19)

### Changed
- **Cobblestone texture tuned to spec:** base `#75774a`; bricks randomly shaded
  `#777b4a` / `#7c804d` with a faint `#737746` border; bricks 20% smaller and
  less rounded (brick-like, not pill-like).

### Migration
- Service-worker cache bumped to `tripletown-v19`.

## [0.8.0] - 2026-07-21 (v18)

### Added
- **Merge slide-in animation:** tiles absorbed by a merge now slide toward the
  merge point and fade, instead of snapping. (Recorded in `state.mergeSlides`
  during resolveMerges; animated as overlay elements.)
- **Cobblestone path texture:** the path is filled with a repeating brick/cobble
  SVG pattern (like the reference), filter-free so it stays fast.

### Changed
- **No more long grass streaks:** capped consecutive grass at 5 and rebalanced
  spawns (grass 58 / bush 16 / tree 4). Verified longest run = 5 over 3000 spawns.

### Migration
- Service-worker cache bumped to `tripletown-v18`.

## [0.7.4] - 2026-07-21 (v17)

### Changed
- **Speed test:** the organic-path SVG turbulence/displacement filter (added
  after v10) is now behind an `ORGANIC_PATH` flag, set OFF. The path renders as a
  plain (fast) shape. iOS rasterizes that filter slowly on every placement, so
  this isolates whether it's the cause of the phone lag. If taps are smooth here,
  the organic look will be rebuilt without a runtime filter.

### Migration
- Service-worker cache bumped to `tripletown-v17`.

## [0.7.3] - 2026-07-21 (v16)

### Added
- **Version badge** above the board (shows the build, e.g. `v16`) so it's always
  clear which version is being tested. Kept in sync with the SW cache name.

### Changed
- **Mobile performance:** only rewrite a tile's sprite when its content actually
  changes (was re-parsing all 36 cell SVGs every placement) — render JS ~1.6ms →
  ~0.86ms; the win is larger on phones. Lightened the path filter
  (turbulence `numOctaves` 2 → 1), which iOS rasterizes slowly.

### Migration
- Service-worker cache bumped to `tripletown-v16`.

## [0.7.2] - 2026-07-21

### Changed
- **Snappier input:** tiles and store buttons now act on `pointerdown` (press)
  instead of `click` (release, after a tap-disambiguation delay) — removes the
  small lag between tapping and the piece landing. Added `touch-action:
  manipulation` (no double-tap-zoom delay) and skip re-rasterizing the path
  filter when the path shape hasn't changed. (Measured JS per placement ~1.6ms,
  so the felt delay was input latency, not rendering.)

### Migration
- Service-worker cache bumped to `tripletown-v15`.

## [0.7.1] - 2026-07-21

### Fixed
- **Bear trapping** now keys off the whole connected bear-group: a bear only
  turns into a tombstone when its group is *completely enclosed* (no open tile
  touching the group anywhere). A bear merely blocked this turn by a neighbouring
  bear whose group still touches open space now just waits instead of wrongly
  turning to stone. Two enclosed bears become two tombstones (a church still
  needs three).

### Migration
- Service-worker cache bumped to `tripletown-v14`.

## [0.7.0] - 2026-07-21

### Added
- **Organic path** — the path is now a single tan shape (union of path tiles)
  rendered behind the tiles with a turbulence/displacement SVG filter, so single
  spaces read as natural blobs and edges wobble organically instead of being
  square. One filter on one element (static; recomputed only on placement). A
  dark border traces the whole outline. Replaces the per-cell square tiles.
- **No shadow on the new piece** — the active (white-bordered) piece hides its
  ground shadow while highlighted.

### Notes
- Border color darkened to `#2c4116` (the requested `#495e31` was nearly
  identical to the field color, so it was invisible).
- Confirmed the merge-preview pulse is directional (members lean toward the new
  piece; the new piece pulses in place).

### Migration
- Service-worker cache bumped to `tripletown-v13`.

## [0.6.1] - 2026-07-21

### Fixed
- **Wonky path edges** — removed the per-cell corner rounding that produced
  notchy, stair-stepped edges around the storehouse/objects. Path tiles are
  square now (clean); truly organic edges are a planned separate pass.

### Changed
- **Grass** redrawn taller with an irregular, spiky top (varied blade heights)
  over the dark→light gradient.
- **Field background** is now scattered darker-green spots in three sizes (one
  large, two small and close in size, one of those fainter) instead of a perfect
  grid of identical dots.

### Notes
- Verified regular bears move exactly one adjacent square per turn (25/25 moves
  measured = 1 cell); no ninja bears have been added.

### Migration
- Service-worker cache bumped to `tripletown-v12`.

## [0.6.0] - 2026-07-21

### Added
- **Bears hop to their new tile** — three little hops (each covering a third of
  the way) instead of teleporting. Each turn's moves are recorded and animated.

### Changed
- **Storehouse is now a 3D plate** (a wooden dish with a lit rim and recessed
  well) instead of a plain ring, and the dark backing square is gone.
- **Grass redrawn** as a bushy, tufted mound with a dark→light gradient (no more
  smooth "UFO").

### Fixed
- **Path internal borders removed** — the dark border no longer boxes every
  embedded object; it traces only the path's outer edge (boundary + storehouse).

### Migration
- Service-worker cache bumped to `tripletown-v11`.

## [0.5.0] - 2026-07-21

### Performance
- **Removed the per-sprite CSS filters** (they stacked 10+ drop-shadows on every
  one of ~35 tiles and re-rasterized on every blink/pulse and on zoom — the cause
  of the jank and zoom/devtools lag). Outline (strokes) and the soft ground
  shadow are now **baked into each SVG**, so normal pieces use no filter at all.
  Only the single active piece keeps a lightweight white-halo filter.

### Changed
- **Pulse ~2× faster** (0.56s) and **directional:** each group member now leans
  *toward* the new piece ("we want to merge with THAT one") instead of scaling
  evenly; the new piece itself pulses in place. Only the sprite animates.
- **Path recolored** to `#959063` with a **dark `#495e31` border** traced around
  its outer edges.

### Known / next
- Organic wavy path edges are not in yet (needs a path-shape layer) — deferred.

### Migration
- Service-worker cache bumped to `tripletown-v10`.

## [0.4.2] - 2026-07-21

### Changed
- **Soft ground shadow** under every piece (a layered contact shadow), matching
  the original art's grounded look. Applies to placed pieces and the active piece.

### Migration
- Service-worker cache bumped to `tripletown-v9`.

## [0.4.1] - 2026-07-21

### Changed
- **White highlight hugs the piece, not the tile:** the active piece's white
  glow now traces the sprite silhouette (via a white outline filter) instead of
  drawing a border around the whole square tile.
- **Active tile joins the path:** the waiting piece's tile now uses the same
  path-rounding as everything else (rounds only where the path ends) instead of
  a fixed rounded square.
- **Subtler corners:** path corner radius halved (46% → 23%).
- **Layout:** the HUD/board/store stack is now vertically centered as a compact
  block, removing the large dead space between the toolbar and the board on
  taller screens; board sizing accounts for available height.

### Migration
- Service-worker cache bumped to `tripletown-v8`.

## [0.4.0] - 2026-07-21

### Changed
- **Dark outline on every sprite** for contrast against the field (a stacked
  8-direction drop-shadow, so it traces any silhouette).
- **Grass** redrawn as a low, wide patch of grass (was upright blades).
- **Tree** redrawn with two overlapping leaf canopies (lower olive + upper
  bright) and a trunk (was a single canopy).
- **Bear** redrawn: taller head with a bigger forehead, four legs (was two),
  and **blinking eyes** (CSS-animated).

### Migration
- Service-worker cache bumped to `tripletown-v7`.

## [0.3.2] - 2026-07-21

### Changed
- **Bears stand on the path:** a bear's tile now shows the tan dirt surface
  (fused with adjacent path, or its own rounded patch in the open) instead of the
  dark field. Other objects still sit on the field.

### Migration
- Service-worker cache bumped to `tripletown-v6`.

## [0.3.1] - 2026-07-21

### Changed
- **Pulse feel:** the waiting piece now grows less (scale 1.15 vs 1.30, −50%) and
  slower (1.15s vs 0.8s, ~30% slower). Only the sprite scales now — the tile and
  the white border underneath stay static.
- **Bear movement (canonical):** bears now take turns in Triple Town's fixed
  order — leftmost column first, top-to-bottom, then the next column — instead of
  a random order, so their wandering is predictable and trappable. Each still
  moves one square in a random cardinal direction, never jumps, and turns into a
  tombstone only when it has no tile to move to. (Confirmed against the
  Triple Town Wiki and Spry Fox support.)

### Migration
- Service-worker cache bumped to `tripletown-v5`.

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
