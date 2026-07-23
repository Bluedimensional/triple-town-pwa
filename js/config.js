// config.js — tunable constants, chains, scoring, and the swappable asset map.
// Everything here is data-only so game logic never hard-codes a tile type.

// Shown above the board so it's always clear which build is being tested.
// Keep in sync with the service-worker CACHE name in sw.js.
export const VERSION = 'v31';

// Organic path uses an SVG turbulence/displacement filter. It's cheap on desktop
// GPUs but slow to rasterize on iOS. Off = plain (fast) path, for perf testing.
export const ORGANIC_PATH = false;

export const BOARD_SIZE = 6;            // default board is 6x6
export const BOARD_SIZES = [6, 7, 8];   // sizes the player can choose for a new game

// Build chain and tombstone chain, for reference / ordering.
export const BUILD_CHAIN = [
  'grass', 'bush', 'tree', 'hut', 'house', 'mansion',
  'castle', 'floatingCastle', 'tripleCastle',
];
export const TOMB_CHAIN = ['tombstone', 'church', 'cathedral', 'treasury'];

// Merge rules: type -> { next tier, how many connected are needed }.
// Standard merges need 3; Floating Castle -> Triple Castle intentionally needs 4.
export const MERGE = {
  grass:          { next: 'bush',           need: 3 },
  bush:           { next: 'tree',           need: 3 },
  tree:           { next: 'hut',            need: 3 },
  hut:            { next: 'house',          need: 3 },
  house:          { next: 'mansion',        need: 3 },
  mansion:        { next: 'castle',         need: 3 },
  castle:         { next: 'floatingCastle', need: 3 },
  floatingCastle: { next: 'tripleCastle',   need: 4 },
  // Tombstone chain (the bear payoff).
  tombstone:      { next: 'church',         need: 3 },
  church:         { next: 'cathedral',      need: 3 },
  cathedral:      { next: 'treasury',       need: 3 },
};

// Placement / creation points (proposed starter table — tune by feel).
export const POINTS = {
  grass: 5, bush: 20, tree: 50, hut: 100, house: 300, mansion: 800,
  castle: 2000, floatingCastle: 5000, tripleCastle: 12000,
  tombstone: 10, church: 500, cathedral: 2000, treasury: 8000,
  bear: 0, crystal: 0, rock: 0,
};

// Coins awarded when a merge produces this tier (in-game pretend coins only).
export const COINS = {
  bush: 1, tree: 2, hut: 4, house: 8, mansion: 16,
  castle: 40, floatingCastle: 100, tripleCastle: 300,
  church: 10, cathedral: 40, treasury: 150,
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
// Crystal (wildcard) is a rare random spawn (~2.5% in the original). Tunable.
export const CRYSTAL_CHANCE = 0.025;

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

// The storehouse is the top-left board square (0,0): swap-only, never matches.
export const STOREHOUSE_R = 0;
export const STOREHOUSE_C = 0;

// Swappable asset map: tile type -> glyph. Swap these for <img> paths later
// (see render.js) without touching any game logic. Grass is a leafy tuft,
// bush a round shrub, tree taller — a readable size progression.
export const ASSETS = {
  grass: '🌿', bush: '🌳', tree: '🌲', hut: '🛖', house: '🏠',
  mansion: '🏘️', castle: '🏰', floatingCastle: '🏯', tripleCastle: '💎',
  bear: '🐻', tombstone: '🪦', church: '⛪', cathedral: '🕌', treasury: '💰',
  crystal: '🔷', rock: '🪨',
};

// Human-readable names for the UI.
export const NAMES = {
  grass: 'Grass', bush: 'Bush', tree: 'Tree', hut: 'Hut', house: 'House',
  mansion: 'Mansion', castle: 'Castle', floatingCastle: 'Floating Castle',
  tripleCastle: 'Triple Castle', bear: 'Bear', tombstone: 'Tombstone',
  church: 'Church', cathedral: 'Cathedral', treasury: 'Treasury',
  crystal: 'Crystal', rock: 'Rock',
};
// "Super" variants (matched 4+) get their own tooltip names.
for (const t of ['bush', 'tree', 'hut', 'house', 'mansion', 'castle',
  'floatingCastle', 'tripleCastle', 'church', 'cathedral', 'treasury']) {
  NAMES[t + 'Super'] = 'Super ' + NAMES[t];
}
