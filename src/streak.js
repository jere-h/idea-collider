// Pure streak logic (TRD §Components·progress).
// Streak counts DAYS the user produced a saved spark (never opens, never swipes).
// Day boundary = the user's local midnight. One "freeze" per streak run forgives
// a single missed day; a gap >= 2 days resets the run AND restores the freeze.

// Whole-day difference between two 'YYYY-MM-DD' strings (b - a).
export function dayDiff(a, b) {
  const da = Date.parse(`${a}T00:00:00`);
  const db = Date.parse(`${b}T00:00:00`);
  return Math.round((db - da) / 86400000);
}

export function initialStreak() {
  return { count: 0, lastSparkDay: null, freezeAvailable: true };
}

/**
 * Apply a saved spark on `today` to the streak. Returns a NEW streak object.
 * Multiple sparks on the same day increment the count only once.
 */
export function applySpark(streak, today) {
  const s = streak || initialStreak();
  if (s.lastSparkDay === null) {
    return { count: 1, lastSparkDay: today, freezeAvailable: true };
  }
  const gap = dayDiff(s.lastSparkDay, today);
  if (gap <= 0) {
    // same day (or clock skew) — no double increment
    return { ...s, lastSparkDay: s.lastSparkDay };
  }
  if (gap === 1) {
    // consecutive day — extend
    return { ...s, count: s.count + 1, lastSparkDay: today };
  }
  if (gap === 2 && s.freezeAvailable) {
    // exactly one missed day, freeze available — survive, consume the freeze
    return { count: s.count + 1, lastSparkDay: today, freezeAvailable: false };
  }
  // gap >= 2 with no freeze (or >= 3): reset the run and restore the freeze
  return { count: 1, lastSparkDay: today, freezeAvailable: true };
}

/**
 * The streak as it should DISPLAY on `today` (a streak silently dies once the
 * user is too far past their last spark, even before the next save).
 */
export function currentStreak(streak, today) {
  const s = streak || initialStreak();
  if (s.lastSparkDay === null) return 0;
  const gap = dayDiff(s.lastSparkDay, today);
  if (gap <= 0 || gap === 1) return s.count;        // today or yesterday: alive
  if (gap === 2 && s.freezeAvailable) return s.count; // within the freeze window
  return 0;                                          // lapsed
}
