// render.js — draw the board, storehouse, store, and HUD from state.
//
// Tiles are drawn from the SVG sprite map (js/sprites.js). To change the art,
// edit sprites.js — nothing here or in the game logic assumes how a tile looks.

import { state, isStorehouse } from './state.js';
import { NAMES, STORE_ITEMS } from './config.js';
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
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.setAttribute('aria-label',
        isStorehouse(r, c) ? 'storehouse' : `row ${r + 1} column ${c + 1}`);
      cell.addEventListener('click', () => onCellTap(r, c));
      el.board.appendChild(cell);
    }
  }
}

function isActive(r, c) {
  return !state.over && state.activePos &&
    state.activePos.r === r && state.activePos.c === c;
}

// A cell shows the light dirt "path" surface when it's empty, or when a bear is
// standing on it (bears always sit on the path, never on the dark field).
function isPathSurface(r, c) {
  return r >= 0 && r < state.size && c >= 0 && c < state.size &&
    !isStorehouse(r, c) && (state.board[r][c] === null || state.board[r][c] === 'bear');
}

// Round only the corners where a path cell is exposed on both meeting sides, so
// adjacent path tiles fuse into one continuous shape with rounded end-caps.
function pathRadius(r, c) {
  const up = isPathSurface(r - 1, c);
  const down = isPathSurface(r + 1, c);
  const left = isPathSurface(r, c - 1);
  const right = isPathSurface(r, c + 1);
  const R = '46%';
  const tl = (!up && !left) ? R : '0';
  const tr = (!up && !right) ? R : '0';
  const br = (!down && !right) ? R : '0';
  const bl = (!down && !left) ? R : '0';
  return `${tl} ${tr} ${br} ${bl}`;
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
  const cells = el.board.children;
  const pulse = pulseKeys();
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      const cell = cells[r * state.size + c];
      let cls = 'cell';
      cell.style.borderRadius = '';
      const pulsing = pulse.has(r + ',' + c);

      if (isStorehouse(r, c)) {
        cell.innerHTML = sprite(state.reserve);
        cls += ' storehouse';
        cls += state.reserve ? ' filled' : ' empty-store';
        cell.title = state.reserve ? NAMES[state.reserve] : 'Storehouse — tap to store/swap';
      } else if (isActive(r, c) && state.current) {
        // The waiting piece: a rounded blob on the path. White border + pulse
        // live ONLY on this tile.
        cell.innerHTML = sprite(state.current);
        cls += ' path pulsing lead';
        cell.style.borderRadius = '32%';
        cell.title = NAMES[state.current] + ' — tap any tile to place';
      } else {
        const type = state.board[r][c];
        cell.innerHTML = sprite(type);
        if (type) {
          if (type === 'bear') {
            // Bears stand on the dirt path (tan), fused with adjacent path.
            cls += ' path';
            cell.style.borderRadius = pathRadius(r, c);
          } else {
            cls += ' filled';
          }
          // A group member pulses along, but never gets the white border.
          if (pulsing) cls += ' pulsing';
          if (state.lastCreated &&
              state.lastCreated.r === r && state.lastCreated.c === c) cls += ' pop';
        } else {
          cls += ' path';
          cell.style.borderRadius = pathRadius(r, c);
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
    btn.addEventListener('click', () => onBuy(type));
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

export function render({ onBuy }) {
  paintBoard();
  paintHud();
  paintStore(onBuy);
  paintOverlay();
  state.lastCreated = null; // consume the one-shot pop marker
}
