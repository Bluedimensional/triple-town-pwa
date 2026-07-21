// render.js — draw the board, hand, storehouse, store, and HUD from state.
//
// Uses glyphs from the swappable ASSETS map. To move to image sprites later,
// change tileGlyph() to emit an <img> (or a background-image) and nothing else
// in the game needs to change.

import { state } from './state.js';
import {
  ASSETS, NAMES, STORE_ITEMS,
} from './config.js';
import { priceOf } from './store.js';

const el = {};

export function cacheDom() {
  el.board = document.getElementById('board');
  el.hand = document.getElementById('hand-tile');
  el.reserve = document.getElementById('reserve-slot');
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
      cell.setAttribute('aria-label', `row ${r + 1} column ${c + 1}`);
      cell.addEventListener('click', () => onCellTap(r, c));
      el.board.appendChild(cell);
    }
  }
}

function paintBoard() {
  const cells = el.board.children;
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      const cell = cells[r * state.size + c];
      const type = state.board[r][c];
      cell.textContent = tileContent(type);
      cell.className = 'cell' + (type ? ' filled tile-' + type : '');
      if (state.lastCreated && state.lastCreated.r === r && state.lastCreated.c === c && type) {
        cell.classList.add('pop');
      }
    }
  }
}

function paintHud() {
  el.score.textContent = state.score.toLocaleString();
  el.best.textContent = state.best.toLocaleString();
  el.coins.textContent = state.coins.toLocaleString();

  el.hand.textContent = tileContent(state.current);
  el.hand.className = 'tile-slot' + (state.current ? ' filled tile-' + state.current : '');
  el.hand.title = state.current ? NAMES[state.current] : '';

  el.reserve.textContent = tileContent(state.reserve);
  el.reserve.className = 'tile-slot reserve' + (state.reserve ? ' filled tile-' + state.reserve : '');
  el.reserve.title = state.reserve ? NAMES[state.reserve] : 'Storehouse (tap to swap)';
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
