// gestures.js — bears fidget in place, like the original game.
//
// In the original, a bear every so often scratches an itch, stamps the ground,
// throws a little karate move, or leans about. Timing comes from play
// observation: a gesture every 5-15s, at random within that range.
//
// Scheduling is per-BEAR-SLOT, not per-cell: bears shuffle to a new tile on
// every placement, so a timer attached to a DOM cell would reset constantly and
// a bear would almost never reach its 5s. Instead we keep one countdown per
// bear on the board, and when one fires we pick a random idle bear to play it.

const GESTURES = ['lean', 'wiggle', 'scratch', 'stamp'];
const GESTURE_CLASSES = GESTURES.map((g) => 'gesture-' + g);

export const GESTURE_MIN_MS = 5000;
export const GESTURE_MAX_MS = 15000;

const LONGEST_MS = 1500;   // longest gesture animation, for the cleanup fallback
const TICK_MS = 400;

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

// One pending countdown per bear currently on the board.
let schedule = [];
let timer = null;

function tick(getBearCells) {
  if (document.hidden) return;
  const cells = getBearCells();
  const now = performance.now();

  // Match the number of countdowns to the number of bears. New bears start with
  // a fresh delay; surplus countdowns are dropped when bears are trapped.
  while (schedule.length < cells.length) schedule.push(now + randomDelay());
  if (schedule.length > cells.length) schedule.length = cells.length;

  for (let i = 0; i < schedule.length; i++) {
    if (now < schedule[i]) continue;
    schedule[i] = now + randomDelay();
    const idle = cells.filter((c) => !isGesturing(c));
    if (idle.length) play(idle[Math.floor(Math.random() * idle.length)]);
  }
}

// getBearCells() returns the cells holding a settled bear (see render.js).
export function startGestures(getBearCells) {
  if (timer) return;
  timer = setInterval(() => tick(getBearCells), TICK_MS);
}
