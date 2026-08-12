// gestures.js — bears fidget in place, like the original game.
//
// In the original the board is ALIVE: bears constantly scratch, stamp, hop,
// spin, bounce, look around, nod, and lean, and several move at once. So this is
// deliberately lively — a fresh gesture starts every ~1-2.8s (board-wide), a
// random idle bear gets it, and up to MAX_CONCURRENT bears animate at the same
// time (each doing its own thing, which reads as a busy scene, not a glitch).
//
// The countdown is global rather than attached to a DOM cell, because bears
// shuffle to a new tile on every placement — a cell-bound timer would reset
// constantly and rarely survive long enough to fire.

const GESTURES = ['lean', 'wiggle', 'scratch', 'stamp',
  'hop', 'spin', 'bounce', 'look', 'nod'];
const GESTURE_CLASSES = GESTURES.map((g) => 'gesture-' + g);

// How often a new gesture starts, board-wide (random within the range).
export const GESTURE_MIN_MS = 1000;
export const GESTURE_MAX_MS = 2800;

// Up to this many bears may fidget at the same time (a lively, busy board).
const MAX_CONCURRENT = 3;

const LONGEST_MS = 1500;   // longest gesture animation, for the cleanup fallback
const TICK_MS = 300;

function randomDelay() {
  return GESTURE_MIN_MS + Math.random() * (GESTURE_MAX_MS - GESTURE_MIN_MS);
}

function isGesturing(cell) {
  return GESTURE_CLASSES.some((c) => cell.classList.contains(c));
}

function play(cell) {
  const cls = 'gesture-' + GESTURES[Math.floor(Math.random() * GESTURES.length)];
  cell.classList.add(cls);
  const done = () => cell.classList.remove(cls);
  cell.addEventListener('animationend', done, { once: true });
  // Fallback: animationend doesn't fire while the tab is hidden.
  setTimeout(done, LONGEST_MS + 300);
}

let nextAt = 0;       // when the next gesture may start (one countdown, board-wide)
let timer = null;

function tick(getBearCells) {
  if (document.hidden) return;
  const now = performance.now();
  if (!nextAt) { nextAt = now + randomDelay(); return; }
  if (now < nextAt) return;

  const cells = getBearCells();
  const busy = cells.filter(isGesturing).length;
  const idle = cells.filter((c) => !isGesturing(c));
  // Start one more, as long as we're under the concurrency cap and someone's free.
  if (idle.length && busy < MAX_CONCURRENT) {
    play(idle[Math.floor(Math.random() * idle.length)]);
  }
  nextAt = now + randomDelay();   // keep it lively — overlapping gestures welcome
}

// getBearCells() returns the cells holding a settled bear (see render.js).
export function startGestures(getBearCells) {
  if (timer) return;
  timer = setInterval(() => tick(getBearCells), TICK_MS);
}
