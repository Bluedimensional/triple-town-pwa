// match.js — connected-group detection (flood fill) and cascading merges.

import { state } from './state.js';
import { MERGE, POINTS, COINS } from './config.js';

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // orthogonal only

// A "super" tile (made by matching 4+) is the same base type for matching — a
// super bush still groups/merges with regular bushes. The suffix carries only
// its look + the double-points it already earned.
const SUPER = 'Super';
export function isSuper(t) { return typeof t === 'string' && t.endsWith(SUPER); }
export function baseType(t) { return isSuper(t) ? t.slice(0, -SUPER.length) : t; }
export function superType(base) { return base + SUPER; }

function inBounds(r, c) {
  return r >= 0 && r < state.size && c >= 0 && c < state.size;
}

// All tiles orthogonally connected to (r,c) whose BASE type matches (r,c)'s base
// type (so super and regular of the same kind group together), including (r,c).
export function floodFill(r, c, type) {
  const target = baseType(type);
  const seen = new Set();
  const group = [];
  const stack = [[r, c]];
  seen.add(r + ',' + c);
  while (stack.length) {
    const [cr, cc] = stack.pop();
    if (baseType(state.board[cr][cc]) !== target) continue;
    group.push([cr, cc]);
    for (const [dr, dc] of DIRS) {
      const nr = cr + dr;
      const nc = cc + dc;
      const key = nr + ',' + nc;
      if (inBounds(nr, nc) && !seen.has(key) && baseType(state.board[nr][nc]) === target) {
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
  const target = baseType(type);
  const rule = MERGE[target];
  if (!rule) return []; // e.g. bears/crystals never merge

  const seen = new Set([r + ',' + c]);
  const group = [[r, c]];
  const stack = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop();
    for (const [dr, dc] of DIRS) {
      const nr = cr + dr;
      const nc = cc + dc;
      const key = nr + ',' + nc;
      if (inBounds(nr, nc) && !seen.has(key) && baseType(state.board[nr][nc]) === target) {
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
    const rule = MERGE[baseType(state.board[r][c])];
    if (!rule) break;

    const group = floodFill(r, c, state.board[r][c]);
    if (group.length < rule.need) break;

    // Matching MORE than the minimum makes a "super" result worth double points.
    const superResult = group.length > rule.need;

    // Collapse the whole group into the next tier at the placement point. Record
    // each absorbed tile (with its actual look) so the renderer can slide it in.
    for (const [gr, gc] of group) {
      if (gr !== r || gc !== c) {
        state.mergeSlides.push({ fromR: gr, fromC: gc, toR: r, toC: c, type: state.board[gr][gc] });
      }
      state.board[gr][gc] = null;
    }
    state.board[r][c] = superResult ? superType(rule.next) : rule.next;
    state.lastCreated = { r, c };

    const pts = (POINTS[rule.next] || 0) * (superResult ? 2 : 1);
    state.score += pts;
    earned += pts;
    state.coins += COINS[rule.next] || 0;
    // Loop again from the same cell to cascade.
  }
  return earned;
}
