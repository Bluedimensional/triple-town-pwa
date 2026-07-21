// render.js — draw the board, storehouse, store, and HUD from state.
//
// Tiles are drawn from the SVG sprite map (js/sprites.js). To change the art,
// edit sprites.js — nothing here or in the game logic assumes how a tile looks.

import { state, isStorehouse } from './state.js';
import { NAMES, STORE_ITEMS, ORGANIC_PATH } from './config.js';
import { SPRITES } from './sprites.js';
import { priceOf } from './store.js';
import { previewMergeGroup } from './match.js';

const el = {};

export function cacheDom() {
  el.board = document.getElementById('board');
  el.score = document.getElementById('score');
  el.best = document.getElementById('best');
  el.coins = document.getElementById('coins');
  el.store = document.getElementById('store-items');
  el.overlay = document.getElementById('gameover');
  el.finalScore = document.getElementById('final-score');
}

function sprite(type) {
  return type ? (SPRITES[type] || '') : '';
}

// Build the 6x6 grid once; cells are updated in place afterward.
export function buildBoard(onCellTap) {
  el.board.innerHTML = '';
  el.board.style.setProperty('--size', state.size);

  // Organic path layer: a single tan shape (union of path tiles) rendered behind
  // the tiles, with a turbulence/displacement filter that wobbles its edges so
  // the path looks natural instead of made of squares. One filter, one element.
  // Built via DOMParser so the SVG filter primitives get the right namespace.
  const n = state.size;
  const svgStr =
    `<svg xmlns="http://www.w3.org/2000/svg" id="path-layer" viewBox="0 0 ${n} ${n}" aria-hidden="true">
       <defs>
         <pattern id="cobble" patternUnits="userSpaceOnUse" width="1.37" height="1.03">
           <rect width="1.37" height="1.03" fill="#959063"/>
           <g fill="#a9a06e">
             <rect x="0.06" y="0.05" width="0.40" height="0.22" rx="0.09"/>
             <rect x="0.56" y="0.03" width="0.28" height="0.19" rx="0.08"/>
             <rect x="0.95" y="0.07" width="0.34" height="0.21" rx="0.09"/>
             <rect x="0.20" y="0.34" width="0.46" height="0.22" rx="0.09"/>
             <rect x="0.76" y="0.35" width="0.30" height="0.20" rx="0.08"/>
             <rect x="1.14" y="0.36" width="0.18" height="0.17" rx="0.06"/>
             <rect x="0.04" y="0.63" width="0.26" height="0.19" rx="0.08"/>
             <rect x="0.40" y="0.64" width="0.40" height="0.20" rx="0.09"/>
             <rect x="0.90" y="0.62" width="0.36" height="0.22" rx="0.09"/>
             <circle cx="0.50" cy="0.93" r="0.075"/>
             <circle cx="1.02" cy="0.95" r="0.065"/>
           </g>
         </pattern>
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
       <path id="path-shape" d="" fill="url(#cobble) #959063"${ORGANIC_PATH ? ' filter="url(#pathFx)"' : ''}/>
     </svg>`;
  const svgEl = new DOMParser().parseFromString(svgStr, 'image/svg+xml').documentElement;
  el.board.insertBefore(document.importNode(svgEl, true), el.board.firstChild);
  el.pathShape = el.board.querySelector('#path-shape');

  // Keep the cell buttons in their own array — the board's children also include
  // the path-layer SVG, so index math on board.children would be off by one.
  el.cells = [];
  el.cellKeys = [];   // last sprite content per cell, to skip needless re-parses
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.setAttribute('aria-label',
        isStorehouse(r, c) ? 'storehouse' : `row ${r + 1} column ${c + 1}`);
      // Respond on press (pointerdown), not click — click fires on release after
      // a tap-disambiguation delay, which is the "tiny delay" that felt laggy.
      cell.addEventListener('pointerdown', (e) => { if (e.button === 0) onCellTap(r, c); });
      el.board.appendChild(cell);
      el.cells.push(cell);
    }
  }
}

function isActive(r, c) {
  return !state.over && state.activePos &&
    state.activePos.r === r && state.activePos.c === c;
}

// A cell carries the tan path surface when it's empty (incl. the active preview)
// or has a bear standing on it.
function isPathCell(r, c) {
  return !isStorehouse(r, c) && (state.board[r][c] === null || state.board[r][c] === 'bear');
}

// The union of all path tiles as one SVG path `d` (each tile a 1x1 square in the
// board's cell coordinate space). Adjacent squares merge; the filter organics it.
function buildPathShape() {
  let d = '';
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
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
  const cellSize = el.board.clientWidth / state.size; // px, for the hop offset
  const moved = new Map();
  for (const m of state.bearMoves) moved.set(m.r + ',' + m.c, m);
  // Only rewrite a cell's sprite (an SVG parse) when its content actually
  // changes — most cells are unchanged each placement.
  const setContent = (idx, key, html) => {
    if (el.cellKeys[idx] !== key) { cells[idx].innerHTML = html; el.cellKeys[idx] = key; }
  };
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      const idx = r * state.size + c;
      const cell = cells[idx];
      let cls = 'cell';
      const pulsing = pulse.has(r + ',' + c);

      if (isStorehouse(r, c)) {
        // Empty storehouse shows the 3D plate; otherwise the held piece.
        setContent(idx, 'store:' + (state.reserve || 'plate'),
          state.reserve ? sprite(state.reserve) : SPRITES.plate);
        cls += ' storehouse';
        cell.title = state.reserve ? NAMES[state.reserve] : 'Storehouse — tap to store/swap';
      } else if (isActive(r, c) && state.current) {
        // The waiting piece: sits on the path; white glow + pulse live on the sprite.
        setContent(idx, 'active:' + state.current, sprite(state.current));
        cls += ' path pulsing lead';
        setLean(cell, r, c);
        cell.title = NAMES[state.current] + ' — tap any tile to place';
      } else {
        const type = state.board[r][c];
        setContent(idx, 'tile:' + (type || ''), sprite(type));
        if (type) {
          if (type === 'bear') {
            cls += ' path';          // bears stand on the dirt path
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
  if (state.over) {
    el.finalScore.textContent = state.score.toLocaleString();
    el.overlay.classList.add('show');
  } else {
    el.overlay.classList.remove('show');
  }
}

// Slide each absorbed tile from its old cell into the merge point, then fade it
// out — so merges flow instead of snapping.
function renderMergeSlides() {
  if (!state.mergeSlides.length) return;
  const cellSize = el.board.clientWidth / state.size;
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
    setTimeout(done, 260); // fallback if animationend doesn't fire (e.g. bg tab)
    el.board.appendChild(slider);
  }
  state.mergeSlides = [];
}

export function render({ onBuy }) {
  paintBoard();
  renderMergeSlides();
  paintHud();
  paintStore(onBuy);
  paintOverlay();
  state.lastCreated = null; // consume the one-shot pop marker
  state.bearMoves = [];     // consume the one-shot hop markers
}
