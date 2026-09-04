// persistence.js — save/load to localStorage so progress survives refresh,
// backgrounding, and cache eviction (the scope's reason for not relying on the
// service worker cache for state).

import { state, emptyBoard } from './state.js';
import { BOARD_SIZE, MAX_STORAGE, boardKey, goalForLevel, timeModeKey } from './config.js';

const KEY = 'tripletown.save.v2';
const BEST_KEY = 'tripletown.best.v1';        // legacy single best (pre per-mode)
const SCORES_KEY = 'tripletown.scores.v1';    // per-board(+time-mode) leaderboard
const TOP_N = 10;                             // scores kept per board+mode

// Leaderboard key for a board of the given size and timed mode. Endless (mode 0)
// keeps the bare board key so pre-timed-mode scores stay put.
export function scoreKey(cols, rows, mode = 0) {
  return boardKey(cols, rows) + timeModeKey(mode);
}

// --- Per-board leaderboard ---------------------------------------------------
// Shape: { "6x6": [{s, l, d}], "7x8": [...] } — each list is the top 5 scores
// for that board, highest first, with the level reached and the date earned.
// Legacy numeric keys ("6"/"7"/"8", from the square-only days) are migrated to
// "6x6"/"7x7"/"8x8" on read so old bests are preserved.

export function loadScores() {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    let data = raw ? JSON.parse(raw) : {};
    if (!data || typeof data !== 'object') return {};
    for (const k of Object.keys(data)) {
      if (/^\d+$/.test(k)) {                 // legacy square key "N" -> "NxN"
        const nk = k + 'x' + k;
        if (!data[nk]) data[nk] = data[k];
        delete data[k];
      }
    }
    return data;
  } catch (e) {
    return {};
  }
}

export function bestFor(cols, rows, mode = 0) {
  const list = loadScores()[scoreKey(cols, rows, mode)] || [];
  return list.length ? list[0].s : 0;
}

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

// Insert a finished run into its board+mode leaderboard; keep the top 10 by score.
// Each entry also stores the final board grid (`b`) and duration seconds (`dur`)
// so the modal can show a snapshot. Returns the best score for that board+mode.
export function recordScore(cols, rows, score, level, mode = 0, board = null, dur = 0) {
  const key = scoreKey(cols, rows, mode);
  const scores = loadScores();
  const list = scores[key] || [];
  const entry = { s: score, l: level, d: todayISO() };
  if (board) entry.b = board;
  if (dur) entry.dur = dur;
  list.push(entry);
  list.sort((a, b) => b.s - a.s);
  scores[key] = list.slice(0, TOP_N);
  try { localStorage.setItem(SCORES_KEY, JSON.stringify(scores)); } catch (e) { /* ignore */ }
  return scores[key][0].s;
}

export function save() {
  try {
    const data = {
      cols: state.cols,
      rows: state.rows,
      pendingCols: state.pendingCols,
      pendingRows: state.pendingRows,
      board: state.board,
      current: state.current,
      activePos: state.activePos,
      reserves: state.reserves,
      score: state.score,
      coins: state.coins,
      turns: state.turns,
      crystalMult: state.crystalMult,
      pendingCrystalMult: state.pendingCrystalMult,
      timeMode: state.timeMode,
      pendingTimeMode: state.pendingTimeMode,
      timeLeftMs: state.timeLeftMs,
      elapsedMs: state.elapsedMs,
      level: state.level,
      goal: state.goal,
      undos: state.undos,
      undoStack: state.undoStack,
      bombs: state.bombs,
      charm: state.charm,
      charmChoices: state.charmChoices,
      grassStreak: state.grassStreak,
      storeBought: state.storeBought,
      over: state.over,
    };
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    // Storage full or blocked (private mode) — fail silently, keep playing.
  }
}

// Load best score always; load an in-progress game if one exists.
// Returns true if a saved game was restored.
export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // No saved game — best for the default board comes from the leaderboard.
      state.best = bestFor(state.cols, state.rows) || parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;
      return false;
    }
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.board)) return false;

    // Dimensions must be restored before the board is used to build the grid.
    // Old saves stored a single square `size`; new ones store cols/rows.
    state.cols = data.cols || data.size || (data.board[0] && data.board[0].length) || BOARD_SIZE;
    state.rows = data.rows || data.size || data.board.length || BOARD_SIZE;
    state.pendingCols = data.pendingCols || data.pendingSize || state.cols;
    state.pendingRows = data.pendingRows || data.pendingSize || state.rows;
    // Best is the top score recorded for this board+mode (legacy value as backup).
    state.best = bestFor(state.cols, state.rows, data.timeMode || 0) || parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;
    state.board = data.board;
    state.current = data.current ?? null;
    state.activePos = data.activePos ?? null;
    // Restore storage slots; migrate an old single `reserve` into slot 0.
    state.reserves = new Array(MAX_STORAGE).fill(null);
    if (Array.isArray(data.reserves)) {
      for (let i = 0; i < MAX_STORAGE; i++) state.reserves[i] = data.reserves[i] ?? null;
    } else if (data.reserve != null) {
      state.reserves[0] = data.reserve;
    }
    state.score = data.score || 0;
    state.coins = data.coins || 0;
    state.turns = data.turns || 0;
    state.crystalMult = data.crystalMult || 1;
    state.pendingCrystalMult = data.pendingCrystalMult || state.crystalMult || 1;
    state.timeMode = data.timeMode || 0;
    state.pendingTimeMode = data.pendingTimeMode ?? state.timeMode;
    state.timeLeftMs = (typeof data.timeLeftMs === 'number') ? data.timeLeftMs : null;
    state.elapsedMs = data.elapsedMs || 0;
    state.level = data.level || 1;
    state.goal = data.goal || goalForLevel(state.level);
    state.undos = data.undos || 0;
    state.undoStack = Array.isArray(data.undoStack) ? data.undoStack : [];
    state.bombs = data.bombs || 0;
    state.armed = null;
    state.bombBlast = null;
    // Roguelike charm: restore the run's charm and any pending choice. Old saves
    // (pre-charms) have neither → no charm, chooser not up, game plays normally.
    state.charm = data.charm ?? null;
    state.charmChoices = Array.isArray(data.charmChoices) ? data.charmChoices : [];
    state.grassStreak = data.grassStreak || 0;
    state.storeBought = data.storeBought || {};
    state.over = !!data.over;
    state.lastCreated = null;
    return true;
  } catch (e) {
    state.board = emptyBoard();
    return false;
  }
}

export function clearSave() {
  try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
}
