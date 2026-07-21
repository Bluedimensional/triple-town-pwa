// store.js — spend in-game coins on build-chain tiles at rising prices.

import { state } from './state.js';
import { STORE_BASE_PRICE, STORE_PRICE_GROWTH } from './config.js';

// Current price of a tile = base * growth^(times already bought).
export function priceOf(type) {
  const base = STORE_BASE_PRICE[type] || 0;
  const bought = state.storeBought[type] || 0;
  return Math.floor(base * Math.pow(STORE_PRICE_GROWTH, bought));
}

// Buy a tile. It becomes your held piece; any piece already in hand is tucked
// into the storehouse if it's free (otherwise it's discarded for the purchase).
// Returns true on success.
export function buyItem(type) {
  if (state.over) return false;
  const price = priceOf(type);
  if (price <= 0 || state.coins < price) return false;

  state.coins -= price;
  state.storeBought[type] = (state.storeBought[type] || 0) + 1;

  if (state.current !== null && state.reserve === null) {
    state.reserve = state.current;
  }
  state.current = type;
  return true;
}
