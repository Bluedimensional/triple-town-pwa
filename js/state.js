// state.js — the single mutable game state object plus helpers to reset it.

import { BOARD_SIZE, STOREHOUSE_R, STOREHOUSE_C } from './config.js';

export const state = {
  size: BOARD_SIZE,        // current board is size x size
  pendingSize: BOARD_SIZE, // size a new game will use (the player's choice)
  board: [],        // board[r][c] = tile type string, or null when empty
  current: null,    // the piece waiting to be placed (shown pulsing on the board)
  activePos: null,  // {r,c} where the current piece is previewed, or null
  reserve: null,    // the storehouse slot (one piece held aside)
  score: 0,
  best: 0,
  coins: 0,
  turns: 0,         // pieces placed so far (drives bear ramp)
  grassStreak: 0,   // consecutive grass pieces handed out (caps long streaks)
  storeBought: {},  // tile type -> times purchased (drives rising prices)
  over: false,
  lastCreated: null, // {r,c} of the most recent merge result, for the pop animation
  bearMoves: [],     // this turn's bear moves [{r,c,fromR,fromC}], for the hop animation
  mergeSlides: [],   // tiles absorbed by a merge this turn, for the slide-in animation
};

// The storehouse occupies board cell (0,0); it is swap-only and never a real
// board tile (board[0][0] stays null; its contents live in state.reserve).
export function isStorehouse(r, c) {
  return r === STOREHOUSE_R && c === STOREHOUSE_C;
}

export function emptyBoard() {
  const b = [];
  for (let r = 0; r < state.size; r++) {
    b.push(new Array(state.size).fill(null));
  }
  return b;
}

// Reset everything except the persisted best score.
export function resetGame() {
  const best = state.best;
  state.board = emptyBoard();
  state.current = null;
  state.activePos = null;
  state.reserve = null;
  state.score = 0;
  state.coins = 0;
  state.turns = 0;
  state.grassStreak = 0;
  state.storeBought = {};
  state.over = false;
  state.lastCreated = null;
  state.bearMoves = [];
  state.mergeSlides = [];
  state.best = best;
}
