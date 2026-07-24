// game.js — turn orchestration: spawning, placing, cascades, bears, game over.

import { state, resetGame, isStorehouse } from './state.js';
import {
  SPAWN_WEIGHTS, MAX_GRASS_STREAK, CRYSTAL_CHANCE, POINTS,
  BEAR_BASE_CHANCE, BEAR_CHANCE_PER_TURN, BEAR_MAX_CHANCE,
  PREFILL_MIN, PREFILL_MAX, PREFILL_WEIGHTS, PREFILL_BEARS, PREFILL_TOMB_CHANCE,
  LEVEL_TURN_BUDGET, goalForLevel,
} from './config.js';
import { recordScore } from './persistence.js';
import { resolveMerges, crystalResolve } from './match.js';
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
  } else if (Math.random() < CRYSTAL_CHANCE) {
    state.current = 'crystal';   // rare wildcard
  } else if (state.grassStreak >= MAX_GRASS_STREAK) {
    // Too many grass in a row — hand out a non-grass piece this time.
    const { grass, ...rest } = SPAWN_WEIGHTS;
    state.current = weightedPick(rest);
  } else {
    state.current = weightedPick(SPAWN_WEIGHTS);
  }
  state.grassStreak = state.current === 'grass' ? state.grassStreak + 1 : 0;
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

function endGame(reason) {
  state.over = true;
  state.overReason = reason;      // 'turns' or 'full'
  state.activePos = null;
  // Record the run in this board size's leaderboard and refresh the shown best.
  state.best = recordScore(state.size, state.score);
}

function checkGameOver() {
  if (state.over) return;
  if (state.turnsLeft <= 0) { endGame('turns'); return; } // ran out of turns
  if (boardFull()) endGame('full');                       // no room left
}

// Reaching the level's goal clears it: the goal rises and the turn budget
// refills. A `while` handles a single huge merge that blows past several goals.
function maybeLevelUp() {
  while (state.score >= state.goal) {
    state.level++;
    state.goal = goalForLevel(state.level);
    state.turnsLeft = LEVEL_TURN_BUDGET;
    state.levelUpBanner = { level: state.level, goal: state.goal };
  }
}

// Place the held piece at (r,c). Returns true if the move was legal.
export function placePiece(r, c) {
  if (state.over) return false;
  if (state.current === null) return false;
  if (isStorehouse(r, c)) return false;   // the storehouse is swap-only
  if (state.board[r][c] !== null) return false; // must place on an empty tile

  const piece = state.current;
  const scoreBefore = state.score;
  state.board[r][c] = piece;
  state.lastCreated = { r, c };
  state.mergeSlides = [];   // collected during this turn's merges, for the animation

  // Base points for the tile you just set down (grass, bought tiles, etc.).
  state.score += POINTS[piece] || 0;

  if (piece === 'crystal') {
    crystalResolve(r, c);       // wildcard: completes the best merge, or -> rock
  } else if (piece !== 'bear') {
    resolveMerges(r, c);        // bears never merge; everything else can cascade
  }

  // Points this placement earned (base + any merge), to float up from the tile.
  state.floatPoints = { r, c, points: state.score - scoreBefore };

  // This placement spent a turn; reaching the goal clears the level (refilling
  // turns) before we test for running out.
  state.turnsLeft--;
  maybeLevelUp();

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
  // Scale the scatter to the board area (6x6 is the baseline).
  const scale = (state.size * state.size) / 36;
  const plants = Math.min(
    randInt(Math.round(PREFILL_MIN * scale), Math.round(PREFILL_MAX * scale)),
    cells.length);
  for (let k = 0; k < plants && idx < cells.length; k++, idx++) {
    const [r, c] = cells[idx];
    state.board[r][c] = weightedPick(PREFILL_WEIGHTS);
  }
  const bears = Math.max(1, Math.round(PREFILL_BEARS * scale));
  for (let b = 0; b < bears && idx < cells.length; b++, idx++) {
    const [r, c] = cells[idx];
    state.board[r][c] = 'bear';
  }
  if (Math.random() < PREFILL_TOMB_CHANCE && idx < cells.length) {
    const [r, c] = cells[idx];
    state.board[r][c] = 'tombstone';
    idx++;
  }
}

// Start a brand-new game. `size` (6 or 8) sets the board dimensions; omitting it
// keeps the current/pending size.
export function newGame(size) {
  if (size) state.size = size;
  state.pendingSize = state.size;
  resetGame();      // rebuilds an empty board at state.size
  state.level = 1;
  state.goal = goalForLevel(1);
  state.turnsLeft = LEVEL_TURN_BUDGET;
  prefill();
  spawnNext();
  state.activePos = pickActivePos(null, null);
  save();
}
