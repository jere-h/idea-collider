// E2E smoke test (TRD §Test strategy·E2E). Drives the real app in headless
// Chromium for the v2 loop: COLD-OPEN onto a card (no onboarding) -> skip one
// (no reward) -> reveal -> save -> spark in Saved -> industries tick -> reload
// restores state. Asserts the reward fires only on save, never on a skip.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

const server = http.createServer((req, res) => {
  let u = req.url.split('?')[0];
  if (u === '/') u = '/index.html';
  const fp = path.join(ROOT, u);
  fs.readFile(fp, (e, d) => {
    if (e) { res.statusCode = 404; return res.end('404'); }
    res.setHeader('Content-Type', MIME[path.extname(fp)] || 'text/plain');
    res.end(d);
  });
});

function assert(cond, msg) { if (!cond) { throw new Error('ASSERT: ' + msg); } }

await new Promise((r) => server.listen(8124, r));
const EXE = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(
  fs.existsSync(EXE) ? { executablePath: EXE } : {});
let failed = false;
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
  await page.goto('http://localhost:8124/index.html');

  // Wait until the deck counter reads a specific "done/total" (the swipe-out
  // animation resolves ~180ms after the click, so gate on the counter, not a tick).
  const counted = (done) => page.waitForFunction(
    (d) => document.querySelector('.deck-count')?.textContent.trim().startsWith(d + '/'),
    done);

  // COLD OPEN: a card is on screen immediately — no onboarding, no domain picker.
  await page.waitForSelector('.card');
  assert(!(await page.isVisible('.chip')), 'no onboarding chips — cold opens on a card');

  // First open shows a one-time intro overlay atop the live deck — dismiss it.
  await page.waitForSelector('.intro-start');
  await page.click('.intro-start');
  assert((await page.locator('.intro-scrim').count()) === 0, 'intro dismissed, deck is interactive');

  await counted(0);
  assert(await page.isVisible('.reveal-hint'), 'card starts face-down (guess first)');

  // SKIP the first card (✕) — this must NOT create a spark (reward only on save).
  await page.click('#btn-left');
  await counted(1);

  // REVEAL the second card — the payoff line appears.
  await page.click('#btn-reveal');
  await page.waitForSelector('.reveal-line');
  assert((await page.locator('.reveal-line').innerText()).length > 10, 'reveal line has content');
  assert(await page.isVisible('.cat'), 'industry tags show after reveal');

  // Add an optional take and SAVE (♥).
  await page.fill('#take', 'A bank that hates banking is a brand, not a product.');
  await page.click('#btn-right');
  await counted(2);

  // Saved tab has exactly one spark (the saved one — the skip created nothing).
  await page.click('.tab[data-tab="saved"]');
  await page.waitForSelector('.spark-row');
  const rows = await page.locator('.spark-row').count();
  assert(rows === 1, `Saved has one spark — skip created none (got ${rows})`);
  assert(await page.isVisible('.spark-reveal'), 'saved row shows the reveal line');

  // You tab: streak ticked to 1 and at least one industry lit.
  await page.click('.tab[data-tab="you"]');
  await page.waitForSelector('.stats');
  const onCells = await page.locator('.dom-cell.on').count();
  assert(onCells >= 1, 'at least one industry lit after saving');
  const streakText = await page.locator('.stat .num').last().innerText();
  assert(streakText.includes('1'), `streak is 1 (got "${streakText}")`);

  // Persistence across reload.
  await page.reload();
  await page.waitForSelector('.card, .done');
  await page.click('.tab[data-tab="saved"]');
  await page.waitForSelector('.spark-row');
  assert((await page.locator('.spark-row').count()) === 1, 'spark persists across reload');

  console.log('  ✓ e2e smoke: cold-open → skip → reveal → save → Saved → You → reload');
} catch (err) {
  failed = true;
  console.error('  ✗ ' + err.message);
} finally {
  await browser.close();
  server.close();
}
process.exit(failed ? 1 : 0);
