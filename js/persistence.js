// persistence.js — save/load to localStorage so progress survives refresh,
// backgrounding, and cache eviction (the scope's reason for not relying on the
// service worker cache for state).

import { state, emptyBoard } from './state.js';
import { BOARD_SIZE, LEVEL_TURN_BUDGET, goalForLevel } from './config.js';

const KEY = 'tripletown.save.v2';
const BEST_KEY = 'tripletown.best.v1';        // legacy single best (pre per-mode)
const SCORES_KEY = 'tripletown.scores.v1';    // per-mode leaderboard
const TOP_N = 5;                              // scores kept per board size

// --- Per-mode leaderboard ----------------------------------------------------
// Shape: { "6": [{s, d}], "7": [...], "8": [...] } — each list is the top 5
// scores for that board size, highest first, with the date (YYYY-MM-DD) earned.

export function loadScores() {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data && typeof data === 'object' ? data : {};
  } catch (e) {
    return {};
  }
}

export function bestFor(size) {
  const list = loadScores()[String(size)] || [];
  return list.length ? list[0].s : 0;
}

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

// Insert a finished run into its board size's leaderboard; keep the top 5.
// Returns the best score for that size afterwards.
export function recordScore(size, score) {
  const key = String(size);
  const scores = loadScores();
  const list = scores[key] || [];
  list.push({ s: score, d: todayISO() });
  list.sort((a, b) => b.s - a.s);
  scores[key] = list.slice(0, TOP_N);
  try { localStorage.setItem(SCORES_KEY, JSON.stringify(scores)); } catch (e) { /* ignore */ }
  return scores[key][0].s;
}

export function save() {
  try {
    const data = {
      size: state.size,
      pendingSize: state.pendingSize,
      board: state.board,
      current: state.current,
      activePos: state.activePos,
      reserve: state.reserve,
      score: state.score,
      coins: state.coins,
      turns: state.turns,
      level: state.level,
      goal: state.goal,
      turnsLeft: state.turnsLeft,
      overReason: state.overReason,
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
      // No saved game — best for the default size comes from the leaderboard.
      state.best = bestFor(state.size) || parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;
      return false;
    }
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.board)) return false;

    // Board size must be restored before the board is used to build the grid.
    state.size = data.size || data.board.length || BOARD_SIZE;
    state.pendingSize = data.pendingSize || state.size;
    // Best is the top score recorded for this board size (legacy value as backup).
    state.best = bestFor(state.size) || parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;
    state.board = data.board;
    state.current = data.current ?? null;
    state.activePos = data.activePos ?? null;
    state.reserve = data.reserve ?? null;
    state.score = data.score || 0;
    state.coins = data.coins || 0;
    state.turns = data.turns || 0;
    state.level = data.level || 1;
    state.goal = data.goal || goalForLevel(state.level);
    state.turnsLeft = data.turnsLeft ?? LEVEL_TURN_BUDGET;
    state.overReason = data.overReason ?? null;
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
