// persistence.js — save/load to localStorage so progress survives refresh,
// backgrounding, and cache eviction (the scope's reason for not relying on the
// service worker cache for state).

import { state, emptyBoard } from './state.js';
import { BOARD_SIZE } from './config.js';

const KEY = 'tripletown.save.v2';
const BEST_KEY = 'tripletown.best.v1';

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
      grassStreak: state.grassStreak,
      storeBought: state.storeBought,
      over: state.over,
    };
    localStorage.setItem(KEY, JSON.stringify(data));
    localStorage.setItem(BEST_KEY, String(state.best));
  } catch (e) {
    // Storage full or blocked (private mode) — fail silently, keep playing.
  }
}

// Load best score always; load an in-progress game if one exists.
// Returns true if a saved game was restored.
export function load() {
  try {
    state.best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.board)) return false;

    // Board size must be restored before the board is used to build the grid.
    state.size = data.size || data.board.length || BOARD_SIZE;
    state.pendingSize = data.pendingSize || state.size;
    state.board = data.board;
    state.current = data.current ?? null;
    state.activePos = data.activePos ?? null;
    state.reserve = data.reserve ?? null;
    state.score = data.score || 0;
    state.coins = data.coins || 0;
    state.turns = data.turns || 0;
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
