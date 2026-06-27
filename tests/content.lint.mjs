// Content lint for the card pool (TRD §Test strategy·content/rubric check).
// v2: cards are brand/industry collisions with a single `reveal` payoff line —
// no glosses, no Socratic questions. Fails CI if a card violates the schema, the
// two-differing-categories rule, or the reveal-quality budget.
// Run: node tests/content.lint.mjs
import { CARD_POOL } from '../src/cards.js';
import { DOMAINS } from '../src/domains.js';
import { GRAMMARS } from '../src/provocation.js';

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
// "The Catch" provocation budget (docs/trd-the-catch.md §7).
const QUESTION_MIN_WORDS = 4;
const QUESTION_MAX_WORDS = 24;
const GRAMMAR_SET = new Set(GRAMMARS);
const VERB_RE = /^[a-z][a-z-]*[a-z]$/;
const SECOND_PERSON_RE = /\byou(r|rself)?\b/i;
const errors = [];
let provokedCount = 0;
const grammarsSeen = new Set();
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

  // ----- "The Catch" provocation (optional, but all-or-nothing) -----
  const hasAny = c.question !== undefined || c.verb !== undefined || c.grammar !== undefined;
  if (hasAny) {
    if (c.question === undefined || c.verb === undefined || c.grammar === undefined) {
      errors.push(`${where}: provocation must define ALL of question/verb/grammar (or none)`);
    }
    // grammar: one of the allowed shapes; 'accusation' was cut in user testing.
    if (c.grammar === 'accusation') {
      errors.push(`${where}: grammar "accusation" is banned (read as scolding / ESL-hostile)`);
    } else if (!GRAMMAR_SET.has(c.grammar)) {
      errors.push(`${where}: unknown grammar "${c.grammar}" (allowed: ${GRAMMARS.join(', ')})`);
    }
    // verb: lowercase kebab tag, <= 4 hyphen-separated parts.
    if (typeof c.verb !== 'string' || !VERB_RE.test(c.verb)) {
      errors.push(`${where}: verb "${c.verb}" must be a lowercase kebab tag`);
    } else if (c.verb.split('-').length > 4) {
      errors.push(`${where}: verb "${c.verb}" is too long (max 4 words)`);
    }
    // question: a single second-person interrogative.
    if (typeof c.question !== 'string') {
      errors.push(`${where}: question must be a string`);
    } else {
      const q = c.question.trim();
      const qWords = q.split(/\s+/).length;
      if (qWords < QUESTION_MIN_WORDS) errors.push(`${where}: question too short (${qWords} words)`);
      if (qWords > QUESTION_MAX_WORDS) errors.push(`${where}: question too long (${qWords} > ${QUESTION_MAX_WORDS} words)`);
      const qMarks = (q.match(/\?/g) || []).length;
      if (qMarks !== 1 || !q.endsWith('?')) errors.push(`${where}: question must be ONE interrogative ending in a single "?"`);
      if (/[.!]/.test(q)) errors.push(`${where}: question must be a single sentence (no . or !)`);
      if (!SECOND_PERSON_RE.test(q)) errors.push(`${where}: question must be second-person (use "you"/"your")`);
    }
    if (GRAMMAR_SET.has(c.grammar)) grammarsSeen.add(c.grammar);
    provokedCount++;
  }
}

// Pool-level provocation variety (guards horoscope decay; PRD targets ~half of the pool).
const MIN_PROVOKED = 8;
if (provokedCount < MIN_PROVOKED) {
  errors.push(`pool: only ${provokedCount} provoked cards (need >= ${MIN_PROVOKED})`);
}
for (const g of GRAMMARS) {
  if (!grammarsSeen.has(g)) errors.push(`pool: grammar "${g}" is unused (all shapes must appear)`);
}

const ids = CARD_POOL.cards.map((c) => c.id);
if (new Set(ids).size !== ids.length) errors.push('duplicate card ids in pool');

if (errors.length) {
  console.error(`Content lint FAILED (${errors.length}):`);
  errors.forEach((e) => console.error('  ✗ ' + e));
  process.exit(1);
}
console.log(`Content lint passed — ${CARD_POOL.cards.length} cards clean.`);
