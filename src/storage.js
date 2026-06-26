// Versioned localStorage wrapper (TRD §Components·storage, §Data model).
// Pluggable backend so it is unit-testable without a browser.

import { cryptoRandomId } from './telemetry.js';

export const SCHEMA_VERSION = 1;
const KEY = 'collider.state.v1';
// The telemetry outbox lives under its OWN key. app `save(state)` writes the
// whole state blob wholesale; if the outbox shared that blob, an app save would
// clobber events the telemetry writer had just appended (lost-update race).
const OUTBOX_KEY = 'collider.outbox.v1';

export function defaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    deviceId: cryptoRandomId(),
    homeDomains: [],
    pinnedProblem: undefined,
    onboarded: false,
    dealtEver: [],
    deckHistoryCount: 0,
    engaged: [],
    sparks: [],
    streak: { count: 0, lastSparkDay: null, freezeAvailable: true },
    dailyDeck: undefined,
    realwork: { lastPromptDay: null },
  };
}

// Migrate an older persisted blob up to the current schema. Preserves sparks.
export function migrate(raw) {
  if (!raw || typeof raw !== 'object') return defaultState();
  let s = { ...defaultState(), ...raw };
  // future migrations: if (raw.schemaVersion < 2) { ... }
  s.schemaVersion = SCHEMA_VERSION;
  return s;
}

export function createStorage(backend) {
  const mem = backend
    || (typeof localStorage !== 'undefined' ? localStorage : memoryBackend());

  function load() {
    try {
      const raw = mem.getItem(KEY);
      if (!raw) {
        const fresh = defaultState();
        save(fresh);
        return fresh;
      }
      return migrate(JSON.parse(raw));
    } catch (_) {
      return defaultState();
    }
  }

  function save(state) {
    try {
      mem.setItem(KEY, JSON.stringify(state));
    } catch (_) { /* quota / disabled storage — non-fatal in v0 */ }
  }

  // Outbox accessors used by telemetry — stored under a SEPARATE key so app-level
  // save(state) can never overwrite events the telemetry writer just appended.
  function getOutbox() {
    try {
      const raw = mem.getItem(OUTBOX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }
  function setOutbox(outbox) {
    try {
      mem.setItem(OUTBOX_KEY, JSON.stringify(outbox));
    } catch (_) { /* quota / disabled storage — non-fatal */ }
  }

  return { load, save, getOutbox, setOutbox };
}

export function memoryBackend() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, v),
    removeItem: (k) => m.delete(k),
  };
}
