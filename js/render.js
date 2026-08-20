// render.js — draw the board, storehouse, store, and HUD from state.
//
// Tiles are drawn from the SVG sprite map (js/sprites.js). To change the art,
// edit sprites.js — nothing here or in the game logic assumes how a tile looks.

import { state, unlockedStorage } from './state.js';
import { NAMES, STORE_ITEMS, ORGANIC_PATH, BOARDS, MAX_STORAGE, boardKey, goalForLevel,
  TIME_MODES, timeModeLabel } from './config.js';
import { SPRITES } from './sprites.js';
import { priceOf } from './store.js';
import { previewMergeGroup } from './match.js';
import { loadScores, scoreKey } from './persistence.js';

const el = {};

export function cacheDom() {
  el.board = document.getElementById('board');
  el.score = document.getElementById('score');
  el.best = document.getElementById('best');
  el.coins = document.getElementById('coins');
  el.store = document.getElementById('store-items');
  el.storage = document.getElementById('storage-slots');
  el.overlay = document.getElementById('gameover');
  el.finalScore = document.getElementById('final-score');
  el.overLevel = document.getElementById('over-level');
  el.goalbar = document.getElementById('goalbar');
  el.goalLevel = document.getElementById('goal-level');
  el.goalTarget = document.getElementById('goal-target');
  el.goalFill = document.getElementById('goal-fill');
  el.clock = document.getElementById('clock');
  el.undoBtn = document.getElementById('undo-btn');
  el.undoCount = document.getElementById('undo-count');
  el.bombBtn = document.getElementById('bomb-btn');
  el.bombCount = document.getElementById('bomb-count');
  el.graveBtn = document.getElementById('grave-btn');
  el.graveCount = document.getElementById('grave-count');
  el.zapBtn = document.getElementById('zap-btn');
  el.zapCount = document.getElementById('zap-count');
  el.zapCelebrate = document.getElementById('zap-celebrate');
  el.hint = document.querySelector('#toolbar .hint');
  el.celebrate = document.getElementById('level-celebrate');
  el.scoresModal = document.getElementById('scores-modal');
  el.scoresCols = document.getElementById('scores-cols');
  el.scoresTabs = document.getElementById('scores-tabs');
  el.overReason = document.querySelector('#gameover .over-reason');
}

function sprite(type) {
  return type ? (SPRITES[type] || '') : '';
}

// Cobblestone path texture: base #75774a with bricks randomly shaded #777b4a or
// #7c804d, each with a faint #737746 border. Bricks are 20% smaller than the
// base layout and only lightly rounded (brick-like, not pill-like).
function cobblePattern() {
  const fills = ['#777b4a', '#7c804d'];
  // [x, y, width, height] in cell units (before the 20% shrink).
  const specs = [
    [0.06, 0.05, 0.40, 0.22], [0.56, 0.03, 0.28, 0.19], [0.95, 0.07, 0.34, 0.21],
    [0.20, 0.34, 0.46, 0.22], [0.76, 0.35, 0.30, 0.20], [1.14, 0.36, 0.18, 0.17],
    [0.04, 0.63, 0.26, 0.19], [0.40, 0.64, 0.40, 0.20], [0.90, 0.62, 0.36, 0.22],
    [0.44, 0.88, 0.24, 0.16], [0.96, 0.90, 0.22, 0.15],
  ];
  let bricks = '';
  for (const [x, y, w, h] of specs) {
    const nw = (w * 0.8).toFixed(3), nh = (h * 0.8).toFixed(3);   // 20% smaller
    const nx = (x + w * 0.1).toFixed(3), ny = (y + h * 0.1).toFixed(3); // re-centre
    const fill = fills[Math.floor(Math.random() * fills.length)];
    bricks += `<rect x="${nx}" y="${ny}" width="${nw}" height="${nh}" rx="0.045" fill="${fill}"/>`;
  }
  return `<pattern id="cobble" patternUnits="userSpaceOnUse" width="1.37" height="1.03">`
    + `<rect width="1.37" height="1.03" fill="#75774a"/>`
    + `<g stroke="#737746" stroke-width="0.012">${bricks}</g>`
    + `</pattern>`;
}

// Build the 6x6 grid once; cells are updated in place afterward.
// onCellTap(r,c): place / bomb-target. onArm(): long-press on the held piece
// (fires after ~450ms) arms a bomb, when one is banked and not already armed.
export function buildBoard(onCellTap, onArm) {
  el.board.innerHTML = '';
  // Set columns/rows on the stack so the board and the storage row (which share
  // the same grid columns) update together, and the board keeps square cells.
  const stack = document.getElementById('board-stack');
  stack.style.setProperty('--cols', state.cols);
  stack.style.setProperty('--rows', state.rows);
  el.board.style.setProperty('--cols', state.cols);
  el.board.style.setProperty('--rows', state.rows);
  el.storageKey = null;          // force the storage row to rebuild for the new size

  // Organic path layer: a single tan shape (union of path tiles) rendered behind
  // the tiles, with a turbulence/displacement filter that wobbles its edges so
  // the path looks natural instead of made of squares. One filter, one element.
  // Built via DOMParser so the SVG filter primitives get the right namespace.
  const svgStr =
    `<svg xmlns="http://www.w3.org/2000/svg" id="path-layer" viewBox="0 0 ${state.cols} ${state.rows}" aria-hidden="true">
       <defs>
         ${cobblePattern()}
         <filter id="pathFx" x="-12%" y="-12%" width="124%" height="124%">
           <feTurbulence type="fractalNoise" baseFrequency="2.6 2.9" numOctaves="1" seed="11" result="noise"/>
           <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.22"
             xChannelSelector="R" yChannelSelector="G" result="disp"/>
           <feMorphology in="disp" operator="dilate" radius="0.07" result="dil"/>
           <feFlood flood-color="#2c4116" result="col"/>
           <feComposite in="col" in2="dil" operator="in" result="bd"/>
           <feMerge><feMergeNode in="bd"/><feMergeNode in="disp"/></feMerge>
         </filter>
       </defs>
       <path id="path-shape" d="" fill="url(#cobble) #75774a"${ORGANIC_PATH ? ' filter="url(#pathFx)"' : ''}/>
     </svg>`;
  const svgEl = new DOMParser().parseFromString(svgStr, 'image/svg+xml').documentElement;
  el.board.insertBefore(document.importNode(svgEl, true), el.board.firstChild);
  el.pathShape = el.board.querySelector('#path-shape');

  // Keep the cell buttons in their own array — the board's children also include
  // the path-layer SVG, so index math on board.children would be off by one.
  el.cells = [];
  el.cellKeys = [];   // last sprite content per cell, to skip needless re-parses
  // Long-press state, shared across cells (only one pointer interacts at a time).
  let lpTimer = null, lpFired = false, lpCell = null;
  const clearLP = () => { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } };
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.setAttribute('aria-label', `row ${r + 1} column ${c + 1}`);
      // Respond on press (pointerdown), not click — click fires on release after
      // a tap-disambiguation delay, which is the "tiny delay" that felt laggy.
      // Exception: pressing the HELD piece while you have a bomb starts a
      // long-press timer (arm on hold, place on a quick tap) instead.
      cell.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        const cr = +cell.dataset.r, cc = +cell.dataset.c;
        const held = state.activePos && state.activePos.r === cr && state.activePos.c === cc;
        // Long-press the held piece: arm a bomb if you have one; if you have NONE,
        // don't place — flash the 💣 counter to say "no bombs". A quick tap places.
        if (held && !state.armed && !state.over && onArm) {
          lpFired = false; lpCell = { r: cr, c: cc }; clearLP();
          lpTimer = setTimeout(() => {
            lpFired = true; lpTimer = null;
            if (state.bombs > 0) onArm();
            else flashNoBomb();
          }, 450);
          return;   // wait for pointerup to tell a tap (place) from a hold
        }
        onCellTap(cr, cc);
      });
      cell.addEventListener('pointerup', () => {
        if (!lpCell) return;
        clearLP();
        const { r: cr, c: cc } = lpCell; lpCell = null;
        if (!lpFired) onCellTap(cr, cc);   // quick tap on the held piece → place it here
      });
      cell.addEventListener('pointercancel', () => { clearLP(); lpCell = null; });
      cell.addEventListener('pointerleave', () => { if (lpCell) { clearLP(); lpCell = null; } });
      el.board.appendChild(cell);
      el.cells.push(cell);
    }
  }
}

// Cells holding a settled bear — the ones that may play an idle gesture. A bear
// that's still the waiting piece, or mid-hop, is busy and sits this one out.
export function bearCells() {
  return (el.cells || []).filter((c) =>
    c.classList.contains('bear') &&
    !c.classList.contains('lead') &&
    !c.classList.contains('hopping'));
}

function isActive(r, c) {
  return !state.over && state.activePos &&
    state.activePos.r === r && state.activePos.c === c;
}

// A cell carries the tan path surface when it's empty (incl. the active preview)
// or has a bear standing on it.
function isPathCell(r, c) {
  return state.board[r][c] === null || state.board[r][c] === 'bear';
}

// Stable pseudo-random in [-1, 1] from two numbers — deterministic per position,
// so the wobble never jitters between frames.
function wob(a, b) {
  const h = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return (h - Math.floor(h)) * 2 - 1;
}

// The path region drawn as an ORGANIC shape — filter-free. Each cell is a closed
// rounded-rectangle subpath (the fills union into one blob). A side shared with
// another path cell sits on the cell boundary, so connected cells fuse with no
// seam and the path reads continuous. A side facing GRASS is pulled IN by a small
// padding, so the path never quite reaches the cell edge (a thin grass margin all
// around). Only a true OUTER corner — where both of its sides face grass — gets
// rounded, and its radius VARIES per corner (a deterministic hash) so the rounding
// looks hand-drawn rather than stamped. Shallow on purpose. Pure vector, no SVG
// filter — so it can't cause the iOS rasterization lag the old turbulence filter did.
function isP(r, c) {
  return r >= 0 && r < state.rows && c >= 0 && c < state.cols && isPathCell(r, c);
}
function buildPathShape() {
  let d = '';
  const PAD = 0.075;                       // grass margin pulled off each open side
  const f = (n) => n.toFixed(3);
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (!isPathCell(r, c)) continue;
      // A side is "open" when the neighbour across it is NOT a path cell.
      const up = !isP(r - 1, c), rt = !isP(r, c + 1),
            dn = !isP(r + 1, c), lf = !isP(r, c - 1);
      // Inset the rectangle on every OPEN side; closed sides stay on the cell
      // boundary so neighbouring path cells share an exact edge and fuse.
      const x0 = c + (lf ? PAD : 0), x1 = c + 1 - (rt ? PAD : 0);
      const y0 = r + (up ? PAD : 0), y1 = r + 1 - (dn ? PAD : 0);
      // Round a corner only when BOTH its sides face grass. Radius varies per
      // corner (deterministic, so it never jitters) between ~0.10 and ~0.22.
      const rad = (on, a, b) => (on ? 0.10 + 0.12 * Math.abs(wob(a, b)) : 0);
      let rTL = rad(up && lf, c * 1.7 + 0.3, r * 2.3 + 0.7);
      let rTR = rad(up && rt, (c + 1) * 1.9 + 0.5, r * 2.1 + 0.2);
      let rBR = rad(dn && rt, (c + 1) * 1.3 + 0.9, (r + 1) * 1.8 + 0.4);
      let rBL = rad(dn && lf, c * 2.2 + 0.6, (r + 1) * 1.5 + 0.8);
      // Never let two radii on the same short side overlap.
      const cap = Math.min(x1 - x0, y1 - y0) * 0.5;
      rTL = Math.min(rTL, cap); rTR = Math.min(rTR, cap);
      rBR = Math.min(rBR, cap); rBL = Math.min(rBL, cap);
      // Walk clockwise, starting just past the top-left corner.
      d += `M${f(x0 + rTL)} ${f(y0)}`;
      d += `L${f(x1 - rTR)} ${f(y0)}`;
      if (rTR) d += `Q${f(x1)} ${f(y0)} ${f(x1)} ${f(y0 + rTR)}`;
      d += `L${f(x1)} ${f(y1 - rBR)}`;
      if (rBR) d += `Q${f(x1)} ${f(y1)} ${f(x1 - rBR)} ${f(y1)}`;
      d += `L${f(x0 + rBL)} ${f(y1)}`;
      if (rBL) d += `Q${f(x0)} ${f(y1)} ${f(x0)} ${f(y1 - rBL)}`;
      d += `L${f(x0)} ${f(y0 + rTL)}`;
      if (rTL) d += `Q${f(x0)} ${f(y0)} ${f(x0 + rTL)} ${f(y0)}`;
      d += 'Z';
    }
  }
  // Only touch the DOM when the shape actually changed.
  if (el.pathShape && d !== el.lastPathD) {
    el.pathShape.setAttribute('d', d);
    el.lastPathD = d;
  }
}

// Point a pulsing group member toward the active piece (unit vector in --lx/--ly);
// the active piece itself gets 0 so it pulses in place.
function setLean(cell, r, c) {
  let lx = 0, ly = 0;
  if (state.activePos && !(state.activePos.r === r && state.activePos.c === c)) {
    const dx = state.activePos.c - c;
    const dy = state.activePos.r - r;
    const len = Math.hypot(dx, dy) || 1;
    lx = (dx / len).toFixed(3);
    ly = (dy / len).toFixed(3);
  }
  cell.style.setProperty('--lx', lx);
  cell.style.setProperty('--ly', ly);
}

// The tiles that pulse: the whole would-merge group if placing completes a
// combo, otherwise just the active piece.
function pulseKeys() {
  if (state.over || !state.activePos || !state.current) return new Set();
  const keys = new Set([state.activePos.r + ',' + state.activePos.c]);
  for (const [r, c] of previewMergeGroup()) keys.add(r + ',' + c);
  return keys;
}

function paintBoard() {
  buildPathShape();                 // organic tan path behind the tiles
  const cells = el.cells;
  const pulse = pulseKeys();
  const cellSize = el.board.clientWidth / state.cols; // px (cells are square)
  const moved = new Map();
  for (const m of state.bearMoves) moved.set(m.r + ',' + m.c, m);
  // Only rewrite a cell's sprite (an SVG parse) when its content actually
  // changes — most cells are unchanged each placement.
  const setContent = (idx, key, html) => {
    if (el.cellKeys[idx] !== key) { cells[idx].innerHTML = html; el.cellKeys[idx] = key; }
  };
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const idx = r * state.cols + c;
      const cell = cells[idx];
      let cls = 'cell';
      const pulsing = pulse.has(r + ',' + c);

      if (isActive(r, c) && state.current) {
        // The waiting piece: sits on the path; white glow + pulse live on the sprite.
        setContent(idx, 'active:' + state.current, sprite(state.current));
        cls += ' path pulsing lead';
        if (state.current === 'bear') cls += ' bear';   // keep the preview bear's tuned size
        setLean(cell, r, c);
        cell.title = NAMES[state.current] + ' — tap any tile to place';
      } else {
        const type = state.board[r][c];
        setContent(idx, 'tile:' + (type || ''), sprite(type));
        if (type) {
          if (type === 'bear') {
            cls += ' path bear';     // bears stand on the dirt path, and fidget
            // If this bear just moved, hop it from its old cell to here.
            const m = moved.get(r + ',' + c);
            if (m) {
              cls += ' hopping';
              cell.style.setProperty('--fx', ((m.fromC - c) * cellSize).toFixed(1) + 'px');
              cell.style.setProperty('--fy', ((m.fromR - r) * cellSize).toFixed(1) + 'px');
            }
          } else {
            cls += ' filled';
          }
          // A group member pulses along (leaning toward the new piece), but
          // never gets the white border.
          if (pulsing) { cls += ' pulsing'; setLean(cell, r, c); }
          if (state.lastCreated &&
              state.lastCreated.r === r && state.lastCreated.c === c) cls += ' pop';
        } else {
          cls += ' path';
        }
        cell.title = type ? NAMES[type] : '';
      }
      // Bomb aim mode: the held piece glows, and every valid target for the aimed
      // bomb lights up — Rocks/Bears for a regular bomb, Tombstones for a grave bomb.
      if (state.armed) {
        if (isActive(r, c)) cls += ' bomb-armed';
        const bt = state.board[r][c];
        const isTarget = state.armed === 'zap' ? bt !== null
          : state.armed === 'grave' ? bt === 'tombstone'
          : (bt === 'rock' || bt === 'bear');
        if (isTarget) cls += (state.armed === 'zap' ? ' zap-target' : ' bomb-target');
      }
      cell.className = cls;
    }
  }
}

function paintHud() {
  el.score.textContent = state.score.toLocaleString();
  el.best.textContent = state.best.toLocaleString();
  el.coins.textContent = state.coins.toLocaleString();
}

// Field theme per level: level 1 grass, 2 space, 3+ ocean. Everything else stays
// the same — only the field background changes (see styles.css).
const FIELD_THEMES = ['grass', 'space', 'ocean'];
function paintTheme() {
  const theme = FIELD_THEMES[Math.min(state.level - 1, FIELD_THEMES.length - 1)];
  if (document.body.dataset.field !== theme) document.body.dataset.field = theme;
}

// The level goal bar: current level, how many points to the next level, and a
// fill bar showing progress within the current level. Levels are milestones you
// pass while playing — reaching one just ticks this up.
// 'M:SS' from milliseconds (never negative).
function fmtClock(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

// The countdown clock (timed mode only). Cheap — safe to call every tick. In
// endless mode it's hidden and the "to next level" target shows instead.
export function paintClock() {
  if (!el.clock) return;
  const timed = state.timeMode > 0 && state.timeLeftMs != null;
  el.clock.hidden = !timed;
  if (el.goalTarget) el.goalTarget.style.display = timed ? 'none' : '';
  if (!timed) { el.clock.classList.remove('low'); return; }
  el.clock.textContent = '⏱ ' + fmtClock(state.timeLeftMs);
  el.clock.classList.toggle('low', !state.over && state.timeLeftMs <= 30000);
}

function paintGoal() {
  el.goalLevel.textContent = 'Level ' + state.level;
  const toNext = Math.max(0, state.goal - state.score);
  el.goalTarget.textContent = toNext.toLocaleString() + ' to level ' + (state.level + 1);
  paintClock();
  // Progress from the previous threshold to this level's goal (fills within-level).
  const prevGoal = state.level > 1 ? goalForLevel(state.level - 1) : 0;
  const span = Math.max(1, state.goal - prevGoal);
  const into = state.score - prevGoal;
  el.goalFill.style.width = Math.max(0, Math.min(100, Math.round((into / span) * 100))) + '%';
  // Brief highlight when the level just advanced (non-blocking).
  if (state.levelFlash) {
    state.levelFlash = false;
    el.goalbar.classList.remove('leveled');
    void el.goalbar.offsetWidth;           // restart the animation
    el.goalbar.classList.add('leveled');
    el.goalbar.addEventListener('animationend',
      () => el.goalbar.classList.remove('leveled'), { once: true });
  }
}

// The undo button: shows how many undos are banked (one per level completed) and
// is enabled only when there's an undo to spend and a move to take back.
function paintUndo() {
  el.undoCount.textContent = state.undos;
  el.undoBtn.disabled = state.undos <= 0 || state.undoStack.length === 0;
}

// The bomb buttons: how many of each are banked, which (if any) is aimed, and —
// while aimed — a hint telling you what to tap. Buttons light up when available.
const DEFAULT_HINT = 'Tap to place · slots above = storage';
function paintBombs() {
  // Regular bomb (rock / bear).
  el.bombCount.textContent = state.bombs;
  el.bombBtn.disabled = (state.bombs <= 0 && state.armed !== 'bomb') || state.over;
  el.bombBtn.classList.toggle('armed', state.armed === 'bomb');
  el.bombBtn.classList.toggle('ready', state.bombs > 0 && state.armed !== 'bomb' && !state.over);
  // Grave bomb (tombstone).
  el.graveCount.textContent = state.graveBombs;
  el.graveBtn.disabled = (state.graveBombs <= 0 && state.armed !== 'grave') || state.over;
  el.graveBtn.classList.toggle('armed', state.armed === 'grave');
  el.graveBtn.classList.toggle('ready', state.graveBombs > 0 && state.armed !== 'grave' && !state.over);
  // Zap (any tile). Hidden until you actually have one — so it reads as a surprise.
  el.zapCount.textContent = state.zaps;
  el.zapBtn.hidden = !(state.zaps > 0 || state.armed === 'zap');
  el.zapBtn.disabled = (state.zaps <= 0 && state.armed !== 'zap') || state.over;
  el.zapBtn.classList.toggle('armed', state.armed === 'zap');
  el.zapBtn.classList.toggle('ready', state.zaps > 0 && state.armed !== 'zap' && !state.over);

  if (el.hint) {
    el.hint.textContent =
      state.armed === 'bomb' ? '💣 Tap a rock or bear to blow it up (tap 💣 again to cancel)'
      : state.armed === 'grave' ? '🪦 Tap a grave to clear it (tap 🪦 again to cancel)'
      : state.armed === 'zap' ? '⚡ Tap anything to zap it away (tap ⚡ again to cancel)'
      : DEFAULT_HINT;
  }
  document.body.classList.toggle('bomb-aiming', !!state.armed);
}

// Feedback for a long-press with no bombs: a one-cycle scale pulse + red flash on
// the 💣 counter that says "no bombs" — without placing your piece.
function flashNoBomb() {
  if (!el.bombBtn) return;
  el.bombBtn.classList.remove('nobomb');
  void el.bombBtn.offsetWidth;                 // restart the animation
  el.bombBtn.classList.add('nobomb');
  el.bombBtn.addEventListener('animationend',
    () => el.bombBtn.classList.remove('nobomb'), { once: true });
}

// A quick blast burst where a bomb just destroyed a tile.
function renderBombBlast() {
  const b = state.bombBlast;
  state.bombBlast = null;
  if (!b) return;
  const cellSize = el.board.clientWidth / state.cols;
  const el2 = document.createElement('div');
  el2.className = 'bomb-blast';
  el2.textContent = '💥';
  el2.style.left = (b.c * cellSize) + 'px';
  el2.style.top = (b.r * cellSize) + 'px';
  el2.style.width = cellSize + 'px';
  el2.style.height = cellSize + 'px';
  el2.style.fontSize = (cellSize * 0.6) + 'px';
  const done = () => el2.remove();
  el2.addEventListener('animationend', done);
  setTimeout(done, 650);
  el.board.appendChild(el2);
}

// A full-screen, non-blocking celebration when a level is completed: a gold
// flash, a burst of stars, and the big new level number — then it fades on its
// own (pointer-events stay off, so play is never interrupted).
function renderLevelCelebrate() {
  const lc = state.levelCelebrate;
  state.levelCelebrate = null;
  if (!lc) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stars = '';
  if (!reduce) {
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2, dist = 120 + Math.random() * 190;
      const tx = Math.round(Math.cos(a) * dist), ty = Math.round(Math.sin(a) * dist);
      const size = Math.round(12 + Math.random() * 20), delay = (Math.random() * 0.12).toFixed(2);
      const col = Math.random() < 0.5 ? '#ffe07a' : '#ffffff';
      stars += `<span class="lc-star" style="--tx:${tx}px;--ty:${ty}px;font-size:${size}px;color:${col};animation-delay:${delay}s">★</span>`;
    }
  }
  el.celebrate.innerHTML =
    '<div class="lc-flash"></div>' +
    `<div class="lc-stars">${stars}</div>` +
    `<div class="lc-num">Level ${lc.level}</div>`;
  el.celebrate.classList.remove('show');
  void el.celebrate.offsetWidth;
  el.celebrate.classList.add('show');
  clearTimeout(el.celebrateTimer);
  el.celebrateTimer = setTimeout(() => {
    el.celebrate.classList.remove('show');
    el.celebrate.innerHTML = '';
  }, 2000);
}

// The surprise when a Zap is granted: a cyan flash, a burst of ⚡ bolts, and a
// "⚡ Zap!" label — non-blocking, then fades. Signals that a new power appeared.
function renderZapGrant() {
  if (!state.zapGrant) return;
  state.zapGrant = false;
  if (!el.zapCelebrate) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let bolts = '';
  if (!reduce) {
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2, dist = 80 + Math.random() * 150;
      const tx = Math.round(Math.cos(a) * dist), ty = Math.round(Math.sin(a) * dist);
      const size = Math.round(14 + Math.random() * 20), delay = (Math.random() * 0.12).toFixed(2);
      bolts += `<span class="zc-bolt" style="--tx:${tx}px;--ty:${ty}px;font-size:${size}px;animation-delay:${delay}s">⚡</span>`;
    }
  }
  el.zapCelebrate.innerHTML =
    '<div class="zc-flash"></div>' +
    `<div class="zc-bolts">${bolts}</div>` +
    '<div class="zc-num">⚡ Zap!</div>';
  el.zapCelebrate.classList.remove('show');
  void el.zapCelebrate.offsetWidth;
  el.zapCelebrate.classList.add('show');
  clearTimeout(el.zapTimer);
  el.zapTimer = setTimeout(() => {
    el.zapCelebrate.classList.remove('show');
    el.zapCelebrate.innerHTML = '';
  }, 1600);
}

// Which timed mode's scores the modal is currently showing (defaults to the mode
// of the game you're in / just finished).
let scoresTabMode = 0;

// Render the board columns for the currently-selected time mode: one column per
// board size, each listing its top 10 scores with level + date.
function renderScoresCols() {
  const scores = loadScores();
  el.scoresCols.innerHTML = BOARDS.map((b) => {
    const list = scores[scoreKey(b.cols, b.rows, scoresTabMode)] || [];
    const rows = list.length
      ? list.slice(0, 10).map((e, i) => {
          const meta = [e.l ? 'Lv ' + e.l : '', formatDate(e.d)].filter(Boolean).join(' · ');
          return `<li><span class="sc-rank">${i + 1}</span>` +
            `<span class="sc-body"><span class="sc-score">${e.s.toLocaleString()}</span>` +
            `<span class="sc-meta">${meta}</span></span></li>`;
        }).join('')
      : '<li class="sc-empty">No scores yet</li>';
    return `<div class="scores-col"><h2>${b.label}</h2><ol>${rows}</ol></div>`;
  }).join('');
}

function renderScoresTabs() {
  el.scoresTabs.innerHTML = TIME_MODES.map((m) =>
    `<button class="sc-tab${m === scoresTabMode ? ' active' : ''}" data-mode="${m}">` +
    `${m ? m + ' min' : '∞ Endless'}</button>`).join('');
}

// Build & show the high-scores modal, opening on the current game's mode. Top 10
// per board size, with time-mode tabs across the top.
export function openScores() {
  scoresTabMode = TIME_MODES.includes(state.timeMode) ? state.timeMode : 0;
  renderScoresTabs();
  renderScoresCols();
  // Tab switching (wired once; the container persists).
  if (!el.scoresTabs.dataset.wired) {
    el.scoresTabs.dataset.wired = '1';
    el.scoresTabs.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('.sc-tab');
      if (!btn) return;
      scoresTabMode = Number(btn.dataset.mode);
      renderScoresTabs();
      renderScoresCols();
    });
  }
  el.scoresModal.classList.add('show');
}

export function closeScores() {
  el.scoresModal.classList.remove('show');
}

// 'YYYY-MM-DD' -> 'Jul 22' (short, no year to keep the row compact).
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatDate(iso) {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  const mi = parseInt(m, 10) - 1;
  return (MONTHS[mi] || '') + ' ' + parseInt(d, 10);
}

// The storage row above the board: MAX_STORAGE slots, but only the ones unlocked
// at the current level are usable. Each shows the plate (and any held piece on
// it); locked slots are dimmed. Tapping an unlocked slot swaps/stashes.
function paintStorage(onSwap) {
  const unlocked = unlockedStorage();
  const key = state.reserves.slice(0, MAX_STORAGE).join('|') + '#' + unlocked + '#' + state.over;
  if (el.storageKey === key) return;          // nothing changed — skip the rebuild
  el.storageKey = key;
  el.storage.innerHTML = '';
  for (let i = 0; i < MAX_STORAGE; i++) {
    const open = i < unlocked;
    const piece = state.reserves[i];
    const slot = document.createElement('button');
    slot.className = 'slot' + (open ? '' : ' locked');
    slot.disabled = !open || state.over;
    // Every slot shows its plate (locked ones dimmed via CSS); the held piece
    // only shows on an unlocked slot.
    slot.innerHTML = `<span class="sh-plate">${SPRITES.plate}</span>` +
      (open && piece ? `<span class="sh-item">${sprite(piece)}</span>` : '');
    slot.title = !open
      ? `Storage slot ${i + 1} — unlocks at level ${i}`
      : (piece ? NAMES[piece] + ' — tap to swap' : `Storage slot ${i + 1} — tap to store`);
    slot.addEventListener('pointerdown', (e) => { if (e.button === 0 && !slot.disabled) onSwap(i); });
    el.storage.appendChild(slot);
  }
}

function paintStore(onBuy) {
  el.store.innerHTML = '';
  for (const type of STORE_ITEMS) {
    const price = priceOf(type);
    const btn = document.createElement('button');
    btn.className = 'store-item';
    btn.disabled = state.over || state.coins < price;
    btn.innerHTML =
      `<span class="store-glyph">${sprite(type)}</span>` +
      `<span class="store-price">🪙 ${price}</span>`;
    btn.title = `Buy ${NAMES[type]} for ${price} coins`;
    btn.addEventListener('pointerdown', (e) => { if (e.button === 0 && !btn.disabled) onBuy(type); });
    el.store.appendChild(btn);
  }
}

function paintOverlay() {
  // Shown when the game is over, until the player taps outside the card.
  if (state.over && !state.overlayDismissed) {
    el.finalScore.textContent = state.score.toLocaleString();
    // Time's up vs board-full, and note the mode played.
    if (el.overReason) {
      el.overReason.textContent = (state.timeMode > 0 && (state.timeLeftMs != null && state.timeLeftMs <= 0))
        ? `Time's up (${timeModeLabel(state.timeMode)}) — final score`
        : 'No room left — final score';
    }
    el.overLevel.textContent = 'Reached level ' + state.level;
    el.overlay.classList.add('show');
  } else {
    el.overlay.classList.remove('show');
  }
}

// Slide each absorbed tile from its old cell into the merge point, then fade it
// out — so merges flow instead of snapping.
function renderMergeSlides() {
  if (!state.mergeSlides.length) return;
  const cellSize = el.board.clientWidth / state.cols;
  for (const s of state.mergeSlides) {
    const slider = document.createElement('div');
    slider.className = 'merge-slider';
    slider.style.left = (s.fromC * cellSize) + 'px';
    slider.style.top = (s.fromR * cellSize) + 'px';
    slider.style.width = cellSize + 'px';
    slider.style.height = cellSize + 'px';
    slider.style.setProperty('--dx', ((s.toC - s.fromC) * cellSize).toFixed(1) + 'px');
    slider.style.setProperty('--dy', ((s.toR - s.fromR) * cellSize).toFixed(1) + 'px');
    slider.innerHTML = sprite(s.type);
    const done = () => slider.remove();
    slider.addEventListener('animationend', done);
    setTimeout(done, 480); // fallback if animationend doesn't fire (e.g. bg tab)
    el.board.appendChild(slider);
  }
  state.mergeSlides = [];
}

// Float the points a placement earned up one cell from the tile, fading out.
function renderPointFloat() {
  const fp = state.floatPoints;
  state.floatPoints = null;
  if (!fp || fp.points <= 0) return;
  const cellSize = el.board.clientWidth / state.cols;
  const f = document.createElement('div');
  f.className = 'point-float';
  f.textContent = '+' + fp.points.toLocaleString();
  f.style.left = (fp.c * cellSize) + 'px';
  f.style.top = (fp.r * cellSize) + 'px';
  f.style.width = cellSize + 'px';
  f.style.height = cellSize + 'px';
  f.style.fontSize = (cellSize * 0.34) + 'px';
  const done = () => f.remove();
  f.addEventListener('animationend', done);
  setTimeout(done, 1100);
  el.board.appendChild(f);
}

export function render({ onBuy, onSwap }) {
  paintBoard();
  renderMergeSlides();
  renderPointFloat();
  renderBombBlast();
  paintHud();
  paintGoal();
  paintUndo();
  paintBombs();
  renderLevelCelebrate();
  renderZapGrant();
  paintTheme();
  paintStorage(onSwap);
  paintStore(onBuy);
  paintOverlay();
  state.lastCreated = null; // consume the one-shot pop marker
  state.bearMoves = [];     // consume the one-shot hop markers
}
