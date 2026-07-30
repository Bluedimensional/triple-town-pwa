// persistence.js — save/load to localStorage so progress survives refresh,
// backgrounding, and cache eviction (the scope's reason for not relying on the
// service worker cache for state).

import { state, emptyBoard } from './state.js';
import { BOARD_SIZE, MAX_STORAGE, boardKey, goalForLevel } from './config.js';

const KEY = 'tripletown.save.v2';
const BEST_KEY = 'tripletown.best.v1';        // legacy single best (pre per-mode)
const SCORES_KEY = 'tripletown.scores.v1';    // per-board leaderboard
const TOP_N = 5;                              // scores kept per board

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

export function bestFor(cols, rows) {
  const list = loadScores()[boardKey(cols, rows)] || [];
  return list.length ? list[0].s : 0;
}

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

// Insert a finished run (score + level reached) into its board's leaderboard;
// keep the top 5 by score. Returns the best score for that board.
export function recordScore(cols, rows, score, level) {
  const key = boardKey(cols, rows);
  const scores = loadScores();
  const list = scores[key] || [];
  list.push({ s: score, l: level, d: todayISO() });
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
      level: state.level,
      goal: state.goal,
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
    // Best is the top score recorded for this board (legacy value as backup).
    state.best = bestFor(state.cols, state.rows) || parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;
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
    state.level = data.level || 1;
    state.goal = data.goal || goalForLevel(state.level);
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
