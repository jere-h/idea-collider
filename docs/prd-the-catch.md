# PRD — "The Catch": turning reveals from fun facts into provocations

> **Superseded (2026-06):** "The Catch" shipped as ONE conditionally-shown question on a
> subset of cards. It has since been generalized: **every** card now shows **two** always-on,
> second-person application questions under a plain-language reveal (see `src/cards.js`). The
> conditional gating (`FRONT_FREE`/`COLD_LIMIT`/`grammar`) is retired; the soft
> "You keep catching X" verb-clustering mirror is retained (`src/provocation.js`). This doc is
> kept as the original design record.

Status: proposed · Owner: product · Surface: Collider PWA (deck loop)

## 1. Problem

Collider's reveal is the **terminal state** of the loop. A card collides two brands,
you guess, you tap, and a one-line "shared mechanism" is handed to you — a closed
answer. The loop ends *inside the card*, not inside the user's head. The result, in
the maintainer's words:

> "It feels more like reading fun facts, but less of thought-provoking questions that
> can really catalyze new ideas you have never thought of that are relevant to **your**
> problem space."

Two failure modes hide in that sentence:

1. **Consumptive, not generative.** You read a clever observation and swipe. Nothing
   of *yours* is produced.
2. **Generic, not relevant.** The collisions never touch what the user is actually
   working on, so nothing "lands."

## 2. The trap we must not fall into

The card pool's own history (`src/cards.js`) records that v1 used abstract collisions
that "tested as homework — the spark only arrived if the user did the work," and people
bounced. The sub-second, recognition-driven loop is *why* the app is sticky. **Any fix
that makes the user do bridging work up front re-introduces the exact homework friction
v2 was built to kill.** This is the central constraint, not a footnote.

## 3. Solution — "The Catch"

Keep v2's card face and one-line reveal exactly as the default. On a **subset of
back-of-deck cards**, the reveal resolves into one **hand-authored, second-person open
question** pointed at the user's own life:

> IKEA × Gyms → *"Where in your week does someone take the credit for work you actually
> did?"* (the reveal still names the move; the question is one single interrogative)

The generative work happens **in the user's head, in the half-second before they
swipe** — we *provoke* the bridge, we don't collect it. The question is answerable by
silence: no required text, no multiple-choice. The existing ♥/✕ controls are unchanged;
if it caught you, you ♥ it (which already saves + ticks the streak); if not, you swipe on.

When a user keeps catching the same underlying *move*, the "You" tab earns one quiet
mirror line — *"You keep catching credit-shifting"* — which is the user's problem space
**inferred from a binary they already tap**, never from a form.

### Why this beats the alternatives we considered

These were stress-tested in an adversarial PM ↔ System-Designer design review (see
`docs/the-catch-design-notes.md`):

- **Optional "Aim It" beat after the reveal** — rejected: an optional beat leaves the
  *default* loop identical, so the 85% who skip it still get the complained-about product.
- **Templated question from the mechanism** — rejected: a mad-lib inherits the reveal's
  closedness ("the IKEA reveal with a `<your-job>` slot").
- **Move the payoff to the Saved screen** — rejected: Saved is the dead screen; a 4-step
  funnel off the least-trafficked surface.
- **Pick-the-third-brand multiple choice** — rejected: choosing from 3 seeded nouns is
  *recognition, not generation* — more taps, less agency.

## 4. What user testing changed (5 simulated personas)

The converged design was tested against five personas (indie founder, streak-gamer,
skeptical UX designer, time-pressed consultant, ESL creative). Their feedback **revised**
the design in four concrete ways — these are requirements, not nice-to-haves:

1. **Don't drop the user's thought on the floor.** The strongest moment is when a card
   *lands*. The pure "store only a verb tag, silence is enough" version threw that away.
   → The existing optional take-input stays, and on a provocation card its placeholder
   becomes the pointed prompt, so a user who *did* have a thought can keep it in one tap —
   still optional, still no gate.
2. **Don't pollute the streak signal.** Relabeling the save button as "[caught one]"
   would make people smash it for the streak, poisoning any clustering signal. → We do
   **not** relabel ♥. Saving keeps its existing meaning; the verb is recorded as a *soft*
   signal only.
3. **Cut the "accusation" grammar.** It read as scolding and was actively confusing for
   the ESL persona ("I feel a little attacked"). → Allowed grammars are **point /
   inversion / dare** only; accusation is disallowed by the content lint.
4. **Let the artifact leave the app.** Every persona who valued the ideas wanted to take
   one out (to a deck, a group chat). → A one-tap **Share** on saved collisions (native
   share sheet, clipboard fallback). This doubles as the app's first organic growth loop.

Plus two guardrails everyone agreed on: **front-of-deck cards stay pure fun-facts**
(they're the bait), and the **"You keep catching X" mirror is a soft reflection, not a
"proof it works" metric** — real validation is next-day idea recall, not catch-rate.

## 5. Scope

### In scope (this PR — the thin first slice)
- `question` / `verb` / `grammar` content fields on a subset of cards.
- Provocation renders on back-of-deck cards, with adaptive back-off if the user swipes
  past provocations cold.
- `verb` recorded on a "catch" (a save of a provoked card); soft "You keep catching X"
  mirror after a threshold.
- One-tap Share on saved collisions.
- Content-lint rules for the new fields; unit tests for the pure provocation logic.

### Out of scope (deliberately deferred)
- Server-side telemetry / a real A/B test of recall (the only non-gameable validation).
- Per-user adaptive deck *re-dealing* based on caught verbs.
- Free-text idea development / an "ideas" workspace.
- Authoring questions for the entire pool (start with a curated subset).

## 6. Success metrics

| Signal | Type | Target |
|---|---|---|
| Catch rate on provoked cards (saved / shown) | engagement | provoked cards saved at ≥ the pool's baseline save rate (provocation doesn't depress saving) |
| Catch **clustering** (do a user's catches concentrate on few verbs?) | soft / directional | qualitative — a non-flat distribution; explicitly NOT treated as proof |
| Share taps per active user | growth | any non-zero adoption (new surface) |
| Provocation cold-swipe rate | guardrail | if a user swipes past N provocations cold, back-off fires (no forced homework) |

The honest validation, noted for a follow-up: A/B **reveal-only vs reveal+question** on
24-hour idea recall. A clustering number is a directional comfort, not the proof.

## 7. Risks

- **Fortune-cookie decay.** A sincere "where does this happen to you?" every few cards
  calcifies into a horoscope. Mitigation: rotate question *grammar* (point/inversion/dare),
  enforced by lint variety; keep provocations a minority of the deck.
- **Interruption of the fun loop.** Mitigation: front-of-deck stays pure reveal; adaptive
  back-off; provocation never gates the swipe.
- **Mirror feels creepy/wrong.** A wrong "you keep catching X" erodes trust. Mitigation:
  show it only above a confidence threshold (≥3 catches sharing a verb) and phrase it as
  an observation, not a verdict.
