// Daily streak after completing all of today's daily habits.
// Same UTC date keys and 1-day grace as Dashboard's bumpStreak().

const dayKey = (now, daysAgo = 0) => new Date(now.getTime() - daysAgo * 86400000).toISOString().slice(0, 10)

// Next streak, or null if it was already counted today.
export function nextHabitStreak(prev, now = new Date()) {
  const s = prev || {}
  const today = dayKey(now)
  if (s.lastDate === today) return null
  const continues = s.lastDate === dayKey(now, 1) || s.lastDate === dayKey(now, 2)
  return { count: continues ? (s.count || 0) + 1 : 1, lastDate: today }
}

// Saves the streak to the server — only for a signed-in user. A guest (uid null) keeps it
// on screen only; there is no account to save it to.
export function saveHabitStreak(uid, streak, { saveProfile, syncCompletionStatus }) {
  if (!uid) return false
  saveProfile(uid, { streak }).catch(() => {})
  syncCompletionStatus(uid, streak.lastDate).catch(() => {})
  return true
}
