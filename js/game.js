// game.js — turn orchestration: spawning, placing, cascades, bears, game over.

import { state, resetGame } from './state.js';
import {
  SPAWN_WEIGHTS, MAX_GRASS_STREAK, CRYSTAL_CHANCE, POINTS,
  BEAR_BASE_CHANCE, BEAR_CHANCE_PER_TURN, BEAR_MAX_CHANCE,
  PREFILL_MIN, PREFILL_MAX, PREFILL_WEIGHTS, PREFILL_BEARS, PREFILL_TOMB_CHANCE,
  goalForLevel, BOMB_TARGETS, GRAVE_TARGETS,
  ZAP_TRIGGER, ZAP_NEED_MIN, ZAP_NEED_MAX, MAX_ZAPS,
} from './config.js';
import { recordScore, bestFor } from './persistence.js';
import { resolveMerges, crystalResolve, crystalOptions } from './match.js';
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

// All empty cells as [r,c] pairs.
function emptyCells() {
  const out = [];
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (state.board[r][c] === null) out.push([r, c]);
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
  } else if (Math.random() < CRYSTAL_CHANCE * state.crystalMult) {
    state.current = 'crystal';   // rare wildcard (density scaled per game)
  } else if (state.grassStreak >= MAX_GRASS_STREAK) {
    // Too many grass in a row — hand out a non-grass piece this time.
    const { grass, ...rest } = SPAWN_WEIGHTS;
    state.current = weightedPick(rest);
  } else {
    state.current = weightedPick(SPAWN_WEIGHTS);
  }
  state.grassStreak = state.current === 'grass' ? state.grassStreak + 1 : 0;
  if (countTurn) state.turns++;
  chargeZap();
}

// A random number of ZAP_TRIGGER spawns needed for the next Zap.
function rollZapGoal() {
  return ZAP_NEED_MIN + Math.floor(Math.random() * (ZAP_NEED_MAX - ZAP_NEED_MIN + 1));
}

// Called after each spawn: if it was the trigger (a bear), charge the Zap meter,
// and once it fills, grant a Zap as a surprise (fires the explosion in render).
function chargeZap() {
  if (state.current !== ZAP_TRIGGER) return;
  if (state.zaps >= MAX_ZAPS) return;   // at the cap — freeze the meter, don't overfill
  if (!state.zapGoal) state.zapGoal = rollZapGoal();
  state.zapCharge++;
  if (state.zapCharge >= state.zapGoal) {
    state.zaps++;
    state.zapCharge = 0;
    state.zapGoal = rollZapGoal();
    state.zapGrant = true;      // one-shot: render fires the ⚡ surprise explosion
  }
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

function endGame() {
  state.over = true;
  state.activePos = null;
  // Record the run (score + level reached) in this board+mode leaderboard and
  // refresh the shown best.
  state.best = recordScore(state.cols, state.rows, state.score, state.level, state.timeMode);
}

// Called by the clock when a timed game's time runs out. Ends the game (records
// the score), just like the board filling up. Returns true if it ended the game.
export function expireTimer() {
  if (state.over || state.timeMode === 0) return false;
  state.timeLeftMs = 0;
  endGame();
  save();
  return true;
}

// The game is perpetual — it only ends when the board is genuinely full (no
// empty tile left to place on), as in classic Triple Town. There is no turn cap.
function checkGameOver() {
  if (state.over) return;
  if (boardFull()) endGame();
}

// Levels are score milestones you pass through while you keep playing — reaching
// one does NOT interrupt play; the top bar just ticks up to the next level and
// shows how many more points it needs. A `while` handles a single huge merge
// that crosses several thresholds at once.
function maybeLevelUp() {
  let gained = 0;
  while (state.score >= state.goal) {
    state.level++;
    state.goal = goalForLevel(state.level);
    gained++;
  }
  if (gained) {
    state.levelFlash = true;                 // brief top-bar highlight
    state.undos += gained;                   // earn an undo per level completed
    state.levelCelebrate = { level: state.level }; // fire the big celebration
  }
}

// A snapshot of everything a placement changes, so a move can be undone.
const MAX_UNDO = 10;
function snapshot() {
  return JSON.stringify({
    board: state.board, current: state.current, activePos: state.activePos,
    reserves: state.reserves, score: state.score, coins: state.coins,
    turns: state.turns, level: state.level, goal: state.goal,
    grassStreak: state.grassStreak, storeBought: state.storeBought,
    crystalMult: state.crystalMult, bombs: state.bombs, graveBombs: state.graveBombs,
    zaps: state.zaps, zapCharge: state.zapCharge, zapGoal: state.zapGoal,
    over: state.over,
  });
}

// --- Bombs & Zap (the long-press / button specials) --------------------------
// Three kinds share this machinery:
//   'bomb'  — earned on big merges; destroys a Rock or Bear.
//   'grave' — rarer; destroys a Tombstone (a grave left by a trapped bear).
//   'zap'   — rarest; deletes ANYTHING on the board.
// state.armed holds which kind is currently aimed (null | 'bomb' | 'grave' | 'zap').
function countOf(kind) {
  return kind === 'grave' ? state.graveBombs : kind === 'zap' ? state.zaps : state.bombs;
}
// Can the aimed kind destroy the tile `t`? Zap hits any occupied tile.
function canHit(kind, t) {
  if (t === null) return false;
  if (kind === 'zap') return true;
  return (kind === 'grave' ? GRAVE_TARGETS : BOMB_TARGETS).includes(t);
}

// Arm a bomb of the given kind (needs at least one banked). Returns whether it armed.
export function armBomb(kind = 'bomb') {
  if (state.over || countOf(kind) <= 0) return false;
  state.armed = kind;
  return true;
}
export function disarmBomb() {
  if (!state.armed) return false;
  state.armed = null;
  return true;
}
// Tap a bomb button: arm that kind, or disarm if it's already the aimed one.
export function toggleBomb(kind = 'bomb') {
  if (state.armed === kind) { state.armed = null; return false; }
  return armBomb(kind);
}

// Detonate the armed bomb at (r,c) — destroys a valid target for the aimed kind.
// A FREE action: clears the tile but does NOT consume the held piece, draw a new
// one, ramp bears, or end the turn. Tapping a non-target just cancels. Returns
// true if a tile was destroyed.
export function bombAt(r, c) {
  const kind = state.armed;
  if (!kind) return false;
  const t = state.board[r][c];
  if (countOf(kind) > 0 && canHit(kind, t)) {
    state.board[r][c] = null;
    if (kind === 'grave') state.graveBombs--;
    else if (kind === 'zap') state.zaps--;
    else state.bombs--;
    state.armed = null;
    state.bombBlast = { r, c };
    save();
    return true;
  }
  state.armed = null;   // tapped something that can't be hit — cancel
  return false;
}

// Take back the last placement (spends one earned undo).
export function undoMove() {
  if (state.undos <= 0 || state.undoStack.length === 0) return false;
  const snap = JSON.parse(state.undoStack.pop());
  Object.assign(state, snap);
  state.undos--;
  // Clear one-shot animation markers so nothing replays on the restored board.
  state.lastCreated = null; state.bearMoves = []; state.mergeSlides = [];
  state.floatPoints = null; state.levelFlash = false; state.levelCelebrate = null;
  state.armed = null; state.bombBlast = null; state.zapGrant = false;
  state.crystalChoice = null;
  save();
  return true;
}

// Place the held piece at (r,c). Returns true if the move was legal.
export function placePiece(r, c) {
  if (state.over || state.crystalChoice) return false;   // busy waiting on a choice
  if (state.current === null) return false;
  if (state.board[r][c] !== null) return false; // must place on an empty tile

  // Snapshot BEFORE mutating, so this move can be undone (bounded history).
  state.undoStack.push(snapshot());
  if (state.undoStack.length > MAX_UNDO) state.undoStack.shift();

  const piece = state.current;
  const scoreBefore = state.score;
  state.board[r][c] = piece;
  state.lastCreated = { r, c };
  state.mergeSlides = [];   // collected during this turn's merges, for the animation

  // Base points for the tile you just set down (grass, bought tiles, etc.).
  state.score += POINTS[piece] || 0;

  if (piece === 'crystal') {
    const opts = crystalOptions(r, c);
    // More than one DIFFERENT merge is possible → let the player choose which.
    // Pause the turn: the crystal sits on the board and the choice overlay shows;
    // chooseCrystal() finishes the turn. (No save here — a reload just re-hands
    // the crystal, avoiding a mid-choice soft-lock.)
    if (opts.length >= 2) {
      state.crystalChoice = { r, c, options: opts, scoreBefore };
      state.activePos = null;       // hide the held preview while choosing
      return true;
    }
    crystalResolve(r, c);           // 0 or 1 option: resolve automatically (rock if none)
  } else if (piece !== 'bear') {
    resolveMerges(r, c);            // bears never merge; everything else can cascade
  }

  finishTurn(r, c, scoreBefore);
  return true;
}

// Everything after a placement resolves: float the points, tick the level, move
// bears, draw the next piece, check for game over, save.
function finishTurn(r, c, scoreBefore) {
  state.floatPoints = { r, c, points: state.score - scoreBefore };
  maybeLevelUp();
  moveBears();
  spawnNext();
  state.activePos = pickActivePos(r, c);
  checkGameOver();
  save();
}

// Resolve a paused crystal choice: turn the crystal into the picked type, run the
// merge, then finish the turn as usual.
export function chooseCrystal(type) {
  const ch = state.crystalChoice;
  if (!ch) return false;
  const { r, c, scoreBefore } = ch;
  state.crystalChoice = null;
  state.board[r][c] = type;
  state.lastCreated = { r, c };
  resolveMerges(r, c);
  finishTurn(r, c, scoreBefore);
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
  // Scale the scatter to the board area (6x6 = 36 is the baseline).
  const scale = (state.cols * state.rows) / 36;
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

// Start a brand-new game. `cols`/`rows` set the board dimensions; omitting them
// keeps the current/pending size.
export function newGame(cols, rows) {
  if (cols) state.cols = cols;
  if (rows) state.rows = rows;
  state.pendingCols = state.cols;
  state.pendingRows = state.rows;
  resetGame();      // rebuilds an empty board at state.cols x state.rows
  state.crystalMult = state.pendingCrystalMult;   // lock in the chosen density
  state.timeMode = state.pendingTimeMode;         // lock in the chosen timed mode
  state.timeLeftMs = state.timeMode ? state.timeMode * 60000 : null;
  state.best = bestFor(state.cols, state.rows, state.timeMode);  // best for this board+mode
  state.zapGoal = rollZapGoal();                  // first zap comes after this many triggers
  state.level = 1;
  state.goal = goalForLevel(1);
  prefill();
  spawnNext();
  state.activePos = pickActivePos(null, null);
  save();
}
