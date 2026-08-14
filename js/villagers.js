// villagers.js — decorative townsfolk. Every so often a little person strolls out
// of a residential building onto an adjacent path tile and back, then disappears
// inside again. Purely cosmetic: villagers are absolutely-positioned DOM overlays
// on the board (like the merge-slide ghosts), never touch game state, and pause
// while the tab is hidden. Modeled on the board-wide cadence of js/gestures.js.

import { state } from './state.js';
import { baseType } from './match.js';

// Buildings people live in / visit (super variants count too, via baseType).
const RESIDENTIAL = new Set(['hut', 'house', 'mansion', 'castle', 'megaCastle',
  'kingdom', 'metropolis']);
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// A new villager appears every 2.5–6s, board-wide, random within the range.
export const VILLAGER_MIN_MS = 2500;
export const VILLAGER_MAX_MS = 6000;
const MAX_CONCURRENT = 2;      // at most this many strolling at once
const STROLL_MS = 4200;        // one out-and-back trip (must match the CSS)
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

function villagerSVG([tunic, skin, hair]) {
  return `<svg viewBox="0 0 40 62" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="58" rx="10" ry="3" fill="#081405" opacity="0.3"/>
    <rect x="15.4" y="45" width="3.6" height="11" rx="1.4" fill="#3a2a18"/>
    <rect x="21" y="45" width="3.6" height="11" rx="1.4" fill="#3a2a18"/>
    <path d="M12.5 47 Q12 26 20 26 Q28 26 27.5 47 Z" fill="${tunic}" stroke="#241b10" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="20" cy="17" r="8" fill="${skin}" stroke="#241b10" stroke-width="1.4"/>
    <path d="M12.4 15 Q14 6 20 6 Q26 6 27.6 15 Q20 10.5 12.4 15 Z" fill="${hair}"/>
  </svg>`;
}

function inBounds(r, c) {
  return r >= 0 && r < state.rows && c >= 0 && c < state.cols;
}

let active = 0, nextAt = 0, timer = null, getBoard = null, lookIdx = 0;

function delay() {
  return VILLAGER_MIN_MS + Math.random() * (VILLAGER_MAX_MS - VILLAGER_MIN_MS);
}

function spawn() {
  const board = getBoard && getBoard();
  if (!board || !board.clientWidth) return;
  // Residential cells that have at least one adjacent EMPTY (path) tile to step onto.
  const cands = [];
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (!RESIDENTIAL.has(baseType(state.board[r][c]))) continue;
      const exits = [];
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (inBounds(nr, nc) && state.board[nr][nc] === null) exits.push([nr, nc]);
      }
      if (exits.length) cands.push([r, c, exits]);
    }
  }
  if (!cands.length) return;

  const [r, c, exits] = cands[Math.floor(Math.random() * cands.length)];
  const [er, ec] = exits[Math.floor(Math.random() * exits.length)];
  const size = board.clientWidth / state.cols;

  const v = document.createElement('div');
  v.className = 'villager';
  v.style.left = (c * size) + 'px';
  v.style.top = (r * size) + 'px';
  v.style.width = size + 'px';
  v.style.height = size + 'px';
  v.style.setProperty('--dx', ((ec - c) * size).toFixed(1) + 'px');
  v.style.setProperty('--dy', ((er - r) * size).toFixed(1) + 'px');
  const face = (ec - c) > 0 ? -1 : 1;     // face the way they're walking
  v.innerHTML = `<span class="v-fig" style="--face:${face}">${villagerSVG(LOOKS[lookIdx % LOOKS.length])}</span>`;
  lookIdx++;

  active++;
  const done = () => { v.remove(); active = Math.max(0, active - 1); };
  v.addEventListener('animationend', done, { once: true });
  setTimeout(done, STROLL_MS + 400);      // fallback (animationend won't fire if hidden)
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
