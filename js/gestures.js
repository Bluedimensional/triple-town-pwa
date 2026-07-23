// gestures.js — bears fidget in place, like the original game.
//
// In the original, a bear every so often scratches an itch, stamps the ground,
// throws a little karate move, or leans about. Timing comes from play
// observation: a gesture every 5-15s, at random within that range.
//
// The 5-15s cadence is BOARD-WIDE, not per-bear: one bear fidgets, then nothing
// happens anywhere for another 5-15s. Giving every bear its own countdown makes
// a crowded board twitch constantly (measured: ~2.8s between gestures with five
// bears) and lets two animate at once, which reads as a glitch.
//
// The countdown is also global rather than attached to a DOM cell, because bears
// shuffle to a new tile on every placement — a cell-bound timer would reset
// constantly and rarely survive long enough to fire.

const GESTURES = ['lean', 'wiggle', 'scratch', 'stamp'];
const GESTURE_CLASSES = GESTURES.map((g) => 'gesture-' + g);

export const GESTURE_MIN_MS = 5000;
export const GESTURE_MAX_MS = 15000;

const LONGEST_MS = 1500;   // longest gesture animation, for the cleanup fallback
const TICK_MS = 400;

// If a gesture is somehow still running when the next is due, wait this long and
// retry rather than starting a second one. (Only ever one bear fidgets at a
// time — two at once reads as a glitch rather than as characters.)
const HOLD_MS = 700;

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
  // Never overlap: if a gesture is somehow still running, wait a beat and retry
  // rather than starting a second one.
  const idle = cells.filter((c) => !isGesturing(c));
  if (idle.length !== cells.length || !idle.length) {
    nextAt = now + HOLD_MS;
    return;
  }

  play(idle[Math.floor(Math.random() * idle.length)]);
  // Count the 5-15s from when this gesture FINISHES, so the still period the
  // player actually sees is the full 5-15s rather than 5-15s minus the animation.
  nextAt = now + LONGEST_MS + randomDelay();
}

// getBearCells() returns the cells holding a settled bear (see render.js).
export function startGestures(getBearCells) {
  if (timer) return;
  timer = setInterval(() => tick(getBearCells), TICK_MS);
}
