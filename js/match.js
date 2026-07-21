// match.js — connected-group detection (flood fill) and cascading merges.

import { state } from './state.js';
import { MERGE, POINTS, COINS } from './config.js';

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // orthogonal only

function inBounds(r, c) {
  return r >= 0 && r < state.size && c >= 0 && c < state.size;
}

// All tiles orthogonally connected to (r,c) that share its type, including (r,c).
export function floodFill(r, c, type) {
  const seen = new Set();
  const group = [];
  const stack = [[r, c]];
  seen.add(r + ',' + c);
  while (stack.length) {
    const [cr, cc] = stack.pop();
    if (state.board[cr][cc] !== type) continue;
    group.push([cr, cc]);
    for (const [dr, dc] of DIRS) {
      const nr = cr + dr;
      const nc = cc + dc;
      const key = nr + ',' + nc;
      if (inBounds(nr, nc) && !seen.has(key) && state.board[nr][nc] === type) {
        seen.add(key);
        stack.push([nr, nc]);
      }
    }
  }
  return group;
}

// Resolve merges starting at (r,c), cascading as long as the newly created
// tile keeps forming a large-enough group. Returns points earned this cascade.
export function resolveMerges(r, c) {
  let earned = 0;
  while (true) {
    const type = state.board[r][c];
    const rule = MERGE[type];
    if (!rule) break;

    const group = floodFill(r, c, type);
    if (group.length < rule.need) break;

    // Collapse the whole group into the next tier at the placement point.
    for (const [gr, gc] of group) state.board[gr][gc] = null;
    state.board[r][c] = rule.next;
    state.lastCreated = { r, c };

    const pts = POINTS[rule.next] || 0;
    state.score += pts;
    earned += pts;
    state.coins += COINS[rule.next] || 0;
    // Loop again from the same cell to cascade.
  }
  return earned;
}
