// "Starting from zero" (docs/FROM_ZERO_PLAN.md): one bad habit to quit + one tiny good habit that
// replaces it, at the moment the bad one usually happens. Saved as two habits: a quit habit
// (clean-day count, utils/quitHabit) and a daily build habit whose cue is "when I feel like <bad>".

import { newQuitHabit } from './quitHabit'
import { normalizeSchedule } from './habitSchedule'
import { getLocalDateKey } from './localDate'

/** Bad-habit ids offered in the flow; labels/cues live in t.fromZero.bad[id]. */
export const BAD_IDS = ['scroll', 'smoke', 'alcohol', 'junk', 'late', 'snooze']
/** Good-habit ids with a default amount and the range the stepper allows. */
export const GOOD = {
  read: { n: 2,  min: 1, max: 20 },
  push: { n: 15, min: 1, max: 50 },
  move: { n: 5,  min: 1, max: 30 },
}
/** Which bad habits show the "professional help" note, and which help entry. */
export const HELP_FOR = { smoke: 'smoke', alcohol: 'alcohol' }

/** Builds the two habits. bad = { quit, cue } (already worded), good = { title }, time = 'HH:MM' | '' */
export function buildFromZero({ bad, good, time }, today = getLocalDateKey()) {
  const quit = newQuitHabit(bad.quit, today)
  const build = {
    cue: bad.cue, habit: good.title, pillar: 'discipline', source: 'from-zero',
    createdAt: today, ...normalizeSchedule({ weekly: false, times: 7, days: [], time }),
  }
  return [quit, build]
}
