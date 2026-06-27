# TRD — "The Catch"

Status: proposed · Implements: `docs/prd-the-catch.md`

Constraints carried from the project: **vanilla ES modules, no build step, no framework,
offline-capable, localStorage only, no network on the hot path.** Every change below is
pure DOM + one new pure module + authored content. No new dependency.

## 1. Overview of changes

| Area | File | Change |
|---|---|---|
| Content | `src/cards.js` | Add optional `question` / `verb` / `grammar` to a subset of cards |
| Logic | `src/provocation.js` (new) | Pure: gating, adaptive back-off, verb clustering |
| Controller | `src/app.js` | Render question on provoked cards; record `verb` on catch; mirror line; Share |
| State | `src/storage.js` | `spark.verb` is additive (no migration); no schema bump |
| Styles | `styles.css` | `.catch-question`, `.catch-mirror`, `.share-btn` |
| Telemetry | (via existing `track`) | `provocation_shown`, `catch`, `share` event types |
| Lint | `tests/content.lint.mjs` | Validate new fields; ban `accusation`; enforce grammar variety |
| Tests | `tests/logic.test.mjs` | Unit tests for `src/provocation.js` |

## 2. Content schema (`src/cards.js`)

A card MAY carry a provocation. Fields are all-or-nothing (lint enforces):

```js
{
  id: 'ikea-gyms',
  a: { title: 'IKEA', domain: 'Furniture' },
  b: { title: 'Gyms',  domain: 'Fitness' },
  reveal: 'You do the hard part yourself and they take the credit, …',
  // --- provocation (optional) ---
  verb: 'credit-shifting',          // short kebab tag: clustering key + mirror label
  grammar: 'inversion',             // 'point' | 'inversion' | 'dare'  (NOT 'accusation')
  question: 'Who is taking the credit for work you actually did this week?',
}
```

- `verb` — lowercase, kebab-ish (`/^[a-z][a-z-]*[a-z]$/`), 1–4 words. Displayed verbatim
  in the mirror ("You keep catching **credit-shifting**").
- `grammar` — one of the three allowed shapes. Drives lint variety + telemetry; the
  rotation is achieved by authoring a mix across the provoked subset.
- `question` — ends with `?`, 4–24 words, contains a second-person marker (`you`/`your`),
  is a single question. It is a *separate field*, so it never trips the one-sentence
  `reveal` lint.

Author ~10–12 of the 24 cards (≈ half) with provocations, spread across the three
grammars. The rest stay pure fun-facts.

## 3. Provocation logic (`src/provocation.js`, new, pure)

No DOM, no storage — fully unit-testable, mirrors `deckEngine.js`/`streak.js` style.

```js
export const GRAMMARS = ['point', 'inversion', 'dare'];
export const FRONT_FREE = 2;     // first 2 resolved cards/day are always pure reveal
export const COLD_LIMIT = 3;     // after this many cold provocations, back off for the session
export const CLUSTER_MIN = 3;    // catches sharing a verb before the mirror shows

export function hasProvocation(card) {
  return !!(card && typeof card.question === 'string' && card.question.trim());
}

// Decide whether to show the provocation for the current top card.
//   done       — resolved cards so far today (deckProgress().done)
//   coldStreak — consecutive provocations shown-then-swiped-past WITHOUT a catch, this session
export function shouldProvoke({ card, done, coldStreak }) {
  return hasProvocation(card)
    && done >= FRONT_FREE
    && coldStreak < COLD_LIMIT;
}

// Dominant verb across saved sparks, or null. Soft signal — display only.
export function clusterVerb(sparks, min = CLUSTER_MIN) {
  const counts = new Map();
  for (const s of sparks || []) {
    if (!s || !s.verb) continue;
    counts.set(s.verb, (counts.get(s.verb) || 0) + 1);
  }
  let best = null, bestN = 0;
  for (const [verb, n] of counts) if (n > bestN) { best = verb; bestN = n; }
  return bestN >= min ? best : null;
}
```

**Position semantics (off-by-one, important):** `deckProgress().done` counts cards whose
status is no longer `pending`; the card currently on screen is still `pending`, so it is
NOT counted. With `FRONT_FREE = 2`, `done >= 2` first becomes true on the **3rd** card the
user reaches — i.e. the first two cards of the day are always pure reveal. Tests assert
this via deck position, not raw `done`.

### Adaptive cadence (session-transient, lives in `app.js`)

The provocation is only "live" when the **top card is currently revealed AND
`shouldProvoke` is true**. Because exactly one card is on screen at a time, we track a
single id rather than a growing set — this avoids stale membership when `renderDeck`
re-fires (every reveal, every tab return):

- `coldStreak` starts at 0 each session (not persisted).
- `let provokedTopId = null;` — set to the top card's id during `renderDeck` **iff** that
  card is revealed and `shouldProvoke` is true; recomputed (and possibly cleared) on every
  render. This is the single source of truth for catch/skip bookkeeping — never a stale set.
- `const shownTracked = new Set();` — telemetry idempotency ONLY (distinct from the
  bookkeeping above), so `provocation_shown` fires at most once per entry across re-renders.
- On **save** where `entryId === provokedTopId` → it's a **catch**: `coldStreak = 0`
  (engagement feeds more provocation), store `verb` on the spark, `track('catch', {cardId, verb})`.
- On **skip** where `entryId === provokedTopId` → `coldStreak += 1` (cold). Once it reaches
  `COLD_LIMIT`, `shouldProvoke` returns false for the rest of the session — the deck reverts
  to pure fun-facts. (A card skipped *without* being revealed was never provoked, so it never
  counts as cold.)

## 4. Controller wiring (`src/app.js`)

1. **Imports**: `hasProvocation, shouldProvoke, clusterVerb` from `./provocation.js`.
2. **Session state**: `let coldStreak = 0; const provokedEntries = new Set();`
3. **`renderCard(card, entry, revealed)`**: compute `provoke = revealed &&
   shouldProvoke({card, done: deckProgress().done, coldStreak})`. Set
   `provokedTopId = provoke ? entry.id : null` for the top card. When `provoke`:
   - if `!shownTracked.has(entry.id)`: add it and `track('provocation_shown', {cardId, grammar})`.
   - render `<p class="catch-question">${esc(card.question)}</p>` between `.reveal-line`
     and `.cats`.
   - change the take-input placeholder to `"Caught one? Jot where (optional)"`.
   - change the deck `.hint` to `"♥ if it caught you  ·  ✕ swipe on"`.
   The ♥/✕ buttons and swipe handlers are **unchanged**.
4. **`saveCard(entryId, take)`**: if `entryId === provokedTopId`, set `spark.verb =
   card.verb`, reset `coldStreak = 0`, `track('catch', ...)`. Otherwise unchanged.
5. **`skipCard(entryId)`**: if `entryId === provokedTopId`, `coldStreak += 1`.
6. **`renderYou()`**: `const v = clusterVerb(state.sparks);` if `v`, render
   `<p class="catch-mirror">You keep catching <b>${esc(v)}</b>.</p>` under the stats.
7. **Share** (`renderSaved` rows): `sparkRow(s)` adds
   `<button class="share-btn" data-share="${esc(s.cardId)}">Share</button>` (the spark's
   field is `cardId`, not `id`). `renderSaved` adds a delegated click listener (mirroring
   `bindTabs`) over `.share-btn`. The handler builds the share text from **raw** card
   strings — NOT `esc()`, which is for `innerHTML` only; HTML entities must not leak into a
   share sheet/clipboard: `text = `${a.title} × ${b.title} — ${reveal}`` (+ `\n\n${question}`
   when the card has one). Use `navigator.share({text})` when available, else
   `navigator.clipboard.writeText(text)` with a tiny "copied" toast, else no-op. Wrap in
   try/catch (an aborted share rejects); `track('share', {cardId})` on success.
8. **Take-input keyboard guard**: the deck binds ArrowLeft/Right to swipe
   (`document.onkeydown` in `bindSwipe`). Since a provocation actively invites typing in
   `#take`, the handler must **ignore arrow keys when `document.activeElement` is the
   take-input**, or arrow-key editing swipes the card away. (Fixes a latent pre-existing bug.)

The session-transient design is correct: a reload re-evaluates `shouldProvoke` against the
persisted deck and a reset `coldStreak`, which is acceptable for v1.

## 5. State & storage

- `spark.verb?: string` is **additive** and lives on individual spark objects, not on
  top-level state. `migrate()` only spreads top-level defaults and never rewrites
  `state.sparks[*]` — which is exactly why no migration is needed: old sparks simply lack
  `verb`, and `clusterVerb` skips falsy verbs. **No schema bump, no migration, no spark rewrite.**
- No new persisted keys. `coldStreak`/`provokedEntries` are intentionally in-memory.

## 6. Telemetry

All via the existing generic `telemetry.track(type, props)` — no telemetry code change:
- `provocation_shown` `{cardId, grammar}` — once per provoked entry.
- `catch` `{cardId, verb}` — on save of a provoked card.
- `share` `{cardId}` — on a successful share/copy.
Endpoint stays empty by default; events queue locally and are dropped if unsent. No PII,
no question/verb *text* beyond the verb tag and ids (consistent with the existing policy).

## 7. Content lint additions (`tests/content.lint.mjs`)

For every card, treat the provocation fields as a unit:
- If any of `question`/`verb`/`grammar` is present, **all three** must be present.
- `grammar ∈ {point, inversion, dare}`; a literal `'accusation'` is an explicit failure
  with a pointed message (it was cut in user testing).
- `verb` matches `/^[a-z][a-z-]*[a-z]$/` and is ≤ 4 words.
- `question` is a single interrogative: exactly one terminal `?`, no other sentence
  terminal (`.`/`!`), 4–24 words, and contains a second-person marker `\byou(r|rself)?\b`.
- Pool-level: at least 8 provoked cards (PRD targets ~half of 24), and all three grammars
  represented (variety guard against horoscope decay). `clusterVerb` breaks count ties by
  first-seen verb — deterministic but arbitrary; acceptable for a soft signal.

## 8. Test strategy

- **`tests/logic.test.mjs`** (extend): import `src/provocation.js` and add:
  - `hasProvocation` true/false.
  - `shouldProvoke`: false before `FRONT_FREE`; true at/after; false once `coldStreak`
    hits `COLD_LIMIT`; false for a card with no question.
  - `clusterVerb`: null below `CLUSTER_MIN`; returns the dominant verb at/above; ignores
    sparks lacking `verb`; null on `[]`.
- **`tests/content.lint.mjs`**: passes on the authored pool; the new rules are exercised
  by the real content.
- **`node tests/e2e.smoke.mjs`**: existing Playwright smoke still green (no selector it
  depends on is removed; provocation only *adds* a `<p>` and changes placeholder/hint text).

## 9. Rollout / reversibility

Fully reversible by content: deleting the `question`/`verb`/`grammar` fields from
`src/cards.js` returns the app to pure-reveal behavior with zero code change (the gates
all key off `hasProvocation`). The code path is inert for any card without a question.
