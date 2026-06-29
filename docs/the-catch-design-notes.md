# Design notes — how "The Catch" was arrived at

> **Superseded (2026-06):** "The Catch" was later generalized into two always-shown
> application questions on every card. Kept as the original design record.

Background record for `docs/prd-the-catch.md`. The design came out of a 3-round
adversarial review between a Product Manager and a System Designer persona, then five
user-testing personas. Captured here so the *rejected* branches don't get re-proposed.

## The adversarial PM ↔ System-Designer debate (3 rounds)

**Shared diagnosis (both agreed):** the reveal is the *terminal state* of the loop — a
named mechanism is a closed answer, so the loop ends inside the card, not the user's head.
That single fact is the "fun facts" disease.

**Shared standard (forced out by round 2):** the fix must fire on the **default swipe
path**, the only surface with guaranteed traffic. A fix that only the minority sees, or
that lives on the dead "Saved" screen, does not count.

Rejected along the way, with the reason each died:

| Proposal | Why it was rejected |
|---|---|
| Optional "Aim It" chip after the reveal | Optional ⇒ the default loop is unchanged for the ~85% who skip it; you shipped the complained-about product plus clutter. |
| Templated question stamped from the mechanism | A mad-lib ("the IKEA reveal with a `<your-job>` slot") inherits the reveal's closedness; reads as a second fun-fact with a `?`. |
| Move the generative layer to the "Saved" screen | Saved is the dead screen; a 4-step funnel off the least-trafficked surface. |
| `IKEA × Gyms × ___` pick-one-of-three nouns | Choosing from seeded nouns is *recognition, not generation* — more taps, less agency; the only real generation (`[something else]`) is the banned text box. |

**Converged answer:** keep the reveal; on back-of-deck cards it resolves into one
hand-authored, second-person **open question**, answerable by silence — provoke the bridge
in the user's head, don't collect it. Harden against horoscope decay by rotating the
question *grammar*, and adapt the dose to appetite.

## User-testing personas (5) — what they changed

| Persona | Headline reaction | Resulting requirement |
|---|---|---|
| Maya (indie founder) | The IKEA card provoked a real churn insight — then the app "dropped it on the floor." | Keep an optional one-tap capture; don't discard the thought when it lands. |
| Devon (streak-gamer) | "If [caught one] keeps my streak alive, it's just the ♥ button with extra steps." | Do **not** relabel ♥; keep streak semantics; clustering is a *soft* signal only. |
| Priya (skeptical UX) | "Catch-clustering is a vanity metric in a rigor costume" — you control the verb supply. | Demote clustering to directional; real proof = next-day recall A/B (deferred). |
| Tom (consultant) | Wants to carry the spark *out* into a deck/Slack — ephemeral kills the value. | Add a shareable/exportable artifact (one-tap Share). |
| Sofia (ESL creative) | The "accusation" grammar read as a literal scolding; "dare" felt like a game. | Cut `accusation`; allow point/inversion/dare; lead with the playful shapes. |

Unanimous guardrails: **front-of-deck stays pure fun-facts** (the bait), and provocation
**never gates** the swipe.

## Net design decisions encoded in the PRD/TRD
1. Provocation = an authored open question on the default reveal of a *back-of-deck* subset.
2. Three grammars only: point / inversion / dare. `accusation` is lint-banned.
3. ♥/✕ unchanged; a "catch" is just a save of a provoked card, recording a soft `verb`.
4. Optional capture survives (the existing take-input, re-pointed); answerable by silence.
5. Soft "You keep catching X" mirror at ≥3 catches — an observation, not proof.
6. One-tap Share as the take-it-out artifact and first organic growth loop.
7. Honest validation (recall A/B, server telemetry) is explicitly deferred.
