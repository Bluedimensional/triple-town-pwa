// state.js — the single mutable game state object plus helpers to reset it.

import { BOARD_SIZE, MAX_STORAGE } from './config.js';

export const state = {
  cols: BOARD_SIZE,        // current board width (columns)
  rows: BOARD_SIZE,        // current board height (rows) — may differ (e.g. 7x8)
  pendingCols: BOARD_SIZE, // dimensions a new game will use (the player's choice)
  pendingRows: BOARD_SIZE,
  board: [],        // board[r][c] = tile type string, or null when empty
  current: null,    // the piece waiting to be placed (shown pulsing on the board)
  activePos: null,  // {r,c} where the current piece is previewed, or null
  reserves: new Array(MAX_STORAGE).fill(null), // storage slots above the board (unlock by level)
  score: 0,
  best: 0,
  coins: 0,
  turns: 0,         // pieces placed so far (drives bear ramp)
  crystalMult: 1,   // this game's crystal-density multiplier (1x / 2x / 3x)
  pendingCrystalMult: 1, // the multiplier a new game will use (player's choice)
  timeMode: 0,      // this game's timed mode: 0 = endless, else minutes (2 / 5)
  pendingTimeMode: 0, // the timed mode a new game will use (player's choice)
  timeLeftMs: null, // ms left in a timed game; null in endless (no clock)
  level: 1,         // current level — a score milestone, for score-keeping only
  goal: 0,          // score needed to reach the next level
  levelFlash: false, // one-shot: briefly highlight the goal bar when the level ticks up
  levelCelebrate: null, // one-shot {level}: fire the full-screen level-up celebration
  undos: 0,         // undos available (earned one per level completed)
  undoStack: [],    // snapshots of state before recent placements, for undo
  bombs: 0,         // regular bombs available (earned on big merges) — hit rock/bear
  graveBombs: 0,    // grave bombs (rarer) — hit a tombstone/grave only
  zaps: 0,          // zaps (rarest) — delete ANY tile; charged by spawns, not merges
  zapCharge: 0,     // progress toward the next zap (counts ZAP_TRIGGER spawns)
  zapGoal: 0,       // randomized number of triggers needed for the next zap
  zapGrant: false,  // one-shot: a zap was just granted — fire the surprise explosion
  armed: null,      // transient: which special is aimed — null | 'bomb' | 'grave' | 'zap'
  bombBlast: null,  // one-shot {r,c}: a tile was just bombed/zapped, for the blast anim
  crystalChoice: null, // transient {r,c,options,scoreBefore}: a placed crystal could
                       // complete >1 different merge — waiting for the player to pick
  grassStreak: 0,   // consecutive grass pieces handed out (caps long streaks)
  storeBought: {},  // tile type -> times purchased (drives rising prices)
  over: false,
  overlayDismissed: false, // true once the player taps outside the game-over card
  lastCreated: null, // {r,c} of the most recent merge result, for the pop animation
  bearMoves: [],     // this turn's bear moves [{r,c,fromR,fromC}], for the hop animation
  mergeSlides: [],   // tiles absorbed by a merge this turn, for the slide-in animation
  floatPoints: null, // {r,c,points} points earned by the last placement, floats up
};

// How many storage slots are unlocked at the current level: 2 at level 1, then
// one more each level (3 at L2, 4 at L3), capped at MAX_STORAGE.
export function unlockedStorage() {
  return Math.min(MAX_STORAGE, state.level + 1);
}

export function emptyBoard() {
  const b = [];
  for (let r = 0; r < state.rows; r++) {
    b.push(new Array(state.cols).fill(null));
  }
  return b;
}

// Reset everything except the persisted best score.
export function resetGame() {
  const best = state.best;
  state.board = emptyBoard();
  state.current = null;
  state.activePos = null;
  state.reserves = new Array(MAX_STORAGE).fill(null);
  state.score = 0;
  state.coins = 0;
  state.turns = 0;
  state.level = 1;
  state.goal = 0;
  state.timeMode = 0;
  state.timeLeftMs = null;
  state.levelFlash = false;
  state.levelCelebrate = null;
  state.undos = 0;
  state.undoStack = [];
  state.bombs = 0;
  state.graveBombs = 0;
  state.zaps = 0;
  state.zapCharge = 0;
  state.zapGoal = 0;
  state.zapGrant = false;
  state.armed = null;
  state.bombBlast = null;
  state.crystalChoice = null;
  state.grassStreak = 0;
  state.storeBought = {};
  state.over = false;
  state.overlayDismissed = false;
  state.lastCreated = null;
  state.bearMoves = [];
  state.mergeSlides = [];
  state.floatPoints = null;
  state.best = best;
}
