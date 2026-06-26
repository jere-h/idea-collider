// Collider — app controller (vanilla ES modules, no build step).
// v2 loop (from simulated user testing): COLD-OPEN straight onto a card — no
// onboarding, no domain picker, no problem field. The card shows two recognizable
// brands/industries; you guess the link, tap to REVEAL a one-line surprise (the
// payoff arrives in seconds, not after homework), then swipe ♥ to keep it or ✕ to
// skip. Writing a "take" is optional, never a gate. Streak + industries-bridged
// live quietly in the You tab — never in the user's face on the first card.

import { CARD_POOL } from './cards.js';
import { deal, DECK_SIZE } from './deckEngine.js';
import { applySpark, currentStreak } from './streak.js';
import { domainsBridged, DOMAINS, DOMAIN_COUNT } from './domains.js';
import { createStorage } from './storage.js';
import { createTelemetry } from './telemetry.js';
import { TELEMETRY_ENDPOINT, APP_VERSION } from './config.js';

const storage = createStorage();
let state = storage.load();

// --- bootstrap one-time fields ---
const today = localDay();
if (!state.firstDay) { state.firstDay = today; }
storage.save(state);

const telemetry = createTelemetry({
  endpoint: TELEMETRY_ENDPOINT,
  store: storage,
  deviceId: state.deviceId,
  appVersion: APP_VERSION,
  cardVersion: CARD_POOL.version,
});

// session bookkeeping
let currentScreen = 'deck';
const revealedIds = new Set(); // transient: which top card has been revealed
let suppressNextCardClick = false; // guard so a drag doesn't also trigger reveal

const cardById = new Map(CARD_POOL.cards.map((c) => [c.id, c]));

// ---------- helpers ----------
function localDay(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function save() { storage.save(state); }
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// Deal today's deck, persisting a freshly dealt one and updating dealt history.
function dealToday() {
  const existing = state.dailyDeck;
  const isNew = !existing || existing.day !== today;
  const deck = deal(CARD_POOL, state, today);
  if (isNew) {
    state.dailyDeck = deck;
    state.deckHistoryCount = (state.deckHistoryCount || 0) + 1;
    const ids = deck.cards.map((c) => c.id);
    state.dealtEver = Array.from(new Set([...(state.dealtEver || []), ...ids]));
    save();
  }
  return state.dailyDeck;
}

function topPendingCard() {
  const deck = state.dailyDeck;
  if (!deck) return null;
  const entry = deck.cards.find((c) => c.status === 'pending' && cardById.has(c.id));
  return entry ? { entry, card: cardById.get(entry.id) } : null;
}

function deckProgress() {
  const deck = state.dailyDeck || { cards: [] };
  const done = deck.cards.filter((c) => c.status !== 'pending').length;
  return { done, total: deck.cards.length };
}

// ---------- telemetry-emitting actions ----------
function viewTop() {
  const top = topPendingCard();
  if (top && !top.entry.viewed) {
    top.entry.viewed = true; // persisted on the deck entry → once per card per deck
    save();
    telemetry.track('card_view', { cardId: top.entry.id });
  }
}

function reveal(entryId) {
  if (revealedIds.has(entryId)) return;
  revealedIds.add(entryId);
  telemetry.track('engage_open', { cardId: entryId }); // "reveal opened"
  renderDeck();
}

// ✕ — skip. No reward (deliberate: reward keeping, not skimming past).
function skipCard(entryId) {
  const entry = state.dailyDeck.cards.find((c) => c.id === entryId);
  if (!entry || entry.status !== 'pending') return;
  entry.status = 'swiped_left';
  save();
  telemetry.track('swipe_left', { cardId: entryId });
  afterCardResolved();
}

// ♥ — keep it. The SINGLE rewarded event: writes a Spark, ticks the streak.
// A "take" is optional; saving the collision itself is the value.
function saveCard(entryId, take) {
  const entry = state.dailyDeck.cards.find((c) => c.id === entryId);
  if (!entry || entry.status !== 'pending') return;
  const card = cardById.get(entryId);
  entry.status = 'saved';
  if (!state.engaged.includes(entryId)) state.engaged.push(entryId);
  state.sparks.push({
    cardId: entryId,
    bridge: (take || '').trim(),
    domains: [card.a.domain, card.b.domain],
    savedAt: new Date().toISOString(),
  });
  state.streak = applySpark(state.streak, today);
  save();
  telemetry.track('swipe_right', { cardId: entryId });
  telemetry.track('bridge_saved', { cardId: entryId });
  celebrate();
  afterCardResolved();
}

function afterCardResolved() {
  renderDeck();
}

// ---------- screens ----------
const root = () => document.getElementById('app');

function render() {
  if (currentScreen === 'saved') return renderSaved();
  if (currentScreen === 'you') return renderYou();
  return renderDeck();
}

function chrome(inner, active) {
  return `
    <div class="screen">${inner}</div>
    <nav class="tabbar">
      ${tab('deck', 'Deck', active)}
      ${tab('saved', 'Saved', active)}
      ${tab('you', 'You', active)}
    </nav>`;
}
function tab(id, label, active) {
  return `<button class="tab ${active === id ? 'is-active' : ''}" data-tab="${id}">${label}</button>`;
}

function renderDeck() {
  dealToday();
  const top = topPendingCard();
  const { done, total } = deckProgress();

  let body;
  if (!top) {
    const saved = state.sparks.filter((s) => isToday(s.savedAt)).length;
    body = `
      <div class="done">
        <h2>That's today's deck</h2>
        <p class="done-sub">${total} collisions · ${saved} saved.</p>
        ${saved > 0
          ? '<button class="ghost" data-tab="saved">See what you saved →</button>'
          : '<p class="muted">Nothing saved today — tap ♥ on one that makes you grin.</p>'}
        <p class="muted small">Come back tomorrow for ${DECK_SIZE} fresh collisions.</p>
      </div>`;
  } else {
    const revealed = revealedIds.has(top.entry.id);
    body = `
      <div class="deck-head"><div class="deck-count">${done}/${total}</div></div>
      <div class="deck" id="deck">
        ${renderCard(top.card, top.entry, revealed)}
      </div>
      <div class="swipe-actions">
        <button class="sw left" id="btn-left" aria-label="Skip">✕</button>
        ${revealed ? '' : '<button class="sw reveal" id="btn-reveal">Reveal</button>'}
        <button class="sw right" id="btn-right" aria-label="Save">♥</button>
      </div>
      <p class="hint">${revealed
        ? '✕ skip  ·  ♥ save it'
        : 'Guess the link — then tap the card to reveal'}</p>`;
  }

  root().innerHTML = chrome(body, 'deck');
  bindTabs();
  if (top) {
    bindSwipe(top.entry.id);
    document.getElementById('btn-left').onclick = () => animateOut('left', top.entry.id);
    document.getElementById('btn-right').onclick = () => animateOut('right', top.entry.id);
    const rv = document.getElementById('btn-reveal');
    if (rv) rv.onclick = () => reveal(top.entry.id);
    if (!revealedIds.has(top.entry.id)) {
      const cardEl = document.getElementById(`card-${top.entry.id}`);
      if (cardEl) cardEl.addEventListener('click', () => {
        if (suppressNextCardClick) { suppressNextCardClick = false; return; }
        reveal(top.entry.id);
      });
    }
    viewTop();
  } else {
    const link = root().querySelector('[data-tab="saved"]');
    if (link && !link.classList.contains('tab')) link.addEventListener('click', () => go('saved'));
  }
}

function renderCard(card, entry, revealed) {
  return `
    <article class="card ${revealed ? 'is-revealed' : ''}" id="card-${entry.id}" data-id="${entry.id}">
      <div class="collide">
        <span class="side">${esc(card.a.title)}</span>
        <span class="vs">×</span>
        <span class="side">${esc(card.b.title)}</span>
      </div>
      ${revealed ? `
        <div class="reveal-body">
          <div class="spark-mark">⚡</div>
          <p class="reveal-line">${esc(card.reveal)}</p>
          <div class="cats">
            <span class="cat">${esc(card.a.domain)}</span>
            <span class="cat">${esc(card.b.domain)}</span>
          </div>
          <input id="take" class="take-input" maxlength="140"
            placeholder="Add your take (optional)" />
        </div>` : `
        <div class="reveal-hint">tap to reveal the connection</div>`}
    </article>`;
}

function celebrate() {
  const c = document.createElement('div');
  c.className = 'celebrate';
  c.textContent = '♥ saved';
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 800);
}

// ---------- saved ----------
function renderSaved() {
  const sparks = [...state.sparks].reverse();
  const body = `
    <h2 class="screen-title">Saved</h2>
    ${sparks.length ? `<input id="vault-search" class="search" placeholder="Search…" />` : ''}
    <div class="sparks" id="sparks">
      ${sparks.length
        ? sparks.map(sparkRow).join('')
        : '<p class="muted">Nothing saved yet. Tap ♥ on a collision you like and it lands here.</p>'}
    </div>`;
  root().innerHTML = chrome(body, 'saved');
  bindTabs();
  const search = document.getElementById('vault-search');
  if (search) search.addEventListener('input', () => {
    const q = search.value.toLowerCase();
    document.querySelectorAll('.spark-row').forEach((row) => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}
function sparkRow(s) {
  const card = cardById.get(s.cardId);
  const title = card ? `${card.a.title} × ${card.b.title}` : s.cardId;
  const reveal = card ? card.reveal : '';
  return `
    <div class="spark-row">
      <div class="spark-src">${esc(title)}</div>
      ${reveal ? `<div class="spark-reveal">${esc(reveal)}</div>` : ''}
      ${s.bridge ? `<div class="spark-bridge">“${esc(s.bridge)}”</div>` : ''}
      <div class="spark-meta">${esc((s.domains || []).join(' · '))} · ${esc(s.savedAt.slice(0, 10))}</div>
    </div>`;
}

// ---------- you ----------
function renderYou() {
  const bridged = domainsBridged(state.sparks);
  const streak = currentStreak(state.streak, today);
  const body = `
    <h2 class="screen-title">You</h2>
    <div class="stats">
      <div class="stat"><div class="num">${state.sparks.length}</div><div class="lbl">saved</div></div>
      <div class="stat"><div class="num">${bridged}<span class="of">/${DOMAIN_COUNT}</span></div><div class="lbl">industries bridged</div></div>
      <div class="stat"><div class="num">🔥 ${streak}</div><div class="lbl">day streak</div></div>
    </div>
    <div class="range">
      <h3>Industries you've bridged</h3>
      <div class="dom-grid">
        ${DOMAINS.map((d) => {
          const on = state.sparks.some((s) => (s.domains || []).includes(d));
          return `<span class="dom-cell ${on ? 'on' : ''}">${esc(d)}</span>`;
        }).join('')}
      </div>
    </div>
  `;
  root().innerHTML = chrome(body, 'you');
  bindTabs();
}

// ---------- swipe gestures ----------
function bindSwipe(entryId) {
  const el = document.getElementById(`card-${entryId}`);
  if (!el) return;
  let startX = 0, startY = 0, dx = 0, dy = 0, t0 = 0, dragging = false;
  const W = el.offsetWidth || 320;

  const down = (e) => {
    dragging = true; t0 = Date.now();
    // Each fresh interaction starts un-suppressed; a snap-back drag that fires no
    // synthesized click then can't wrongly swallow the *next* genuine tap-to-reveal.
    suppressNextCardClick = false;
    const p = point(e); startX = p.x; startY = p.y; dx = 0; dy = 0;
    el.style.transition = 'none';
  };
  const move = (e) => {
    if (!dragging) return;
    const p = point(e); dx = p.x - startX; dy = p.y - startY;
    if (Math.abs(dx) > Math.abs(dy)) e.preventDefault?.();
    el.style.transform = `translate(${dx}px, ${dy * 0.2}px) rotate(${dx / 22}deg)`;
    el.classList.toggle('hint-right', dx > 40);
    el.classList.toggle('hint-left', dx < -40);
  };
  const up = () => {
    if (!dragging) return;
    dragging = false;
    const dt = Math.max(1, Date.now() - t0);
    const v = Math.abs(dx) / dt; // px per ms
    if (Math.abs(dx) > 8) suppressNextCardClick = true; // a real drag, not a tap
    const committed = Math.abs(dx) > W * 0.25 || v > 0.5;
    if (committed && dx !== 0) {
      animateOut(dx > 0 ? 'right' : 'left', entryId);
    } else {
      el.style.transition = 'transform .2s ease';
      el.style.transform = '';
      el.classList.remove('hint-left', 'hint-right');
    }
  };

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);

  // keyboard
  document.onkeydown = (e) => {
    if (e.key === 'ArrowLeft') animateOut('left', entryId);
    if (e.key === 'ArrowRight') animateOut('right', entryId);
  };
}
function point(e) {
  if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}
function animateOut(dir, entryId) {
  // Capture the optional take BEFORE the card leaves the DOM.
  let take = '';
  if (dir === 'right') {
    const t = document.getElementById('take');
    take = t ? t.value : '';
  }
  const el = document.getElementById(`card-${entryId}`);
  document.onkeydown = null;
  if (el) {
    el.style.transition = 'transform .28s ease, opacity .28s ease';
    el.style.transform = `translateX(${dir === 'right' ? '120%' : '-120%'}) rotate(${dir === 'right' ? 18 : -18}deg)`;
    el.style.opacity = '0';
  }
  setTimeout(() => (dir === 'right' ? saveCard(entryId, take) : skipCard(entryId)), 180);
}

// ---------- nav ----------
function bindTabs() {
  root().querySelectorAll('.tab[data-tab]').forEach((el) => {
    el.addEventListener('click', () => go(el.dataset.tab));
  });
}
function go(screen) {
  document.onkeydown = null; // drop the deck's arrow-key handler when leaving it
  currentScreen = screen;
  render();
}

// ---------- misc ----------
function isToday(iso) { return iso && iso.slice(0, 10) === today; }

// ---------- lifecycle ----------
telemetry.flush().catch(() => {});
telemetry.track('session_start');
window.addEventListener('pagehide', () => telemetry.flushOnUnload());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') telemetry.flushOnUnload();
});

// register service worker (PWA) — ignored on file://
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

render();
