// "Starting from zero" (docs/FROM_ZERO_PLAN.md): one bad habit to quit + one tiny good habit that
// replaces it, at the moment the bad one usually happens. Saved as two habits: a quit habit
// (clean-day count, utils/quitHabit) and a daily build habit whose cue is "when I feel like <bad>".

import { newQuitHabit } from './quitHabit'
import { normalizeSchedule } from './habitSchedule'
import { getLocalDateKey } from './localDate'

/** Bad-habit ids offered in the flow; labels/cues live in t.fromZero.bad[id]. */
export const BAD_IDS = ['scroll', 'smoke', 'alcohol', 'junk', 'late', 'snooze']

/** Good habits. n/min/max = an adjustable amount ({n} in the copy); none = a fixed action. Copy in t.fromZero.good[id]. */
export const GOOD = {
  read:        { n: 2,  min: 1, max: 20 },
  walk:        { n: 5,  min: 1, max: 30 },
  push:        { n: 15, min: 1, max: 50 },
  run:         { n: 5,  min: 1, max: 30 },
  breaths:     { n: 10, min: 3, max: 30 },
  phoneAway:   {},
  water:       {},
  softDrink:   {},
  callFriend:  {},
  waterFirst:  {},
  fruit:       {},
  phoneOutBed: {},
  readBed:     { n: 2,  min: 1, max: 20 },
  lightsOff:   {},
  alarmFar:    {},
  waterWake:   {},
  pushWake:    { n: 10, min: 1, max: 50 },
}

/** Each bad habit gets replacements that fit it: one for the body, one for the head, one that changes the setting. */
export const REPLACE = {
  scroll:  [{ id: 'read' }, { id: 'walk' }, { id: 'phoneAway' }],
  smoke:   [{ id: 'breaths' }, { id: 'water' }, { id: 'walk' }],
  alcohol: [{ id: 'softDrink' }, { id: 'walk', n: 10 }, { id: 'callFriend' }],
  junk:    [{ id: 'waterFirst' }, { id: 'fruit' }, { id: 'walk' }],
  late:    [{ id: 'phoneOutBed' }, { id: 'readBed' }, { id: 'lightsOff' }],
  snooze:  [{ id: 'alarmFar' }, { id: 'waterWake' }, { id: 'pushWake' }],
  other:   [{ id: 'read' }, { id: 'push' }, { id: 'run' }],
}
export const replacementsFor = badId => REPLACE[badId] || REPLACE.other

/** Which bad habits show the "professional help" note, and which help entry. */
export const HELP_FOR = { smoke: 'smoke', alcohol: 'alcohol' }

/** Minutes before the chosen time that the reminder comes (late nights: an hour before bedtime). */
export const REMIND_EARLY = { late: 60 }

/** 'HH:MM' moved by -minutes, wrapping around midnight. */
export function shiftTime(time, minutes) {
  const m = /^(\d{2}):(\d{2})$/.exec(time || '')
  if (!m || !minutes) return time || ''
  const total = ((Number(m[1]) * 60 + Number(m[2]) - minutes) % 1440 + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** Builds the two habits. bad = { quit, cue } (already worded), good = { title }, time = reminder 'HH:MM' | '' */
export function buildFromZero({ bad, good, time }, today = getLocalDateKey()) {
  const quit = newQuitHabit(bad.quit, today)
  const build = {
    cue: bad.cue, habit: good.title, pillar: 'discipline', source: 'from-zero',
    createdAt: today, ...normalizeSchedule({ weekly: false, times: 7, days: [], time }),
  }
  return [quit, build]
}
