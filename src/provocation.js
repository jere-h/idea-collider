// Pure "verb-clustering" logic — the soft "You keep catching X" mirror (PRD §6).
// Every card now reveals a plain mechanism plus two always-shown application questions
// (authored in cards.js); this module no longer gates when a single question appears.
// What survives here is the SOFT, display-only signal: a subset of cards carry a `verb`
// (a short kebab mechanism tag), and when the user keeps saving cards that share a verb we
// surface "You keep catching <verb>" on the You tab. Nothing here touches the DOM or
// storage, so it unit-tests like deckEngine.js / streak.js.

export const CLUSTER_MIN = 3;  // saved cards sharing a verb before the soft mirror shows

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
