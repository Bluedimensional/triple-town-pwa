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

// Preview: the group of tiles that would merge if the current piece were
// placed at its active position right now. Treats the active cell as if it
// already held `current`, then flood-fills same-type board tiles from it.
// Returns the full group (including the active cell) when it reaches the merge
// threshold, or [] when placing wouldn't trigger a merge.
export function previewMergeGroup() {
  if (!state.current || !state.activePos) return [];
  const { r, c } = state.activePos;
  const type = state.current;
  const rule = MERGE[type];
  if (!rule) return []; // e.g. bears never merge

  const seen = new Set([r + ',' + c]);
  const group = [[r, c]];
  const stack = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop();
    for (const [dr, dc] of DIRS) {
      const nr = cr + dr;
      const nc = cc + dc;
      const key = nr + ',' + nc;
      if (inBounds(nr, nc) && !seen.has(key) && state.board[nr][nc] === type) {
        seen.add(key);
        group.push([nr, nc]);
        stack.push([nr, nc]);
      }
    }
  }
  return group.length >= rule.need ? group : [];
}

// Place a crystal (wildcard) at (r,c): it becomes whichever type completes the
// highest-value merge with its neighbours, then that merge resolves (and
// cascades). If no type completes a match, the crystal turns into a rock.
// Returns the resulting type at (r,c).
export function crystalResolve(r, c) {
  let best = null, bestPts = -1;
  for (const type in MERGE) {
    state.board[r][c] = type;                 // pretend the crystal is this type
    if (floodFill(r, c, type).length >= MERGE[type].need) {
      const pts = POINTS[MERGE[type].next] || 0;
      if (pts > bestPts) { bestPts = pts; best = type; }
    }
  }
  if (best) {
    state.board[r][c] = best;
    resolveMerges(r, c);
    return state.board[r][c];
  }
  state.board[r][c] = 'rock';                 // couldn't complete anything
  return 'rock';
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

    // Collapse the whole group into the next tier at the placement point. Record
    // each absorbed tile so the renderer can slide it toward the merge point.
    for (const [gr, gc] of group) {
      if (gr !== r || gc !== c) {
        state.mergeSlides.push({ fromR: gr, fromC: gc, toR: r, toC: c, type });
      }
      state.board[gr][gc] = null;
    }
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
