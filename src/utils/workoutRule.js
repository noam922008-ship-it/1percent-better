// What counts as a workout (decided 2026-10-19): at least 5 minutes of training, OR the workout
// was finished to the end (a 5-minute quick workout can log 4:50 with the countdown and transitions).
// Two minutes and out doesn't count — no workout day and no daily workout XP.

export const MIN_WORKOUT_SECONDS = 300

export function countsAsWorkout({ durationSeconds = 0, finished = false } = {}) {
  return !!finished || (Number(durationSeconds) || 0) >= MIN_WORKOUT_SECONDS
}

const DAY = 86400000
const dateKey = ms => new Date(ms).toISOString().slice(0, 10)   // UTC keys, like dailyWorkoutClaims

/** Every day with a counted workout: profile.dailyWorkoutClaims (combat, older) + profile.workoutDays (all types). */
export function workoutDaySet(profile) {
  const out = new Set()
  for (const src of [profile?.dailyWorkoutClaims, profile?.workoutDays]) {
    if (src && typeof src === 'object') for (const [k, v] of Object.entries(src)) if (v) out.add(k)
  }
  return out
}

/** Guests keep their days on this device only. */
export function guestWorkoutDays(storage = globalThis.localStorage) {
  const out = new Set()
  try {
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i)
      const m = /^prime_workout_(?:done|day)_(\d{4}-\d{2}-\d{2})$/.exec(k || '')
      if (m) out.add(m[1])
    }
  } catch { /* ignore */ }
  return out
}

/** { total, week, month } — week / month = the last 7 / 30 days including today. */
export function workoutDayStats(days, now = Date.now()) {
  let week = 0, month = 0
  const weekFrom  = dateKey(now - 6 * DAY)
  const monthFrom = dateKey(now - 29 * DAY)
  const today     = dateKey(now)
  for (const d of days) {
    if (d > today) continue
    if (d >= weekFrom) week++
    if (d >= monthFrom) month++
  }
  return { total: days.size, week, month }
}
