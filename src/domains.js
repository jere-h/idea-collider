// Canonical, CLOSED list of industry/category tags (TRD §Data model).
// v2 re-bases the corpus from abstract academic fields onto CONCRETE industries
// and brand categories — "IKEA × gyms" lands in a way "Biology × Sociology"
// never did. This is the "of 20" denominator for the industries-bridged metric
// and the content-lint's "exactly 2 differing categories per card" check.
//
// Names are kept short (they show as small tags after a card's reveal). The
// export names below stay `DOMAINS`/`domainsBridged`/`isDomain` to avoid churn
// across deckEngine, storage, and tests; the *meaning* is now "industry".
export const DOMAINS = [
  'Airlines', 'Fast food', 'Fitness', 'Streaming', 'Warehouse retail',
  'Furniture', 'Banking', 'Dating apps', 'Theme parks', 'Motorsport',
  'Beverages', 'Software', 'Grocery', 'Government', 'Hospitality',
  'Education apps', 'Toys & games', 'Funerals', 'E-commerce', 'Coffee',
];

export const DOMAIN_COUNT = DOMAINS.length; // exactly 20

export function isDomain(value) {
  return DOMAINS.includes(value);
}

// Distinct industries the user has "bridged" — counted only from saved sparks.
// Capped at DOMAIN_COUNT; never counts a swipe.
export function domainsBridged(sparks) {
  const set = new Set();
  for (const spark of sparks) {
    for (const d of spark.domains || []) {
      if (isDomain(d)) set.add(d);
    }
  }
  return Math.min(set.size, DOMAIN_COUNT);
}
