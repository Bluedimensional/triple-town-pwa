// villagers.js — decorative townsfolk. Every so often a little person (a waist-up
// figure, no legs) wanders out of a residential building, meanders a tile or two
// along the open path, and heads back inside — sometimes lingering longer,
// sometimes ducking into a DIFFERENT building instead of home. Each trip gets its
// own randomized path + timing via the Web Animations API, so no two look alike.
//
// Purely cosmetic: villagers are absolutely-positioned DOM overlays on the board
// (like the merge-slide ghosts), never touch game state, and pause while hidden.

import { state } from './state.js';
import { baseType } from './match.js';

// Buildings people live in / visit (super variants count too, via baseType).
const RESIDENTIAL = new Set(['hut', 'house', 'mansion', 'castle', 'megaCastle',
  'kingdom', 'metropolis']);
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// A new villager appears every 2.2–5.5s, board-wide, random within the range.
export const VILLAGER_MIN_MS = 2200;
export const VILLAGER_MAX_MS = 5500;
const MAX_CONCURRENT = 3;         // up to this many strolling at once
const MAX_STEPS = 3;              // how far a villager may wander (tiles)
const ENTER_OTHER_CHANCE = 0.28;  // chance to end inside a different building
const TICK_MS = 500;

// A few interchangeable looks (tunic, skin, hair) so the town isn't all clones.
const LOOKS = [
  ['#c0533f', '#e8b98f', '#4a3524'],
  ['#3f6cc0', '#c98a5c', '#211a13'],
  ['#4f9d5a', '#f0cba0', '#b98a3a'],
  ['#b58a30', '#a5683d', '#211a13'],
  ['#8a4fc0', '#e8b98f', '#4a3524'],
  ['#3f9dae', '#c98a5c', '#6a4a2a'],
];

// A waist-up figure: rounded torso + head + hair, no legs.
function villagerSVG([tunic, skin, hair]) {
  return `<svg viewBox="0 0 40 42" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="39" rx="9.5" ry="2.6" fill="#081405" opacity="0.28"/>
    <path d="M10.5 39 Q9.5 21 20 21 Q30.5 21 29.5 39 Z" fill="${tunic}" stroke="#241b10" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="20" cy="13" r="8" fill="${skin}" stroke="#241b10" stroke-width="1.4"/>
    <path d="M12.4 11 Q14 3 20 3 Q26 3 27.6 11 Q20 6.5 12.4 11 Z" fill="${hair}"/>
  </svg>`;
}

// On the space/cosmic levels the townsfolk suit up: astronauts (white suit + a
// visored helmet) and little green aliens (antennae + big black eyes).
function villagerAstronaut() {
  return `<svg viewBox="0 0 40 42" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="39" rx="9.5" ry="2.6" fill="#081405" opacity="0.28"/>
    <path d="M10.5 39 Q9.5 21 20 21 Q30.5 21 29.5 39 Z" fill="#eef2f6" stroke="#3f4a56" stroke-width="1.4" stroke-linejoin="round"/>
    <rect x="16" y="26" width="8" height="5" rx="1.2" fill="#c94f3a" stroke="#5a2318" stroke-width="0.8"/>
    <circle cx="20" cy="12" r="9" fill="#f3f6f9" stroke="#3f4a56" stroke-width="1.6"/>
    <ellipse cx="20" cy="12.5" rx="6.2" ry="5" fill="#243a52" stroke="#16222f" stroke-width="1"/>
    <ellipse cx="17.4" cy="10.6" rx="1.9" ry="1.2" fill="#8fc4e8" opacity="0.75"/>
  </svg>`;
}
function villagerAlien() {
  return `<svg viewBox="0 0 40 42" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="39" rx="9.5" ry="2.6" fill="#081405" opacity="0.28"/>
    <g stroke="#3a6a24" stroke-width="1.4" stroke-linecap="round"><line x1="15.5" y1="6" x2="13.5" y2="1.5"/><line x1="24.5" y1="6" x2="26.5" y2="1.5"/></g>
    <circle cx="13.5" cy="1.5" r="1.5" fill="#8fd45a" stroke="#3a6a24" stroke-width="0.8"/>
    <circle cx="26.5" cy="1.5" r="1.5" fill="#8fd45a" stroke="#3a6a24" stroke-width="0.8"/>
    <path d="M10.5 39 Q9.5 21 20 21 Q30.5 21 29.5 39 Z" fill="#6a5fd0" stroke="#241b40" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="20" cy="13" r="8.4" fill="#84c85a" stroke="#3a6a24" stroke-width="1.4"/>
    <g fill="#131313"><ellipse cx="16.2" cy="13" rx="2.1" ry="3.3" transform="rotate(-20 16.2 13)"/><ellipse cx="23.8" cy="13" rx="2.1" ry="3.3" transform="rotate(20 23.8 13)"/></g>
  </svg>`;
}
// Pick a look for the current level's theme.
function villagerHTML() {
  const field = document.body.dataset.field;
  if (field === 'space' || field === 'cosmic') {
    const roll = Math.random();
    if (roll < 0.45) return villagerAstronaut();
    if (roll < 0.82) return villagerAlien();
  }
  const html = villagerSVG(LOOKS[lookIdx % LOOKS.length]);
  lookIdx++;
  return html;
}

function inBounds(r, c) {
  return r >= 0 && r < state.rows && c >= 0 && c < state.cols;
}

// A random walk of empty tiles out from (r,c): 1..MAX_STEPS steps, no revisits.
// Mixed axes and lengths fall out naturally.
function randomWalk(r, c) {
  const steps = 1 + Math.floor(Math.random() * MAX_STEPS);
  const path = [];
  const seen = new Set([r + ',' + c]);
  let cr = r, cc = c;
  for (let i = 0; i < steps; i++) {
    const opts = DIRS
      .map(([dr, dc]) => [cr + dr, cc + dc])
      .filter(([nr, nc]) => inBounds(nr, nc) && state.board[nr][nc] === null && !seen.has(nr + ',' + nc));
    if (!opts.length) break;
    const [nr, nc] = opts[Math.floor(Math.random() * opts.length)];
    path.push([nr, nc]);
    seen.add(nr + ',' + nc);
    cr = nr; cc = nc;
  }
  return path;
}

let active = 0, nextAt = 0, timer = null, getBoard = null, lookIdx = 0;
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function delay() {
  return VILLAGER_MIN_MS + Math.random() * (VILLAGER_MAX_MS - VILLAGER_MIN_MS);
}

function spawn() {
  const board = getBoard && getBoard();
  if (!board || !board.clientWidth) return;

  // Residential cells with at least one adjacent empty (path) tile.
  const cands = [];
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (!RESIDENTIAL.has(baseType(state.board[r][c]))) continue;
      if (DIRS.some(([dr, dc]) => inBounds(r + dr, c + dc) && state.board[r + dr][c + dc] === null)) {
        cands.push([r, c]);
      }
    }
  }
  if (!cands.length) return;

  const [r, c] = cands[Math.floor(Math.random() * cands.length)];
  const path = randomWalk(r, c);
  if (!path.length) return;
  const size = board.clientWidth / state.cols;
  const off = (rr, cc) => [((cc - c) * size), ((rr - r) * size)];
  const outPts = path.map(([wr, wc]) => off(wr, wc));

  // Occasionally the trip ends inside a DIFFERENT building next to the last tile.
  let otherOff = null;
  if (Math.random() < ENTER_OTHER_CHANCE) {
    const [lr, lc] = path[path.length - 1];
    const others = DIRS
      .map(([dr, dc]) => [lr + dr, lc + dc])
      .filter(([nr, nc]) => inBounds(nr, nc) && !(nr === r && nc === c) &&
        RESIDENTIAL.has(baseType(state.board[nr][nc])));
    if (others.length) otherOff = off(...others[Math.floor(Math.random() * others.length)]);
  }

  const v = document.createElement('div');
  v.className = 'villager';
  v.style.left = (c * size) + 'px';
  v.style.top = (r * size) + 'px';
  v.style.width = size + 'px';
  v.style.height = size + 'px';
  v.innerHTML = villagerHTML();

  const tf = (o, s) => `translate(${o[0].toFixed(1)}px, ${o[1].toFixed(1)}px) scale(${s})`;
  const ORIGIN = [0, 0];
  let kf, dur;

  if (reduceMotion()) {
    // Minimal: just appear at the door and fade — no walking.
    kf = [
      { offset: 0, transform: tf(ORIGIN, 1), opacity: 0 },
      { offset: 0.25, transform: tf(ORIGIN, 1), opacity: 1 },
      { offset: 0.75, transform: tf(ORIGIN, 1), opacity: 1 },
      { offset: 1, transform: tf(ORIGIN, 1), opacity: 0 },
    ];
    dur = 2600;
  } else if (otherOff) {
    // One-way stroll into a neighbouring building.
    const pts = [...outPts, otherOff];
    const emerge = 0.07, walkEnd = 0.9;
    kf = [
      { offset: 0, transform: tf(ORIGIN, 0.35), opacity: 0 },
      { offset: emerge, transform: tf(ORIGIN, 1), opacity: 1 },
    ];
    pts.forEach((p, i) => {
      kf.push({ offset: emerge + (walkEnd - emerge) * ((i + 1) / pts.length), transform: tf(p, 1), opacity: 1 });
    });
    kf.push({ offset: 1, transform: tf(otherOff, 0.35), opacity: 0 });
    dur = 2800 + pts.length * 800 + Math.random() * 1400;
  } else {
    // Out to the far tile, linger (variable), then back home.
    const emerge = 0.07, vanish = 0.07;
    const dwell = 0.08 + Math.random() * 0.34;           // "stay out longer" varies
    const walk = (1 - emerge - vanish - dwell) / 2;
    const n = outPts.length;
    kf = [
      { offset: 0, transform: tf(ORIGIN, 0.35), opacity: 0 },
      { offset: emerge, transform: tf(ORIGIN, 1), opacity: 1 },
    ];
    outPts.forEach((p, i) => {
      kf.push({ offset: emerge + walk * ((i + 1) / n), transform: tf(p, 1), opacity: 1 });
    });
    const dwellEnd = emerge + walk + dwell;
    kf.push({ offset: dwellEnd, transform: tf(outPts[n - 1], 1), opacity: 1 });
    const back = [...outPts.slice(0, -1).reverse(), ORIGIN];
    back.forEach((p, j) => {
      kf.push({ offset: dwellEnd + walk * ((j + 1) / back.length), transform: tf(p, 1), opacity: 1 });
    });
    kf.push({ offset: 1, transform: tf(ORIGIN, 0.35), opacity: 0 });
    dur = 2800 + n * 900 + Math.random() * 1600;
  }

  active++;
  const done = () => { v.remove(); active = Math.max(0, active - 1); };
  const anim = v.animate(kf, { duration: dur, easing: 'ease-in-out', fill: 'forwards' });
  anim.onfinish = done;
  setTimeout(done, dur + 500);      // fallback if onfinish doesn't fire (e.g. hidden)
  board.appendChild(v);
}

function tick() {
  if (document.hidden) return;
  const now = performance.now();
  if (!nextAt) { nextAt = now + delay(); return; }
  if (now < nextAt) return;
  if (active < MAX_CONCURRENT) spawn();
  nextAt = now + delay();
}

// getBoardEl() returns the #board element to overlay villagers onto.
export function startVillagers(getBoardEl) {
  if (timer) return;
  getBoard = getBoardEl;
  timer = setInterval(tick, TICK_MS);
}
