// Pure provocation logic — "The Catch" (TRD §3).
// On a subset of back-of-deck cards the reveal resolves into one hand-authored,
// second-person open QUESTION instead of ending on the closed mechanism. The bridge
// is meant to form in the user's head in the half-second before they swipe — we
// provoke it, we don't collect it. Nothing here touches the DOM or storage, so it
// unit-tests like deckEngine.js / streak.js.

// The only allowed question shapes. `accusation` was cut in user testing (read as
// scolding; confusing for non-native speakers) and is banned by the content lint.
export const GRAMMARS = ['point', 'inversion', 'dare'];

export const FRONT_FREE = 2;   // the first 2 RESOLVED cards/day stay pure fun-facts (the bait)
export const COLD_LIMIT = 3;   // after this many provocations shown-then-swiped cold, back off for the session
export const CLUSTER_MIN = 3;  // catches sharing a verb before the soft "You keep catching X" mirror shows

// Does this card carry a provocation at all?
export function hasProvocation(card) {
  return !!(card && typeof card.question === 'string' && card.question.trim());
}

/**
 * Decide whether to surface the provocation for the current top card.
 *   card       — the top card (may or may not have a question)
 *   done       — cards already RESOLVED today (deckProgress().done). The on-screen card
 *                is still pending and NOT counted, so done>=FRONT_FREE first holds on the
 *                3rd card the user reaches — i.e. cards 1 and 2 are always pure reveal.
 *   coldStreak — consecutive provocations shown-then-swiped WITHOUT a catch, this session.
 * Returns false (pure reveal) for a non-provocation card, the front of the deck, or once
 * the user has shown they aren't biting.
 */
export function shouldProvoke({ card, done, coldStreak }) {
  return hasProvocation(card)
    && (done || 0) >= FRONT_FREE
    && (coldStreak || 0) < COLD_LIMIT;
}

/**
 * Dominant verb across saved sparks, or null when nothing has clustered yet.
 * A SOFT, display-only signal (PRD §6): it powers the "You keep catching X" mirror, it is
 * NOT proof the feature works. Ties are broken by first-seen verb (deterministic, arbitrary).
 */
export function clusterVerb(sparks, min = CLUSTER_MIN) {
  const counts = new Map();
  for (const s of sparks || []) {
    if (!s || !s.verb) continue;
    counts.set(s.verb, (counts.get(s.verb) || 0) + 1);
  }
  let best = null;
  let bestN = 0;
  for (const [verb, n] of counts) {
    if (n > bestN) { best = verb; bestN = n; }
  }
  return bestN >= min ? best : null;
}
