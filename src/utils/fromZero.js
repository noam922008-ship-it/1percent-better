// "Starting from zero" (docs/FROM_ZERO_PLAN.md): one bad habit to quit + one tiny good habit that
// replaces it, at the moment the bad one usually happens. Saved as two habits: a quit habit
// (clean-day count, utils/quitHabit) and a daily build habit whose cue is "when I feel like <bad>".

import { newQuitHabit } from './quitHabit'
import { normalizeSchedule } from './habitSchedule'
import { getLocalDateKey } from './localDate'

/** Bad-habit ids offered in the flow; labels/cues live in t.fromZero.bad[id]. */
export const BAD_IDS = ['scroll', 'smoke', 'vape', 'alcohol', 'weed', 'porn', 'junk', 'procrastinate', 'late', 'snooze']

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
  leaveRoom:   {},
  shower:      {},
  gum:         {},
  startTask:   { n: 2,  min: 1, max: 30 },
  firstStep:   {},
}

/** Each bad habit gets replacements that fit it: one for the body, one for the head, one that changes the setting. */
export const REPLACE = {
  scroll:  [{ id: 'read' }, { id: 'walk' }, { id: 'phoneAway' }],
  smoke:   [{ id: 'breaths' }, { id: 'water' }, { id: 'walk' }],
  alcohol: [{ id: 'softDrink' }, { id: 'walk', n: 10 }, { id: 'callFriend' }],
  junk:    [{ id: 'waterFirst' }, { id: 'fruit' }, { id: 'walk' }],
  late:    [{ id: 'phoneOutBed' }, { id: 'readBed' }, { id: 'lightsOff' }],
  snooze:  [{ id: 'alarmFar' }, { id: 'waterWake' }, { id: 'pushWake' }],
  weed:    [{ id: 'run' }, { id: 'shower' }, { id: 'callFriend' }],
  porn:    [{ id: 'push' }, { id: 'leaveRoom' }, { id: 'phoneOutBed' }],
  vape:    [{ id: 'breaths' }, { id: 'gum' }, { id: 'walk' }],
  procrastinate: [{ id: 'startTask' }, { id: 'firstStep' }, { id: 'phoneAway' }],
  other:   [{ id: 'read' }, { id: 'push' }, { id: 'run' }],
}
export const replacementsFor = badId => REPLACE[badId] || REPLACE.other

/** Which bad habits show the "professional help" note, and which help entry. */
export const HELP_FOR = { smoke: 'smoke', vape: 'smoke', alcohol: 'alcohol', weed: 'weed' }

/** Minutes before the chosen time that the reminder comes (late nights: an hour before bedtime). */
export const REMIND_EARLY = { late: 60 }

/** The flow doesn't ask "when" anymore (fewer steps): each bad habit gets the usual time it shows up.
 *  It can be changed later in the habit's settings. */
export const DEFAULT_TIME = { late: '23:00', snooze: '08:00', procrastinate: '16:00' }
export const defaultTimeFor = badId => DEFAULT_TIME[badId] || '20:00'

/** 'HH:MM' moved by -minutes, wrapping around midnight. */
export function shiftTime(time, minutes) {
  const m = /^(\d{2}):(\d{2})$/.exec(time || '')
  if (!m || !minutes) return time || ''
  const total = ((Number(m[1]) * 60 + Number(m[2]) - minutes) % 1440 + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** Builds the two habits. bad = { quit, cue } (already worded), good = { title }, time = reminder 'HH:MM' | ''.
 *  badId (one of BAD_IDS) is kept on both so Home can link the matching guide (GUIDE_FOR). */
export function buildFromZero({ bad, good, time, badId, later = false }, today = getLocalDateKey()) {
  // later: added from "add habit" by someone who already has habits — no focus week (fromZeroAge skips it)
  const tag = { ...(BAD_IDS.includes(badId) ? { badId } : {}), ...(later ? { addedLater: true } : {}) }
  const quit = { ...newQuitHabit(bad.quit, today), ...tag }
  const build = {
    cue: bad.cue, habit: good.title, pillar: 'discipline', source: 'from-zero',
    createdAt: today, ...normalizeSchedule({ weekly: false, times: 7, days: [], time }), ...tag,
  }
  return [quit, build]
}

/** Hebrew guide page (/guides/<slug>) for each bad habit. Titles in t.home.guide.titles[id]. */
export const GUIDE_FOR = {
  scroll: 'stop-scrolling', snooze: 'stop-snoozing', late: 'sleep-earlier',
  junk: 'stop-junk-food', smoke: 'quit-smoking', alcohol: 'drink-less',
  weed: 'quit-weed', porn: 'quit-porn', vape: 'quit-vaping', procrastinate: 'stop-procrastinating',
}

/** Guides that also exist in English (/en/guides/<slug>). */
export const EN_GUIDES = ['stop-scrolling', 'stop-snoozing', 'sleep-earlier', 'stop-junk-food', 'quit-porn', 'quit-weed', 'quit-vaping', 'stop-procrastinating']

/** Every guide in the UI language, in the order the habits are offered: [{ id, slug, href }]. */
export function allGuides(lang = 'he') {
  return BAD_IDS.filter(id => GUIDE_FOR[id] && (lang !== 'en' || EN_GUIDES.includes(GUIDE_FOR[id])))
    .map(id => ({ id, slug: GUIDE_FOR[id], href: lang === 'en' ? `/en/guides/${GUIDE_FOR[id]}` : `/guides/${GUIDE_FOR[id]}` }))
}

/** The guide to show on Home: from the first active habit that remembers its bad habit.
 *  href is in the UI language; null when that language has no such guide. */
export function guideFor(triggers = [], lang = 'he') {
  const t = triggers.find(x => x && !x.archived && GUIDE_FOR[x.badId])
  if (!t) return null
  const slug = GUIDE_FOR[t.badId]
  if (lang === 'en' && !EN_GUIDES.includes(slug)) return null
  return { id: t.badId, slug, href: lang === 'en' ? `/en/guides/${slug}` : `/guides/${slug}` }
}

/** First week after starting from zero, Home shows only the pair (+ the daily lesson and journal). */
export const FOCUS_DAYS = 7

/** Days since the from-zero pair was made (0 = today), or null when the user didn't start from zero. */
export function fromZeroAge(triggers = [], today = getLocalDateKey()) {
  const dates = triggers
    .filter(t => t && t.source === 'from-zero' && !t.archived && !t.addedLater && /^\d{4}-\d{2}-\d{2}$/.test(t.createdAt || ''))
    .map(t => t.createdAt).sort()
  if (!dates.length) return null
  const ms = Date.parse(`${today}T00:00:00Z`) - Date.parse(`${dates[0]}T00:00:00Z`)
  return Math.max(0, Math.round(ms / 86400000))
}

// "Ready to add more?" card after the first week — dismissed once per device.
const MORE_KEY = 'prime_from_zero_more_done'
export function moreCardDismissed(storage = globalThis.localStorage) {
  try { return storage.getItem(MORE_KEY) === '1' } catch { return false }
}
export function dismissMoreCard(storage = globalThis.localStorage) {
  try { storage.setItem(MORE_KEY, '1') } catch { /* ignore */ }
}
