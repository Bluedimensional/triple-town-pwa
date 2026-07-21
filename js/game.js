// game.js — turn orchestration: spawning, placing, cascades, bears, game over.

import { state, resetGame } from './state.js';
import {
  SPAWN_WEIGHTS, POINTS,
  BEAR_BASE_CHANCE, BEAR_CHANCE_PER_TURN, BEAR_MAX_CHANCE,
} from './config.js';
import { resolveMerges } from './match.js';
import { moveBears } from './bears.js';
import { save } from './persistence.js';

function weightedPick(weights) {
  let total = 0;
  for (const k in weights) total += weights[k];
  let roll = Math.random() * total;
  for (const k in weights) {
    roll -= weights[k];
    if (roll <= 0) return k;
  }
  return Object.keys(weights)[0];
}

function bearChance() {
  return Math.min(BEAR_MAX_CHANCE, BEAR_BASE_CHANCE + state.turns * BEAR_CHANCE_PER_TURN);
}

// Decide the next piece and put it in hand.
// countTurn:false is used by the storehouse draw so a swap doesn't ramp bears.
export function spawnNext({ countTurn = true } = {}) {
  if (Math.random() < bearChance()) {
    state.current = 'bear';
  } else {
    state.current = weightedPick(SPAWN_WEIGHTS);
  }
  if (countTurn) state.turns++;
}

function boardFull() {
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      if (state.board[r][c] === null) return false;
    }
  }
  return true;
}

function checkGameOver() {
  if (boardFull()) {
    state.over = true;
    if (state.score > state.best) state.best = state.score;
  }
}

// Place the held piece at (r,c). Returns true if the move was legal.
export function placePiece(r, c) {
  if (state.over) return false;
  if (state.current === null) return false;
  if (state.board[r][c] !== null) return false; // must place on an empty tile

  const piece = state.current;
  state.board[r][c] = piece;
  state.lastCreated = { r, c };

  // Base points for the tile you just set down (grass, bought tiles, etc.).
  state.score += POINTS[piece] || 0;

  // Bears never merge; everything else can cascade.
  if (piece !== 'bear') resolveMerges(r, c);

  // Bears already on the board react to your move.
  moveBears();

  // Draw the next piece, then see if the board is now stuck.
  spawnNext();
  checkGameOver();

  save();
  return true;
}

// Start a brand-new game.
export function newGame() {
  resetGame();
  spawnNext();
  save();
}
