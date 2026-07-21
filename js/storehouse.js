// storehouse.js — the top-left reserve slot that holds one piece aside.
//
// A tile in the storehouse never matches with the board; you must take it out
// (swap it into your hand) and place it before it can merge.

import { state } from './state.js';
import { spawnNext } from './game.js';

// Swap the piece in hand with the piece in the storehouse.
// If the storehouse is empty, stash the current piece and draw a fresh one so
// you're never left with an empty hand.
export function swapReserve() {
  if (state.over) return;
  if (state.reserve === null) {
    state.reserve = state.current;
    state.current = null;
    spawnNext({ countTurn: false });
  } else {
    const held = state.current;
    state.current = state.reserve;
    state.reserve = held;
  }
}
