// render.js — draw the board, storehouse, store, and HUD from state.
//
// Uses glyphs from the swappable ASSETS map. To move to image sprites later,
// change tileContent() to emit an <img> (or a background-image) and nothing
// else in the game needs to change.

import { state, isStorehouse } from './state.js';
import { ASSETS, NAMES, STORE_ITEMS } from './config.js';
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

function tileContent(type) {
  return type ? (ASSETS[type] || '?') : '';
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
      const label = isStorehouse(r, c)
        ? 'storehouse'
        : `row ${r + 1} column ${c + 1}`;
      cell.setAttribute('aria-label', label);
      cell.addEventListener('click', () => onCellTap(r, c));
      el.board.appendChild(cell);
    }
  }
}

function isActive(r, c) {
  return !state.over && state.activePos &&
    state.activePos.r === r && state.activePos.c === c;
}

// Which cells should pulse: the whole would-merge group if placing completes a
// combo, otherwise just the active cell on its own.
function pulseKeys() {
  if (state.over || !state.activePos || !state.current) return new Set();
  const group = previewMergeGroup();
  const keys = new Set([state.activePos.r + ',' + state.activePos.c]);
  for (const [r, c] of group) keys.add(r + ',' + c);
  return keys;
}

function paintBoard() {
  const cells = el.board.children;
  const pulse = pulseKeys();
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      const cell = cells[r * state.size + c];
      let cls = 'cell';
      const pulsing = pulse.has(r + ',' + c);

      if (isStorehouse(r, c)) {
        // Top-left storehouse: shows the reserved piece, or a ring when empty.
        cell.textContent = tileContent(state.reserve);
        cls += ' storehouse';
        if (state.reserve) cls += ' filled tile-' + state.reserve;
        else cls += ' empty-store';
        cell.title = state.reserve ? NAMES[state.reserve] : 'Storehouse — tap to store/swap';
      } else if (isActive(r, c) && state.current) {
        // The piece waiting to be placed: sits on a path tile, pulsing.
        cell.textContent = tileContent(state.current);
        cls += ' path tile-' + state.current;
        if (pulsing) cls += ' pulsing';
        cell.title = NAMES[state.current] + ' — tap any tile to place';
      } else {
        const type = state.board[r][c];
        cell.textContent = tileContent(type);
        // Empty tiles read as a light "path"; filled tiles blend into the field.
        cls += type ? ' filled tile-' + type : ' path';
        // A filled tile that's part of the pending merge pulses with the piece.
        if (type && pulsing) cls += ' pulsing';
        if (type && state.lastCreated &&
            state.lastCreated.r === r && state.lastCreated.c === c) {
          cls += ' pop';
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
      `<span class="store-glyph">${ASSETS[type]}</span>` +
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

// Redraw everything. Handlers are passed through so render stays presentation-only.
export function render({ onBuy }) {
  paintBoard();
  paintHud();
  paintStore(onBuy);
  paintOverlay();
  // Consume the one-shot pop marker so it doesn't re-animate next frame.
  state.lastCreated = null;
}
