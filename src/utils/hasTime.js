// "יש לי זמן" — a menu of small things to do whenever the user opens the app.
// Rewards are a low bonus with a daily cap. Self-reported options give very little XP.
// Workouts keep their normal XP (awarded by the workout flow itself), so the menu never out-pays them.

export const DAILY_CAP      = 30
export const MINUTE_CHOICES = [5, 15, 30]

// action: what "open" does ('journal' | 'lesson' | 'workout'). timer: minutes that must pass before "done".
export const OPTIONS = [
  { id: 'journalStep', minutes: 5,  xp: 5,  icon: '📝', action: 'journal' },
  { id: 'breathing',   minutes: 5,  xp: 3,  icon: '🌬️' },
  { id: 'lesson',      minutes: 10, xp: 5,  icon: '📚', action: 'lesson' },
  { id: 'reading',     minutes: 15, xp: 5,  icon: '📖', timer: 15 },
  { id: 'podcast',     minutes: 15, xp: 5,  icon: '🎧', note: true },
  { id: 'workout',     minutes: 15, xp: 0,  icon: '💪', action: 'workout' },
  { id: 'focus',       minutes: 30, xp: 10, icon: '🎯', timer: 30 },
]

export const optionsFor = minutes => OPTIONS.filter(o => o.minutes <= minutes)

const key = dayKey => `prime_hastime_${dayKey}`

// { xp: bonus XP earned today, done: [option ids] }
export function loadState(dayKey, storage = globalThis.localStorage) {
  try {
    const s = JSON.parse(storage.getItem(key(dayKey)))
    if (s && Number.isFinite(s.xp) && Array.isArray(s.done)) return { xp: s.xp, done: s.done }
  } catch { /* unreadable → fresh day */ }
  return { xp: 0, done: [] }
}

export const remainingCap = state => Math.max(0, DAILY_CAP - state.xp)

// What claiming `option` would pay right now (0 if already done today or the cap is used up).
// Options with xp 0 (workout) never pay from here.
export function payoutFor(state, option) {
  if (!option || option.xp <= 0 || state.done.includes(option.id)) return 0
  return Math.min(option.xp, remainingCap(state))
}

// Marks the option done and returns { amount, state }. Done is marked even when the cap
// leaves nothing to pay, so the card still shows it as completed.
export function claim(dayKey, option, storage = globalThis.localStorage) {
  const state = loadState(dayKey, storage)
  if (!option || state.done.includes(option.id)) return { amount: 0, state }
  const amount = payoutFor(state, option)
  const next   = { xp: state.xp + amount, done: [...state.done, option.id] }
  try { storage.setItem(key(dayKey), JSON.stringify(next)) } catch { /* private mode: no persistence */ }
  return { amount, state: next }
}

// The button shows once the day's main work is finished (no track task or habit left).
export const showHasTimeButton = primaryType => primaryType === 'all-done' || primaryType === 'no-tasks'
