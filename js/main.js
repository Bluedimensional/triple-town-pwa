// main.js — bootstrap: wire input, kick off the game, register the service worker.

import { state } from './state.js';
import { placePiece, newGame } from './game.js';
import { swapReserve } from './storehouse.js';
import { buyItem } from './store.js';
import { save, load } from './persistence.js';
import { cacheDom, buildBoard, render } from './render.js';

function draw() {
  render({ onBuy });
}

function onCellTap(r, c) {
  if (placePiece(r, c)) draw();
}

function onReserveTap() {
  swapReserve();
  save();
  draw();
}

function onBuy(type) {
  if (buyItem(type)) {
    save();
    draw();
  }
}

function onNewGame() {
  if (!state.over && !confirm('Start a new game? Current progress will be lost.')) return;
  newGame();
  draw();
}

function boot() {
  cacheDom();
  buildBoard(onCellTap);

  const restored = load();
  if (!restored || state.current === null) {
    // Fresh start (or a save with no piece in hand somehow).
    if (!restored) newGame();
    else if (state.current === null && !state.over) newGame();
  }

  document.getElementById('reserve-slot').addEventListener('click', onReserveTap);
  document.getElementById('new-game').addEventListener('click', onNewGame);
  document.getElementById('play-again').addEventListener('click', () => { newGame(); draw(); });

  draw();
  registerServiceWorker();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {
        // Offline support just won't be available; game still runs.
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', boot);
