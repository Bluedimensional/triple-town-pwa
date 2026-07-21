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

// All bears (as [r,c]) whose connected bear-group (orthogonal) has NO adjacent
// open tile anywhere — i.e. the whole group is completely enclosed. Only these
// are truly trapped. A bear merely blocked this turn by a neighbouring bear
// whose group still touches an open space is NOT trapped.
function fullyTrappedBears() {
  const key = (r, c) => r + ',' + c;
  const seen = new Set();
  const trapped = [];
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      if (state.board[r][c] !== 'bear' || seen.has(key(r, c))) continue;
      // Flood-fill this bear group; note whether it touches any open tile.
      const group = [];
      const stack = [[r, c]];
      seen.add(key(r, c));
      let touchesOpen = false;
      while (stack.length) {
        const [cr, cc] = stack.pop();
        group.push([cr, cc]);
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (!inBounds(nr, nc) || isStorehouse(nr, nc)) continue;
          if (state.board[nr][nc] === null) touchesOpen = true;
          else if (state.board[nr][nc] === 'bear' && !seen.has(key(nr, nc))) {
            seen.add(key(nr, nc));
            stack.push([nr, nc]);
          }
        }
      }
      if (!touchesOpen) trapped.push(...group);
    }
  }
  return trapped;
}

// Move bears each turn, matching Triple Town's rules:
//  - a bear whose whole connected group is enclosed (no open tile touching the
//    group) is trapped and turns into a tombstone (which can start a merge);
//  - every other bear shuffles one square to a random adjacent open tile if it
//    can, taking turns in a fixed order (leftmost column first, top-to-bottom);
//    a bear temporarily blocked by another bear just waits (no tombstone).
export function moveBears() {
  state.bearMoves = [];

  // 1) Turn every fully-enclosed bear into a tombstone FIRST, then resolve
  //    merges — so a whole connected group of tombstones collapses into one
  //    church at once. (Resolving after each tombstone let 3 merge early and
  //    left a stray grave when a group had 4+ bears.)
  const trapped = fullyTrappedBears();
  for (const [r, c] of trapped) state.board[r][c] = 'tombstone';
  for (const [r, c] of trapped) {
    if (state.board[r][c] === 'tombstone') resolveMerges(r, c);
  }

  // 2) Move the remaining bears (those whose group had room), column-major.
  const bears = [];
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      if (state.board[r][c] === 'bear') bears.push([r, c]);
    }
  }
  bears.sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]));

  for (const [r, c] of bears) {
    if (state.board[r][c] !== 'bear') continue; // already moved/overwritten
    const spots = emptyNeighbors(r, c);
    if (spots.length > 0) {
      const [nr, nc] = spots[Math.floor(Math.random() * spots.length)];
      state.board[r][c] = null;
      state.board[nr][nc] = 'bear';
      state.bearMoves.push({ r: nr, c: nc, fromR: r, fromC: c });
    }
    // else: blocked this turn but the group has room — wait, don't tombstone.
  }
}
