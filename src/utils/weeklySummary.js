// Weekly summary ("השבוע שלך") — shown on Home on Sunday and Monday, for the week that just ended
// (Sunday → Saturday, the Israeli week). Pure so it can be tested.
// Date keys are UTC YYYY-MM-DD, like profile.activityLog and prime_workout_done_<date>.

const DAY = 86400000

const keyOf   = ms => new Date(ms).toISOString().slice(0, 10)
const msOf    = key => Date.parse(`${key}T00:00:00Z`)
const addDays = (key, n) => keyOf(msOf(key) + n * DAY)
const weekday = key => new Date(msOf(key)).getUTCDay()   // 0 = Sunday

/** Sunday that starts the week containing `key`. */
export const weekStartOf = key => addDays(key, -weekday(key))

/** The summary shows on Sunday and Monday only. */
export const isSummaryDay = today => weekday(today) === 0 || weekday(today) === 1

/**
 * @param {object} p
 * @param {string}   p.today         UTC 'YYYY-MM-DD'
 * @param {string[]} p.activityLog   days with any XP
 * @param {string[]} p.workoutDays   days with a finished workout
 * @param {number}   p.streak        current streak
 * @returns {{ weekStart, weekEnd, days: {date, active}[], activeDays, prevActiveDays, workouts, streak, trend }}
 *   trend: 'up' | 'down' | 'same' | 'first' (no activity the week before)
 */
export function weeklySummary({ today, activityLog = [], workoutDays = [], streak = 0 }) {
  const weekStart = addDays(weekStartOf(today), -7)       // last week's Sunday
  const weekEnd   = addDays(weekStart, 6)
  const active    = new Set(activityLog)
  const worked    = new Set(workoutDays)

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    return { date, active: active.has(date) }
  })
  const activeDays = days.filter(d => d.active).length

  let prevActiveDays = 0
  for (let i = 0; i < 7; i++) if (active.has(addDays(weekStart, i - 7))) prevActiveDays++

  let workouts = 0
  for (const d of days) if (worked.has(d.date)) workouts++

  const trend = prevActiveDays === 0 ? 'first'
    : activeDays > prevActiveDays ? 'up'
    : activeDays < prevActiveDays ? 'down' : 'same'

  return { weekStart, weekEnd, days, activeDays, prevActiveDays, workouts, streak: Math.max(0, Number(streak) || 0), trend }
}

/** Workout days from localStorage (prime_workout_done_<date>) in the 14 days before today. */
export function readWorkoutDays(today, storage = globalThis.localStorage) {
  const out = []
  for (let i = 1; i <= 14; i++) {
    const d = addDays(today, -i)
    try { if (storage.getItem(`prime_workout_done_${d}`)) out.push(d) } catch { /* ignore */ }
  }
  return out
}

const dismissKey = weekStart => `prime_weekly_seen_${weekStart}`

export function wasDismissed(weekStart, storage = globalThis.localStorage) {
  try { return !!storage.getItem(dismissKey(weekStart)) } catch { return false }
}

export function dismiss(weekStart, storage = globalThis.localStorage) {
  try { storage.setItem(dismissKey(weekStart), '1') } catch { /* ignore */ }
}
