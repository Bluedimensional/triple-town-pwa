// main.js — bootstrap: wire input, kick off the game, register the service worker.

import { state } from './state.js';
import { VERSION } from './config.js';
import { placePiece, newGame, undoMove, armBomb, toggleBomb, bombAt, expireTimer, chooseCrystal, cancelCrystal, chooseCharm } from './game.js';
import { swapReserve } from './storehouse.js';
import { buyItem } from './store.js';
import { save, load } from './persistence.js';
import { cacheDom, buildBoard, render, bearCells, openScores, closeScores, paintClock } from './render.js';
import { startGestures } from './gestures.js';
import { startVillagers } from './villagers.js';

function draw() {
  render({ onBuy, onSwap });
}

// Tapping a board tile: in bomb-aim mode it detonates on a Rock/Bear (or cancels
// on anything else); otherwise it places the held piece there.
function onCellTap(r, c) {
  if (state.over) return;
  if (state.crystalChoice) return;   // the chooser (modal) handles taps
  if (state.charmChoices.length) return;   // pick a charm first
  if (state.armed) { bombAt(r, c); draw(); return; }
  if (placePiece(r, c)) draw();
}

// Long-press on the held piece arms a regular bomb (when one is banked).
function onArm() {
  if (armBomb('bomb')) draw();
}

// Tapping an (unlocked) storage slot swaps/stashes the held piece.
function onSwap(i) {
  swapReserve(i);
  save();
  draw();
}

function onBuy(type) {
  if (buyItem(type)) {
    save();
    draw();
  }
}

// Start a new game at the given dimensions, rebuilding the grid for it.
function onNewGame(cols, rows) {
  if (!state.over &&
      !confirm(`Start a new ${cols}×${rows} game? Current progress will be lost.`)) return;
  newGame(cols, rows);
  buildBoard(onCellTap, onArm);   // rebuild the DOM grid for the (possibly new) size
  draw();
  markCurrentSize();
}

// Switch timed mode = start a fresh game at that length (prompted restart), since
// a game already underway can't change its clock.
function onNewTimeMode(mode) {
  if (mode === state.timeMode && !state.over) return;   // already this mode, nothing to do
  const label = mode ? mode + '-min' : 'Endless';
  if (!state.over && !confirm(`Leave this game and start a new ${label} game?`)) return;
  state.pendingTimeMode = mode;
  newGame(state.cols, state.rows);
  buildBoard(onCellTap, onArm);
  draw();
  markTime();
  markCurrentSize();
}

// Highlight the size button matching the current board.
function markCurrentSize() {
  document.querySelectorAll('#new-controls .size-btn').forEach((b) => {
    b.classList.toggle('current',
      Number(b.dataset.cols) === state.cols && Number(b.dataset.rows) === state.rows);
  });
}

// Highlight the crystal-density button matching the pending choice.
function markCrystal() {
  document.querySelectorAll('#crystal-controls .crys-btn').forEach((b) => {
    b.classList.toggle('current', Number(b.dataset.mult) === state.pendingCrystalMult);
  });
}

// Highlight the timed-mode button matching the pending choice.
function markTime() {
  document.querySelectorAll('#time-controls .time-btn').forEach((b) => {
    b.classList.toggle('current', Number(b.dataset.time) === state.pendingTimeMode);
  });
}

// The countdown clock for timed games. Ticks in real time while the game is
// active and the tab is visible; pauses when hidden. Ends the game at zero.
let lastClockTick = 0;
function clockTick() {
  const now = performance.now();
  const dt = now - lastClockTick;
  lastClockTick = now;
  if (document.hidden || state.over) return;
  state.elapsedMs = (state.elapsedMs || 0) + dt;   // active play time (both modes)
  if (state.timeMode && state.timeLeftMs != null) {
    state.timeLeftMs -= dt;
    if (state.timeLeftMs <= 0) {
      state.timeLeftMs = 0;
      expireTimer();   // ends the game, records the score, saves
      draw();          // full re-render to show the game-over overlay
    } else {
      paintClock();    // lightweight HUD update between placements
    }
  }
}

function boot() {
  cacheDom();
  document.getElementById('version').textContent = VERSION;

  const restored = load();
  // Start fresh if there's no valid in-progress game to resume — UNLESS a charm
  // choice is pending (current/activePos are null on purpose until a charm is
  // picked), in which case the saved chooser is restored as-is.
  const charmPending = state.charmChoices.length > 0;
  if (!charmPending && (!restored || state.current === null || state.activePos === null)) {
    if (!state.over) newGame(state.pendingCols, state.pendingRows);
  }

  buildBoard(onCellTap, onArm);   // built AFTER the size is known (restored or new)

  // All size buttons (toolbar + game-over) start a new game at their dimensions.
  document.querySelectorAll('.size-btn').forEach((btn) => {
    btn.addEventListener('click', () =>
      onNewGame(Number(btn.dataset.cols), Number(btn.dataset.rows)));
  });

  // Crystal-density buttons take effect immediately (even mid-game) AND set the
  // choice for the next new game.
  document.querySelectorAll('#crystal-controls .crys-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const m = Number(btn.dataset.mult);
      state.pendingCrystalMult = m;
      state.crystalMult = m;        // live: the current game's spawns use it now
      save();
      markCrystal();
    });
  });
  markCrystal();

  // Timed-mode buttons: changing the timer means a fresh game, so this is a
  // prompted restart (you can't switch a game already in progress to/from timed).
  document.querySelectorAll('#time-controls .time-btn').forEach((btn) => {
    btn.addEventListener('click', () => onNewTimeMode(Number(btn.dataset.time)));
  });
  markTime();

  // Dismiss the game-over popup — the backdrop, the ✕, or the "view my board"
  // button all just hide it so you can look at the finished board. Starting a new
  // game is still available from the New buttons in the toolbar above.
  const overlay = document.getElementById('gameover');
  const dismissOver = () => { state.overlayDismissed = true; draw(); };
  overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay) dismissOver(); });
  document.getElementById('over-close').addEventListener('pointerdown', (e) => { e.stopPropagation(); dismissOver(); });
  document.getElementById('over-view').addEventListener('pointerdown', (e) => { e.stopPropagation(); dismissOver(); });

  // High-scores modal: the Best stat opens it; backdrop tap or Close hides it.
  document.getElementById('best-stat').addEventListener('pointerdown', openScores);
  const scoresModal = document.getElementById('scores-modal');
  scoresModal.addEventListener('pointerdown', (e) => {
    if (e.target === scoresModal) closeScores();
  });
  document.getElementById('scores-close').addEventListener('pointerdown', closeScores);

  // Undo button: take back the last move (spends one earned undo).
  document.getElementById('undo-btn').addEventListener('pointerdown', () => {
    if (undoMove()) draw();
  });

  // Bomb button: arm/disarm regular bomb-aim mode (also via long-press on the
  // held piece). While armed, tap a Rock or Bear on the board to blow it up.
  document.getElementById('bomb-btn').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    toggleBomb('bomb');
    draw();
  });

  // Crystal-choice overlay: tap an option to complete that merge; tap the dim
  // backdrop to back out (the crystal returns to your hand).
  document.getElementById('crystal-opts').addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.cc-opt');
    if (!btn) return;
    if (chooseCrystal(btn.dataset.type)) draw();
  });
  const crystalOverlay = document.getElementById('crystal-choice');
  crystalOverlay.addEventListener('pointerdown', (e) => {
    if (e.target === crystalOverlay) { cancelCrystal(); draw(); }
  });

  // Start-of-run charm chooser: tap a card to lock that charm in and deal the
  // board. No backdrop dismiss — you must pick one to start the run.
  document.getElementById('charm-opts').addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.charm-opt');
    if (!btn) return;
    if (chooseCharm(btn.dataset.charm)) draw();
  });

  draw();
  markCurrentSize();
  startGestures(bearCells);   // bears fidget in place between placements
  startVillagers(() => document.getElementById('board'));   // townsfolk stroll about

  // Timed-mode countdown: tick in real time; pause & save when the tab hides so
  // no time is spent off-screen (and a reload resumes where it left off).
  lastClockTick = performance.now();
  setInterval(clockTick, 250);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) save();
    else lastClockTick = performance.now();   // don't count time spent hidden
  });

  requestPersistentStorage(); // ask the browser not to evict our saved scores
  registerServiceWorker();
}

// Ask the browser to keep our localStorage (scores + save) persistent so it
// isn't evicted — most reliably granted when installed to the home screen.
function requestPersistentStorage() {
  try { navigator.storage?.persist?.(); } catch (e) { /* not supported — ignore */ }
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
