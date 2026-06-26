// Telemetry sink (TRD §Interfaces·/api/events). Reference serverless handler
// (Vercel/Netlify-style). Validates the anonymous envelope, dedupes by eventId
// so at-least-once client retries collapse to one write, and returns 204 only
// after the durable append. Holds no secret the client needs.
//
// The durable store is intentionally pluggable: wire `appendDedup` to your
// platform KV / Postgres / append log. The in-memory fallback below makes the
// endpoint runnable in local dev but is NOT durable — replace it in production.

const ALLOWED_TYPES = new Set([
  'session_start', 'card_view', 'swipe_left', 'swipe_right',
  'engage_open', 'bridge_saved', 'realwork_yes', 'realwork_no',
]);

// --- swap this for a real durable, deduped store in production ---
const _seen = new Set();
async function appendDedup(events) {
  for (const e of events) {
    if (_seen.has(e.eventId)) continue; // idempotent on eventId
    _seen.add(e.eventId);
    // await db.insert(e)  <-- real durable write goes here
  }
}

function sanitize(e) {
  // keep ONLY the known, non-PII fields — drop anything unexpected the client sent
  if (!e || typeof e !== 'object') return null;
  if (typeof e.eventId !== 'string') return null;
  if (!ALLOWED_TYPES.has(e.type)) return null;
  return {
    eventId: e.eventId,
    deviceId: String(e.deviceId || ''),
    appVersion: String(e.appVersion || ''),
    cardVersion: String(e.cardVersion || ''),
    ts: String(e.ts || ''),
    sessionId: String(e.sessionId || ''),
    type: e.type,
    cardId: e.cardId ? String(e.cardId) : undefined,
    hasPinnedProblem: typeof e.hasPinnedProblem === 'boolean' ? e.hasPinnedProblem : undefined,
  };
}

export default async function handler(req, res) {
  // CORS — lock to your app origin in production via an env var.
  const origin = process.env.APP_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const events = Array.isArray(body && body.events) ? body.events : [];
    const clean = events.map(sanitize).filter(Boolean).slice(0, 50);
    await appendDedup(clean);
    res.statusCode = 204; // only AFTER the durable write — client clears its outbox
    return res.end();
  } catch (_) {
    res.statusCode = 400;
    return res.end();
  }
}
