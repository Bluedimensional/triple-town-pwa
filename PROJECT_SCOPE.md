# Triple Town Clone — Project Scope

An **installable PWA** (Progressive Web App) clone of Triple Town (Spry Fox),
built to run on a phone. Installed via "Add to Home Screen" — no App Store,
no cost. Built in Claude Code. Classic endless mode — not the timed/goal mode.

---

## Confirmed decisions (v1)

- **Platform:** installable PWA from the start. Runs full-screen from a
  home-screen icon, works offline, installs straight from the browser.
  No App Store, no native build, no signing.
- **Mode:** classic *endless* Standard mode. No timer, no point goal to "win."
- **Scope:** minimal — build chain + regular bears + storehouse only.
- **Store:** included, but uses *in-game pretend coins only*. No real money, ever.
- **Art:** custom sprites (swappable asset map so art can be upgraded later).
- **Cut from v1:** App Store connectivity, meta-progression, unlockables,
  ninja bears, crystal (wildcard), imperial bot, rock/mountain chain.

---

## Packaging: PWA from the start

The game ships as a PWA on day one, not as an afterthought.

**What makes it installable (three required pieces):**
- `manifest.json` (or `.webmanifest`) — app name, icons, `display: standalone`,
  theme/background colors, start URL. Without `display: standalone` the phone
  treats it as a plain bookmark, not an app.
- **Service worker** (`sw.js`) — caches the game shell + assets so it launches
  offline and loads instantly.
- **HTTPS** — required for service workers. GitHub Pages provides this for free.

**Install flow (what you'll actually do on your phone):**
- iPhone: open the GitHub Pages URL in the real **Safari** app -> Share ->
  Add to Home Screen. (Must be Safari, not an in-app browser.)
- Android: Chrome will offer an install prompt, or use the menu -> Install app.

**iOS caveats to design around:**
- No automatic install prompt on iOS — installation is always manual.
- Must be opened in standalone Safari (in-app browsers can't install it).
- Cached storage can be evicted after long disuse -> we keep game state in
  localStorage so a cache wipe never loses progress.
- Push notifications would need iOS 16.4+ and home-screen install — but this
  game needs no push, so not a concern.

**Accuracy flags (verify if it ever matters):** Apple's iOS PWA stance has
shifted before (it briefly removed home-screen web apps in an iOS 17.4 EU beta
in 2024, then reversed). iOS PWA support is real today but lags Android. Scope
written against early-2026 knowledge — reverify Apple specifics before relying
on any edge behavior.

---

## Game mechanics reference (v1)

Based on Spry Fox's official documentation. These are the canonical rules for
the pieces we're keeping in v1.

**Core loop**
- 6x6 grid (the standard board).
- Each turn you're handed one piece to place on any empty tile — usually grass,
  occasionally a higher tier.
- Place 3+ of the same type *connected* (orthogonally adjacent) and they merge
  into the next tier, at the tile you just placed. Merges can chain (cascade).

**Build chain**

    grass -> bush -> tree -> hut -> house -> mansion -> castle
          -> floating castle -> triple castle

- Triple Castle intentionally requires **four** Floating Castles, not three.

**Regular bears**
- Move one space to an adjacent empty tile every time you place a piece.
- Bears move immediately after placement — placing one *onto* a target tile can
  make it hop off that tile if it has somewhere to go.
- A bear becomes a **tombstone** when trapped (no adjacent empty tile) or
  (later) when an imperial bot is used on it.
- 3+ connected tombstones -> church -> cathedral -> (higher). This is the payoff
  for dealing with bears.

**Storehouse (top-left)**
- Holds one piece in reserve; swap in/out.
- A tile in the Storehouse does NOT match with objects adjacent to it — you must
  take it out and place it on the board to use it in a match.

**Store (v1 behavior — our design decision)**
- Sells build-chain tiles (grass, bush, tree, hut...) for rising coin prices.
- Coins are earned in-game from matches. No real currency.
- (When crystal/bot arrive in a later phase, they get added to the store.)

**Game over**
- Board fills and nothing can free space.

**Not standardized (flagged):** exact per-tile point values and spawn rates are
NOT published by Spry Fox — their own docs say scoring varies by implementation.
The table below is *our* starting point, to tune by feel.

---

## Recommended tech stack

- **Vanilla HTML + CSS + JS**, single page, no framework, no build step.
  Opens directly in a phone browser; easy to host and iterate.
- **PWA layer:** manifest + service worker (see Packaging section above).
- **DOM grid + CSS transitions** for the 6x6 board (simpler than Canvas at this
  scale; smooth enough for merge/slide animations). Canvas is a later option if
  we want fancier motion.
- **localStorage** to save current game + high score (survives refresh,
  backgrounding, and cache eviction).
- **Deploy to GitHub Pages** — free HTTPS URL to open on the phone and install.

---

## Sprites

Build with a **swappable asset map**: each tile type -> an image path. Start with
a simple placeholder set so the game is fully playable, then upgrade the art
without touching game logic. The same asset set feeds the PWA icons.

Sprite source — decide at build time:
- Generate a simple consistent set, or
- Draw clean SVG tiles, or
- Supply your own art.

---

## Proposed file structure

    index.html            entry point
    manifest.json         PWA manifest (name, icons, standalone display)
    sw.js                 service worker (offline cache of shell + assets)
    css/styles.css
    js/
      main.js             bootstrap + touch/click input + SW registration
      game.js             board state, turns, score, spawning
      match.js            match detection (flood-fill) + cascade merges
      bears.js            bear spawn, movement, trap -> tombstone
      storehouse.js       reserve swap
      store.js            coins earned + buy a tile
      render.js           draw board, sprites, UI
      persistence.js      localStorage save/load
    assets/
      sprites/            swappable tile art
      icons/              PWA home-screen icons (multiple sizes)

---

## Build phases

1. **Skeleton + PWA scaffold** — repo, index.html renders an empty tappable
   6x6 grid, manifest.json + service worker registered, placeholder icons.
   Goal: it's installable to the home screen from the very first build.
2. **Core match engine** — placement, 3+ connected merge with cascades, full
   build chain, score, game-over on full board.
3. **Bears** — spawn, move one tile per placement, trap -> tombstone, tombstone
   chain (church -> cathedral -> ...).
4. **Storehouse** — reserve/swap one tile.
5. **Store + coins** — earn coins from matches, spend on build-chain tiles.
6. **Sprites + polish** — custom art, real PWA icons, merge animations, touch
   sizing, standalone-display check.
7. **Persistence + deploy** — localStorage save/load, finalize offline caching
   in the service worker, deploy to GitHub Pages, install-test on your phone.

**Backlog (deferred):** ninja bears, crystal, imperial bot, rock/mountain chain.

---

## Starter scoring / tuning table

These are proposed starting values for tuning — NOT Triple Town's real numbers
(never published). Adjust freely.

| Tile            | Placement pts (proposed) |
|-----------------|--------------------------|
| Grass           | 5                        |
| Bush            | 20                       |
| Tree            | 50                       |
| Hut             | 100                      |
| House           | 300                      |
| Mansion         | 800                      |
| Castle          | 2,000                    |
| Floating Castle | 5,000                    |
| Triple Castle   | 12,000                   |

Also to tune during the build: coins earned per match, spawn weights (grass
common, higher tiers rare), and bear spawn frequency (start low per-turn, scale
up over the game).
