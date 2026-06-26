// Anonymous, at-least-once telemetry (TRD §Components·telemetry, §Interfaces).
//
// Design notes that keep the go/no-go metrics trustworthy:
//   - Every event is stamped with a client UUID `eventId`; the server dedupes on
//     it, so at-least-once retries collapse to one (no double counting).
//   - Events live in a localStorage OUTBOX. A normal flush uses fetch(keepalive)
//     and clears the outbox ONLY on a 2xx. sendBeacon is used only on unload,
//     where no ack is possible.
//   - A flush also runs on load (drains anything a crash/unload left behind).
//   - Ids and event types only — never bridge text, never card text, no PII.
//
// Built as a factory so it is fully unit-testable with injected deps.

export const MAX_BATCH = 50; // cap per send (well under the ~64KB sendBeacon limit)

export function createTelemetry({
  endpoint,
  store,            // { getOutbox(): Event[], setOutbox(Event[]): void }
  deviceId,
  appVersion = '0',
  cardVersion = '0',
  now = () => new Date().toISOString(),
  uuid = () => cryptoRandomId(),
  fetchImpl = (typeof fetch !== 'undefined' ? fetch : null),
  sendBeaconImpl = null,
}) {
  let sessionId = uuid();
  let lastActive = Date.now();

  function newSessionIfStale() {
    // re-mint a session if we've been hidden/idle > 30 min (TRD §telemetry)
    if (Date.now() - lastActive > 30 * 60 * 1000) sessionId = uuid();
    lastActive = Date.now();
  }

  function enqueue(type, extra = {}) {
    newSessionIfStale();
    const evt = {
      eventId: uuid(),
      deviceId,
      appVersion,
      cardVersion,
      ts: now(),
      sessionId,
      type,
      ...extra, // cardId?, hasPinnedProblem? — never free text
    };
    const outbox = store.getOutbox();
    outbox.push(evt);
    store.setOutbox(outbox);
    return evt;
  }

  // Best-effort acked flush. Clears the outbox only when the server confirms.
  async function flush() {
    if (!endpoint || !fetchImpl) return false;
    const outbox = store.getOutbox();
    if (outbox.length === 0) return true;
    const batch = outbox.slice(0, MAX_BATCH);
    try {
      const res = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      });
      if (res && res.status >= 200 && res.status < 300) {
        // clear ONLY the events we just sent (outbox may have grown meanwhile)
        const sent = new Set(batch.map((e) => e.eventId));
        store.setOutbox(store.getOutbox().filter((e) => !sent.has(e.eventId)));
        return true;
      }
    } catch (_) {
      // swallow — at-least-once: leave the outbox for the next flush
    }
    return false;
  }

  // Unload path: fire-and-forget, no ack. Events stay in the outbox and the
  // server dedupes by eventId if both this and a later flush arrive.
  function flushOnUnload() {
    const beacon = sendBeaconImpl
      || (typeof navigator !== 'undefined' && navigator.sendBeacon
        ? navigator.sendBeacon.bind(navigator) : null);
    if (!endpoint || !beacon) return;
    const outbox = store.getOutbox();
    if (outbox.length === 0) return;
    const batch = outbox.slice(0, MAX_BATCH);
    try {
      beacon(endpoint, new Blob([JSON.stringify({ events: batch })],
        { type: 'application/json' }));
    } catch (_) { /* ignore */ }
  }

  // Convenience emitters used by the app.
  function track(type, extra) {
    const evt = enqueue(type, extra);
    // fire a best-effort flush but never block the UI
    Promise.resolve().then(flush).catch(() => {});
    return evt;
  }

  return { track, flush, flushOnUnload, enqueue, get sessionId() { return sessionId; } };
}

export function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  // fallback (non-crypto) — fine for an anonymous id
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
