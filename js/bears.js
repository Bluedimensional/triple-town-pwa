// bears.js — bear movement and trapping.
//
// After every placement, each bear tries to shuffle one space to an adjacent
// empty tile. A bear with nowhere to go becomes a tombstone — which can then
// trigger a tombstone-chain merge.

import { state, isStorehouse } from './state.js';
import { resolveMerges } from './match.js';

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function inBounds(r, c) {
  return r >= 0 && r < state.size && c >= 0 && c < state.size;
}

function emptyNeighbors(r, c) {
  const out = [];
  for (const [dr, dc] of DIRS) {
    const nr = r + dr;
    const nc = c + dc;
    // Bears can't wander into the storehouse cell.
    if (inBounds(nr, nc) && !isStorehouse(nr, nc) && state.board[nr][nc] === null) {
      out.push([nr, nc]);
    }
  }
  return out;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Move every bear once. Bears that get trapped turn into tombstones and may
// merge. Processed in random order so movement isn't biased top-left.
export function moveBears() {
  const bears = [];
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      if (state.board[r][c] === 'bear') bears.push([r, c]);
    }
  }
  shuffle(bears);

  for (const [r, c] of bears) {
    if (state.board[r][c] !== 'bear') continue; // may have been overwritten
    const spots = emptyNeighbors(r, c);
    if (spots.length > 0) {
      const [nr, nc] = spots[Math.floor(Math.random() * spots.length)];
      state.board[r][c] = null;
      state.board[nr][nc] = 'bear';
    } else {
      // Trapped: becomes a tombstone, which can start a merge cascade.
      state.board[r][c] = 'tombstone';
      resolveMerges(r, c);
    }
  }
}
