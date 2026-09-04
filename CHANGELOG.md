# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); newest first.

## [0.53.0] - 2026-09-04 (v82)

### Added
- **Guardian force-field.** A new meter (under the goal bar) fills as you merge —
  bigger merges/cascades fill it faster (it counts the tiles absorbed). When it's
  full, the **next piece you're handed is a giant Guardian** of whatever buildable
  type it would have been. Place it and the **8 tiles around it become a force
  field for 3 real minutes**: any bear, tombstone, or rock that appears there is
  **vaporized** (with a ✨ puff). A countdown ticks **3 → 0** beside the meter;
  when it ends the giant shrinks back to a normal piece of its type. The giant
  visibly **overflows its cell** over its neighbours (still visible underneath),
  and its overflow doesn't block taps on the tiles below it. One ward at a time —
  the meter can't recharge while a Guardian is pending or a ward is active. Runs
  in real time in both modes; survives undo and save.
  - Tunable in `js/config.js`: `WARD_CHARGE_GOAL` (absorbed tiles to fill, 30),
    `WARD_DURATION_MS` (3 min), `WARD_TARGETS` (bear/tombstone/rock).

### Removed
- **2-minute Timed mode.** Modes are now just **Endless** and **5-minute** (the
  3-minute ward fits inside a 5-minute game). Existing 2-minute high scores stay
  in storage but no longer have a tab.

### Migration
- Service-worker cache bumped to `tripletown-v82`.

## [0.52.0] - 2026-09-04 (v81)

### Added
- **Combo multiplier.** Merge on consecutive placements to build a chain: each
  placement that triggers a merge extends it; a placement that merges nothing (a
  lone tile or a bear) breaks it. The chain sets a rising score multiplier on that
  turn's merge points — 1st merge 1×, then ×1.25, ×1.5, ×2, ×2.5, up to ×3 at a
  5-long chain. A 🔥 badge floats over the board's top-right showing the live
  multiplier while a chain is alive. Stacks with the High Roller charm. Combo
  survives undo (restored from the snapshot) and the save.

### Migration
- Service-worker cache bumped to `tripletown-v81`.

## [0.51.0] - 2026-09-04 (v80)

### Added
- **Roguelike Charms.** Every new run (endless AND timed) opens with a "Choose a
  Charm" screen offering **3 random perks** — pick one and it bends the rules for
  that whole game (Balatro-style). The board is dealt only after you choose, so
  charms can shape the opening hand. The six charms:
  - 🌱 **Green Thumb** — grass merges skip Bush, straight to Tree.
  - 💣 **Demolitionist** — start the run with 3 bombs.
  - ☮️ **Peaceful Valley** — bears appear 40% less often (spawns + opening scatter).
  - 💎 **Prospector** — crystals appear twice as often.
  - 🏷️ **Bargain Hunter** — store prices 30% cheaper all game (shown price too).
  - ✨ **High Roller** — every score boosted 15%.
  The chosen charm persists with the save (a refresh mid-choice restores the
  chooser); old saves from before this update keep playing with no charm.

### Migration
- Service-worker cache bumped to `tripletown-v80`.

## [0.50.0] - 2026-09-04 (v79)

### Removed
- **Grave bomb removed** (the 🪦 "clear a tombstone" tool next to the 💣 bomb).
  Its button, its earn rule, and all related state/UI are gone. The regular Bomb
  (💣 rock/bear) is unchanged. `state.armed` is now `null | 'bomb'` only.

### Fixed
- **Crystal-choice cancel no longer locks the board.** When a placed crystal
  could complete more than one merge, the chooser opens; tapping the dim backdrop
  now returns the crystal to your hand (restores the pre-placement snapshot)
  instead of leaving it pending on the board, which had blocked bombing tiles and
  swapping the piece into storage until you picked an option.

### Migration
- Service-worker cache bumped to `tripletown-v79`.

## [0.49.0] - 2026-08-20 (v78)

### Removed
- **Zap power removed** (it made the game too easy). The ⚡ button, the "delete
  anything" ability, its charge/grant surprise, and all related state/UI are gone.
  Bombs (💣 rock/bear) and grave bombs (🪦 tombstones) are unchanged.

### Migration
- Service-worker cache bumped to `tripletown-v78`.

## [0.48.2] - 2026-08-20 (v77)

### Changed
- **Church looks more churchy.** Added a **bell-tower steeple** (with a bell louver)
  above the roof, so it reads clearly as a church rather than a house — without a
  cross (that stays the Cathedral's crown).

### Migration
- Service-worker cache bumped to `tripletown-v77`.

## [0.48.1] - 2026-08-20 (v76)

### Added
- **Townsfolk suit up on space levels.** On the **space** and **cosmic** themes the
  wandering villagers become a mix of **astronauts** (white suit + visored helmet)
  and little green **aliens** (antennae, big black eyes), with the occasional
  regular person. On other themes they're normal folk as before.

### Migration
- Service-worker cache bumped to `tripletown-v76`.

## [0.48.0] - 2026-08-20 (v75)

### Changed
- **Storage plates moved to the bottom** — the reserve slots now sit *below* the
  board instead of above it.
- **Bears no longer blink in unison.** Each bear now has its own blink timing (a
  per-bear delay and speed), so blinks scatter naturally. Added two more idle
  gestures (**shiver**, **tip-over**) for 11 in total, so their fidgeting is more
  varied.

### Migration
- Service-worker cache bumped to `tripletown-v75`.

## [0.47.0] - 2026-08-20 (v74)

### Changed
- **Levels keep evolving — the field never looks the same twice.** The background
  theme used to stop changing after level 3. Now there are **12 themes** — grass,
  desert, jungle, ocean, ice, space, cosmic (a 2nd space), aurora, lava, candy,
  dusk, moss — that **cycle** as you level up, and **every lap the whole field
  hue-shifts**, so a repeated theme (e.g. level-13 grass) looks different from the
  first time. The field now lives on a background layer, so hue-shifting recolours
  it without tinting the game pieces.

### Migration
- Service-worker cache bumped to `tripletown-v74`.

## [0.46.0] - 2026-08-20 (v73)

### Added
- **Timed games start with higher-tier pieces** (like the original's 2-minute "Boom
  Town"). Instead of an empty-ish grass board, a timed game opens with a denser
  scatter of bushes/trees/huts/houses/mansions so you can build castles fast in the
  limited time. Endless mode is unchanged.

### Changed
- **Crystal chooser can be dismissed to peek at the board.** Tap the dim area around
  the chooser to hide it without picking — the crystal stays put and **pulses**; tap
  that pulsing crystal (or the hint says so) to bring the chooser back and choose.
- **Switching the timer is now a prompted restart.** The ⏱ ∞/2m/5m buttons no longer
  silently change a pending setting mid-game; tapping one asks "Leave this game and
  start a new … game?" and starts fresh on Yes (a game already underway can't change
  its own clock).

### Migration
- Service-worker cache bumped to `tripletown-v73`.

## [0.45.1] - 2026-08-14 (v72)

### Changed
- **Path looks more organic.** The grass margin around the path used to be a
  uniform inset, which read as rounded rectangles. Now the inset **varies smoothly
  across the board** (a deterministic field, ~0.035–0.17 of a cell) so the outer
  boundary undulates in and out — a more natural, irregular shape — while connected
  cells still fuse seamlessly and corners keep their varied rounding.

### Migration
- Service-worker cache bumped to `tripletown-v72`.

## [0.45.0] - 2026-08-14 (v71)

### Added
- **Board snapshots on high scores.** Every finished game now saves its **final
  board** and **play duration** with the score. In the High Scores modal, tap any
  score (▸) to see that game's whole board re-rendered from the pieces — no
  game-over overlay — along with the score, level, duration, mode, and date. Tap
  **← Back** to return to the list. The snapshot is captured the moment the game
  ends, before the popup. (Only games played from now on have snapshots; older
  scores show "No snapshot".) Stored compactly as the tile grid (not an image), so
  it's easy on storage and persists across updates like the rest of the scores.

### Migration
- Service-worker cache bumped to `tripletown-v71`.

## [0.44.1] - 2026-08-14 (v70)

### Changed
- **Crystal-choice popup is now minimal.** Dropped the white card, the "Which one?"
  title, and the explanatory sentence — it's just each possible result piece in its
  own box, floating over the dimmed board. The choice is obvious from the pieces.

### Migration
- Service-worker cache bumped to `tripletown-v70`.

## [0.44.0] - 2026-08-14 (v69)

### Added
- **Crystal choice.** When you place a crystal (wildcard) where it could complete
  **more than one different merge** — e.g. it's next to both a pair of bushes and a
  pair of grass — the game now **pauses and asks which to make**, showing each
  possible result piece by name. Pick one and that merge resolves. When only one
  merge is possible (or none), it still resolves automatically as before (a lone
  crystal with no match still becomes a rock).

### Migration
- Service-worker cache bumped to `tripletown-v69`.

## [0.43.0] - 2026-08-14 (v68)

### Added
- **⚡ Zap — a rare surprise power that deletes ANYTHING.** Unlike bombs (earned
  from merges), a Zap charges up quietly as you play: every **bear** that spawns
  adds a charge, and after a **randomized 6–12** of them one arrives **unannounced**
  — a little ⚡ explosion fires and the **⚡ counter appears** in the HUD (it's hidden
  until you have one). Arm it (electric-cyan button) and tap **any** tile — building,
  plant, bear, rock, grave, anything — to delete it. Free action, doesn't use your
  held piece. Rarer and fewer than bombs (cap **3**). Persists across reloads and is
  restored by undo. Shares the aim system with the bombs (only one armed at a time).

### Migration
- Service-worker cache bumped to `tripletown-v68`.

## [0.42.1] - 2026-08-14 (v67)

### Fixed
- **Long-pressing the held piece with no bombs no longer places it.** Before, the
  bomb-arm long-press only engaged when you *had* a bomb, so holding with an empty
  count fell through and dropped the piece. Now the hold is always recognized: with
  no bombs it does **not** place and instead flashes the 💣 counter — a one-cycle
  scale-out-and-back pulse with a red tint — to say "no bombs". A quick tap still
  places as normal.

### Migration
- Service-worker cache bumped to `tripletown-v67`.

## [0.42.0] - 2026-08-14 (v66)

### Added
- **Timed mode.** A new ⏱ chooser in the toolbar picks the length for your next
  game: **∞ Endless** (the classic, default), **2 min**, or **5 min**. In a timed
  game a countdown clock shows in the goal bar (turns red and pulses in the last
  30s); when it hits zero the game ends and records your score. The clock counts
  real time while you're playing and **pauses when the app is off-screen** (and a
  reload resumes where it left off), so backgrounding the app doesn't burn time.
- **Top 10 scores, per mode.** The leaderboard now keeps the **best 10** (was 5)
  and tracks each timed mode on its **own board** (so 2-min scores compare to
  2-min, not to endless). The High Scores modal gained **∞ / 2 min / 5 min tabs**
  and opens on the mode you just played.

### Notes
- Scores persist across updates exactly as before (localStorage, untouched by the
  service worker); existing Endless high scores are preserved under their same keys.

### Migration
- Service-worker cache bumped to `tripletown-v66`.

## [0.41.0] - 2026-08-14 (v65)

### Added
- **Grave bombs 🪦.** A second, rarer special that clears a stuck **Tombstone** (a
  grave left when bears run out of room). Regular 💣 bombs can't touch graves; only
  grave bombs can (and grave bombs can't touch rocks/bears). Earned **less often**
  than regular bombs — a bigger merge is needed (Floating Castle / Treasury tier,
  `GRAVE_BOMB_EARN_MIN_POINTS = 5000`; cap 5). A separate slate/violet 🪦 counter
  sits next to the bomb button; tap to arm, then tap a grave to clear it (free
  action, doesn't consume your piece). Persists across reloads; undo restores it.
  Internally the two bombs now share one aim system (`state.armed` = 'bomb'|'grave').

### Migration
- Service-worker cache bumped to `tripletown-v65`.

## [0.40.0] - 2026-08-14 (v64)

### Changed
- **Villagers refined.** They're now **~half the height** and drawn **waist-up (no
  legs)** — a compact bust. Their behavior got much more varied: each trip is a
  **random walk** of 1–3 tiles with **mixed x/y directions and lengths**, they
  **linger outside for a random amount of time** (some stay out much longer than
  others), and **occasionally they stroll into a *different* nearby building**
  instead of heading back home. Motion is now built per-villager via the Web
  Animations API, so no two trips match. Honors reduced-motion (a simple fade).

### Migration
- Service-worker cache bumped to `tripletown-v64`.

## [0.39.0] - 2026-08-14 (v63)

### Added
- **Townsfolk.** Little villagers now stroll out of your buildings. Every few
  seconds a small figure emerges from a residential building (hut, house, mansion,
  castle, mega castle, kingdom, metropolis — super variants too), walks onto an
  adjacent open path tile with a walking bounce, pauses, and heads back inside.
  Up to 2 at once, each with a random look (tunic/skin/hair). Purely decorative —
  overlay only, never touches gameplay, pauses when the tab is hidden. New module
  `js/villagers.js` (+ precached in the service worker).

### Migration
- Service-worker cache bumped to `tripletown-v63`.

## [0.38.0] - 2026-08-14 (v62)

### Changed
- **Church vs Cathedral toppers.** The Church lost its cross topper — it's now a
  plain purple-roofed building (no cross, no star). The Cathedral keeps its
  copper-green look and gains a **crowning gold star** on top, so the two read as
  clearly different tiers. (The small corner star on match-4 "Super" pieces is a
  separate badge and is unchanged.)
- **Bears are busier still.** New idle gestures now start every **~0.6–1.9s** (was
  1–2.8s) and **up to 4 bears** animate at once (was 3) — more constant movement,
  with the wide timing spread keeping it from feeling metronomic.

### Migration
- Service-worker cache bumped to `tripletown-v62`.

## [0.37.0] - 2026-08-04 (v61)

### Changed
- **Kept out of search engines (link-only sharing).** Added `<meta name="robots"
  content="noindex, nofollow">` to `index.html` and a `robots.txt` (`Disallow: /`).
  This does NOT restrict access — anyone with the URL can still play; it just keeps
  the site from appearing in Google/Bing results.

### Migration
- Service-worker cache bumped to `tripletown-v61`.

## [0.36.0] - 2026-08-04 (v60)

### Changed
- **Cathedral no longer looks like the Church.** They shared gray walls, purple
  roofs, and a plain blue window. The Cathedral's twin spires are now **weathered
  copper-green** (`#4f9d8a`) with a **gold trim band** across the wall top and a
  **gold-ringed** rose window, so it clearly reads as a grander step up from the
  purple-roofed Church while both keep the gray-stone church-line identity.

### Migration
- Service-worker cache bumped to `tripletown-v60`.

## [0.35.0] - 2026-08-04 (v59)

### Changed
- **Start with 2 storage slots** (was 1). The whole unlock schedule shifts up by
  one: 2 from the start, a 3rd at level 2, a 4th at level 3 (`MAX_STORAGE` 3 → 4,
  `unlockedStorage = min(4, level+1)`). In-progress games pick this up on reload.
- **Bears are much livelier.** Added **five** new idle gestures — **hop, spin,
  bounce, look, nod** — for **nine** in total (with lean, wiggle, scratch, stamp).
  A new gesture now starts every **~1–2.8s** (was 2–4.5s) and **up to 3 bears can
  fidget at once** (was strictly one at a time), so a crowded board reads as busy
  and alive like the original. Still transform-only (cheap on phones) and paused
  while the tab is hidden. All cadence/concurrency values are tunable.

### Migration
- Service-worker cache bumped to `tripletown-v59`.

## [0.34.0] - 2026-08-04 (v58)

### Added
- **Bombs — a new long-press special.** You **earn a Bomb** whenever a merge creates
  a Castle-tier-or-higher piece (a 💣 icon + count sits next to the undo button;
  capped at 9). **Long-press the held piece** — or tap the 💣 button — to **arm** it:
  the piece glows red, every Rock and Bear on the board lights up as a target, and a
  hint appears. **Tap a Rock or Bear to blow it up.** It's a *free* action — it clears
  the tile but does **not** use up the piece in your hand, draw a new one, or count a
  turn. Tapping anything else (or the 💣 again) cancels. Buildings can't be bombed.
  Bombs persist across reloads and are taken back correctly by undo.
- **Close the Game Over screen without starting a new game.** A corner **✕** and a
  **"✕ Close & view my board"** button both dismiss the popup so you can study the
  finished board; the New-game buttons (in the popup and the toolbar) still restart.

### Migration
- Service-worker cache bumped to `tripletown-v58`.

## [0.33.0] - 2026-08-04 (v57)

### Added
- **Both chains extended with two new top tiers each**, so long games keep producing
  upgrades instead of topping out:
  - **Build:** …Kingdom → **Metropolis** (teal glass-skyscraper skyline; 180,000 pts /
    3,500 coins) → **Sky Utopia** (floating cloud-city with white spires, gold domes,
    and a rainbow; 400,000 pts / 8,000 coins).
  - **Tomb:** …Golden Pyramid → **Phoenix** (a fiery bird rising — rebirth; 280,000 pts /
    6,000 coins) → **Divine Sun** (a radiant sun with a serene face; 600,000 pts /
    15,000 coins).
  - Each is deliberately unlike the pieces below it (modern city, cloud-city, a bird,
    a sun). New SVG sprites with Super (match-4+) variants; MERGE / POINTS / COINS /
    NAMES / ASSETS / chains / SUPER_BASES all wired. Both chains verified end-to-end.
    Placeholder art for now — tunable later.

### Migration
- Service-worker cache bumped to `tripletown-v57`.

## [0.32.0] - 2026-08-04 (v56)

### Fixed
- **Floating Castle now merges at 3, like every other piece.** It was the lone
  exception that needed **4** to combine into a Triple Castle. That surprised
  players (three Floating Castles did nothing) and — the reported bug — a **crystal
  placed between two Floating Castles couldn't complete the trio, so it fizzled into
  a Rock** instead of making a Triple Castle. Changed `floatingCastle → tripleCastle`
  to `need: 3`. Verified: crystal-between-two and three-in-a-group both now yield a
  Triple Castle.

### Migration
- Service-worker cache bumped to `tripletown-v56`.

## [0.31.0] - 2026-08-04 (v55)

### Added
- **Tomb line keeps going past Royal Vault.** Two new top tiers extend the bear /
  tombstone chain: **Treasure Hoard** (the treasure bursts its chest into a grand
  overflowing gold mound with gems and a crown; 50,000 pts / 1,000 coins) and, above
  it, the ultimate **Golden Pyramid** (a radiant two-faced gold monument with a
  jewelled capstone; 120,000 pts / 2,500 coins). Full chain is now
  Tombstone → Church → Cathedral → Treasury → Royal Vault → Treasure Hoard → Golden
  Pyramid. Both have Super (match-4+) variants. Merge engine verified end-to-end.

### Note
- Royal Vault → Treasure Hoard needs 3 Royal Vaults, and Treasure Hoard → Golden
  Pyramid needs 3 Treasure Hoards, so these sit deep in the endgame (mostly reachable
  via crystal wildcards or very long runs). Verified 3 Treasuries **do** correctly
  merge into a Royal Vault — that merge was never broken; connected (orthogonal, not
  diagonal) placement is required.

### Migration
- Service-worker cache bumped to `tripletown-v55`.

## [0.30.0] - 2026-08-04 (v54)

### Changed
- **Castle no longer looks like the gray churches.** Its walls changed from
  gray-tan stone (`#bdb8a6`→`#8b8674`) to **warm honey sandstone**
  (`#cba867`→`#93713b`), and the little side-tower pennants went from gold (which
  would have vanished on the new walls) to the castle's **crimson** flag colour.
  With its purple gothic roofs it now reads clearly apart from the gray-stone
  Church/Cathedral line.

### Migration
- Service-worker cache bumped to `tripletown-v54`.

## [0.29.0] - 2026-08-04 (v53)

### Changed
- **Path edges refined toward the original's look.** The old version bulged every
  grass-facing side *outward* by the same amount, which read as uniform, "robotic"
  scallops pushing into the field. Now each grass-facing side is pulled *in* by a
  small **grass margin** (padding all around the path), straight runs stay straight
  instead of scalloping per-cell, and only true **outer corners** round — each with
  a **per-corner varied** radius (deterministic, so it never jitters) that is
  **shallower** than before. Sides shared with another path tile still sit on the
  cell boundary, so connected tiles fuse with no seam and the path reads continuous.

### Migration
- Service-worker cache bumped to `tripletown-v53`.

## [0.28.0] - 2026-07-24 (v52)

### Added
- **Undo** — you earn one undo each time you complete a level. An **↩ button with
  a count** sits in the level bar; tap it to take back your last move (it restores
  the board, score, level, coins, and hand exactly, and spends one undo). Up to
  the last 10 moves are held; undos and history persist across reloads.
- **Level-up celebration** — completing a level now fires a full-screen, **non-
  blocking** flash with a burst of stars and a big **"Level N"**, then fades on
  its own (play is never interrupted; honors reduced-motion).

### Migration
- Service-worker cache bumped to `tripletown-v52`.

## [0.27.0] - 2026-07-24 (v51)

### Changed
- **Organic path, done filter-free.** The path no longer renders as hard squares.
  Each cell edge that borders open field now **bulges gently outward** (a
  deterministic quadratic curve), while edges shared with another path cell stay
  straight — so a lone tile becomes a soft blob and runs of tiles flow with wavy
  borders, like the original. Crucially this is **pure path geometry with no SVG
  filter**, so it can't cause the iOS rasterization lag the old turbulence filter
  did. Measured ~2.3ms per placement (full render), same class as the old plain
  path; the shape only rebuilds when it actually changes.

### Migration
- Service-worker cache bumped to `tripletown-v51`.

## [0.26.1] - 2026-07-24 (v50)

### Changed
- **Darker outlines on every piece** (~40% darker), for the crisp, defined border
  look of the original. Light highlight strokes were left alone.
- **Deeper drop shadow** — a touch darker and slightly larger, so pieces feel more
  grounded.

### Added
- **Scores are now more durable** — the game requests *persistent storage* on
  load, so the browser won't evict your saved scores/progress. (On iPhone this is
  most reliable when the game is **added to the Home Screen** as an app.)

### Migration
- Service-worker cache bumped to `tripletown-v50`.

## [0.26.0] - 2026-07-24 (v49)

### Changed
- **Floating Castle redrawn** — was a small box that read as a downgrade; now a
  tall silver-and-blue keep with three spires on a floating island (cloud + rock).
- **Triple Castle** is taller (tall gold keep + big star) and sits on the same
  floating island.
- **Mansion** is now a golden-tan villa (distinct from the white house), with a
  wider, **centered** second story instead of a right-corner tower.
- **Grass tips are more even** — kept the varied height but reduced the gap
  between the tall and short blades.

### Added
- **Royal Vault** — a new tier above Treasury (bear line): a grand crowned gold
  chest overflowing with coins and gems. So three Treasuries now merge into a
  Royal Vault instead of dead-ending (20,000 pts). A crystal between two
  Treasuries makes one too.

### Migration
- Service-worker cache bumped to `tripletown-v49`.

## [0.25.3] - 2026-07-24 (v48)

### Changed
- **Crystals spawn noticeably more often.** The base crystal rate was raised from
  ~2.5% to 6% so the density settings are obvious: **1× ≈ 1 in 17, 2× ≈ 1 in 9,
  3× ≈ 1 in 6** placements. (The 1×/2×/3× multiplier was already working — this
  just makes the whole range easier to see.)

### Notes
- A **crystal placed between two churches already merges them into a cathedral**
  (and two cathedrals into a treasury) — that was already supported; no change
  needed.

### Migration
- Service-worker cache bumped to `tripletown-v48`.

## [0.25.2] - 2026-07-24 (v47)

### Changed
- **Church and cathedral walls are now gray stone** (`#a3a29a`) instead of the
  cream that read too much like the houses. They now clearly belong to the gray
  bear/tombstone line and are easy to tell apart from the cream-and-terracotta
  houses at a glance. (Purple roofs, cross, and windows unchanged.)

### Migration
- Service-worker cache bumped to `tripletown-v47`.

## [0.25.1] - 2026-07-24 (v46)

### Changed
- **Crystal-density changes now take effect immediately, even mid-game** (was
  only applied when starting a new game). Tapping 1×/2×/3× updates the live
  multiplier at once, so the next crystals spawn at the new rate, and it's still
  remembered for future games.

### Migration
- Service-worker cache bumped to `tripletown-v46`.

## [0.25.0] - 2026-07-24 (v45)

### Added
- **Crystal-density setting (1× / 2× / 3×), chosen per game.** A 💎 chooser in the
  toolbar sets how many crystals spawn; the choice locks in when you start a new
  game and persists. 2×/3× multiply the crystal spawn rate.
- **Two new top-tier pieces so high-crystal games don't dead-end:** the merge
  chain now continues **Triple Castle → Mega Castle → Kingdom**. Mega Castle is a
  three-tower golden fortress with red roofs, a flag, and a crown gem; Kingdom is
  a grand domed golden palace with a crown and a soft glow. (Points 30k / 75k;
  coins 600 / 1500.)

### Verified
- Node: 3 Triple Castles → Mega Castle, 3 Mega Castles → Kingdom, Kingdom stays
  top; crystal rate scales (1× ≈ 2.5%, 3× ≈ 6.7% over 3000 spawns).
- Browser: 💎 chooser highlights/saves; toolbar wraps cleanly at 375px with no
  overflow; new sprites render across the castle progression.

### Migration
- Save adds `crystalMult`/`pendingCrystalMult` (default 1); service-worker cache
  bumped to `tripletown-v45`.

## [0.24.0] - 2026-07-24 (v44)

### Added
- **7×8 board option** (7 wide, 8 tall) — the first non-square board. The engine
  now supports arbitrary `cols × rows`, and the board keeps square cells at any
  ratio. Chosen from the new-game chooser alongside 6×6 / 7×7 / 8×8.

### Changed
- **Board dimensions are now `cols` × `rows`** throughout (was a single square
  `size`): state, board loops, bear/merge bounds, prefill scaling, rendering,
  the grid CSS (`aspect-ratio: cols/rows`), and the storage row all use both.
- **High scores are keyed per board** (`"6x6"`, `"7x8"`, …) and the modal shows a
  column for each of the four boards.

### Migration
- Old saves with a single square `size` load as `cols = rows = size`; legacy
  numeric score keys (`"6"`/`"7"`/`"8"`) migrate to `"6x6"`/`"7x7"`/`"8x8"` on
  read, so existing bests are preserved.
- Service-worker cache bumped to `tripletown-v44`.

## [0.23.0] - 2026-07-24 (v43)

### Added
- **Storage moved to a row above the board, with slots that unlock by level.**
  There's now a dedicated row of reserve slots above the board: **1 slot from the
  start, a 2nd unlocked at level 2, a 3rd at level 3** (locked slots show a dimmed
  plate). Each slot swaps/stashes the held piece like the old storehouse did —
  tap an empty slot to stash and draw fresh, tap a full one to swap. Buying from
  the store tucks your held piece into the first free slot.

### Changed
- **The board's top-left cell is now a normal playable tile** (it used to be the
  single storehouse). The board is a full 6×6 / 7×7 / 8×8 now; bears and prefill
  can use that corner.
- Toolbar hint updated ("slots above = storage").

### Migration
- Save format: a single `reserve` is migrated into the first storage slot on load.
- Service-worker cache bumped to `tripletown-v43`.

## [0.22.0] - 2026-07-24 (v42)

### Changed
- **Tree redrawn to match the original** — the v40 tree read sparse; the new one
  is full and healthy: two big overlapping leaf masses (olive back, bright front)
  built from clustered lumps with leaf-spot texture, coming down low over a short,
  fat, flared trunk.

### Migration
- Service-worker cache bumped to `tripletown-v42`.

## [0.21.0] - 2026-07-24 (v41)

### Changed
- **Non-bear pieces are a bit fatter** — tiles now fill 100% of their cell (was
  94%). **Bears are pinned at their tuned 94%** so they don't grow (the active
  bear preview matches).
- **Level themes reworked:** level 2 is now **outer space** (dark sky, scattered
  stars, faint nebula glows) instead of desert, and level 3 is now **deep ocean**
  (blue water with light ripples and a depth gradient) instead of the flat water.
  Level 1 stays grass. Everything else (path, pieces, HUD) is unchanged.

### Migration
- Service-worker cache bumped to `tripletown-v41`.

## [0.20.1] - 2026-07-24 (v40)

### Changed
- **Tree redrawn:** the two leaf canopies are now **organic lumpy blobs** instead
  of perfect circles, the **trunk is ~30% fatter** with a flared, wider base, and
  the overall base is a little wider. Keeps the two-tone (olive back / bright
  front) depth.

### Migration
- Service-worker cache bumped to `tripletown-v40`.

## [0.20.0] - 2026-07-24 (v39)

### Changed
- **House & mansion redrawn (Mediterranean villa direction)** so the two former
  cream buildings are now clearly distinct: the **house** is white stucco with a
  terracotta roof and arched door/windows; the **mansion** is a grander villa with
  a corner tower and an arched arcade. (The red hut is unchanged.)
- **Castle is now gothic** — pointed slate spires, a rose window, a portcullis
  gate, and a little flag; a taller, cooler silhouette.
- **Crystal redrawn to match the original** — a tall icy faceted shard with a
  bright highlight and sparkle, standing on a small grassy mound with a rock at
  the base (was a floating blue gem).
- **Bigger, darker contact shadow on every piece** — the shared shadow is ~22%
  wider, a touch deeper, and sits slightly lower so pieces feel grounded.

### Migration
- Service-worker cache bumped to `tripletown-v39`.

## [0.19.2] - 2026-07-24 (v38)

### Changed
- **Desert (level 2) field darkened** from `#cdb277` to `#a5894e` — it was too
  bright; now a muted sand that sits with the grass/water tones.
- **High Scores modal now shows the top 3** per board size (was top 5). Scores are
  still stored beyond that; only the display changed.

### Notes
- **High scores already persist across updates and app close/reopen** — they live
  in `localStorage` (`tripletown.scores.v1`), which the service-worker update
  never touches (it only clears the old app-shell *cache*), and which survives
  reloads. Verified there's no code path that clears them. (Local dev only: each
  `localhost:PORT` is a separate origin with its own storage, so test scores
  don't carry between ports — the live site is a single origin and is fine.)

### Migration
- Service-worker cache bumped to `tripletown-v38`.

## [0.19.1] - 2026-07-24 (v37)

### Changed
- **Bears slimmed a bit more** — width moved about a quarter of the way from the
  v36 midpoint back toward the pre-fattening bear: slimmer than v36, still
  chunkier than the original. Ears, legs, and shadow adjusted to match.

### Migration
- Service-worker cache bumped to `tripletown-v37`.

## [0.19.0] - 2026-07-24 (v36)

### Changed
- **Bears slimmed down a touch** — width is now a midpoint between the pre-v32
  bear and the v32 "fat" bear: less fat than v32, still chunkier than the
  original. Ears, legs, eyes, and shadow adjusted to match.

### Added
- **Level field themes (a test):** the field background recolours as you level
  up — **level 1 grass, level 2 desert, level 3+ water** — while everything else
  (path, pieces, HUD) stays the same. Driven by `data-field` on `<body>` from the
  current level; colours are CSS variables in `styles.css`, with a 0.6s fade.

### Notes
- The tan cobble path keeps its colour on every theme (only the "grass" field
  recolours, as asked). To actually see desert/water in normal play you must
  reach level 2 (20,000 pts) / level 3 (45,000) — say the word and I can
  temporarily lower the thresholds so it's easy to test.

### Migration
- Service-worker cache bumped to `tripletown-v36`.

## [0.18.0] - 2026-07-24 (v35)

### Changed
- **The turn limit is gone — play is now perpetual.** The game only ends when the
  board genuinely fills (no empty tile left), as in classic Triple Town. Reaching
  a level never ends or interrupts the game; levels are purely score milestones.
  (This removes the v34 whole-game 150-turn cap that was ending runs early and
  popping the game-over card mid-play — the "gets stuck" report.)
- **Goal bar** no longer shows "turns left" — just the level and points to the
  next level, with the progress meter.
- Game-over card reason is now simply "No room left — final score".

### Removed
- `turnsLeft` / `overReason` state, the `LEVEL_TURN_BUDGET` config, and the
  turns-based game-over path.

### Verified
- Node: 300 placements on a deliberately non-full board never end the game (no
  turn cap); filling the last empty cell still ends it (board-full).
- Browser: goal bar shows only "Level N · X to level N+1" + meter, no turns; no
  console errors.

### Migration
- Service-worker cache bumped to `tripletown-v35`.

## [0.17.0] - 2026-07-24 (v34)

### Changed
- **Reaching a level no longer interrupts play or refills turns.** Levels are now
  score milestones you pass while playing: the top bar just ticks up to the next
  level and shows **how many more points** it needs, and the game keeps going. The
  turn budget (150) is now for the **whole game**, not per level. The big
  "Level N!" banner is replaced by a brief, non-blocking highlight of the goal
  bar. (Previous behaviour refilled turns and flashed a full banner on each goal.)
- **Goal bar** now reads e.g. "Level 1 · 20,000 to level 2 · 150 turns left", and
  the progress bar fills within the current level (previous threshold → next).
- **High scores now record the level reached alongside the points.** The High
  Scores modal shows each run as score + "Lv N" + date; rows are two lines so all
  three board-size columns fit on a phone.

### Verified
- Node: crossing a goal advances the level and does **not** refill turns (150 →
  149) and does not end the game; the level reached is stored in the leaderboard.
- Browser: top bar shows "points to level N" and decrements live as you score;
  the goal-bar level-up highlight is wired; the scores modal fits with no
  horizontal overflow on a 357px-wide phone.

### Migration
- Service-worker cache bumped to `tripletown-v34`.

## [0.16.0] - 2026-07-24 (v33)

### Added
- **Level / goal mode with a turn budget** (like the original's goal + "turns
  left"). Each level grants **150 placements** to push your total score up to the
  level's goal (level 1 = 20,000; then 45k, 80k, 125k, 180k, …). Reaching the goal
  **clears the level** — the goal rises, the turn budget refills, and a "Level N!"
  banner flashes. Running out of turns (or filling the board) ends the game; the
  game-over card now says which. A goal bar above the board shows the level,
  target, progress, and turns remaining (turns turn amber at ≤15). All values are
  tunable in `config.js`.
- **Per-board-size high scores.** Best is now tracked separately for 6×6, 7×7,
  and 8×8. Tapping the **Best 🏆** stat opens a High Scores modal with the **top 5
  for each size and the date** each was earned. The HUD's Best reflects the
  current board size.

### Changed
- The `Best` value now comes from the per-size leaderboard rather than one shared
  number (the legacy single best is still read as a fallback).

### Verified
- Node: goals ramp 20k/45k/80k/125k/180k; leaderboard keeps the top 5 sorted with
  dates; per-size best is independent. Integration (DOM-free): new game inits
  L1/20k/150; crossing the goal advances the level and refills turns; running out
  of turns ends with reason "turns" and records the run.
- Browser: goal bar renders and turns decrement per placement; High Scores modal
  shows all three columns; game-over card shows the reason and level; **tapping
  the backdrop dismisses the game-over popup** (the reported bug).

### Migration
- Service-worker cache bumped to `tripletown-v33`.

## [0.15.0] - 2026-07-22 (v32)

### Changed
- **Bears redrawn wider** so they nearly fill the tile (barely any path square
  shows under them, matching the original). Face features widened to suit.
- **All pieces are chunkier** — the sprite now fills 94% of its cell (was 86%).
- **Bigger wiggle gesture** — the wiggle swing roughly doubled (±11% / ±11°,
  was ±5% / ±4°) so it reads clearly.
- **Game-over popup dismisses on an outside tap** — tapping the dark backdrop
  around the card hides it (revealing the finished board); the toolbar's New
  buttons still start a fresh game.

### Testing
- **Gesture cadence temporarily sped up to 2-4.5s** (was 5-15s) so the gestures
  are easy to observe. This is a testing value — say the word and I'll restore
  the original ~5-15s feel.

### Migration
- Service-worker cache bumped to `tripletown-v32`.

## [0.14.1] - 2026-07-22 (v31)

### Changed
- **Only one bear gestures at a time, and the 5-15s cadence is now board-wide.**
  In v30 each bear ran its own countdown, so a crowded board fidgeted constantly
  and two bears could animate at once — measured at one gesture every ~2.8s with
  five bears. There is now a single countdown for the whole board: one bear
  fidgets, then nothing moves anywhere for another 5-15s. The delay is counted
  from when a gesture *finishes*, so the still period the player sees is the
  full 5-15s.
- **Grass has rounded bottom corners** instead of sharp points where the outer
  blades met the base.

### Verified
- Five bears over 100s: 10 gestures, quiet gaps of 5.5-14.3s (all inside the
  5-15s range), and 1154 samples confirmed never more than one gesture running
  at any moment.

### Migration
- Service-worker cache bumped to `tripletown-v31`.

## [0.14.0] - 2026-07-22 (v30)

### Added
- **Bears fidget in place** (`js/gestures.js`), like the original: a bear
  scratches an itch, stamps the ground, throws a small karate move, or leans
  about. Each bear gets its own countdown, firing at a **random 5-15s** interval.
  Scheduling is per-bear-slot rather than per-cell, because bears move tile to
  tile on every placement and a cell-bound timer would reset before it ever
  fired. Transform-only animations, so they stay cheap on phones.

### Changed
- **Bear redrawn from the original screenshots:**
  - Body is wider and squatter, with a warm light-to-dark vertical gradient and
    no seam between head and torso — one shade, so the head reads oversized.
  - **Removed the pale muzzle patch** — the nose and mouth now sit directly on
    the gradient. The pale rounded shape in the reference is a **belly**, which
    now sits on the dark "pants" instead.
  - Eyes are single angled almonds (socket and brow combined) with a small red
    pupil, replacing the separate eyebrow-plus-socket pair.
  - Ears are ~20% smaller and tucked further behind the head.
  - Legs darkened to `#3d2a18`.

### Verified
- Gestures observed firing 6 times over 67s at 8.4-14.8s gaps (inside the
  5-15s range); 233 samples over 45s confirmed never more than one gesture
  live at a time and that every gesture class removes itself.

### Migration
- Service-worker cache bumped to `tripletown-v30`; `js/gestures.js` added to the
  cached shell.

## [0.13.0] - 2026-07-22 (v29)

### Changed
- **Bear redrawn to match the original art:**
  - Ears are slightly pointed on the top-outer side instead of plain circles.
  - Nose and mouth moved up within the muzzle.
  - Body tapers — wider at the top than the bottom — so it's no longer a
    perfect rounded rectangle.
  - Eyes now have a dark socket behind a much smaller red pupil (r 4 → 2.4).
  - Bottom third is a darker `#5d4424`, divided by a curve that sits lower in
    the middle and higher at the edges (the muzzle overlaps its centre, as in
    the original).
  - A faint `#7b7c6a` rim traces the whole silhouette (ears + legs + body),
    drawn as a fattened stamp behind the piece.
  - The dark outline stroke is half as thick (3.5 → 1.75).
  - Added a dark inner ear — in the reference art but not in the written spec.
- Verified by rendering the sprite at 64/110/320/720px and in-game, including
  seven bears at once (the sprite's `clipPath` id repeats per instance, which
  renders correctly).

### Migration
- Service-worker cache bumped to `tripletown-v29`.

## [0.12.1] - 2026-07-22 (v28)

### Added
- **7×7 board size:** a new-game size option between 6×6 and 8×8, in both the
  toolbar chooser and the game-over screen. Prefill scatter and bear count scale
  with board area automatically (no logic changes needed).

### Migration
- Service-worker cache bumped to `tripletown-v28`.

## [0.12.0] - 2026-07-21 (v27)

### Added
- **Floating points:** every placement pops a "+N" above the tile you placed on
  (N = points that move earned — the piece's base points plus any merge), which
  floats up one cell and fades over ~1s. Verified: +25 on a merge, +5 on a plain
  placement, positioned at the placement cell.

### Migration
- Service-worker cache bumped to `tripletown-v27`.

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
