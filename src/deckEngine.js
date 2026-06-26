// Pure deck logic (TRD §Components·deckEngine, §Risks).
// Deals the daily deck of 8 without replacement, deterministically seeded per
// (deviceId, localDay). NEVER mutates user state — swipe handlers do that.
//
// Contract:
//   - Same-day call returns the persisted deck unchanged (no re-deal on reload).
//   - A new day draws fresh, excluding EVERY previously dealt card (dealtEver),
//     so yesterday's un-swiped cards never silently reappear.
//   - First 3 decks lightly bias toward the user's home domains (~2x weight).
//   - If <8 unseen cards remain, deals a short deck (pool exhaustion / reshuffle
//     is a v1 concern, explicitly not built in v0).

export const DECK_SIZE = 8;
const BIAS_DAYS = 3;       // decks 1..3 get the home-domain bias
const BIAS_WEIGHT = 2;     // home-domain cards weighted ~2x

// Tiny deterministic string hash -> 32-bit int (FNV-1a). Named seed so the
// daily draw is reproducible and unit-testable.
export function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Mulberry32 PRNG — deterministic given a seed.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Weighted draw of up to `count` distinct items without replacement.
function weightedSample(items, weightOf, count, rand) {
  const pool = items.slice();
  const out = [];
  while (out.length < count && pool.length > 0) {
    let total = 0;
    for (const it of pool) total += weightOf(it);
    let r = rand() * total;
    let idx = 0;
    for (let i = 0; i < pool.length; i++) {
      r -= weightOf(pool[i]);
      if (r <= 0) { idx = i; break; }
      idx = i;
    }
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}

/**
 * Deal today's deck.
 * @param {{cards: Array}} pool        the full card pool (cards.js)
 * @param {object} userState          UserState (read-only here)
 * @param {string} todayLocalDay      'YYYY-MM-DD' in the user's local tz
 * @returns {{day, cards: Array<{id, status}>}}  the daily deck (persisted shape)
 */
export function deal(pool, userState, todayLocalDay) {
  // Same-day: return the already-dealt deck untouched (no re-draw on reload).
  if (userState.dailyDeck && userState.dailyDeck.day === todayLocalDay) {
    return userState.dailyDeck;
  }

  const dealtEver = new Set(userState.dealtEver || []);
  const unseen = pool.cards.filter((c) => !dealtEver.has(c.id));

  const deckNumber = (userState.deckHistoryCount || 0) + 1;
  const home = new Set(userState.homeDomains || []);
  const biasing = deckNumber <= BIAS_DAYS && home.size > 0;
  const weightOf = (card) => {
    if (!biasing) return 1;
    const touchesHome = home.has(card.a.domain) || home.has(card.b.domain);
    return touchesHome ? BIAS_WEIGHT : 1;
  };

  const seed = hashSeed(`${userState.deviceId}:${todayLocalDay}`);
  const rand = mulberry32(seed);
  const picked = weightedSample(unseen, weightOf, DECK_SIZE, rand);

  return {
    day: todayLocalDay,
    cards: picked.map((c) => ({ id: c.id, status: 'pending' })),
  };
}
