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

// Move every bear once, matching Triple Town's rules:
//  - each bear shuffles one square in a random cardinal direction if it can;
//  - bears take turns in a fixed order — leftmost column first, top-to-bottom,
//    then the next column — so movement is predictable (not random order);
//  - a bear with nowhere to move is trapped and turns into a tombstone, which
//    can then start a tombstone-chain merge.
// Snapshotting the starting positions guarantees each bear moves at most once.
export function moveBears() {
  const bears = [];
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      if (state.board[r][c] === 'bear') bears.push([r, c]);
    }
  }
  // Column-major order: sort by column, then row.
  bears.sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]));

  state.bearMoves = [];
  for (const [r, c] of bears) {
    if (state.board[r][c] !== 'bear') continue; // already moved/overwritten
    const spots = emptyNeighbors(r, c);
    if (spots.length > 0) {
      const [nr, nc] = spots[Math.floor(Math.random() * spots.length)];
      state.board[r][c] = null;
      state.board[nr][nc] = 'bear';
      state.bearMoves.push({ r: nr, c: nc, fromR: r, fromC: c });
    } else {
      // Trapped: becomes a tombstone, which can start a merge cascade.
      state.board[r][c] = 'tombstone';
      resolveMerges(r, c);
    }
  }
}
