// config.js — tunable constants, chains, scoring, and the swappable asset map.
// Everything here is data-only so game logic never hard-codes a tile type.

// Shown above the board so it's always clear which build is being tested.
// Keep in sync with the service-worker CACHE name in sw.js.
export const VERSION = 'v83';

// The organic path edges are now baked into the path GEOMETRY (each outer edge
// bulges outward — see buildPathShape in render.js), so there is NO runtime SVG
// filter. This flag only toggles the old, deprecated turbulence filter, which
// caused the iOS lag; leave it OFF.
export const ORGANIC_PATH = false;

export const BOARD_SIZE = 6;            // default board dimension (6x6)
// Board options the player can choose for a new game (columns x rows). Boards
// may be non-square (e.g. 7x8 = 7 wide, 8 tall).
export const BOARDS = [
  { cols: 6, rows: 6, label: '6×6' },
  { cols: 7, rows: 7, label: '7×7' },
  { cols: 8, rows: 8, label: '8×8' },
  { cols: 7, rows: 8, label: '7×8' },
];
// Leaderboard / DOM key for a board of the given dimensions.
export const boardKey = (cols, rows) => cols + 'x' + rows;

// Build chain and tombstone chain, for reference / ordering.
export const BUILD_CHAIN = [
  'grass', 'bush', 'tree', 'hut', 'house', 'mansion',
  'castle', 'floatingCastle', 'tripleCastle', 'megaCastle', 'kingdom',
  'metropolis', 'skyUtopia',
];
export const TOMB_CHAIN = ['tombstone', 'church', 'cathedral', 'treasury', 'royalVault',
  'treasureHoard', 'goldPyramid', 'phoenix', 'divineSun'];

// Merge rules: type -> { next tier, how many connected are needed }.
// Every merge needs 3 connected (uniform — Floating Castle used to need 4, which
// surprised players and made a crystal placed between two of them fizzle to a rock
// instead of completing the trio; fixed to 3 in v56).
// Both chains run deep so long games never dead-end. Build tops out at Sky Utopia
// (...Kingdom -> Metropolis -> Sky Utopia); the bear/tomb line at Divine Sun
// (...Golden Pyramid -> Phoenix -> Divine Sun).
export const MERGE = {
  grass:          { next: 'bush',           need: 3 },
  bush:           { next: 'tree',           need: 3 },
  tree:           { next: 'hut',            need: 3 },
  hut:            { next: 'house',          need: 3 },
  house:          { next: 'mansion',        need: 3 },
  mansion:        { next: 'castle',         need: 3 },
  castle:         { next: 'floatingCastle', need: 3 },
  floatingCastle: { next: 'tripleCastle',   need: 3 },
  tripleCastle:   { next: 'megaCastle',     need: 3 },
  megaCastle:     { next: 'kingdom',        need: 3 },
  kingdom:        { next: 'metropolis',     need: 3 },
  metropolis:     { next: 'skyUtopia',      need: 3 },
  // Tombstone chain (the bear payoff).
  tombstone:      { next: 'church',         need: 3 },
  church:         { next: 'cathedral',      need: 3 },
  cathedral:      { next: 'treasury',       need: 3 },
  treasury:       { next: 'royalVault',     need: 3 },
  royalVault:     { next: 'treasureHoard',  need: 3 },
  treasureHoard:  { next: 'goldPyramid',    need: 3 },
  goldPyramid:    { next: 'phoenix',        need: 3 },
  phoenix:        { next: 'divineSun',      need: 3 },
};

// Placement / creation points (proposed starter table — tune by feel).
export const POINTS = {
  grass: 5, bush: 20, tree: 50, hut: 100, house: 300, mansion: 800,
  castle: 2000, floatingCastle: 5000, tripleCastle: 12000,
  megaCastle: 30000, kingdom: 75000, metropolis: 180000, skyUtopia: 400000,
  tombstone: 10, church: 500, cathedral: 2000, treasury: 8000, royalVault: 20000,
  treasureHoard: 50000, goldPyramid: 120000, phoenix: 280000, divineSun: 600000,
  bear: 0, crystal: 0, rock: 0,
};

// Coins awarded when a merge produces this tier (in-game pretend coins only).
export const COINS = {
  bush: 1, tree: 2, hut: 4, house: 8, mansion: 16,
  castle: 40, floatingCastle: 100, tripleCastle: 300,
  megaCastle: 600, kingdom: 1500, metropolis: 3500, skyUtopia: 8000,
  church: 10, cathedral: 40, treasury: 150, royalVault: 400,
  treasureHoard: 1000, goldPyramid: 2500, phoenix: 6000, divineSun: 15000,
};

// Store: which build-chain tiles are for sale, base price, and price growth
// per purchase of that tile (prices rise as the scope specifies).
export const STORE_ITEMS = ['grass', 'bush', 'tree', 'hut', 'crystal'];
export const STORE_BASE_PRICE = { grass: 3, bush: 12, tree: 40, hut: 120, crystal: 250 };
export const STORE_PRICE_GROWTH = 1.6;

// Spawn weights for ordinary pieces (bears handled separately, below).
export const SPAWN_WEIGHTS = { grass: 58, bush: 16, tree: 4 };
// Never hand out more than this many grass in a row (avoids long grass streaks).
export const MAX_GRASS_STREAK = 5;
// Crystal (wildcard) spawn rate. The original is ~2.5%, but that's hard to
// notice; raised so the 2x/3x density settings are clearly visible. Tunable.
export const CRYSTAL_CHANCE = 0.06;
// Per-game crystal density: the player picks one of these multipliers on the
// crystal spawn rate when starting a game (1x = normal, 2x, 3x).
export const CRYSTAL_MULTS = [1, 2, 3];

// Timed mode: score as much as you can before the clock runs out. 0 = Endless
// (the classic no-timer, board-fills-up game). Other values are minutes.
export const TIME_MODES = [0, 5];
export const timeModeLabel = (m) => (m ? m + ' min' : 'Endless');
// Leaderboard key suffix so each timed mode is ranked on its OWN board — Endless
// keeps the bare board key (e.g. "6x6") so existing high scores are preserved.
export const timeModeKey = (m) => (m ? '·' + m + 'm' : '');

// --- Bombs (the long-press special) ------------------------------------------
// You EARN a Bomb whenever a merge creates a high-tier piece — Castle-tier or
// above, i.e. worth at least BOMB_EARN_MIN_POINTS. Long-press the held piece (or
// tap the 💣 button) to ARM it, then tap a Rock or Bear to blow it up. It's a
// FREE action: it clears the tile but does NOT use up the piece in your hand.
export const BOMB_EARN_MIN_POINTS = 2000;   // Castle / Cathedral tier and up
export const BOMB_TARGETS = ['rock', 'bear'];
export const MAX_BOMBS = 9;                 // cap kept in hand (keeps it occasional)

// --- Roguelike Charms --------------------------------------------------------
// At the START of every run you pick 1 of 3 random charms that bends the rules
// for that whole game (Balatro-style). This block is DATA ONLY — id, icon, name,
// and blurb. Each charm's actual EFFECT lives in the logic (game.js / match.js /
// store.js), keyed by its id, so nothing hard-codes a charm's text. Applies to
// both endless and timed runs.
export const CHARMS = [
  { id: 'greenThumb',    icon: '🌱', name: 'Green Thumb',    desc: 'Grass skips to Tree. Make 4-merges to charge a Surge: bush jumps to a house too.' },
  { id: 'demolitionist', icon: '💣', name: 'Demolitionist',  desc: 'Start the run with 3 bombs.' },
  { id: 'peaceful',      icon: '☮️', name: 'Peaceful Valley', desc: 'Bears appear 40% less often.' },
  { id: 'prospector',    icon: '💎', name: 'Prospector',     desc: 'Crystals appear twice as often.' },
  { id: 'bargain',       icon: '🏷️', name: 'Bargain Hunter',  desc: 'Store prices are 30% cheaper, all game.' },
  { id: 'highRoller',    icon: '✨', name: 'High Roller',     desc: 'Every score is boosted 15%.' },
];
export const CHARM_BY_ID = Object.fromEntries(CHARMS.map((c) => [c.id, c]));
export const CHARM_CHOICES = 3;             // how many charms are offered each run
// Effect magnitudes, read by the logic that implements each charm.
export const CHARM_START_BOMBS = 3;         // demolitionist: bombs in hand at start
export const CHARM_BEAR_MULT = 0.6;         // peaceful: bear chance ×0.6 (40% fewer)
export const CHARM_CRYSTAL_MULT = 2;        // prospector: crystal chance ×2
export const CHARM_STORE_MULT = 0.7;        // bargain: store prices ×0.7 (30% off)
export const CHARM_SCORE_MULT = 1.15;       // highRoller: points ×1.15

// Verdant Surge — the Green Thumb charm's power-up. Green Thumb always merges
// grass → tree. On TOP of that, making 4+ (super) merges charges a meter; once
// full, the Surge switches ON for a few placements, during which BUSH also jumps
// straight to a random house (hut / house / mansion). Then it switches off and
// the meter recharges. Only active while the Green Thumb charm is chosen.
export const SURGE_GOAL = 3;                 // super merges needed to trigger a surge
export const SURGE_TURNS = 10;               // placements the surge stays ON
export const SURGE_BUSH_TARGETS = ['hut', 'house', 'mansion']; // bush → random one of these

// --- Combo multiplier --------------------------------------------------------
// Merge on CONSECUTIVE placements to build a combo chain: every placement that
// triggers a merge extends the chain; a placement that merges nothing (a lone
// tile, or a bear) breaks it back to zero. The chain length sets a score
// multiplier applied to that turn's merge points (Boom Town-style) — so a run of
// quick merges is worth progressively more. Indexed by the CURRENT chain length
// (how many consecutive merges came before this one), capped at the last entry.
//   chain 0 → 1× (first merge, no bonus) · 1 → 1.25× · 2 → 1.5× · 3 → 2× · 4 → 2.5× · 5+ → 3×
export const COMBO_MULTS = [1, 1.25, 1.5, 2, 2.5, 3];
export function comboMultiplier(chain) {
  return COMBO_MULTS[Math.min(Math.max(0, chain), COMBO_MULTS.length - 1)];
}

// Bear spawn chance ramps up over the game.
export const BEAR_BASE_CHANCE = 0.06;
export const BEAR_CHANCE_PER_TURN = 0.0006;
export const BEAR_MAX_CHANCE = 0.18;

// A new game starts partially filled (like the real game), different each time.
export const PREFILL_MIN = 6;                        // fewest scattered plants
export const PREFILL_MAX = 11;                       // most scattered plants
export const PREFILL_WEIGHTS = { grass: 52, bush: 26, tree: 10 };
export const PREFILL_BEARS = 1;                      // bears to scatter in
export const PREFILL_TOMB_CHANCE = 0.5;              // chance of a lone tombstone

// Timed games (Boom Town-style) skip the slow early grass-building: the board
// STARTS scattered with higher-tier pieces so you can build castles fast in the
// limited time. Denser + weighted toward mid tiers (huts/houses/trees).
export const TIMED_PREFILL_WEIGHTS = { bush: 14, tree: 26, hut: 26, house: 18, mansion: 8, grass: 8 };
export const TIMED_PREFILL_MIN = 12;                 // fewest scattered pieces (timed)
export const TIMED_PREFILL_MAX = 18;                 // most scattered pieces (timed)

// --- Levels (score milestones) -----------------------------------------------
// Play is perpetual — the game only ends when the board fills (classic Triple
// Town), never on a turn cap. Levels are score milestones you pass while playing:
// reaching one just ticks the top bar up and shows how many more points the next
// level needs. A run is scored by points AND the level reached. Tunable by feel.
export const LEVEL_GOAL_BASE = 20000;    // level 2 threshold (level 1 -> 2)
// Cumulative score threshold to reach a given level (1-based): L2=20k, L3=45k,
// L4=80k, L5=125k, ... Each level asks for a bit more than the last.
export function goalForLevel(level) {
  const raw = LEVEL_GOAL_BASE * level + LEVEL_GOAL_BASE * (level - 1) * (level - 1) * 0.25;
  return Math.round(raw / 5000) * 5000;   // keep goals as clean round numbers
}

// Storage: reserve slots in a row above the board (swap-only, never match).
// You START with 2 slots; a 3rd unlocks at level 2 and a 4th at level 3.
export const MAX_STORAGE = 4;

// Swappable asset map: tile type -> glyph. Swap these for <img> paths later
// (see render.js) without touching any game logic. Grass is a leafy tuft,
// bush a round shrub, tree taller — a readable size progression.
export const ASSETS = {
  grass: '🌿', bush: '🌳', tree: '🌲', hut: '🛖', house: '🏠',
  mansion: '🏘️', castle: '🏰', floatingCastle: '🏯', tripleCastle: '💎',
  megaCastle: '🏰', kingdom: '👑', metropolis: '🏙️', skyUtopia: '🌈',
  bear: '🐻', tombstone: '🪦', church: '⛪', cathedral: '🕌', treasury: '💰',
  royalVault: '👑', treasureHoard: '💰', goldPyramid: '🔺', phoenix: '🔥', divineSun: '☀️',
  crystal: '🔷', rock: '🪨',
};

// Human-readable names for the UI.
export const NAMES = {
  grass: 'Grass', bush: 'Bush', tree: 'Tree', hut: 'Hut', house: 'House',
  mansion: 'Mansion', castle: 'Castle', floatingCastle: 'Floating Castle',
  tripleCastle: 'Triple Castle', megaCastle: 'Mega Castle', kingdom: 'Kingdom',
  metropolis: 'Metropolis', skyUtopia: 'Sky Utopia',
  bear: 'Bear', tombstone: 'Tombstone',
  church: 'Church', cathedral: 'Cathedral', treasury: 'Treasury', royalVault: 'Royal Vault',
  treasureHoard: 'Treasure Hoard', goldPyramid: 'Golden Pyramid',
  phoenix: 'Phoenix', divineSun: 'Divine Sun',
  crystal: 'Crystal', rock: 'Rock',
};
// "Super" variants (matched 4+) get their own tooltip names.
for (const t of ['bush', 'tree', 'hut', 'house', 'mansion', 'castle',
  'floatingCastle', 'tripleCastle', 'megaCastle', 'kingdom', 'metropolis', 'skyUtopia',
  'church', 'cathedral', 'treasury', 'royalVault', 'treasureHoard', 'goldPyramid',
  'phoenix', 'divineSun']) {
  NAMES[t + 'Super'] = 'Super ' + NAMES[t];
}
