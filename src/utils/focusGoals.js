// Setup lets a user pick up to MAX_FOCUS focus areas (it used to be exactly one).
// profile.focusGoals holds the list; profile.focusGoal keeps the first one, because the habit
// notification and the (switched-off) AI helpers read that single field.

export const MAX_FOCUS = 3

export function toggleFocus(list, id, max = MAX_FOCUS) {
  const cur = Array.isArray(list) ? list : []
  if (cur.includes(id)) return cur.filter(g => g !== id)
  if (cur.length >= max) return cur
  return [...cur, id]
}

/** Restore from saved setup progress — new shape (goals) or the old single goal. */
export function restoreFocus(saved = {}) {
  if (Array.isArray(saved.goals)) return saved.goals.slice(0, MAX_FOCUS)
  return saved.goal ? [saved.goal] : []
}
