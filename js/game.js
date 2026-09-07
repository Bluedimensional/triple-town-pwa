// game.js — turn orchestration: spawning, placing, cascades, bears, game over.

import { state, resetGame } from './state.js';
import {
  SPAWN_WEIGHTS, MAX_GRASS_STREAK, CRYSTAL_CHANCE, POINTS,
  BEAR_BASE_CHANCE, BEAR_CHANCE_PER_TURN, BEAR_MAX_CHANCE,
  PREFILL_MIN, PREFILL_MAX, PREFILL_WEIGHTS, PREFILL_BEARS, PREFILL_TOMB_CHANCE,
  TIMED_PREFILL_WEIGHTS, TIMED_PREFILL_MIN, TIMED_PREFILL_MAX,
  goalForLevel, BOMB_TARGETS,
  CHARMS, CHARM_CHOICES, CHARM_PINNED, PHOENIX_CLEARS,
  comboMultiplier,
  SURGE_GOAL, SURGE_TURNS,
} from './config.js';
import { recordScore, bestFor } from './persistence.js';
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
  // Snapshot the final board (a plain grid copy) + play duration, then record the
  // run in this board+mode leaderboard and refresh the shown best. Captured now,
  // before the game-over overlay shows, so the snapshot is just the board.
  const boardCopy = state.board.map((row) => row.slice());
  const dur = Math.round((state.elapsedMs || 0) / 1000);
  state.best = recordScore(state.cols, state.rows, state.score, state.level,
    state.timeMode, boardCopy, dur);
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
  if (!boardFull()) return;
  // Phoenix Heart: the first time the board fills, burn away every bear, grave and
  // rock instead of ending the run. Once only — after that a full board is final.
  if (state.charm === 'phoenix' && !state.charmUsed) {
    state.charmUsed = true;
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        if (PHOENIX_CLEARS.includes(state.board[r][c])) state.board[r][c] = null;
      }
    }
    state.phoenixFlash = true;             // one-shot: renderer plays the rebirth
    if (!boardFull()) {
      // activePos was computed while the board was still full, so it's null —
      // put the held piece back on a freed tile so play can continue.
      if (!state.activePos) state.activePos = pickActivePos(null, null);
      return;                              // rescued — keep playing
    }
  }
  endGame();
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
    crystalMult: state.crystalMult, bombs: state.bombs,
    charm: state.charm, combo: state.combo,
    surgeCharge: state.surgeCharge, surgeActive: state.surgeActive, surgeTurns: state.surgeTurns,
    charmUsed: state.charmUsed,
    over: state.over,
  });
}

// --- Bombs (the long-press / button special) ---------------------------------
// Earned on big merges; destroys a Rock or Bear. state.armed is 'bomb' when aimed.
function canHit(t) {
  if (t === null) return false;
  return BOMB_TARGETS.includes(t);
}

// Arm the bomb (needs at least one banked). Returns whether it armed.
export function armBomb(kind = 'bomb') {
  if (state.over || state.bombs <= 0) return false;
  state.armed = kind;
  return true;
}
export function disarmBomb() {
  if (!state.armed) return false;
  state.armed = null;
  return true;
}
// Tap the bomb button: arm, or disarm if already aimed.
export function toggleBomb(kind = 'bomb') {
  if (state.armed === kind) { state.armed = null; return false; }
  return armBomb(kind);
}

// Detonate the armed bomb at (r,c) — destroys a Rock or Bear. A FREE action: clears
// the tile but does NOT consume the held piece, draw a new one, ramp bears, or end
// the turn. Tapping a non-target just cancels. Returns true if a tile was destroyed.
export function bombAt(r, c) {
  if (!state.armed) return false;
  const t = state.board[r][c];
  if (state.bombs > 0 && canHit(t)) {
    state.board[r][c] = null;
    state.bombs--;
    state.armed = null;
    state.bombBlast = { r, c };
    save();
    return true;
  }
  state.armed = null;   // tapped something that can't be hit — cancel
  return false;
}

// Take back the last placement (spends one earned undo — the Do-Over charm makes
// them free and unlimited, so only having a move to take back matters).
export function unlimitedUndo() { return state.charm === 'doOver'; }
export function undoMove() {
  if (state.undoStack.length === 0) return false;
  if (!unlimitedUndo() && state.undos <= 0) return false;
  const snap = JSON.parse(state.undoStack.pop());
  Object.assign(state, snap);
  if (!unlimitedUndo()) state.undos--;
  // Clear one-shot animation markers so nothing replays on the restored board.
  state.lastCreated = null; state.bearMoves = []; state.mergeSlides = [];
  state.floatPoints = null; state.levelFlash = false; state.levelCelebrate = null;
  state.armed = null; state.bombBlast = null;
  save();
  return true;
}

// Place the held piece at (r,c). Returns true if the move was legal.
export function placePiece(r, c) {
  if (state.over) return false;
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
  state.mergeEarned = 0;    // reset; resolveMerges sets it if this placement merges

  // Base points for the tile you just set down (grass, bought tiles, etc.).
  state.score += POINTS[piece] || 0;

  // Echo charm: the piece also copies itself onto a random empty tile beside it,
  // so a single placement can complete a match on its own. Buildable tiles only —
  // duplicating a bear would be a punishment, not a perk.
  if (state.charm === 'echo' && piece !== 'bear' && piece !== 'crystal') {
    const spots = [];
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols &&
          state.board[nr][nc] === null) spots.push([nr, nc]);
    }
    if (spots.length) {
      const [er, ec] = spots[Math.floor(Math.random() * spots.length)];
      state.board[er][ec] = piece;
      state.score += POINTS[piece] || 0;
    }
  }

  if (piece === 'crystal') {
    // A crystal always becomes whichever type completes the HIGHEST-value merge
    // (or a rock if it can't complete anything). No chooser — even when several
    // different merges are possible, the best one is taken automatically.
    crystalResolve(r, c);
  } else if (piece !== 'bear') {
    resolveMerges(r, c);            // bears never merge; everything else can cascade
  }

  finishTurn(r, c, scoreBefore);
  return true;
}

// Everything after a placement resolves: float the points, tick the level, move
// bears, draw the next piece, check for game over, save.
function finishTurn(r, c, scoreBefore) {
  // Combo: a placement that MERGED extends the chain and earns a rising bonus on
  // its merge points (the multiplier for THIS merge is set by the chain so far);
  // a placement that merged nothing breaks the chain back to zero.
  const mergePts = state.mergeEarned || 0;
  if (mergePts > 0) {
    const bonus = Math.round(mergePts * (comboMultiplier(state.combo) - 1));
    if (bonus > 0) state.score += bonus;
    state.combo += 1;
  } else {
    state.combo = 0;
  }
  // Verdant Surge (Green Thumb power-up): a 4+ (super) merge banks charge; filling
  // the meter turns the surge ON for a few placements. While ON, bush jumps to a
  // random house (see mergeNext). Only runs while the Green Thumb charm is active.
  if (state.charm === 'greenThumb') advanceSurge();

  state.floatPoints = { r, c, points: state.score - scoreBefore };
  maybeLevelUp();
  moveBears();
  spawnNext();
  state.activePos = pickActivePos(r, c);
  checkGameOver();
  save();
}

// Tick the Verdant Surge each placement: count down an active surge, or (when off)
// bank charge from this turn's super merge and switch it on once the meter fills.
function advanceSurge() {
  if (state.surgeActive) {
    state.surgeTurns--;
    if (state.surgeTurns <= 0) { state.surgeActive = false; state.surgeTurns = 0; }
    return;
  }
  state.surgeCharge += state.mergeSlides.length; // every merge charges it; bigger merges/cascades absorb more tiles → fill faster
  if (state.surgeCharge >= SURGE_GOAL) {
    state.surgeCharge = 0;
    state.surgeActive = true;
    state.surgeTurns = SURGE_TURNS;
  }
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
  // Scale the scatter to the board area (6x6 = 36 is the baseline). Timed games
  // start with MORE and HIGHER-tier pieces (Boom Town style) for fast scoring.
  const scale = (state.cols * state.rows) / 36;
  const timed = state.timeMode > 0;
  const weights = timed ? TIMED_PREFILL_WEIGHTS : PREFILL_WEIGHTS;
  const pmin = timed ? TIMED_PREFILL_MIN : PREFILL_MIN;
  const pmax = timed ? TIMED_PREFILL_MAX : PREFILL_MAX;
  const plants = Math.min(
    randInt(Math.round(pmin * scale), Math.round(pmax * scale)),
    cells.length);
  for (let k = 0; k < plants && idx < cells.length; k++, idx++) {
    const [r, c] = cells[idx];
    state.board[r][c] = weightedPick(weights);
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

// The charm ids to offer at the start of a run: Green Thumb is ALWAYS one of them
// (it's the charm with the Verdant Surge power-up), plus random distinct others.
// `avoid` holds ids to skip when possible, so a re-shuffle always shows new ones.
function pickCharmChoices(avoid = []) {
  const all = CHARMS.map((c) => c.id).filter((id) => id !== CHARM_PINNED);
  let rest = all.filter((id) => !avoid.includes(id));
  if (rest.length < CHARM_CHOICES - 1) rest = all;   // too few left — allow repeats
  for (let i = rest.length - 1; i > 0; i--) {        // Fisher–Yates
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [CHARM_PINNED, ...rest.slice(0, CHARM_CHOICES - 1)];
}

// Re-roll the offered charms while the chooser is up (the Shuffle button). Green
// Thumb stays pinned; the other slots become ones you weren't just shown.
export function reshuffleCharms() {
  if (!state.charmChoices.length) return false;
  state.charmChoices = pickCharmChoices(state.charmChoices);
  save();
  return true;
}

// Start a brand-new game. `cols`/`rows` set the board dimensions; omitting them
// keeps the current/pending size. The board is NOT dealt yet: first the player
// picks 1 of 3 charms (chooseCharm below), because a charm can shape the opening
// deal. Until then charmChoices is non-empty and the chooser is up.
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
  state.level = 1;
  state.goal = goalForLevel(1);
  state.charm = null;
  if (state.charmsOn) {
    state.charmChoices = pickCharmChoices();      // the chooser is now up
  } else {
    // Charms switched off — skip the chooser and deal the board straight away.
    state.charmChoices = [];
    prefill();
    spawnNext();
    state.activePos = pickActivePos(null, null);
  }
  save();
}

// Apply the chosen charm, then deal the opening board. Called when the player
// taps one of the three offered charms. Returns true if it took effect.
export function chooseCharm(id) {
  if (!state.charmChoices.includes(id)) return false;
  state.charm = id;
  state.charmChoices = [];                         // close the chooser
  prefill();
  spawnNext();
  state.activePos = pickActivePos(null, null);
  save();
  return true;
}
