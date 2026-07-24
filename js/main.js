// main.js — bootstrap: wire input, kick off the game, register the service worker.

import { state, isStorehouse } from './state.js';
import { VERSION } from './config.js';
import { placePiece, newGame } from './game.js';
import { swapReserve } from './storehouse.js';
import { buyItem } from './store.js';
import { save, load } from './persistence.js';
import { cacheDom, buildBoard, render, bearCells, openScores, closeScores } from './render.js';
import { startGestures } from './gestures.js';

function draw() {
  render({ onBuy });
}

// A tap on the storehouse swaps; a tap on any other tile places the piece.
function onCellTap(r, c) {
  if (state.over) return;
  if (isStorehouse(r, c)) {
    swapReserve();
    save();
    draw();
    return;
  }
  if (placePiece(r, c)) draw();
}

function onBuy(type) {
  if (buyItem(type)) {
    save();
    draw();
  }
}

// Start a new game at the given size (6, 7, or 8), rebuilding the grid for it.
function onNewGame(size) {
  const changing = size && size !== state.size;
  if (!state.over &&
      !confirm(`Start a new ${size}×${size} game? Current progress will be lost.`)) return;
  newGame(size);
  buildBoard(onCellTap);   // rebuild the DOM grid for the (possibly new) size
  draw();
  markCurrentSize();
}

// Highlight the size button matching the current board.
function markCurrentSize() {
  document.querySelectorAll('#new-controls .size-btn').forEach((b) => {
    b.classList.toggle('current', Number(b.dataset.size) === state.size);
  });
}

function boot() {
  cacheDom();
  document.getElementById('version').textContent = VERSION;

  const restored = load();
  // Start fresh if there's no valid in-progress game to resume.
  if (!restored || state.current === null || state.activePos === null) {
    if (!state.over) newGame(state.pendingSize);
  }

  buildBoard(onCellTap);   // built AFTER the size is known (restored or new)

  // All size buttons (toolbar + game-over) start a new game at their size.
  document.querySelectorAll('.size-btn').forEach((btn) => {
    btn.addEventListener('click', () => onNewGame(Number(btn.dataset.size)));
  });

  // Tapping the dark backdrop (outside the card) dismisses the game-over popup.
  const overlay = document.getElementById('gameover');
  overlay.addEventListener('pointerdown', (e) => {
    if (e.target === overlay) { state.overlayDismissed = true; draw(); }
  });

  // High-scores modal: the Best stat opens it; backdrop tap or Close hides it.
  document.getElementById('best-stat').addEventListener('pointerdown', openScores);
  const scoresModal = document.getElementById('scores-modal');
  scoresModal.addEventListener('pointerdown', (e) => {
    if (e.target === scoresModal) closeScores();
  });
  document.getElementById('scores-close').addEventListener('pointerdown', closeScores);

  draw();
  markCurrentSize();
  startGestures(bearCells);   // bears fidget in place between placements
  registerServiceWorker();
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  // If a worker is already controlling this page, a controllerchange means a new
  // version took over — reload once so the new files are in use immediately.
  if (navigator.serviceWorker.controller) {
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Offline support just won't be available; game still runs.
    });
  });
}

document.addEventListener('DOMContentLoaded', boot);
