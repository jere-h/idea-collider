// Zero-dependency test runner for the pure logic modules (TRD §Test strategy).
// Run: node tests/logic.test.mjs
import assert from 'node:assert/strict';
import { deal, DECK_SIZE, hashSeed } from '../src/deckEngine.js';
import { applySpark, currentStreak, initialStreak } from '../src/streak.js';
import { domainsBridged, DOMAIN_COUNT } from '../src/domains.js';
import { migrate, defaultState, SCHEMA_VERSION, createStorage, memoryBackend } from '../src/storage.js';
import { createTelemetry } from '../src/telemetry.js';
import {
  hasProvocation, shouldProvoke, clusterVerb,
  FRONT_FREE, COLD_LIMIT, CLUSTER_MIN,
} from '../src/provocation.js';

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// ---------- fixtures ----------
function poolOf(n) {
  const domains = ['Airlines', 'Banking', 'Streaming', 'Fitness', 'Coffee', 'Software'];
  const cards = [];
  for (let i = 0; i < n; i++) {
    cards.push({
      id: `c${i}`,
      a: { domain: domains[i % domains.length] },
      b: { domain: domains[(i + 1) % domains.length] },
    });
  }
  return { version: 't', cards };
}
const baseUser = (over = {}) => ({
  deviceId: 'dev-1', homeDomains: [], dealtEver: [], deckHistoryCount: 0,
  dailyDeck: undefined, ...over,
});

// ---------- deckEngine ----------
test('deals exactly DECK_SIZE from a large pool', () => {
  const deck = deal(poolOf(40), baseUser(), '2026-01-01');
  assert.equal(deck.cards.length, DECK_SIZE);
});

test('deterministic for a fixed (deviceId, day) seed', () => {
  const d1 = deal(poolOf(40), baseUser(), '2026-01-01');
  const d2 = deal(poolOf(40), baseUser(), '2026-01-01');
  assert.deepEqual(d1.cards.map((c) => c.id), d2.cards.map((c) => c.id));
});

test('different day produces a different draw', () => {
  const d1 = deal(poolOf(40), baseUser(), '2026-01-01');
  const d2 = deal(poolOf(40), baseUser(), '2026-01-02');
  assert.notDeepEqual(d1.cards.map((c) => c.id), d2.cards.map((c) => c.id));
});

test('same-day return reproduces the persisted deck, never re-deals', () => {
  const persisted = { day: '2026-01-01', cards: [{ id: 'c5', status: 'engaged' }] };
  const deck = deal(poolOf(40), baseUser({ dailyDeck: persisted }), '2026-01-01');
  assert.equal(deck, persisted); // same object, status preserved
  assert.equal(deck.cards[0].status, 'engaged');
});

test('excludes every previously dealt card (dealtEver)', () => {
  const dealt = Array.from({ length: 36 }, (_, i) => `c${i}`); // only c36..c39 left
  const deck = deal(poolOf(40), baseUser({ dealtEver: dealt }), '2026-01-09');
  assert.ok(deck.cards.every((c) => !dealt.includes(c.id)));
  assert.equal(deck.cards.length, 4); // short deck when <8 remain
});

test('home-domain bias is honoured in the first decks (no crash, biased pool)', () => {
  const deck = deal(poolOf(40), baseUser({ homeDomains: ['Airlines'] }), '2026-03-03');
  assert.equal(deck.cards.length, DECK_SIZE);
});

test('hashSeed is stable and order-sensitive', () => {
  assert.equal(hashSeed('a:b'), hashSeed('a:b'));
  assert.notEqual(hashSeed('a:b'), hashSeed('b:a'));
});

// ---------- streak ----------
test('first spark starts a streak of 1', () => {
  const s = applySpark(initialStreak(), '2026-01-01');
  assert.equal(s.count, 1);
});

test('consecutive days extend the streak', () => {
  let s = applySpark(initialStreak(), '2026-01-01');
  s = applySpark(s, '2026-01-02');
  s = applySpark(s, '2026-01-03');
  assert.equal(s.count, 3);
});

test('multiple sparks same day increment only once', () => {
  let s = applySpark(initialStreak(), '2026-01-01');
  s = applySpark(s, '2026-01-01');
  assert.equal(s.count, 1);
});

test('one missed day consumes the freeze and survives', () => {
  let s = applySpark(initialStreak(), '2026-01-01'); // count 1, freeze available
  s = applySpark(s, '2026-01-03');                   // gap 2 -> freeze used
  assert.equal(s.count, 2);
  assert.equal(s.freezeAvailable, false);
});

test('two missed days reset to 1 AND restore the freeze', () => {
  let s = applySpark(initialStreak(), '2026-01-01');
  s = applySpark(s, '2026-01-05'); // gap 4 -> reset
  assert.equal(s.count, 1);
  assert.equal(s.freezeAvailable, true);
});

test('a second missed day after the freeze was used resets', () => {
  let s = applySpark(initialStreak(), '2026-01-01');
  s = applySpark(s, '2026-01-03'); // freeze used (count 2)
  s = applySpark(s, '2026-01-05'); // gap 2 again, no freeze -> reset
  assert.equal(s.count, 1);
  assert.equal(s.freezeAvailable, true);
});

test('currentStreak lapses when too far past the last spark', () => {
  const s = applySpark(initialStreak(), '2026-01-01');
  assert.equal(currentStreak(s, '2026-01-02'), 1); // yesterday: alive
  assert.equal(currentStreak(s, '2026-01-03'), 1); // freeze window: alive
  assert.equal(currentStreak(s, '2026-01-04'), 0); // lapsed
});

// ---------- domains ----------
test('domainsBridged counts distinct domains from sparks only, capped', () => {
  const sparks = [
    { domains: ['Airlines', 'Banking'] },
    { domains: ['Airlines', 'Streaming'] }, // Airlines repeats
  ];
  assert.equal(domainsBridged(sparks), 3);
  assert.equal(domainsBridged([]), 0);
});

test('domainsBridged never exceeds DOMAIN_COUNT', () => {
  const many = Array.from({ length: 50 }, (_, i) => ({ domains: ['Airlines', 'Fitness'] }));
  assert.ok(domainsBridged(many) <= DOMAIN_COUNT);
});

// ---------- storage migrate ----------
test('migrate preserves sparks and stamps the current schema', () => {
  const old = { schemaVersion: 0, sparks: [{ cardId: 'x', bridge: 'b', domains: ['Art'] }] };
  const s = migrate(old);
  assert.equal(s.schemaVersion, SCHEMA_VERSION);
  assert.equal(s.sparks.length, 1);
  assert.equal(s.sparks[0].bridge, 'b');
});

test('migrate of junk yields a valid default state', () => {
  const s = migrate(null);
  assert.equal(s.schemaVersion, SCHEMA_VERSION);
  assert.ok(Array.isArray(s.sparks));
});

// ---------- telemetry ----------
function fakeStore() {
  let out = [];
  return { getOutbox: () => out.slice(), setOutbox: (o) => { out = o.slice(); }, _peek: () => out };
}

test('telemetry stamps eventId and queues to the outbox', () => {
  const store = fakeStore();
  const t = createTelemetry({ endpoint: '', store, deviceId: 'd', fetchImpl: null });
  t.enqueue('card_view', { cardId: 'c1' });
  assert.equal(store._peek().length, 1);
  assert.ok(store._peek()[0].eventId);
  assert.equal(store._peek()[0].type, 'card_view');
});

test('flush clears the outbox only on a 2xx', async () => {
  const store = fakeStore();
  let calls = 0;
  const fetchOk = async () => { calls++; return { status: 204 }; };
  const t = createTelemetry({ endpoint: '/e', store, deviceId: 'd', fetchImpl: fetchOk });
  t.enqueue('swipe_left', { cardId: 'c1' });
  const ok = await t.flush();
  assert.equal(ok, true);
  assert.equal(store._peek().length, 0);
  assert.equal(calls, 1);
});

test('failed send leaves the outbox intact and does NOT duplicate on retry', async () => {
  const store = fakeStore();
  let mode = 'fail';
  const fetchImpl = async () => (mode === 'fail' ? { status: 500 } : { status: 204 });
  const t = createTelemetry({ endpoint: '/e', store, deviceId: 'd', fetchImpl });
  const e = t.enqueue('bridge_saved', { cardId: 'c1' });
  await t.flush();                       // 500 -> kept
  assert.equal(store._peek().length, 1);
  assert.equal(store._peek()[0].eventId, e.eventId); // same event, no dup
  mode = 'ok';
  await t.flush();                       // 204 -> cleared
  assert.equal(store._peek().length, 0);
});

// ---------- storage <-> telemetry isolation (regression for the review bug) ----------
test('app save() does not clobber the telemetry outbox (separate keys)', () => {
  const backend = memoryBackend();
  const storage = createStorage(backend);
  // telemetry enqueues an event into the outbox
  storage.setOutbox([{ eventId: 'e1', type: 'session_start' }]);
  // app mutates and saves the whole state blob (stale/empty outbox in memory)
  const s = storage.load();
  s.sparks.push({ cardId: 'x', bridge: 'b', domains: ['Art'] });
  storage.save(s);
  // the outbox event must survive the app save
  assert.equal(storage.getOutbox().length, 1);
  assert.equal(storage.getOutbox()[0].eventId, 'e1');
});

// ---------- provocation ("The Catch") ----------
const provCard = { question: 'Where in your week does this bite you?', verb: 'credit-shifting', grammar: 'point' };
const plainCard = { reveal: 'A closed mechanism, no question.' };

test('hasProvocation detects a question field', () => {
  assert.equal(hasProvocation(provCard), true);
  assert.equal(hasProvocation(plainCard), false);
  assert.equal(hasProvocation({ question: '   ' }), false); // blank doesn't count
  assert.equal(hasProvocation(null), false);
});

test('shouldProvoke keeps the front of the deck pure', () => {
  // done < FRONT_FREE → never provoke, even on a provocation card
  for (let done = 0; done < FRONT_FREE; done++) {
    assert.equal(shouldProvoke({ card: provCard, done, coldStreak: 0 }), false);
  }
  // at/after FRONT_FREE → provoke
  assert.equal(shouldProvoke({ card: provCard, done: FRONT_FREE, coldStreak: 0 }), true);
  assert.equal(shouldProvoke({ card: provCard, done: FRONT_FREE + 3, coldStreak: 0 }), true);
});

test('shouldProvoke never fires on a card with no question', () => {
  assert.equal(shouldProvoke({ card: plainCard, done: 99, coldStreak: 0 }), false);
});

test('shouldProvoke backs off once coldStreak hits COLD_LIMIT', () => {
  assert.equal(shouldProvoke({ card: provCard, done: 5, coldStreak: COLD_LIMIT - 1 }), true);
  assert.equal(shouldProvoke({ card: provCard, done: 5, coldStreak: COLD_LIMIT }), false);
  assert.equal(shouldProvoke({ card: provCard, done: 5, coldStreak: COLD_LIMIT + 9 }), false);
});

test('clusterVerb returns null below the threshold and the dominant verb at/above it', () => {
  assert.equal(clusterVerb([]), null);
  const below = Array.from({ length: CLUSTER_MIN - 1 }, () => ({ verb: 'credit-shifting' }));
  assert.equal(clusterVerb(below), null);
  const at = Array.from({ length: CLUSTER_MIN }, () => ({ verb: 'credit-shifting' }));
  assert.equal(clusterVerb(at), 'credit-shifting');
});

test('clusterVerb ignores sparks without a verb and picks the most frequent', () => {
  const sparks = [
    { verb: 'walled-garden' }, { verb: 'walled-garden' }, { verb: 'walled-garden' },
    { verb: 'customer-float' }, { bridge: 'no verb here' }, {},
  ];
  assert.equal(clusterVerb(sparks), 'walled-garden');
});

// ---------- run ----------
(async () => {
  for (const [name, fn] of tests) {
    try {
      await fn();
      passed++;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}\n    ${err.message}`);
      process.exitCode = 1;
    }
  }
  console.log(`\n${passed}/${tests.length} passed`);
})();
