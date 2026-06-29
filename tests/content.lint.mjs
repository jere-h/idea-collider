// Content lint for the card pool (TRD §Test strategy·content/rubric check).
// Cards are brand/industry collisions with a single plain-language `reveal` payoff line
// PLUS exactly two always-shown, second-person application questions. Fails CI if a card
// violates the schema, the two-differing-categories rule, the reveal-quality budget, or the
// questions budget.
// Run: node tests/content.lint.mjs
import { CARD_POOL } from '../src/cards.js';
import { DOMAINS } from '../src/domains.js';

// A good reveal names a mechanism in one tight, plain sentence. These patterns smell
// like the failure modes user testing flagged: smug "lesson" morals and lazy
// "both are X" restatements of the obvious.
const SMELLS = [
  /\bthe lesson (is|here)\b/i,
  /\bteaches us\b/i,
  /\bwhich just goes to show\b/i,
];
const REVEAL_MIN_WORDS = 8;
const REVEAL_MAX_WORDS = 30;
// Application-question budget (two per card).
const QUESTION_MIN_WORDS = 4;
const QUESTION_MAX_WORDS = 24;
const QUESTIONS_PER_CARD = 2;
// `verb` (optional, on a subset) — the soft "You keep catching X" clustering tag.
const VERB_RE = /^[a-z][a-z-]*[a-z]$/;
const SECOND_PERSON_RE = /\byou(r|rself)?\b/i;
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

  // ----- application questions (exactly two, on EVERY card) -----
  if (!Array.isArray(c.questions)) {
    errors.push(`${where}: missing questions array`);
  } else {
    if (c.questions.length !== QUESTIONS_PER_CARD) {
      errors.push(`${where}: must have exactly ${QUESTIONS_PER_CARD} questions (found ${c.questions.length})`);
    }
    c.questions.forEach((q, i) => {
      const at = `${where}.questions[${i}]`;
      if (typeof q !== 'string') { errors.push(`${at}: must be a string`); return; }
      const qt = q.trim();
      const qWords = qt.split(/\s+/).length;
      if (qWords < QUESTION_MIN_WORDS) errors.push(`${at}: too short (${qWords} words)`);
      if (qWords > QUESTION_MAX_WORDS) errors.push(`${at}: too long (${qWords} > ${QUESTION_MAX_WORDS} words)`);
      const qMarks = (qt.match(/\?/g) || []).length;
      if (qMarks !== 1 || !qt.endsWith('?')) errors.push(`${at}: must be ONE interrogative ending in a single "?"`);
      if (/[.!]/.test(qt)) errors.push(`${at}: must be a single sentence (no . or !)`);
      if (!SECOND_PERSON_RE.test(qt)) errors.push(`${at}: must be second-person (use "you"/"your")`);
    });
    if (c.questions.length === 2 && typeof c.questions[0] === 'string'
        && c.questions[0].trim() === (c.questions[1] || '').trim()) {
      errors.push(`${where}: the two questions are identical`);
    }
  }

  // ----- verb (optional, standalone clustering tag) -----
  if (c.verb !== undefined) {
    if (typeof c.verb !== 'string' || !VERB_RE.test(c.verb)) {
      errors.push(`${where}: verb "${c.verb}" must be a lowercase kebab tag`);
    } else if (c.verb.split('-').length > 4) {
      errors.push(`${where}: verb "${c.verb}" is too long (max 4 words)`);
    }
  }
  // `grammar`/`question` (singular) are retired — flag stragglers so cards stay clean.
  if (c.grammar !== undefined) errors.push(`${where}: "grammar" is retired (remove it)`);
  if (c.question !== undefined) errors.push(`${where}: singular "question" is retired — use the "questions" array`);
}

const ids = CARD_POOL.cards.map((c) => c.id);
if (new Set(ids).size !== ids.length) errors.push('duplicate card ids in pool');

if (errors.length) {
  console.error(`Content lint FAILED (${errors.length}):`);
  errors.forEach((e) => console.error('  ✗ ' + e));
  process.exit(1);
}
console.log(`Content lint passed — ${CARD_POOL.cards.length} cards clean.`);
