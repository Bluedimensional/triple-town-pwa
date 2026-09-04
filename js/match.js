// match.js — connected-group detection (flood fill) and cascading merges.

import { state } from './state.js';
import { MERGE, POINTS, COINS, BOMB_EARN_MIN_POINTS, MAX_BOMBS, CHARM_SCORE_MULT,
  SURGE_BUSH_TARGETS } from './config.js';

// The tier a base type turns into when it merges — normally MERGE[base].next, but
// the Green Thumb charm bends it: grass always jumps straight to Tree, and while
// its Verdant Surge is active bush jumps to a random house. Kept in one place so
// resolveMerges and crystalOptions agree on the result.
function mergeNext(base) {
  if (state.charm === 'greenThumb') {
    if (base === 'grass') return 'tree';
    if (base === 'bush' && state.surgeActive) {
      return SURGE_BUSH_TARGETS[Math.floor(Math.random() * SURGE_BUSH_TARGETS.length)];
    }
  }
  const rule = MERGE[base];
  return rule ? rule.next : null;
}

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // orthogonal only

// A "super" tile (made by matching 4+) is the same base type for matching — a
// super bush still groups/merges with regular bushes. The suffix carries only
// its look + the double-points it already earned.
const SUPER = 'Super';
export function isSuper(t) { return typeof t === 'string' && t.endsWith(SUPER); }
export function baseType(t) { return isSuper(t) ? t.slice(0, -SUPER.length) : t; }
export function superType(base) { return base + SUPER; }

function inBounds(r, c) {
  return r >= 0 && r < state.rows && c >= 0 && c < state.cols;
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

// The distinct merges a crystal at (r,c) could complete — one per base type it
// could become, each yielding a different result (`next`). Restores the crystal
// afterward (pure query). Used to offer a choice when there's more than one.
export function crystalOptions(r, c) {
  const opts = [];
  for (const type in MERGE) {
    state.board[r][c] = type;                 // pretend the crystal is this type
    const group = floodFill(r, c, type);
    if (group.length >= MERGE[type].need) {
      const next = mergeNext(type);
      opts.push({ type, next, count: group.length, points: POINTS[next] || 0 });
    }
  }
  state.board[r][c] = 'crystal';              // restore (the caller decides what to do)
  return opts.sort((a, b) => b.points - a.points);
}

// Place a crystal (wildcard) at (r,c): it becomes whichever type completes the
// highest-value merge with its neighbours, then that merge resolves (and
// cascades). If no type completes a match, the crystal turns into a rock.
// Returns the resulting type at (r,c). (When several DIFFERENT merges are
// possible the game asks the player to choose instead — see game.js.)
export function crystalResolve(r, c) {
  const opts = crystalOptions(r, c);
  if (opts.length) {
    state.board[r][c] = opts[0].type;         // highest-value by default
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
    const base = baseType(state.board[r][c]);
    const rule = MERGE[base];
    if (!rule) break;

    const group = floodFill(r, c, state.board[r][c]);
    if (group.length < rule.need) break;

    // Matching MORE than the minimum makes a "super" result worth double points.
    const superResult = group.length > rule.need;
    if (superResult) state.superMerged = true;   // a 4+ merge — charges the Verdant Surge
    const next = mergeNext(base);           // charm-adjusted result tier

    // Collapse the whole group into the next tier at the placement point. Record
    // each absorbed tile (with its actual look) so the renderer can slide it in.
    for (const [gr, gc] of group) {
      if (gr !== r || gc !== c) {
        state.mergeSlides.push({ fromR: gr, fromC: gc, toR: r, toC: c, type: state.board[gr][gc] });
      }
      state.board[gr][gc] = null;
    }
    state.board[r][c] = superResult ? superType(next) : next;
    state.lastCreated = { r, c };

    let pts = (POINTS[next] || 0) * (superResult ? 2 : 1);
    if (state.charm === 'highRoller') pts = Math.round(pts * CHARM_SCORE_MULT);
    state.score += pts;
    earned += pts;
    state.coins += COINS[next] || 0;
    // A "big merge" (Castle-tier or higher) earns a Bomb, up to the cap. Based on
    // the tile's own tier value (POINTS[next]), not the charm-boosted score.
    if ((POINTS[next] || 0) >= BOMB_EARN_MIN_POINTS && state.bombs < MAX_BOMBS) {
      state.bombs++;
    }
    // Loop again from the same cell to cascade.
  }
  state.mergeEarned = earned;   // this placement's merge points (drives the combo)
  return earned;
}
