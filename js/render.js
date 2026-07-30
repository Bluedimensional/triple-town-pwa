// render.js — draw the board, storehouse, store, and HUD from state.
//
// Tiles are drawn from the SVG sprite map (js/sprites.js). To change the art,
// edit sprites.js — nothing here or in the game logic assumes how a tile looks.

import { state, unlockedStorage } from './state.js';
import { NAMES, STORE_ITEMS, ORGANIC_PATH, BOARDS, MAX_STORAGE, boardKey, goalForLevel } from './config.js';
import { SPRITES } from './sprites.js';
import { priceOf } from './store.js';
import { previewMergeGroup } from './match.js';
import { loadScores } from './persistence.js';

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
  el.scoresModal = document.getElementById('scores-modal');
  el.scoresCols = document.getElementById('scores-cols');
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
export function buildBoard(onCellTap) {
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
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.setAttribute('aria-label', `row ${r + 1} column ${c + 1}`);
      // Respond on press (pointerdown), not click — click fires on release after
      // a tap-disambiguation delay, which is the "tiny delay" that felt laggy.
      cell.addEventListener('pointerdown', (e) => { if (e.button === 0) onCellTap(r, c); });
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

// The union of all path tiles as one SVG path `d` (each tile a 1x1 square in the
// board's cell coordinate space). Adjacent squares merge; the filter organics it.
function buildPathShape() {
  let d = '';
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (isPathCell(r, c)) d += `M${c} ${r}h1v1h-1z`;
    }
  }
  // Only touch the DOM (and re-run the displacement filter) when the shape
  // actually changed — avoids needless filter re-rasterization.
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
function paintGoal() {
  el.goalLevel.textContent = 'Level ' + state.level;
  const toNext = Math.max(0, state.goal - state.score);
  el.goalTarget.textContent = toNext.toLocaleString() + ' to level ' + (state.level + 1);
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

// Build the high-scores modal: one column per board size, each listing its top
// five scores with the date earned. Call openScores() to show it.
export function openScores() {
  const scores = loadScores();
  el.scoresCols.innerHTML = BOARDS.map((b) => {
    const list = scores[boardKey(b.cols, b.rows)] || [];
    const rows = list.length
      ? list.slice(0, 3).map((e, i) => {
          const meta = [e.l ? 'Lv ' + e.l : '', formatDate(e.d)].filter(Boolean).join(' · ');
          return `<li><span class="sc-rank">${i + 1}</span>` +
            `<span class="sc-body"><span class="sc-score">${e.s.toLocaleString()}</span>` +
            `<span class="sc-meta">${meta}</span></span></li>`;
        }).join('')
      : '<li class="sc-empty">No scores yet</li>';
    return `<div class="scores-col"><h2>${b.label}</h2><ol>${rows}</ol></div>`;
  }).join('');
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
      ? `Storage slot ${i + 1} — unlocks at level ${i + 1}`
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
  paintHud();
  paintGoal();
  paintTheme();
  paintStorage(onSwap);
  paintStore(onBuy);
  paintOverlay();
  state.lastCreated = null; // consume the one-shot pop marker
  state.bearMoves = [];     // consume the one-shot hop markers
}
