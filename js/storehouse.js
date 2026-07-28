// storehouse.js — the reserve slots in the row above the board.
//
// A piece in a slot never matches with the board; you must take it out (swap it
// into your hand) and place it before it can merge. Slots unlock by level, so a
// tap on a locked slot does nothing.

import { state, unlockedStorage } from './state.js';
import { spawnNext } from './game.js';

// Swap the piece in hand with the piece in storage slot `i`.
// If that slot is empty, stash the current piece there and draw a fresh one so
// you're never left with an empty hand.
export function swapReserve(i) {
  if (state.over) return;
  if (i < 0 || i >= unlockedStorage()) return;   // slot not unlocked yet
  if (state.reserves[i] === null) {
    state.reserves[i] = state.current;
    state.current = null;
    spawnNext({ countTurn: false });
  } else {
    const held = state.current;
    state.current = state.reserves[i];
    state.reserves[i] = held;
  }
}

// Tuck the current piece into the first empty unlocked slot, if any. Used when a
// store purchase replaces the held piece. Returns true if it was stashed.
export function stashCurrent() {
  if (state.current === null) return false;
  const n = unlockedStorage();
  for (let i = 0; i < n; i++) {
    if (state.reserves[i] === null) { state.reserves[i] = state.current; return true; }
  }
  return false;
}
