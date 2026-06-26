// Content lint for the card pool (TRD §Test strategy·content/rubric check).
// v2: cards are brand/industry collisions with a single `reveal` payoff line —
// no glosses, no Socratic questions. Fails CI if a card violates the schema, the
// two-differing-categories rule, or the reveal-quality budget.
// Run: node tests/content.lint.mjs
import { CARD_POOL } from '../src/cards.js';
import { DOMAINS } from '../src/domains.js';

// A good reveal names a mechanism in one tight sentence. These patterns smell
// like the failure modes user testing flagged: smug "lesson" morals and lazy
// "both are X" restatements of the obvious.
const SMELLS = [
  /\bthe lesson (is|here)\b/i,
  /\bteaches us\b/i,
  /\bwhich just goes to show\b/i,
];
const REVEAL_MIN_WORDS = 8;
const REVEAL_MAX_WORDS = 30;
const errors = [];
const domainSet = new Set(DOMAINS);

for (const c of CARD_POOL.cards) {
  const where = `card ${c.id}`;
  for (const side of ['a', 'b']) {
    const f = c[side];
    if (!f || !f.title || !f.domain) errors.push(`${where}.${side}: missing title/domain`);
    if (f && !domainSet.has(f.domain)) errors.push(`${where}.${side}: unknown category "${f && f.domain}"`);
  }
  if (c.a && c.b && c.a.domain === c.b.domain) {
    errors.push(`${where}: both sides share category "${c.a.domain}" (must differ)`);
  }
  if (!c.reveal || typeof c.reveal !== 'string') {
    errors.push(`${where}: missing reveal line`);
  } else {
    const words = c.reveal.trim().split(/\s+/).length;
    if (words < REVEAL_MIN_WORDS) errors.push(`${where}: reveal too short (${words} words)`);
    if (words > REVEAL_MAX_WORDS) errors.push(`${where}: reveal too long (${words} > ${REVEAL_MAX_WORDS} words)`);
    // One sentence: at most one terminal punctuation mark, not mid-text.
    const terminals = (c.reveal.match(/[.!?](\s|$)/g) || []).length;
    if (terminals > 1) errors.push(`${where}: reveal should be one sentence (found ${terminals} sentence breaks)`);
    for (const pat of SMELLS) {
      if (pat.test(c.reveal)) errors.push(`${where}: reveal hits a "lesson"/filler smell ${pat}`);
    }
  }
}

const ids = CARD_POOL.cards.map((c) => c.id);
if (new Set(ids).size !== ids.length) errors.push('duplicate card ids in pool');

if (errors.length) {
  console.error(`Content lint FAILED (${errors.length}):`);
  errors.forEach((e) => console.error('  ✗ ' + e));
  process.exit(1);
}
console.log(`Content lint passed — ${CARD_POOL.cards.length} cards clean.`);
