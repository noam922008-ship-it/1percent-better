// Which card Home shows at the top: today's track task, the next daily habit,
// nothing (no-tasks), or "✓ הכל הושלם היום".
// Weekly habits don't count toward "today", so a user with only weekly habits
// has nothing daily to finish and gets no-tasks — never a false "all done".
export function homeActionType({ activeTrack, trackDoneToday, firstUndoneHabit, dailyHabitCount }) {
  if (activeTrack && !trackDoneToday) return 'track'
  if (firstUndoneHabit) return 'habit'
  if (dailyHabitCount === 0 && !activeTrack) return 'no-tasks'
  return 'all-done'
}
