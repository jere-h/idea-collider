# Collider — "Swipe for Ideas"

A mobile-first PWA: a **daily swipe deck of surprising brand & industry
collisions**. Each card collides two things you already know — *IKEA × gyms*,
*Starbucks × banks*, *Costco × SaaS pricing* — you guess the link, then tap to
reveal a plain-language twist that names the hidden mechanism they share, plus
**two questions** that turn the idea back on your own life and work.
✕ skip · ♥ save. Eight cards a day, in the time it takes to lose at Wordle.

**Live:** https://jere-h.github.io/idea-collider/

It's a cold-open loop with no onboarding: the app opens straight onto the first
card. Saving keeps the collision and ticks your **streak**; **Saved** is a
searchable list of what you kept; **You** shows your streak, saves, and
*industries bridged (X of 20)*. A finite 8-card daily deck is dealt without
replacement.

## Stack

**Dependency-free vanilla ES modules — no build step, no framework, no bundler.**
Pure static files plus a service worker and web manifest, so it installs to the
home screen and works offline after first load.

```
index.html · styles.css          shell + mobile-first dark UI
src/app.js                        UI controller: guess→reveal→react loop, swipe gestures, screens
src/deckEngine.js                 pure 8/day no-replace deal (seeded)
src/streak.js                     pure streak + per-run freeze
src/domains.js                    the 20 canonical industry categories + industries-bridged
src/storage.js                    versioned localStorage (state + separate outbox key)
src/telemetry.js                  anonymous at-least-once beacon (eventId, outbox)
src/cards.js                      the curated brand/industry collision pool (reveal + 2 questions per card)
src/config.js                     deploy-time config (telemetry endpoint, version)
sw.js · manifest.webmanifest · icon.svg   PWA install + offline
.nojekyll                         tells GitHub Pages to serve src/ modules & the SW as-is
api/events.js                     reference serverless telemetry sink (unused on Pages)
tests/                            unit, content lint, e2e smoke
```

## Run it locally

Pure static files, no build step. It must be **served over http** (ES modules +
service worker won't load from a `file://` URL).

```bash
npm run serve        # → http://localhost:8080  (bundled zero-dep static server)
# or any static server, e.g.:
python3 -m http.server 8080
```

Open it on a phone, or in a narrow browser window — it's mobile-first.

## Test

```bash
npm test             # 22 pure-logic unit tests (deck, streak, industries, telemetry, storage)
npm run lint:content # card-pool rubric lint (schema, categories, reveal budget)
node tests/e2e.smoke.mjs   # Playwright e2e in headless Chromium (needs playwright + a chromium)
```

## Hosting (GitHub Pages)

Hosted on **GitHub Pages from the repo root**. Because the app is static with a
`.nojekyll` marker, it serves as-is — no Jekyll processing, so the `src/` ES
modules and `sw.js` service worker are served untouched. The Pages **source** is
"GitHub Actions" and no build runs — the files are deployed verbatim by
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

> **Which branch actually publishes.** The `github-pages` environment is currently
> restricted to the **`claude/collider-github-pages-gja0mp`** branch, so that is the
> branch the live site is built from. The workflow's `on: push` trigger lists `main`,
> but a deploy started from `main` is **rejected by the environment** (the `deploy`
> job fails in ~1s with no steps), so it never publishes. Until the environment is
> changed, ship by getting your changes onto `claude/collider-github-pages-gja0mp`
> and running the workflow on it (Actions → *Deploy to GitHub Pages* → **Run
> workflow** on that branch, i.e. `workflow_dispatch`).
>
> **To make `main` the real source** (recommended), open **Settings → Environments →
> `github-pages` → Deployment branches** and allow `main` (or the default branch).
> Then the `push` trigger below will publish on its own and this note can go away.

**Releasing a change:** bump `CACHE` in [`sw.js`](sw.js) (and `APP_VERSION` in
[`src/config.js`](src/config.js)) whenever you touch `index.html`, `styles.css`, or
`src/*`. The service worker is offline-first and only refreshes its precache when the
cache name changes — skip the bump and returning visitors keep the old shell.

## Telemetry (optional, OFF by default)

The app is **fully functional with no backend** — events just queue locally and
nothing is sent. `TELEMETRY_ENDPOINT` in `src/config.js` is intentionally empty
for the Pages deploy.

`api/events.js` is a reference serverless endpoint (anonymous, eventId-deduped,
ids and event types only — never card or bridge text). GitHub Pages can't run
it. If you later want anonymous usage metrics, deploy `api/events.js` to
Vercel/Netlify and set its URL as `TELEMETRY_ENDPOINT` in `src/config.js`.
