// game.js — turn orchestration: spawning, placing, cascades, bears, game over.

import { state, resetGame, isStorehouse } from './state.js';
import {
  SPAWN_WEIGHTS, POINTS,
  BEAR_BASE_CHANCE, BEAR_CHANCE_PER_TURN, BEAR_MAX_CHANCE,
  PREFILL_MIN, PREFILL_MAX, PREFILL_WEIGHTS, PREFILL_BEARS, PREFILL_TOMB_CHANCE,
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

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// All empty, non-storehouse cells as [r,c] pairs.
function emptyCells() {
  const out = [];
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      if (!isStorehouse(r, c) && state.board[r][c] === null) out.push([r, c]);
    }
  }
  return out;
}

function bearChance() {
  return Math.min(BEAR_MAX_CHANCE, BEAR_BASE_CHANCE + state.turns * BEAR_CHANCE_PER_TURN);
}

// Decide the next piece and place it in hand.
// countTurn:false is used by the storehouse draw so a swap doesn't ramp bears.
export function spawnNext({ countTurn = true } = {}) {
  if (Math.random() < bearChance()) {
    state.current = 'bear';
  } else {
    state.current = weightedPick(SPAWN_WEIGHTS);
  }
  if (countTurn) state.turns++;
}

// Choose where the current piece is previewed: an empty cell next to the last
// placement if possible (that's where a fresh piece "appears"), else any empty
// cell. Returns null when the board is full.
function pickActivePos(lastR, lastC) {
  const empties = emptyCells();
  if (empties.length === 0) return null;
  if (lastR != null) {
    const adj = empties.filter(([r, c]) =>
      Math.abs(r - lastR) + Math.abs(c - lastC) === 1);
    if (adj.length > 0) return { r: adj[0][0], c: adj[0][1] };
  }
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  return { r, c };
}

function boardFull() {
  // The storehouse never counts as fillable space.
  return emptyCells().length === 0;
}

function checkGameOver() {
  if (boardFull()) {
    state.over = true;
    state.activePos = null;
    if (state.score > state.best) state.best = state.score;
  }
}

// Place the held piece at (r,c). Returns true if the move was legal.
export function placePiece(r, c) {
  if (state.over) return false;
  if (state.current === null) return false;
  if (isStorehouse(r, c)) return false;   // the storehouse is swap-only
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

  // Draw the next piece and decide where it appears.
  spawnNext();
  state.activePos = pickActivePos(r, c);
  checkGameOver();

  save();
  return true;
}

// Scatter a random starting layout so a new game never opens blank.
function prefill() {
  const cells = emptyCells();
  // Fisher–Yates shuffle so we take distinct random cells.
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  let idx = 0;
  const plants = Math.min(randInt(PREFILL_MIN, PREFILL_MAX), cells.length);
  for (let k = 0; k < plants && idx < cells.length; k++, idx++) {
    const [r, c] = cells[idx];
    state.board[r][c] = weightedPick(PREFILL_WEIGHTS);
  }
  for (let b = 0; b < PREFILL_BEARS && idx < cells.length; b++, idx++) {
    const [r, c] = cells[idx];
    state.board[r][c] = 'bear';
  }
  if (Math.random() < PREFILL_TOMB_CHANCE && idx < cells.length) {
    const [r, c] = cells[idx];
    state.board[r][c] = 'tombstone';
    idx++;
  }
}

// Start a brand-new game.
export function newGame() {
  resetGame();
  prefill();
  spawnNext();
  state.activePos = pickActivePos(null, null);
  save();
}
